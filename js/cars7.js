'use strict';
/* ---------- v7 : vraies voitures (coque lissée, passages de roue, vitrage, jantes alu) ---------- */
const CAR7={
  sedan:{body:[[2.31,.52,.47,.63],[2.25,.8,.36,.76],[2.06,.89,.32,.84],[1.6,.92,.31,.89],[1,.93,.31,.92],[.3,.94,.31,.935],[-.6,.94,.31,.95],[-1.3,.93,.31,.97],[-1.85,.91,.32,.985],[-2.15,.85,.37,.97],[-2.28,.7,.44,.9],[-2.32,.5,.5,.8]],
    gh:{zf:1.08,zws:.22,zrw:-.72,zr:-1.72,belt:.915,roof:1.42,w:.85,wt:.64,deck:.975,rearGlass:false,pil:[-.22]},wh:{r:.34,x:.79,z:[1.36,-1.36],w:.23},ne:4.2,ng:3},
  sport:{body:[[2.22,.52,.4,.55],[2.15,.84,.3,.65],[1.9,.93,.28,.71],[1.3,.95,.28,.76],[.6,.97,.28,.8],[-.3,.98,.28,.82],[-1.1,.99,.28,.86],[-1.7,.97,.29,.87],[-2.05,.9,.33,.85],[-2.2,.7,.4,.79],[-2.24,.5,.46,.72]],
    gh:{zf:.72,zws:-.12,zrw:-.62,zr:-1.9,belt:.8,roof:1.19,w:.84,wt:.58,deck:.87,rearGlass:false,pil:[]},wh:{r:.35,x:.81,z:[1.33,-1.3],w:.28},ne:4.6,ng:2.8},
  suv:{body:[[2.36,.6,.52,.8],[2.28,.86,.42,.94],[2.05,.94,.4,1.02],[1.5,.96,.4,1.06],[.8,.97,.4,1.08],[0,.97,.4,1.1],[-1,.97,.4,1.11],[-1.8,.96,.41,1.12],[-2.2,.92,.44,1.1],[-2.33,.8,.5,1.05],[-2.37,.6,.56,.98]],
    gh:{zf:1.22,zws:.45,zrw:-1.95,zr:-2.22,belt:1.08,roof:1.83,w:.92,wt:.79,deck:1.1,rearGlass:true,pil:[-.18,-1.25]},wh:{r:.4,x:.82,z:[1.42,-1.42],w:.27},ne:5,ng:4},
  danfo:{body:[[2.33,.6,.5,.86],[2.26,.88,.42,1],[2.1,.95,.4,1.08],[1.6,.97,.4,1.12],[0,.97,.4,1.14],[-1.6,.97,.4,1.14],[-2.15,.96,.42,1.14],[-2.3,.9,.46,1.12],[-2.35,.7,.52,1.05]],
    gh:{zf:2.02,zws:1.38,zrw:-2.16,zr:-2.32,belt:1.12,roof:2.15,w:.96,wt:.87,deck:1.14,rearGlass:true,pil:[.9,0,-.9,-1.7]},wh:{r:.37,x:.82,z:[1.55,-1.5],w:.25},ne:6,ng:5}
};
CAR7.taxi=CAR7.sedan;
/* v18 : 10 nouveaux modèles de marques (proportions réglées par marque) */
Object.assign(CAR7,{
  benz:{"body": [[2.4255, 0.5304, 0.47, 0.63], [2.3625000000000003, 0.8160000000000001, 0.36, 0.76], [2.1630000000000003, 0.9078, 0.32, 0.84], [1.6800000000000002, 0.9384, 0.31, 0.89], [1.05, 0.9486000000000001, 0.31, 0.92], [0.315, 0.9588, 0.31, 0.935], [-0.63, 0.9588, 0.31, 0.95], [-1.3650000000000002, 0.9486000000000001, 0.31, 0.97], [-1.9425000000000001, 0.9282, 0.32, 0.985], [-2.2575, 0.867, 0.37, 0.97], [-2.3939999999999997, 0.714, 0.44, 0.9], [-2.436, 0.51, 0.5, 0.8]], "gh": {"zf": 1.1340000000000001, "zws": 0.231, "zrw": -0.756, "zr": -1.806, "belt": 0.915, "roof": 1.42, "w": 0.867, "wt": 0.6528, "deck": 0.975, "rearGlass": false, "pil": [-0.231]}, "wh": {"r": 0.34, "x": 0.8058000000000001, "z": [1.4280000000000002, -1.4280000000000002], "w": 0.23}, "ne": 4.0, "ng": 3},
  lambo:{"body": [[2.1756, 0.5928, 0.32000000000000006, 0.44000000000000006], [2.1069999999999998, 0.9575999999999999, 0.24, 0.52], [1.8619999999999999, 1.0602, 0.22400000000000003, 0.568], [1.274, 1.083, 0.22400000000000003, 0.6080000000000001], [0.588, 1.1058, 0.22400000000000003, 0.6400000000000001], [-0.294, 1.1172, 0.22400000000000003, 0.656], [-1.078, 1.1285999999999998, 0.22400000000000003, 0.6880000000000001], [-1.666, 1.1058, 0.23199999999999998, 0.6960000000000001], [-2.009, 1.026, 0.264, 0.68], [-2.156, 0.7979999999999999, 0.32000000000000006, 0.6320000000000001], [-2.1952000000000003, 0.57, 0.36800000000000005, 0.576]], "gh": {"zf": 0.7056, "zws": -0.1176, "zrw": -0.6076, "zr": -1.8619999999999999, "belt": 0.6400000000000001, "roof": 0.952, "w": 0.9575999999999999, "wt": 0.6611999999999999, "deck": 0.6960000000000001, "rearGlass": false, "pil": []}, "wh": {"r": 0.37, "x": 0.9234, "z": [1.3034000000000001, -1.274], "w": 0.32}, "ne": 4.9, "ng": 2.8, "sporty": true},
  ford:{"body": [[2.2644, 0.5616000000000001, 0.38, 0.5225], [2.193, 0.9072, 0.285, 0.6174999999999999], [1.938, 1.0044000000000002, 0.266, 0.6745], [1.326, 1.026, 0.266, 0.722], [0.612, 1.0476, 0.266, 0.76], [-0.306, 1.0584, 0.266, 0.7789999999999999], [-1.122, 1.0692000000000002, 0.266, 0.817], [-1.734, 1.0476, 0.27549999999999997, 0.8265], [-2.0909999999999997, 0.9720000000000001, 0.3135, 0.8075], [-2.244, 0.756, 0.38, 0.7505], [-2.2848, 0.54, 0.437, 0.6839999999999999]], "gh": {"zf": 0.7343999999999999, "zws": -0.1224, "zrw": -0.6324, "zr": -1.938, "belt": 0.76, "roof": 1.1304999999999998, "w": 0.9072, "wt": 0.6264, "deck": 0.8265, "rearGlass": false, "pil": []}, "wh": {"r": 0.36, "x": 0.8748000000000001, "z": [1.3566, -1.326], "w": 0.3}, "ne": 4.4, "ng": 2.8, "sporty": true},
  toyota:{"body": [[2.0328, 0.494, 0.46059999999999995, 0.6174], [1.98, 0.76, 0.3528, 0.7448], [1.8128, 0.8454999999999999, 0.3136, 0.8231999999999999], [1.4080000000000001, 0.874, 0.3038, 0.8722], [0.88, 0.8835, 0.3038, 0.9016000000000001], [0.264, 0.8929999999999999, 0.3038, 0.9163], [-0.528, 0.8929999999999999, 0.3038, 0.9309999999999999], [-1.1440000000000001, 0.8835, 0.3038, 0.9506], [-1.6280000000000001, 0.8644999999999999, 0.3136, 0.9652999999999999], [-1.892, 0.8075, 0.3626, 0.9506], [-2.0063999999999997, 0.6649999999999999, 0.43119999999999997, 0.882], [-2.0416, 0.475, 0.49, 0.784]], "gh": {"zf": 0.9504, "zws": 0.1936, "zrw": -0.6335999999999999, "zr": -1.5136, "belt": 0.8967, "roof": 1.3916, "w": 0.8075, "wt": 0.608, "deck": 0.9555, "rearGlass": false, "pil": [-0.1936]}, "wh": {"r": 0.33, "x": 0.7505, "z": [1.1968, -1.1968], "w": 0.23}, "ne": 4.3, "ng": 3},
  ferrari:{"body": [[2.22, 0.5720000000000001, 0.34400000000000003, 0.47300000000000003], [2.15, 0.924, 0.258, 0.559], [1.9, 1.0230000000000001, 0.24080000000000001, 0.6105999999999999], [1.3, 1.045, 0.24080000000000001, 0.6536], [0.6, 1.067, 0.24080000000000001, 0.6880000000000001], [-0.3, 1.078, 0.24080000000000001, 0.7051999999999999], [-1.1, 1.089, 0.24080000000000001, 0.7395999999999999], [-1.7, 1.067, 0.24939999999999998, 0.7482], [-2.05, 0.9900000000000001, 0.2838, 0.731], [-2.2, 0.77, 0.34400000000000003, 0.6794], [-2.24, 0.55, 0.3956, 0.6192]], "gh": {"zf": 0.72, "zws": -0.12, "zrw": -0.62, "zr": -1.9, "belt": 0.6880000000000001, "roof": 1.0233999999999999, "w": 0.924, "wt": 0.638, "deck": 0.7482, "rearGlass": false, "pil": []}, "wh": {"r": 0.36, "x": 0.8910000000000001, "z": [1.33, -1.3], "w": 0.31}, "ne": 4.8, "ng": 2.8, "sporty": true},
  porsche:{"body": [[2.0424, 0.5096, 0.36000000000000004, 0.49500000000000005], [1.978, 0.8231999999999999, 0.27, 0.5850000000000001], [1.748, 0.9114, 0.25200000000000006, 0.639], [1.1960000000000002, 0.9309999999999999, 0.25200000000000006, 0.684], [0.552, 0.9506, 0.25200000000000006, 0.7200000000000001], [-0.276, 0.9603999999999999, 0.25200000000000006, 0.738], [-1.0120000000000002, 0.9702, 0.25200000000000006, 0.774], [-1.564, 0.9506, 0.261, 0.783], [-1.886, 0.882, 0.29700000000000004, 0.765], [-2.0240000000000005, 0.6859999999999999, 0.36000000000000004, 0.7110000000000001], [-2.0608000000000004, 0.49, 0.41400000000000003, 0.648]], "gh": {"zf": 0.6624, "zws": -0.1104, "zrw": -0.5704, "zr": -1.748, "belt": 0.7200000000000001, "roof": 1.071, "w": 0.8231999999999999, "wt": 0.5683999999999999, "deck": 0.783, "rearGlass": false, "pil": []}, "wh": {"r": 0.35, "x": 0.7938000000000001, "z": [1.2236, -1.1960000000000002], "w": 0.28}, "ne": 4.5, "ng": 2.8, "sporty": true},
  bmw:{"body": [[2.31, 0.52, 0.45119999999999993, 0.6048], [2.25, 0.8, 0.34559999999999996, 0.7296], [2.06, 0.89, 0.3072, 0.8063999999999999], [1.6, 0.92, 0.2976, 0.8543999999999999], [1.0, 0.93, 0.2976, 0.8832], [0.3, 0.94, 0.2976, 0.8976000000000001], [-0.6, 0.94, 0.2976, 0.9119999999999999], [-1.3, 0.93, 0.2976, 0.9311999999999999], [-1.85, 0.91, 0.3072, 0.9456], [-2.15, 0.85, 0.35519999999999996, 0.9311999999999999], [-2.28, 0.7, 0.4224, 0.864], [-2.32, 0.5, 0.48, 0.768]], "gh": {"zf": 1.08, "zws": 0.22, "zrw": -0.72, "zr": -1.72, "belt": 0.8784, "roof": 1.3632, "w": 0.85, "wt": 0.64, "deck": 0.9359999999999999, "rearGlass": false, "pil": [-0.22]}, "wh": {"r": 0.35, "x": 0.79, "z": [1.36, -1.36], "w": 0.23}, "ne": 4.1, "ng": 3},
  honda:{"body": [[1.9404, 0.48360000000000003, 0.46059999999999995, 0.6174], [1.89, 0.7440000000000001, 0.3528, 0.7448], [1.7304, 0.8277000000000001, 0.3136, 0.8231999999999999], [1.344, 0.8556, 0.3038, 0.8722], [0.84, 0.8649000000000001, 0.3038, 0.9016000000000001], [0.252, 0.8742, 0.3038, 0.9163], [-0.504, 0.8742, 0.3038, 0.9309999999999999], [-1.092, 0.8649000000000001, 0.3038, 0.9506], [-1.554, 0.8463, 0.3136, 0.9652999999999999], [-1.8059999999999998, 0.7905, 0.3626, 0.9506], [-1.9151999999999998, 0.651, 0.43119999999999997, 0.882], [-1.9487999999999999, 0.465, 0.49, 0.784]], "gh": {"zf": 0.9072, "zws": 0.1848, "zrw": -0.6048, "zr": -1.4447999999999999, "belt": 0.8967, "roof": 1.3916, "w": 0.7905, "wt": 0.5952000000000001, "deck": 0.9555, "rearGlass": false, "pil": [-0.1848]}, "wh": {"r": 0.32, "x": 0.7347, "z": [1.1424, -1.1424], "w": 0.23}, "ne": 4.3, "ng": 3},
  jeep:{"body": [[2.2655999999999996, 0.6, 0.6060000000000001, 0.9000000000000001], [2.1887999999999996, 0.86, 0.501, 1.047], [1.9679999999999997, 0.94, 0.48000000000000004, 1.1310000000000002], [1.44, 0.96, 0.48000000000000004, 1.1730000000000003], [0.768, 0.97, 0.48000000000000004, 1.1940000000000002], [0.0, 0.97, 0.48000000000000004, 1.2150000000000003], [-0.96, 0.97, 0.48000000000000004, 1.2255000000000003], [-1.728, 0.96, 0.4905, 1.2360000000000002], [-2.112, 0.92, 0.522, 1.2150000000000003], [-2.2368, 0.8, 0.585, 1.1625], [-2.2752, 0.6, 0.6480000000000001, 1.089]], "gh": {"zf": 1.1712, "zws": 0.432, "zrw": -1.8719999999999999, "zr": -2.1312, "belt": 1.1940000000000002, "roof": 1.9815000000000003, "w": 0.92, "wt": 0.79, "deck": 1.2150000000000003, "rearGlass": true, "pil": [-0.17279999999999998, -1.2]}, "wh": {"r": 0.42, "x": 0.82, "z": [1.3632, -1.3632], "w": 0.27}, "ne": 5.2, "ng": 4},
  hyundai:{"body": [[2.2407, 0.5148, 0.47, 0.63], [2.1825, 0.792, 0.36, 0.76], [1.9982, 0.8811, 0.32, 0.84], [1.552, 0.9108, 0.31, 0.89], [0.97, 0.9207000000000001, 0.31, 0.92], [0.291, 0.9306, 0.31, 0.935], [-0.582, 0.9306, 0.31, 0.95], [-1.261, 0.9207000000000001, 0.31, 0.97], [-1.7945, 0.9009, 0.32, 0.985], [-2.0854999999999997, 0.8415, 0.37, 0.97], [-2.2116, 0.693, 0.44, 0.9], [-2.2504, 0.495, 0.5, 0.8]], "gh": {"zf": 1.0476, "zws": 0.2134, "zrw": -0.6983999999999999, "zr": -1.6683999999999999, "belt": 0.915, "roof": 1.42, "w": 0.8415, "wt": 0.6336, "deck": 0.975, "rearGlass": false, "pil": [-0.2134]}, "wh": {"r": 0.34, "x": 0.7821, "z": [1.3192000000000002, -1.3192000000000002], "w": 0.23}, "ne": 4.2, "ng": 3}
});
const isSporty7=t=>!!(CAR7[t]&&CAR7[t].sporty)||t==='sport';

