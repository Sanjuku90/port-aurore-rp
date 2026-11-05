// Port-Aurore RP · serveur v51 : comptes vérifiés par e-mail, sessions, mot de passe oublié,
// sauvegarde cloud multi-appareils et cadeaux admin. Aucune dépendance externe (Node 18+).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.port-aurore-data');
const dbFile = path.join(dataDir, 'accounts.json');
const saveDir = path.join(dataDir, 'saves');
const PORT = Number(process.env.PORT || 8080);
const PROD = process.env.NODE_ENV === 'production';
const PUBLIC_URL = String(process.env.PUBLIC_URL || '').replace(/\/+$/, '');
const MAIL = { resend: process.env.RESEND_API_KEY || '', brevo: process.env.BREVO_API_KEY || '', from: process.env.MAIL_FROM || '' };
const MAIL_READY = !!((MAIL.resend || MAIL.brevo) && MAIL.from && PUBLIC_URL);
const DEV_MAIL = !PROD && !MAIL_READY; // en local : les liens sont affichés dans la console du serveur
const COOKIE = 'pa_session';
const SESSION_MS = 30 * 864e5, CLAIM_MS = 15 * 6e4, VERIFY_MS = 48 * 36e5, RESET_MS = 30 * 6e4;
const MAX_SAVE = 3 * 1024 * 1024, MAX_SESSIONS = 10;
const SAVE_KEY = /^(pa-|port-aurore)/, SAVE_SKIP = /^(pa-account5\d-inbox|pa-cloud51|pa-admin)/;
const scrypt = promisify(crypto.scrypt);
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

fs.mkdirSync(saveDir, { recursive: true, mode: 0o700 });
let db = { users: [], sessions: [], tokens: [] };
try {
  const loaded = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  if (loaded && Array.isArray(loaded.users)) db = { users: loaded.users, sessions: loaded.sessions || [], tokens: loaded.tokens || [] };
} catch (e) { if (e.code !== 'ENOENT') { console.error('Base des comptes illisible, arrêt pour éviter de l’écraser.'); process.exit(1); } }
db.users.forEach(u => { u.gifts ||= []; u.verified = true; /* v52 : plus de confirmation par e-mail */ u.fails ||= { count: 0, until: 0 }; });

function persist() { const tmp = dbFile + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 }); fs.renameSync(tmp, dbFile); }
function prune() { const now = Date.now(); db.sessions = db.sessions.filter(s => s.expiresAt > now); db.tokens = db.tokens.filter(t => t.expiresAt > now); }
prune(); persist(); setInterval(() => { prune(); persist(); }, 36e5).unref();

