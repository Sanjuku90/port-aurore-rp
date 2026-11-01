'use strict';
/* ---------- interactions ---------- */
function interact(){
  if(!started||paused||panelOpen||chatOpen)return;
  if(player.car){if(Math.abs(player.car.v)<3)exitCar();else toast('Arrête-toi pour descendre.','warn');return;}
  if(nearSpot){useSpot(nearSpot);return;}
  if(nearCar)enterCar(nearCar);else if(nearPed)befriend(nearPed);
}
function openSpot(id){
  if(blackout>0&&(id==='shop'||id==='club')){toast('Coupure de courant : fermé.','warn');return;}
  if(id==='job'){
    const take=(j,msg)=>()=>{state.job=j;mission=null;beam.visible=false;missionCd=2;toast(msg,'good');};
    if(!state.job)openPanel('Pôle Emploi','Deux postes sont ouverts. Livreur : récupère des repas et livre-les avant la fin du chrono, à pied ou en voiture. Taxi : prends un client et dépose-le à destination, il te faut une voiture.',[
      {label:'Devenir livreur',fn:take('livreur','Tu es livreur. Une commande arrive.')},
      {label:'Patrouilleur · rang 2 requis',off:rankOf()<1,fn:take('police','Tu es policier. Une alerte arrive.')},{label:'Devenir taxi',fn:take('taxi','Tu es taxi. Un client t’attend bientôt.')}]);
    else openPanel('Pôle Emploi','Poste actuel : '+JOBN[state.job].toLowerCase()+'. Missions effectuées : '+state.done+'. Gains cumulés : '+fmt(state.earned)+'.',[
      {label:'Annuler la mission en cours',off:!mission,fn:()=>{mission=null;beam.visible=false;missionCd=4;toast('Mission annulée.','warn');}},
      state.job==='taxi'?{label:'Passer livreur',fn:take('livreur','Tu es livreur.')}:{label:'Passer taxi',fn:take('taxi','Tu es taxi.')},
      {label:'Démissionner',fn:()=>{state.job=null;mission=null;beam.visible=false;toast('Tu as quitté ton emploi.','warn');}}]);
  }else if(id==='shop'){
    const buy=(n,c,f)=>({label:n+' · '+fmt(c),off:state.cash<c,fn:()=>{state.cash-=c;state.hunger=Math.min(100,state.hunger+f);toast('Bon appétit. +'+f+' de faim','good');openSpot('shop');}});
    openPanel('Supérette','Tu as '+fmt(state.cash)+' en poche. Faim actuelle : '+Math.round(state.hunger)+' sur 100.',[buy('Bouteille d’eau',2,6),buy('Sandwich',8,30),buy('Menu complet',15,60),buy('Poisson grillé du port',12,45)]);
  }else if(id==='bank'){
    openPanel('Banque','Cash : '+fmt(state.cash)+'. Compte : '+fmt(state.bank)+'. Ce qui est en banque reste à l’abri des amendes en espèces.',[
      {label:'Déposer tout le cash',off:state.cash<=0,fn:()=>{state.bank+=state.cash;state.cash=0;toast('Dépôt effectué.','good');openSpot('bank');}},
      {label:'Retirer '+fmt(50),off:state.bank<50,fn:()=>{state.bank-=50;state.cash+=50;openSpot('bank');}},
      {label:'Retirer '+fmt(200),off:state.bank<200,fn:()=>{state.bank-=200;state.cash+=200;openSpot('bank');}}]);
  }else if(id==='home'){
    openPanel('Appartement','Ton chez-toi. Énergie : '+Math.round(state.energy)+' sur 100.',[
      {label:'Faire une sieste · gratuit',off:state.energy>=95,fn:()=>{state.energy=Math.min(100,state.energy+30);gameMin+=90;state.hunger=Math.max(0,state.hunger-8);toast('Sieste réparatrice.','good');}},
      {label:'Dormir jusqu’au matin · '+fmt(10),off:state.cash<10||state.energy>=95,fn:()=>{state.cash-=10;state.energy=100;state.fun=Math.min(100,state.fun+10);state.hunger=Math.max(0,state.hunger-25);gameMin=(Math.floor(gameMin/1440)+((gameMin%1440)>=420?1:0))*1440+420;toast('Bonne nuit. Il est 7h.','good');}}]);
  }else if(id==='club'){
    openPanel('Club Néon','Musique, lumières et du monde. Humeur : '+Math.round(state.fun)+' sur 100.',[
      {label:'Danser toute la soirée · '+fmt(20),off:state.cash<20||state.fun>=95,fn:()=>{state.cash-=20;state.fun=Math.min(100,state.fun+45);state.energy=Math.max(0,state.energy-12);gameMin+=60;state.rep+=1;toast('Soirée de folie ! +45 humeur','good');}}]);
  }else if(id==='hospital'){
    openPanel('Hôpital','Soins et repas à tarif fixe. Santé : '+Math.round(state.health)+' sur 100.',[
      {label:'Se faire soigner · '+fmt(30),off:state.cash<30||state.health>=100,fn:()=>{state.cash-=30;state.health=100;toast('Soigné.','good');}},
      {label:'Repas hospitalier · '+fmt(10),off:state.cash<10,fn:()=>{state.cash-=10;state.hunger=Math.min(100,state.hunger+40);toast('Merci de votre visite.','good');}}]);
  }else if(SHOPX[id]){shopX(id);}
}
function openPanel(title,text,btns){
  panelOpen=true;$('#pn-title').textContent=title;$('#pn-text').textContent=text;
  const box=$('#pn-btns');box.innerHTML='';
  btns.forEach(b=>{const el=document.createElement('button');el.textContent=b.label;el.disabled=!!b.off;if(!b.off)el.className='primary';el.onclick=()=>{closePanel();b.fn&&b.fn();};box.appendChild(el);});
  const c=document.createElement('button');c.className='ghost';c.textContent='Fermer';c.onclick=closePanel;box.appendChild(c);
  $('#panel').hidden=false;
}
function closePanel(){const bm=document.getElementById('bigmap');if(bm)bm.hidden=true;panelOpen=false;$('#panel').hidden=true;$('#phone').hidden=true;}

