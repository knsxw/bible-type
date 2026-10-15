import test from 'node:test';
import assert from 'node:assert/strict';
import {createBibleAPI} from './bible-api.js';
import {books} from './books.js';
const reply=(data,meta)=>({ok:true,json:async()=>({data,meta})});
const metadata={abbreviation:'NIV11',language:{id:'eng'}};
test('missing credentials gives a browsable catalog, never substitutes text',async()=>{
 const api=createBibleAPI({fetcher:()=>{throw new Error('must not fetch');}});
 assert.equal((await api.catalog()).configured,false);
 assert.equal((await api.catalog()).books.length,66);
 await assert.rejects(api.verse('GEN.1.1'),/not connected/);
});
test('rejects a configured translation that is not English NIV',async()=>{
 const api=createBibleAPI({key:'test',bibleId:'test',fetcher:async()=>reply({abbreviation:'WEB',language:{id:'eng'}})});
 await assert.rejects(api.catalog(),/English NIV/);
});
test('full provider catalog excludes introductions and preserves real chapter IDs',async()=>{
 const api=createBibleAPI({key:'test',bibleId:'test',fetcher:async url=>url.pathname.endsWith('/books')?reply(books.map(b=>({...b,chapters:[{id:b.id+'.intro',number:'intro'},...b.chapters]}))):reply(metadata)});
 const result=await api.catalog();assert.equal(result.configured,true);assert.equal(result.books.length,66);assert.equal(result.books[0].chapters[0].id,'GEN.1');
});
test('fetches plain verse text with attribution, tracking token and private authentication',async()=>{
 const requests=[];
 const api=createBibleAPI({key:'secret-test',bibleId:'licensed-id',fetcher:async(url,options)=>{
  requests.push({url,options});return url.pathname.includes('/verses/')?reply({id:'GEN.1.1',bookId:'GEN',reference:'Genesis 1:1',content:'  Synthetic\n test content. ',copyright:'Test attribution'},{fumsToken:'test-token'}):reply(metadata);
 }});
 const verse=await api.verse('GEN.1.1');assert.equal(verse.text,'Synthetic test content.');assert.equal(verse.copyright,'Test attribution');assert.equal(verse.fumsToken,'test-token');
 assert.equal(requests[1].url.searchParams.get('include-verse-numbers'),'false');assert.equal(requests[1].options.headers['api-key'],'secret-test');assert.ok(!JSON.stringify(verse).includes('secret-test'));
});
test('rejects arbitrary paths before upstream access',async()=>{
 const api=createBibleAPI({key:'test',bibleId:'test',fetcher:()=>{throw new Error('must not fetch');}});
 await assert.rejects(api.verse('../../secrets'),/valid verse/);
 await assert.rejects(api.verses('https://example.com'),/valid chapter/);
});
test('provider access and quota failures are actionable',async()=>{
 for(const [status,expected] of [[403,/does not have access/],[429,/request limit/]]){
  const api=createBibleAPI({key:'test',bibleId:'test',fetcher:async()=>({ok:false,status})});
  await assert.rejects(api.catalog(),expected);
 }
});
