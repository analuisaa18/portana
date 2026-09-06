import React, { useEffect, useRef } from 'react';
import { ThemeHeader } from '../../types/portfolio';

interface Props { text: string; header: ThemeHeader; pointer: { x:number; y:number; active:boolean }; }

const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));

export const Wrapped3DCanvas: React.FC<Props> = ({ text, header, pointer }) => {
  const ref=useRef<HTMLCanvasElement|null>(null);
  const pointerRef=useRef(pointer);
  pointerRef.current=pointer;

  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext('2d'); if(!ctx) return;
    let raf=0; let start=performance.now();
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render=(now:number)=>{
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const rect=canvas.getBoundingClientRect();
      const w=Math.max(1,rect.width), h=Math.max(1,rect.height);
      if(canvas.width!==Math.floor(w*dpr)||canvas.height!==Math.floor(h*dpr)){ canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr); }
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,w,h);

      const intensity=clamp(header.backgroundIntensity ?? 1,0,3);
      const speed=clamp(header.animationSpeed ?? 1,0,4);
      const depth=clamp(header.animationDepthPx ?? header.animationDepth ?? 70,20,240);
      const mouse=clamp(header.animationMouseStrength ?? 1,0,3);
      const p=pointerRef.current;
      const px=p.active?p.x:0, py=p.active?p.y:0;
      const t=reduce?0:(now-start)/1000*speed;

      const accent=header.wrappedSurfaceColor || getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#087cf5';
      const primary=header.wrappedTextColor || getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim() || '#fff';
      const bg=getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#080808';
      const curve=clamp(header.wrappedCurve ?? 1.15,0,3);
      const twist=clamp(header.wrappedTwist ?? 1.25,0,3);
      const bulge=clamp(header.wrappedBulge ?? 1.1,0.2,3);
      const glowAmount=clamp(header.wrappedGlow ?? 0.35,0,1);
      const scale=clamp(header.wrappedScale ?? 1,0.55,1.6);

      // Scene floor / soft glow
      const glow=ctx.createRadialGradient(w*.5+px*w*.12,h*.5+py*h*.12,0,w*.5,h*.5,w*.72);
      glow.addColorStop(0, `${accent}18`); glow.addColorStop(1, `${bg}00`);
      ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);

      // Build a blue 3D ribbon surface. Each vertical strip is a slice of a warped mesh.
      const strips=84;
      const textTex=document.createElement('canvas');
      const tw=Math.max(1200,w*2.6), th=Math.max(260,h*2.9);
      textTex.width=Math.floor(tw); textTex.height=Math.floor(th);
      const tc=textTex.getContext('2d')!;
      tc.clearRect(0,0,tw,th);
      tc.fillStyle=primary;
      tc.font=`900 ${Math.max(58,h*1.55)}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-headings') || 'Arial'}`;
      tc.textBaseline='middle';
      const phrase=(text||'PORTFÓLIO').toUpperCase();
      const gap=70;
      let x=-20;
      while(x<tw){ tc.fillText(phrase,x,th*.51); x += tc.measureText(phrase).width+gap; }

      const project=(x:number, y:number, z:number)=>{
        const persp=clamp(header.animationPerspective ?? 900,300,2200);
        const ps=persp/(persp-z);
        return {x:w*.5+(x-w*.5)*ps*scale, y:h*.5+(y-h*.5)*ps*scale, s:ps};
      };

      const pts:{x:number;y:number;z:number;top:number;bot:number;u:number}[]=[];
      for(let i=0;i<=strips;i++){
        const u=i/strips, x=u*w;
        const centered=u-.5;
        const wave=Math.sin(centered*5.6*curve + t*1.05)*h*.23*curve;
        const wave2=Math.sin(centered*11.5*curve - t*.72)*h*.08*curve;
        const mouseBend=px*centered*h*.28*mouse;
        const cy=h*.5 + wave + wave2 + mouseBend + py*h*.15*mouse;
        const z=Math.sin(centered*3.7*twist+t*.7)*depth*1.35*twist + Math.sin(centered*9*twist-t)*depth*.32*twist + px*depth*1.05*centered*mouse;
        const half=h*(.58 + .19*Math.cos(centered*3.1*curve+t*.4))*bulge + Math.abs(z)*.09;
        pts.push({x,y:cy,z,top:cy-half,bot:cy+half,u});
      }

      // Rear shadow gives the volume seen in the reference.
      for(let i=0;i<strips;i++){
        const a=pts[i], b=pts[i+1];
        const pa=project(a.x,a.top,a.z-18), pb=project(b.x,b.top,b.z-18), pc=project(b.x,b.bot,b.z-18), pd=project(a.x,a.bot,a.z-18);
        ctx.beginPath(); ctx.moveTo(pa.x+8,pa.y+8); ctx.lineTo(pb.x+8,pb.y+8); ctx.lineTo(pc.x+8,pc.y+8); ctx.lineTo(pd.x+8,pd.y+8); ctx.closePath();
        ctx.fillStyle=`${accent}22`; ctx.fill();
      }

      // Mesh base.
      for(let i=0;i<strips;i++){
        const a=pts[i], b=pts[i+1];
        const pa=project(a.x,a.top,a.z), pb=project(b.x,b.top,b.z), pc=project(b.x,b.bot,b.z), pd=project(a.x,a.bot,a.z);
        ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.lineTo(pc.x,pc.y); ctx.lineTo(pd.x,pd.y); ctx.closePath();
        ctx.fillStyle=accent; ctx.fill();
        ctx.globalAlpha=.08 + .06*Math.max(0,Math.sin(a.u*14+t));
        ctx.fillStyle='#001a3a'; ctx.fill(); ctx.globalAlpha=1;
      }

      // Project the text texture onto the same mesh, creating the wrapped surface illusion.
      for(let i=0;i<strips;i++){
        const a=pts[i], b=pts[i+1];
        const p1=project(a.x,a.top,a.z), p2=project(b.x,b.top,b.z), p3=project(b.x,b.bot,b.z), p4=project(a.x,a.bot,a.z);
        const sx=a.u*(tw-1), sw=Math.max(1,(b.u-a.u)*tw);
        const sy=th*.05, sh=th*.9;
        const dx=p1.x, dy=p1.y, dw=p2.x-p1.x, dh=p4.y-p1.y;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.lineTo(p3.x,p3.y); ctx.lineTo(p4.x,p4.y); ctx.closePath(); ctx.clip();
        // Affine vertical slice: x-axis follows the top edge, y-axis follows the left edge.
        ctx.setTransform(dw/sw, (p2.y-p1.y)/sw, (p4.x-p1.x)/sh, dh/sh, dx, dy);
        ctx.globalAlpha=.96;
        ctx.drawImage(textTex,sx,sy,sw,sh,0,0,sw,sh);
        ctx.restore();
      }

      // Specular streaks / edge highlights.
      ctx.globalCompositeOperation='screen';
      ctx.globalAlpha=glowAmount;
      ctx.lineWidth=1;
      for(let k=0;k<4;k++){
        const yy=h*(.2+k*.19)+Math.sin(t*.8+k)*8+py*8;
        const grad=ctx.createLinearGradient(0,yy,w,yy);
        grad.addColorStop(0,`${primary}00`); grad.addColorStop(.5,`${primary}22`); grad.addColorStop(1,`${primary}00`);
        ctx.strokeStyle=grad; ctx.beginPath(); ctx.moveTo(0,yy); ctx.quadraticCurveTo(w*.5,yy-20+px*20,w,yy+8); ctx.stroke();
      }
      ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=1;

      if(!reduce) raf=requestAnimationFrame(render);
    };
    raf=requestAnimationFrame(render);
    return()=>cancelAnimationFrame(raf);
  },[text,header]);

  return <canvas ref={ref} className="wrapped-3d-canvas" aria-hidden="true" />;
};
