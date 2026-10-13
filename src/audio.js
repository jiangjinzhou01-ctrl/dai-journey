// Original procedural sound. No commercial recordings, speech or cloned voices.
export class Soundscape {
 constructor(){this.ctx=null;this.master=null;this.enabled=false;this.wind=null;this.timer=null;this.scene=-1;}
 async enable(){
  const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)throw new Error('此浏览器不支持环境声音');
  if(!this.ctx){this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=.22;this.master.connect(this.ctx.destination);}
  await this.ctx.resume();this.enabled=true;this.ambient();
 }
 async disable(){this.enabled=false;clearInterval(this.timer);this.timer=null;if(this.wind){try{this.wind.stop();}catch{}this.wind=null;}if(this.ctx)await this.ctx.suspend();}
 ambient(){if(!this.enabled||this.wind)return;const c=this.ctx,b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),a=b.getChannelData(0);let prev=0;for(let i=0;i<a.length;i++){prev=(prev+(Math.random()*2-1)*.015)/1.015;a[i]=prev;}
  const source=c.createBufferSource();source.buffer=b;source.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=450;const gain=c.createGain();gain.gain.value=.25;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.wind=source;
  this.timer=setInterval(()=>{if(this.enabled)this.bird();},9000);
 }
 tone(freq=220,duration=1,delay=0,type='sine',volume=.28){if(!this.enabled||!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;const at=c.currentTime+delay;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.022);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(this.master);o.start(at);o.stop(at+duration+.04);o.onended=()=>{o.disconnect();g.disconnect();};}
 note(index=0){const notes=[196,220,261.63,293.66,329.63];const f=notes[index%notes.length];this.tone(f,1.8,0,'triangle',.32);this.tone(f*2,.8,.015,'sine',.07);}
 melody(){[0,1,3,2,4,3,1,0].forEach((n,i)=>{const f=[196,220,261.63,293.66,329.63][n];this.tone(f,1.6,i*.34,'triangle',.26);});}
 bird(){this.tone(1370,.17,0,'sine',.055);this.tone(1820,.21,.18,'sine',.035);}
 paper(){this.noise(.18,.12,2200);}
 bounce(){this.tone(90,.15,0,'sine',.35);}
 stamp(){this.noise(.12,.45,380);this.tone(65,.17,0,'sine',.25);}
 noise(duration,volume,frequency){if(!this.enabled||!this.ctx)return;const c=this.ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const source=c.createBufferSource();source.buffer=b;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=frequency;const g=c.createGain();g.gain.value=volume;source.connect(f);f.connect(g);g.connect(this.master);source.start();source.onended=()=>{source.disconnect();f.disconnect();g.disconnect();};}
 async pause(){if(this.ctx)await this.ctx.suspend();}
 async resume(){if(this.enabled&&this.ctx)await this.ctx.resume();}
}
