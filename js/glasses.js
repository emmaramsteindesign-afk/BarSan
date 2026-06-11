/* ═══════════════════════════════════════════════
   Bar·San — Glass Drawing Library
   Clean double-wall rendering, no horizontal rim artifacts
   Glasses: coupe · rocks · highball · martini · wine · hurricane · flute
═══════════════════════════════════════════════ */

/* ── noise helpers ── */
function hash(x,y){let h=(x*1619+y*31337+1013904223)&0xffffffff;h=Math.imul(h^(h>>>16),0x45d9f3b);h=Math.imul(h^(h>>>16),0x45d9f3b);return((h^(h>>>16))>>>0)/0xffffffff}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);const ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);return a+(b-a)*ux+(c-a)*uy+(a-b-c+d)*ux*uy}

/* ── liquid fill ── */
function drawLiquid(ctx, canvas, clipFn, botY, fillPct, seed, t) {
  if (fillPct <= 0) return;
  const W = canvas.width;
  ctx.save(); clipFn(); ctx.clip();
  const cols=28, rows=40, cw=W/cols, ch=botY/rows;
  const liqStartY = botY*(1-fillPct);
  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      const px=col*cw,py=row*ch;
      if(py+ch<liqStartY)continue;
      const depth=(py-liqStartY)/(botY-liqStartY);
      const n1=noise(col*0.22+seed,row*0.20+t*0.55);
      const n2=noise(col*0.38+seed+4.1,row*0.32-t*0.32);
      const n=n1*0.65+n2*0.35;
      const alpha=(0.04+n*0.22)*(0.25+depth*0.75);
      const topClip=Math.max(0,liqStartY-py);
      ctx.fillStyle=`rgba(232,228,220,${alpha.toFixed(3)})`;
      ctx.fillRect(px,py+topClip,cw-0.5,ch-topClip-0.5);
    }
  }
  // shimmer dots
  for(let i=0;i<14;i++){
    const sx=noise(i*2.7+seed,t*0.18+i*0.4)*W;
    const sy=liqStartY+noise(i*1.9,t*0.22+i*0.6)*(botY-liqStartY);
    const sr=0.7+noise(i+seed,t*0.12)*2.0;
    ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);
    ctx.fillStyle='rgba(232,228,220,0.32)';ctx.fill();
  }
  // surface wave
  ctx.beginPath();
  for(let i=0;i<=32;i++){
    const xp=(i/32)*W;
    const wave=Math.sin(i*0.55+t*2.8)*1.8+Math.cos(i*0.9-t*1.9)*1.2;
    const yp=liqStartY+wave;
    i===0?ctx.moveTo(xp,yp):ctx.lineTo(xp,yp);
  }
  ctx.strokeStyle='rgba(232,228,220,0.18)';ctx.lineWidth=0.8;ctx.stroke();
  ctx.restore();
}

/* ── straw ── */
function drawStraw(ctx, x1,y1,x2,y2,r){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  const nx=-dy/len,ny=dx/len;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1+nx*r,y1+ny*r);ctx.lineTo(x2+nx*r,y2+ny*r);
  ctx.lineTo(x2-nx*r,y2-ny*r);ctx.lineTo(x1-nx*r,y1-ny*r);
  ctx.closePath();
  ctx.strokeStyle='rgba(232,228,220,0.75)';ctx.lineWidth=0.8;ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1+nx*(r*0.3),y1+ny*(r*0.3));ctx.lineTo(x2+nx*(r*0.3),y2+ny*(r*0.3));
  ctx.strokeStyle='rgba(232,228,220,0.22)';ctx.lineWidth=r*0.45;ctx.stroke();
  ctx.restore();
}

