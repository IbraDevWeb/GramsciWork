import {chromium} from 'playwright';
import {resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
const pages=[
 'baudrillard-societe-consommation.html','bauman-amour-liquide.html',
 'bourdieu-television.html','dardot-laval-nouvelle-raison.html',
 'debord-societe-du-spectacle.html','durkheim-division-travail-social.html',
 'foucault-archeologie-du-savoir.html','gramsci-hegemonie.html',
 'laboetie-servitude-volontaire.html','machiavel-le-prince.html',
 'weber-ethique-protestante.html','le-prix-des-serments.html','index.html'
];
const results=[];
const problems=[];
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
function luminance(rgb){const a=rgb.map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722}
const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const color=str=>{const nums=(str.match(/[\d.]+/g)||[]).map(Number);return nums.slice(0,3)};
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  for(const filename of pages){
   const page=await context.newPage();
   const name=filename.replace('.html','');
   try{
    await page.goto('file://'+resolve(filename),{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(150);
    const title=await page.title();
    if(!title)throw Error('Missing document title');
    const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-innerWidth);
    if(overflow>12){
      const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(el=>({el,rect:el.getBoundingClientRect()}))
         .filter(o=>{const cs=getComputedStyle(o.el);return o.rect.width>0&&o.rect.height>0&&cs.position!=='fixed'&&cs.visibility!=='hidden'&&(o.rect.right>innerWidth+12||o.rect.left< -12)})
         .sort((a,b)=>b.rect.right-a.rect.right)
         .slice(0,12).map(o=>({tag:o.el.tagName.toLowerCase(),cls:typeof o.el.className==='string'?o.el.className.slice(0,90):'',id:o.el.id,parent:o.el.parentElement?.className,outer:o.el.outerHTML.slice(0,120),ancestors:[o.el.parentElement,o.el.parentElement?.parentElement,o.el.parentElement?.parentElement?.parentElement].map(e=>e?.tagName.toLowerCase()+'.'+(typeof e?.className==='string'?e.className:'')),rect:{left:Math.round(o.rect.left),right:Math.round(o.rect.right),width:Math.round(o.rect.width)}})));
      problems.push(filename+' '+viewport.width+'px: horizontal overflow '+overflow.toFixed(0)+'px; offenders='+JSON.stringify(offenders));
    }
    const acc=page.locator('.accordion .acc-head');
    const accordionCount=await acc.count();
    if(accordionCount){
      const first=acc.first();
      await first.scrollIntoViewIfNeeded();
      const info=await first.evaluate(el=>{
       const item=el.closest('.acc-item');
       const title=el.querySelector('.acc-title');
       return {text:title?.innerText?.trim()||'',background:getComputedStyle(item).backgroundColor,
         foreground:getComputedStyle(title).color,area:item.getBoundingClientRect().toJSON()};
      });
      if(!info.text)throw Error('Accordion heading text missing');
      const contrast=ratio(color(info.foreground),color(info.background));
      if(contrast<4.5)throw Error('Accordion contrast '+contrast.toFixed(2)+' ('+info.foreground+' on '+info.background+')');
      if(info.area.width<130||info.area.height<35)throw Error('Accordion dimension invalid');
      await first.click();
      if(!await first.getAttribute('aria-expanded')||await first.getAttribute('aria-expanded')!=='true')throw Error('Accordion aria-expanded does not update');
      const content=await first.evaluate(el=>{
       const item=el.closest('.acc-item'),inner=item.querySelector('.acc-inner'),body=item.querySelector('.acc-body');
       return {opened:item.classList.contains('open'),text:inner?.innerText?.trim(),foreground:inner?getComputedStyle(inner).color:'',
         background:getComputedStyle(item).backgroundColor,maxHeight:getComputedStyle(body).maxHeight}
      });
      if(!content.opened||!content.text)throw Error('Accordion expansion does not reveal content');
      const innerContrast=ratio(color(content.foreground),color(content.background));
      if(innerContrast<4.5)throw Error('Accordion expanded body contrast '+innerContrast.toFixed(2));
      if(content.maxHeight!=='none')throw Error('Expanded accordion content is still height-clipped: '+content.maxHeight);
      if(filename==='debord-societe-du-spectacle.html'){
        await page.screenshot({path:'qa-screenshots/debord-'+viewport.width+'.png',fullPage:false});
      }
      await first.press('Enter');
      if(await first.getAttribute('aria-expanded')!=='false')throw Error('Keyboard Enter did not close accordion');
    }
    if(filename==='index.html'){
      const search=page.locator('#search');
      await search.fill('Gramsci');
      const visible=await page.locator('.card:visible').count();
      if(visible!==1)throw Error('Search Gramsci expected 1 result, got '+visible);
    }else if(filename==='le-prix-des-serments.html'){
      if(await page.locator('#timelineList .timeline-btn').count()<6)throw Error('Timeline unavailable');
      if(await page.locator('.concept-toggle').count()!==6)throw Error('Concept list incomplete');
    }
    results.push('PASS '+filename+' '+viewport.width+'px'+(accordionCount?' accordions:'+accordionCount:''));
   }catch(e){problems.push(filename+' '+viewport.width+'px: '+e.message);
    try{await page.screenshot({path:'qa-screenshots/FAIL-'+name+'-'+viewport.width+'.png',fullPage:false})}catch(e){}
   }finally{await page.close()}
  }
  await context.close();
 }
}finally{await browser.close()}
console.log(results.join('\n'));
if(problems.length){console.error('FAILURES:\n'+problems.join('\n'));process.exitCode=1}
else console.log('PASS: all desktop/mobile readability checks');
