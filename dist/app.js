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
const tasks = taskData.map(([category,priority,name],i)=>({id:`check-${i+1}`,category,priority,name}));
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
  const ok=tasks.filter(t=>status(t.id)==='ok').length;
  const ng=tasks.filter(t=>status(t.id)==='ng').length;
  const complete=ok+ng, percent=Math.round(complete/tasks.length*100);
  $('completion').replaceChildren(document.createTextNode(percent),element('small','', '%'));
  $('ok-count').textContent=ok;$('ng-count').textContent=ng;$('pending-count').textContent=tasks.length-complete;
  $('completed-count').textContent=`${complete} of ${tasks.length} checks completed`;
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
  const shown=tasks.filter(t=>(category==='all'||t.category===category)&&(mode==='all'||(mode==='pending'?!status(t.id):status(t.id)==='ng'))&&t.name.toLowerCase().includes(query));
  $('checks').replaceChildren();
  if(!shown.length)$('checks').append(element('div','empty','No checks match this view. Try another filter.'));
  shown.forEach(t=>{
    const row=element('div','check-row');
    const description=element('div','check-name',t.name);
    const meta=element('div','check-meta');meta.append(document.createTextNode(categories.find(c=>c.id===t.category).name),element('span','tiny-dot','·'),document.createTextNode('Schedule to verify'));description.append(meta);
    const priority=element('span',`priority p${t.priority}`,`P${t.priority}`);priority.title=`Priority ${t.priority} — draft`;
    const results=element('div','status-buttons');
    ['ok','ng'].forEach(result=>{
      const b=element('button',`${result} ${status(t.id)===result?'on':''}`,result.toUpperCase());b.type='button';b.setAttribute('aria-label',`${t.name}: ${result.toUpperCase()}`);b.setAttribute('aria-pressed',String(status(t.id)===result));
      b.addEventListener('click',()=>{if(!validDate()){$('date').reportValidity();return;}records[t.id]={...records[t.id],status:status(t.id)===result?null:result,updatedAt:new Date().toISOString()};save();});results.append(b);
    });
    const note=element('button',`note-button ${records[t.id]?.note?'has-note':''}`,records[t.id]?.note?'▣':'▢');note.type='button';note.title=records[t.id]?.note?'Edit note':'Add note';note.setAttribute('aria-label',`Notes for ${t.name}`);
    note.addEventListener('click',()=>{editingTask=t.id;$('note-title').textContent=t.name;$('note').value=typeof records[t.id]?.note==='string'?records[t.id].note:'';$('note-dialog').showModal();});
    row.append(description,priority,results,note);$('checks').append(row);
  });
}
for(const id of ['supervisor','date','shift'])$(id).addEventListener('change',()=>{if(!validDate()){$('date').reportValidity();return;}load();});
$('search').addEventListener('input',render);
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render();}));
$('save-note').addEventListener('click',()=>{if(!editingTask)return;records[editingTask]={...records[editingTask],note:$('note').value,updatedAt:new Date().toISOString()};save();$('note-dialog').close();});
$('export').addEventListener('click',()=>{
  // Neutralize spreadsheet formulas in free-text fields before CSV export.
  const quote=value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const rows=[['Supervisor','Date','Shift','Category','Control point','Draft priority','Result','Note','Updated at'],...tasks.map(t=>[$('supervisor').selectedOptions[0].text,$('date').value,$('shift').selectedOptions[0].text,categories.find(c=>c.id===t.category).name,t.name,t.priority,status(t.id)?.toUpperCase()||'Pending',records[t.id]?.note||'',records[t.id]?.updatedAt||''])];
  const blob=new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`LH-checklist-${$('supervisor').value}-${$('date').value}-${$('shift').value}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
load();
