'use strict';
(()=>{const root=document.documentElement;
const toggle=document.getElementById('theme-toggle'),themeLabel=document.getElementById('theme-label');
let remembered='';try{remembered=localStorage.getItem('bibliotheque-theme')||''}catch(e){}
function applyTheme(dark){root.dataset.theme=dark?'dark':'light';toggle.setAttribute('aria-pressed',String(dark));themeLabel.textContent=dark?'Mode clair':'Mode sombre'}
applyTheme(remembered==='dark');
toggle.addEventListener('click',()=>{const dark=root.dataset.theme!=='dark';applyTheme(dark);try{localStorage.setItem('bibliotheque-theme',dark?'dark':'light')}catch(e){}});
const nav=document.getElementById('main-nav'),menu=document.getElementById('mobile-toggle');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open))});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false')}));
const search=document.getElementById('search'),filters=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('.card')],count=document.getElementById('count'),empty=document.getElementById('empty');let active='tous';
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
function update(){const query=normalize(search.value.trim());let shown=0,ready=0;for(const card of cards){const visible=(active==='tous'||card.dataset.category===active)&&normalize(card.textContent).includes(query);card.hidden=!visible;if(visible){shown++;if(card.dataset.ready==='1')ready++}}
count.textContent=shown+' entrée'+(shown===1?'':'s')+' · '+ready+' disponible'+(ready===1?'':'s');empty.hidden=shown!==0}
filters.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update()}));
search.addEventListener('input',update);update();
})();