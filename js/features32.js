/* v32 · maison connectée dans les villas + accueil parlé des commerces (les commandes de voiture sont dans motors33) */
'use strict';
(function(){
const V=window.V31;if(!V)return;
// Add interactive smart-home and fitness equipment to the already furnished villa interior.
const buildRooms=V.buildInteriors;V.buildInteriors=function(){buildRooms();const R=V.home;if(!R||R.G.userData.pa32Tech)return;R.G.userData.pa32Tech=1;
 const screen=new THREE.Mesh(new THREE.BoxGeometry(.9,.62,.08),new THREE.MeshStandardMaterial({color:0x152c3a,emissive:0x14324a,emissiveIntensity:.8,metalness:.35,roughness:.35}));screen.position.set(8.45,1.65,-3.3);R.G.add(screen);
 const bench=new THREE.Mesh(new THREE.BoxGeometry(1.6,.16,.55),new THREE.MeshStandardMaterial({color:0x252a30,metalness:.25,roughness:.6}));bench.position.set(1.2,.65,-4.9);R.G.add(bench);
 const state32={night:false,cinema:false,security:false};V.homeModes32=state32;
 R.int(7.4,-3.2,'Panneau domotique',()=>openPanel('Maison connectée','Contrôle central : éclairage, cinéma et sécurité.',[
  {label:'Mode nuit · volets et éclairage doux',fn:()=>{state32.night=!state32.night;toast(state32.night?'Mode nuit activé.':'Mode nuit désactivé.','good');}},
  {label:'Mode cinéma · écran et ambiance',fn:()=>{state32.cinema=!state32.cinema;screen.material.emissive.setHex(state32.cinema?0x2e6fd1:0x14324a);toast(state32.cinema?'Mode cinéma activé.':'Mode cinéma arrêté.','good');}},
  {label:'Alarme et contrôle d’accès',fn:()=>{state32.security=!state32.security;toast(state32.security?'Alarme connectée activée.':'Alarme désactivée.','good');}}]),{r:1.5});
 R.int(1.2,-4.4,'Salle de sport connectée',()=>openPanel('Espace fitness','Équipement connecté · séance à domicile.',[
  {label:'Faire 20 minutes de sport',fn:()=>{state.energy=Math.max(0,state.energy-12);state.health=Math.min(100,state.health+6);state.fun=Math.min(100,state.fun+5);toast('Séance terminée : santé +6, humeur +5.','good');}},
  {label:'Vélo d’appartement · séance cardio',fn:()=>{state.energy=Math.max(0,state.energy-18);state.health=Math.min(100,state.health+9);toast('Cardio terminé : santé +9.','good');}}]),{r:1.6});
};
// Staff and customers speak when the player starts a service interaction.
const baseStore=V.store;V.store=function(id){const lines={super:['Bienvenue ! Les fruits frais sont au fond.','Bonjour ! Besoin d’un sac ?'],mode:['Bienvenue chez Mode Aurore, les nouveautés sont en vitrine.','Cette coupe vous va très bien !'],shoes:['Bonjour ! Vous cherchez plutôt du confort ou du style ?','Les nouveautés sont juste là.'],bijoux:['Bienvenue. Cette collection est en or du Golfe.','Je peux vous montrer les pièces les plus discrètes.'],tech:['Bienvenue chez Aurore Tech ! On a tout pour une maison connectée.','Vous cherchez un téléviseur ou un ordinateur ?'],meubles:['Bonjour ! Installez-vous, vous pouvez essayer le canapé.','Cette collection ira très bien dans une villa.'],pharma:['Bonjour, comment puis-je vous aider ?','Prenez votre temps, je suis à votre disposition.'],cine:['Bonsoir ! Bonne séance, le film commence bientôt.','Bienvenue au cinéma des Palmiers !'],arcade:['Salut ! Prêt pour un défi ?','La borne de course vient d’être remise à neuf.'],cafe:['Bonjour ! Un café pour commencer ?','Bienvenue, les boissons fraîches sont prêtes.'],food:['Bienvenue au food court ! Qu’est-ce qui vous ferait plaisir ?','Bonjour ! La commande sera prête dans un instant.']};const l=(lines[id]||['Bienvenue ! Comment puis-je vous aider ?']);const line=l[Math.floor(Math.random()*l.length)];const who=id==='tech'?'Employé Aurore Tech':id==='cafe'?'Barista':id==='food'?'Employé du food court':'Employé des Palmiers';const target={position:{x:player.x,y:1.35,z:player.z}};say(target,line,3.5);addChat(who,line);return baseStore(id);};
})();
