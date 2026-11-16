import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/docs',{recursive:true});
for(const file of ['index.html','style.css','app.mjs','model.mjs','example.json'])await copyFile(file,'dist/'+file);
await copyFile('docs/MODEL.md','dist/docs/MODEL.md');
console.log('Static app built in dist/. Serve over localhost or HTTPS.');
