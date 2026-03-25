import { useState, useEffect, useRef } from "react";

const STAFF_PIN = "1111";

const store = { log: [], goldenHour: "" };

const E = {
  gold:"#D4A843", pink:"#E87FA0", mint:"#7EC8A4",
  lavender:"#B48FD4", sky:"#7BBFE0", peach:"#F0A070",
  bg:"#0D0810", card:"#180D20",
};

function genCode(prefix) {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const s = () => Array.from({length:4},()=>c[Math.floor(Math.random()*c.length)]).join("");
  return `S11-${s()}-${prefix}`;
}
function saveLog(entry) {
  store.log.unshift({...entry, id: Date.now()});
  if(store.log.length > 200) store.log.pop();
}
function getLog() { return store.log; }
function getGoldenHour() { return store.goldenHour; }
function setGoldenHour(h) { store.goldenHour = h; }
function fmtDate(ts) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ── Prize tables ──────────────────────────────────────────────
function getDicePrize(d1, d2) {
  const sum=d1+d2, isDouble=d1===d2;
  if(isDouble&&d1===6) return {label:"JACKPOT!", prize:"Bill FREE", discount:100, icon:"🎰", color:E.gold, note:"Show this screen at billing", codePrefix:"JACK"};
  if(isDouble&&d1===5) return {label:"AMAZING!", prize:"50% Off", discount:50, icon:"🌸", color:E.pink, note:"50% off total bill", codePrefix:"AMAZ"};
  if(isDouble&&d1===4) return {label:"GLAM!", prize:"30% Off Nail Extension", discount:30, icon:"💅", color:E.lavender, note:"30% off nail extension service", codePrefix:"GLAM"};
  if(isDouble&&d1===3) return {label:"GLOW!", prize:"20% Off Hair Colour", discount:20, icon:"✨", color:E.mint, note:"20% off hair colour service", codePrefix:"GLOW"};
  if(isDouble&&d1===2) return {label:"TREAT!", prize:"Free Easter Nail Art", discount:0, icon:"🐣", color:E.peach, note:"Free Easter nail art design", codePrefix:"NAIL"};
  if(isDouble&&d1===1) return {label:"LUCKY!", prize:"Rs.200 Off", discount:0, icon:"🍀", color:E.mint, note:"Rs.200 off on bill above Rs.600", codePrefix:"L200"};
  if(sum>=11) return {label:"FRESH!", prize:"20% Off Haircut", discount:20, icon:"✂️", color:E.sky, note:"20% off haircut service", codePrefix:"FRSH"};
  if(sum>=9)  return {label:"NICE!",  prize:"15% Off", discount:15, icon:"🌷", color:E.pink, note:"15% off total bill", codePrefix:"NICE"};
  if(sum>=7)  return {label:"GOOD!",  prize:"10% Off", discount:10, icon:"🐰", color:E.lavender, note:"10% off total bill", codePrefix:"GOOD"};
  if(sum>=5)  return {label:"WARM!",  prize:"Rs.150 Off", discount:0, icon:"🌼", color:E.peach, note:"Rs.150 off on bill above Rs.500", codePrefix:"W150"};
  return       {label:"LUCKY!", prize:"Free Head Massage", discount:0, icon:"💆", color:E.mint, note:"Complimentary head massage", codePrefix:"HMSG"};
}

const JAR_PRIZES = [
  {label:"JACKPOT!", prize:"Bill FREE",              discount:100, icon:"🎰", color:E.gold,     weight:1,  note:"Show this screen at billing",             codePrefix:"JACK"},
  {label:"AMAZING!", prize:"50% Off",                discount:50,  icon:"🌸", color:E.pink,     weight:2,  note:"50% off total bill",                      codePrefix:"AMAZ"},
  {label:"GLAM!",    prize:"30% Off Nail Extension", discount:30,  icon:"💅", color:E.lavender, weight:4,  note:"30% off nail extension service",          codePrefix:"GLAM"},
  {label:"GLOW!",    prize:"25% Off Hair Colour",    discount:25,  icon:"✨", color:E.mint,     weight:5,  note:"25% off hair colour service",             codePrefix:"GLOW"},
  {label:"FRESH!",   prize:"20% Off Haircut",        discount:20,  icon:"✂️", color:E.sky,      weight:8,  note:"20% off haircut service",                 codePrefix:"FRSH"},
  {label:"TREAT!",   prize:"Free Easter Nail Art",   discount:0,   icon:"🐣", color:E.peach,    weight:6,  note:"Free Easter nail art design",             codePrefix:"NAIL"},
  {label:"SPRING!",  prize:"Free Head Massage",      discount:0,   icon:"💆", color:E.pink,     weight:8,  note:"Complimentary head massage",              codePrefix:"HMSG"},
  {label:"BLOOM!",   prize:"Rs.300 Off",             discount:0,   icon:"🌷", color:E.lavender, weight:6,  note:"Rs.300 off on bill above Rs.1000",        codePrefix:"B300"},
  {label:"SWEET!",   prize:"Rs.150 Off",             discount:0,   icon:"🌼", color:E.gold,     weight:10, note:"Rs.150 off on bill above Rs.500",         codePrefix:"W150"},
];

