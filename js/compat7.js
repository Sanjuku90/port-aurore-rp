'use strict';
/* ---------- v7 : moteur 3D embarqué (r185), réglages couleur ---------- */
(function(){
  const T=Object.assign({},window.THREE);
  class CT extends T.CanvasTexture{constructor(...a){super(...a);this.colorSpace=T.SRGBColorSpace;}}
  T.CanvasTexture=CT;
  window.THREE=T;
})();
