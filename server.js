import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/verses.js':'verses.js','/engine.js':'engine.js'};
const types = {html:'text/html',css:'text/css',js:'text/javascript'};
const server = http.createServer(async (req,res) => {
  const file = files[new URL(req.url,'http://localhost').pathname];
  if (!file) {res.writeHead(404);res.end('Not found');return;}
  try {const body=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.split('.').pop()]+'; charset=utf-8'});res.end(body);}
  catch {res.writeHead(500);res.end('Unable to load file');}
});
server.listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log('Bible Type: http://localhost:' + server.address().port));
