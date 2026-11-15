const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
class El{constructor(tag='div'){this.tag=tag;this.children=[];this.value='';this.dataset={};this.style={};this.listeners={};this.classList={toggle(){}};}append(...a){this.children.push(...a)}replaceChildren(...a){this.children=a}setAttribute(){}addEventListener(n,f){this.listeners[n]=f}showModal(){this.open=true}close(){this.open=false}click(){this.listeners.click?.()}}
const elements={},modes=['all','pending','ng'].map(m=>{const e=new El('button');e.dataset.mode=m;return e});
const document={getElementById(id){return elements[id]??=new El()},createElement:t=>new El(t),createTextNode:t=>String(t),querySelectorAll:()=>modes};
let now='2026-11-15T10:00:00',exported;const RealDate=Date;
class Clock extends RealDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return new RealDate(now).getTime();}}
const data=new Map(),events={},context={document,console,Date:Clock,Intl,Blob,URL:{createObjectURL:b=>{exported=b;return 'blob:demo'},revokeObjectURL(){}},setTimeout:f=>f(),setInterval(){},location:{hash:''},window:{addEventListener:(name,fn)=>events[name]=fn},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
vm.createContext(context);for(const file of ['shift.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),context);
const evaluate=s=>vm.runInContext(s,context);
const expected=['1A','1B','1B','1A','1A','1B','1B','1B','1A','1A','1B','1B','1A','1A','1A'];
for(let i=0;i<expected.length;i++){const date=evaluate(`calendarOffset('2026-11-15',${i})`);assert.equal(evaluate(`crewFor('${date}','day')`),expected[i]);assert.equal(evaluate(`crewFor('${date}','night')`),expected[i].replace('1','2'));}
for(const [time,date,shift,crew] of [['2026-11-16T05:59:59','2026-11-15','night','2A'],['2026-11-16T06:00:00','2026-11-16','day','1B'],['2026-11-16T17:59:59','2026-11-16','day','1B'],['2026-11-16T18:00:00','2026-11-16','night','2B']]){const result=evaluate(`shiftAt(new Date('${time}'))`);assert.equal(result.date,date);assert.equal(result.shift,shift);assert.equal(result.crew,crew);}
assert.equal(elements['active-crew'].textContent,'1A');
const total=evaluate('tasks.flatMap(slots).length');assert.equal(total,82);
const findTask=()=>elements.checks.children.find(r=>r.children[0].children[0].textContent==='Reservation tray status check');
const slot=i=>findTask().children[1].children[i];assert.equal(findTask().children[1].children.length,6);
for(let i=0;i<6;i++)slot(i).children[1].children[0].click();assert.equal(elements['ok-count'].textContent,6);assert.equal(findTask().children[0].children[1].children[0].textContent,'6/6 OK');
slot(2).children[1].children[1].click();assert.equal(elements['ok-count'].textContent,5);assert.equal(elements['ng-count'].textContent,1);
assert.equal(evaluate("records['check-5:slot-2'].crew"),'1A');assert.equal(evaluate("records['check-5:slot-2'].shift"),'day');
modes[2].click();assert.equal(elements.checks.children.length,1);assert.equal(elements.checks.children[0].children[1].children.length,1);
elements.checks.children[0].children[1].children[0].children[0].children[1].click();elements.note.value='Recheck material';elements['save-note'].click();assert.equal(evaluate("records['check-5:slot-2'].note"),'Recheck material');
context.location.hash='#summary';events.hashchange();assert.equal(elements['summary-page'].hidden,false);assert.equal(elements['checklist-page'].hidden,true);assert.equal(elements['rotation-body'].children.length,14);assert.equal(elements['summary-issues'].children.length,1);assert.equal(elements['summary-totals'].children[0].children[1].textContent,6);
// Handover changes the recording context even without the timer firing.
context.location.hash='';events.hashchange();modes[0].click();now='2026-11-15T18:00:00';slot(0).children[1].children[0].click();assert.equal(elements['active-crew'].textContent,'2A');assert.equal(elements['ok-count'].textContent,1);assert.equal(evaluate("records['check-5:slot-0'].shift"),'night');
now='2026-11-16T02:00:00';events.focus();assert.equal(elements['active-date'].textContent,'2026-11-15');assert.equal(elements['ok-count'].textContent,1);
now='2026-11-16T06:00:00';events.focus();assert.equal(elements['active-crew'].textContent,'1B');assert.equal(elements['ok-count'].textContent,0);assert.equal(evaluate('slots(tasks[0])[0].label'),'06:00');
// Persisted day and night entries remain distinct and summary totals include both.
elements['summary-date'].value='2026-11-15';evaluate('renderSummary()');assert.equal(elements['summary-totals'].children[0].children[1].textContent,7);assert.equal(elements['summary-totals'].children[1].children[1].textContent,6);
// An open note cannot cross a shift boundary.
slot(0).children[0].children[1].click();elements.note.value='Do not transfer';now='2026-11-16T18:00:00';elements['save-note'].click();assert.equal(evaluate('active.crew'),'2B');assert.equal(evaluate('Object.keys(records).length'),0);
elements.export.click();
(async()=>{const csv=await exported.text();assert.equal(csv.split('\r\n').length,total+1);assert.ok(csv.includes('"2B","2026-11-16","night"'));assert.ok(!csv.includes('priority'));console.log('PASS: full Pitman cycle, 06:00/18:00 boundaries, overnight date, automatic recording metadata, recurring results, occurrence notes, summary totals/NG/rotation, handover isolation, CSV.');})();