/* ---------- missions ---------- */
function newMission(){
  const px=player.x,pz=player.z;
  let c=NODES.filter(n=>{const d=Math.hypot(n.x-px,n.z-pz);return d>35&&d<140;});if(!c.length)c=NODES;
  const a=pick(c);
  let d=NODES.filter(n=>{const dd=Math.hypot(n.x-a.x,n.z-a.z);return dd>70&&dd<190;});if(!d.length)d=NODES;
  const b=pick(d),dist=Math.hypot(b.x-a.x,b.z-a.z);
  const taxi=state.job==='taxi'||state.job==='police',po=state.job==='police';
  mission={kind:state.job,stage:'pickup',pickup:a,drop:b,resto:po?pick(INCID):taxi?'Client : '+pick(NAMES):pick(RESTOS),addr:Math.floor(rand(2,98))+' '+pick(STREETS),pay:Math.round(po?30+dist*0.45:taxi?22+dist*0.4:18+dist*0.3),time:0,limit:Math.round(dist/(taxi?9:6.5)+35)};
  toast(po?'Appel radio : '+mission.resto:taxi?'Un client attend un taxi.':'Nouvelle commande : '+mission.resto,'warn');
}
function updateMission(dt){
  if(!state.job){mission=null;beam.visible=false;return;}
  if(!mission){beam.visible=false;missionCd-=dt;if(missionCd<=0)newMission();return;}
  const t=mission.stage==='pickup'?mission.pickup:mission.drop;
  beam.visible=true;beam.position.x=t.x;beam.position.z=t.z;
  beam.material.color.setHex(mission.stage==='pickup'?0xffb84d:0x58d68d);
  if(mission.stage==='deliver')mission.time+=dt;
  if(Math.hypot(player.x-t.x,player.z-t.z)<4){
    if(mission.stage==='pickup'){
      if(mission.kind!=='livreur'&&!player.car){if(fineCd<=0){fineCd=3;toast('Il te faut une voiture pour prendre ce client.','warn');}return;}
      mission.stage='deliver';mission.time=0;toast(TXT[mission.kind][0]+'Direction '+mission.addr+'.','good');
    }
    else{
      const late=mission.time>mission.limit,pay=Math.round(mission.pay*(late?0.6:1.25));
      state.cash+=pay;state.earned+=pay;state.done++;
      const r0=rankOf();state.rep+=late?1:2;toast(TXT[mission.kind][late?2:1]+'+'+fmt(pay),late?'warn':'good');if(rankOf()>r0)toast('Nouveau rang : '+RANKS[rankOf()]+' !','good');
      mission=null;beam.visible=false;missionCd=3;
    }
  }
}

