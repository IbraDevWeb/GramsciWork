'use strict';
(()=>{const controls=document.createElement('div');controls.className='reader-tools';controls.setAttribute('role','group');controls.setAttribute('aria-label','Options de lecture');
controls.innerHTML='<a href="index.html" title="Retour à la bibliothèque" aria-label="Retour à la bibliothèque">← Collection</a><button type="button" id="font-smaller" aria-label="Réduire la taille des caractères">A−</button><button type="button" id="font-larger" aria-label="Augmenter la taille des caractères">A+</button>';
document.body.appendChild(controls);
let size=16;try{const n=Number(localStorage.getItem('serments-font'));if(Number.isFinite(n)&&n>=14&&n<=20)size=n}catch(e){}
const apply=()=>{document.documentElement.style.fontSize=size+'px';document.getElementById('font-smaller').disabled=size<=14;document.getElementById('font-larger').disabled=size>=20};
document.getElementById('font-smaller').addEventListener('click',()=>{size=Math.max(14,size-1);apply();save()});
document.getElementById('font-larger').addEventListener('click',()=>{size=Math.min(20,size+1);apply();save()});
function save(){try{localStorage.setItem('serments-font',String(size))}catch(e){}}
apply();
})();