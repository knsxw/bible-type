export async function getJSON(path){
  const response=await fetch(path,{signal:AbortSignal.timeout(18000)});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to load Scripture. Please try again.');return result;
}
export function keyboardText(text){return text.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/…/g,'...');}
export function trackView(verse){
  if(verse.fumsToken){
    window.fumsData=window.fumsData||[];
    window.fums=window.fums||function(){window.fumsData.push(arguments);};
    if(!document.querySelector('#fums-v3')){const script=document.createElement('script');script.id='fums-v3';script.src='https://pkg.api.bible/fumsV3.min.js';script.async=true;document.head.append(script);}
    window.fums('trackView',verse.fumsToken);
  } else if(verse.fumsId){
    // Legacy v1 content responses use the documented v2 tracker.
    window._BAPI=window._BAPI||{};
    if(window._BAPI.t)window._BAPI.t(verse.fumsId);
    else {
      legacyViews.push(verse.fumsId);
      if(!document.querySelector('#fums-v2')){
        const script=document.createElement('script');script.id='fums-v2';script.src='https://cdn.scripture.api.bible/fums/fumsv2.min.js';script.async=true;
        script.onload=()=>{for(const id of legacyViews.splice(0))window._BAPI.t?.(id);};
        document.head.append(script);
      }
    }
  }
}
const legacyViews=[];
