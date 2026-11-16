(() => {
 'use strict';
 const projectKey=document.currentScript.dataset.projectKey;
 const kind=document.currentScript.dataset.kind;
 const api='https://www.zisto.app/api/cards?view=menu&project_key='+encodeURIComponent(projectKey);
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const localized=(n,lang)=>n[lang]||n.gr||n.en||'';
 const money=(cents,lang)=>new Intl.NumberFormat(lang==='en'?'en-IE':'el-GR',{style:'currency',currency:'EUR'}).format(cents/100);
 function fox(catalog){
  for(const screen of document.querySelectorAll('.screen')){
   const at=screen.id.lastIndexOf('-'),section=screen.id.slice(0,at),lang=screen.id.slice(at+1),items=screen.querySelector('.items');
   if(!items||!['gr','en'].includes(lang))continue;
   const decorations=new Map();let oldIndex=0;
   items.querySelectorAll('.dish').forEach(d=>{if(d.querySelector('.price'))decorations.set(section+'-'+oldIndex++,Array.from(d.querySelectorAll('h3 .icon')).map(n=>n.cloneNode(true)));});
   const fragment=document.createDocumentFragment(),bar=screen.querySelector('.category-bar');if(bar)bar.replaceChildren();
   for(const c of catalog.categories.filter(c=>c.section===section)){
    const anchor=c.id.replace(section+'-',section+'-'+lang+'-');
    const originalHeading=screen.querySelector('[id="'+anchor+'"]');
    const heading=originalHeading?.tagName==='H2'?originalHeading.cloneNode(true):el('h2',localized(c.names,lang));heading.id=anchor;fragment.append(heading);
    if(bar){const b=el('button',localized(c.names,lang));b.type='button';b.setAttribute('aria-controls',anchor);bar.append(b);}
    for(const p of catalog.products.filter(p=>p.category_id===c.id)){
     const dish=el('article',undefined,'dish');dish.dataset.productId=p.id;
     const line=el('div',undefined,'line'),title=el('h3',localized(p.names,lang));title.append(...(decorations.get(p.id)||[]));
     line.append(title,el('span',p.prices.map(v=>money(v.cents,lang)).join(' / '),'price'));dish.append(line);
     const desc=localized(p.descriptions,lang);if(desc)dish.append(el('p',desc));fragment.append(dish);
    }
   }
   items.replaceChildren(fragment);
  }
  window.dispatchEvent(new Event('hashchange'));
 }
 function bilingual(n,cls){const span=el('span',undefined,cls);span.append(el('span',localized(n,'gr'),'el-text'),el('span',localized(n,'en'),'en-text'));return span;}
 function myrsini(catalog){
  document.querySelectorAll('.item').forEach(n=>n.remove());
  for(const c of catalog.categories){const heading=document.getElementById(c.id);if(!heading)continue;let last=heading;
   for(const p of catalog.products.filter(p=>p.category_id===c.id)){
    const item=el('div',undefined,'item'),row=el('div',undefined,'item-row');row.append(bilingual(p.names,'name'),el('span',p.prices.map(v=>money(v.cents,'gr')).join(' / '),'price'));item.append(row);
    if(localized(p.descriptions,'gr')||localized(p.descriptions,'en'))item.append(bilingual(p.descriptions,'desc'));
    last.after(item);last=item;
   }
  }
 }
 window.ZistoMenuReady=(async()=>{
  const key='zisto-menu:'+projectKey;let data;
  try{const r=await fetch(api,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('menu');data=await r.json();try{localStorage.setItem(key,JSON.stringify(data));}catch{}}
  catch{try{data=JSON.parse(localStorage.getItem(key));}catch{}}
  if(!Array.isArray(data?.catalog?.products)||!Array.isArray(data.catalog.categories))return;
  const catalog=data.catalog;window.ZistoMenu=catalog;
  if(kind==='myrsini')myrsini(catalog);else fox(catalog);
  return catalog;
 })();
})();