function pickJarPrize() {
  const total = JAR_PRIZES.reduce((s,x) => s+x.weight, 0);
  let r = Math.random()*total;
  for(const p of JAR_PRIZES){ r -= p.weight; if(r<=0) return p; }
  return JAR_PRIZES[JAR_PRIZES.length-1];
}

const GOLDEN_PRIZE = {label:"GOLDEN HOUR!", prize:"40% Off", discount:40, icon:"⭐", color:E.gold,  note:"40% off total bill — Golden Hour winner!", codePrefix:"GOLD"};
const CONSOLATION  = {label:"EASTER TREAT!", prize:"Rs.200 Off", discount:0, icon:"🐣", color:E.pink, note:"Rs.200 off on bill above Rs.600",        codePrefix:"CONS"};

// ── Confetti ──────────────────────────────────────────────────
function Confetti({active}) {
  const cvs = useRef(), af = useRef();
  useEffect(() => {
    if(!active) return;
    const c = cvs.current; if(!c) return;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth; c.height = window.innerHeight;
    const cols = [E.pink, E.mint, E.lavender, E.sky, E.peach, E.gold, "#fff"];
    const pts = Array.from({length:150}, () => ({
      x: Math.random()*c.width, y: -20,
      w: Math.random()*12+4, h: Math.random()*6+3,
      vx: (Math.random()-0.5)*3, vy: Math.random()*3+1,
      rot: Math.random()*360, rs: (Math.random()-0.5)*8,
      color: cols[Math.floor(Math.random()*cols.length)],
      o: 1
    }));
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      for(const p of pts) {
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.rs; p.vy+=0.07; p.o-=0.007;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
        ctx.globalAlpha=Math.max(0,p.o); ctx.fillStyle=p.color;
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      }
      pts.splice(0,pts.length,...pts.filter(p=>p.o>0&&p.y<c.height+50));
      if(pts.length>0) af.current = requestAnimationFrame(draw);
    };
    af.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(af.current);
  }, [active]);
  if(!active) return null;
  return <canvas ref={cvs} style={{position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:999,width:"100%",height:"100%"}}/>;
}

