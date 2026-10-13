import {CHAPTERS,STORAGE,restore,persistable,visit,discover,moveTime,isTap,clampCamera,nearestChapter} from './state.js';
import {paper,landscape,mapBase,mapMotion,sceneBase,sceneMotion,drawSignature,drawSeal,memorial,P,setTeacherAsset} from './art.js';
import {Soundscape} from './audio.js';
const $=id=>document.getElementById(id),app=$('app'),canvas=$('painting'),ctx=canvas.getContext('2d',{alpha:false});
let storageWarning=false,s;try{s=restore(localStorage.getItem(STORAGE));}catch{s=restore(null);storageWarning=true;}
const sound=new Soundscape(),img=new Image(),room=new Image(),teacher=new Image();img.decoding='async';img.src='./assets/landscape.webp';room.decoding='async';teacher.decoding='async';teacher.src='./assets/teacher.webp';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(navigator.deviceMemory&&navigator.deviceMemory<=3)s.low=true;
let w=0,h=0,dpr=1,t=10,prev=0,raf=0,lastDraw=0,dirty=true,gesture=null,velocity=0,snap=null,transitionID=0,fx=[],hotspotButtons=[],sceneCache=new Map(),mapCache=new Map(),stampRaf=0,stampStart=0,exportBlob=null,exportURL=null,statusTimer=0,holdTimer=0;
const ink=$('ink'),inkctx=ink.getContext('2d');let activeStroke=null,activeInkPointer=null;
const motion={duration:reduced.matches?0:520,friction:5.2,spring:9.5};
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(persistable(s)));}catch{if(!storageWarning)announce('本机存储受限，本次仍可题字和导出。');storageWarning=true;}dirty=true;}
function announce(text){clearTimeout(statusTimer);$('status').textContent=text;$('status').hidden=false;statusTimer=setTimeout(()=>$('status').hidden=true,4200);}
function note(text){$('note-text').textContent=text;$('note').hidden=false;sound.paper();}
function closeNote(){$('note').hidden=true;}
function addFx(kind,x,y){fx.push({kind,x,y,start:t});fx=fx.slice(-18);dirty=true;}
function sceneTransform(){const top=h<520?105:145,bottom=h<520?95:165;const scale=Math.min((w-24)/1000,Math.max(100,h-top-bottom)/1100);return {scale,x:(w-1000*scale)/2,y:top+(h-top-bottom-1100*scale)/2};}
function mapTransform(){const top=h<520?55:78,bottom=h<520?110:160,scale=Math.max(.15,(h-top-bottom)/1050);return {scale,x:w/2-s.camera*scale,y:top,logicalWidth:w/scale};}
function resize(){w=app.clientWidth;h=app.clientHeight;dpr=Math.min(s.low?1.25:1.75,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));dirty=true;resizeInk();positionHotspots();}
function resizeInk(){const rect=ink.getBoundingClientRect();if(rect.width<1)return;ink.width=Math.round(rect.width*Math.min(2,devicePixelRatio||1));ink.height=Math.round(rect.height*Math.min(2,devicePixelRatio||1));renderInk();}
function renderInk(){inkctx.clearRect(0,0,ink.width,ink.height);const scale=ink.width/480;inkctx.save();inkctx.scale(scale,scale);drawSignature(inkctx,s.drawing,480,ink.height/scale);if(s.stamped)drawSeal(inkctx,401,ink.height/scale-77,62);inkctx.restore();}
function cacheMap(i){if(!mapCache.has(i)){const c=document.createElement('canvas');c.width=1200;c.height=1050;const cc=c.getContext('2d');cc.translate(600-CHAPTERS[i].x,0);mapBase(cc,null,{foreground:true,region:i});mapCache.set(i,c);if(mapCache.size>3)for(const key of mapCache.keys()){if(key!==i){mapCache.delete(key);break;}}}return mapCache.get(i);}
function cacheScene(i){if(i<3&&!room.src)room.src='./assets/classroom.webp';if(!sceneCache.has(i)){const c=document.createElement('canvas');c.width=1000;c.height=1100;sceneBase(c.getContext('2d'),img.complete&&img.naturalWidth?img:null,i,room.complete&&room.naturalWidth?room:null);sceneCache.set(i,c);if(sceneCache.size>2){for(const key of sceneCache.keys()){if(key!==i){sceneCache.delete(key);break;}}}}return sceneCache.get(i);}
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);paper(ctx,w,h);
 if(s.mode==='intro'){
  ctx.save();ctx.translate(-w*.15,h*.33);landscape(ctx,img.complete&&img.naturalWidth?img:null,Math.max(w*1.4,h*2),h*.72,{alpha:.88});ctx.restore();
  const fade=ctx.createLinearGradient(0,h*.24,0,h*.65);fade.addColorStop(0,P.paper);fade.addColorStop(1,'#eee5d100');ctx.fillStyle=fade;ctx.fillRect(0,0,w,h*.66);
 }else if(s.mode==='map'||s.mode==='opening'){
  if(s.mode==='opening'){const p=Math.min(1,(t-s.openAt)/.82),extent=w*(.08+.92*(1-(1-p)**3));ctx.save();ctx.beginPath();ctx.rect((w-extent)/2,0,extent,h);ctx.clip();}
  const v=mapTransform();ctx.save();ctx.translate(v.x+(s.camera-2600)*.025*v.scale,v.y);ctx.scale(v.scale,v.scale);landscape(ctx,img.complete&&img.naturalWidth?img:null,5200,870);ctx.restore();
  ctx.save();ctx.translate(v.x,v.y);ctx.scale(v.scale,v.scale);for(let i=0;i<5;i++){if(Math.abs(CHAPTERS[i].x-s.camera)<v.logicalWidth/2+600)ctx.drawImage(cacheMap(i),CHAPTERS[i].x-600,0);}mapMotion(ctx,reduced.matches?0:t,s.camera,v.logicalWidth,fx,s.low||reduced.matches);ctx.restore();
  if(s.mode==='opening'){ctx.restore();const p=Math.min(1,(t-s.openAt)/.82),extent=w*(.08+.92*(1-(1-p)**3));for(const x of [(w-extent)/2,(w+extent)/2]){const grad=ctx.createLinearGradient(x-7,0,x+7,0);grad.addColorStop(0,'#8a7655');grad.addColorStop(.4,'#d5c19b');grad.addColorStop(1,'#9c8864');ctx.fillStyle=grad;ctx.fillRect(x-7,45,14,h-90);}}
 }else{
  ctx.save();ctx.globalAlpha=.22;landscape(ctx,img.complete&&img.naturalWidth?img:null,w,h,{section:s.scene,alpha:.6});ctx.restore();
  if(s.mode==='scene'){const v=sceneTransform();ctx.save();ctx.translate(v.x,v.y);ctx.scale(v.scale,v.scale);ctx.drawImage(cacheScene(s.scene),0,0);sceneMotion(ctx,s.scene,s,t,fx);ctx.restore();}
 }
 positionHotspots();dirty=false;
}
function frame(now){raf=requestAnimationFrame(frame);if(document.hidden){prev=now;return;}
 const fps=s.low?24:reduced.matches?20:60;if(now-lastDraw<1000/fps-.75&&!dirty)return;
 const dt=prev?Math.min(.08,(now-prev)/1000):0;prev=now;lastDraw=now;
 t+=dt; // action time pauses with the document; reduced motion retains gameplay
 if(s.mode==='map'&&!gesture){const v=mapTransform();if(Math.abs(velocity)>.7){s.camera=clampCamera(s.camera+velocity*dt,v.logicalWidth);velocity*=Math.exp(-motion.friction*dt);dirty=true;if(Math.abs(velocity)<18){velocity=0;snap=CHAPTERS[nearestChapter(s.camera)].x;save();}}else if(snap!==null){const diff=snap-s.camera;s.camera=clampCamera(s.camera+diff*(reduced.matches?1:Math.min(1,dt*motion.spring)),v.logicalWidth);dirty=true;if(Math.abs(diff)<.3){snap=null;save();}}}
 fx=fx.filter(f=>t-f.start<3);const d=s.sceneData;const actionMoving=s.mode==='scene'&&[d.ballAt,d.gameAt,d.curtainAt,d.doorAt,d.nod,d.bird,d.inkAt].some(at=>Number.isFinite(at)&&t-at<4);
 if(dirty||actionMoving||fx.length||s.mode==='opening'||!reduced.matches&&(s.mode==='map'||s.mode==='scene'||s.mode==='intro'))draw();
}
function buildHotspots(){const container=$('hotspots');container.replaceChildren();hotspotButtons=[];
 const entries=s.mode==='map'?CHAPTERS.map((c,i)=>({id:'chapter'+i,label:c.name,x:c.x,y:585,chapter:i})):s.mode==='scene'?CHAPTERS[s.scene].actions.map(([id,label,x,y])=>({id,label,x,y})):[];
 for(const item of entries){const b=document.createElement('button');b.className='hotspot'+(s.mode==='map'?' map-hotspot':'');b.dataset.action=item.id;b.setAttribute('aria-label',s.mode==='map'?'进入'+item.label:'触碰'+item.label);const span=document.createElement('span');span.textContent=item.label;b.append(span);container.append(b);hotspotButtons.push({button:b,...item});b.addEventListener('pointerdown',e=>{if(s.mode==='map')beginGesture(e);else{e.stopPropagation();if(item.id==='inkwell'){clearTimeout(holdTimer);holdTimer=setTimeout(()=>{s.sceneData.ink=true;s.sceneData.inkAt=t;complete('inkwell');dirty=true;suppressClickUntil=performance.now()+1500;$('hint').textContent='按住砚台，墨色缓缓洇开。';},350);}}});let objectDrag=null;b.addEventListener('pointerdown',e=>{if(s.mode==='scene'&&['clock','kite','curtain','objects'].includes(item.id)){objectDrag={x:e.clientX,y:e.clientY,value:item.id==='clock'?s.sceneData.time:s.sceneData.kite,moved:false};b.setPointerCapture(e.pointerId);}});b.addEventListener('pointermove',e=>{if(s.mode==='map')moveGesture(e);else if(objectDrag){const dx=e.clientX-objectDrag.x,dy=e.clientY-objectDrag.y;if(Math.hypot(dx,dy)>8)objectDrag.moved=true;if(objectDrag.moved){if(item.id==='clock')setTime(objectDrag.value+dx*.65);if(item.id==='kite'){s.sceneData.kite=Math.max(0,Math.min(100,objectDrag.value+dx*.6-dy*.4));$('kite').value=s.sceneData.kite;dirty=true;}if(item.id==='curtain'){s.sceneData.curtain=dy<0;s.sceneData.curtainAt=t-1;dirty=true;}if(item.id==='objects'){s.sceneData.objects=dx>0?1:2;dirty=true;}}}});b.addEventListener('pointerup',e=>{clearTimeout(holdTimer);if(s.mode==='map')endGesture(e,false);else if(objectDrag?.moved){suppressClickUntil=performance.now()+450;complete(item.id);save();}objectDrag=null;});b.addEventListener('pointercancel',()=>{clearTimeout(holdTimer);cancelGesture();});b.addEventListener('click',e=>{e.stopPropagation();if(performance.now()<suppressClickUntil)return;if(item.chapter!==undefined)enterScene(item.chapter);else act(item.id);});}
 buildActionList();positionHotspots();
}
function positionHotspots(){if(!w||!h)return;const v=s.mode==='map'?mapTransform():sceneTransform();for(const b of hotspotButtons){let y=b.y;if(s.mode==='map')y=570;const x=v.x+b.x*v.scale,yy=v.y+y*v.scale;b.button.style.left=x+'px';b.button.style.top=yy+'px';b.button.hidden=x<10||x>w-10||yy<55||yy>h-125;b.button.classList.toggle('explored',b.chapter!==undefined&&s.visited.includes(b.chapter));}}
function buildActionList(){const list=$('action-list');list.replaceChildren();list.hidden=true;if(s.mode!=='scene')return;for(const [id,label] of CHAPTERS[s.scene].actions){const b=document.createElement('button');b.textContent=label;b.addEventListener('click',()=>{list.hidden=true;act(id);});list.append(b);}}
function updateUI(){app.dataset.mode=s.mode;$('intro').hidden=!['intro','opening'].includes(s.mode);$('back').hidden=['intro','opening','map'].includes(s.mode);$('scene-heading').hidden=s.mode!=='scene';$('journey-footer').hidden=!['map','scene'].includes(s.mode);$('scene-tools').hidden=s.mode!=='scene';$('colophon').hidden=s.mode!=='colophon';$('saved').hidden=s.mode!=='export';$('time-label').hidden=s.mode!=='scene'||s.scene!==1;$('kite-label').hidden=s.mode!=='scene'||s.scene!==3;
 if(s.mode==='scene'){const c=CHAPTERS[s.scene];$('chapter-number').textContent=c.roman+' · 入画';$('chapter-name').textContent=c.name;$('chapter-subtitle').textContent=c.sub;$('hint').textContent=['拉开竹帘，看看晨光落在哪里。','轻推计时盘。这里的刻度只是象征。','翻一页曲谱，再看看窗外。','轻触球，或牵一牵风筝线。','三条小路，都是对未来的想象。'][s.scene];}
 else $('hint').textContent='左右移卷，轻触画中门庭。';
 $('progress').textContent=s.visited.length?`已探访 ${s.visited.length} / 5 处`:'尚未探访';for(const [i,b]of [...$('chapters').children].entries()){b.classList.toggle('active',i===(s.mode==='scene'?s.scene:nearestChapter(s.camera)));b.classList.toggle('visited',s.visited.includes(i));b.setAttribute('aria-current',i===(s.mode==='scene'?s.scene:nearestChapter(s.camera))?'step':'false');}
 $('quality').setAttribute('aria-pressed',String(s.low));$('stamp').setAttribute('aria-pressed',String(s.stamped));$('stamp-help').innerHTML=s.stamped?'朱印已落。<br><small>可保存，也可继续添笔。</small>':'长按朱印，落款成卷。<br><small>键盘可按住空格或回车</small>';
 buildHotspots();dirty=true;
}
function transition(next){const id=++transitionID;velocity=0;snap=null;cancelGesture();clearTimeout(holdTimer);stopStamp();closeNote();$('action-list').hidden=true;$('ink-transition').classList.add('flow');
 const commit=()=>{if(id!==transitionID)return;fx=[];next();updateUI();save();setTimeout(()=>{if(id===transitionID)$('ink-transition').classList.remove('flow');},motion.duration?70:0);};if(motion.duration)setTimeout(commit,motion.duration/2);else commit();
}
function enterScene(i){transition(()=>{visit(s,i);s.sceneData.nod=-100;s.sceneData.ballAt=-100;s.sceneData.bird=-100;s.sceneData.gameAt=undefined;});sound.paper();}
function back(){if(s.mode==='export'){setMode('colophon');return;}if(s.mode==='colophon'){transition(()=>s.mode='map');return;}if(s.mode==='scene')transition(()=>s.mode='map');}
function setMode(mode){s.mode=mode;updateUI();if(mode==='colophon'){requestAnimationFrame(resizeInk);$('message').value=s.message;}dirty=true;}
function complete(key,message){discover(s,`${s.scene}-${key}`);save();if(message)note(message);}
function act(id){if(s.mode!=='scene')return;const d=s.sceneData;
 if(s.scene===0){
  if(id==='curtain'){d.curtain=!d.curtain;d.curtainAt=t;complete(id);sound.paper();$('hint').textContent=d.curtain?'晨光进来了，竹影落在每张书案上。':'竹帘落下，屋里又安静一点。';}
  if(id==='desk'){const messages=['纸上留着一幅小画：一只鸟，站在比它还大的饭碗边。\n翻到背面，还藏着一笔。','纸笺背面画着三个人抬一只大饭碗。\n这张是画中学生的玩笑。','有些问题，写得慢一点也没关系。\n画中小笺 · 原创题字'];complete('desk'+d.desk,messages[d.desk%3]);d.desk++;}
  if(id==='teacher'){d.nod=t;complete(id);$('hint').textContent='先生微微回头，点了点头。';}
  if(id==='bird'){d.bird=t;addFx('bird',210,240);sound.bird();complete(id);$('hint').textContent='它往饭堂方向飞去了。长卷第二处，也能遇见它。';}
  if(id==='inkwell'){d.ink=!d.ink;d.inkAt=t;complete(id);$('hint').textContent=d.ink?'墨在砚边慢慢洇开。':'砚边收起一圈墨。';}
 }else if(s.scene===1){
  if(id==='clock'){setTime(d.time+22);}
  if(id==='door'){if(!d.door){complete(id,'门还没开。\n再推一推计时盘，看看先生会怎样。');}else{addFx('bird',770,430);complete(id,'门外，饭香正好。\n多出来的两分钟，可以走得从容一点。');}}
  if(id==='teacher'){d.nod=t;complete(id);$('hint').textContent=d.door?'书已放下，先生站在门旁。':'先生看看计时盘，又看看门外。';}
  if(id==='rice'){addFx('bird',190,230);sound.bird();complete(id,'饭堂炊烟升起来了。\n小鸟倒是比谁都早。');}
 }else if(s.scene===2){
  if(id==='score'){d.score=!d.score;if(d.score)sound.melody();addFx('music',285,680);complete(id);$('hint').textContent=d.score?'曲谱展开。开启「听风」，可听原创旋律。':'曲谱轻轻合上。';}
  if(id==='note'){sound.note(d.notes||0);d.notes=(d.notes||0)+1;addFx('music',457,670);complete(id);}
  if(id==='objects'){d.objects++;complete(id,d.objects%2?'球滚开一点，后面露出一张小谱。\n练过声乐，也选择了体育。两件事，可以在同一个人身上。':'一边是曲谱，一边是球。\n人的丰富，不只在一个身份里。');}
  if(id==='sport'){d.sport=!d.sport;complete(id);$('hint').textContent=d.sport?'窗外的人动起来了。去庭前，还能一起接球。':'窗外又静下来一点。';}
 }else if(s.scene===3){
  if(id==='ball'){d.ballAt=t;d.ball++;sound.bounce();complete(id);if(d.ball%3===0)note('球滚到门口，又被轻轻拨回来。\n画中小事 · 艺术化想象');}
  if(id==='kite'){d.kite=d.kite>=75?25:80;$('kite').value=d.kite;complete(id);$('hint').textContent='风筝随线移动；下面的「牵风」刻度也可以拖。';}
  if(id==='game'){const p=d.gameAt===undefined?2:(t-d.gameAt)/1.5;if(p>.5&&p<.95){d.catches++;sound.bounce();addFx('music',650,790);$('hint').textContent=`接住了${d.catches>1?' · 第'+d.catches+'回':''}！再轻触，抛回去。`;d.gameAt=undefined;complete('catch');}else{d.gameAt=t;complete(id);$('hint').textContent='球到先生身前时，再轻触「一起接球」。';}}
  if(id==='stone'){complete(id,'石阶背面，一行小字：\n「球先放好，饭也要吃好。」\n画中学生的趣题，并非老师原话。');}
  if(id==='leaves'){addFx('leaf',140,435);complete(id);$('hint').textContent='几片竹叶落下，溪边多了一圈涟漪。';}
 }else if(s.scene===4){
  if(id.startsWith('path')){d.path=Number(id.slice(-1));complete(id);$('hint').textContent=['听溪：水声与鸟声，给这条小路添了伴。','看云：今天的云走得很慢，正好抬头。','歇脚：亭边一盏茶，先坐一会儿。'][d.path]+'（想象）';if(d.path===0)sound.bird();}
  if(id==='pavilion'){complete(id);transition(()=>setMode('colophon'));}
 }
 dirty=true;
}
function setTime(value){const was=s.sceneData.door;const open=moveTime(s,value);$('time').value=s.sceneData.time;$('time-value').textContent=open?'余两分钟':s.sceneData.time>=60?'将近':'尚早';if(open&&!was){s.sceneData.doorAt=t;sound.paper();complete('two-minutes');$('hint').textContent='先生放下书，门开了。先去吃饭吧。';}if(!open)$('hint').textContent='日光渐高，门外传来若有若无的饭香。';dirty=true;}
let suppressClickUntil=0;
function point(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function beginGesture(e){if(e.button!==0&&e.button!==undefined||!['map','scene'].includes(s.mode)||gesture)return;const p=point(e);gesture={id:e.pointerId,start:p,last:p,lastAt:performance.now(),startAt:performance.now(),camera:s.camera,moved:false};velocity=0;snap=null;if(e.currentTarget.setPointerCapture)e.currentTarget.setPointerCapture(e.pointerId);}
function moveGesture(e){if(!gesture||gesture.id!==e.pointerId)return;const p=point(e),now=performance.now(),v=mapTransform();if(!isTap(gesture.start,p))gesture.moved=true;if(s.mode==='map'&&gesture.moved){const dx=p.x-gesture.last.x;s.camera=clampCamera(s.camera-dx/v.scale,v.logicalWidth);velocity=-(dx/v.scale)/Math.max(.008,(now-gesture.lastAt)/1000);dirty=true;}gesture.last=p;gesture.lastAt=now;}
function endGesture(e,tap=true){if(!gesture||gesture.id!==e.pointerId)return;const g=gesture,p=point(e);gesture=null;if(g.moved||!isTap(g.start,p)){suppressClickUntil=performance.now()+500;if(s.mode==='map'){if(performance.now()-g.lastAt>120||reduced.matches)velocity=0;snap=Math.abs(velocity)<18?CHAPTERS[nearestChapter(s.camera)].x:null;save();}else if(p.x-g.start.x>75&&Math.abs(p.y-g.start.y)<80)back();return;}if(tap){if(s.mode==='map'){const v=mapTransform(),x=(p.x-v.x)/v.scale,y=(p.y-v.y)/v.scale;addFx(y>450?'water':'leaf',x,y);sound.paper();}else if(s.mode==='scene'){const v=sceneTransform(),x=(p.x-v.x)/v.scale,y=(p.y-v.y)/v.scale;const candidates=CHAPTERS[s.scene].actions.map(a=>({a,dist:Math.hypot(x-a[2],y-a[3])})).sort((a,b)=>a.dist-b.dist);if(candidates[0].dist<110)act(candidates[0].a[0]);else addFx('water',x,y);}}}
function cancelGesture(){gesture=null;velocity=0;}
canvas.addEventListener('pointerdown',beginGesture);canvas.addEventListener('pointermove',moveGesture);canvas.addEventListener('pointerup',e=>endGesture(e));canvas.addEventListener('pointercancel',cancelGesture);canvas.addEventListener('wheel',e=>{if(s.mode!=='map')return;e.preventDefault();s.camera=clampCamera(s.camera+(e.deltaX||e.deltaY)/mapTransform().scale,mapTransform().logicalWidth);velocity=0;snap=null;dirty=true;save();},{passive:false});
canvas.addEventListener('dblclick',e=>{if(s.mode==='map')enterScene(nearestChapter(s.camera));});
function inkPoint(e){const r=ink.getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)),e.pressure>.01?e.pressure:.55];}
ink.addEventListener('pointerdown',e=>{if(activeStroke||s.mode!=='colophon')return;e.preventDefault();ink.setPointerCapture(e.pointerId);activeInkPointer=e.pointerId;activeStroke=[inkPoint(e)];s.drawing.push(activeStroke);if(s.drawing.length>160)s.drawing.shift();renderInk();});
ink.addEventListener('pointermove',e=>{if(!activeStroke||activeInkPointer!==e.pointerId)return;e.preventDefault();for(const p of e.getCoalescedEvents?.()||[e]){if(activeStroke.length<1200)activeStroke.push(inkPoint(p));}renderInk();});
function finishStroke(e){if(activeInkPointer!==e.pointerId)return;activeStroke=null;activeInkPointer=null;save();}
ink.addEventListener('pointerup',finishStroke);ink.addEventListener('pointercancel',finishStroke);
function startStamp(){if(s.mode!=='colophon'||stampRaf)return;stampStart=performance.now();const step=now=>{const ratio=Math.min(1,(now-stampStart)/850);$('stamp').style.setProperty('--press',ratio);if(ratio>=1){stampRaf=0;s.stamped=true;sound.stamp();save();renderInk();updateUI();announce('朱印已落，可以保存画卷。');return;}stampRaf=requestAnimationFrame(step);};stampRaf=requestAnimationFrame(step);}
function stopStamp(){cancelAnimationFrame(stampRaf);stampRaf=0;$('stamp').style.setProperty('--press',s.stamped?1:0);}
$('stamp').addEventListener('pointerdown',e=>{e.preventDefault();$('stamp').setPointerCapture(e.pointerId);startStamp();});for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('stamp').addEventListener(ev,stopStamp);
$('stamp').addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)startStamp();}});$('stamp').addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key))stopStamp();});$('stamp').addEventListener('blur',stopStamp);$('stamp').addEventListener('contextmenu',e=>e.preventDefault());
async function exportPainting(){if(!s.stamped){announce('先长按朱印落款，再保存画卷。');$('stamp').focus();return;}$('export').disabled=true;try{await document.fonts.ready;const c=document.createElement('canvas');c.width=1080;c.height=1440;memorial(c.getContext('2d'),img.complete&&img.naturalWidth?img:null,s);const b=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!b)throw new Error('图片生成失败');if(exportURL)URL.revokeObjectURL(exportURL);exportBlob=b;exportURL=URL.createObjectURL(b);$('saved-image').src=exportURL;setMode('export');save();}catch{announce('画面暂时未能生成，请再试一次。题字仍保存在本机。');}finally{$('export').disabled=false;}}
function download(){if(!exportURL)return;const a=document.createElement('a');a.href=exportURL;a.download='戴师行旅图-个人题跋.png';a.click();announce('若浏览器没有开始下载，可长按预览画面保存。');}
async function share(){if(!exportBlob)return;const file=new File([exportBlob],'戴师行旅图.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:'戴师行旅图'});}catch(e){if(e.name!=='AbortError')announce('此浏览器无法直接分享，请先下载图片。');}}else{announce('此浏览器不支持图片分享，请下载后发送。');}}
$('unroll').addEventListener('click',()=>{if(s.mode!=='intro')return;s.mode='opening';s.openAt=t;dirty=true;app.dataset.mode='opening';sound.paper();setTimeout(()=>{s.mode='map';updateUI();if(storageWarning)announce('浏览器限制了本地保存；本次仍可探索和导出。');},reduced.matches?0:950);});
$('back').addEventListener('click',back);$('close-note').addEventListener('click',closeNote);$('find').addEventListener('click',()=>$('action-list').hidden=!$('action-list').hidden);
$('time').addEventListener('input',e=>setTime(e.target.value));$('kite').addEventListener('input',e=>{s.sceneData.kite=Number(e.target.value);complete('kite');dirty=true;});
$('sound').addEventListener('click',async()=>{try{if(s.sound){await sound.disable();s.sound=false;}else{await sound.enable();s.sound=true;}$('sound').textContent=s.sound?'听风 · 开':'听风 · 关';$('sound').setAttribute('aria-pressed',String(s.sound));}catch{announce('声音未能开启。可继续无声游览。');}});
$('quality').addEventListener('click',()=>{s.low=!s.low;save();resize();updateUI();announce(s.low?'轻绘已开：降低分辨率与环境帧率，互动照常。':'恢复细绘。');});
$('title-button').addEventListener('click',()=>{$('about').hidden=false;$('close-about').focus();});$('close-about').addEventListener('click',()=>{$('about').hidden=true;$('title-button').focus();});$('revisit').addEventListener('click',()=>{$('about').hidden=true;transition(()=>{s.camera=700;s.mode='map';});});
$('to-colophon').addEventListener('click',()=>transition(()=>setMode('colophon')));$('undo').addEventListener('click',()=>{s.drawing.pop();activeStroke=null;renderInk();save();});$('clear').addEventListener('click',()=>{s.drawing=[];s.stamped=false;activeStroke=null;renderInk();save();updateUI();});$('message').value=s.message;$('message').addEventListener('input',e=>{s.message=e.target.value.slice(0,64);save();});$('export').addEventListener('click',exportPainting);$('download').addEventListener('click',download);$('share').addEventListener('click',share);$('edit').addEventListener('click',()=>setMode('colophon'));
CHAPTERS.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.name;b.setAttribute('aria-label','移卷至'+c.name);b.addEventListener('click',()=>{closeNote();if(s.mode==='scene'){transition(()=>{s.mode='map';s.camera=c.x;});}else{snap=c.x;velocity=0;dirty=true;}});$('chapters').append(b);});
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.key==='Escape'){if(!$('about').hidden)$('about').hidden=true;else if(!$('note').hidden)closeNote();else back();}if(s.mode==='map'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();snap=CHAPTERS[Math.max(0,Math.min(4,nearestChapter(s.camera)+(e.key==='ArrowRight'?1:-1)))].x;dirty=true;}});
document.addEventListener('visibilitychange',()=>{stopStamp();cancelGesture();if(document.hidden){save();sound.pause().catch(()=>{});}else{prev=0;dirty=true;sound.resume().catch(()=>{});}});window.addEventListener('pagehide',()=>{save();stopStamp();sound.pause().catch(()=>{});});window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
img.onload=()=>{mapCache.clear();sceneCache.clear();dirty=true;};img.onerror=()=>{mapCache.clear();sceneCache.clear();dirty=true;announce('山水底画未载入，已切换为本地矢量画境。主要互动仍可使用。');};room.onload=()=>{sceneCache.clear();dirty=true;};room.onerror=()=>{dirty=true;};teacher.onload=()=>{setTeacherAsset(teacher);mapCache.clear();sceneCache.clear();dirty=true;};
document.fonts.ready.then(()=>{mapCache.clear();sceneCache.clear();dirty=true;});
reduced.addEventListener?.('change',()=>{motion.duration=reduced.matches?0:520;dirty=true;});
resize();updateUI();raf=requestAnimationFrame(frame);
