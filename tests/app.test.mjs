// Headless event-harness checks, not a browser/emulator. It exercises the actual
// application event handlers. Real canvas image rendering is separately checked.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {STORAGE} from '../src/state.js';
class Element{
 constructor(tag='div',id=''){this.tagName=tag;this.id=id;this.children=[];this.hidden=false;this.dataset={};this.handlers={};this.attrs={};this.style={setProperty(){}};this.classList={toggle(){},add(){},remove(){}};this.value='';this.clientWidth=390;this.clientHeight=844;this.width=390;this.height=844;this.textContent='';}
 addEventListener(k,f){(this.handlers[k]??=[]).push(f);}emit(k,extra={}){const e={button:0,pointerId:1,clientX:50,clientY:50,pressure:.5,target:this,currentTarget:this,key:'',preventDefault(){},stopPropagation(){},...extra};for(const f of this.handlers[k]||[])f(e);}
 append(...es){this.children.push(...es);}replaceChildren(...es){this.children=es;}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}setPointerCapture(){}focus(){}click(){this.emit('click');}matches(v){return v.split(',').includes(this.tagName);}getBoundingClientRect(){return {left:0,top:0,width:this.id==='ink'?340:390,height:this.id==='ink'?206:844};}
 getContext(){return new Proxy({createLinearGradient(){return {addColorStop(){}};}},{get(target,key){return target[key]??(()=>{});},set(target,key,value){target[key]=value;return true;}});}toBlob(cb){cb(new Blob(['png'],{type:'image/png'}));}
}
test('full event path: explore five scenes, gestures, write, stamp, export',async()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),elements=new Map();for(const m of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"/g))elements.set(m[2],new Element(m[1],m[2]));
 let now=0,seq=0,timers=new Map(),frames=new Map(),store=new Map();const originals={};const set=(k,v)=>{originals[k]=Object.getOwnPropertyDescriptor(globalThis,k);Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true});};
 set('document',{getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),addEventListener(){},hidden:false,fonts:{ready:Promise.resolve()}});
 const windowEvents={};set('window',{addEventListener(k,f){windowEvents[k]=f;}});set('navigator',{deviceMemory:8});set('devicePixelRatio',3);set('matchMedia',()=>({matches:false,addEventListener(){}}));set('Image',class{constructor(){this.complete=false;this.width=0;this.naturalWidth=0;}});set('localStorage',{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)});set('performance',{now:()=>now});
 set('requestAnimationFrame',f=>{frames.set(++seq,f);return seq;});set('cancelAnimationFrame',id=>frames.delete(id));set('setTimeout',(f,ms=0)=>{timers.set(++seq,{f,at:now+ms});return seq;});set('clearTimeout',id=>timers.delete(id));
 const el=id=>elements.get(id),advance=ms=>{const end=now+ms;while(now<end){now+=16;for(const [id,v]of [...timers])if(v.at<=now){timers.delete(id);v.f();}const todo=[...frames];frames.clear();for(const [,f]of todo)f(now);}},action=id=>{const b=el('hotspots').children.find(b=>b.dataset.action===id);assert.ok(b,'Missing '+id);b.click();},enter=i=>{action('chapter'+i);advance(650);assert.equal(el('app').dataset.mode,'scene');};
 try{
  await import('../src/app.js');assert.equal(el('sound').textContent,'');el('unroll').click();advance(1100);assert.equal(el('app').dataset.mode,'map');
  const painting=el('painting');painting.emit('pointerdown',{clientX:300,clientY:450});painting.emit('pointermove',{clientX:120,clientY:450});painting.emit('pointerup',{clientX:120,clientY:450});advance(1000);assert.equal(el('app').dataset.mode,'map');
  enter(0);const camera=JSON.parse(store.get(STORAGE)).camera;for(const [width,height]of [[320,568],[430,932],[844,390]]){el('app').clientWidth=width;el('app').clientHeight=height;windowEvents.resize();advance(50);assert.equal(el('painting').width,Math.round(width*1.75));for(const b of el('hotspots').children)if(!b.hidden){assert.ok(parseFloat(b.style.left)>0&&parseFloat(b.style.left)<width);assert.ok(parseFloat(b.style.top)>0&&parseFloat(b.style.top)<height);}}el('app').clientWidth=390;el('app').clientHeight=844;windowEvents.resize();action('curtain');action('teacher');action('desk');assert.equal(el('note').hidden,false);el('close-note').click();action('inkwell');action('bird');el('back').click();advance(650);assert.equal(JSON.parse(store.get(STORAGE)).camera,camera);
  enter(1);el('time').value='90';el('time').emit('input');assert.equal(el('time-value').textContent,'余两分钟');action('door');el('close-note').click();el('back').click();advance(650);
  enter(2);action('score');action('note');action('objects');el('close-note').click();action('sport');el('back').click();advance(650);
  enter(3);action('ball');action('kite');action('game');advance(1040);action('game');assert.match(el('hint').textContent,/接住/);action('stone');el('close-note').click();action('leaves');el('back').click();advance(650);
  enter(4);for(const path of ['path0','path1','path2'])action(path);action('pavilion');advance(650);assert.equal(el('app').dataset.mode,'colophon');assert.equal(JSON.parse(store.get(STORAGE)).visited.length,5);
  el('ink').emit('pointerdown',{clientX:10,clientY:50});el('ink').emit('pointermove',{clientX:50,clientY:80});el('ink').emit('pointerup',{clientX:50,clientY:80});assert.equal(JSON.parse(store.get(STORAGE)).drawing.length,1);el('undo').click();assert.equal(JSON.parse(store.get(STORAGE)).drawing.length,0);
  el('message').value='谢谢老师';el('message').emit('input');el('stamp').emit('pointerdown');advance(300);el('stamp').emit('pointerup');assert.equal(JSON.parse(store.get(STORAGE)).stamped,false);el('stamp').emit('pointerdown');advance(1000);el('stamp').emit('pointerup');assert.equal(JSON.parse(store.get(STORAGE)).stamped,true);
  el('export').click();await Promise.resolve();await Promise.resolve();advance(20);await Promise.resolve();assert.equal(el('app').dataset.mode,'export');assert.ok(el('saved-image').src.startsWith('blob:'));el('edit').click();assert.equal(el('app').dataset.mode,'colophon');el('clear').click();assert.equal(JSON.parse(store.get(STORAGE)).stamped,false);
 }finally{for(const [k,v]of Object.entries(originals)){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}}
});