// ── Layout ────────────────────────────────────────────────────
function Bg({children}) {
  return (
    <div style={{minHeight:"100vh",background:E.bg,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px",gap:14}}>
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 50% 30%,#1a0a2e 0%,${E.bg} 70%)`,zIndex:0,pointerEvents:"none"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {["🌸","🌷","🐣","🌼","🦋","🌺","🐰","🌸","🌷","🐥"].map((e,i)=>(
          <div key={i} style={{position:"absolute",left:`${8+i*9}%`,top:`${15+((i*37)%70)}%`,
            fontSize:16,opacity:0.08,animation:`floatBg ${3+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}>{e}</div>
        ))}
      </div>
      <style>{`@keyframes floatBg{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(8deg)}}`}</style>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:420,display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
        {children}
      </div>
    </div>
  );
}

function Logo({sub}) {
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:9,letterSpacing:6,color:E.gold,textTransform:"uppercase",marginBottom:2}}>✦ Studio 11 ✦</div>
      <div style={{fontSize:13,color:"#fff",fontWeight:"bold",letterSpacing:1}}>🐣 Easter Lucky Draw</div>
      {sub && <div style={{fontSize:9,letterSpacing:3,color:"#ffffff33",textTransform:"uppercase",marginTop:2}}>{sub}</div>}
    </div>
  );
}

function RainbowLine() {
  return <div style={{width:"100%",height:2,background:`linear-gradient(to right,${E.pink},${E.lavender},${E.sky},${E.mint},${E.gold},${E.peach},${E.pink})`,borderRadius:2}}/>;
}

function Card({children, style={}}) {
  return <div style={{width:"100%",borderRadius:16,background:E.card,border:`1px solid ${E.pink}22`,padding:"14px",...style}}>{children}</div>;
}

// ── Staff Login ───────────────────────────────────────────────
function StaffLogin({onLogin}) {
  const [pin,setPin] = useState(""), [err,setErr] = useState(false);
  const handle = (d) => {
    const next = pin.length<4 ? pin+d : pin;
    setPin(next); setErr(false);
    if(next.length===4) {
      if(next===STAFF_PIN) { setTimeout(()=>onLogin(), 200); }
      else { setErr(true); setTimeout(()=>setPin(""), 600); }
    }
  };
  return (
    <Bg>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      <div style={{fontSize:40,marginBottom:4}}>🐣</div>
      <Logo sub="Staff Access"/>
      <RainbowLine/>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:20,fontWeight:"bold",color:"#FDF6E3",marginBottom:4}}>Staff Dashboard</div>
        <div style={{fontSize:11,color:`${E.pink}88`}}>Enter your PIN to continue</div>
      </div>
      <div style={{display:"flex",gap:16,margin:"8px 0",animation:err?"shake 0.4s ease":"none"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:16,height:16,borderRadius:"50%",background:i<pin.length?E.pink:"transparent",border:`2px solid ${err?"#ff8866":E.pink}`,transition:"background 0.2s"}}/>)}
      </div>
      {err && <div style={{fontSize:11,color:"#ff8866"}}>Wrong PIN. Try again.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:"100%",maxWidth:280}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"X"].map((d,i)=>(
          <button key={i} onClick={()=>{if(d==="X"){setPin(p=>p.slice(0,-1));setErr(false);}else if(d!=="")handle(String(d));}}
            style={{padding:"18px 0",borderRadius:12,border:`1px solid ${E.lavender}22`,background:E.card,color:"#FDF6E3",fontSize:18,fontWeight:"bold",cursor:d===""?"default":"pointer",opacity:d===""?0:1}}>
            {d}
          </button>
        ))}
      </div>
      <div style={{fontSize:9,color:"#ffffff12",letterSpacing:2}}>Default PIN: 1111</div>
    </Bg>
  );
}

// ── Staff Dashboard ───────────────────────────────────────────
function StaffDashboard({onGame, onLog, onLogout}) {
  const [gh,setGhState] = useState(getGoldenHour());
  const [saved,setSaved] = useState(false);
  const log = getLog();
  const today = log.filter(e=>new Date(e.ts).toDateString()===new Date().toDateString());
  const thisMonth = log.filter(e=>new Date(e.ts).getMonth()===new Date().getMonth());
  const saveGH = (h) => { setGoldenHour(h); setGhState(h); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const GAMES = [
    {key:"dice",   icon:"🎲", label:"Roll the Dice",   sub:"Easter prize table at billing counter", color:E.pink},
    {key:"jar",    icon:"🧺", label:"Easter Egg Jar",   sub:"Pull a lucky chit from the egg basket", color:E.mint},
    {key:"golden", icon:"⭐", label:"Golden Hour",      sub:"Check if client hit the golden hour",   color:E.gold},
  ];
  return (
    <Bg>
      <div style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Logo sub="Staff Dashboard"/>
        <button onClick={onLogout} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${E.pink}44`,background:"transparent",color:E.pink,fontSize:11,cursor:"pointer"}}>Logout</button>
      </div>
      <RainbowLine/>
      <div style={{width:"100%",display:"flex",gap:10}}>
        {[{l:"Today",v:today.length,c:E.pink},{l:"Month",v:thisMonth.length,c:E.mint},{l:"Total",v:log.length,c:E.lavender}].map((s,i)=>(
          <div key={i} style={{flex:1,padding:"12px 8px",borderRadius:12,background:E.card,border:`1px solid ${s.c}22`,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:"bold",color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,color:"#ffffff44",letterSpacing:1,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{width:"100%"}}>
        <div style={{fontSize:10,letterSpacing:4,color:`${E.gold}88`,textTransform:"uppercase",marginBottom:10}}>Select Game</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {GAMES.map(g=>(
            <button key={g.key} onClick={()=>onGame(g.key)} style={{width:"100%",padding:"16px",borderRadius:14,border:`1px solid ${g.color}33`,background:E.card,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:32}}>{g.icon}</span>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontSize:15,fontWeight:"bold",color:g.color,letterSpacing:1}}>{g.label}</div>
                <div style={{fontSize:11,color:"#ffffff33",marginTop:2}}>{g.sub}</div>
              </div>
              <span style={{fontSize:18,color:`${g.color}66`}}>›</span>
            </button>
          ))}
        </div>
      </div>
      <Card style={{border:`1px solid ${E.gold}33`}}>
        <div style={{fontSize:10,letterSpacing:3,color:`${E.gold}88`,textTransform:"uppercase",marginBottom:10}}>⭐ Golden Hour Setting</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={gh} onChange={e=>setGhState(e.target.value)}
            style={{flex:1,padding:"10px 12px",borderRadius:10,background:E.bg,border:`1px solid ${E.gold}44`,color:E.gold,fontSize:13,cursor:"pointer"}}>
            <option value="">-- Select Hour --</option>
            {Array.from({length:12},(_,i)=>{
              const h = i+9;
              const label = `${h<=12?h:h-12}:00 ${h<12?"AM":"PM"} - ${h+1<=12?h+1:(h+1-12)}:00 ${(h+1)<12?"AM":"PM"}`;
              return <option key={h} value={String(h)}>{label}</option>;
            })}
          </select>
          <button onClick={()=>saveGH(gh)} style={{padding:"10px 16px",borderRadius:10,border:`1px solid ${E.gold}55`,background:`${E.gold}22`,color:E.gold,fontSize:13,fontWeight:"bold",cursor:"pointer"}}>
            {saved?"Saved!":"Set"}
          </button>
        </div>
        {gh && <div style={{fontSize:11,color:`${E.gold}66`,marginTop:8}}>🔒 Golden hour set — staff only view</div>}
      </Card>
      <button onClick={onLog} style={{width:"100%",padding:"13px",borderRadius:12,border:`1px solid ${E.lavender}33`,background:E.card,color:E.lavender,fontSize:13,cursor:"pointer"}}>
        View Claims Log ({log.length})
      </button>
    </Bg>
  );
}

// ── Dice Face ─────────────────────────────────────────────────
function DiceFace({value, size=80}) {
  const dots = {1:[[50,50]],2:[[25,25],[75,75]],3:[[25,25],[50,50],[75,75]],4:[[25,25],[75,25],[25,75],[75,75]],5:[[25,25],[75,25],[50,50],[25,75],[75,75]],6:[[25,22],[75,22],[25,50],[75,50],[25,78],[75,78]]};
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="4" y="4" width="92" height="92" rx="18" fill={E.card} stroke={E.pink} strokeWidth="2"/>
      {(dots[value]||[]).map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="8" fill={E.mint}/>)}
    </svg>
  );
}

// ── Dice Game ─────────────────────────────────────────────────
function DiceGame({onBack, onResult}) {
  const [d1,setD1] = useState(1), [d2,setD2] = useState(2);
  const [rolling,setRolling] = useState(false), [done,setDone] = useState(false), [prize,setPrize] = useState(null);
  const ivRef = useRef(null);
  const roll = () => {
    if(rolling||done) return;
    setRolling(true); let ticks=0;
    ivRef.current = setInterval(()=>{
      setD1(Math.ceil(Math.random()*6)); setD2(Math.ceil(Math.random()*6)); ticks++;
      if(ticks>20) {
        clearInterval(ivRef.current);
        const f1=Math.ceil(Math.random()*6), f2=Math.ceil(Math.random()*6);
        setD1(f1); setD2(f2); setRolling(false); setDone(true);
        const p = getDicePrize(f1,f2);
        const result = {...p, code:genCode(p.codePrefix), game:"Roll the Dice", ts:Date.now()};
        setPrize(result);
        setTimeout(()=>onResult(result), 2000);
      }
    }, 80);
  };
  useEffect(()=>()=>clearInterval(ivRef.current),[]);
  return (
    <Bg>
      <style>{`@keyframes diceShake{0%,100%{transform:rotate(0) scale(1)}25%{transform:rotate(-15deg) scale(1.1)}75%{transform:rotate(15deg) scale(1.1)}}`}</style>
      <div style={{width:"100%",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${E.pink}44`,background:"transparent",color:E.pink,fontSize:11,cursor:"pointer"}}>← Back</button>
        <Logo sub="Roll the Dice"/>
      </div>
      <RainbowLine/>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:20,fontWeight:"bold",color:"#FDF6E3",marginBottom:4}}>{done?"Your Easter Prize is Ready!":"Roll for Your Easter Prize!"}</div>
        <div style={{fontSize:12,color:`${E.pink}66`}}>{done?"Prize locked — staff will reveal at billing":"Tap the button to roll the dice"}</div>
      </div>
      <div style={{display:"flex",gap:24,alignItems:"center",margin:"8px 0"}}>
        <div style={{animation:rolling?"diceShake 0.15s ease infinite":"none",filter:done?`drop-shadow(0 0 12px ${E.pink})`:"none"}}><DiceFace value={d1} size={90}/></div>
        <div style={{fontSize:28,color:`${E.mint}66`,fontWeight:"bold"}}>+</div>
        <div style={{animation:rolling?"diceShake 0.15s ease infinite 0.05s":"none",filter:done?`drop-shadow(0 0 12px ${E.mint})`:"none"}}><DiceFace value={d2} size={90}/></div>
      </div>
      {done && <div style={{fontSize:22,color:`${E.lavender}99`,fontWeight:"bold"}}>= {d1+d2} {d1===d2?"🎉 Double!":""}</div>}
      {done && prize && (
        <Card style={{textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:6}}>🎉</div>
          <div style={{fontSize:15,fontWeight:"bold",color:E.pink,marginBottom:4}}>Prize Locked!</div>
          <div style={{fontSize:12,color:`${E.pink}55`,lineHeight:1.7}}>Great roll! Easter prize is locked in.<br/>Staff will reveal it at billing.</div>
        </Card>
      )}
      {!done && (
        <Card>
          <div style={{fontSize:9,letterSpacing:3,color:`${E.lavender}66`,textTransform:"uppercase",marginBottom:10}}>Easter Prize Table</div>
          {[["🎰","Double 6","Bill FREE"],["🌸","Double 5","50% Off"],["💅","Double 4","30% Off Nail Ext"],["✨","Double 3","20% Off Hair Colour"],["🐣","Double 2","Free Nail Art"],["🍀","Double 1","Rs.200 Off"],["✂️","Sum 11+","20% Off Haircut"],["🌷","Sum 9-10","15% Off"],["🐰","Sum 7-8","10% Off"],["🌼","Sum 5-6","Rs.150 Off"],["💆","Sum 2-4","Free Head Massage"]].map(([icon,combo,p])=>(
            <div key={combo} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
              <span style={{fontSize:14}}>{icon}</span>
              <span style={{flex:1,fontSize:11,color:"#ffffff33"}}>{combo}</span>
              <span style={{fontSize:11,color:`${E.mint}88`}}>{p}</span>
            </div>
          ))}
        </Card>
      )}
      {!done && (
        <button onClick={roll} style={{width:"100%",padding:"16px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${E.pink},${E.lavender})`,color:"#fff",fontSize:16,fontWeight:"bold",cursor:"pointer"}}>
          Roll the Dice! 🎲
        </button>
      )}
    </Bg>
  );
}