/* ── ice cube ── */
function drawIce(ctx, cx, liqY, bot, S, t, offsetX=0){
  const iceBob=Math.sin(t*1.2)*2.5*S;
  const iceY=liqY+(bot-liqY)*0.10+iceBob;
  const iceX=cx-22*S+offsetX, iceS=36*S;
  ctx.save();
  ctx.strokeStyle='rgba(232,228,220,0.38)';ctx.lineWidth=0.6*S;ctx.setLineDash([]);
  ctx.strokeRect(iceX,iceY,iceS,iceS);
  ctx.setLineDash([2,2]);ctx.lineWidth=0.35*S;ctx.globalAlpha=0.28;
  ctx.beginPath();ctx.moveTo(iceX,iceY+iceS*0.5);ctx.lineTo(iceX+iceS,iceY+iceS*0.5);ctx.stroke();
  ctx.beginPath();ctx.moveTo(iceX+iceS*0.5,iceY);ctx.lineTo(iceX+iceS*0.5,iceY+iceS);ctx.stroke();
  ctx.setLineDash([]);ctx.globalAlpha=0.22;
  ctx.beginPath();ctx.moveTo(iceX,iceY);ctx.lineTo(iceX-7*S,iceY-7*S);ctx.lineTo(iceX+iceS-7*S,iceY-7*S);ctx.lineTo(iceX+iceS,iceY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(iceX+iceS,iceY);ctx.lineTo(iceX+iceS-7*S,iceY-7*S);ctx.stroke();
  ctx.globalAlpha=1;ctx.setLineDash([]);ctx.restore();
}

/* ══════════════════════════════════════════
   GLASS RENDERERS
   Each takes (ctx, canvas, fillPct, garnish, t)
══════════════════════════════════════════ */

/* COUPE — wide bowl, stem, no artifacts */
function drawCoupe(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const bowlTop=28*S, bowlBot=Math.min(H*0.50,260*S);
  const inset1=9*S, inset2=20*S;

  function bowl(ins){
    ctx.beginPath();
    ctx.moveTo(ins,bowlTop);
    ctx.quadraticCurveTo(ins-6*S,bowlTop+(bowlBot-bowlTop)*0.55,cx-2*S,bowlBot);
    ctx.lineTo(cx+2*S,bowlBot);
    ctx.quadraticCurveTo(W-ins+6*S,bowlTop+(bowlBot-bowlTop)*0.55,W-ins,bowlTop);
    ctx.closePath();
  }

  drawLiquid(ctx,canvas,()=>bowl(inset1),bowlBot,fillPct,1.1,t);

  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';

  // garnish twist
  if(garnish==='twist'&&fillPct>0){
    ctx.save();ctx.globalAlpha=0.5;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.7*S;
    ctx.beginPath();ctx.moveTo(W-22*S,bowlTop+4*S);ctx.quadraticCurveTo(W-8*S,bowlTop-10*S,W-14*S,bowlTop+20*S);ctx.quadraticCurveTo(W-5*S,bowlTop+6*S,W-18*S,bowlTop+30*S);
    ctx.stroke();ctx.restore();
  }
  if(garnish==='salt'){
    ctx.save();ctx.globalAlpha=0.35;ctx.strokeStyle='rgba(232,228,220,0.85)';
    ctx.lineWidth=3*S;ctx.setLineDash([2.5,3]);
    ctx.beginPath();ctx.moveTo(inset1,bowlTop);ctx.lineTo(W-inset1,bowlTop);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
  }

  // outer bowl
  bowl(inset1);ctx.stroke();
  // inner wall — no horizontal top line, just the curved sides
  ctx.save();ctx.globalAlpha=0.22;
  ctx.beginPath();
  ctx.moveTo(inset2,bowlTop);
  ctx.quadraticCurveTo(inset2-5*S,bowlTop+(bowlBot-bowlTop)*0.55,cx-3*S,bowlBot-2*S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W-inset2,bowlTop);
  ctx.quadraticCurveTo(W-inset2+5*S,bowlTop+(bowlBot-bowlTop)*0.55,cx+3*S,bowlBot-2*S);
  ctx.stroke();
  ctx.restore();
  // concave bottom
  ctx.globalAlpha=0.25;ctx.lineWidth=0.5*S;
  ctx.beginPath();ctx.moveTo(cx-26*S,bowlBot);ctx.quadraticCurveTo(cx,bowlBot+8*S,cx+26*S,bowlBot);ctx.stroke();ctx.globalAlpha=1;
  // stem
  ctx.lineWidth=0.9*S;
  ctx.beginPath();ctx.moveTo(cx,bowlBot);ctx.lineTo(cx,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx+3.5*S,bowlBot+2*S);ctx.lineTo(cx+3.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // base
  ctx.lineWidth=0.85*S;
  ctx.beginPath();ctx.moveTo(cx-52*S,H-44*S);ctx.lineTo(cx+52*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.2;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-52*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+52*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // rim highlight
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;
  ctx.beginPath();ctx.moveTo(inset1,bowlTop);ctx.lineTo(W-inset1,bowlTop);ctx.stroke();ctx.globalAlpha=1;
  // side highlight
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(20*S,bowlTop+16*S);ctx.quadraticCurveTo(16*S,bowlTop+(bowlBot-bowlTop)*0.5,36*S,bowlTop+(bowlBot-bowlTop)*0.78);ctx.stroke();ctx.globalAlpha=1;
}

/* ROCKS — short wide glass, ice inside */
function drawRocks(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/220,cx=W/2;
  const top=28*S,bot=H-30*S,wT=100*S,wB=86*S;
  const liqY=bot-(bot-top)*fillPct;

  function clip(){
    ctx.beginPath();
    ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.lineTo(cx+wB,bot);ctx.lineTo(cx-wB,bot);ctx.closePath();
  }

  drawLiquid(ctx,canvas,clip,bot,fillPct,2.3,t);

  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.85*S;ctx.lineJoin='round';ctx.lineCap='round';

  // foam
  if(garnish==='foam'&&fillPct>0.1){
    ctx.save();clip();ctx.clip();
    const hw=wT-(wT-wB)*(liqY-top)/(bot-top);
    ctx.beginPath();ctx.ellipse(cx,liqY,hw*0.88,5*S,0,0,Math.PI*2);
    ctx.fillStyle='rgba(232,228,220,0.16)';ctx.fill();
    ctx.restore();
  }

  // ice
  ctx.save();clip();ctx.clip();
  drawIce(ctx,cx,liqY,bot,S,t);
  ctx.restore();

  // outer
  clip();ctx.stroke();
  // inner walls — only side lines, NO top horizontal line
  const iT=9*S,iB=6*S;
  ctx.save();ctx.globalAlpha=0.22;
  ctx.beginPath();ctx.moveTo(cx-wT+iT,top);ctx.lineTo(cx-wB+iB,bot-5*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+wT-iT,top);ctx.lineTo(cx+wB-iB,bot-5*S);ctx.stroke();
  ctx.restore();
  // bottom arcs
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-wB+iB,bot-5*S);ctx.quadraticCurveTo(cx,bot+5*S,cx+wB-iB,bot-5*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-wB,bot);ctx.quadraticCurveTo(cx,bot+10*S,cx+wB,bot);ctx.stroke();ctx.globalAlpha=1;
  // rim
  ctx.globalAlpha=0.2;ctx.lineWidth=1.8*S;
  ctx.beginPath();ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.stroke();ctx.globalAlpha=1;
  // side highlight
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx-wT+6*S,top+10*S);ctx.lineTo(cx-wT*0.5+4*S,top+(bot-top)*0.5);ctx.stroke();ctx.globalAlpha=1;

  // orange twist garnish for Negroni etc
  if(garnish==='twist'){
    ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.8*S;
    ctx.beginPath();ctx.moveTo(cx+wT-14*S,top-4*S);ctx.quadraticCurveTo(cx+wT+2*S,top-16*S,cx+wT-8*S,top+12*S);ctx.quadraticCurveTo(cx+wT+6*S,top,cx+wT-4*S,top+22*S);
    ctx.stroke();ctx.restore();
  }
}

/* HIGHBALL — tall narrow, straw */
function drawHighball(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/160,cx=W/2;
  const top=22*S,bot=H-20*S,wT=54*S,wB=46*S;
  const liqY=bot-(bot-top)*fillPct;

  function clip(){
    ctx.beginPath();
    ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.lineTo(cx+wB,bot);ctx.lineTo(cx-wB,bot);ctx.closePath();
  }

  drawLiquid(ctx,canvas,clip,bot,fillPct,4.7,t);

  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';

  // ice inside
  if(fillPct>0.3){
    ctx.save();clip();ctx.clip();
    drawIce(ctx,cx,liqY,bot,S,t,8*S);
    ctx.restore();
  }

  clip();ctx.stroke();
  // inner walls — side only
  const iT=8*S,iB=5*S;
  ctx.save();ctx.globalAlpha=0.22;
  ctx.beginPath();ctx.moveTo(cx-wT+iT,top);ctx.lineTo(cx-wB+iB,bot-4*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+wT-iT,top);ctx.lineTo(cx+wB-iB,bot-4*S);ctx.stroke();
  ctx.restore();
  // bottom arcs
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-wB+iB,bot-4*S);ctx.quadraticCurveTo(cx,bot+5*S,cx+wB-iB,bot-4*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-wB,bot);ctx.quadraticCurveTo(cx,bot+9*S,cx+wB,bot);ctx.stroke();ctx.globalAlpha=1;
  // rim
  ctx.globalAlpha=0.2;ctx.lineWidth=1.8*S;
  ctx.beginPath();ctx.moveTo(cx-wT,top);ctx.lineTo(cx+wT,top);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx-wT+5*S,top+10*S);ctx.lineTo(cx-wT*0.45+4*S,top+(bot-top)*0.46);ctx.stroke();ctx.globalAlpha=1;

  if(garnish==='straw'){
    // bas flotte sur la surface du liquide, haut se balance librement
    const swayTop = Math.sin(t*0.85)*5*S;
    const swayBot = Math.sin(t*0.85+0.7)*2*S;
    const bob     = Math.sin(t*1.3)*2.8*S;
    const sx = cx+wT*0.46;
    drawStraw(ctx, sx+swayTop, top-20*S, sx+swayBot, liqY+3*S+bob, 4.5*S);
  }
}

