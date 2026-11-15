const categories = [
  { id:'all', name:'All responsibilities', icon:'▦' },
  { id:'people', name:'People management', icon:'♧' },
  { id:'material', name:'Material management', icon:'▤' },
  { id:'machine', name:'3R6S & machine checks', icon:'⚙' },
  { id:'quality', name:'Quality management', icon:'◇' },
  { id:'production', name:'Production performance', icon:'↗' }
];
const taskData = [
 ['people',1,'Shift change'],
 ['people',1,'Attendance file, ADP & email review'],
 ['people',2,'Daily SOP / OP training'],
 ['people',3,'Verify additional assigned tasks'],
 ['material',1,'Reservation tray status check'],
 ['material',2,'Cell rework & reinput readiness — EOL'],
 ['material',2,'WIP stock control in MES — EOL'],
 ['material',3,'Pallet stock area management'],
 ['material',1,'Raw material status check'],
 ['material',1,'WIP stock control in MES — JIG / CDC'],
 ['material',2,'Aging rack status control'],
 ['material',3,'Cell rework & reinput readiness — JIG / CDC'],
 ['machine',1,'Production startup: cleaning & parameters'],
 ['machine',3,'3R6S area patrol'],
 ['quality',1,'Yield & defect ratio review'],
 ['quality',2,'PQC on EOL status check'],
 ['quality',2,'MES measurement — EOL line'],
 ['quality',2,'MES measurement — DEGAS line'],
 ['quality',3,'Error-proofing execution & results by CL'],
 ['quality',2,'Appearance inspection after JIG'],
 ['quality',3,'Formation area temperature check'],
 ['production',1,'Daily & hourly production performance'],
 ['production',2,'Machine PPM status check'],
 ['production',3,'Morning meeting & report preparation'],
 ['production',1,'Reservation tray status check'],
 ['production',3,'MES downtime monitoring'],
 ['production',2,'JIG & CDC status and time check']
];
// Draft frequencies from the photo; exact scheduled hours require confirmation.
const frequencies = [1,1,2,3,6,3,3,1,1,6,2,2,2,1,12,2,3,3,1,1,3,12,1,1,6,2,1];
const tasks = taskData.map(([category,priority,name],i)=>({id:`check-${i+1}`,category,priority,name,frequency:frequencies[i]}));
function slots(task){
  return Array.from({length:task.frequency},(_,index)=>{
    const offset=Math.floor(index*12/task.frequency);
    const hour=((active.shift==='night'?18:6)+offset)%24;
    return {id:`${task.id}:slot-${index}`,label:`${String(hour).padStart(2,'0')}:00`,offset};
  });
}
function scheduledEntries(){return tasks.flatMap(t=>slots(t).map(slot=>({task:t,slot}))).sort((a,b)=>a.slot.offset-b.slot.offset);}
function matchesMode(slot){return mode==='all'||(mode==='pending'?!status(slot.id):status(slot.id)==='ng');}
const $ = id=>document.getElementById(id);
let category='all', mode='all', records={}, editingTask=null, storageAvailable=true;
let active=shiftAt();
function storageKey(){return shiftKey(active);}
function readRecords(context){try{const data=JSON.parse(localStorage.getItem(shiftKey(context))||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch{return {};}}
function refreshShift(){
 const current=shiftAt();
 if(shiftKey(current)!==shiftKey(active)){
  active=current; editingTask=null; $('note-dialog').close();load();return true;
 }
 return false;
}
function load(){
  try {const saved=JSON.parse(localStorage.getItem(storageKey())||'{}');records=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};storageAvailable=true;}
  catch{records={};storageAvailable=false;}
  render();
}
function save(){
  try{localStorage.setItem(storageKey(),JSON.stringify(records));storageAvailable=true;}
  catch{storageAvailable=false;}
  render();
}
function status(id){const value=records[id]?.status;return value==='ok'||value==='ng'?value:null;}
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function render(){
  $('active-crew').textContent=active.crew;
  $('active-shift').textContent=active.shift==='day'?'Day · 06:00–18:00':'Night · 18:00–06:00';
  $('active-date').textContent=active.date;
  $('clock-note').textContent=`Automatic crew and shift · Device timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone} · Overnight checks stay with the night shift’s start date.`;
  const scheduled=tasks.flatMap(slots);
  const ok=scheduled.filter(slot=>status(slot.id)==='ok').length;
  const ng=scheduled.filter(slot=>status(slot.id)==='ng').length;
  const complete=ok+ng, percent=Math.round(complete/scheduled.length*100);
  $('completion').replaceChildren(document.createTextNode(percent),element('small','', '%'));
  $('ok-count').textContent=ok;$('ng-count').textContent=ng;$('pending-count').textContent=scheduled.length-complete;
  $('completed-count').textContent=`${complete} of ${scheduled.length} scheduled checks recorded`;
  $('progress').style.width=percent+'%';$('total').textContent=tasks.length;
  $('save').textContent=storageAvailable?'○ Saved in this browser':'⚠ Browser storage unavailable — entries are temporary';
  $('categories').replaceChildren();
  categories.forEach(c=>{
    const count=tasks.filter(t=>c.id==='all'||t.category===c.id).length;
    const button=element('button',c.id===category?'active':'');button.type='button';button.setAttribute('aria-pressed',String(c.id===category));
    button.append(element('span','cat-icon',c.icon),element('span','',c.name),element('span','cat-count',count));
    button.addEventListener('click',()=>{category=c.id;render();});$('categories').append(button);
  });
  document.querySelectorAll('[data-mode]').forEach(button=>{button.classList.toggle('selected',button.dataset.mode===mode);button.setAttribute('aria-pressed',String(button.dataset.mode===mode));});
  const cat=categories.find(c=>c.id===category);
  $('category-title').textContent=cat.name;
  $('category-subtitle').textContent=category==='all'?'Scheduled checks · earliest first':'Category checks · earliest first';
  const query=$('search').value.trim().toLowerCase();
  const shown=scheduledEntries().filter(({task:t,slot})=>(category==='all'||t.category===category)&&matchesMode(slot)&&t.name.toLowerCase().includes(query));
  $('checks').replaceChildren();
  if(!shown.length)$('checks').append(element('div','empty','No checks match this view. Try another filter.'));
  shown.forEach(({task:t,slot:occurrence})=>{
    const row=element('article','scheduled-task chronological-task');row.dataset.slotId=occurrence.id;row.dataset.offset=String(occurrence.offset);
    const top=element('div','task-heading');
    const description=element('div','check-name',t.name);
    const taskSlots=slots(t), passed=taskSlots.filter(slot=>status(slot.id)==='ok').length;
    const recorded=taskSlots.filter(slot=>status(slot.id)).length;
    const meta=element('div','check-meta',`${categories.find(c=>c.id===t.category).name} · ${t.frequency} ${t.frequency===1?'time':'times'} per shift · Draft timing`);
    if(status(t.id)||records[t.id]?.note){
      const legacy=element('div','legacy-result',`Earlier single entry: ${status(t.id)?.toUpperCase()||'Note only'}${records[t.id]?.note?' — '+records[t.id].note:''}. Kept for reference; time slots require individual results.`);
      description.append(legacy);
    }
    description.append(meta);
    const summary=element('div','task-summary');
    summary.append(element('span',passed===t.frequency?'task-complete':'task-fraction',`${passed}/${t.frequency} OK`),element('small','',`${recorded}/${t.frequency} recorded`));
    top.append(description,summary);
    const timeline=element('div','slot-grid');
    [occurrence].forEach(slot=>{
      const box=element('div',`time-slot ${status(slot.id)||'pending'}`);
      const slotTop=element('div','slot-heading');
      slotTop.append(element('strong','',slot.label));
      const note=element('button',`note-button ${records[slot.id]?.note?'has-note':''}`,records[slot.id]?.note?'▣':'▢');
      note.type='button';note.title=records[slot.id]?.note?'Edit note':'Add note';note.setAttribute('aria-label',`Notes for ${t.name} at ${slot.label}`);
      note.addEventListener('click',()=>{refreshShift();editingTask=slot.id;$('note-title').textContent=`${t.name} · ${slot.label}`;$('note').value=typeof records[slot.id]?.note==='string'?records[slot.id].note:'';$('note-dialog').showModal();});
      slotTop.append(note);
      const results=element('div','status-buttons');
      ['ok','ng'].forEach(result=>{
        const button=element('button',`${result} ${status(slot.id)===result?'on':''}`,result.toUpperCase());
        button.type='button';button.setAttribute('aria-label',`${t.name} at ${slot.label}: ${result.toUpperCase()}`);button.setAttribute('aria-pressed',String(status(slot.id)===result));
        button.addEventListener('click',()=>{refreshShift();records[slot.id]={...records[slot.id],status:status(slot.id)===result?null:result,updatedAt:new Date().toISOString(),crew:active.crew,shift:active.shift,shiftDate:active.date};save();});
        results.append(button);
      });
      box.append(slotTop,results,element('small','slot-state',status(slot.id)==='ok'?'✓ Passed':status(slot.id)==='ng'?'! Needs attention':'Awaiting check'));
      timeline.append(box);
    });
    row.append(top,timeline);$('checks').append(row);
  });
}

$('search').addEventListener('input',render);
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render();}));
$('save-note').addEventListener('click',()=>{if(refreshShift()||!editingTask)return;records[editingTask]={...records[editingTask],note:$('note').value,updatedAt:new Date().toISOString(),crew:active.crew,shift:active.shift,shiftDate:active.date};save();$('note-dialog').close();});
$('export').addEventListener('click',()=>{
  refreshShift();
  // Neutralize spreadsheet formulas in free-text fields before CSV export.
  const quote=value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const rows=[['Crew','Shift start date','Shift','Category','Control point','Scheduled time (draft)','Result','Note','Updated at'],...scheduledEntries().map(({task:t,slot})=>[active.crew,active.date,active.shift,categories.find(c=>c.id===t.category).name,t.name,slot.label,status(slot.id)?.toUpperCase()||'Pending',records[slot.id]?.note||'',records[slot.id]?.updatedAt||''])];
  const blob=new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`LH-checklist-${active.crew}-${active.date}-${active.shift}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

function shiftStats(date,shift){
 const crew=crewFor(date,shift), data=readRecords({date,shift,crew}), ids=tasks.flatMap(t=>Array.from({length:t.frequency},(_,i)=>`${t.id}:slot-${i}`));
 const ok=ids.filter(id=>data[id]?.status==='ok').length,ng=ids.filter(id=>data[id]?.status==='ng').length;
 const start=new Date(date+'T'+(shift==='day'?'06':'18')+':00:00'),end=new Date(start);end.setHours(end.getHours()+12);
 const now=new Date(), state=now<start?'Upcoming':now>=end?'Finished':'In progress';
 return {crew,data,ok,ng,total:ids.length,recorded:ok+ng,state};
}
function renderSummary(){
 const date=$('summary-date').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
 const day=shiftStats(date,'day'),night=shiftStats(date,'night'),both=[day,night];
 $('summary-totals').replaceChildren();
 [['Recorded checks',both.reduce((n,s)=>n+s.recorded,0)],['Checks passed',day.ok+night.ok],['Needs attention',day.ng+night.ng],['Scheduled checks',day.total+night.total]].forEach(([label,value])=>{const card=element('article');card.append(element('div','stat-label',label),element('div','stat-value',value));$('summary-totals').append(card);});
 $('shift-summaries').replaceChildren();$('summary-issues').replaceChildren();
 ['day','night'].forEach((shift,index)=>{
  const stats=both[index],card=element('article','shift-summary');
  card.append(element('div','eyebrow',`${shift.toUpperCase()} SHIFT · ${stats.state}`),element('h2','',`Crew ${stats.crew}`),element('p','',shift==='day'?'06:00–18:00':'18:00–06:00 next day'),element('strong','',`${stats.recorded} / ${stats.total} checks recorded`),element('p','',`${stats.ok} OK · ${stats.ng} NG · ${stats.total-stats.recorded} ${stats.state==='Upcoming'?'scheduled':'remaining'}`));
  $('shift-summaries').append(card);
  tasks.forEach(t=>Array.from({length:t.frequency},(_,i)=>{
   const r=stats.data[`${t.id}:slot-${i}`];if(r?.status!=='ng')return;
   const time=String(((shift==='day'?6:18)+Math.floor(i*12/t.frequency))%24).padStart(2,'0')+':00';
   const item=element('div','summary-issue');item.append(element('strong','',`${stats.crew} · ${time} · ${t.name}`),element('p','',r.note||'No follow-up note recorded.'));$('summary-issues').append(item);
  }));
 });
 if(!$('summary-issues').children.length)$('summary-issues').append(element('div','empty','No NG results recorded for this shift date.'));
 $('rotation-body').replaceChildren();
 for(let i=0;i<14;i++){
  const d=calendarOffset(date,i),a=shiftStats(d,'day'),b=shiftStats(d,'night'),row=element('tr');
  const cell=element('td'),button=element('button','date-link',d);button.type='button';button.addEventListener('click',()=>{$('summary-date').value=d;renderSummary();});cell.append(button);row.append(cell);
  [a.crew,b.crew,`${a.recorded+b.recorded} / ${a.total+b.total}`,a.ok+b.ok,a.ng+b.ng].forEach(value=>row.append(element('td','',value)));$('rotation-body').append(row);
 }
}
function showWorkspace(){
 const summary=location.hash==='#summary';
 $('checklist-page').hidden=summary;$('summary-page').hidden=!summary;
 $('nav-checklist').classList.toggle('active',!summary);$('nav-summary').classList.toggle('active',summary);
 $('nav-checklist').setAttribute('aria-current',summary?'false':'page');$('nav-summary').setAttribute('aria-current',summary?'page':'false');
 $('page-name').textContent=summary?'Summary':'Daily checklist';if(summary)renderSummary();
}
$('summary-date').value=active.date;
$('summary-date').addEventListener('change',renderSummary);
window.addEventListener('hashchange',showWorkspace);
window.addEventListener('focus',()=>{refreshShift();showWorkspace();});
window.addEventListener('storage',()=>{load();showWorkspace();});
setInterval(()=>{refreshShift();if(location.hash==='#summary')renderSummary();},30000);
load();showWorkspace();