const sstep=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function cr(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);}
function sampleBody(D){
  const C=D.body,out=[],z0=C[0][0],z1=C[C.length-1][0],N=96,W=D.wh;
  for(let i=0;i<=N;i++){
    const z=z0+(z1-z0)*i/N;let k=0;while(k<C.length-2&&C[k+1][0]>z)k++;
    const t=(C[k][0]-z)/(C[k][0]-C[k+1][0]),g=a=>cr(C[Math.max(0,k-1)][a],C[k][a],C[k+1][a],C[Math.min(C.length-1,k+2)][a],t);
    let w=g(1),b=g(2),tp=g(3);
    W.z.forEach(zw=>{const R=W.r+.09,dz=Math.abs(z-zw);if(dz<R){const ay=W.r+Math.sqrt(R*R-dz*dz)-.02;b=Math.max(b,ay);tp=Math.max(tp,ay+.07);}});
    out.push({z,wb:w*.985,wt:w*.95,b,t:tp});
  }
  return out;
}
function sampleGH(D){
  const G=D.gh,out=[],N=60;
  for(let i=0;i<=N;i++){
    const z=G.zf+(G.zr-G.zf)*i/N;let t;
    if(z>G.zws)t=G.belt+(G.roof-G.belt)*sstep((G.zf-z)/(G.zf-G.zws))*.98+.0;
    else if(z>G.zrw)t=G.roof+.015*Math.sin(Math.PI*(z-G.zrw)/(G.zws-G.zrw));
    else t=G.roof-(G.roof-G.deck)*sstep((G.zrw-z)/(G.zrw-G.zr));
    t=Math.max(t,G.belt+.004);out.push({z,wb:G.w,wt:G.wt,b:G.belt-.05,t});
  }
  out[0].t=out[0].b+.004;out[out.length-1].t=Math.max(out[out.length-1].b+.004,G.deck-.02);return out;
}
const se=(v,n)=>Math.sign(v)*Math.pow(Math.abs(v),2/n);
function loft(S,M,ne,cls,ng){
  const pos=[],G=[];for(let i=0;i<ng;i++)G.push([]);
  S.forEach(s=>{const mid=(s.t+s.b)/2,hh=(s.t-s.b)/2;for(let j=0;j<M;j++){const th=j/M*Math.PI*2,cx=se(Math.cos(th),ne),sy=se(Math.sin(th),ne),w=s.wb+(s.wt-s.wb)*(sy+1)/2;pos.push(cx*w,mid+hh*sy,s.z);}});
  for(let i=0;i<S.length-1;i++)for(let j=0;j<M;j++){
    const a=i*M+j,b=i*M+(j+1)%M,c=(i+1)*M+j,d=(i+1)*M+(j+1)%M,th=(j+.5)/M*Math.PI*2;
    G[cls(th,(S[i].z+S[i+1].z)/2,(pos[a*3+1]+pos[d*3+1])/2)].push(a,c,b,b,c,d);
  }
  [[0,1],[S.length-1,-1]].forEach(([i,sg])=>{const s=S[i],ci=pos.length/3;pos.push(0,(s.t+s.b)/2,s.z);for(let j=0;j<M;j++){const a=i*M+j,b=i*M+(j+1)%M;G[cls(j/M*6.283,s.z,(s.t+s.b)/2)].push(...(sg>0?[ci,a,b]:[ci,b,a]));}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  const idx=[];G.forEach((l,k)=>{g.addGroup(idx.length,l.length,k);idx.push(...l);});g.setIndex(idx);g.computeVertexNormals();return g;
}
function surfX(s,y,ne){if(y<s.b||y>s.t)return -1;const mid=(s.t+s.b)/2,hh=(s.t-s.b)/2,sy=(y-mid)/hh,w=s.wb+(s.wt-s.wb)*(sy+1)/2;return Math.pow(Math.max(0,1-Math.pow(Math.abs(sy),ne)),1/ne)*w;}
function edgeZ(S,x,y,ne,front){const L=front?S:S.slice().reverse();for(const s of L){const sx=surfX(s,y,ne);if(sx>=Math.abs(x))return s.z;}return 0;}
/* ruban qui épouse la carrosserie (filets, bandes, joints de portes) */
function ribbonH(S,ne,y,h,z0,z1,off){
  const p=[],ix=[];let prev=-1;
  [-1,1].forEach(sd=>{S.forEach(s=>{if(s.z>z0||s.z<z1){prev=-1;return;}const x1=surfX(s,y-h/2,ne),x2=surfX(s,y+h/2,ne);if(x1<0||x2<0){prev=-1;return;}
    const k=p.length/3;p.push(sd*(x1+off),y-h/2,s.z,sd*(x2+off),y+h/2,s.z);if(prev>=0)ix.push(...(sd>0?[prev,k,prev+1,prev+1,k,k+1]:[prev,prev+1,k,prev+1,k+1,k]));prev=k;});prev=-1;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;
}
function ribbonV(S,ne,z,y0,y1,w,off){
  let s=S[0];S.forEach(q=>{if(Math.abs(q.z-z)<Math.abs(s.z-z))s=q;});
  const p=[],ix=[];[-1,1].forEach(sd=>{let prev=-1;for(let y=y0;y<=y1+1e-4;y+=(y1-y0)/8){const x=surfX(s,y,ne);if(x<0){prev=-1;continue;}const k=p.length/3;p.push(sd*(x+off),y,s.z+w/2,sd*(x+off),y,s.z-w/2);if(prev>=0)ix.push(...(sd>0?[prev,prev+1,k,prev+1,k+1,k]:[prev,k,prev+1,prev+1,k,k+1]));prev=k;}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;
}
const PAINT7={};
function paint7(c){if(PAINT7[c])return PAINT7[c];const w=new THREE.Color(c),l=(w.r+w.g+w.b)/3;
  const m=new THREE.MeshPhysicalMaterial({color:c,metalness:l>.6||l<.02?.15:.45,roughness:.32,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.15});m.userData.p4Paintable=true;return PAINT7[c]=m;}
const CM7={glass:new THREE.MeshPhysicalMaterial({color:0x223240,metalness:.2,roughness:.04,transparent:true,opacity:.72,envMapIntensity:1.6}),
  trim:sm(0x101113,.55,.1),rubber:sm(0x151515,.88,0),rim:sm(0xc9ced6,.22,1),rimD:sm(0x3a3d42,.35,.9),disc:sm(0x8c8f94,.4,.9),caliper:sm(0xb3261e,.4,.2),
  seat:sm(0x2a2b2e,.85,0),lens:new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.02,metalness:0,transparent:true,opacity:.35,envMapIntensity:2}),
  head:new THREE.MeshStandardMaterial({color:0xf2f2ea,emissive:0xfff3d0,emissiveIntensity:.15,roughness:.2,metalness:.6}),
  rev:new THREE.MeshStandardMaterial({color:0xf2f2f2,emissive:0xffffff,emissiveIntensity:0,roughness:.3})};
const GEO7={};
function plateTex(txt){return ctex('plate'+txt,256,64,(g,W,H)=>{g.fillStyle='#f4f4ee';g.fillRect(0,0,W,H);g.fillStyle='#1f4fa8';g.fillRect(0,0,26,H);g.fillStyle='#ffd34a';g.font='700 14px sans-serif';g.fillText('PA',3,40);
  g.fillStyle='#16181c';g.font='700 40px Rajdhani, Arial Narrow, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,W/2+12,H/2+2);g.strokeStyle='#16181c';g.lineWidth=3;g.strokeRect(1.5,1.5,W-3,H-3);});}
function wheel7(r,w,sport){
  const k='wh'+r+w+sport;if(GEO7[k])return GEO7[k];
  const hw=w/2,ri=r*.66,rr=r*.64;
  const tire=lth([[ri,-hw*.92],[r-.05,-hw],[r-.012,-hw+.025],[r,-hw+.06],[r,hw-.06],[r-.012,hw-.025],[r-.05,hw],[ri,hw*.92]],32).rotateZ(Math.PI/2);
  const sh=new THREE.Shape();sh.absarc(0,0,rr,0,Math.PI*2,false);
  const n=sport?10:5;for(let i=0;i<n;i++){const a0=i/n*Math.PI*2+(sport?.1:.2),a1=(i+1)/n*Math.PI*2-(sport?.1:.2),h=new THREE.Path();
    h.moveTo(Math.cos(a0)*rr*.36,Math.sin(a0)*rr*.36);h.absarc(0,0,rr*.84,a0+.05,a1-.05,false);h.lineTo(Math.cos(a1)*rr*.36,Math.sin(a1)*rr*.36);h.absarc(0,0,rr*.36,a1,a0,true);sh.holes.push(h);}
  const rim=new THREE.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.008,bevelSegments:2,curveSegments:24}).rotateY(Math.PI/2).translate(hw*.55,0,0);
  const lip=new THREE.TorusGeometry(rr*.98,.014,8,40).rotateY(Math.PI/2).translate(hw*.62,0,0);
  const barrel=new THREE.CylinderGeometry(rr*.96,rr*.96,w*.8,28,1,true).rotateZ(Math.PI/2);
  const hub=new THREE.CylinderGeometry(rr*.2,rr*.22,.06,16).rotateZ(Math.PI/2).translate(hw*.6,0,0);
  const disc=new THREE.CylinderGeometry(rr*.78,rr*.78,.025,28).rotateZ(Math.PI/2).translate(hw*.1,0,0);
  const cal=new THREE.BoxGeometry(.06,rr*.5,rr*.32).translate(hw*.2,rr*.42,-rr*.25);
  return GEO7[k]={tire,rim,lip,barrel,hub,disc,cal};
}
function buildCarGeo(type){
  if(GEO7[type])return GEO7[type];
  const D=CAR7[type]||CAR7.sedan,G=D.gh,S=sampleBody(D),H=sampleGH(D);
  const body=loft(S,40,D.ne,(th,z,y)=>(Math.sin(th)<-.2||y<.42)?1:0,2);
  const bpz=G.pil;
  const gh=loft(H,36,D.ng,(th,z,y)=>{
    const c=Math.abs(Math.cos(th)),s=Math.sin(th);
    if(s<-.1)return 2;
    if(y<G.belt+.035)return 2;
    if(c<.5){if(z>G.zws+.02||z<G.zrw-.02)return (c>.42&&z>G.zws)?0:1;return 0;}
    if(c<.6&&z<=G.zws+.02&&z>=G.zrw-.02)return 2;
    if(z>G.zws-.04)return (Math.abs(z-G.zws)<.06||z>G.zf-.08)?0:1;
    if(z<G.zrw+.02)return G.rearGlass?(z<G.zr+.12?0:1):0;
    if(bpz.some(p=>Math.abs(z-p)<.05))return 2;
    if(y>G.roof-.06)return 0;
    return 1;
  },3);
  return GEO7[type]={D,S,H,body,gh};
}
let NPLATE=0;
makeCar=function(color,type){
  type=CAR7[type]?type:'sedan';
  const C=buildCarGeo(type),D=C.D,G=D.gh,S=C.S,ne=D.ne,bpz=G.pil,g=new THREE.Group(),ch=new THREE.Group();g.add(ch);
  const paint=paint7(color);
  const body=new THREE.Mesh(C.body,[paint,CM7.trim]);body.castShadow=true;body.receiveShadow=true;ch.add(body);
  const gh=new THREE.Mesh(C.gh,[paint,CM7.glass,CM7.trim]);gh.castShadow=true;ch.add(gh);
  const zF=S[0].z,zB=S[S.length-1].z,frontY=S[3].t-.1;
  /* plancher et habitacle */
  M(ch,new THREE.BoxGeometry(1.1,.36,zF-zB-.5),CM7.trim,0,.48,(zF+zB)/2,0,0,0,false);
  const seatZ=[(G.zws+G.zrw)/2+.25,(G.zws+G.zrw)/2-.55];
  [.36,-.36].forEach(x=>{M(ch,rbox(.44,.12,.46,.05),CM7.seat,x,G.belt-.33,seatZ[0],0,0,0,false);M(ch,rbox(.44,.58,.12,.05),CM7.seat,x,G.belt-.02,seatZ[0]-.26,-.18,0,0,false);
    if(!isSporty7(type)){M(ch,rbox(.44,.12,.46,.05),CM7.seat,x,G.belt-.33,seatZ[1],0,0,0,false);M(ch,rbox(.44,.52,.12,.05),CM7.seat,x,G.belt-.05,seatZ[1]-.26,-.15,0,0,false);}});
  M(ch,rbox(1.6,.16,.36,.06),CM7.trim,0,G.belt+.02,G.zf-.42,0,0,0,false);
  M(ch,new THREE.TorusGeometry(.17,.025,8,24),CM7.trim,.36,G.belt+.08,G.zf-.62,-.35,0,0,false);
  /* phares, feux, calandre */
  const rev=CM7.rev.clone(),tail=new THREE.MeshStandardMaterial({color:0x7a0a08,emissive:0xff1a10,emissiveIntensity:.35,roughness:.25,metalness:.2});
  [-1,1].forEach(sd=>{
    const hx=sd*(S[6].wb-.27),hy=frontY,hz=edgeZ(S,hx+sd*.15,hy,ne,true);
    M(ch,rbox(.44,.15,.2,.06),CM7.trim,hx,hy,hz-.04,0,0,0,false);
    M(ch,rbox(.36,.11,.06,.04),M7.chrome,hx,hy,hz+.03,0,0,0,false);
    [-.08,.08].forEach(o=>M(ch,new THREE.CylinderGeometry(.042,.042,.04,16).rotateX(Math.PI/2),CM7.head,hx+o,hy+.005,hz+.055,0,0,0,false));
    M(ch,rbox(.4,.022,.03,.01),CM7.head,hx,hy-.062,hz+.05,0,0,0,false);
    M(ch,rbox(.46,.16,.12,.06),CM7.lens,hx,hy,hz+.02,0,0,0,false);
    M(ch,rbox(.42,.012,.02,.006),CM7.head,hx,hy+.075,hz+.03,0,0,0,false);
    const ty=S[S.length-4].t-.1,tx=sd*(S[S.length-8].wb-.25),tz=edgeZ(S,tx+sd*.14,ty,ne,false);
    M(ch,rbox(.42,.14,.16,.05),CM7.trim,tx,ty,tz+.02,0,0,0,false);M(ch,rbox(.38,.11,.06,.04),tail,tx,ty,tz-.06,0,0,0,false);
    M(ch,rbox(.1,.03,.04,.012),rev,tx-sd*.1,ty-.04,tz-.08,0,0,0,false);
    /* rétroviseur */
    const ms=H7at(C.H,G.zf-.18),mx=sd*(surfX(ms,G.belt+.02,D.ng)+.1);
    M(ch,rbox(.12,.12,.2,.04),paint,mx,G.belt+.06,G.zf-.18,0,0,0,true);M(ch,new THREE.BoxGeometry(.01,.09,.15),M7.mirror,mx+sd*.06,G.belt+.06,G.zf-.18,0,0,0,false);
    /* poignées */
    [G.zws-.25,G.zws-.95].forEach((z,i)=>{if(isSporty7(type)&&i)return;const s=H7at(S,z),x=surfX(s,G.belt-.11,ne);if(x>0)M(ch,rbox(.03,.035,.17,.012),M7.chrome,sd*(x+.004),G.belt-.11,z,0,0,0,false);});
  });
    const gy=S[2].t*.5+.24,gz=edgeZ(S,0,gy,ne,true);
  M(ch,rbox(.82,.17,.08,.04),CM7.trim,0,gy,gz-.02,0,0,0,false);for(let i=0;i<3;i++)M(ch,new THREE.BoxGeometry(.76,.012,.02),M7.chrome,0,gy-.05+i*.05,gz+.01,0,0,0,false);
  const ly=.4,lz=edgeZ(S,0,ly,ne,true);M(ch,rbox(1.25,.1,.06,.03),CM7.trim,0,ly,lz-.01,0,0,0,false);
  const plate=tm(plateTex((100+(NPLATE++*37)%900)+' AU'),0xffffff,.4,0);
  const py=.5,pzF=edgeZ(S,0,py,ne,true),pzB=edgeZ(S,0,py+.05,ne,false);
  M(ch,new THREE.PlaneGeometry(.46,.12),plate,0,py,pzF+.012,0,0,0,false);M(ch,new THREE.PlaneGeometry(.46,.12),plate,0,py+.05,pzB-.012,0,Math.PI,0,false);
  M(ch,new THREE.CylinderGeometry(.04,.04,.14,12).rotateX(Math.PI/2),M7.chrome,-.55,.36,zB+.02,0,0,0,false);
  /* filets, joints de portes */
  ch.add(new THREE.Mesh(ribbonH(S,ne,G.belt-.025,.02,G.zf+.05,G.zr,.003),M7.chrome));
  const seams=[G.zf-.02,(isSporty7(type)?G.zrw-.15:bpz.length?bpz[0]:G.zrw)];if(!isSporty7(type)&&type!=='danfo')seams.push(G.zrw-.05);
  seams.forEach(z=>ch.add(new THREE.Mesh(ribbonV(S,ne,z,.44,G.belt-.04,.008,.002),CM7.trim)));
  /* options par type */
  if(type==='taxi'){M(ch,rbox(.62,.16,.3,.05),M7.white,0,G.roof+.09,(G.zws+G.zrw)/2,0,0,0,true);
    const tt=tm(ctex('taxis',256,64,(x,W,H)=>{x.fillStyle='#ffd400';x.fillRect(0,0,W,H);x.fillStyle='#111';x.font='700 44px Rajdhani, Arial Narrow, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('TAXI',W/2,H/2+2);}),0xffffff,.4,0,{emissive:0x664400,emissiveIntensity:.4});
    [1,-1].forEach(s=>M(ch,new THREE.PlaneGeometry(.56,.13),tt,0,G.roof+.09,(G.zws+G.zrw)/2+s*.152,0,s>0?0:Math.PI,0,false));
    ch.add(new THREE.Mesh(ribbonH(S,ne,.7,.07,zF-.3,zB+.3,.003),CM7.trim));}
  if(type==='danfo'){[.62,.98].forEach(y=>ch.add(new THREE.Mesh(ribbonH(S,ne,y,.07,zF-.2,zB+.1,.003),CM7.trim)));
    [-.7,.7].forEach(x=>M(ch,tube([[x,G.roof+.12,1.2],[x,G.roof+.12,-1.9]],.025,4,6),CM7.trim,0,0,0,0,0,0,false));
    for(let z=1.1;z>-1.9;z-=.5)M(ch,new THREE.BoxGeometry(1.44,.03,.04),CM7.trim,0,G.roof+.12,z,0,0,0,false);}
  if(isSporty7(type)){M(ch,rbox(1.5,.04,.32,.015),CM7.trim,0,G.deck+.24,zB+.3,0,0,0,true);
  M(ch,rbox(1.3,.07,.2,.03),CM7.trim,0,.27,zB+.18,0,0,0,false);[-.55,.55].forEach(x=>M(ch,new THREE.BoxGeometry(.04,.22,.12),CM7.trim,x,G.deck+.12,zB+.32,0,0,0,false));}
  if(type==='suv'){[-.68,.68].forEach(x=>M(ch,tube([[x,G.roof+.02,G.zws-.05],[x,G.roof+.07,G.zws-.25],[x,G.roof+.07,G.zrw+.25],[x,G.roof+.02,G.zrw+.05]],.022,12,6),M7.steel,0,0,0,0,0,0,false));}
  /* roues : pivot de direction + rotation */
  const W=D.wh,WG=wheel7(W.r,W.w,isSporty7(type));g.userData.wheels=[];g.userData.steer=[];
  [[1,W.z[0]],[-1,W.z[0]],[1,W.z[1]],[-1,W.z[1]]].forEach(([sd,z],i)=>{
    const st=G7(g,sd*W.x,W.r,z),rl=G7(st),inner=G7(rl,0,0,0,sd>0?0:Math.PI);
    M(inner,WG.tire,CM7.rubber);M(inner,WG.rim,CM7.rim);M(inner,WG.lip,CM7.rim,0,0,0,0,0,0,false);M(inner,WG.barrel,CM7.rimD,0,0,0,0,0,0,false);M(inner,WG.hub,CM7.rimD,0,0,0,0,0,0,false);
    const br=G7(st,0,0,0,sd>0?0:Math.PI);M(br,WG.disc,CM7.disc,0,0,0,0,0,0,false);M(br,WG.cal,isSporty7(type)?CM7.caliper:CM7.rimD,0,0,0,0,0,0,false);
    g.userData.wheels.push(rl);if(i<2)g.userData.steer.push(st);
  });
  g.userData.chassis=ch;g.userData.tail=tail;g.userData.rev=rev;g.userData.frontZ=zF;g.userData.backZ=zB;g.userData.lightY=frontY;
  return g;
};
function H7at(S,z){let s=S[0];S.forEach(q=>{if(Math.abs(q.z-z)<Math.abs(s.z-z))s=q;});return s;}
applyType=function(g,t){
  if(!hgm){const mat=(a,b)=>new THREE.SpriteMaterial({map:glowTex([[0,a],[.35,b],[1,'rgba(255,200,100,0)']]),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:0});
    hgm=mat('rgba(255,246,210,1)','rgba(255,230,160,.5)');tgm=mat('rgba(255,60,40,1)','rgba(255,40,30,.45)');}
  const u=g.userData;[[hgm,u.frontZ+.15,2.6],[tgm,u.backZ-.15,2.0]].forEach(a=>{const s=new THREE.Sprite(a[0]);s.position.set(0,u.lightY,a[1]);s.scale.set(a[2],.8,1);u.chassis.add(s);});
};
/* suspension, direction, feux stop */
const CAR7S={n:0};
function updateCars7(dt){
  const h=(gameMin/60)%24,s=Math.sin((h-6)/12*Math.PI),day=s>0?clamp(s*1.4,0,1):0,night=1-day;
  CM7.head.emissiveIntensity=.15+night*2.4*(1-wx.k.dark*0)+wx.k.dark*.8;
  const inp=player.car&&!panelOpen&&!chatOpen?getInput():{x:0,z:0};
  cars.forEach(c=>{
    const u=c.mesh.userData;if(!u.chassis)return;
    const vis=Math.abs(c.x-camera.position.x)<170&&Math.abs(c.z-camera.position.z)<170;c.mesh.visible=vis&&!(player.inside);if(!vis)return;
    const yr=angDiff(c.ph7==null?c.h:c.ph7,c.h)/Math.max(dt,1e-3);c.ph7=c.h;
    const acc=(c.v-(c.pv7==null?c.v:c.pv7))/Math.max(dt,1e-3);c.pv7=c.v;
    c.roll7=(c.roll7||0)+(clamp(-c.v*yr*.006,-.05,.05)-(c.roll7||0))*Math.min(1,6*dt);
    u.chassis.rotation.set(c.mesh.rotation.x*1.2,0,c.roll7);c.mesh.rotation.x=0;
    const steer=c===player.car?-inp.x*.5:clamp(yr*.5,-.5,.5);
    u.steer.forEach(st=>{st.rotation.y+=(steer-st.rotation.y)*Math.min(1,8*dt);});
    const braking=(acc<-3&&Math.abs(c.v)>.3)||(c===player.car&&(keys[' ']||(inp.z<-.05&&c.v>.5)))||(c.kind==='npc'&&c.v<.5);
    u.tail.emissiveIntensity=braking?2.6:.25+night*.9;u.rev.emissiveIntensity=c.v<-.3?2:0;
  });
}
