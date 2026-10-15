import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createBibleAPI} from './bible-api.js';
// Minimal .env loader: secrets stay on the server and are never served as static files.
try {
  const env=await readFile(new URL('.env',import.meta.url),'utf8');
  for(const line of env.split(/\r?\n/)){const match=line.match(/^\s*(API_BIBLE_KEY|NIV_BIBLE_ID)\s*=\s*(.*?)\s*$/);if(match&&!process.env[match[1]])process.env[match[1]]=match[2].replace(/^(['"])(.*)\1$/,'$2');}
}catch(error){if(error.code!=='ENOENT')throw error;}
const bible=createBibleAPI({key:process.env.API_BIBLE_KEY,bibleId:process.env.NIV_BIBLE_ID});
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/engine.js':'engine.js','/books.js':'books.js','/source.js':'source.js'};
const types={html:'text/html',css:'text/css',js:'text/javascript'};
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
  if(req.method!=='GET'){json(405,{error:'Method not allowed'});return;}
  if(url.pathname.startsWith('/api/')){
    try{
      if(url.pathname==='/api/books')json(200,await bible.catalog());
      else if(url.pathname==='/api/verses')json(200,await bible.verses(url.searchParams.get('chapter')||''));
      else if(url.pathname==='/api/verse')json(200,await bible.verse(url.searchParams.get('id')||''));
      else json(404,{error:'Not found'});
    }catch(error){json(error.status||500,{error:error.status?error.message:'Unable to load Scripture. Please try again.'});}
    return;
  }
  const file=files[url.pathname];if(!file){res.writeHead(404);res.end('Not found');return;}
  try{const body=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.split('.').pop()]+'; charset=utf-8'});res.end(body);}
  catch{res.writeHead(500);res.end('Unable to load file');}
});
server.listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log('Bible Type: http://localhost:'+server.address().port));
