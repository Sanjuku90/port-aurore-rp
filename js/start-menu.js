'use strict';
/* ---------- accueil, reprise et parcours débutant ---------- */
function bindStartMenu(){
  const menu=$('#main-menu'),guide=$('#beginner-guide'),intro=$('#intro'),resume=$('#continue-game');
  let autosave=null;
  let hasSave=false;
  try{const s=JSON.parse(localStorage.getItem('port-aurore-rp')||'null');hasSave=!!(s&&typeof s==='object'&&s.v); }catch(e){}
  resume.hidden=!hasSave;
  const show=(view)=>{menu.hidden=view!=='menu';guide.hidden=view!=='guide';intro.hidden=view!=='creator';};
  function prepareNewCharacter(){
    $('#fn').value='Alex';$('#ln').value='Martin';
    look={s:0x3d7be0,k:0xd9a47c,h:0x1a1410,y:'court',t:'tee',bt:'pantalon',p:0x2b3445,g:false,b:false,bag:false,n:false,e:false,w:false};
    document.querySelectorAll('.look').forEach(row=>{
      const key=row.dataset.k,buttons=[...row.querySelectorAll('button')];
      const match=buttons.find(b=>b.dataset.c!=null?parseInt(b.dataset.c,16)===look[key]:(['g','b','bag','n','e','w'].includes(key)?(b.dataset.v==='true')===look[key]:b.dataset.v===look[key]));
      if(match)match.click();
    });
    show('creator');
  }
  $('#new-game').addEventListener('click',prepareNewCharacter);
  $('#open-guide').addEventListener('click',()=>show('guide'));
  $('#guide-create').addEventListener('click',prepareNewCharacter);
  document.querySelectorAll('[data-menu-back]').forEach(b=>b.addEventListener('click',()=>show('menu')));
  function enterCity(isNew){
    if(isNew){
      state.cash=150;state.bank=0;state.license={};if(typeof resetFleetP4==='function')resetFleetP4();state.health=100;state.hunger=80;state.energy=90;state.fun=70;state.thirst=80;state.job=null;state.done=0;state.earned=0;state.rep=0;state.friends=[];if(typeof P3!=='undefined'){P3.inv={};P3.rel={};P3.sick=0;P3.wet=0;P3.emo={t:0,k:''};}
      gameMin=10*60;savedPos=null;if(typeof resetPhase58==='function')resetPhase58();if(typeof resetPhoneP58==='function')resetPhoneP58();player.x=0;player.z=18;player.h=Math.PI;camYaw=Math.PI;
      try{localStorage.removeItem('port-aurore-rp');}catch(e){}
    }
    const fn=$('#fn').value.trim()||'Alex',ln=$('#ln').value.trim()||'Martin';
    state.name=fn+' '+ln;
    scene.remove(player.mesh);player.mesh=makePlayerMesh();scene.add(player.mesh);started=true;
    $('#start').hidden=true;$('#hud').hidden=false;startAudio();restorePosition();
    toast('Bienvenue à Port-Aurore. Le Pôle Emploi est juste devant toi.','good');
    if(!autosave)autosave=setInterval(saveProgress,8000);
    bindPause();saveProgress();
  }
  intro.addEventListener('submit',e=>{e.preventDefault();enterCity(true);});
  resume.addEventListener('click',()=>enterCity(false));
}
