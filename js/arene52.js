'use strict';
/* v52 · Nouvelles activités et championnats : karting, bowling (nouveau mini-jeu), paintball, esport,
   équitation sportive et cuisine professionnelle. Entraînement libre, ligues à 3 niveaux
   (régional → national → trois cités), manches, classement, rivaux récurrents, primes et trophées. */
(function(){
if(!window.C52)return;
const K='pa-arene52';C51.resetKey(K);
/* ---------------- mini-jeu inédit : bowling ---------------- */
function addBowling(){if(!window.MG29||!MG29.DEF||MG29.DEF.bowling52)return;const U=MG29._util,W=U.W,H=U.H,CL=U.CL,R=U.R;
  const LX=W/2,LW=300;
  MG29.DEF.bowling52={name:'Bowling',icon:'🎳',intro:'Valide la visée, puis l’effet, puis la puissance. 5 frames, 2 lancers par frame. Strike = bonus !',help:['Espace / clic : valider chaque curseur'],repeat:true,
    rack(){const p=[];for(let r=0;r<4;r++)for(let i=0;i<=r;i++)p.push({x:LX+(i-r/2)*44,y:150-r*32,up:true,vx:0,vy:0});return p;},
    init(G){G.fr=0;G.th=0;G.pins=this.rack();G.total=0;G.ph=0;G.ax=0;G.sp=0;G.pw=0;G.v=1;G.ball=null;G.msg='';G.msgT=0;G.down0=0;G.strikes=0;G.endFrame=false;},
    key(G,k){if(k==='A')this.nx(G);},tap(G){this.nx(G);},
    nx(G){if(G.ball||G.msgT>0)return;U.sfx.tick();if(G.ph<2){G.ph++;G.v=1;return;}const pw=.55+G.pw*.45;G.ball={x:LX+G.ax*115,y:H-50,vx:0,vy:-(480+pw*420),spin:G.sp,pw};G.ph=3;},
    step(G,dt){const s=dt*(1.5+(G.o.diff||.5));
      if(G.msgT>0){G.msgT-=dt;if(G.msgT<=0)this.next(G);}
      else if(G.ph===0){G.ax+=G.v*s;if(Math.abs(G.ax)>1){G.ax=Math.sign(G.ax);G.v*=-1;}}
      else if(G.ph===1){G.sp+=G.v*s*1.3;if(Math.abs(G.sp)>1){G.sp=Math.sign(G.sp);G.v*=-1;}}
      else if(G.ph===2){G.pw+=G.v*s*1.1;if(G.pw>1||G.pw<0){G.pw=CL(G.pw,0,1);G.v*=-1;}}
      const b=G.ball;
      if(b){b.vx+=b.spin*260*dt*(b.y<H*.62?1.7:.35);b.x+=b.vx*dt;b.y+=b.vy*dt;
        if(!b.gutter&&(b.x<LX-LW/2+14||b.x>LX+LW/2-14)){b.gutter=true;b.vx=0;b.x=b.x<LX?LX-LW/2+4:LX+LW/2-4;}
        if(!b.gutter)G.pins.forEach(p=>{if(p.up&&Math.hypot(p.x-b.x,p.y-b.y)<31){p.up=false;p.vx=(p.x-b.x)*5+R(-60,60);p.vy=-150*b.pw;U.sfx.tick();}});
        if(b.y<30){G.ball=null;this.score(G);}}
      G.pins.forEach(p=>{if(p.up||(!p.vx&&!p.vy))return;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.95;p.vy*=.95;if(Math.abs(p.vx)+Math.abs(p.vy)<6){p.vx=p.vy=0;}
        G.pins.forEach(q=>{if(q.up&&Math.hypot(q.x-p.x,q.y-p.y)<27&&Math.random()<.92){q.up=false;q.vx=(q.x-p.x)*3.5+R(-30,30);q.vy=-100;}});});
      G.label='Frame '+Math.min(5,G.fr+1)+'/5 · lancer '+(G.th+1)+' · '+G.total+' quilles'+(G.strikes?' · '+G.strikes+' strike(s)':'');},
    score(G){const down=G.pins.filter(p=>!p.up).length,now=down-G.down0;G.total+=now;
      if(down===10&&G.th===0){G.total+=5;G.strikes++;G.msg='STRIKE !';G.endFrame=true;U.sfx.ok();}
      else if(down===10){G.total+=3;G.msg='SPARE !';G.endFrame=true;U.sfx.ok();}
      else if(G.th===1){G.msg=now+' quille(s)';G.endFrame=true;}
      else{G.msg=now?now+' quille(s)':'Dans la gouttière…';G.endFrame=false;if(!now)U.sfx.bad();}
      G.down0=down;G.msgT=1.3;},
    next(G){G.ph=0;G.ax=0;G.sp=0;G.pw=0;G.v=1;
      if(G.endFrame){G.fr++;G.th=0;G.pins=this.rack();G.down0=0;if(G.fr>=5){MG29.end(CL(G.total/62,0,1));return;}}else G.th=1;},
    draw(G){const cx=U.cx;U.bg('#1b1530','#0d0a18');
      cx.fillStyle='#c98f4f';cx.fillRect(LX-LW/2,0,LW,H);cx.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<10;i++)cx.fillRect(LX-LW/2+i*30,0,2,H);
      cx.fillStyle='#2a2238';cx.fillRect(LX-LW/2-26,0,26,H);cx.fillRect(LX+LW/2,0,26,H);
      cx.fillStyle='rgba(255,255,255,.5)';[-60,-30,0,30,60].forEach(d=>{cx.beginPath();cx.moveTo(LX+d,H*.62);cx.lineTo(LX+d-7,H*.62+16);cx.lineTo(LX+d+7,H*.62+16);cx.fill();});
      G.pins.forEach(p=>{cx.globalAlpha=p.up?1:.35;U.emo('🎳',p.x,p.y,p.up?34:26);cx.globalAlpha=1;});
      const b=G.ball;if(b){cx.fillStyle='#3a6df0';cx.beginPath();cx.arc(b.x,b.y,15,0,7);cx.fill();cx.fillStyle='rgba(255,255,255,.5)';cx.beginPath();cx.arc(b.x-4,b.y-5,4,0,7);cx.fill();}
      else{const bx=LX+G.ax*115;cx.fillStyle='#3a6df0';cx.beginPath();cx.arc(bx,H-50,15,0,7);cx.fill();
        cx.strokeStyle='rgba(255,255,255,.6)';cx.setLineDash([8,8]);cx.beginPath();cx.moveTo(bx,H-70);cx.quadraticCurveTo(bx,H*.5,bx+G.sp*90,170);cx.stroke();cx.setLineDash([]);
        const lab=['VISÉE','EFFET','PUISSANCE'][Math.min(2,G.ph)];U.txt(lab,120,H-120,26,'#ffd23f');
        const bar=(y,val,act)=>{cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(40,y,160,14);cx.fillStyle=act?'#ffd23f':'#8a83a8';cx.fillRect(40+(val+1)/2*150,y-4,10,22);};
        bar(H-90,G.ax,G.ph===0);bar(H-62,G.sp,G.ph===1);cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(40,H-34,160,14);cx.fillStyle=G.ph===2?'#ff7a59':'#8a83a8';cx.fillRect(40,H-34,160*G.pw,14);}
      if(G.msgT>0)U.txt(G.msg,LX,H/2,64,'#fff');
      U.txt(G.total+' pts',W-120,60,40,'#ffd23f');}
  };}
addBowling();setTimeout(addBowling,1500);
/* ---------------- disciplines ---------------- */
const SPORTS={
  kart:{n:'Karting',icon:'🏎️',place:['race17',0,14],label:'🏎️ Karting des Docks',rival:'Yasmine Koné',fee:60,mg:'runner',o:{intro:'Évite les karts adverses et les pneus, attrape les bonus de vitesse.',dur:30},prize:[800,2200,6000]},
  bowl:{n:'Bowling',icon:'🎳',place:['met:aurore-multiplex',10,6,'zone27:cinema'],label:'🎳 Aurore Bowling · Multiplex',rival:'Didier « Strike » Mensah',fee:25,mg:'bowling52',o:{},prize:[500,1600,4500]},
  paint:{n:'Paintball',icon:'🎯',place:['met:aurore-logistics-park',14,10,'nat40:industry'],label:'🎯 Paintball Arena du Corridor',rival:'Team Sahel',fee:45,mg:'tir',o:{intro:'Élimine l’équipe adverse sans toucher les arbitres !',dur:25},prize:[700,2000,5500]},
  esport:{n:'Esport',icon:'🎮',place:['met:innovation-incubator',0,9,'nat40:bank'],label:'🎮 Aurore Esport Arena',rival:'xX_Kofi_Xx',fee:20,mg:['rhythm','simon','tir'],o:{dur:28},prize:[900,2600,8000]},
  cheval:{n:'Équitation',icon:'🐎',place:['life41:pets:sol',-30,-14],label:'🐎 Haras de Solenne · concours',rival:'Clarisse Morel',fee:80,mg:['balance','timing'],o:{intro:'Garde l’équilibre et le rythme de ta monture sur le parcours d’obstacles.',dur:24,steps:['Oxer','Vertical','Rivière','Mur','Triple','Barrage']},prize:[1000,3000,7500]},
  cuisine:{n:'Cuisine',icon:'👨‍🍳',place:['met:waterfront-restaurants',0,8,'shop'],label:'👨‍🍳 Brigade des Docks · cuisine pro',rival:'Chef Aminata Sy',fee:40,mg:'stir',o:{intro:'Le jury goûte ton plat : garde la cuisson parfaite.',items:['🦞','🧅','🌶️','🥥'],dur:18},prize:[800,2400,6500]}
};
const LEAGUES=['Ligue régionale','Championnat national','Coupe des Trois Cités'];
const PTS=[10,7,5,3,2,1,0,0];
const blank=()=>{const o={};Object.keys(SPORTS).forEach(k=>o[k]={lv:0,round:0,pts:0,played:0,wins:0,titles:0,vsW:0,vsL:0});o.horse=false;o.cookJobs=0;return o;};
let S=C51.load(K,blank);Object.keys(SPORTS).forEach(k=>{S[k]=Object.assign(blank()[k],S[k]||{});});
const save=()=>C51.store(K,S);
const mgOf=sp=>Array.isArray(sp.mg)?C52.pick(sp.mg):sp.mg;
function play(id,comp){const sp=SPORTS[id],T=S[id];const diff=comp?.35+.2*T.lv+.05*T.round:.35;const type=mgOf(sp);
  const bonus=id==='cheval'&&S.horse?.08:0;
  C52.mg(type,Object.assign({},sp.o,{id:'arene52-'+id+(comp?'-c':''),title:(comp?LEAGUES[T.lv]+' · manche '+(T.round+1)+'/3 · ':'Entraînement · ')+sp.n,icon:sp.icon,diff,min:comp?60:35,gain:comp?{}:{fun:18},
    after:s=>{s=Math.min(1,s+bonus);T.played++;C52.xp('arene',comp?15+25*s:6+8*s);if(id==='cuisine')C52.xp('affaires',4);
      if(!comp){save();return s>=.8?'Excellent entraînement, tu progresses vite.':'Bonne séance.';}
      /* classement face à 7 concurrents */
      const field=[];for(let i=0;i<7;i++)field.push(Math.min(1,.25+Math.random()*.45+T.lv*.12));const rivalS=Math.min(.97,.45+T.lv*.15+Math.random()*.25);field[0]=rivalS;
      const place=1+field.filter(v=>v>s).length;const pts=PTS[place-1]||0;T.pts+=pts;T.round++;if(s>rivalS)T.vsW++;else T.vsL++;
      let msg=place+(place===1?'re':'e')+' place · +'+pts+' pts ('+T.pts+' au total). '+sp.rival+(s>rivalS?' est derrière toi !':' te devance cette fois.');
      if(place===1){T.wins++;C51.earn(Math.round(sp.prize[T.lv]*.3),'Victoire · '+sp.n);}
      if(T.round>=3){const champ=T.pts>=22;msg+=' Fin de la '+LEAGUES[T.lv].toLowerCase()+' : '+(champ?'🏆 CHAMPION !':'pas de titre cette saison.');
        if(champ){T.titles++;C51.earn(sp.prize[T.lv],LEAGUES[T.lv]+' · '+sp.n,true);C52.trophy('arene-'+id+'-'+T.lv,LEAGUES[T.lv]+' de '+sp.n.toLowerCase(),sp.icon,'sport',[1500,4000,9000][T.lv]);C52.fame(3+T.lv*3);if(T.lv===2)C52.title('Champion des Trois Cités · '+sp.n);T.lv=Math.min(2,T.lv+1);}
        T.round=0;T.pts=0;}
      save();return msg;}}));}
function venue(id){const sp=SPORTS[id],T=S[id];const rows=[
  C52.b('Entraînement libre',()=>play(id,false),Math.round(sp.fee/2)),
  C52.b('Compétition · '+LEAGUES[T.lv]+' · manche '+(T.round+1)+'/3',()=>play(id,true),sp.fee)];
  if(id==='cheval')rows.push(S.horse?{label:'🐎 Soigner Tonnerre, ton cheval',fn:()=>C52.mg('mash',{id:'arene52-pansage',title:'Pansage',icon:'🐎',dur:10,min:20,gain:{fun:10},after:()=>'Tonnerre est en pleine forme.'})}:C52.b('Acheter un cheval de concours (+8 % aux épreuves)',()=>{S.horse=true;save();C52.title('Cavalier');toast('Tonnerre rejoint le haras !','good');},8000));
  if(id==='cuisine')rows.push({label:'🍽️ Service en brigade (job) · ~'+fmt(180),fn:()=>C52.mg('catch',{id:'arene52-brigade',title:'Coup de feu en cuisine',icon:'🍽️',intro:'Envoie les bonnes assiettes, évite les commandes ratées.',good:['🍲','🍛','🥗','🍤','🍰'],bad:['🔥','🧂','🪳'],basket:'🛎️',dur:24,min:120,work:true,
    after:s=>{const p=Math.round(90+180*s);C51.earn(p,'Service en brigade');S.cookJobs++;save();C52.xp('arene',6);C52.xp('affaires',6);return 'Salaire du service : '+fmt(p)+'.';}})});
  C52.panel(sp.label,sp.n+' · '+LEAGUES[T.lv]+' · '+T.pts+' pts après '+T.round+' manche(s). '+T.wins+' victoire(s), '+T.titles+' titre(s). Rival : '+sp.rival+' ('+T.vsW+'–'+T.vsL+').',rows);}
Object.keys(SPORTS).forEach(id=>C52.venue('arene52:'+id,SPORTS[id].place,0xff9f43,SPORTS[id].label,()=>venue(id)));
C52.tab('arene','Arène',(b,UI)=>{const tot=Object.keys(SPORTS).reduce((a,k)=>a+S[k].titles,0);UI.hero(b,'Sport & loisirs · '+C52.rankName('arene'),tot+' titre(s) de champion',Object.keys(SPORTS).reduce((a,k)=>a+S[k].played,0)+' épreuves disputées');
  const g=UI.grp(b);Object.keys(SPORTS).forEach(k=>{const sp=SPORTS[k],T=S[k];UI.row(g,{title:sp.icon+' '+sp.n+' · '+LEAGUES[T.lv],sub:T.pts+' pts · manche '+(T.round+1)+'/3 · rival '+sp.rival+' ('+T.vsW+'–'+T.vsL+')',wrap:true,onClick:()=>C52.go('arene52:'+k)});});
  UI.note(b,'Touche une discipline pour lancer le GPS. 22 points sur 3 manches = titre et montée de ligue.');},40);
window.ARENE52={get state(){return S;},SPORTS,play};
})();
