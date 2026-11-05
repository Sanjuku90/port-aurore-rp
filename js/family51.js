'use strict';
/* v51 · Vie de famille : rendez-vous, couple, fiançailles, mariage à la mairie, vie commune,
   enfants qui grandissent (1 an = 4 jours de jeu), école, anniversaires, album et héritier désigné. */
(function(){
const K='pa-family51';C51.resetKey(K);
const YEAR=4,MAX_KIDS=3;
const KID_NAMES=['Noa','Lina','Malik','Awa','Eden','Maya','Yanis','Inaya','Sacha','Kenza','Ilyes','Zoé'];
const STAGE={date:'Rendez-vous',couple:'En couple',fiance:'Fiancé(e)s',marie:'Marié(e)s'};
const blank=()=>({partner:null,kids:[],baby:null,heir:null,album:[],lastDay:Math.floor(gameMin/1440)});
let F=C51.load(K,blank);const save=()=>C51.store(K,F);
const d=()=>C51.day();
const age=k=>Math.floor((d()-k.born)/YEAR);
const ageTxt=k=>{const a=age(k);return a<=0?'nourrisson':a+' an'+(a>1?'s':'');};
const phase=k=>{const a=age(k);return a<3?'bébé':a<12?'enfant':a<18?'ado':'adulte';};
const memory=t=>{F.album.unshift({t,day:d()});F.album=F.album.slice(0,30);C51.journal(t);};
const office=()=>C51.anchor('mairie17',8,-7);
const atOffice=()=>C51.near(office(),8);
const P=()=>F.partner;
function candidates(){return (state.friends||[]).filter(n=>!P()||P().name!==n).sort((a,b)=>C51.rel(b)-C51.rel(a)).slice(0,5);}
function startDate(n){if(C51.rel(n)<40)return toast(n+' te considère encore comme une simple connaissance (relation '+Math.round(C51.rel(n))+'/100, 40 requis).','warn');if(!C51.pay(30,'Rendez-vous · '+n))return;F.partner={name:n,stage:'date',dates:1,since:d(),together:false,wedDay:null};C51.bump(n,10);C51.mood(15);gameMin+=60;save();memory('Premier rendez-vous avec '+n+'.');toast('Dîner aux chandelles avec '+n+'. Relation +10.','good');}
function partnerPanel(){const p=P(),r=Math.round(C51.rel(p.name)),rows=[];
 rows.push({label:'Rendez-vous romantique · 30 $',off:!C51.afford(30),fn:()=>{if(!C51.pay(30,'Rendez-vous · '+p.name))return;p.dates++;C51.bump(p.name,8);C51.mood(12);gameMin+=60;save();toast('Belle soirée avec '+p.name+'.','good');familyPanel();}});
 if(p.stage==='date')rows.push({label:'Officialiser la relation · relation 60 et 2 rendez-vous',off:r<60||p.dates<2,fn:()=>{p.stage='couple';p.since=d();save();memory('En couple avec '+p.name+'.');toast('Vous êtes officiellement en couple !','good');familyPanel();}});
 if(p.stage!=='date'&&!p.together)rows.push({label:'Emménager ensemble',fn:()=>{p.together=true;save();memory('Emménagement avec '+p.name+'.');toast(p.name+' s’installe chez toi. Participation au foyer : 25 $/jour.','good');familyPanel();}});
 if(p.stage==='couple')rows.push({label:'Demander en mariage · bague 500 $ · relation 75',off:r<75||!C51.afford(500),fn:()=>{if(!C51.pay(500,'Bague de fiançailles'))return;p.stage='fiance';C51.bump(p.name,10);save();memory('Fiançailles avec '+p.name+'.');toast(p.name+' a dit oui ! Organise le mariage au bureau de la famille, à la mairie.','good');familyPanel();}});
 if(p.stage==='fiance')rows.push({label:atOffice()?'Célébrer le mariage · 1 500 $':'Mariage · rends-toi au bureau de la famille (mairie)',off:atOffice()&&!C51.afford(1500),fn:()=>{if(!atOffice()){const o=office();C51.gps(o.x,o.z,'Bureau de la famille · mairie');return;}wedding();}});
 if(p.stage==='marie'&&p.wedDay!=null&&(d()-p.wedDay)%28===0&&p.annivDone!==d())rows.push({label:'Fêter notre anniversaire de mariage · 80 $',off:!C51.afford(80),fn:()=>{if(!C51.pay(80,'Anniversaire de mariage'))return;p.annivDone=d();C51.bump(p.name,12);C51.mood(25);memory('Anniversaire de mariage avec '+p.name+'.');save();familyPanel();}});
 rows.push({label:'Rompre avec '+p.name,fn:()=>openPanel('Rompre ?','Cette décision met fin à votre histoire. Les enfants restent avec toi.',[{label:'Confirmer la rupture',fn:()=>{C51.bump(p.name,-40);memory('Séparation avec '+p.name+'.');F.partner=null;save();toast('Vous vous êtes séparés.','warn');}}])});
 return rows;}
function wedding(){const p=P();if(!C51.pay(1500,'Mariage · mairie'))return;p.stage='marie';p.wedDay=d();p.together=true;const guests=(state.friends||[]).filter(n=>n!==p.name).slice(0,8);guests.forEach(n=>C51.bump(n,5));C51.bump(p.name,15);C51.rep(5);C51.mood(40);gameMin+=180;save();memory('Mariage avec '+p.name+(guests.length?' devant '+guests.length+' invité(s)':'')+'.');
 toast('Félicitations ! Mariage célébré avec '+p.name+'.','good');setTimeout(()=>openPanel('💍 Mariage de '+state.name+' et '+p.name,'La mairie est décorée, '+(guests.length?guests.join(', ')+' applaudissent':'vos proches applaudissent')+'. Ce jour restera dans l’album de famille.',[{label:'Ouvrir le bal',fn:()=>{C51.mood(10);}}]),150);}
function addKid(adopted){const name=C51.ask('Prénom de l’enfant',pick(KID_NAMES))||pick(KID_NAMES);const k={name,born:d()-(adopted?2*YEAR:0),care:80,school:false,grade:10,lastBirthday:adopted?2:0};F.kids.push(k);save();memory((adopted?'Adoption de ':'Naissance de ')+name+'.');toast((adopted?'Bienvenue à ':'Félicitations, ')+name+' rejoint la famille !','good');}
function kidPanel(k){const a=age(k),rows=[
 {label:'Passer du temps avec '+k.name+' · 30 min',fn:()=>{k.care=Math.min(100,k.care+25);C51.mood(8);gameMin+=30;save();toast(k.name+' rayonne de bonheur.','good');kidPanel(k);}}];
 if(a>=3&&a<18&&!k.school)rows.push({label:'Inscrire à l’école · 50 $',off:!C51.afford(50),fn:()=>{if(!C51.pay(50,'Inscription scolaire · '+k.name))return;k.school=true;save();memory(k.name+' entre à l’école.');kidPanel(k);}});
 if(k.school&&a<18)rows.push({label:'Aider aux devoirs · 20 min',fn:()=>{k.grade=Math.min(20,k.grade+1);k.care=Math.min(100,k.care+8);gameMin+=20;save();toast('Moyenne de '+k.name+' : '+k.grade+'/20.','good');kidPanel(k);}});
 if(a>(k.lastBirthday||0))rows.push({label:'🎂 Fêter ses '+a+' ans · 60 $',off:!C51.afford(60),fn:()=>{if(!C51.pay(60,'Anniversaire · '+k.name))return;k.lastBirthday=a;k.care=100;C51.mood(20);(state.friends||[]).slice(0,4).forEach(n=>C51.bump(n,2));save();memory('Anniversaire des '+a+' ans de '+k.name+'.');toast('Joyeux anniversaire '+k.name+' !','good');kidPanel(k);}});
 if(a>=18)rows.push({label:F.heir===k.name?'✓ Héritier désigné':'Désigner '+k.name+' comme héritier',off:F.heir===k.name,fn:()=>{F.heir=k.name;save();memory(k.name+' est désigné héritier de la famille.');kidPanel(k);}});
 openPanel('👶 '+k.name+' · '+ageTxt(k),'Étape : '+phase(k)+'. Attention reçue : '+Math.round(k.care)+'/100.'+(k.school?' Scolarisé · moyenne '+k.grade+'/20.':'')+(a>=18?' Adulte : peut reprendre ton patrimoine.':' Grandit d’un an tous les '+YEAR+' jours de jeu.'),rows);}
function familyPanel(){const p=P(),rows=[];
 if(!p){const c=candidates();if(!c.length)rows.push({label:'Fais-toi des amis en parlant aux habitants (E)',off:true});c.forEach(n=>rows.push({label:'Inviter '+n+' · relation '+Math.round(C51.rel(n))+' · 30 $',off:C51.rel(n)<40||!C51.afford(30),fn:()=>{startDate(n);familyPanel();}}));}
 else rows.push(...partnerPanel());
 if(F.baby&&F.baby.due<=d()){F.baby=null;addKid(false);}
 if(p&&p.stage!=='date'&&F.kids.length<MAX_KIDS&&!F.baby)rows.push({label:'Attendre un enfant · naissance dans 3 jours',fn:()=>{F.baby={due:d()+3};save();memory('Un bébé est en route !');toast('Grande nouvelle : un bébé arrive dans 3 jours de jeu.','good');familyPanel();}});
 if(F.kids.length<MAX_KIDS)rows.push({label:'Adopter un enfant · 800 $',off:!C51.afford(800),fn:()=>{if(!C51.pay(800,'Adoption'))return;addKid(true);familyPanel();}});
 F.kids.forEach(k=>rows.push({label:'👶 '+k.name+' · '+ageTxt(k)+' · attention '+Math.round(k.care),fn:()=>kidPanel(k)}));
 if(p||F.kids.length)rows.push({label:'Sortie en famille · 40 $',off:!C51.afford(40),fn:()=>{if(!C51.pay(40,'Sortie en famille'))return;C51.mood(18);if(p)C51.bump(p.name,4);F.kids.forEach(k=>k.care=Math.min(100,k.care+15));gameMin+=90;save();memory('Sortie en famille.');toast('Journée parfaite en famille.','good');}});
 if(p&&p.stage==='marie'&&!F.kids.some(k=>age(k)>=18))rows.push({label:F.heir===p.name?'✓ '+p.name+' est l’héritier':'Désigner '+p.name+' comme héritier',off:F.heir===p.name,fn:()=>{F.heir=p.name;save();memory(p.name+' est désigné héritier.');familyPanel();}});
 if(F.album.length)rows.push({label:'📖 Album de famille · '+F.album.length+' souvenir(s)',fn:()=>openPanel('📖 Album de famille',F.album.slice(0,12).map(a=>'Jour '+(a.day+1)+' · '+a.t).join('  •  '),[{label:'Retour',fn:familyPanel}])});
 const txt=p?(p.name+' · '+STAGE[p.stage]+' · relation '+Math.round(C51.rel(p.name))+'/100'+(p.together?' · vous vivez ensemble':'')):'Célibataire. Invite un ami proche (relation 40+) à un rendez-vous.';
 openPanel('🏡 Ma famille',txt+(F.kids.length?' · '+F.kids.length+' enfant(s)':'')+(F.baby?' · bébé attendu dans '+Math.max(0,F.baby.due-d())+' jour(s)':'')+(F.heir?' · héritier : '+F.heir:'')+'.',rows);}
function dayTick(){const now=d();if(now<=F.lastDay)return;const n=Math.min(10,now-F.lastDay);F.lastDay=now;const p=P();
 for(let i=0;i<n;i++){if(p){C51.bump(p.name,p.together?1:-1);if(p.together){C51.earn(25,'Participation au foyer · '+p.name,true);}}F.kids.forEach(k=>{k.care=Math.max(0,k.care-8);});}
 if(F.baby&&F.baby.due<=now){F.baby=null;addKid(false);}
 F.kids.forEach(k=>{if(age(k)>(k.lastBirthday||0))C51.notify('🎂 Anniversaire de '+k.name,k.name+' a '+age(k)+' ans ! Organise la fête depuis la maison ou l’appli Aurore Destin.');if(k.care<30)C51.notify('👶 '+k.name+' se sent délaissé','Passe du temps avec lui à la maison.');});
 if(F.kids.some(k=>k.care<30))C51.mood(-6);save();}
function marks(){C51.mark('family51:office',office(),0xff8fb1,'💍 Bureau de la famille · mariages et adoptions');}
C51.handle('family51:office',familyPanel);
C51.onReady(()=>{marks();dayTick();try{if(typeof ROOMS!=='undefined'&&ROOMS.home){const R=ROOMS.home;if(!R.ints.some(i=>i.label==='Ma famille'))R.int(-7.0,3.8,'Ma famille',familyPanel,{r:1.6});}}catch(e){console.warn('family51 home',e);}});
C51.every(5,dayTick);C51.every(8,marks);
window.FAMILY51={get state(){return F;},open:familyPanel,age,phase,office};
})();
