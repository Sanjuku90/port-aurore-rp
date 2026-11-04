'use strict';
/* ==========================================================================
   v45 · INTERFACE JOUEUR « LAGUNE NOIRE »
   Radar circulaire avec boussole, argent séparé avec gains/pertes animés,
   compteur de vitesse analogique, invites de touche, bannières de quartier,
   voile de blessure et secousse d'impact, mode photo (F2), écran titre v45.
   Ne remplace aucune fonction de jeu : se greffe sur le DOM existant.
   ========================================================================== */
const HUD45=(function(){
  const q=s=>document.querySelector(s);
  const mk=(t,id,cls,html)=>{const e=document.createElement(t);if(id)e.id=id;if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const H={shakeAmt:0,lastCash:null,lastBank:null,zone:'',inside:null,clean:false,built:false,spd:0,prompt:''};
  /* ---------- secousse caméra (impacts, chocs) ---------- */
  function shake(a){H.shakeAmt=Math.min(0.9,Math.max(H.shakeAmt,a||0.3));}
  if(typeof updateCamera==='function'){const _uc45=updateCamera;updateCamera=function(dt){_uc45(dt);
    if(H.shakeAmt>0.001&&typeof camera!=='undefined'&&camera){const t=performance.now()*0.001,a=H.shakeAmt*H.shakeAmt;
      camera.position.x+=Math.sin(t*61.3)*a*0.35;camera.position.y+=Math.cos(t*47.9)*a*0.28;camera.rotation.z+=Math.sin(t*39.1)*a*0.03;
      H.shakeAmt=Math.max(0,H.shakeAmt-dt*1.6);}};}
  /* ---------- construction ---------- */
  function build(){
    if(H.built)return;const hud=q('#hud');if(!hud)return;H.built=true;
    document.documentElement.classList.add('ui45');
    /* argent : bloc dédié en haut à droite */
    const right=q('#right'),money=q('#stats .money');
    const top=mk('div','h45-top');const clockRow=mk('div','h45-clockrow');
    const clk=q('#clock');if(clk)clockRow.appendChild(clk);
    const wallet=mk('div','h45-wallet');if(money)wallet.appendChild(money);
    wallet.appendChild(mk('div','h45-deltas'));
    top.appendChild(clockRow);top.appendChild(wallet);
    if(right)right.insertBefore(top,right.firstChild);
    /* radar */
    const mini=q('#mini');const radar=mk('div','h45-radar',null,'<div class="r45-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><g class="r45-ticks"></g></svg><b class="r45-n">N</b><b class="r45-e">E</b><b class="r45-s">S</b><b class="r45-w">O</b></div><div class="r45-zone"></div>');
    if(mini){radar.insertBefore(mini,radar.firstChild);}
    const tk=radar.querySelector('.r45-ticks');let tks='';for(let i=0;i<72;i++){const a=i*5*Math.PI/180,big=i%6===0,r0=big?88:92;tks+='<line x1="'+(100+Math.sin(a)*r0).toFixed(1)+'" y1="'+(100-Math.cos(a)*r0).toFixed(1)+'" x2="'+(100+Math.sin(a)*97).toFixed(1)+'" y2="'+(100-Math.cos(a)*97).toFixed(1)+'"'+(big?' class="b"':'')+'/>';}tk.innerHTML=tks;
    hud.appendChild(radar);
    /* compteur de vitesse */
    const sp=mk('div','h45-speedo',null,'<svg viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="s45g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffae2b"/><stop offset=".7" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ff2e88"/></linearGradient></defs><path class="s45-track" d=""/><path class="s45-red" d=""/><path class="s45-fill" d=""/><g class="s45-ticks"></g></svg><div class="s45-read"><b>0</b><small>km/h</small><i class="s45-gear">N</i></div>');
    const arc=(r,a0,a1)=>{const p=a=>[110+Math.sin(a)*r,110-Math.cos(a)*r];const [x0,y0]=p(a0),[x1,y1]=p(a1);return 'M'+x0.toFixed(2)+' '+y0.toFixed(2)+'A'+r+' '+r+' 0 '+((a1-a0)>Math.PI?1:0)+' 1 '+x1.toFixed(2)+' '+y1.toFixed(2);};
    const A0=-Math.PI*0.75,A1=Math.PI*0.75,MAX=240;H.arc={A0,A1,MAX};
    sp.querySelector('.s45-track').setAttribute('d',arc(92,A0,A1));sp.querySelector('.s45-fill').setAttribute('d',arc(92,A0,A1));
    sp.querySelector('.s45-red').setAttribute('d',arc(92,A0+(A1-A0)*200/MAX,A1));
    let st='';for(let v=0;v<=MAX;v+=10){const a=A0+(A1-A0)*v/MAX,big=v%40===0,r0=big?74:80;st+='<line x1="'+(110+Math.sin(a)*r0).toFixed(1)+'" y1="'+(110-Math.cos(a)*r0).toFixed(1)+'" x2="'+(110+Math.sin(a)*84).toFixed(1)+'" y2="'+(110-Math.cos(a)*84).toFixed(1)+'"'+(big?' class="b"':'')+(v>=200?' data-r="1"':'')+'/>';if(big)st+='<text x="'+(110+Math.sin(a)*61).toFixed(1)+'" y="'+(110-Math.cos(a)*61+5).toFixed(1)+'">'+v+'</text>';}
    sp.querySelector('.s45-ticks').innerHTML=st;
    const fill=sp.querySelector('.s45-fill');H.fillLen=fill.getTotalLength?fill.getTotalLength():400;fill.style.strokeDasharray=H.fillLen;fill.style.strokeDashoffset=H.fillLen;
    hud.appendChild(sp);
    /* bannière de quartier, voile de blessure, mode photo */
    hud.appendChild(mk('div','h45-zone',null,'<small></small><b></b><i></i>'));
    q('#app').appendChild(mk('div','h45-hurt'));
    q('#app').appendChild(mk('div','h45-photo',null,'<b>Mode photo</b><span>F2 pour revenir</span>'));
    /* rail central : Sac · Gestes · Pause */
    fixRail();
    /* invites de touche */
    const pr=q('#prompt');if(pr)new MutationObserver(()=>formatPrompt(pr)).observe(pr,{childList:true,characterData:true,subtree:true});
    if(pr)formatPrompt(pr);
    loop45();
  }
  function fixRail(){const rail=q('#p3b'),pb=q('#pausebtn');if(rail&&pb&&pb.parentNode!==rail){rail.appendChild(pb);pb.classList.add('in-rail');}}
  function formatPrompt(pr){
    if(pr.dataset.f45===pr.textContent+'|')return;const t=pr.textContent||'';
    const m=t.match(/^\s*([A-Z0-9É]{1,6}|Entrée|Espace|Maj)\s*·\s*(.+)$/);
    if(m){pr.innerHTML='<span class="k45">'+esc(m[1])+'</span><span class="l45">'+esc(m[2])+'</span>';}
    else if(t&&!pr.querySelector('.l45')){pr.innerHTML='<span class="l45 solo">'+esc(t)+'</span>';}
    pr.dataset.f45=pr.textContent+'|';
  }
  /* ---------- zones ---------- */
  function zoneOf(){if(typeof player==='undefined')return['',''];const x=player.x;
    if(x<-3000)return['Île de Solenne','Océan Aurore · carte 2'];
    if(x<-1500&&x>-2800)return['Nouvelle-Aurore','Capitale · troisième ville'];
    if(x<-330&&x>-1000)return['Aéroport International','Port-Aurore · zone aéroportuaire'];
    return['Port-Aurore','Métropole de la Lagune'];}
  function banner(kick,name,small){const z=q('#h45-zone');if(!z)return;z.querySelector('small').textContent=kick;z.querySelector('b').textContent=name;
    z.classList.remove('on','sm');void z.offsetWidth;z.classList.toggle('sm',!!small);z.classList.add('on');clearTimeout(H.bt);H.bt=setTimeout(()=>z.classList.remove('on'),small?2200:3600);}
  /* ---------- argent ---------- */
  function delta(v,bank){const box=q('.h45-deltas');if(!box||!v)return;const d=mk('div',null,'d45 '+(v>0?'up':'down')+(bank?' bank':''));
    d.textContent=(v>0?'+':'−')+(typeof fmt==='function'?fmt(Math.abs(v)):'$'+Math.abs(Math.round(v)))+(bank?' banque':'');
    box.appendChild(d);while(box.children.length>3)box.removeChild(box.firstChild);setTimeout(()=>d.remove(),2600);
    const el=q(bank?'#h-bank':'#h-cash');if(el){el.classList.remove('pop45','drop45');void el.offsetWidth;el.classList.add(v>0?'pop45':'drop45');}}
  /* ---------- boucle d'interface ---------- */
  let lastT=performance.now();
  function loop45(){
    requestAnimationFrame(loop45);
    const now=performance.now(),dt=Math.min(0.1,(now-lastT)/1000);lastT=now;
    if(typeof started==='undefined'||!started)return;
    fixRail();
    /* argent */
    if(typeof state!=='undefined'){
      if(H.lastCash!=null&&Math.abs(state.cash-H.lastCash)>=1)delta(state.cash-H.lastCash,false);
      if(H.lastBank!=null&&Math.abs(state.bank-H.lastBank)>=1)delta(state.bank-H.lastBank,true);
      H.lastCash=state.cash;H.lastBank=state.bank;
      const hp=state.health,hurt=q('#h45-hurt');
      if(hurt){const low=hp<35?(35-hp)/35:0;const show=(typeof FX45==='undefined'||FX45.mode===0);hurt.style.opacity=show?(low*(0.55+0.45*Math.pow(Math.max(0,Math.sin(now*0.004*(1+low))),6))).toFixed(3):0;}
      document.documentElement.classList.toggle('low45',hp<30);
    }
    /* radar : boussole */
    const ring=q('.r45-ring');if(ring&&typeof camYaw==='number'){const r=(camYaw-Math.PI)*180/Math.PI;ring.style.setProperty('--yaw',r.toFixed(1)+'deg');}
    /* vitesse */
    const sp=q('#h45-speedo');
    if(sp&&typeof player!=='undefined'){const car=player.car,on=!!car&&!(typeof FL!=='undefined'&&FL&&FL.on);sp.classList.toggle('on',on);
      if(on){const v=Math.abs(car.v||0)*3.6;H.spd+=(v-H.spd)*Math.min(1,dt*10);const k=Math.min(1,H.spd/H.arc.MAX);
        sp.querySelector('.s45-fill').style.strokeDashoffset=(H.fillLen*(1-k)).toFixed(1);sp.querySelector('.s45-read b').textContent=Math.round(H.spd);
        const g=car.v<-0.3?'R':H.spd<2?'N':'D'+Math.min(6,1+Math.floor(H.spd/38));sp.querySelector('.s45-gear').textContent=g;sp.classList.toggle('red',H.spd>200);}}
    /* quartiers et intérieurs */
    const [zn,zs]=zoneOf();if(zn&&zn!==H.zone){if(H.zone)banner(zs,zn);H.zone=zn;const rz=q('.r45-zone');if(rz)rz.textContent=zn;}
    const ins=player&&player.inside||null;if(ins!==H.inside){H.inside=ins;if(ins&&typeof ins.name==='string'&&ins.name)banner('Intérieur',ins.name,true);}
  }
  /* ---------- touches ---------- */
  addEventListener('keydown',e=>{if(e.key!=='F2')return;if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;if(typeof started==='undefined'||!started)return;e.preventDefault();
    H.clean=!H.clean;document.documentElement.classList.toggle('photo45',H.clean);});
  /* ---------- écran titre et menu ---------- */
  function retitle(){const ed=q('.pm-ed');if(ed)ed.textContent='ÉDITION LAGUNE NOIRE';const ed2=q('.pm-ed2');if(ed2)ed2.textContent='Édition Lagune Noire';
    const lg=q('.pm-legal');if(lg)lg.textContent='Jeu de rôle solo · sauvegarde locale · v48';const vr=q('.pm-ver');if(vr)vr.textContent='v48 · Métropole · Sauvegarde automatique';
    const t=q('.pm-title');if(t&&!t.dataset.t45){t.dataset.t45=1;t.setAttribute('data-text',t.textContent);}}
  /* démarrage : attend que le HUD soit visible */
  const iv=setInterval(()=>{retitle();if(typeof started!=='undefined'&&started){build();}if(H.built)clearInterval(iv);},250);
  return {shake,banner,H};
})();
window.HUD45=HUD45;