/* MARTINI — V-shaped, stem */
function drawMartini(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const rimY=24*S, tipY=Math.min(H*0.54,280*S);
  const rimW=88*S;

  function bowl(){
    ctx.beginPath();
    ctx.moveTo(cx-rimW,rimY);
    ctx.lineTo(cx,tipY);
    ctx.lineTo(cx+rimW,rimY);
    ctx.closePath();
  }

  drawLiquid(ctx,canvas,bowl,tipY,fillPct,3.2,t);

  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';

  // garnish
  if(garnish==='olive'&&fillPct>0){
    ctx.save();
    const oy=tipY-(tipY-rimY)*fillPct*0.4+Math.sin(t*0.8)*2*S;
    ctx.globalAlpha=0.55;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.5*S;
    // olive pick
    ctx.beginPath();ctx.moveTo(cx-20*S,rimY-8*S);ctx.lineTo(cx+14*S,oy+4*S);ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx-14*S,oy,5*S,3*S,0.3,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }
  if(garnish==='twist'){
    ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.7*S;
    ctx.beginPath();ctx.moveTo(cx+rimW-16*S,rimY+4*S);ctx.quadraticCurveTo(cx+rimW-2*S,rimY-10*S,cx+rimW-10*S,rimY+18*S);
    ctx.stroke();ctx.restore();
  }
  if(garnish==='salt'){
    ctx.save();ctx.globalAlpha=0.35;ctx.strokeStyle='rgba(232,228,220,0.85)';
    ctx.lineWidth=3*S;ctx.setLineDash([2.5,3]);
    ctx.beginPath();ctx.moveTo(cx-rimW,rimY);ctx.lineTo(cx+rimW,rimY);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
  }

  // outer V
  bowl();ctx.stroke();
  // inner V — only sides, no top
  ctx.save();ctx.globalAlpha=0.2;
  const iRimW=rimW-14*S;
  ctx.beginPath();ctx.moveTo(cx-iRimW,rimY);ctx.lineTo(cx,tipY-3*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+iRimW,rimY);ctx.lineTo(cx,tipY-3*S);ctx.stroke();
  ctx.restore();
  // concave tip
  ctx.globalAlpha=0.2;ctx.lineWidth=0.5*S;
  ctx.beginPath();ctx.moveTo(cx-18*S,tipY);ctx.quadraticCurveTo(cx,tipY+7*S,cx+18*S,tipY);ctx.stroke();ctx.globalAlpha=1;
  // stem
  ctx.lineWidth=0.9*S;
  ctx.beginPath();ctx.moveTo(cx,tipY);ctx.lineTo(cx,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx+3.5*S,tipY+2*S);ctx.lineTo(cx+3.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // base
  ctx.lineWidth=0.85*S;
  ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.lineTo(cx+50*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+50*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // rim
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;
  ctx.beginPath();ctx.moveTo(cx-rimW,rimY);ctx.lineTo(cx+rimW,rimY);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx-rimW+8*S,rimY+10*S);ctx.lineTo(cx-rimW*0.35,rimY+(tipY-rimY)*0.6);ctx.stroke();ctx.globalAlpha=1;
}

/* WINE — curved bowl, narrowing at neck, stem */
function drawWine(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const bowlTop=22*S, neckY=Math.min(H*0.46,240*S), bowlMidY=bowlTop+(neckY-bowlTop)*0.55;
  const rimW=50*S, bowlW=72*S, neckW=18*S;

  function bowl(){
    ctx.beginPath();
    ctx.moveTo(cx-rimW,bowlTop);
    ctx.bezierCurveTo(cx-bowlW,bowlTop+(neckY-bowlTop)*0.25, cx-bowlW,bowlTop+(neckY-bowlTop)*0.65, cx-neckW,neckY);
    ctx.lineTo(cx+neckW,neckY);
    ctx.bezierCurveTo(cx+bowlW,bowlTop+(neckY-bowlTop)*0.65, cx+bowlW,bowlTop+(neckY-bowlTop)*0.25, cx+rimW,bowlTop);
    ctx.closePath();
  }

  drawLiquid(ctx,canvas,bowl,neckY,fillPct,5.5,t);

  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';

  if(garnish==='twist'){
    ctx.save();ctx.globalAlpha=0.45;ctx.strokeStyle='rgba(232,228,220,0.7)';ctx.lineWidth=0.7*S;
    ctx.beginPath();ctx.moveTo(cx+rimW-14*S,bowlTop+4*S);ctx.quadraticCurveTo(cx+rimW+2*S,bowlTop-10*S,cx+rimW-8*S,bowlTop+18*S);
    ctx.stroke();ctx.restore();
  }

  // outer
  bowl();ctx.stroke();
  // inner wall — curves only, no top horizontal
  const iRW=rimW-14*S, iBW=bowlW-10*S, iNW=neckW-3*S;
  ctx.save();ctx.globalAlpha=0.2;
  ctx.beginPath();
  ctx.moveTo(cx-iRW,bowlTop);
  ctx.bezierCurveTo(cx-iBW,bowlTop+(neckY-bowlTop)*0.25,cx-iBW,bowlTop+(neckY-bowlTop)*0.65,cx-iNW,neckY-3*S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx+iRW,bowlTop);
  ctx.bezierCurveTo(cx+iBW,bowlTop+(neckY-bowlTop)*0.25,cx+iBW,bowlTop+(neckY-bowlTop)*0.65,cx+iNW,neckY-3*S);
  ctx.stroke();
  ctx.restore();
  // neck → base of stem
  ctx.lineWidth=0.85*S;
  ctx.beginPath();ctx.moveTo(cx-neckW,neckY);ctx.lineTo(cx-4*S,neckY+18*S);ctx.lineTo(cx-3*S,H-44*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+neckW,neckY);ctx.lineTo(cx+4*S,neckY+18*S);ctx.lineTo(cx+3*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx+5*S,neckY+4*S);ctx.lineTo(cx+4.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // base
  ctx.lineWidth=0.85*S;
  ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.lineTo(cx+50*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-50*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+50*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // rim
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;
  ctx.beginPath();ctx.moveTo(cx-rimW,bowlTop);ctx.lineTo(cx+rimW,bowlTop);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx-rimW+6*S,bowlTop+14*S);ctx.bezierCurveTo(cx-bowlW+4*S,bowlMidY,cx-bowlW*0.5,bowlMidY+20*S,cx-neckW+4*S,neckY-10*S);ctx.stroke();ctx.globalAlpha=1;
}

/* HURRICANE — tall curved tropical glass */
function drawHurricane(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/180,cx=W/2;
  const top=20*S, bot=H-20*S;
  const rimW=62*S, midW=34*S, baseW=50*S;
  const midY=top+(bot-top)*0.4;

  function clip(){
    ctx.beginPath();
    ctx.moveTo(cx-rimW,top);
    ctx.bezierCurveTo(cx-rimW*0.5,top+(bot-top)*0.15,cx-midW,midY-20*S,cx-midW,midY);
    ctx.bezierCurveTo(cx-midW,midY+20*S,cx-baseW*0.9,bot-30*S,cx-baseW,bot);
    ctx.lineTo(cx+baseW,bot);
    ctx.bezierCurveTo(cx+baseW*0.9,bot-30*S,cx+midW,midY+20*S,cx+midW,midY);
    ctx.bezierCurveTo(cx+midW,midY-20*S,cx+rimW*0.5,top+(bot-top)*0.15,cx+rimW,top);
    ctx.closePath();
  }

  drawLiquid(ctx,canvas,clip,bot,fillPct,6.1,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';

  // ice
  if(fillPct>0.3){
    ctx.save();clip();ctx.clip();
    drawIce(ctx,cx,bot-(bot-top)*fillPct,bot,S,t,5*S);
    ctx.restore();
  }

  clip();ctx.stroke();
  // inner walls — curves only, no top horizontal
  const iRW=rimW-14*S,iMW=midW-5*S,iBW=baseW-7*S;
  ctx.save();ctx.globalAlpha=0.2;
  ctx.beginPath();
  ctx.moveTo(cx-iRW,top);
  ctx.bezierCurveTo(cx-iRW*0.5,top+(bot-top)*0.15,cx-iMW,midY-20*S,cx-iMW,midY);
  ctx.bezierCurveTo(cx-iMW,midY+20*S,cx-iBW*0.9,bot-30*S,cx-iBW,bot-4*S);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx+iRW,top);
  ctx.bezierCurveTo(cx+iRW*0.5,top+(bot-top)*0.15,cx+iMW,midY-20*S,cx+iMW,midY);
  ctx.bezierCurveTo(cx+iMW,midY+20*S,cx+iBW*0.9,bot-30*S,cx+iBW,bot-4*S);
  ctx.stroke();
  ctx.restore();
  // bottom arc
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-baseW,bot);ctx.quadraticCurveTo(cx,bot+10*S,cx+baseW,bot);ctx.stroke();ctx.globalAlpha=1;
  // rim
  ctx.globalAlpha=0.18;ctx.lineWidth=1.8*S;
  ctx.beginPath();ctx.moveTo(cx-rimW,top);ctx.lineTo(cx+rimW,top);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx-rimW+8*S,top+14*S);ctx.bezierCurveTo(cx-rimW*0.4,top+(bot-top)*0.14,cx-midW+4*S,midY-14*S,cx-midW+4*S,midY+10*S);ctx.stroke();ctx.globalAlpha=1;

  if(garnish==='straw'){
    const liqSurf = bot-(bot-top)*fillPct;
    const swayTop = Math.sin(t*0.82)*6*S;
    const swayBot = Math.sin(t*0.82+0.7)*2.5*S;
    const bob     = Math.sin(t*1.2)*3*S;
    const sx = cx+rimW*0.48;
    drawStraw(ctx, sx+swayTop, top-22*S, sx+swayBot, liqSurf+3*S+bob, 4.5*S);
  }
}