const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const secureReq = req => req.headers['x-forwarded-proto'] === 'https' || PROD;
const HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'SAMEORIGIN', 'Permissions-Policy': 'camera=(), geolocation=()' };
function json(res, status, value, headers = {}) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...HEADERS, ...headers }); res.end(JSON.stringify(value)); }
const fail = (status, message) => Object.assign(new Error(message), { status });
const cookieLine = (req, value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureReq(req) ? '; Secure' : ''}`;
function cookies(req) { const out = {}; String(req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return out; }
function sessionFor(req) {
  const token = cookies(req)[COOKIE]; if (!token) return null;
  const s = db.sessions.find(x => x.hash === sha(token) && x.expiresAt > Date.now());
  const user = s && db.users.find(u => u.id === s.userId);
  return user ? { session: s, user } : null;
}
function createSession(user, req, res) {
  const token = crypto.randomBytes(32).toString('base64url');
  const mine = db.sessions.filter(x => x.userId === user.id).sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_SESSIONS - 1);
  db.sessions = db.sessions.filter(x => x.userId !== user.id).concat(mine);
  db.sessions.push({ hash: sha(token), userId: user.id, createdAt: Date.now(), expiresAt: Date.now() + SESSION_MS });
  persist(); res.setHeader('Set-Cookie', cookieLine(req, token, Math.floor(SESSION_MS / 1000)));
}
function sameOrigin(req) {
  const o = req.headers.origin; if (!o) return true;
  try { const h = new URL(o).host; return h === req.headers.host || (PUBLIC_URL && h === new URL(PUBLIC_URL).host); } catch { return false; }
}
const buckets = new Map();
function limited(key, max, windowMs) { const now = Date.now(); let b = buckets.get(key); if (!b || b.until < now) b = { n: 0, until: now + windowMs }; b.n++; buckets.set(key, b); return b.n > max; }
setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (b.until < now) buckets.delete(k); }, 6e5).unref();
const ipOf = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?').split(',')[0].trim();
function guard(req, scope, max = 20, windowMs = 6e5) { if (limited(scope + ':' + ipOf(req), max, windowMs)) throw fail(429, 'Trop de tentatives. Réessaie dans quelques minutes.'); }
async function body(req, maxBytes = 16384) {
  if (!/application\/json/.test(String(req.headers['content-type'] || ''))) throw fail(415, 'Format de requête refusé.');
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > maxBytes) throw fail(413, 'Requête trop volumineuse.'); chunks.push(c); }
  if (!size) return {};
  try { const v = JSON.parse(Buffer.concat(chunks).toString('utf8')); return v && typeof v === 'object' ? v : {}; } catch { throw fail(400, 'JSON invalide.'); }
}
const normEmail = v => String(v || '').trim().toLowerCase();
const validEmail = e => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function checkPassword(pw, email) {
  if (typeof pw !== 'string' || pw.length < 10 || pw.length > 128) throw fail(400, 'Choisis un mot de passe de 10 à 128 caractères.');
  if (pw.toLowerCase() === email || /^(.)\1+$/.test(pw) || /^(0123456789|1234567890|motdepasse|password)/i.test(pw)) throw fail(400, 'Ce mot de passe est trop facile à deviner.');
}
async function hashPassword(pw) { const salt = crypto.randomBytes(16); const h = await scrypt(pw, salt, 64, SCRYPT); return { salt: salt.toString('hex'), hash: h.toString('hex') }; }
async function verifyPassword(pw, rec) {
  if (!rec) { await scrypt(String(pw), crypto.randomBytes(16), 64, SCRYPT); return false; }
  const exp = Buffer.from(rec.hash, 'hex'), got = await scrypt(String(pw || ''), Buffer.from(rec.salt, 'hex'), exp.length, SCRYPT);
  return exp.length === got.length && crypto.timingSafeEqual(exp, got);
}
function issueToken(user, kind, ms) { const token = crypto.randomBytes(32).toString('base64url'); db.tokens = db.tokens.filter(t => !(t.userId === user.id && t.kind === kind)); db.tokens.push({ hash: sha(token), userId: user.id, kind, expiresAt: Date.now() + ms }); persist(); return token; }
function useToken(token, kind) { const t = db.tokens.find(x => x.hash === sha(String(token || '')) && x.kind === kind && x.expiresAt > Date.now()); if (!t) return null; db.tokens = db.tokens.filter(x => x !== t); return db.users.find(u => u.id === t.userId) || null; }
const baseUrl = req => PUBLIC_URL || `${secureReq(req) ? 'https' : 'http'}://${req.headers.host}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function sendMail(to, subject, intro, link, cta) {
  const text = `${intro}\n\n${link}\n\nSi tu n’es pas à l’origine de cette demande, ignore ce message.\n— Port-Aurore RP`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#1b2430"><h2 style="margin:0 0 12px">Port-Aurore RP</h2><p>${esc(intro)}</p><p style="margin:24px 0"><a href="${esc(link)}" style="background:#f5c451;color:#1d1400;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">${esc(cta)}</a></p><p style="font-size:13px;color:#5b6675">Si le bouton ne marche pas, copie ce lien : ${esc(link)}</p><p style="font-size:13px;color:#5b6675">Si tu n’es pas à l’origine de cette demande, ignore ce message.</p></div>`;
  if (DEV_MAIL) { console.log(`[e-mail de développement] À : ${to} · ${subject}\n${link}`); return true; }
  if (!MAIL_READY) return false;
  try {
    let r;
    if (MAIL.resend) r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${MAIL.resend}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: MAIL.from, to: [to], subject, text, html }) });
    else { const m = MAIL.from.match(/^(.*)<([^>]+)>\s*$/); const sender = m ? { name: m[1].trim() || 'Port-Aurore RP', email: m[2].trim() } : { name: 'Port-Aurore RP', email: MAIL.from.trim() };
      r = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': MAIL.brevo, 'Content-Type': 'application/json' }, body: JSON.stringify({ sender, to: [{ email: to }], subject, textContent: text, htmlContent: html }) }); }
    if (!r.ok) console.error('Envoi d’e-mail refusé par le fournisseur :', r.status);
    return r.ok;
  } catch (e) { console.error('Envoi d’e-mail impossible :', e.message); return false; }
}
const sendVerify = (req, u) => sendMail(u.email, 'Confirme ton compte Port-Aurore RP', 'Bienvenue à Port-Aurore ! Confirme ton adresse e-mail pour activer la sauvegarde cloud et la réception des cadeaux.', `${baseUrl(req)}/?verify=${issueToken(u, 'verify', VERIFY_MS)}`, 'Confirmer mon adresse');
const sendReset = (req, u) => sendMail(u.email, 'Réinitialise ton mot de passe Port-Aurore RP', 'Une réinitialisation de mot de passe a été demandée. Ce lien est valable 30 minutes.', `${baseUrl(req)}/?reset=${issueToken(u, 'reset', RESET_MS)}`, 'Choisir un nouveau mot de passe');
const savePath = u => path.join(saveDir, u.id.replace(/[^a-f0-9-]/gi, '') + '.json');
const publicUser = u => ({ email: u.email, verified: !!u.verified, createdAt: u.createdAt, cloud: u.saveMeta ? { rev: u.saveMeta.rev, updatedAt: u.saveMeta.updatedAt, size: u.saveMeta.size } : null });
function needAccount(req, verified) { const a = sessionFor(req); if (!a) throw fail(401, 'Connecte-toi à ton compte.'); return a; }
function needAdmin(req) {
  const key = process.env.ADMIN_KEY || ''; if (key.length < 24) throw fail(503, 'L’espace admin n’est pas configuré (ADMIN_KEY de 24 caractères minimum).');
  guard(req, 'admin', 60);
  const a = Buffer.from(sha(key)), b = Buffer.from(sha(String(req.headers['x-admin-key'] || '')));
  if (!crypto.timingSafeEqual(a, b)) throw fail(401, 'Clé admin incorrecte.');
}
function validSave(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw fail(400, 'Sauvegarde invalide.');
  let size = 0; const out = {};
  for (const [k, v] of Object.entries(data)) { if (!SAVE_KEY.test(k) || SAVE_SKIP.test(k) || typeof v !== 'string' || k.length > 120) continue; size += k.length + v.length; out[k] = v; }
  if (!out['port-aurore-rp']) throw fail(400, 'Aucune partie à sauvegarder sur cet appareil.');
  if (size > MAX_SAVE) throw fail(413, 'Sauvegarde trop volumineuse (3 Mo maximum).');
  return { out, size };
}
const routes = {
  'GET /api/health': async () => ({ ok: true, account: true, mail: MAIL_READY || DEV_MAIL, devMail: DEV_MAIL, admin: (process.env.ADMIN_KEY || '').length >= 24 }),
  'GET /api/me': async req => { const a = sessionFor(req); return { account: a ? publicUser(a.user) : null }; },
  'POST /api/register': async (req, res) => {
    guard(req, 'register', 8); const i = await body(req); const email = normEmail(i.email);
    if (!validEmail(email)) throw fail(400, 'Adresse e-mail invalide.');
    checkPassword(i.password, email);
    if (db.users.some(u => u.email === email)) throw fail(409, 'Un compte existe déjà pour cette adresse. Connecte-toi ou utilise « mot de passe oublié ».');
    const pass = await hashPassword(i.password);
    if (db.users.some(u => u.email === email)) throw fail(409, 'Un compte existe déjà pour cette adresse.');
    const user = { id: crypto.randomUUID(), email, pass, createdAt: new Date().toISOString(), verified: true, verifiedAt: new Date().toISOString(), gifts: [], fails: { count: 0, until: 0 }, saveMeta: null };
    db.users.push(user); createSession(user, req, res);
    return [201, { account: publicUser(user), instant: true }];
  },
  'POST /api/verify': async req => {
    guard(req, 'verify', 30); const i = await body(req); const u = useToken(i.token, 'verify');
    if (!u) throw fail(400, 'Lien de confirmation invalide ou expiré. Demande un nouvel e-mail depuis ton compte.');
    u.verified = true; u.verifiedAt = new Date().toISOString(); persist(); return { ok: true, email: u.email };
  },
  'POST /api/verify/resend': async req => {
    const a = needAccount(req); a.user.verified = true; return { ok: true, already: true };
    if (limited('resend:' + a.user.id, 3, 36e5)) throw fail(429, 'Trois e-mails envoyés cette heure-ci. Vérifie tes courriers indésirables.');
    return { ok: await sendVerify(req, a.user), devMail: DEV_MAIL };
  },
  'POST /api/login': async (req, res) => {
    guard(req, 'login', 20); const i = await body(req); const email = normEmail(i.email);
    const u = db.users.find(x => x.email === email);
    if (u && u.fails.until > Date.now()) throw fail(429, 'Compte bloqué 15 minutes après plusieurs erreurs. Réessaie plus tard ou réinitialise ton mot de passe.');
    const ok = await verifyPassword(i.password, u && u.pass);
    if (!ok) { if (u) { u.fails.count++; if (u.fails.count >= 6) { u.fails = { count: 0, until: Date.now() + 15 * 6e4 }; } persist(); } throw fail(401, 'Adresse ou mot de passe incorrect.'); }
    u.fails = { count: 0, until: 0 }; u.lastLoginAt = new Date().toISOString(); createSession(u, req, res);
    return { account: publicUser(u) };
  },
  'POST /api/logout': async (req, res) => { const a = sessionFor(req); if (a) { db.sessions = db.sessions.filter(s => s !== a.session); persist(); } res.setHeader('Set-Cookie', cookieLine(req, '', 0)); return { ok: true }; },
  'POST /api/logout-all': async (req, res) => { const a = needAccount(req); db.sessions = db.sessions.filter(s => s.userId !== a.user.id); persist(); res.setHeader('Set-Cookie', cookieLine(req, '', 0)); return { ok: true }; },
  'POST /api/password/forgot': async req => {
    guard(req, 'forgot', 6); if (!MAIL_READY && !DEV_MAIL) throw fail(503, 'La récupération par e-mail n’est pas activée sur ce serveur. Demande un mot de passe temporaire à l’admin.'); const i = await body(req); const u = db.users.find(x => x.email === normEmail(i.email));
    if (u && !limited('forgot:' + u.id, 3, 36e5)) await sendReset(req, u);
    return { ok: true, devMail: DEV_MAIL };
  },
  'POST /api/password/reset': async (req, res) => {
    guard(req, 'reset', 12); const i = await body(req); const u = useToken(i.token, 'reset');
    if (!u) throw fail(400, 'Lien de réinitialisation invalide ou expiré (30 minutes). Refais une demande.');
    checkPassword(i.password, u.email); u.pass = await hashPassword(i.password); u.verified = true; u.fails = { count: 0, until: 0 };
    db.sessions = db.sessions.filter(s => s.userId !== u.id); db.tokens = db.tokens.filter(t => !(t.userId === u.id && t.kind === 'reset'));
    createSession(u, req, res); return { account: publicUser(u) };
  },
  'POST /api/password/change': async req => {
    const a = needAccount(req); guard(req, 'change', 10); const i = await body(req);
    if (!(await verifyPassword(i.current, a.user.pass))) throw fail(401, 'Mot de passe actuel incorrect.');
    checkPassword(i.password, a.user.email); a.user.pass = await hashPassword(i.password);
    db.sessions = db.sessions.filter(s => s.userId !== a.user.id || s === a.session); persist(); return { ok: true };
  },
  'POST /api/account/delete': async (req, res) => {
    const a = needAccount(req); guard(req, 'delete', 6); const i = await body(req);
    if (!(await verifyPassword(i.password, a.user.pass))) throw fail(401, 'Mot de passe incorrect.');
    db.users = db.users.filter(u => u !== a.user); db.sessions = db.sessions.filter(s => s.userId !== a.user.id); db.tokens = db.tokens.filter(t => t.userId !== a.user.id);
    try { fs.unlinkSync(savePath(a.user)); } catch {} persist(); res.setHeader('Set-Cookie', cookieLine(req, '', 0)); return { ok: true };
  },
  'GET /api/save': async req => {
    const a = needAccount(req, true); if (!a.user.saveMeta) return { save: null };
    let data = null; try { data = JSON.parse(fs.readFileSync(savePath(a.user), 'utf8')).data; } catch { return { save: null }; }
    return { save: { rev: a.user.saveMeta.rev, updatedAt: a.user.saveMeta.updatedAt, data } };
  },
  'PUT /api/save': async req => {
    const a = needAccount(req, true); if (limited('save:' + a.user.id, 40, 6e5)) throw fail(429, 'Synchronisation trop fréquente, réessaie dans un instant.');
    const i = await body(req, MAX_SAVE + 65536); const { out, size } = validSave(i.data); const cur = a.user.saveMeta;
    if (cur && !i.force && Number(i.rev) !== cur.rev) return [409, { error: 'Une sauvegarde plus récente existe sur ton compte.', rev: cur.rev, updatedAt: cur.updatedAt }];
    const meta = { rev: (cur ? cur.rev : 0) + 1, updatedAt: new Date().toISOString(), size, device: String(i.device || '').slice(0, 60) };
    const file = savePath(a.user), tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify({ data: out }), { mode: 0o600 }); fs.renameSync(tmp, file);
    a.user.saveMeta = meta; persist(); return { rev: meta.rev, updatedAt: meta.updatedAt };
  },
  'POST /api/gifts/claim': async req => {
    const a = needAccount(req, true); const now = Date.now();
    const list = a.user.gifts.filter(g => g.status !== 'delivered' && (!g.claimUntil || g.claimUntil < now || g.claimSession === a.session.hash));
    list.forEach(g => { g.claimSession = a.session.hash; g.claimUntil = now + CLAIM_MS; }); if (list.length) persist();
    return { gifts: list.map(({ id, amount, destination, note, createdAt }) => ({ id, amount, destination, note, createdAt })) };
  },
  'POST /api/gifts/ack': async req => {
    const a = needAccount(req, true); const i = await body(req); const ids = new Set(Array.isArray(i.ids) ? i.ids.filter(x => typeof x === 'string').slice(0, 100) : []); let delivered = 0;
    a.user.gifts.forEach(g => { if (ids.has(g.id) && g.status !== 'delivered' && g.claimSession === a.session.hash) { g.status = 'delivered'; g.deliveredAt = new Date().toISOString(); delivered++; } });
    if (delivered) persist(); return { delivered };
  },
  'POST /api/admin/verify': async req => { needAdmin(req); return { ok: true, accounts: db.users.length }; },
  'POST /api/admin/lookup': async req => {
    needAdmin(req); const i = await body(req); const u = db.users.find(x => x.email === normEmail(i.email));
    if (!u) throw fail(404, 'Aucun compte trouvé pour cette adresse e-mail.');
    return { account: publicUser(u), pendingGifts: u.gifts.filter(g => g.status !== 'delivered').length, recentGifts: u.gifts.slice(-8).reverse().map(({ amount, destination, note, createdAt, status }) => ({ amount, destination, note, createdAt, status })) };
  },
  'POST /api/admin/temp-password': async req => {
    needAdmin(req); const i = await body(req); const u = db.users.find(x => x.email === normEmail(i.email));
    if (!u) throw fail(404, 'Aucun compte trouvé pour cette adresse e-mail.');
    const temp = crypto.randomBytes(9).toString('base64url'); u.pass = await hashPassword(temp); u.fails = { count: 0, until: 0 };
    db.sessions = db.sessions.filter(s => s.userId !== u.id); persist(); return { ok: true, email: u.email, password: temp };
  },
  'POST /api/admin/gift': async req => {
    needAdmin(req); const i = await body(req); const u = db.users.find(x => x.email === normEmail(i.email));
    if (!u) throw fail(404, 'Aucun compte trouvé pour cette adresse e-mail.');
    const amount = Number(i.amount), destination = i.destination === 'bank' ? 'bank' : i.destination === 'cash' ? 'cash' : '';
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000000) throw fail(400, 'Le cadeau doit être compris entre 1 et 1 000 000 $.');
    if (!destination) throw fail(400, 'Choisis cash ou banque.');
    const gift = { id: crypto.randomUUID(), amount, destination, note: String(i.note || '').trim().slice(0, 60), createdAt: new Date().toISOString(), status: 'pending', claimSession: null, claimUntil: 0 };
    u.gifts.push(gift); u.gifts = u.gifts.slice(-200); persist();
    return [201, { ok: true, email: u.email, gift: { id: gift.id, amount, destination, note: gift.note, createdAt: gift.createdAt } }];
  }
};
const PUBLIC = [/^\/index\.html$/, /^\/admin\/index\.html$/, /^\/css\/[\w.-]+\.css$/, /^\/js\/[\w./-]+\.js$/, /^\/assets\/[\w./-]+$/];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };
function staticFile(urlPath) {
  let p; try { p = decodeURIComponent(urlPath); } catch { return null; }
  if (p === '/' ) p = '/index.html'; if (p === '/admin' || p === '/admin/') p = '/admin/index.html';
  if (p.includes('..') || !PUBLIC.some(r => r.test(p))) return null;
  const file = path.resolve(root, '.' + p); return file.startsWith(root + path.sep) ? file : null;
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost'), method = req.method || 'GET';
  try {
    if (url.pathname.startsWith('/api/')) {
      if (method !== 'GET' && !sameOrigin(req)) throw fail(403, 'Origine de requête refusée.');
      const h = routes[`${method} ${url.pathname}`]; if (!h) throw fail(404, 'Route inconnue.');
      const out = await h(req, res); return Array.isArray(out) ? json(res, out[0], out[1]) : json(res, 200, out);
    }
    if (method !== 'GET' && method !== 'HEAD') throw fail(405, 'Méthode refusée.');
    const file = staticFile(url.pathname); let stat;
    try { if (!file) throw 0; stat = fs.statSync(file); if (!stat.isFile()) throw 0; } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...HEADERS }); return res.end('Introuvable'); }
    const html = file.endsWith('.html');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': html ? 'no-cache' : 'public, max-age=3600', ...HEADERS, ...(file.includes(path.sep + 'admin' + path.sep) ? { 'X-Robots-Tag': 'noindex' } : {}) });
    if (method === 'HEAD') return res.end(); fs.createReadStream(file).pipe(res);
  } catch (e) {
    if (!e.status) console.error(e);
    json(res, e.status || 500, { error: e.status ? e.message : 'Erreur serveur.' });
  }
});
server.listen(PORT, '0.0.0.0', () => console.log(`Port-Aurore RP · port ${PORT} · e-mails : ${MAIL_READY ? 'actifs' : DEV_MAIL ? 'mode développement (liens dans la console)' : 'NON CONFIGURÉS'}`));
