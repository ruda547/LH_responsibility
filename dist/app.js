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
    const hour=(($('shift').value==='night'?17:5)+offset)%24;
    return {id:`${task.id}:slot-${index}`,label:`${String(hour).padStart(2,'0')}:30`,offset};
  });
}
function matchesMode(slot){return mode==='all'||(mode==='pending'?!status(slot.id):status(slot.id)==='ng');}
const $ = id=>document.getElementById(id);
let category='all', mode='all', records={}, editingTask=null, storageAvailable=true;
const today = new Date();
$('date').value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
function storageKey(){return `lh-prototype-v1:${$('supervisor').value}:${$('date').value}:${$('shift').value}`;}
function validDate(){return /^\d{4}-\d{2}-\d{2}$/.test($('date').value);}
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
  $('category-subtitle').textContent=category==='all'?'Every control point across your shift':'Control points drafted from your daily check sheet';
  const query=$('search').value.trim().toLowerCase();
  const shown=tasks.filter(t=>(category==='all'||t.category===category)&&slots(t).some(matchesMode)&&t.name.toLowerCase().includes(query));
  $('checks').replaceChildren();
  if(!shown.length)$('checks').append(element('div','empty','No checks match this view. Try another filter.'));
  shown.forEach(t=>{
    const row=element('article','scheduled-task');
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
    summary.append(element('span',`priority p${t.priority}`,`P${t.priority}`),element('span',passed===t.frequency?'task-complete':'task-fraction',`${passed}/${t.frequency} OK`),element('small','',`${recorded}/${t.frequency} recorded`));
    top.append(description,summary);
    const timeline=element('div','slot-grid');
    taskSlots.filter(matchesMode).forEach(slot=>{
      const box=element('div',`time-slot ${status(slot.id)||'pending'}`);
      const slotTop=element('div','slot-heading');
      slotTop.append(element('strong','',slot.label));
      const note=element('button',`note-button ${records[slot.id]?.note?'has-note':''}`,records[slot.id]?.note?'▣':'▢');
      note.type='button';note.title=records[slot.id]?.note?'Edit note':'Add note';note.setAttribute('aria-label',`Notes for ${t.name} at ${slot.label}`);
      note.addEventListener('click',()=>{editingTask=slot.id;$('note-title').textContent=`${t.name} · ${slot.label}`;$('note').value=typeof records[slot.id]?.note==='string'?records[slot.id].note:'';$('note-dialog').showModal();});
      slotTop.append(note);
      const results=element('div','status-buttons');
      ['ok','ng'].forEach(result=>{
        const button=element('button',`${result} ${status(slot.id)===result?'on':''}`,result.toUpperCase());
        button.type='button';button.setAttribute('aria-label',`${t.name} at ${slot.label}: ${result.toUpperCase()}`);button.setAttribute('aria-pressed',String(status(slot.id)===result));
        button.addEventListener('click',()=>{if(!validDate()){$('date').reportValidity();return;}records[slot.id]={...records[slot.id],status:status(slot.id)===result?null:result,updatedAt:new Date().toISOString()};save();});
        results.append(button);
      });
      box.append(slotTop,results,element('small','slot-state',status(slot.id)==='ok'?'✓ Passed':status(slot.id)==='ng'?'! Needs attention':'Awaiting check'));
      timeline.append(box);
    });
    row.append(top,timeline);$('checks').append(row);
  });
}
for(const id of ['supervisor','date','shift'])$(id).addEventListener('change',()=>{if(!validDate()){$('date').reportValidity();return;}load();});
$('search').addEventListener('input',render);
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render();}));
$('save-note').addEventListener('click',()=>{if(!editingTask)return;records[editingTask]={...records[editingTask],note:$('note').value,updatedAt:new Date().toISOString()};save();$('note-dialog').close();});
$('export').addEventListener('click',()=>{
  // Neutralize spreadsheet formulas in free-text fields before CSV export.
  const quote=value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const rows=[['Supervisor','Date','Shift','Category','Control point','Draft priority','Scheduled time (draft)','Result','Note','Updated at'],...tasks.flatMap(t=>slots(t).map(slot=>[$('supervisor').selectedOptions[0].text,$('date').value,$('shift').selectedOptions[0].text,categories.find(c=>c.id===t.category).name,t.name,t.priority,slot.label,status(slot.id)?.toUpperCase()||'Pending',records[slot.id]?.note||'',records[slot.id]?.updatedAt||'']))];
  const blob=new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`LH-checklist-${$('supervisor').value}-${$('date').value}-${$('shift').value}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
load();
