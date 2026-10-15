import { mkdir, copyFile } from 'node:fs/promises';

await mkdir('public', { recursive: true });

for (const file of [
    'index.html', 'style.css', 'app.js',
    'engine.js', 'books.js', 'source.js',
]) {
    await copyFile(file, `public/${file}`);
}