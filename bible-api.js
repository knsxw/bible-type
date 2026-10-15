import {books} from './books.js';
export class BibleError extends Error {
  constructor(message,status=502){super(message);this.status=status;}
}
export function createBibleAPI({key,bibleId,fetcher=fetch}) {
  const configured=Boolean(key&&bibleId);
  let verified;
  async function request(path,params={}) {
    if(!configured) throw new BibleError('NIV access is not connected yet. Add your API.Bible credentials to .env and restart the server.',503);
    const url=new URL(`https://rest.api.bible/v1/bibles/${encodeURIComponent(bibleId)}${path}`);
    for(const [name,value] of Object.entries(params))url.searchParams.set(name,String(value));
    let response;
    try {response=await fetcher(url,{headers:{'api-key':key},signal:AbortSignal.timeout(12000),redirect:'error'});}
    catch {throw new BibleError('The Bible service could not be reached. Please try again.');}
    if(!response.ok){
      const message=response.status===401?'The Bible service key was not accepted. Check .env.':response.status===403?'This API.Bible account does not have access to the selected NIV edition.':response.status===404?'This passage is not available in this NIV edition.':response.status===429?'The Bible service request limit was reached. Please try again later.':'The Bible service is temporarily unavailable.';
      throw new BibleError(message,response.status===404?404:response.status===429?429:502);
    }
    try{return await response.json();}catch{throw new BibleError('The Bible service returned an unreadable response.');}
  }
  async function verify(){
    if(!verified)verified=request('').then(({data})=>{
      if(!data || !/^NIV(?:\d{2,4})?$/i.test(data.abbreviation||'') || data.language?.id!=='eng')throw new BibleError('Select an English NIV edition in NIV_BIBLE_ID. Other translations are not accepted.',503);
      return data;
    }).catch(error=>{verified=null;throw error;});
    return verified;
  }
  return {
    configured,
    async catalog(){
      if(!configured)return {configured:false,books};
      await verify();const {data}=await request('/books',{'include-chapters':true});
      if(!Array.isArray(data))throw new BibleError('The book catalog could not be loaded.');
      const catalog=books.map(book=>{const found=data.find(b=>b.id===book.id);if(!found)throw new BibleError('The selected edition does not include all 66 books.',503);const chapters=(found.chapters||[]).filter(c=>/^\d+$/.test(c.number));if(!chapters.length)throw new BibleError('The Bible service returned no chapters for '+book.name);return {...book,chapters};});
      return {configured:true,books:catalog};
    },
    async verses(chapter){
      if(!/^[A-Z0-9]{3}\.\d+$/.test(chapter))throw new BibleError('Choose a valid chapter.',400);
      await verify();const {data}=await request(`/chapters/${encodeURIComponent(chapter)}/verses`);
      if(!Array.isArray(data))throw new BibleError('The verse list could not be loaded.');
      return data.map(v=>({id:v.id,ref:v.reference}));
    },
    async verse(id){
      if(!/^[A-Z0-9]{3}\.\d+\.\d+[a-z]?(?:-(?:[A-Z0-9]{3}\.\d+\.)?\d+[a-z]?)?$/.test(id))throw new BibleError('Choose a valid verse.',400);
      await verify();const {data,meta}=await request(`/verses/${encodeURIComponent(id)}`,{'content-type':'text','include-notes':false,'include-titles':false,'include-chapter-numbers':false,'include-verse-numbers':false});
      if(typeof data?.content!=='string'||!data.content.trim())throw new BibleError('This verse has no typing text in this NIV edition. Choose another verse.',404);
      return {id:data.id,book:data.bookId,ref:data.reference,text:data.content.replace(/\s+/g,' ').trim(),copyright:data.copyright||'',fumsToken:meta?.fumsToken||null,fumsId:meta?.fumsId||null};
    }
  };
}
