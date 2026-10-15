import {books as initialBooks} from './books.js';
import {getJSON,keyboardText,trackView} from './source.js';
import {metrics, compare, changedText} from './engine.js';
const $=s=>document.querySelector(s);
const input=$('#typing-input');
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Practice remains available if storage is disabled. */}}
let history=read('bible-type-history',[]);if(!Array.isArray(history)) history=[];
history=history.filter(x=>x && typeof x.ref==='string' && Number.isFinite(x.wpm) && Number.isFinite(x.accuracy) && Number.isFinite(x.date));
let mode='verse',duration=60,current=null,started=null,done=false,timer=null,attempts=0,errors=0,banked=0,completed=0,previous='',elapsed=0;
let catalog=initialBooks,configured=false,busy=false,libraryVersion=0;
const status=$('#source-status');
function message(text){status.textContent=text;status.hidden=!text;}
function controls(){
  input.disabled=busy||!current||done;
  for(const el of document.querySelectorAll('[data-mode],[data-duration],#book,#next,#restart,#again'))el.disabled=busy||!configured;
}
function fillBooks(){
  $('#book').replaceChildren(new Option('all books','all'));
  for(const book of catalog)$('#book').append(new Option(book.name,book.id));
}
const random=list=>list[Math.floor(Math.random()*list.length)];
async function pick(){
  const choices=catalog.filter(b=>$('#book').value==='all'||b.id===$('#book').value);
  const book=random(choices),chapter=random(book.chapters);
  const list=await getJSON('/api/verses?chapter='+encodeURIComponent(chapter.id));
  if(!list.length)throw new Error('No verses are available in this chapter. Please choose another.');
  const alternatives=list.filter(v=>v.id!==current?.id);
  return getJSON('/api/verse?id='+encodeURIComponent(random(alternatives.length?alternatives:list).id));
}
async function loadVerse(id=null,continueSession=false){
  if(busy||!configured)return;
  busy=true;controls();message('Loading your next verse…');
  const pausedAt=performance.now();clearInterval(timer);
  try{
    const verse=id?await getJSON('/api/verse?id='+encodeURIComponent(id)):await pick();
    verse.text=keyboardText(verse.text);
    if(continueSession){current=verse;passage();started+=performance.now()-pausedAt;timer=setInterval(tick,100);}
    else reset(verse);
    trackView(verse);message('');
  }catch(error){
    if(!continueSession&&current)reset(current);
    message(error.message);
    // A failed transition never creates a finished score or restarts a timed run.
    if(continueSession){current=null;started=null;input.value='';$('#passage').replaceChildren();$('#verse-readable').textContent='';$('#reference').textContent='';$('#reference').removeAttribute('href');$('#word-count').textContent='';$('#copyright').textContent='';$('#progress-bar').style.width='0%';}
  }finally{busy=false;controls();if(current&&!done)input.focus();}
}
fillBooks();
function paint(){
 const fragment=document.createDocumentFragment();let index=0;
 for(const word of current.text.match(/\S+ ?/g)){
  const group=document.createElement('span');group.className='word';
  for(const char of word){const span=document.createElement('span');span.textContent=char;span.className='char'+(index<input.value.length?(char===input.value[index]?' correct':' incorrect'):'')+(index===input.value.length?' cursor':'');group.append(span);index++;}fragment.append(group);
 }
 $('#passage').replaceChildren(fragment);
 const cursor=$('#passage .cursor');if(cursor){const area=$('#typing-area');if(cursor.offsetTop<area.scrollTop||cursor.offsetTop+40>area.scrollTop+area.clientHeight)area.scrollTop=Math.max(0,cursor.offsetTop-50);}
 $('#progress-bar').style.width=`${input.value.length/current.text.length*100}%`;
}
function passage(){input.value='';previous='';input.maxLength=current.text.length;$('#reference').textContent=current.ref+' ↗';$('#reference').href='https://www.biblegateway.com/passage/?search='+encodeURIComponent(current.ref)+'&version=NIV';$('#copyright').textContent=current.copyright;$('#word-count').textContent=current.text.split(/\s+/).length+' words';$('#verse-readable').textContent=current.text;$('#typing-area').scrollTop=0;paint();}
function stats(){const values=metrics(banked+compare(current.text,input.value),attempts,errors,elapsed);$('#wpm').textContent=values.wpm;$('#accuracy').textContent=values.accuracy;$('#clock').textContent=(mode==='time'?Math.max(0,Math.ceil(duration-elapsed)):Math.floor(elapsed))+'s';return values;}
function reset(verse=current){if(!verse)return;clearInterval(timer);current=verse;started=null;done=false;attempts=0;errors=0;banked=0;completed=0;elapsed=0;input.disabled=false;$('.practice').classList.remove('finished');$('#result').hidden=true;$('#typing-hint').textContent='Click the passage or start typing to begin';$('#session-label').textContent=mode==='verse'?'VERSE PRACTICE':'TIMED PRACTICE';passage();stats();}
function tick(){if(started===null||done)return;elapsed=(performance.now()-started)/1000;if(mode==='time'&&elapsed>=duration){elapsed=duration;finish();}else stats();}
function finish(){if(done)return;done=true;clearInterval(timer);const values=stats();input.disabled=true;$('.practice').classList.add('finished');$('#result').hidden=false;$('#result-wpm').textContent=values.wpm;$('#result-accuracy').textContent=values.accuracy+'%';$('#result-time').textContent=Math.round(elapsed*10)/10;$('#result-note').textContent=`${mode==='verse'?current.ref:completed+(completed===1?' verse completed':' verses completed')} · ${errors} mistyped characters · ${mode==='verse'?'verse practice':duration+' second practice'}`;history.unshift({...values,translation:'NIV',ref:mode==='verse'?current.ref:duration+' second practice',date:Date.now()});history=history.slice(0,100);save('bible-type-history',history);$('#again').focus();}
input.addEventListener('beforeinput',event=>{if(event.inputType==='insertFromPaste'||event.inputType==='insertFromDrop')event.preventDefault();});
input.addEventListener('paste',event=>event.preventDefault());input.addEventListener('drop',event=>event.preventDefault());
input.addEventListener('input',()=>{
 if(done||busy||!current)return;tick();if(done)return;
 const next=input.value.replace(/[\r\n]/g,'').slice(0,current.text.length);input.value=next;
 const change=changedText(previous,next);
 if(started===null && change.added.length){started=performance.now();timer=setInterval(tick,100);$('#typing-hint').textContent='Stay with the words. You’re doing well.';}
 for(let i=0;i<change.added.length;i++){attempts++;if(change.added[i]!==current.text[change.start+i])errors++;}
 previous=next;paint();if(started!==null)elapsed=(performance.now()-started)/1000;stats();
 if(next.length===current.text.length){if(mode==='verse')finish();else{banked+=compare(current.text,next);completed++;loadVerse(null,true);stats();}}
});
// Keep the invisible textarea's selection at the end so typed text matches the caret.
input.addEventListener('click',()=>input.setSelectionRange(input.value.length,input.value.length));
input.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))event.preventDefault();});
function nextVerse(){loadVerse();}
$('#next').onclick=nextVerse;$('#again').onclick=nextVerse;$('#restart').onclick=()=>{reset();input.focus();};
document.addEventListener('keydown',event=>{
 if($('dialog[open]')||busy||!current)return;
 if(event.key==='Escape'){event.preventDefault();reset();input.focus();}
 else if(event.key==='Enter'&&event.altKey){event.preventDefault();nextVerse();}
 else if(!done&&event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&document.activeElement===document.body)input.focus();
});
for(const button of document.querySelectorAll('[data-mode]'))button.onclick=()=>{mode=button.dataset.mode;for(const b of document.querySelectorAll('[data-mode]')){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));}$('#durations').hidden=mode!=='time';reset();};
for(const button of document.querySelectorAll('[data-duration]')){button.setAttribute('aria-pressed',String(Number(button.dataset.duration)===duration));button.onclick=()=>{duration=Number(button.dataset.duration);for(const b of document.querySelectorAll('[data-duration]')){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));}reset();};}
$('#book').onchange=()=>{current=null;clearInterval(timer);started=null;$('#passage').replaceChildren();$('#verse-readable').textContent='';$('#reference').textContent='';$('#reference').removeAttribute('href');$('#word-count').textContent='';$('#copyright').textContent='';loadVerse();};
function theme(light){document.body.classList.toggle('light',light);$('#theme').textContent=light?'☾':'☼';$('#theme').setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');save('bible-type-light',light);}
theme(read('bible-type-light',false)===true);$('#theme').onclick=()=>theme(!document.body.classList.contains('light'));
function libraryCard(title,description,action){
  const button=document.createElement('button');button.className='verse-card';
  const strong=document.createElement('strong');strong.textContent=title;
  const p=document.createElement('p');p.textContent=description;button.append(strong,p);button.onclick=action;$('#verse-list').append(button);
}
function library(){
  libraryVersion++;$('#verse-list').replaceChildren();$('#library-back').hidden=true;
  $('#search').hidden=false;$('#library-caption').textContent='66 books · New International Version';
  const matches=catalog.filter(b=>b.name.toLowerCase().includes($('#search').value.toLowerCase()));
  for(const book of matches)libraryCard(book.name,book.testament+' · '+book.chapters.length+' chapters',()=>chapters(book));
  if(!matches.length)$('#verse-list').textContent='No books found. Try another book name.';
}
function chapters(book){
  libraryVersion++;$('#verse-list').replaceChildren();$('#search').hidden=true;$('#library-back').hidden=false;$('#library-back').onclick=library;
  $('#library-caption').textContent=book.name+' · Choose a chapter';
  for(const chapter of book.chapters)libraryCard('Chapter '+chapter.number,'Browse verses',()=>chapterVerses(book,chapter));
}
async function chapterVerses(book,chapter){
  const version=++libraryVersion;$('#verse-list').textContent='Loading verses…';$('#library-back').onclick=()=>chapters(book);
  $('#library-caption').textContent=book.name+' '+chapter.number+' · Choose a verse';
  try{
    if(!configured)throw new Error('NIV text is not connected yet. Set up API.Bible access to practice verses from this chapter.');
    const list=await getJSON('/api/verses?chapter='+encodeURIComponent(chapter.id));
    if(version!==libraryVersion)return;$('#verse-list').replaceChildren();
    for(const verse of list)libraryCard(verse.ref||verse.id,'Practice this verse',()=>{if(busy)return;$('#book').value=book.id;$('#library').close();loadVerse(verse.id);});
    if(!list.length)$('#verse-list').textContent='No verses available in this chapter.';
  }catch(error){if(version===libraryVersion)$('#verse-list').textContent=error.message;}
}
$('#library-button').onclick=()=>{library();$('#library').showModal();};$('#search').oninput=library;
$('#history-button').onclick=()=>{const content=$('#history-content');content.replaceChildren();if(!history.length){const p=document.createElement('p');p.className='muted';p.textContent='Your story starts with one verse. Complete a practice session to see your results here.';content.append(p);}for(const item of history){const row=document.createElement('div');row.className='history-row';const label=document.createElement('span');label.textContent=item.ref+' · '+(item.translation||'WEB');const date=document.createElement('small');date.textContent=new Date(item.date).toLocaleString();label.append(date);const value=document.createElement('strong');value.textContent=`${item.wpm} wpm · ${item.accuracy}%`;row.append(label,value);content.append(row);}$('#history').showModal();};
$('#practice').onclick=()=>{input.focus();};for(const button of document.querySelectorAll('.close'))button.onclick=()=>button.closest('dialog').close();
async function initialize(){
  busy=true;controls();message('Connecting to the NIV library…');
  try{
    const result=await getJSON('/api/books');catalog=result.books;configured=result.configured;fillBooks();
    if(!configured)message('NIV access is not connected yet. Add your API.Bible key and NIV edition ID to .env, then restart the server. You can browse all 66 books now.');
  }catch(error){message(error.message);}
  finally{busy=false;controls();}
  if(configured)await loadVerse();
}
initialize();
