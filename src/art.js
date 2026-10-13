// Original interactive foreground artwork. All coordinates describe painted objects,
// not a screenshot. The raster landscape is an original environment layer.
import {CHAPTERS} from './state.js';
export const P={paper:'#eee5d1',light:'#f5edda',ink:'#35473b',soft:'#6c7e64',green:'#849478',blue:'#628d86',wood:'#9d8863',ochre:'#bdab85',red:'#a33e32'};
let teacherAsset=null;
export function setTeacherAsset(image){teacherAsset=image;}
export function line(c,pts,color=P.ink,width=1.5){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
export function poly(c,pts,fill,stroke=P.ink,width=1.3){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();if(fill){c.fillStyle=fill;c.fill();}
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
 if(fill&&w*h>1800){c.save();c.clip();c.strokeStyle='#68764e';c.lineWidth=.7;c.globalAlpha*=.085;const count=Math.min(180,Math.floor(w*h/800));for(let j=0;j<count;j++){const px=x+rnd(j+x)*w,py=y+rnd(j+y+27)*h;c.beginPath();c.moveTo(px,py);c.bezierCurveTo(px+6,py-1,px+13,py+1,px+21,py);c.stroke();}c.restore();}
 if(stroke){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
export function ellipse(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}}
export function text(c,str,x,y,size=22,color=P.ink,align='left'){c.fillStyle=color;c.font=`${size}px Journey, "Noto Serif SC", serif`;c.textAlign=align;c.fillText(str,x,y);}
const rnd=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export function paper(c,w,h){c.fillStyle=P.paper;c.fillRect(0,0,w,h);c.fillStyle='#766542';c.globalAlpha=.025;for(let i=0;i<650;i++){const x=rnd(i)*w,y=rnd(i+788)*h;c.fillRect(x,y,.6+rnd(i+31)*2,.5);}c.globalAlpha=1;}
function curve(c,p,color,width=1.4){c.beginPath();c.moveTo(p[0],p[1]);c.bezierCurveTo(...p.slice(2));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function roof(c,x,y,w,h=65){
 poly(c,[[x-25,y+14],[x+18,y-5],[x+w*.5,y-h],[x+w-18,y-5],[x+w+25,y+14],[x+w*.52,y+h*.14]],'#6d7c6d',P.ink,2);
 curve(c,[x-25,y+14,x+w*.18,y+17,x+w*.2,y-38,x+w*.5,y-h],P.ink,2);
 curve(c,[x+w*.5,y-h,x+w*.75,y-38,x+w*.84,y+17,x+w+25,y+14],P.ink,2);
 for(let i=0;i<18;i++){const a=i/17;const px=x+a*w;line(c,[[px,y+6],[x+w*.5+(a-.5)*w*.72,y-h*.6]],'#394c4099',.8);}
 line(c,[[x-25,y+17],[x+w*.52,y+h*.18],[x+w+25,y+17]],P.light,1.8);
}
export function building(c,x,y,w=340,h=190,label='学堂',open=false){
 const rw=w*.87;poly(c,[[x+10,y],[x+w,y+10],[x+w,y+h],[x+10,y+h+15]],'#ded1af');
 poly(c,[[x+w,y+10],[x+w+35,y-8],[x+w+35,y+h-10],[x+w,y+h]],'#b9b491');
 for(let i=0;i<5;i++){const px=x+10+i*(w-10)/4;poly(c,[[px,y],[px+7,y],[px+7,y+h],[px,y+h]],P.wood);}
 for(let i=0;i<2;i++){const wx=x+35+i*(w*.57);poly(c,[[wx,y+48],[wx+65,y+50],[wx+65,y+108],[wx,y+106]],'#85977b');for(let j=1;j<4;j++)line(c,[[wx+j*16,y+49],[wx+j*16,y+108]],P.ink,1);line(c,[[wx,y+76],[wx+65,y+78]],P.ink,1);}
 const dx=x+w*.41;poly(c,[[dx,y+55],[dx+64,y+57],[dx+64,y+h],[dx,y+h]],open?'#485445':'#a79b75');if(!open){line(c,[[dx+32,y+57],[dx+32,y+h]],P.ink,2);ellipse(c,dx+26,y+124,2,3,P.ink);ellipse(c,dx+38,y+124,2,3,P.ink);}
 poly(c,[[x-8,y+h+13],[x+w+10,y+h],[x+w+20,y+h+17],[x-15,y+h+31]],'#b2b399');line(c,[[x-15,y+h+32],[x+w+20,y+h+17]],P.ink);
 roof(c,x-5,y,rw+20,w*.18);
 poly(c,[[x+w*.37,y+17],[x+w*.66,y+20],[x+w*.66,y+47],[x+w*.37,y+44]],'#d5c296');text(c,label,x+w*.515,y+39,16,P.ink,'center');
}
export function bamboo(c,x,y,h=350,phase=0){
 c.save();c.translate(x,y);const sway=Math.sin(phase)*5;for(let k=0;k<4;k++){const top=-h*(.7+k*.1),bx=k*20-30;
 curve(c,[bx,0,bx+10,-h*.3,bx-30+sway,-h*.65,bx-14+sway,top],'#496345',3.3-k*.4);
 for(let j=0;j<7;j++){const yy=top+(h*.75)*j/7,xx=bx-13+sway*(1-j/7);line(c,[[xx-6,yy],[xx+5,yy]],'#617553',1.3);
 const side=j%2?1:-1;curve(c,[xx,yy,xx+side*18,yy-18,xx+side*43,yy-34,xx+side*65,yy-30],'#415e42',1);
 for(let l=0;l<5;l++){const lx=xx+side*(13+l*11),ly=yy-14-l*3;poly(c,[[lx,ly],[lx+side*(22+l),ly-21],[lx+side*9,ly-2],[lx,ly+3]],'#4f6b48',null);}
 }}c.restore();
}
function rock(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);poly(c,[[-35,0],[-25,-33],[-4,-51],[14,-44],[28,-19],[38,-3],[18,9],[-23,8]],'#9aaa8e','#566959',1.4);line(c,[[-25,-33],[-7,-22],[-4,-51]],'#657664',1);line(c,[[-7,-22],[0,3],[28,-19]],'#657664',1);for(let i=0;i<13;i++){const xx=rnd(i)*43-18,yy=-rnd(i+45)*25;line(c,[[xx,yy],[xx+5,yy-7]],'#647a6633',1);}c.restore();}
export function person(c,x,y,s=1,{teacher=false,pose=0,walk=0,book=true,procedural=false}={}){
 if(teacher&&teacherAsset?.width&&!procedural){const hh=140*s,ww=hh*teacherAsset.width/teacherAsset.height;c.save();c.translate(x,y);if(pose===2){c.rotate(.025);c.translate(0,2*s);}c.rotate(Math.sin(walk)*.01);c.drawImage(teacherAsset,-ww/2,-hh,ww,hh);c.restore();return;}
 c.save();c.translate(x,y);c.scale(s,s);c.rotate(Math.sin(walk)*.015);ellipse(c,0,1,22,5,'#4e62421c');
 line(c,[[-8,-14],[-10-Math.sin(walk)*3,0],[0,0]],P.ink,3);line(c,[[8,-14],[13+Math.sin(walk)*3,0],[23,0]],P.ink,3);
 poly(c,[[-13,-90],[-23,-70],[-18,-39],[-30,-13],[24,-13],[18,-50],[20,-75],[11,-90]],teacher?'#728675':'#b3a989',P.ink,1.5);
 curve(c,[-11,-84,-3,-68,-3,-52,-11,-15],'#496454',1);curve(c,[9,-86,6,-63,10,-31,21,-14],'#496454',1);
 poly(c,[[-12,-85],[-32,-61],[-25,-37],[-12,-46],[-4,-66]],teacher?'#718370':'#b4a687');
 poly(c,[[10,-85],[30,-67],[pose?42:28,pose?-81:-40],[18,-40],[0,-65]],teacher?'#718370':'#b4a687');
 ellipse(c,pose?41:25,pose?-83:-42,5,6,'#c4ac85',P.ink);ellipse(c,-23,-39,5,6,'#c4ac85',P.ink);
 const nod=pose===2?4:0;ellipse(c,0,-103+nod,12,17,'#cbb691',P.ink);poly(c,[[-12,-107+nod],[-13,-121+nod],[11,-119+nod],[13,-106+nod],[7,-112+nod],[-8,-112+nod]],'#33463b');ellipse(c,0,-124+nod,7,5,'#33463b');
 line(c,[[4,-102+nod],[6,-101+nod]],P.ink,1);curve(c,[3,-94+nod,5,-92+nod,7,-92+nod,9,-94+nod],P.ink,.8);
 if(teacher&&book){poly(c,[[14,-60],[35,-62],[36,-43],[15,-40]],P.light,P.ink);line(c,[[18,-57],[31,-59]],P.soft,.7);}
 c.restore();
}
function desk(c,x,y,w=140){poly(c,[[x-w/2,y-26],[x+w/2,y-26],[x+w/2+16,y],[x-w/2-8,y]],'#b2a282');for(const dx of [-w/2+8,w/2-6])poly(c,[[x+dx,y],[x+dx+7,y],[x+dx+2,y+54],[x+dx-4,y+54]],'#a7936d');poly(c,[[x-35,y-19],[x+23,y-19],[x+33,y-6],[x-26,y-6]],'#f4e8cd',P.soft,.8);line(c,[[x-18,y-15],[x+9,y-15]],P.soft,.8);}
function bird(c,x,y,t=0,s=1){c.save();c.translate(x,y);c.scale(s,s);const f=Math.sin(t*5)*7;curve(c,[-18,-f,-9,-12,0,-1,0,0],P.ink,2);curve(c,[0,0,8,-10,13,-13,24,-f],P.ink,2);c.restore();}
function ball(c,x,y,r=26){ellipse(c,x,y,r,r,'#c4ad83',P.ink);curve(c,[x-r*.8,y-r*.5,x-r*.1,y-r*.2,x+r*.1,y+r*.3,x+r*.7,y+r*.6],P.ink,1.4);curve(c,[x-r*.6,y+r*.75,x-r*.2,y,x+r*.5,y-r*.8,x+r*.65,y-r*.7],P.ink,1.4);}
function pine(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);curve(c,[0,0,-19,-120,7,-152,-22,-243],'#606044',10);curve(c,[-4,-128,20,-158,66,-144,90,-190],'#606044',5);curve(c,[-12,-192,-52,-216,-68,-178,-112,-216],'#606044',4);for(const [px,py] of [[-20,-247],[80,-189],[-107,-210],[-42,-214],[45,-173]]){for(let i=0;i<36;i++){const dx=rnd(i)*80-40,dy=rnd(i+400)*30-15;line(c,[[px+dx,py+dy],[px+dx+5,py+dy-12]],'#49614b',1);}}c.restore();}
export function landscape(c,img,w,h,{alpha=.82,section=null}={}){
 if(img&&img.width){c.save();c.globalAlpha=alpha;if(section===null)c.drawImage(img,0,0,w,h);else{const iw=img.width/3,sx=Math.max(0,Math.min(img.width-iw,(section/4)*(img.width-iw)));c.drawImage(img,sx,0,iw,img.height,0,0,w,h);}c.restore();}
 else{for(let i=0;i<4;i++){poly(c,[[0,h*.65],[w*.17,h*(.2+i*.1)],[w*.35,h*.44],[w*.53,h*(.16+i*.1)],[w*.77,h*.46],[w,h*.28],[w,h],[0,h]],['#a3b5a33a','#95aaa740','#75979233','#79997e30'][i],null);}}
}
export function mapBase(c,img,{foreground=false,region=null}={}){if(!foreground){paper(c,5200,1050);landscape(c,img,5200,870);}c.globalAlpha=.18;for(let i=0;i<9;i++){if(region!==null&&Math.abs(i*700-CHAPTERS[region].x)>950)continue;curve(c,[i*700,760,i*700+200,740,i*700+300,860,i*700+630,800],P.soft,12);}c.globalAlpha=1;
 for(let i=0;i<5;i++){if(region!==null&&region!==i)continue;const x=CHAPTERS[i].x;if(i<3)building(c,x-130,630,250,130,i===2?'数艺斋':'学堂');else if(i===3){building(c,x-180,600,220,100,'庭院');pine(c,x+175,820,.8);ball(c,x+110,813,17);}else{building(c,x-80,590,160,90,'小亭',true);pine(c,x+170,730,1.1);}bamboo(c,x-255,835,220);rock(c,x+235,833,.8);person(c,x+50,841,.43,{teacher:true});person(c,x-60,848,.32);}
 for(let i=0;i<24;i++){if(region!==null&&Math.abs(100+i*218-CHAPTERS[region].x)>600)continue;rock(c,100+i*218,930+rnd(i)*45,.25+rnd(i+10)*.4);}
}
export function mapMotion(c,t,camera,width,fx,low){const left=camera-width/2,right=camera+width/2;for(let i=0;i<5;i++){const x=CHAPTERS[i].x;if(x<left-400||x>right+400)continue;bird(c,x+Math.sin(t*.19+i)*150,330+Math.sin(t*.31+i)*20,t+i,.7);person(c,x-210+Math.sin(t*.075+i)*75,865,.34,{walk:t*1.2});if(!low){bamboo(c,x-255,835,220,t*.45+i);for(let j=0;j<4;j++)curve(c,[x-100+j*90,520+Math.sin(t+j)*2,x-80+j*90,515,x-65+j*90,526,x-30+j*90,520],'#527f793b',1);}}
 drawFX(c,fx,t);
}
export function sceneBase(c,img,i,room=null){paper(c,1000,1100);landscape(c,img,1000,750,{alpha:.55,section:i});
 if(i<3){
  // The generated architecture is a transparent layer; windows and door expose
  // the landscape beneath. All interactive furnishings and people remain live.
  if(room&&room.width){c.drawImage(room,90,50,830,862);poly(c,[[455,478],[610,478],[610,518],[455,518]],'#d7c39f',P.wood);text(c,i===2?'数艺斋':'学堂',532,505,21,P.ink,'center');}else{
  poly(c,[[115,350],[765,325],[900,465],[900,845],[190,923],[115,780]],'#d9caaa','#7a8061',2);
  poly(c,[[115,350],[765,325],[765,710],[115,780]],'#e8dcc0','#7a8061',1.5);
  poly(c,[[765,325],[900,465],[900,845],[765,710]],'#c7c09c');
  for(let j=0;j<8;j++){const yy=735+j*23;line(c,[[155,yy],[810,yy+40]],'#8c8e6a3a',1);}
  for(let j=0;j<8;j++)line(c,[[190+j*86,755],[230+j*91,907]],'#8c8e6a3a',1);
  const winx=i===2?635:180;poly(c,[[winx,383],[winx+188,377],[winx+188,560],[winx,571]],'#819e86');
  for(let j=0;j<5;j++)line(c,[[winx+j*47,385],[winx+j*47,568]],P.wood,5);line(c,[[winx,479],[winx+188,472]],P.wood,4);
  for(const [px,py] of [[125,351],[760,329],[894,465]])poly(c,[[px,py],[px+10,py],[px+10,py+379],[px,py+379]],'#947c57');
  roof(c,90,345,695,125);roof(c,750,422,145,75);
  }
  if(i===0){desk(c,410,720,200);desk(c,295,837,135);desk(c,570,824,135);desk(c,700,865,125);person(c,286,809,.68);person(c,561,796,.68);bamboo(c,105,705,360);}
  if(i===1){desk(c,430,715,215);desk(c,310,843,135);desk(c,550,843,135);poly(c,[[712,434],[819,481],[819,733],[712,688]],'#415240');building(c,70,300,165,85,'饭堂');}
  if(i===2){desk(c,365,721,265);desk(c,770,734,145);poly(c,[[166,478],[220,475],[220,668],[166,671]],'#ebdfc1');text(c,'曲',193,520,22,P.ink,'center');text(c,'谱',193,558,22,P.ink,'center');
   line(c,[[785,521],[862,562]],P.wood,4);for(let j=0;j<3;j++){poly(c,[[783,541+j*50],[862,580+j*50],[862,607+j*50],[783,567+j*50]],'#a29570');}
   person(c,596,710,1,{teacher:true});bamboo(c,110,820,310);
  }
 }else if(i===3){
  c.globalAlpha=.5;poly(c,[[80,620],[890,600],[980,902],[310,1015],[30,860]],'#b4bb96',null);c.globalAlpha=1;
  building(c,130,490,390,180,'庭前');pine(c,895,845,1.5);bamboo(c,99,585,360);rock(c,210,740,1.3);
  for(let j=0;j<6;j++)poly(c,[[130-j*5,691+j*15],[285+j*10,690+j*15],[280+j*10,705+j*15],[120-j*5,706+j*15]],'#aaa98c','#73816b',1);
  person(c,770,819,1.1,{teacher:true,pose:1});person(c,270,887,.84);person(c,586,879,.8);text(c,'风从这里经过',250,706,12,P.soft,'center');
 }else{
  for(let i=0;i<3;i++){curve(c,[230+i*270,960,260+i*140,801,415+i*40,690,500,563],'#bcad892c',45);curve(c,[230+i*270,960,260+i*140,801,415+i*40,690,500,563],'#8c957958',2);}
  building(c,400,419,215,138,'有期亭',true);pine(c,805,740,1.5);rock(c,120,812,1.5);bamboo(c,80,786,280);person(c,624,700,.8,{teacher:true});
  poly(c,[[455,514],[558,517],[558,548],[455,546]],'#f4e8cc');line(c,[[455,514],[455,546]],P.wood,4);line(c,[[558,517],[558,548]],P.wood,4);
  text(c,'山间三径 · 皆为想象',500,1023,15,P.soft,'center');
 }
}
export function sceneMotion(c,i,s,t,fx){const d=s.sceneData;
 if(i===0){
  c.save();const p=Math.min(1,Math.max(0,(t-(d.curtainAt||-10))/.6)),ease=1-(1-p)**3;const h=d.curtain?215-179*ease:36+179*ease;poly(c,[[213,475],[423,468],[423,468+h],[213,475+h]],'#92996d','#617754',1.5);for(let j=0;j<Math.floor(h/7);j++)line(c,[[214,478+j*7],[422,471+j*7]],'#53674788',1);line(c,[[425,470],[430,715]],P.wood);ellipse(c,430,723,5,8,P.wood);c.restore();
  if(d.curtain){c.save();c.globalAlpha=.14;poly(c,[[183,554],[337,549],[737,901],[423,882]],'#fff8d8',null);c.restore();}
  person(c,701,760,1.3,{teacher:true,pose:t-d.nod<1.5?2:0});bird(c,210+(t-d.bird<2?(t-d.bird)*150:0),240-(t-d.bird<2?(t-d.bird)*70:0),t,.9);
  ellipse(c,680,850,22,10,P.ink);poly(c,[[694,832],[702,786],[708,787],[701,832]],P.wood);if(d.ink){for(let j=0;j<6;j++)ellipse(c,680,845,30+j*5,15+j*3,`#35473b0${Math.max(1,7-j)}`);}
 }else if(i===1){
  person(c,613,790,1.1,{teacher:true,pose:t-d.nod<1.5?2:d.door?1:0,book:!d.door,procedural:true});
  if(d.door)poly(c,[[472,690],[500,687],[506,706],[477,709]],P.light,P.soft);
  const a=d.door?14:79;poly(c,[[732,509],[732+a,509-a*.17],[732+a,764+a*.16],[732,764]],'#ac9c73');for(let j=0;j<4;j++)line(c,[[738+j*a/4,518-j*a*.04],[738+j*a/4,755+j*a*.04]],'#7e8060',1);
  ellipse(c,430,687,55,23,'#cab893',P.ink);ellipse(c,430,687,46,17,P.light,P.soft);const angle=d.time/100*Math.PI*1.7-Math.PI;line(c,[[430,687],[430+Math.cos(angle)*39,687+Math.sin(angle)*14]],P.red,2.5);
  for(let j=0;j<4;j++){const run=d.door?Math.min(1,Math.max(0,(t-d.doorAt-j*.4)/3)):0;person(c,300+j*88+run*(420-j*40),822-run*65,.64,{walk:d.door?t*7:0});}
  for(let j=0;j<3;j++)curve(c,[180+j*15,267,158+j*12,249,188+j*10,226,172+j*14+Math.sin(t)*12,212],'#65785b30',2);
  if(d.door)text(c,'惜时者，亦惜人。',540,960,23,P.ink,'center');
 }else if(i===2){
  poly(c,[[230,663],[338,653],[363,701],[245,713]],'#f4e8cd');if(d.score){for(let j=0;j<5;j++)line(c,[[251,673+j*6],[335,664+j*6]],'#718567',.9);for(let j=0;j<7;j++)ellipse(c,259+j*11,678+Math.sin(j)*8,3,2,P.ink);}
  poly(c,[[382,681],[522,658],[542,675],[400,698]],'#887857');for(let j=0;j<6;j++)line(c,[[396,684+j*1.5],[516,666+j]],'#d6c49b',.7);
  ball(c,770-(d.objects%2)*43,668+(d.objects%2)*8,24);poly(c,[[808,663],[855,630],[868,645],[816,680]],'#98a285');
  if(d.sport){person(c,760,392,.42,{teacher:true,pose:1,walk:t});ball(c,691,387-Math.abs(Math.sin(t*2))*35,10);}
 }else if(i===3){
  const bt=t-d.ballAt;const y=bt<2?790-Math.abs(Math.sin(bt*Math.PI*2))*140*Math.max(0,1-bt/2):790;ball(c,380,y,28);
  const kx=580+d.kite*2,ky=250-Math.sin(t*.7)*12-d.kite*.6;curve(c,[540,860,640,570,kx-75,480,kx,ky],P.soft,1);poly(c,[[kx,ky-40],[kx+31,ky],[kx,ky+40],[kx-31,ky]],'#b7bc92',P.ink);line(c,[[kx,ky-40],[kx,ky+40]],P.soft);curve(c,[kx,ky+40,kx-18,ky+85,kx+38,ky+110,kx+12,ky+151],P.wood,1);
  if(d.gameAt!==undefined){const p=Math.max(0,Math.min(1,(t-d.gameAt)/1.5));ball(c,280+p*440,855-Math.sin(p*Math.PI)*210,16);}
 }else if(i===4&&d.path>=0){
  c.save();c.globalAlpha=.85;const x=230+d.path*270;if(d.path===0){for(let j=0;j<4;j++)curve(c,[x-60,830+j*12,x-10,819+j*12,x+14,840+j*12,x+74,826+j*12],P.blue,2);bird(c,x,735,t,.8);}else if(d.path===1){for(let j=0;j<3;j++)ellipse(c,x+j*24,730-j*5,45,14,'#f8f0dd');person(c,x+15,850,.7,{teacher:true});}else{desk(c,x,850,150);ellipse(c,x,826,9,12,P.light,P.ink);person(c,x-25,813,.65,{teacher:true});}c.restore();
 }
 drawFX(c,fx,t);
}
export function drawFX(c,fx,t){for(const f of fx){const age=t-f.start;if(age<0||age>3)continue;c.save();c.globalAlpha=(1-age/3)*.65;
 if(f.kind==='leaf'){for(let j=0;j<4;j++)poly(c,[[f.x+Math.sin(age+j)*20, f.y+age*70+j*10],[f.x+18+Math.sin(age+j)*20,f.y+age*70+j*10-15],[f.x+12+Math.sin(age+j)*20,f.y+age*70+j*10+2]],P.green,null);}
 else if(f.kind==='bird'){bird(c,f.x+age*95,f.y-age*55,t,1);}
 else for(let j=0;j<3;j++){c.beginPath();c.ellipse(f.x,f.y,15+age*35+j*15,(15+age*35+j*15)*(f.kind==='music'?1:.25),0,0,Math.PI*2);c.strokeStyle=P.blue;c.lineWidth=f.kind==='music'?2:1;c.stroke();}
 c.restore();}}
export function drawSignature(c,strokes,w,h){for(const stroke of strokes){if(!stroke.length)continue;c.fillStyle=P.ink;c.strokeStyle=P.ink;c.lineCap='round';c.lineJoin='round';if(stroke.length===1){const p=stroke[0];ellipse(c,p[0]*w,p[1]*h,2.3,2.3,P.ink);continue;}for(let i=1;i<stroke.length;i++){const a=stroke[i-1],b=stroke[i];c.lineWidth=2+((a[2]+b[2])/2)*4.5;c.beginPath();c.moveTo(a[0]*w,a[1]*h);c.lineTo(b[0]*w,b[1]*h);c.stroke();}}}
export function drawSeal(c,x,y,size=90){c.save();c.translate(x,y);c.rotate(-.04);c.fillStyle=P.red;c.fillRect(0,0,size,size);c.strokeStyle=P.light;c.lineWidth=2;c.strokeRect(5,5,size-10,size-10);text(c,'二六',size/2,size*.45,size*.32,P.light,'center');text(c,'〇三',size/2,size*.82,size*.32,P.light,'center');c.globalCompositeOperation='destination-out';for(let i=0;i<33;i++){const xx=rnd(i+52)*size,yy=rnd(i+151)*size;c.fillRect(xx,yy,1+rnd(i)*3,1);}c.restore();}
export function memorial(c,img,s){paper(c,1080,1440);landscape(c,img,1080,700,{alpha:.83,section:2});building(c,150,500,320,165,'学堂',true);bamboo(c,120,726,240);person(c,537,757,.8,{teacher:true});person(c,614,768,.5);person(c,657,773,.46);person(c,702,770,.48);text(c,'戴师行旅图',78,104,53);text(c,'THE JOURNEY OF MR. DAI',82,138,14,P.soft);text(c,'2603班 · 敬赠戴能斌老师',80,818,23);
 line(c,[[80,850],[1000,850]],'#8a92725a');c.save();c.translate(95,875);drawSignature(c,s.drawing,880,285);c.restore();
 let row='',lines=[];for(const ch of s.message){if(ch==='\n'){lines.push(row);row='';}else{row+=ch;if(row.length>=22){lines.push(row);row='';}}}if(row)lines.push(row);for(let i=0;i<Math.min(lines.length,4);i++)text(c,lines[i],95,1202+i*34,25);
 if(s.stamped)drawSeal(c,885,1258,98);text(c,'寻常一日，也值得入画。',95,1365,18,P.soft);text(c,'个人题跋 · 古境为艺术化想象',95,1398,13,P.soft);
}
