export const CHAPTERS = [
  {name:'竹窗初见',sub:'晨光先到，先生随后。',x:700,roman:'壹',actions:[['curtain','竹帘',315,550],['desk','书案',410,720],['teacher','先生',705,650],['bird','窗外小鸟',210,240],['inkwell','砚台',680,845]]},
  {name:'偷来的两分钟',sub:'门开时，饭香正好。',x:1650,roman:'贰',actions:[['clock','计时盘',430,690],['door','学堂门',770,610],['teacher','先生',610,670],['rice','饭堂炊烟',190,310]]},
  {name:'一身兼数艺',sub:'曲谱与球，搁在同一间屋里。',x:2600,roman:'叁',actions:[['score','曲谱',280,675],['note','弦声',460,680],['objects','旧物',770,665],['sport','庭外',730,325]]},
  {name:'庭前有风',sub:'一阵风，把庭院叫醒。',x:3550,roman:'肆',actions:[['ball','球',380,790],['kite','风筝',720,290],['game','一起接球',660,790],['stone','石阶',200,700],['leaves','竹叶',110,370]]},
  {name:'山水有期',sub:'小路各有趣处，不必急着选。',x:4500,roman:'伍',actions:[['path0','听溪',230,790],['path1','看云',500,805],['path2','歇脚',770,780],['pavilion','亭中卷轴',505,455]]}
];
export const STORAGE='dai-journey-v1';
export function freshState(){return {mode:'intro',camera:700,scene:0,visited:[],discoveries:{},drawing:[],message:'',stamped:false,low:false,sceneData:{curtain:false,window:true,desk:0,nod:0,time:0,door:false,score:false,objects:0,ball:0,catches:0,path:-1,kite:50,ink:false},sound:false};}
export function restore(raw){
  const s=freshState();try{const v=JSON.parse(raw);if(!v||typeof v!=='object')return s;
    s.camera=Number.isFinite(v.camera)?Math.max(350,Math.min(4950,v.camera)):700;
    s.visited=Array.isArray(v.visited)?[...new Set(v.visited.filter(n=>Number.isInteger(n)&&n>=0&&n<5))]:[];
    s.discoveries=v.discoveries&&typeof v.discoveries==='object'?Object.fromEntries(Object.entries(v.discoveries).filter(([k,val])=>/^[a-z0-9-]+$/.test(k)&&val===true)):{};
    s.message=typeof v.message==='string'?v.message.slice(0,64):'';s.stamped=v.stamped===true;s.low=v.low===true;
    s.drawing=Array.isArray(v.drawing)?v.drawing.slice(-160).filter(Array.isArray).map(st=>st.slice(0,1200).filter(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=1&&p[1]>=0&&p[1]<=1).map(p=>[p[0],p[1],Math.max(.1,Math.min(1,p[2]))])).filter(st=>st.length):[];
  }catch{}return s;
}
export function persistable(s){return {camera:s.camera,visited:s.visited,discoveries:s.discoveries,drawing:s.drawing,message:s.message,stamped:s.stamped,low:s.low};}
export function visit(s,i){if(!Number.isInteger(i)||i<0||i>=CHAPTERS.length)return false;s.scene=i;s.mode='scene';if(!s.visited.includes(i))s.visited.push(i);return true;}
export function discover(s,key){const first=!s.discoveries[key];s.discoveries[key]=true;return first;}
export function moveTime(s,value){s.sceneData.time=Math.max(0,Math.min(100,Number(value)||0));s.sceneData.door=s.sceneData.time>=88;return s.sceneData.door;}
export function isTap(a,b){return Math.hypot(a.x-b.x,a.y-b.y)<9;}
export function clampCamera(n,width){const edge=Math.min(width/2,500);return Math.max(edge,Math.min(5200-edge,n));}
export function nearestChapter(camera){return CHAPTERS.reduce((best,c,i)=>Math.abs(c.x-camera)<Math.abs(CHAPTERS[best].x-camera)?i:best,0);}
