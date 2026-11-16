export function validate(s) {
 if (!s || s.version!==1 || typeof s.name!=='string' || !s.name.trim()) throw Error('Study needs a name and version 1.');
 for (const k of ['days','demand','stock','orderQty','reorderPoint','holdingCost','shortageCost','delayDays','demandMultiplier'])
  if(typeof s[k]!=='number'||!Number.isFinite(s[k])||s[k]<0) throw Error(k+' must be a finite nonnegative number.');
 if(!Number.isInteger(s.days)||s.days<1||s.days>3650||!Number.isInteger(s.delayDays)||s.delayDays>3650) throw Error('Days must be whole numbers; horizon 1–3650.');
 if(s.demandMultiplier>1000) throw Error('Demand multiplier must be at most 1000.');
 if(!Array.isArray(s.suppliers)||!s.suppliers.length||s.suppliers.length>30) throw Error('Use 1–30 suppliers.');
 const ids=new Set();
 for(const p of s.suppliers) {
  if(typeof p.name!=='string'||!p.name.trim()||ids.has(p.name)) throw Error('Supplier names must be unique and nonempty.');
  ids.add(p.name);
  for(const k of ['leadDays','unitCost','orderCost','capacity']) if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<0) throw Error(p.name+': invalid '+k);
  if(!Number.isInteger(p.leadDays)||p.leadDays<1||p.leadDays>3650) throw Error('Lead time must be 1–3650 whole days.');
 }
 return s;
}
export function simulate(study,supplier,stress=false) {
 validate(study);
 if(!study.suppliers.includes(supplier)) throw Error('Supplier must belong to study.');
 const demand=study.demand*(stress?study.demandMultiplier:1);
 const lead=supplier.leadDays+(stress?study.delayDays:0);
 let stock=study.stock,fulfilled=0,lost=0,purchase=0,holding=0,shortage=0,orders=0;
 const pending=[],series=[];
 for(let day=1;day<=study.days;day++){
  for(let i=pending.length-1;i>=0;i--)if(pending[i].due===day){stock+=pending[i].qty;pending.splice(i,1);}
  const served=Math.min(stock,demand),missed=demand-served;
  stock-=served;fulfilled+=served;lost+=missed;
  holding+=stock*study.holdingCost;shortage+=missed*study.shortageCost;
  const position=stock+pending.reduce((a,p)=>a+p.qty,0);
  let ordered=0;
  if(position<=study.reorderPoint){ordered=Math.min(study.orderQty,supplier.capacity);if(ordered>0){pending.push({due:day+lead,qty:ordered});purchase+=ordered*supplier.unitCost+supplier.orderCost;orders++;}}
  series.push({day,stock,served,lost:missed,ordered});
 }
 const result={supplier:supplier.name,scenario:stress?'Disruption':'Baseline',demand:demand*study.days,fulfilled,lost,fillRate:demand===0?null:fulfilled/(demand*study.days),endingStock:stock,inTransit:pending.reduce((a,p)=>a+p.qty,0),purchaseCost:purchase,holdingCost:holding,shortageCost:shortage,totalCost:purchase+holding+shortage,orders,series};
 if(Object.values(result).some(v=>typeof v==='number'&&!Number.isFinite(v)))throw Error('Inputs produce non-finite results; reduce magnitudes.');
 return result;
}
export function evaluate(s){validate(s);return s.suppliers.flatMap(p=>[simulate(s,p),simulate(s,p,true)]);}
export function csv(rows){
 const columns=['supplier','scenario','demand','fulfilled','lost','fillRate','endingStock','inTransit','purchaseCost','holdingCost','shortageCost','totalCost','orders'];
 const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
 return [columns,...rows.map(r=>columns.map(k=>r[k]))].map(row=>row.map(cell).join(',')).join('\r\n');
}