// ── Jar Game ──────────────────────────────────────────────────
function JarGame({onBack, onResult}) {
  const [pulled,setPulled] = useState(false), [animating,setAnimating] = useState(false), [prize,setPrize] = useState(null);
  const handlePull = () => {
    if(pulled||animating) return;
    setAnimating(true);
    setTimeout(()=>{
      const p = pickJarPrize();
      const result = {...p, code:genCode(p.codePrefix), game:"Easter Egg Jar", ts:Date.now()};
      setPrize(result); setPulled(true); setAnimating(false);
      setTimeout(()=>onResult(result), 2000);
    }, 1000);
  };
  return (
    <Bg>
      <style>{`@keyframes floatEgg{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes eggglow{0%,100%{filter:drop-shadow(0 0 8px ${E.peach}44)}50%{filter:drop-shadow(0 0 20px ${E.peach}88)}}@keyframes revealEgg{0%{transform:scale(0.5) rotate(-10deg);opacity:0}70%{transform:scale(1.1) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}`}</style>
      <div style={{width:"100%",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${E.mint}44`,background:"transparent",color:E.mint,fontSize:11,cursor:"pointer"}}>← Back</button>
        <Logo sub="Easter Egg Jar"/>
      </div>
      <RainbowLine/>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:20,fontWeight:"bold",color:"#FDF6E3",marginBottom:4}}>{pulled?"Your Easter Egg is Ready!":"Pull Your Easter Egg!"}</div>
        <div style={{fontSize:12,color:`${E.mint}66`}}>{pulled?"Staff will reveal your prize at billing":"Tap the basket to pull your lucky egg"}</div>
      </div>
      <div style={{position:"relative",width:200,height:230,cursor:pulled?"default":"pointer"}} onClick={handlePull}>
        {!pulled && !animating && ["🌸","🌷","🐣","🐰","🌼"].map((e,i)=>(
          <div key={i} style={{position:"absolute",top:-8+i*4,left:48+i*20,fontSize:18,animation:`floatEgg ${1.2+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}>{e}</div>
        ))}
        <svg width="200" height="230" viewBox="0 0 200 230" style={{animation:"eggglow 2s ease-in-out infinite"}}>
          <defs>
            <linearGradient id="bskt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a1a10"/>
              <stop offset="100%" stopColor="#1a0d08"/>
            </linearGradient>
          </defs>
          <path d="M40,80 Q30,90 28,120 L25,200 Q25,215 100,215 Q175,215 175,200 L172,120 Q170,90 160,80 Z" fill="url(#bskt)" stroke={E.peach} strokeWidth="1.5"/>
          {[0,1,2,3].map(i=><line key={i} x1="30" y1={100+i*28} x2="170" y2={100+i*28} stroke={E.peach} strokeWidth="1" opacity="0.3"/>)}
          {[0,1,2,3,4,5].map(i=><line key={i} x1={40+i*24} y1="80" x2={35+i*24} y2="215" stroke={E.peach} strokeWidth="1" opacity="0.2"/>)}
          <path d="M60,80 Q60,30 100,25 Q140,20 140,80" fill="none" stroke={E.peach} strokeWidth="3"/>
          <text x="100" y="52" textAnchor="middle" fontSize="18">🧺</text>
          {!pulled && ["🥚","🐣","🥚","🐣","🥚"].map((em,i)=>(
            <text key={i} x={[68,100,130,84,116][i]} y={[155,143,155,172,170][i]} textAnchor="middle" fontSize="16">{em}</text>
          ))}
          <text x="100" y="205" textAnchor="middle" fill={E.peach} fontSize="10" fontFamily="sans-serif">Easter Lucky Jar</text>
        </svg>
        {!pulled && !animating && <div style={{position:"absolute",bottom:-28,left:0,right:0,textAlign:"center",fontSize:11,color:`${E.peach}88`}}>Tap to pull your egg 🐣</div>}
      </div>
      {pulled && prize && (
        <Card style={{textAlign:"center",animation:"revealEgg 0.6s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div style={{fontSize:32,marginBottom:6}}>🥚</div>
          <div style={{fontSize:15,fontWeight:"bold",color:E.mint,marginBottom:4}}>Easter Egg Pulled!</div>
          <div style={{fontSize:12,color:`${E.mint}55`,lineHeight:1.7}}>Staff will reveal your prize at billing.</div>
        </Card>
      )}
      {!pulled && !animating && (
        <button onClick={handlePull} style={{width:"100%",padding:"15px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${E.mint},${E.sky})`,color:"#fff",fontSize:15,fontWeight:"bold",cursor:"pointer"}}>
          Pull Your Lucky Egg! 🥚
        </button>
      )}
      {animating && <div style={{fontSize:14,color:E.mint,animation:"floatEgg 0.5s ease infinite"}}>Reaching into the basket... 🧺</div>}
    </Bg>
  );
}

// ── Golden Hour ───────────────────────────────────────────────
function GoldenHourGame({onBack, onResult}) {
  const gh = getGoldenHour();
  const currentHour = new Date().getHours();
  const isGolden = gh && String(currentHour)===gh;
  const [revealed,setRevealed] = useState(false);
  const handleReveal = () => {
    setRevealed(true);
    const prize = isGolden ? GOLDEN_PRIZE : CONSOLATION;
    const result = {...prize, code:genCode(prize.codePrefix), game:"Golden Hour", ts:Date.now(), isGolden};
    setTimeout(()=>onResult(result), 2000);
  };
  return (
    <Bg>
      <style>{`@keyframes starSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.2)}100%{transform:rotate(360deg) scale(1)}}@keyframes sadBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{width:"100%",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${E.gold}44`,background:"transparent",color:E.gold,fontSize:11,cursor:"pointer"}}>← Back</button>
        <Logo sub="Golden Hour"/>
      </div>
      <RainbowLine/>
      {!gh && (
        <Card><div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:24,marginBottom:8}}>⚠️</div>
          <div style={{fontSize:14,color:"#ff8866",marginBottom:4}}>Golden Hour Not Set</div>
          <div style={{fontSize:11,color:"#ffffff33"}}>Go back to dashboard and set today's golden hour.</div>
        </div></Card>
      )}
      {gh && !revealed && (
        <>
          <div style={{width:180,height:180,borderRadius:"50%",background:`radial-gradient(circle,${isGolden?E.gold+"33":"#ffffff0a"},transparent)`,border:`2px solid ${isGolden?E.gold+"66":"#ffffff11"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <div style={{fontSize:52,animation:isGolden?"starSpin 3s ease infinite":"sadBounce 2s ease infinite"}}>{isGolden?"⭐":"🐣"}</div>
            <div style={{fontSize:11,color:isGolden?E.gold:`${E.gold}55`,letterSpacing:2,marginTop:4,textAlign:"center"}}>{isGolden?"GOLDEN HOUR!":"Current Hour"}</div>
            <div style={{fontSize:20,fontWeight:"bold",color:isGolden?"#FDF6E3":`${E.gold}88`}}>
              {new Date().getHours()>12?new Date().getHours()-12:new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,"0")} {new Date().getHours()<12?"AM":"PM"}
            </div>
          </div>
          {isGolden ? (
            <div style={{textAlign:"center",animation:"fadeUp 0.5s ease"}}>
              <div style={{fontSize:22,fontWeight:"bold",color:E.gold,marginBottom:6}}>⭐ GOLDEN HOUR!</div>
              <div style={{fontSize:13,color:`${E.gold}88`,lineHeight:1.8}}>You arrived at the magical hour!<br/>Claim your special Easter prize!</div>
            </div>
          ) : (
            <div style={{textAlign:"center",animation:"fadeUp 0.5s ease"}}>
              <div style={{fontSize:18,fontWeight:"bold",color:"#FDF6E3",marginBottom:6}}>Not the Golden Hour yet</div>
              <div style={{fontSize:12,color:`${E.gold}55`,lineHeight:1.8}}>But you still get an Easter treat! 🐣</div>
            </div>
          )}
          <button onClick={handleReveal} style={{width:"100%",padding:"15px",borderRadius:50,border:"none",background:isGolden?`linear-gradient(135deg,${E.gold},${E.peach})`:`linear-gradient(135deg,${E.pink},${E.lavender})`,color:"#fff",fontSize:15,fontWeight:"bold",cursor:"pointer"}}>
            {isGolden?"Claim Golden Prize! ⭐":"Claim Easter Treat 🐣"}
          </button>
        </>
      )}
      {revealed && (
        <Card style={{textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:6}}>{isGolden?"⭐":"🐣"}</div>
          <div style={{fontSize:14,fontWeight:"bold",color:E.gold,marginBottom:4}}>Prize Confirmed!</div>
          <div style={{fontSize:12,color:`${E.gold}55`}}>Prize locked in — staff will reveal at billing.</div>
        </Card>
      )}
    </Bg>
  );
}

// ── Result / Prize Reveal (NO name, NO phone, NO WhatsApp) ────
function ResultClaim({prize, onDone}) {
  const [con,setCon] = useState(false);
  useEffect(()=>{ setCon(true); setTimeout(()=>setCon(false),4000); },[]);

  const handleDone = () => {
    saveLog(prize);
    onDone(prize);
  };

  return (
    <Bg>
      <style>{`@keyframes scaleIn{from{transform:scale(0.6);opacity:0}to{transform:scale(1);opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}`}</style>
      <Confetti active={con}/>
      <Logo sub={prize.game}/>
      <RainbowLine/>

      {/* Prize card */}
      <div style={{width:"100%",borderRadius:20,overflow:"hidden",border:`2px solid ${prize.color}44`,animation:"scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{background:`linear-gradient(135deg,${E.card},${E.bg})`,padding:"20px",textAlign:"center"}}>
          <div style={{fontSize:9,letterSpacing:5,color:`${E.gold}66`,textTransform:"uppercase",marginBottom:8}}>✦ Easter Lucky Draw ✦</div>
          <div style={{fontSize:38,marginBottom:6}}>{prize.icon}</div>
          <div style={{fontSize:16,fontWeight:"bold",color:prize.color,letterSpacing:2,marginBottom:8}}>{prize.label}</div>
          <div style={{fontSize:44,fontWeight:"bold",color:"#FDF6E3",lineHeight:1}}>{prize.discount>0?`${prize.discount}% Off`:prize.prize}</div>
          {prize.discount>0 && <div style={{fontSize:16,color:`${prize.color}88`,marginTop:4}}>{prize.prize}</div>}
          {prize.note && <div style={{fontSize:11,color:`${prize.color}77`,marginTop:6}}>{prize.note}</div>}
        </div>
        <div style={{background:E.bg,padding:"14px"}}>
          <div style={{padding:"12px",borderRadius:12,background:E.card,border:`2px dashed ${prize.color}44`,textAlign:"center"}}>
            <div style={{fontSize:8,letterSpacing:4,color:`${prize.color}55`,textTransform:"uppercase",marginBottom:4}}>Claim Code</div>
            <div style={{fontSize:22,fontWeight:"bold",color:prize.color,fontFamily:"monospace",letterSpacing:3}}>{prize.code}</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <Card style={{textAlign:"center"}}>
        <div style={{fontSize:13,color:"#FDF6E3",marginBottom:6}}>🎉 Show this screen at billing!</div>
        <div style={{fontSize:11,color:"#ffffff44",lineHeight:1.7}}>Your prize has been saved to the claims log.<br/>Staff will apply your discount at checkout.</div>
      </Card>

      {/* Done button */}
      <button onClick={handleDone}
        style={{width:"100%",padding:"14px",borderRadius:50,border:"none",background:`linear-gradient(135deg,${prize.color},${E.lavender})`,color:"#fff",fontSize:15,fontWeight:"bold",cursor:"pointer"}}>
        Done — Show Staff 🎊
      </button>
    </Bg>
  );
}

// ── Claims Log ────────────────────────────────────────────────
function LogScreen({onBack, onClear}) {
  const [filter,setFilter] = useState("all");
  const log = getLog();
  const filtered = filter==="all" ? log : log.filter(e=>e.game===filter);
  return (
    <Bg>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{width:"100%",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${E.lavender}44`,background:"transparent",color:E.lavender,fontSize:11,cursor:"pointer"}}>← Back</button>
        <Logo sub="Claims Log"/>
      </div>
      <RainbowLine/>
      <div style={{display:"flex",gap:6,width:"100%",flexWrap:"wrap"}}>
        {["all","Roll the Dice","Easter Egg Jar","Golden Hour"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${filter===f?E.pink:E.pink+"33"}`,background:filter===f?`${E.pink}22`:"transparent",color:filter===f?E.pink:"#ffffff55",fontSize:11,cursor:"pointer"}}>
            {f==="all"?"All":f}
          </button>
        ))}
      </div>
      {filtered.length===0 && <div style={{textAlign:"center",padding:"32px 0",color:`${E.mint}66`,fontSize:13}}>No claims yet 🐣</div>}
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:8,maxHeight:"55vh",overflowY:"auto"}}>
        {filtered.map((e,i)=>(
          <div key={e.id||i} style={{padding:"12px 14px",borderRadius:12,background:E.card,border:`1px solid ${e.color||E.pink}22`,animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <div><span style={{fontSize:16,marginRight:6}}>{e.icon}</span><span style={{fontSize:12,fontWeight:"bold",color:e.color||E.pink}}>{e.label}</span></div>
              <span style={{fontSize:10,color:"#ffffff33"}}>{fmtDate(e.ts)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
              <span style={{fontSize:11,fontWeight:"bold",color:"#FDF6E3"}}>{e.prize}</span>
              <span style={{fontSize:10,color:`${E.gold}55`,fontFamily:"monospace"}}>{e.code}</span>
            </div>
            <div style={{fontSize:10,color:"#ffffff22",marginTop:2}}>{e.game}</div>
          </div>
        ))}
      </div>
      {log.length>0 && (
        <button onClick={onClear} style={{padding:"8px 20px",borderRadius:8,border:"1px solid #ff886633",background:"transparent",color:"#ff8866",fontSize:12,cursor:"pointer"}}>
          Clear All Logs
        </button>
      )}
    </Bg>
  );
}

// ── Final Voucher ─────────────────────────────────────────────
function FinalVoucher({data, onBack}) {
  const d = new Date(data.ts);
  const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  return (
    <Bg>
      <style>{`@keyframes scaleIn{from{transform:scale(0.6);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
      <Logo sub={data.game}/>
      <RainbowLine/>
      <div style={{fontSize:11,color:"#ffffff18",textAlign:"center"}}>Client can screenshot this voucher</div>
      <div style={{width:"100%",borderRadius:20,overflow:"hidden",border:`1px solid ${data.color}44`,animation:"scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{background:`linear-gradient(135deg,${E.card},${E.bg})`,padding:"20px",textAlign:"center"}}>
          <div style={{fontSize:9,letterSpacing:5,color:`${E.gold}55`,textTransform:"uppercase",marginBottom:8}}>✦ Studio 11 Easter Lucky Draw ✦</div>
          <div style={{fontSize:32,marginBottom:5}}>{data.icon}</div>
          <div style={{fontSize:16,fontWeight:"bold",color:data.color,letterSpacing:2,marginBottom:6}}>{data.label}</div>
          <div style={{fontSize:42,fontWeight:"bold",color:"#FDF6E3",lineHeight:1}}>{data.discount>0?`${data.discount}% Off`:data.prize}</div>
          {data.discount>0 && <div style={{fontSize:15,color:`${data.color}88`,marginTop:4}}>{data.prize}</div>}
          {data.note && <div style={{fontSize:11,color:`${data.color}77`,marginTop:5}}>{data.note}</div>}
        </div>
        <div style={{background:E.bg,padding:"14px"}}>
          <div style={{padding:"12px",borderRadius:12,background:E.card,border:`2px dashed ${data.color}44`,textAlign:"center"}}>
            <div style={{fontSize:8,letterSpacing:4,color:`${data.color}55`,textTransform:"uppercase",marginBottom:4}}>Claim Code</div>
            <div style={{fontSize:22,fontWeight:"bold",color:data.color,fontFamily:"monospace",letterSpacing:3}}>{data.code}</div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"9px 11px",borderTop:`1px solid ${data.color}11`,marginTop:8}}>
            <div><div style={{fontSize:7,color:"#ffffff18"}}>VALID AT</div><div style={{fontSize:11,color:`${data.color}66`}}>Studio 11</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:7,color:"#ffffff18"}}>DATE</div><div style={{fontSize:11,color:`${data.color}66`}}>{dateStr}</div></div>
          </div>
        </div>
      </div>
      <button onClick={onBack} style={{width:"100%",padding:"13px",borderRadius:12,border:`1px solid ${E.pink}33`,background:E.card,color:E.pink,fontSize:13,cursor:"pointer"}}>
        New Easter Game 🐣
      </button>
      <div style={{fontSize:9,letterSpacing:2,color:"#ffffff0e",textTransform:"uppercase",textAlign:"center"}}>Studio 11 · Easter 2025</div>
    </Bg>
  );
}

// ── Root ──────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen] = useState("login");
  const [prize,setPrize]   = useState(null);
  const [final,setFinal]   = useState(null);
  const [tick,setTick]     = useState(0);
  const goBack = () => setScreen("dashboard");
  const handleClear = () => { store.log=[]; setTick(t=>t+1); goBack(); };

  if(screen==="login")     return <StaffLogin onLogin={()=>setScreen("dashboard")}/>;
  if(screen==="dashboard") return <StaffDashboard key={tick} onGame={g=>setScreen(g)} onLog={()=>setScreen("log")} onLogout={()=>setScreen("login")}/>;
  if(screen==="log")       return <LogScreen onBack={goBack} onClear={handleClear}/>;
  if(screen==="dice")      return <DiceGame onBack={goBack} onResult={p=>{setPrize(p);setScreen("result");}}/>;
  if(screen==="jar")       return <JarGame  onBack={goBack} onResult={p=>{setPrize(p);setScreen("result");}}/>;
  if(screen==="golden")    return <GoldenHourGame onBack={goBack} onResult={p=>{setPrize(p);setScreen("result");}}/>;
  if(screen==="result")    return <ResultClaim prize={prize} onDone={d=>{setFinal(d);setScreen("voucher");}}/>;
  if(screen==="voucher")   return <FinalVoucher data={final} onBack={goBack}/>;
  return null;
}
