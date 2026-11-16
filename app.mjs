import {evaluate,csv,validate} from './model.mjs';
const $=id=>document.getElementById(id);
let study,results=[];
const fields={days:'Horizon (days)',demand:'Daily demand (units)',stock:'Initial stock (units)',orderQty:'Order quantity (units)',reorderPoint:'Reorder point (units)',holdingCost:'Holding cost / unit / day',shortageCost:'Penalty / lost unit',delayDays:'Disruption delay (days)',demandMultiplier:'Disruption demand multiplier'};
const fmt=v=>v==null?'N/A':Number(v).toLocaleString(undefined,{maximumFractionDigits:2});
function message(t){$('status').textContent=t;}
function download(name,text,type){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function populate(){ $('name').value=study.name;$('notes').value=study.notes||'';$('editor').value=JSON.stringify(study,null,2);$('fields').replaceChildren();
 for(const [k,label] of Object.entries(fields)){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type='number';input.min='0';input.step=['days','delayDays'].includes(k)?'1':'any';input.id=k;input.value=study[k];l.append(input);$('fields').append(l);}
}
function collect(){const next=structuredClone(study);next.name=$('name').value;next.notes=$('notes').value;for(const k of Object.keys(fields)){if($(k).value.trim()==='')throw Error(fields[k]+' is required.');next[k]=Number($(k).value);}validate(next);return next;}
function render(){
 const body=$('rows');body.replaceChildren();
 for(const r of results){const tr=document.createElement('tr');for(const v of [r.supplier,r.scenario,r.fillRate==null?'N/A':fmt(r.fillRate*100)+'%',fmt(r.lost),fmt(r.totalCost),fmt(r.endingStock),fmt(r.inTransit)]){const td=document.createElement('td');td.textContent=v;tr.append(td);}body.append(tr);}
 $('details').replaceChildren();results.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.supplier+' · '+r.scenario;$('details').append(o);});chart();
 $('count').textContent=results.length;$('horizon').textContent=study.days+' days';$('costnote').textContent='Costs use your declared currency and include purchases committed during the horizon.';
}
function chart(){const r=results[Number($('details').value)||0];const svg=$('chart');svg.replaceChildren();if(!r)return;
 const max=Math.max(1,...r.series.map(x=>x.stock));
 const ns='http://www.w3.org/2000/svg';const line=document.createElementNS(ns,'polyline');line.setAttribute('points',r.series.map((p,i)=>(10+i/Math.max(1,r.series.length-1)*780)+','+(180-p.stock/max*160)).join(' '));line.setAttribute('fill','none');line.setAttribute('stroke','#5ee0bc');line.setAttribute('stroke-width','3');svg.append(line);$('chartLabel').textContent=r.supplier+' / '+r.scenario+': end-of-day stock, peak '+fmt(max)+' units';
}
function run(){try{const next=collect();const nextResults=evaluate(next);study=next;results=nextResults;$('editor').value=JSON.stringify(study,null,2);render();message('Scenarios evaluated. Review assumptions before interpreting results.');}catch(e){results=[];$('rows').replaceChildren();$('chart').replaceChildren();$('count').textContent='0';message(e.message);}}
$('run').onclick=run;$('details').onchange=chart;
$('apply').onclick=()=>{try{const next=JSON.parse($('editor').value);validate(next);study=next;populate();run();}catch(e){message(e.message);}};
$('save').onclick=()=>{try{const next=collect();localStorage.setItem('researchos-supply-v1',JSON.stringify(next));message('Study saved in this browser. Export a backup.');}catch(e){message(e.message);}};
$('load').onclick=()=>{try{const raw=localStorage.getItem('researchos-supply-v1');if(!raw)throw Error('No saved study.');const next=JSON.parse(raw);validate(next);study=next;populate();run();}catch(e){message(e.message);}};
$('json').onclick=()=>{try{download('supply-study.json',JSON.stringify(collect(),null,2),'application/json');}catch(e){message(e.message);}};
$('csv').onclick=()=>{run();if(results.length)download('supply-results.csv',csv(results),'text/csv');};
$('report').onclick=()=>{run();if(results.length)download('supply-report.md','# '+study.name+'\n\n'+(study.notes||'')+'\n\n'+results.map(r=>'- '+r.supplier+' / '+r.scenario+': fill '+(r.fillRate==null?'N/A':fmt(r.fillRate*100)+'%')+', lost '+fmt(r.lost)+', modeled cost '+fmt(r.totalCost)).join('\n')+'\n\nSynthetic deterministic scenario model. No forecasts, probability estimates, or optimized sourcing recommendations. See docs/MODEL.md.','text/markdown');};
$('import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1000000)throw Error('Study exceeds 1 MB.');const next=JSON.parse(await f.text());validate(next);study=next;populate();run();}catch(err){message(err.message);}finally{e.target.value='';}};
try{study=await (await fetch('./example.json')).json();validate(study);populate();run();}catch(e){message('Unable to load example: '+e.message);}
