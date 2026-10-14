'use strict';
/* Progressive enhancement. No changes to the pedagogical widgets or original page scripts. */
(()=>{
const sidebar=document.querySelector('nav.snav');
if(!sidebar)document.body.classList.add('reader-no-sidebar');
const bar=document.createElement('div');
bar.className='reader-bar';bar.setAttribute('role','navigation');bar.setAttribute('aria-label','Barre de lecture');
const back=document.createElement('a');back.href='index.html#collection';back.className='reader-home';back.innerHTML='<span aria-hidden="true">←</span><span class="wordmark"> Bibliothèque des Idées</span>';back.setAttribute('aria-label','Retour à la collection');
const title=document.createElement('span');title.className='reader-bar-title';title.textContent=document.title.split('—')[0].trim();
const actions=document.createElement('div');actions.className='reader-tools';
function button(txt,label,id){const b=document.createElement('button');b.type='button';b.className='reader-tool';b.textContent=txt;b.setAttribute('aria-label',label);b.id=id;return b;}
const toc=button('☰','Ouvrir le sommaire','reader-toc');toc.classList.add('reader-mobile-nav');toc.setAttribute('aria-controls','reader-drawer');toc.setAttribute('aria-expanded','false');
if(!sidebar)toc.style.display='inline-grid';
const smaller=button('A−','Réduire les caractères','reader-smaller'),larger=button('A+','Agrandir les caractères','reader-larger');
const print=button('⎙','Imprimer cette fiche','reader-print');print.addEventListener('click',()=>window.print());
actions.append(toc,smaller,larger,print);bar.append(back,title,actions);document.body.insertBefore(bar,document.body.firstChild);
const overlay=document.createElement('div');overlay.className='reader-drawer-backdrop';overlay.id='reader-backdrop';overlay.hidden=true;
const drawer=document.createElement('div');drawer.className='reader-mobile-drawer';drawer.id='reader-drawer';drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');drawer.setAttribute('aria-label','Sommaire de la fiche');drawer.setAttribute('aria-hidden','true');
const dh=document.createElement('div');dh.className='drawer-header';
const dtitle=document.createElement('span');dtitle.textContent='Sommaire';
const close=button('✕','Fermer le sommaire','reader-close');dh.append(dtitle,close);
const nav=document.createElement('nav');nav.className='reader-drawer-nav';nav.setAttribute('aria-label','Sections de la fiche');
let anchors=sidebar?[...sidebar.querySelectorAll('a[href^="#"]')]:[];
if(!anchors.length){
 const sections=[...document.querySelectorAll('section')].filter(s=>s!==document.querySelector('section.hero'));
 sections.forEach((section,i)=>{if(!section.id)section.id='lecture-'+(i+1);const h=section.querySelector('h2,.section-title');const a=document.createElement('a');a.href='#'+section.id;a.textContent=h?h.textContent.trim():'Partie '+(i+1);anchors.push(a)});
 if(!anchors.length){const a=document.createElement('a');a.href='#haut';a.textContent='Introduction';anchors.push(a);}
}
for(const original of anchors){const a=document.createElement('a');a.href=original.getAttribute('href');a.textContent=original.textContent.trim();nav.appendChild(a);}
drawer.append(dh,nav);document.body.append(overlay,drawer);
let focusBefore=null;
function show(open){overlay.hidden=!open;overlay.classList.toggle('is-open',open);drawer.classList.toggle('is-open',open);drawer.setAttribute('aria-hidden',String(!open));toc.setAttribute('aria-expanded',String(open));document.body.classList.toggle('reader-drawer-open',open);if(open){focusBefore=document.activeElement;close.focus()}else{(focusBefore||toc).focus()}}
toc.addEventListener('click',()=>show(true));close.addEventListener('click',()=>show(false));overlay.addEventListener('click',()=>show(false));nav.addEventListener('click',e=>{if(e.target.closest('a'))show(false)});
document.addEventListener('keydown',e=>{if(!drawer.classList.contains('is-open'))return;if(e.key==='Escape'){e.preventDefault();show(false)}else if(e.key==='Tab'){const all=[...drawer.querySelectorAll('button,a')].filter(el=>!el.disabled);if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all[all.length-1].focus()}else if(!e.shiftKey&&document.activeElement===all[all.length-1]){e.preventDefault();all[0].focus()}}});
let size=16;try{const val=Number(localStorage.getItem('bibliotheque-reader-size'));if(Number.isInteger(val)&&val>=14&&val<=20)size=val}catch(e){}
function apply(){document.documentElement.style.fontSize=size+'px';smaller.disabled=size<=14;larger.disabled=size>=20}
function change(delta){size=Math.max(14,Math.min(20,size+delta));apply();try{localStorage.setItem('bibliotheque-reader-size',String(size))}catch(e){}}
smaller.addEventListener('click',()=>change(-1));larger.addEventListener('click',()=>change(1));apply();
if(!document.querySelector('#prog')){const progress=document.createElement('div');progress.className='reader-progress';progress.setAttribute('aria-hidden','true');document.body.appendChild(progress);let scheduled=false;function update(){scheduled=false;const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%'}document.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});window.addEventListener('resize',update);update()}
})();


/* Accessible navigation for the original clickable div accordions.
   Retains the individual fiche's toggleAcc() behavior. */
(()=>{
  const heads=[...document.querySelectorAll('.accordion .acc-head')];
  const update=(head)=>{
    const group=head.closest('.accordion');
    if(!group)return;
    for(const h of group.querySelectorAll('.acc-head')){
      const expanded=h.closest('.acc-item')?.classList.contains('open')||false;
      h.setAttribute('aria-expanded',String(expanded));
      const panel=h.parentElement.querySelector('.acc-body');
      if(panel){panel.setAttribute('aria-hidden',String(!expanded))}
    }
  };
  heads.forEach((head,i)=>{
    const panel=head.parentElement.querySelector('.acc-body');
    if(!panel)return;
    const id='reader-accordion-'+i;
    head.id=id+'-button';panel.id=id+'-panel';
    head.setAttribute('role','button');
    head.setAttribute('tabindex','0');
    head.setAttribute('aria-controls',panel.id);
    panel.setAttribute('role','region');panel.setAttribute('aria-labelledby',head.id);
    head.addEventListener('click',()=>update(head));
    head.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        head.click();
      }
    });
    update(head);
  });
  const cards=[...document.querySelectorAll('.concept-card[onclick]')];
  cards.forEach(card=>{
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    const sync=()=>card.setAttribute('aria-expanded',String(!!card.querySelector('.cc-expand.open')));
    card.addEventListener('click',sync);
    card.addEventListener('keydown',e=>{
      if(e.target!==card)return;
      if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click()}
    });
    sync();
  });
})();


/* Tables wider than a phone remain readable via horizontal scrolling,
   without forcing the entire document wider than its viewport. */
(()=>{
 for(const table of document.querySelectorAll('.sec table')){
   if(table.closest('.reading-table-scroll'))continue;
   const shell=document.createElement('div');
   shell.className='reading-table-scroll';
   shell.tabIndex=0;
   shell.setAttribute('role','region');
   shell.setAttribute('aria-label','Tableau défilant horizontalement');
   table.before(shell);
   shell.appendChild(table);
 }
})();
