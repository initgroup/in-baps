/* Rebuild code-native brand assets: npm run icons (development tools only). */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('@playwright/test');
const root=path.resolve(__dirname,'..');
const folder=path.join(root,'frontend','assets');

function bitmap(size,rgba){
 const stride=Math.ceil(size/32)*4;
 const header=Buffer.alloc(40),pixels=Buffer.alloc(size*size*4),mask=Buffer.alloc(stride*size);
 header.writeUInt32LE(40,0);header.writeInt32LE(size,4);header.writeInt32LE(size*2,8);
 header.writeUInt16LE(1,12);header.writeUInt16LE(32,14);header.writeUInt32LE(pixels.length+mask.length,20);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const source=(y*size+x)*4,dest=((size-1-y)*size+x)*4;
  pixels[dest]=rgba[source+2];pixels[dest+1]=rgba[source+1];pixels[dest+2]=rgba[source];pixels[dest+3]=rgba[source+3];
  if(rgba[source+3]===0)mask[(size-1-y)*stride+(x>>3)]|=0x80>>(x%8);
 }
 return Buffer.concat([header,pixels,mask]);
}

(async()=>{
 const source=fs.readFileSync(path.join(folder,'favicon.svg'),'utf8');
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const images=new Map();
  async function render(size,maskable=false){
   return page.evaluate(async({source,size,maskable})=>{
    const doc=new DOMParser().parseFromString(source,'image/svg+xml');
    if(maskable)doc.querySelector('rect').removeAttribute('rx');
    const img=new Image();img.src='data:image/svg+xml;base64,'+btoa(new XMLSerializer().serializeToString(doc));
    await img.decode();const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,size,size);
    return {png:canvas.toDataURL('image/png').split(',')[1],rgba:Array.from(ctx.getImageData(0,0,size,size).data)};
   },{source,size,maskable});
  }
  for(const size of [16,24,32,48,64,128,180,192,256,512])images.set(size,await render(size));
  const entries=[],payloads=[];let offset=6+16*7;
  for(const size of [16,24,32,48,64,128,256]){
   const item=images.get(size),payload=size===256?Buffer.from(item.png,'base64'):bitmap(size,item.rgba);
   const entry=Buffer.alloc(16);entry[0]=size===256?0:size;entry[1]=entry[0];entry.writeUInt16LE(1,4);entry.writeUInt16LE(32,6);
   entry.writeUInt32LE(payload.length,8);entry.writeUInt32LE(offset,12);offset+=payload.length;entries.push(entry);payloads.push(payload);
  }
  const header=Buffer.alloc(6);header.writeUInt16LE(1,2);header.writeUInt16LE(entries.length,4);
  fs.writeFileSync(path.join(folder,'favicon.ico'),Buffer.concat([header,...entries,...payloads]));
  for(const [filename,size] of [['favicon-32.png',32],['apple-touch-icon.png',180],['app-icon-192.png',192],['app-icon-512.png',512]])
   fs.writeFileSync(path.join(folder,filename),Buffer.from(images.get(size).png,'base64'));
  fs.writeFileSync(path.join(folder,'app-icon-maskable-512.png'),Buffer.from((await render(512,true)).png,'base64'));
  console.log('Brand icons generated: multi-resolution ICO, favicon, Apple touch and 192/512 app icons.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
