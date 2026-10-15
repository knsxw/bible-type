import {verses} from './verses.js';
import {metrics, compare, changedText} from './engine.js';
const $=s=>document.querySelector(s);
const input=$('#typing-input');
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Practice remains available if storage is disabled. */}}
let history=read('bible-type-history',[]);if(!Array.isArray(history)) history=[];
history=history.filter(x=>x && typeof x.ref==='string' && Number.isFinite(x.wpm) && Number.isFinite(x.accuracy) && Number.isFinite(x.date));
let mode='verse',duration=60,current=verses[1],started=null,done=false,timer=null,attempts=0,errors=0,banked=0,completed=0,previous='',elapsed=0;
const sourcePages={'Psalms':'PSA023','John':'JHN01','Proverbs':'PRO01','1 Corinthians':'1CO01'};
for(const book of [...new Set(verses.map(v=>v.book))]){const option=document.createElement('option');option.value=book;option.textContent=book;$('#book').append(option);}
function pool(){return verses.filter(v=>$('#book').value==='all'||v.book===$('#book').value);}
function pick(){const choices=pool().filter(v=>v.id!==current.id);return choices[Math.floor(Math.random()*choices.length)]||current;}
function paint(){
 const fragment=document.createDocumentFragment();let index=0;
 for(const word of current.text.split(/( )/)){
  const group=document.createElement('span');group.className='word';
  for(const char of word){const span=document.createElement('span');span.textContent=char;span.className='char'+(index<input.value.length?(char===input.value[index]?' correct':' incorrect'):'')+(index===input.value.length?' cursor':'');group.append(span);index++;}fragment.append(group);
 }
 $('#passage').replaceChildren(fragment);
 const cursor=$('#passage .cursor');if(cursor){const area=$('#typing-area');if(cursor.offsetTop<area.scrollTop||cursor.offsetTop+40>area.scrollTop+area.clientHeight)area.scrollTop=Math.max(0,cursor.offsetTop-50);}
 $('#progress-bar').style.width=`${input.value.length/current.text.length*100}%`;
}
function passage(){input.value='';previous='';input.maxLength=current.text.length;$('#reference').textContent=current.ref+' ↗';$('#reference').href=`https://ebible.org/eng-web/${sourcePages[current.book]}.htm`;$('#word-count').textContent=current.text.split(/\s+/).length+' words';$('#verse-readable').textContent=current.text;$('#typing-area').scrollTop=0;paint();}
function stats(){const values=metrics(banked+compare(current.text,input.value),attempts,errors,elapsed);$('#wpm').textContent=values.wpm;$('#accuracy').textContent=values.accuracy;$('#clock').textContent=(mode==='time'?Math.max(0,Math.ceil(duration-elapsed)):Math.floor(elapsed))+'s';return values;}
function reset(verse=current){clearInterval(timer);current=verse;started=null;done=false;attempts=0;errors=0;banked=0;completed=0;elapsed=0;input.disabled=false;$('.practice').classList.remove('finished');$('#result').hidden=true;$('#typing-hint').textContent='Click the passage or start typing to begin';$('#session-label').textContent=mode==='verse'?'VERSE PRACTICE':'TIMED PRACTICE';passage();stats();}
function tick(){if(started===null||done)return;elapsed=(performance.now()-started)/1000;if(mode==='time'&&elapsed>=duration){elapsed=duration;finish();}else stats();}
function finish(){if(done)return;done=true;clearInterval(timer);const values=stats();input.disabled=true;$('.practice').classList.add('finished');$('#result').hidden=false;$('#result-wpm').textContent=values.wpm;$('#result-accuracy').textContent=values.accuracy+'%';$('#result-time').textContent=Math.round(elapsed*10)/10;$('#result-note').textContent=`${mode==='verse'?current.ref:completed+' verses completed'} · ${errors} mistyped characters · ${mode==='verse'?'verse practice':duration+' second practice'}`;history.unshift({...values,ref:mode==='verse'?current.ref:duration+' second practice',date:Date.now()});history=history.slice(0,100);save('bible-type-history',history);$('#again').focus();}
input.addEventListener('beforeinput',event=>{if(event.inputType==='insertFromPaste'||event.inputType==='insertFromDrop')event.preventDefault();});
input.addEventListener('paste',event=>event.preventDefault());input.addEventListener('drop',event=>event.preventDefault());
input.addEventListener('input',()=>{
 if(done)return;tick();if(done)return;
 const next=input.value.replace(/[\r\n]/g,'').slice(0,current.text.length);input.value=next;
 const change=changedText(previous,next);
 if(started===null && change.added.length){started=performance.now();timer=setInterval(tick,100);$('#typing-hint').textContent='Stay with the words. You’re doing well.';}
 for(let i=0;i<change.added.length;i++){attempts++;if(change.added[i]!==current.text[change.start+i])errors++;}
 previous=next;paint();if(started!==null)elapsed=(performance.now()-started)/1000;stats();
 if(next.length===current.text.length){if(mode==='verse')finish();else{banked+=compare(current.text,next);completed++;current=pick();passage();stats();}}
});
// Keep the invisible textarea's selection at the end so typed text matches the caret.
input.addEventListener('click',()=>input.setSelectionRange(input.value.length,input.value.length));
input.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))event.preventDefault();});
function nextVerse(){reset(pick());input.focus();}
$('#next').onclick=nextVerse;$('#again').onclick=nextVerse;$('#restart').onclick=()=>{reset();input.focus();};
document.addEventListener('keydown',event=>{
 if($('dialog[open]'))return;
 if(event.key==='Escape'){event.preventDefault();reset();input.focus();}
 else if(event.key==='Enter'&&event.altKey){event.preventDefault();nextVerse();}
 else if(!done&&event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&document.activeElement===document.body)input.focus();
});
for(const button of document.querySelectorAll('[data-mode]'))button.onclick=()=>{mode=button.dataset.mode;for(const b of document.querySelectorAll('[data-mode]')){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));}$('#durations').hidden=mode!=='time';reset();};
for(const button of document.querySelectorAll('[data-duration]')){button.setAttribute('aria-pressed',String(Number(button.dataset.duration)===duration));button.onclick=()=>{duration=Number(button.dataset.duration);for(const b of document.querySelectorAll('[data-duration]')){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));}reset();};}
$('#book').onchange=()=>reset(pick());
function theme(light){document.body.classList.toggle('light',light);$('#theme').textContent=light?'☾':'☼';$('#theme').setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');save('bible-type-light',light);}
theme(read('bible-type-light',false)===true);$('#theme').onclick=()=>theme(!document.body.classList.contains('light'));
function library(){const query=$('#search').value.toLowerCase();const list=$('#verse-list');list.replaceChildren();const matches=verses.filter(v=>(v.ref+' '+v.text).toLowerCase().includes(query));for(const verse of matches){const button=document.createElement('button');button.className='verse-card';const title=document.createElement('strong');title.textContent=verse.ref;const text=document.createElement('p');text.textContent=verse.text;button.append(title,text);button.onclick=()=>{$('#book').value='all';reset(verse);$('#library').close();input.focus();};list.append(button);}if(!matches.length){const p=document.createElement('p');p.className='muted';p.textContent='No matching verses. Try a book name or another phrase.';list.append(p);}}
$('#library-button').onclick=()=>{library();$('#library').showModal();};$('#search').oninput=library;
$('#history-button').onclick=()=>{const content=$('#history-content');content.replaceChildren();if(!history.length){const p=document.createElement('p');p.className='muted';p.textContent='Your story starts with one verse. Complete a practice session to see your results here.';content.append(p);}for(const item of history){const row=document.createElement('div');row.className='history-row';const label=document.createElement('span');label.textContent=item.ref;const date=document.createElement('small');date.textContent=new Date(item.date).toLocaleString();label.append(date);const value=document.createElement('strong');value.textContent=`${item.wpm} wpm · ${item.accuracy}%`;row.append(label,value);content.append(row);}$('#history').showModal();};
$('#practice').onclick=()=>{input.focus();};for(const button of document.querySelectorAll('.close'))button.onclick=()=>button.closest('dialog').close();
reset();
