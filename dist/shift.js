// Pitman rotation anchored to Sunday 15 November 2026, the final A day.
const PITMAN_ANCHOR='2026-11-15';
const PITMAN_CYCLE=['A','B','B','A','A','B','B','B','A','A','B','B','A','A'];
function localDate(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function calendarOffset(date,days){const value=new Date(date+'T12:00:00');value.setDate(value.getDate()+days);return localDate(value);}
function crewFor(date,shift){
 const days=Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(PITMAN_ANCHOR+'T00:00:00Z'))/86400000);
 return (shift==='day'?'1':'2')+PITMAN_CYCLE[((days%14)+14)%14];
}
function shiftAt(now=new Date()){
 const hour=now.getHours(), shift=hour>=6&&hour<18?'day':'night';
 const date=hour<6?calendarOffset(localDate(now),-1):localDate(now);
 return {date,shift,crew:crewFor(date,shift)};
}
function shiftKey(context){return `lh-pitman-v1:${context.date}:${context.shift}:${context.crew}`;}