/* FLUTE — champagne flute, tall narrow */
function drawFlute(ctx, canvas, fillPct, garnish, t){
  const W=canvas.width,H=canvas.height,S=W/200,cx=W/2;
  const top=20*S, bowlBot=H-85*S;
  const rimW=26*S, baseW=14*S;

  function clip(){
    ctx.beginPath();
    ctx.moveTo(cx-rimW,top);
    ctx.lineTo(cx-baseW,bowlBot);
    ctx.lineTo(cx+baseW,bowlBot);
    ctx.lineTo(cx+rimW,top);
    ctx.closePath();
  }

  drawLiquid(ctx,canvas,clip,bowlBot,fillPct,7.3,t);
  ctx.strokeStyle='rgba(232,228,220,0.85)';ctx.lineWidth=0.9*S;ctx.lineJoin='round';ctx.lineCap='round';

  // bubbles rising
  if(fillPct>0){
    ctx.save();clip();ctx.clip();
    const liqTop=bowlBot-(bowlBot-top)*fillPct;
    for(let i=0;i<6;i++){
      const bx=cx-10*S+i*4*S;
      const phase=t*0.8+i*1.1;
      const by=bowlBot-((phase%4)/4)*(bowlBot-liqTop);
      const br=0.8+Math.sin(i*2.3)*0.4;
      ctx.beginPath();ctx.arc(bx,by,br*S,0,Math.PI*2);
      ctx.strokeStyle='rgba(232,228,220,0.25)';ctx.lineWidth=0.4*S;ctx.stroke();
    }
    ctx.restore();
  }

  clip();ctx.stroke();
  // inner walls — sides only
  const iRW=rimW-8*S, iBW=baseW-3*S;
  ctx.save();ctx.globalAlpha=0.2;
  ctx.beginPath();ctx.moveTo(cx-iRW,top);ctx.lineTo(cx-iBW,bowlBot-3*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+iRW,top);ctx.lineTo(cx+iBW,bowlBot-3*S);ctx.stroke();
  ctx.restore();
  // bottom arc
  ctx.globalAlpha=0.2;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-baseW,bowlBot);ctx.quadraticCurveTo(cx,bowlBot+5*S,cx+baseW,bowlBot);ctx.stroke();ctx.globalAlpha=1;
  // stem
  ctx.lineWidth=0.85*S;
  ctx.beginPath();ctx.moveTo(cx-baseW,bowlBot);ctx.lineTo(cx-2*S,bowlBot+14*S);ctx.lineTo(cx-2*S,H-44*S);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+baseW,bowlBot);ctx.lineTo(cx+2*S,bowlBot+14*S);ctx.lineTo(cx+2*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx+3.5*S,bowlBot+6*S);ctx.lineTo(cx+3.5*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // base
  ctx.lineWidth=0.85*S;
  ctx.beginPath();ctx.moveTo(cx-46*S,H-44*S);ctx.lineTo(cx+46*S,H-44*S);ctx.stroke();
  ctx.globalAlpha=0.18;ctx.lineWidth=0.45*S;
  ctx.beginPath();ctx.moveTo(cx-46*S,H-44*S);ctx.quadraticCurveTo(cx,H-36*S,cx+46*S,H-44*S);ctx.stroke();ctx.globalAlpha=1;
  // rim
  ctx.globalAlpha=0.18;ctx.lineWidth=1.6*S;
  ctx.beginPath();ctx.moveTo(cx-rimW,top);ctx.lineTo(cx+rimW,top);ctx.stroke();ctx.globalAlpha=1;
  ctx.globalAlpha=0.12;ctx.lineWidth=0.4*S;
  ctx.beginPath();ctx.moveTo(cx-rimW+4*S,top+10*S);ctx.lineTo(cx-rimW*0.4+2*S,top+(bowlBot-top)*0.5);ctx.stroke();ctx.globalAlpha=1;
}

/* ── dispatch ── */
function drawGlass(ctx, canvas, type, fillPct, garnish, t){
  switch(type){
    case 'coupe':    drawCoupe(ctx,canvas,fillPct,garnish,t);    break;
    case 'rocks':    drawRocks(ctx,canvas,fillPct,garnish,t);    break;
    case 'highball': drawHighball(ctx,canvas,fillPct,garnish,t); break;
    case 'martini':  drawMartini(ctx,canvas,fillPct,garnish,t);  break;
    case 'wine':     drawWine(ctx,canvas,fillPct,garnish,t);     break;
    case 'hurricane':drawHurricane(ctx,canvas,fillPct,garnish,t);break;
    case 'flute':    drawFlute(ctx,canvas,fillPct,garnish,t);    break;
    default:         drawHighball(ctx,canvas,fillPct,garnish,t);
  }
}