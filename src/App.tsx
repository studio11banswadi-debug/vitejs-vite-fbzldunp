import { useState, useRef } from "react";

const PIN_CODE = "1111";
const MAX_CLAIMS = 200;
const HOURS = Array.from({length:24},(_,i)=>({value:i,label:`${(i%12)||12}:00 ${i<12?"AM":"PM"}`}));

const ALL_PRIZES = [
  {label:"BILL FREE!",                                                     emoji:"🏆",tier:"legendary",weight:1, big:true},
  {label:"50% Off",                                                        emoji:"🥇",tier:"epic",     weight:1, big:true},
  {label:"30% Off",                                                        emoji:"🥈",tier:"rare",     weight:9        },
  {label:"20% Off",                                                        emoji:"🥉",tier:"rare",     weight:18       },
  {label:"Free Head Massage",                                              emoji:"🧖",tier:"rare",     weight:6        },
  {label:"Rs.300 Off (on Rs.1000+)",                                       emoji:"🎁",tier:"uncommon", weight:6        },
  {label:"Free Eyebrow Threading",                                         emoji:"👁️", tier:"uncommon", weight:6        },
  {label:"Free Hair Wash",                                                 emoji:"💆",tier:"uncommon", weight:6        },
  {label:"Rs.150 Off (on Rs.600+)",                                        emoji:"🎀",tier:"common",   weight:5        },
  {label:"Next Visit Voucher Rs.200",                                      emoji:"🎟️",tier:"common",   weight:6        },
  {label:"Rs.200 Off This Bill + Bring a Friend Next Time — 20% Off Both", emoji:"👯",tier:"uncommon", weight:14,big:true},
];

const DICE_PRIZES = [
  {combo:"Double 6",prize:"BILL FREE!",                                                     emoji:"🏆",tier:"legendary",big:true},
  {combo:"Double 5",prize:"50% Off",                                                        emoji:"🥇",tier:"epic",     big:true},
  {combo:"Double 4",prize:"30% Off",                                                        emoji:"🥈",tier:"rare"             },
  {combo:"Double 3",prize:"20% Off",                                                        emoji:"🥉",tier:"rare"             },
  {combo:"Double 2",prize:"Free Head Massage",                                              emoji:"🧖",tier:"rare"             },
  {combo:"Double 1",prize:"Rs.300 Off (on Rs.1000+)",                                       emoji:"🎁",tier:"uncommon"         },
  {combo:"Sum 11",  prize:"Free Hair Wash",                                                 emoji:"💆",tier:"uncommon"         },
  {combo:"Sum 9-10",prize:"Free Eyebrow Threading",                                         emoji:"👁️", tier:"uncommon"         },
  {combo:"Sum 7-8", prize:"Rs.200 Off This Bill + Bring a Friend Next Time — 20% Off Both", emoji:"👯",tier:"uncommon", big:true},
  {combo:"Sum 5-6", prize:"Next Visit Voucher Rs.200",                                      emoji:"🎟️",tier:"common"           },
  {combo:"Sum 4",   prize:"Rs.150 Off (on Rs.600+)",                                        emoji:"🎀",tier:"common"           },
  {combo:"Sum 3",   prize:"20% Off",                                                        emoji:"🥉",tier:"rare"             },
];

const GOLDEN_WIN = [
  {label:"BILL FREE!",                                                     emoji:"🏆",big:true},
  {label:"50% Off",                                                        emoji:"🥇",big:true},
  {label:"30% Off",                                                        emoji:"🥈",big:true},
  {label:"Free Head Massage",                                              emoji:"🧖",big:true},
  {label:"Next Visit Voucher Rs.200",                                      emoji:"🎟️",big:true},
  {label:"Rs.200 Off This Bill + Bring a Friend Next Time — 20% Off Both", emoji:"👯",big:true},
];

const GOLDEN_CONSOLATION = [
  {label:"20% Off",                                                        emoji:"🥉"},
  {label:"20% Off",                                                        emoji:"🥉"},
  {label:"Free Eyebrow Threading",                                         emoji:"👁️" },
  {label:"Free Hair Wash",                                                 emoji:"💆"},
  {label:"Rs.300 Off (on Rs.1000+)",                                       emoji:"🎁"},
  {label:"Rs.150 Off (on Rs.600+)",                                        emoji:"🎀"},
  {label:"Next Visit Voucher Rs.200",                                      emoji:"🎟️"},
  {label:"Rs.200 Off This Bill + Bring a Friend Next Time — 20% Off Both", emoji:"👯"},
];

const TIER_COLORS = {legendary:"#F59E0B",epic:"#A855F7",rare:"#3B82F6",uncommon:"#10B981",common:"#6B7280"};

const QUOTES = [
  "Somewhere out there, someone just Googled 'how to look this good.' You didn't need to. 😏",
  "Scientists have confirmed: great hair increases your daily confidence by 200%. We just ran the experiment. 🔬",
  "You sat in our chair for a bit. You're leaving as the main character. No audition required. 🎬",
  "Plot twist: the most stunning person in the room walked in looking for a trim. Spoiler — that's you. 📖",
  "Fun fact: people who visit Studio 11 are statistically more likely to turn heads. We made that up but it feels true. 😄",
  "Your hair just had a full glow-up. Your personality was already perfect — we just matched the outside to the inside. ✨",
  "Royalty doesn't announce itself. It just walks out of Studio 11 and lets the hair do the talking. 👑",
  "You came in with good hair. A crime has been committed — we made it GREAT. 🚨",
  "Warning: the person leaving this salon may cause spontaneous compliments, double-takes, and mild jealousy. We accept no liability. ⚠️",
  "The chair you just sat in has seen a lot of transformations. Yours might be our favourite. Don't tell the others. 🤫",
  "Some people change the world. Some people change their hair. You just did both. 💇",
  "There's before Studio 11... and then there's right now. The difference is visible from space. 🌍",
  "You didn't just get a haircut. You levelled up. There's a difference and everyone will notice it. 🎮",
  "Your hair is now so good even your bad days won't stand a chance. You're welcome. 💪",
  "We put a lot of love into every visit. Today we may have outdone ourselves. Just saying. 💖",
];

const MINI_GAMES = [
  {id:"stars",   title:"⭐ Pick a Lucky Star!",      subtitle:"One star is hiding your prize — which one calls to you?"},
  {id:"emoji",   title:"😄 What's Your Vibe Today?", subtitle:"Your mood energy picks your prize. Trust the feeling!"},
  {id:"hold",    title:"🤞 Hold Your Luck!",          subtitle:"Press and hold until the bar fills up — don't let go!"},
  {id:"balloon", title:"🎈 Pop a Balloon!",            subtitle:"Your prize is inside one of these — choose and pop!"},
  {id:"door",    title:"🚪 Door Number...?",           subtitle:"Three doors, one amazing prize. Which do you pick?"},
  {id:"clover",  title:"🍀 Shake the Lucky Clover!",  subtitle:"Tap it 3 times to charge your luck and release it!"},
];

const CONFETTI = Array.from({length:28},(_,i)=>({x:Math.random()*100,size:7+Math.random()*9,dur:1.4+Math.random()*1.6,delay:Math.random()*0.9,color:["#F59E0B","#A78BFA","#34D399","#F87171","#60A5FA","#FDE68A","#FB923C"][i%7],round:i%3===0}));
const DOT_POS = {1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]]};

function pickWeighted(arr){const t=arr.reduce((s,p)=>s+(p.weight||1),0);let r=Math.random()*t;for(const p of arr){r-=(p.weight||1);if(r<=0)return p;}return arr[0];}
function pickRandom(arr){return arr[Math.floor(Math.random()*arr.length)];}
function genCode(p){return p+"-"+Math.random().toString(36).substring(2,6).toUpperCase();}
function getDicePrize(d1,d2){
  const isDouble=d1===d2,sum=d1+d2;let e;
  if(isDouble)e=DICE_PRIZES[6-d1];else if(sum===11)e=DICE_PRIZES[6];else if(sum>=9)e=DICE_PRIZES[7];else if(sum>=7)e=DICE_PRIZES[8];else if(sum>=5)e=DICE_PRIZES[9];else if(sum===4)e=DICE_PRIZES[10];else e=DICE_PRIZES[11];
  return{...e,isDouble};
}

const W = {minHeight:"100vh",background:"radial-gradient(ellipse at 20% 20%,rgba(124,58,237,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(245,158,11,0.1) 0%,transparent 50%),#0a0712",color:"#F5F3FF",fontFamily:"Georgia,'Times New Roman',serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 20px",position:"relative",overflowX:"hidden"};
const S = (r)=>({background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:r||14});

const CSS = `
@keyframes slideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes diceRoll{0%{transform:rotate(-12deg) scale(0.95)}50%{transform:rotate(12deg) scale(1.05)}100%{transform:rotate(-12deg) scale(0.95)}}
@keyframes jarWobble{0%,100%{transform:rotate(0)}20%{transform:rotate(-6deg)}40%{transform:rotate(6deg)}60%{transform:rotate(-4deg)}80%{transform:rotate(4deg)}}
@keyframes chitReveal{0%{transform:scale(0) rotate(-15deg);opacity:0}60%{transform:scale(1.1) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes starPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18);filter:brightness(1.4)}}
@keyframes goldGlow{0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.3)}50%{box-shadow:0 0 70px rgba(245,158,11,0.75)}}
@keyframes prizeIn{0%{transform:scale(0.5) rotate(-8deg);opacity:0}65%{transform:scale(1.06) rotate(1.5deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes confetti{0%{transform:translateY(-30px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes floatChit{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes glow{0%,100%{opacity:0.5}50%{opacity:1}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes popBurst{0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(0);opacity:0}}
@keyframes popIn{0%{transform:scale(0);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes quoteIn{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
@keyframes cloverShake{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-22deg) scale(1.1)}40%{transform:rotate(22deg) scale(1.15)}60%{transform:rotate(-14deg) scale(1.1)}80%{transform:rotate(10deg) scale(1.05)}}
@keyframes doorSwing{0%{transform:perspective(500px) rotateY(0deg)}100%{transform:perspective(500px) rotateY(-80deg)}}
*{box-sizing:border-box;} button,select{font-family:Georgia,'Times New Roman',serif;}
::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#7C3AED50;border-radius:4px;}
`;

function DiceFace({value}){
  const dots=DOT_POS[value]||DOT_POS[1];
  return <div style={{width:96,height:96,background:"linear-gradient(145deg,#fff,#e8e8f0)",borderRadius:18,position:"relative",boxShadow:"0 10px 30px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.9)"}}>
    {dots.map((p,i)=><div key={i} style={{position:"absolute",width:14,height:14,borderRadius:"50%",background:"radial-gradient(circle,#2d1a5e,#0d0814)",left:`${p[0]}%`,top:`${p[1]}%`,transform:"translate(-50%,-50%)"}}/>)}
  </div>;
}

function GameStars({onDone}){
  const [picked,setPicked]=useState(null);
  const stars=["⭐","🌟","💫","✨","🌠"];
  const msgs=["Ooh bold choice! You've got star quality! 🔥","The cosmos just approved your selection! 🌌","That one was GLOWING for you! ✨","Great instinct — the universe nods! 🙌","Saved the best for last! Pure wisdom! 👑"];
  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:20,flexWrap:"wrap"}}>
      {stars.map((s,i)=><button key={i} onClick={()=>{if(picked!==null)return;setPicked(i);setTimeout(()=>onDone(),1300);}} style={{fontSize:picked===i?56:38,background:"none",border:"none",cursor:picked!==null?"default":"pointer",transition:"all 0.3s",opacity:picked!==null&&picked!==i?0.15:1,filter:picked===i?"drop-shadow(0 0 18px #F59E0B)":"none",animation:picked===i?"popIn 0.4s ease":picked===null?"pulse 1.8s ease-in-out infinite":"none",animationDelay:`${i*0.15}s`}}>{s}</button>)}
    </div>
    {picked!==null?<p style={{color:"#F59E0B",fontSize:15,animation:"quoteIn 0.4s ease",fontStyle:"italic",margin:0}}>{msgs[picked]}</p>:<p style={{color:"#9CA3AF",fontSize:12,margin:0}}>Tap the star that calls to you 👆</p>}
  </div>;
}

function GameEmoji({onDone}){
  const [picked,setPicked]=useState(null);
  const moods=[{e:"😊",l:"Happy"},{e:"😎",l:"Cool"},{e:"🥰",l:"Loving It"},{e:"🤩",l:"Excited"},{e:"😌",l:"Zen"},{e:"💃",l:"On Fire"}];
  const reactions=["That smile is literally your superpower! 😊","Cool as a cucumber, lucky as a clover! 🍀","Love is your lucky charm today! 💕","That excitement is absolutely contagious! 🎉","Still waters win the biggest prizes! 🌊","YOU ARE LITERALLY ON FIRE TODAY! 🔥"];
  return <div style={{textAlign:"center"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
      {moods.map((m,i)=><button key={i} onClick={()=>{if(picked!==null)return;setPicked(i);setTimeout(()=>onDone(),1300);}} style={{background:picked===i?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.05)",border:picked===i?"1px solid #F59E0B":"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 6px",cursor:picked!==null?"default":"pointer",opacity:picked!==null&&picked!==i?0.2:1,transition:"all 0.3s",animation:picked===i?"popIn 0.4s ease":"none"}}>
        <div style={{fontSize:30}}>{m.e}</div>
        <div style={{fontSize:10,color:picked===i?"#F59E0B":"#9CA3AF",marginTop:4}}>{m.l}</div>
      </button>)}
    </div>
    {picked!==null?<p style={{color:"#F59E0B",fontSize:14,animation:"quoteIn 0.4s ease",fontStyle:"italic",margin:0}}>{reactions[picked]}</p>:<p style={{color:"#9CA3AF",fontSize:12,margin:0}}>Pick the emoji that matches your energy right now 👆</p>}
  </div>;
}

function GameHold({onDone}){
  const [holding,setHolding]=useState(false);
  const [progress,setProgress]=useState(0);
  const [done,setDone]=useState(false);
  const [released,setReleased]=useState(false);
  const ivRef=useRef(null);
  const pRef=useRef(0);
  function startHold(){
    if(done)return;
    setHolding(true);setReleased(false);
    ivRef.current=setInterval(()=>{
      pRef.current=Math.min(pRef.current+3.5,100);
      setProgress(pRef.current);
      if(pRef.current>=100){clearInterval(ivRef.current);setHolding(false);setDone(true);setTimeout(()=>onDone(),1000);}
    },80);
  }
  function stopHold(){
    if(done)return;
    clearInterval(ivRef.current);setHolding(false);
    if(pRef.current<100){setReleased(true);pRef.current=0;setProgress(0);}
  }
  const hint=progress<35?"Keep going... 💪":progress<75?"YES! Almost there! 🔥":"HOLD IT!! SO CLOSE!! 😱";
  return <div style={{textAlign:"center"}}>
    <div style={{marginBottom:14,height:12,background:"rgba(255,255,255,0.08)",borderRadius:10,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#7C3AED,#F59E0B)",borderRadius:10,transition:"width 0.08s linear"}}/>
    </div>
    <div style={{minHeight:28,marginBottom:14}}>
      {holding&&<p style={{color:"#F59E0B",fontSize:14,margin:0,animation:"pulse 0.5s infinite"}}>{hint}</p>}
      {released&&!done&&<p style={{color:"#F87171",fontSize:13,margin:0}}>Oops! Let go too early 😅 Try again!</p>}
      {done&&<p style={{color:"#10B981",fontSize:14,margin:0,animation:"popIn 0.3s ease"}}>PERFECT HOLD! 🎉 Unleashing your prize...</p>}
    </div>
    <button onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={e=>{e.preventDefault();startHold();}} onTouchEnd={stopHold}
      style={{width:"100%",padding:"22px 0",background:done?"rgba(16,185,129,0.2)":holding?"linear-gradient(135deg,#7C3AED,#F59E0B)":"linear-gradient(135deg,#4338CA,#7C3AED)",border:done?"1px solid #10B981":"none",borderRadius:16,color:"#F5F3FF",fontSize:17,fontWeight:"bold",cursor:done?"default":"pointer",userSelect:"none",boxShadow:holding?"0 0 32px rgba(124,58,237,0.7)":"0 8px 24px rgba(124,58,237,0.3)"}}>
      {done?"✅ Done!":holding?"🔥 HOLDING...":"👇 PRESS & HOLD"}
    </button>
  </div>;
}

function GameBalloon({onDone}){
  const [popped,setPopped]=useState(null);
  const balloons=[{c:"#F87171",s:"#DC2626"},{c:"#60A5FA",s:"#2563EB"},{c:"#34D399",s:"#059669"},{c:"#FBBF24",s:"#D97706"},{c:"#A78BFA",s:"#7C3AED"}];
  const pops=["POP! 🎊 There it is!","BANG! Great instinct! 🎉","YES! That one had magic! ✨","BOOM! Golden touch! 💥","Perfect pick! It was waiting for you! 🌟"];
  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
      {balloons.map((b,i)=><div key={i} onClick={()=>{if(popped!==null)return;setPopped(i);setTimeout(()=>onDone(),1400);}} style={{cursor:popped!==null?"default":"pointer",width:58,height:76,position:"relative",flexShrink:0}}>
        {popped===i
          ?<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:34,animation:"popBurst 0.45s ease forwards"}}>💥</div>
          :<svg viewBox="0 0 58 76" width={58} height={76} style={{opacity:popped!==null?0.15:1,transition:"opacity 0.3s",animation:popped===null?`wiggle ${1.5+i*0.28}s ease-in-out infinite`:"none",filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.3))"}}>
            <ellipse cx="29" cy="30" rx="21" ry="27" fill={b.c}/><ellipse cx="21" cy="18" rx="7" ry="5" fill="rgba(255,255,255,0.3)"/>
            <polygon points="29,57 25,66 33,66" fill={b.c}/><line x1="29" y1="66" x2="29" y2="76" stroke={b.s} strokeWidth="2"/>
          </svg>}
      </div>)}
    </div>
    {popped!==null?<p style={{color:"#F59E0B",fontSize:15,animation:"quoteIn 0.4s ease",fontStyle:"italic",margin:0}}>{pops[popped]}</p>:<p style={{color:"#9CA3AF",fontSize:12,margin:0}}>Tap a balloon to pop it! 🎈</p>}
  </div>;
}

function GameDoor({onDone}){
  const [picked,setPicked]=useState(null);
  const msgs=["Door 1 — Bold! Only the brave pick first! 🦁","Door 2 — The mysterious middle! Classic! ✨","Door 3 — Saved the best for last. Wisdom! 👑"];
  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:16}}>
      {[0,1,2].map(i=><div key={i} onClick={()=>{if(picked!==null)return;setPicked(i);setTimeout(()=>onDone(),1400);}} style={{cursor:picked!==null?"default":"pointer",width:82,height:118}}>
        <div style={{width:"100%",height:"100%",background:picked===i?"linear-gradient(135deg,#78350F,#F59E0B)":"linear-gradient(135deg,rgba(124,58,237,0.4),rgba(67,56,202,0.6))",border:picked===i?"2px solid #F59E0B":"2px solid rgba(124,58,237,0.5)",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,opacity:picked!==null&&picked!==i?0.2:1,transition:"all 0.3s",animation:picked===i?"doorSwing 0.5s ease forwards":picked===null?`pulse ${1.2+i*0.2}s ease-in-out infinite`:"none",boxShadow:picked===i?"0 0 24px rgba(245,158,11,0.7)":"none",transformOrigin:"left center"}}>
          <div style={{fontSize:30}}>{picked===i?"🎁":"🚪"}</div>
          <div style={{fontSize:12,color:"#F5F3FF",fontWeight:"bold"}}>#{i+1}</div>
        </div>
      </div>)}
    </div>
    {picked!==null?<p style={{color:"#F59E0B",fontSize:14,animation:"quoteIn 0.4s ease",fontStyle:"italic",margin:0}}>{msgs[picked]}</p>:<p style={{color:"#9CA3AF",fontSize:12,margin:0}}>Choose a door — your prize is behind one! 🚪</p>}
  </div>;
}

function GameClover({onDone}){
  const [count,setCount]=useState(0);
  const [shaking,setShaking]=useState(false);
  const [done,setDone]=useState(false);
  function tap(){
    if(done||shaking)return;
    setShaking(true);
    setTimeout(()=>{setShaking(false);setCount(c=>{const n=c+1;if(n>=3){setDone(true);setTimeout(()=>onDone(),1000);}return n;});},650);
  }
  return <div style={{textAlign:"center"}}>
    <div onClick={tap} style={{fontSize:88,display:"inline-block",cursor:done?"default":"pointer",animation:shaking?"cloverShake 0.6s ease":done?"bounce 1s ease-in-out infinite":"pulse 2s ease-in-out infinite",filter:done?"drop-shadow(0 0 22px #10B981)":"none",userSelect:"none",marginBottom:8}}>🍀</div>
    <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:14}}>
      {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:count>i?"#10B981":"rgba(255,255,255,0.15)",boxShadow:count>i?"0 0 10px #10B981":"none",transition:"all 0.3s"}}/>)}
    </div>
    {!done&&!shaking&&<p style={{color:"#9CA3AF",fontSize:13,margin:0}}>Tap {3-count} more time{3-count!==1?"s":""} to charge your luck! 🍀</p>}
    {shaking&&!done&&<p style={{color:"#10B981",fontSize:14,margin:0,animation:"pulse 0.4s infinite"}}>Sending luck into the universe... 🌟</p>}
    {done&&<p style={{color:"#10B981",fontSize:15,margin:0,animation:"popIn 0.4s ease",fontStyle:"italic"}}>LUCK FULLY CHARGED! The universe heard you! 🎉</p>}
  </div>;
}

const GAME_MAP={stars:GameStars,emoji:GameEmoji,hold:GameHold,balloon:GameBalloon,door:GameDoor,clover:GameClover};

function ActivityScreen({onPrizeDetermined}){
  const [phase,setPhase]=useState("quote");
  const [miniGame]=useState(()=>pickRandom(MINI_GAMES));
  const [quote]=useState(()=>pickRandom(QUOTES));
  const GameComp=GAME_MAP[miniGame.id];
  function handleDone(){setPhase("revealing");setTimeout(()=>onPrizeDetermined(),900);}
  return <div style={{...W,justifyContent:"flex-start",paddingTop:36}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:420,textAlign:"center"}}>
      {phase==="quote"&&<div style={{animation:"slideUp 0.5s ease"}}>
        <div style={{fontSize:50,marginBottom:14,animation:"bounce 2s ease-in-out infinite"}}>💖</div>
        <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.14),rgba(245,158,11,0.1))",border:"1px solid rgba(245,158,11,0.3)",borderRadius:22,padding:"28px 24px",marginBottom:20}}>
          <p style={{fontSize:16,lineHeight:1.7,color:"#F5F3FF",margin:"0 0 12px",fontStyle:"italic"}}>"{quote}"</p>
          <p style={{fontSize:11,color:"#F59E0B",margin:0,letterSpacing:2,textTransform:"uppercase"}}>— Studio 11</p>
        </div>
        <p style={{color:"#9CA3AF",fontSize:13,marginBottom:20}}>Before we reveal your prize... we have a fun little challenge for you! 🎮</p>
        <button onClick={()=>setPhase("game")} style={{width:"100%",padding:"18px 0",background:"linear-gradient(135deg,#7C3AED,#4338CA)",border:"none",borderRadius:16,color:"#F5F3FF",fontSize:16,fontWeight:"bold",cursor:"pointer",boxShadow:"0 8px 24px rgba(124,58,237,0.4)"}}>Let's Play! 🎉</button>
      </div>}
      {phase==="game"&&<div style={{animation:"slideUp 0.4s ease"}}>
        <h2 style={{fontSize:22,color:"#F59E0B",margin:"0 0 6px"}}>{miniGame.title}</h2>
        <p style={{color:"#9CA3AF",fontSize:13,margin:"0 0 22px"}}>{miniGame.subtitle}</p>
        <div style={{...S(20),padding:"24px 18px",marginBottom:16}}><GameComp onDone={handleDone}/></div>
      </div>}
      {phase==="revealing"&&<div style={{animation:"slideUp 0.4s ease",padding:"60px 0"}}>
        <div style={{fontSize:72,animation:"bounce 0.7s ease-in-out infinite"}}>🎁</div>
        <p style={{color:"#F59E0B",fontSize:20,marginTop:20,fontStyle:"italic",animation:"pulse 1s infinite"}}>Revealing your prize...</p>
      </div>}
    </div>
  </div>;
}

export default function App(){
  const [screen,setScreen]=useState("pin");
  const [pinInput,setPinInput]=useState("");
  const [pinError,setPinError]=useState(false);
  const [goldenHour,setGoldenHour]=useState("");
  const [claims,setClaims]=useState([]);
  const [logFilter,setLogFilter]=useState("All");
  const [pendingGame,setPendingGame]=useState("");
  const [prizeResult,setPrizeResult]=useState(null);
  const [showGuide,setShowGuide]=useState(false);
  const pendingRef=useRef(null);
  const [diceVals,setDiceVals]=useState([1,1]);
  const [diceRolling,setDiceRolling]=useState(false);
  const [diceRolled,setDiceRolled]=useState(false);
  const [jarPhase,setJarPhase]=useState("idle");
  const [showChit,setShowChit]=useState(false);
  const [goldenPlayed,setGoldenPlayed]=useState(false);
  const [goldenIsWin,setGoldenIsWin]=useState(false);
  const [goldenReveal,setGoldenReveal]=useState(false);

  const today=new Date(),todayStr=today.toLocaleDateString("en-IN"),currentHour=today.getHours();
  const todayClaims=claims.filter(c=>c.date===todayStr).length;
  const monthClaims=claims.filter(c=>{const d=new Date(c.timestamp);return d.getMonth()===today.getMonth()&&d.getFullYear()===today.getFullYear();}).length;

  function addClaim(game,prize,code){setClaims(p=>[{id:Date.now(),game,prize,code,date:todayStr,time:new Date().toLocaleTimeString("en-IN"),timestamp:Date.now()},...p].slice(0,MAX_CLAIMS));}
  function handlePin(d){
    const next=pinInput+d;setPinInput(next);
    if(next.length===4){if(next===PIN_CODE){setScreen("dashboard");setPinError(false);}else{setPinError(true);setTimeout(()=>{setPinInput("");setPinError(false);},800);}}
  }
  function startGame(game){
    setPendingGame(game);setDiceRolled(false);setDiceRolling(false);setDiceVals([1,1]);
    setJarPhase("idle");setShowChit(false);setGoldenPlayed(false);setGoldenIsWin(false);setGoldenReveal(false);
    setShowGuide(false);pendingRef.current=null;setScreen(game);
  }
  function onPrizeDetermined(){if(pendingRef.current){setPrizeResult(pendingRef.current);setScreen("prize");}}
  function rollDice(){
    if(diceRolling||diceRolled)return;setDiceRolling(true);let count=0;
    const iv=setInterval(()=>{
      setDiceVals([Math.ceil(Math.random()*6),Math.ceil(Math.random()*6)]);
      if(++count>=22){clearInterval(iv);const d1=Math.ceil(Math.random()*6),d2=Math.ceil(Math.random()*6);setDiceVals([d1,d2]);setDiceRolling(false);setDiceRolled(true);
        const p=getDicePrize(d1,d2);const code=genCode("D");addClaim("Roll the Dice",p.prize,code);
        pendingRef.current={label:p.prize,emoji:p.emoji,big:p.big,code,game:"Roll the Dice",d1,d2,isDouble:p.isDouble};
        setTimeout(()=>setScreen("activity"),1400);}
    },70);
  }
  function pullChit(){
    if(jarPhase!=="idle")return;setJarPhase("shaking");
    setTimeout(()=>{const p=pickWeighted(ALL_PRIZES);const code=genCode("J");setJarPhase("revealing");
      setTimeout(()=>{setShowChit(true);addClaim("Jar of Luck",p.label,code);pendingRef.current={...p,code,game:"Jar of Luck"};setTimeout(()=>setScreen("activity"),1800);},600);
    },2200);
  }
  function playGolden(){
    if(goldenPlayed)return;const h=parseInt(goldenHour);const isWin=!isNaN(h)&&currentHour===h;
    setGoldenIsWin(isWin);setGoldenPlayed(true);
    setTimeout(()=>{setGoldenReveal(true);const p=isWin?pickRandom(GOLDEN_WIN):pickRandom(GOLDEN_CONSOLATION);const code=genCode("G");
      addClaim("Golden Hour",p.label,code);pendingRef.current={...p,big:isWin,code,game:"Golden Hour",isGolden:isWin};setTimeout(()=>setScreen("activity"),1800);},2000);
  }

  const filteredClaims=logFilter==="All"?claims:claims.filter(c=>c.game===logFilter);

  if(screen==="pin") return <div style={{...W,justifyContent:"center"}}>
    <style>{CSS}</style>
    <div style={{textAlign:"center",animation:"slideUp 0.5s ease",maxWidth:320,width:"100%"}}>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:54,marginBottom:8}}>✂️</div>
        <h1 style={{fontSize:30,color:"#F59E0B",margin:0,letterSpacing:3}}>STUDIO 11</h1>
        <p style={{color:"#9CA3AF",fontSize:11,margin:"6px 0 0",letterSpacing:5,textTransform:"uppercase"}}>Hype Game · Staff Access</p>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:18,marginBottom:36}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:18,height:18,borderRadius:"50%",background:i<pinInput.length?"#F59E0B":"transparent",border:pinError?"2.5px solid #EF4444":"2.5px solid #F59E0B",animation:pinError?"shake 0.4s ease":"none",boxShadow:i<pinInput.length?"0 0 12px rgba(245,158,11,0.5)":"none",transition:"background 0.2s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>d===""?<div key={i}/>:
          <button key={i} onClick={()=>d==="⌫"?setPinInput(p=>p.slice(0,-1)):handlePin(String(d))}
            style={{padding:"19px 0",fontSize:d==="⌫"?18:22,fontWeight:"bold",...S(),color:d==="⌫"?"#9CA3AF":"#F5F3FF",cursor:"pointer"}}
            onMouseDown={e=>e.currentTarget.style.background="rgba(124,58,237,0.25)"} onMouseUp={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
            onTouchStart={e=>e.currentTarget.style.background="rgba(124,58,237,0.25)"} onTouchEnd={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
          >{d}</button>)}
      </div>
      {pinError&&<p style={{color:"#EF4444",marginTop:18,fontSize:13,animation:"fadeIn 0.2s"}}>Incorrect PIN. Try again.</p>}
    </div>
  </div>;

  if(screen==="activity") return <ActivityScreen onPrizeDetermined={onPrizeDetermined}/>;

  if(screen==="dashboard") return <div style={{...W,justifyContent:"flex-start"}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:440}}>
      <div style={{textAlign:"center",marginBottom:28,animation:"slideUp 0.4s ease"}}>
        <h1 style={{fontSize:22,color:"#F59E0B",margin:0,letterSpacing:2}}>✂️ STUDIO 11</h1>
        <p style={{color:"#9CA3AF",fontSize:10,margin:"4px 0 0",letterSpacing:4,textTransform:"uppercase"}}>Staff Dashboard</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>
        {[{label:"Today",value:todayClaims,icon:"🎮"},{label:"Month",value:monthClaims,icon:"📅"},{label:"All Time",value:claims.length,icon:"📋"}].map(s=><div key={s.label} style={{...S(),padding:"14px 10px",textAlign:"center"}}>
          <div style={{fontSize:18}}>{s.icon}</div>
          <div style={{fontSize:26,fontWeight:"bold",color:"#F59E0B",lineHeight:1.2,marginTop:4}}>{s.value}</div>
          <div style={{fontSize:10,color:"#9CA3AF",marginTop:4,textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
        </div>)}
      </div>
      <div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(124,58,237,0.12))",border:"1px solid rgba(245,158,11,0.3)",borderRadius:18,padding:20,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:20,animation:"starPulse 2s infinite"}}>⭐</span>
          <span style={{fontSize:13,fontWeight:"bold",color:"#F59E0B",letterSpacing:1}}>GOLDEN HOUR SETTER</span>
          <span style={{marginLeft:"auto",fontSize:10,color:"#9CA3AF",background:"rgba(245,158,11,0.15)",padding:"3px 8px",borderRadius:10}}>Staff Only</span>
        </div>
        <p style={{fontSize:12,color:"#9CA3AF",margin:"0 0 10px"}}>Set the secret hour — clients never see this.</p>
        <select value={goldenHour} onChange={e=>setGoldenHour(e.target.value)} style={{width:"100%",background:"rgba(0,0,0,0.4)",border:goldenHour!==""?"1px solid rgba(245,158,11,0.6)":"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 14px",color:goldenHour!==""?"#F59E0B":"#9CA3AF",fontSize:15,cursor:"pointer"}}>
          <option value="">— Select Golden Hour —</option>
          {HOURS.map(h=><option key={h.value} value={h.value}>{h.label}</option>)}
        </select>
        {goldenHour!==""&&<p style={{fontSize:12,color:"#10B981",margin:"8px 0 0"}}>✓ Set to {HOURS[parseInt(goldenHour)]?.label}{currentHour===parseInt(goldenHour)&&<span style={{color:"#F59E0B",marginLeft:8}}>⭐ ACTIVE NOW!</span>}</p>}
      </div>
      <button onClick={()=>setShowGuide(p=>!p)} style={{width:"100%",background:"rgba(124,58,237,0.25)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:12,padding:"10px 0",color:"#C4B5FD",fontSize:13,cursor:"pointer",marginBottom:14}}>
        {showGuide?"▲ Hide Prize Pool":"▼ View Prize Pool (11 Prizes)"}
      </button>
      {showGuide&&<div style={{...S(16),padding:"14px 16px",marginBottom:14,animation:"slideUp 0.3s ease",maxHeight:230,overflowY:"auto"}}>
        {ALL_PRIZES.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<ALL_PRIZES.length-1?"1px solid rgba(255,255,255,0.1)":"none"}}>
          <span style={{fontSize:12,flex:1,marginRight:8}}>{p.emoji} {p.label}</span>
          <span style={{fontSize:10,color:TIER_COLORS[p.tier],background:TIER_COLORS[p.tier]+"20",padding:"2px 8px",borderRadius:8,textTransform:"uppercase",letterSpacing:1,flexShrink:0}}>{p.tier}</span>
        </div>)}
      </div>}
      <p style={{fontSize:10,color:"#9CA3AF",letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Select Game for Client</p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
        {[
          {id:"dice", emoji:"🎲",title:"Roll the Dice",  desc:"12 prize tiers — double your luck",     grad:"rgba(124,58,237,0.2)",bord:"rgba(124,58,237,0.45)"},
          {id:"jar",  emoji:"🔮",title:"Jar of Luck",    desc:"Pull a golden chit from the magic jar", grad:"rgba(245,158,11,0.15)",bord:"rgba(245,158,11,0.4)"},
          {id:"golden",emoji:"⭐",title:"Golden Hour",   desc:"Lucky prize if in the secret hour",     grad:"rgba(16,185,129,0.12)",bord:"rgba(16,185,129,0.4)"},
        ].map(g=><button key={g.id} onClick={()=>startGame(g.id)} style={{background:g.grad,border:`1px solid ${g.bord}`,borderRadius:16,padding:"15px 18px",cursor:"pointer",textAlign:"left",color:"#F5F3FF",transition:"transform 0.15s"}}
          onMouseOver={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:30}}>{g.emoji}</span>
            <div><div style={{fontSize:15,fontWeight:"bold"}}>{g.title}</div><div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{g.desc}</div></div>
            <span style={{marginLeft:"auto",color:"#9CA3AF",fontSize:20}}>›</span>
          </div>
        </button>)}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setScreen("log")} style={{flex:1,...S(12),padding:"13px 0",color:"#9CA3AF",cursor:"pointer",fontSize:13}}>📋 Claims Log ({claims.length})</button>
        <button onClick={()=>{setScreen("pin");setPinInput("");}} style={{...S(12),padding:"13px 20px",color:"#9CA3AF",cursor:"pointer",fontSize:13}}>🔒 Lock</button>
      </div>
    </div>
  </div>;

  if(screen==="dice") return <div style={{...W,justifyContent:"flex-start",paddingTop:36}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:400}}>
      <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#9CA3AF",cursor:"pointer",fontSize:13,marginBottom:16}}>← Dashboard</button>
      <div style={{textAlign:"center",marginBottom:20}}>
        <h2 style={{fontSize:26,color:"#F59E0B",margin:"0 0 6px"}}>🎲 Roll the Dice</h2>
        <p style={{color:"#9CA3AF",fontSize:13,margin:0}}>Hand the tablet to your client!</p>
      </div>
      <button onClick={()=>setShowGuide(p=>!p)} style={{width:"100%",background:"rgba(124,58,237,0.25)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:12,padding:"10px 0",color:"#C4B5FD",fontSize:13,cursor:"pointer",marginBottom:14}}>
        {showGuide?"▲ Hide Prize Guide":"▼ View Prize Guide"}
      </button>
      {showGuide&&<div style={{...S(16),padding:"14px 16px",marginBottom:14,animation:"slideUp 0.3s ease",maxHeight:260,overflowY:"auto"}}>
        {DICE_PRIZES.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<DICE_PRIZES.length-1?"1px solid rgba(255,255,255,0.1)":"none"}}>
          <span style={{fontSize:11,color:"#9CA3AF",flex:1,marginRight:8}}>{p.combo}</span>
          <span style={{fontSize:11,color:TIER_COLORS[p.tier],fontWeight:"bold",textAlign:"right"}}>{p.emoji} {p.prize}</span>
        </div>)}
      </div>}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:32,...S(24),padding:"44px 20px",marginBottom:22}}>
        {diceVals.map((v,i)=><div key={i} style={{animation:diceRolling?`diceRoll ${0.12+i*0.05}s ease-in-out infinite`:diceRolled?"bounce 0.6s ease":"none",filter:diceRolling?"drop-shadow(0 0 12px rgba(124,58,237,0.6))":"none"}}><DiceFace value={v}/></div>)}
      </div>
      {diceRolled&&<div style={{textAlign:"center",marginBottom:14,animation:"fadeIn 0.4s ease"}}>
        <p style={{color:"#9CA3AF",fontSize:14,margin:0}}>{diceVals[0]} + {diceVals[1]} = <span style={{color:"#F59E0B",fontWeight:"bold"}}>{diceVals[0]+diceVals[1]}</span>{diceVals[0]===diceVals[1]&&<span style={{color:"#A78BFA",marginLeft:8}}>✨ Double!</span>}</p>
        <p style={{color:"#9CA3AF",fontSize:12,margin:"6px 0 0"}}>Now for your fun activity... 🎮</p>
      </div>}
      <button onClick={rollDice} disabled={diceRolling||diceRolled} style={{width:"100%",padding:"20px 0",background:diceRolled?"rgba(16,185,129,0.2)":diceRolling?"rgba(124,58,237,0.5)":"linear-gradient(135deg,#7C3AED,#4338CA)",border:diceRolled?"1px solid #10B981":"none",borderRadius:16,color:"#F5F3FF",fontSize:18,fontWeight:"bold",cursor:diceRolled?"default":"pointer",boxShadow:!diceRolling&&!diceRolled?"0 8px 24px rgba(124,58,237,0.35)":"none"}}>
        {diceRolling?"🎲 Rolling...":diceRolled?"✅ Get ready for your activity!":"🎲 ROLL THE DICE"}
      </button>
    </div>
  </div>;

  if(screen==="jar"){
    const chits=[{x:52,y:78,r:-8},{x:80,y:95,r:12},{x:38,y:110,r:-5},{x:75,y:120,r:20},{x:55,y:140,r:-15},{x:90,y:155,r:8},{x:42,y:158,r:-20},{x:70,y:170,r:5}];
    return <div style={{...W,justifyContent:"flex-start",paddingTop:36}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400,textAlign:"center"}}>
        <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#9CA3AF",cursor:"pointer",fontSize:13,display:"block",marginBottom:16}}>← Dashboard</button>
        <h2 style={{fontSize:26,color:"#F59E0B",margin:"0 0 6px"}}>🔮 Jar of Luck</h2>
        <p style={{color:"#9CA3AF",fontSize:13,margin:"0 0 28px"}}>Hand the tablet to your client!</p>
        <div style={{position:"relative",display:"inline-block",marginBottom:24}}>
          <div style={{width:180,height:220,position:"relative",animation:jarPhase==="shaking"?"jarWobble 0.3s ease-in-out infinite":"none",cursor:jarPhase==="idle"?"pointer":"default"}} onClick={jarPhase==="idle"?pullChit:undefined}>
            <svg viewBox="0 0 180 220" width={180} height={220}>
              <defs>
                <linearGradient id="jg1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(124,58,237,0.5)"/><stop offset="40%" stopColor="rgba(196,160,250,0.2)"/><stop offset="100%" stopColor="rgba(124,58,237,0.45)"/></linearGradient>
                <linearGradient id="jg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#D97706"/><stop offset="100%" stopColor="#78350F"/></linearGradient>
                <radialGradient id="jg3" cx="30%" cy="30%"><stop offset="0%" stopColor="rgba(255,255,255,0.15)"/><stop offset="100%" stopColor="transparent"/></radialGradient>
              </defs>
              <ellipse cx="90" cy="8" rx="20" ry="6" fill="#B45309"/>
              <rect x="36" y="12" width="108" height="26" rx="8" fill="url(#jg2)"/>
              <rect x="44" y="8" width="92" height="14" rx="7" fill="#B45309"/>
              <path d="M32 38 Q20 40 18 58 L14 188 Q13 212 90 212 Q167 212 166 188 L162 58 Q160 40 148 38 Z" fill="url(#jg1)" stroke="rgba(196,160,250,0.4)" strokeWidth="1.5"/>
              <path d="M32 38 Q20 40 18 58 L14 188 Q13 212 90 212 Q167 212 166 188 L162 58 Q160 40 148 38 Z" fill="url(#jg3)"/>
              <path d="M42 62 Q40 110 44 160" stroke="rgba(255,255,255,0.18)" strokeWidth="8" fill="none" strokeLinecap="round"/>
            </svg>
            {jarPhase!=="revealing"&&!showChit&&<div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}>
              {chits.map((ch,i)=><div key={i} style={{position:"absolute",left:ch.x,top:ch.y,width:30,height:16,borderRadius:5,background:"linear-gradient(135deg,#F59E0B,#D97706)",transform:`rotate(${ch.r}deg)`,opacity:0.85,animation:`floatChit ${1.2+i*0.18}s ease-in-out infinite`,animationDelay:`${i*0.12}s`}}/>)}
            </div>}
            {jarPhase==="idle"&&<div style={{position:"absolute",bottom:-22,left:"50%",transform:"translateX(-50%)",fontSize:12,color:"#F59E0B",whiteSpace:"nowrap",animation:"glow 1.5s infinite"}}>👆 Tap to Pull Your Chit</div>}
          </div>
          {showChit&&<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"linear-gradient(135deg,#78350F,#F59E0B)",borderRadius:14,padding:"18px 28px",boxShadow:"0 12px 40px rgba(245,158,11,0.6)",animation:"chitReveal 0.7s cubic-bezier(0.34,1.56,0.64,1)",textAlign:"center",zIndex:20,minWidth:160}}>
            <div style={{fontSize:32}}>🎉</div>
            <div style={{fontSize:15,fontWeight:"bold",color:"#1a0a2e",marginTop:6}}>Chit Pulled!</div>
            <div style={{fontSize:12,color:"#78350F",marginTop:4}}>Activity loading...</div>
          </div>}
        </div>
        <p style={{color:"#9CA3AF",fontSize:13,marginBottom:22,minHeight:20}}>
          {jarPhase==="idle"&&"Tap the jar or button below"}
          {jarPhase==="shaking"&&"✨ Reaching deep into the jar..."}
          {jarPhase==="revealing"&&!showChit&&"🎉 Drawing your lucky chit..."}
          {showChit&&"🎉 Chit pulled! Activity loading..."}
        </p>
        <button onClick={pullChit} disabled={jarPhase!=="idle"} style={{width:"100%",padding:"18px 0",background:jarPhase==="idle"?"linear-gradient(135deg,#78350F,#F59E0B)":"rgba(245,158,11,0.15)",border:jarPhase!=="idle"?"1px solid rgba(245,158,11,0.3)":"none",borderRadius:16,color:"#F5F3FF",fontSize:17,fontWeight:"bold",cursor:jarPhase==="idle"?"pointer":"default",boxShadow:jarPhase==="idle"?"0 8px 24px rgba(245,158,11,0.3)":"none"}}>
          {jarPhase==="idle"?"🔮 PULL YOUR LUCKY CHIT":jarPhase==="shaking"?"✨ Reaching in...":"✅ Chit Pulled!"}
        </button>
      </div>
    </div>;
  }

  if(screen==="golden"){
    const ghSet=!isNaN(parseInt(goldenHour));
    return <div style={{...W,justifyContent:"flex-start",paddingTop:36}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400,textAlign:"center"}}>
        <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#9CA3AF",cursor:"pointer",fontSize:13,display:"block",marginBottom:16}}>← Dashboard</button>
        <h2 style={{fontSize:26,color:"#F59E0B",margin:"0 0 6px"}}>⭐ Golden Hour</h2>
        <p style={{color:"#9CA3AF",fontSize:13,margin:"0 0 28px"}}>Hand the tablet to your client!</p>
        {!goldenPlayed&&<>
          <div style={{width:160,height:160,margin:"0 auto 24px",background:"radial-gradient(circle,rgba(245,158,11,0.18),transparent 70%)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",animation:"goldGlow 2.5s ease-in-out infinite"}}>
            <span style={{fontSize:84,lineHeight:1,animation:"starPulse 2s ease-in-out infinite"}}>⭐</span>
          </div>
          <p style={{color:"#9CA3AF",fontSize:14,margin:"0 0 6px"}}>Current time: <span style={{color:"#F59E0B"}}>{new Date().toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",hour12:true})}</span></p>
          {!ghSet&&<p style={{color:"#FCA5A5",fontSize:12,margin:"0 0 20px"}}>⚠️ No golden hour set — go to dashboard first</p>}
          <div style={{...S(14),padding:"14px 16px",textAlign:"left",marginBottom:24}}>
            <p style={{fontSize:10,color:"#9CA3AF",margin:"0 0 10px",letterSpacing:2,textTransform:"uppercase"}}>All Possible Prizes</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {ALL_PRIZES.map((p,i)=><span key={i} style={{fontSize:11,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 10px",color:"#9CA3AF"}}>{p.emoji} {p.label}</span>)}
            </div>
          </div>
        </>}
        {goldenPlayed&&!goldenReveal&&<div style={{width:160,height:160,margin:"0 auto 24px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
          <div style={{width:50,height:50,borderRadius:"50%",border:"3px solid #F59E0B",borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
          <p style={{color:"#F59E0B",fontSize:14,margin:0}}>Checking the hour...</p>
        </div>}
        {goldenReveal&&goldenIsWin&&<div style={{marginBottom:24,padding:"26px 20px",background:"rgba(245,158,11,0.15)",border:"2px solid #F59E0B",borderRadius:22,animation:"goldGlow 1s infinite,slideUp 0.5s ease"}}>
          <div style={{fontSize:56,marginBottom:10,animation:"starPulse 0.6s ease-in-out infinite"}}>⭐</div>
          <p style={{color:"#F59E0B",fontSize:22,fontWeight:"bold",margin:0}}>IT'S GOLDEN HOUR!</p>
          <p style={{color:"#9CA3AF",fontSize:13,margin:"8px 0 0"}}>Get ready for your activity...</p>
        </div>}
        {goldenReveal&&!goldenIsWin&&<div style={{marginBottom:24,padding:"22px 20px",background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:22,animation:"slideUp 0.5s ease"}}>
          <div style={{fontSize:48,marginBottom:10}}>🎁</div>
          <p style={{color:"#10B981",fontSize:18,margin:0}}>Not the golden hour...</p>
          <p style={{color:"#9CA3AF",fontSize:13,margin:"6px 0 0"}}>But you still win! Activity loading...</p>
        </div>}
        <button onClick={playGolden} disabled={goldenPlayed||!ghSet} style={{width:"100%",padding:"20px 0",background:goldenPlayed?"rgba(16,185,129,0.2)":!ghSet?"rgba(100,100,100,0.2)":"linear-gradient(135deg,#78350F,#F59E0B)",border:goldenPlayed?"1px solid #10B981":!ghSet?"1px solid rgba(100,100,100,0.3)":"none",borderRadius:16,color:goldenPlayed||!ghSet?"#9CA3AF":"#F5F3FF",fontSize:17,fontWeight:"bold",cursor:goldenPlayed||!ghSet?"default":"pointer",boxShadow:!goldenPlayed&&ghSet?"0 8px 24px rgba(245,158,11,0.3)":"none"}}>
          {goldenPlayed?"✅ Played!":!ghSet?"⚠️ No Golden Hour Set":"⭐ REVEAL MY FORTUNE"}
        </button>
      </div>
    </div>;
  }

  if(screen==="prize"){
    const isBig=prizeResult?.big;
    return <div style={{...W,justifyContent:"center"}}>
      <style>{CSS}</style>
      {isBig&&CONFETTI.map((c,i)=><div key={i} style={{position:"fixed",top:-30,left:`${c.x}%`,width:c.size,height:c.size,background:c.color,borderRadius:c.round?"50%":3,animation:`confetti ${c.dur}s ${c.delay}s linear forwards`,zIndex:50,pointerEvents:"none"}}/>)}
      <div style={{width:"100%",maxWidth:400,textAlign:"center"}}>
        <div style={{margin:"0 auto 24px",padding:"36px 24px",background:isBig?"linear-gradient(135deg,#1a0a2e,#2d1a5e,#1a0a2e)":"rgba(255,255,255,0.05)",border:isBig?"2px solid #F59E0B":"2px solid rgba(124,58,237,0.5)",borderRadius:26,animation:isBig?"prizeIn 0.8s cubic-bezier(0.34,1.56,0.64,1),goldGlow 1.5s 0.8s infinite":"prizeIn 0.7s cubic-bezier(0.34,1.56,0.64,1)",position:"relative",overflow:"hidden"}}>
          {isBig&&<div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,rgba(245,158,11,0.12),transparent 70%)",pointerEvents:"none"}}/>}
          <div style={{fontSize:64,marginBottom:16,animation:"bounce 1.2s ease-in-out infinite"}}>{prizeResult?.emoji}</div>
          <p style={{fontSize:11,color:"#9CA3AF",margin:"0 0 8px",letterSpacing:3,textTransform:"uppercase"}}>{prizeResult?.game}</p>
          {prizeResult?.d1&&<p style={{color:"#9CA3AF",fontSize:13,margin:"0 0 12px"}}>{prizeResult.d1} + {prizeResult.d2} = <span style={{color:"#F59E0B"}}>{prizeResult.d1+prizeResult.d2}</span>{prizeResult.isDouble&&<span style={{color:"#A78BFA",marginLeft:8}}>✨ Double!</span>}</p>}
          {prizeResult?.isGolden!==undefined&&<p style={{fontSize:12,color:prizeResult.isGolden?"#F59E0B":"#10B981",margin:"0 0 12px"}}>{prizeResult.isGolden?"⭐ Golden Hour Winner!":"🎁 Lucky Consolation Prize"}</p>}
          <h2 style={{fontSize:isBig?26:22,color:"#F59E0B",margin:"0 0 22px",fontWeight:"bold",lineHeight:1.35,textShadow:isBig?"0 0 20px rgba(245,158,11,0.6)":"none"}}>{prizeResult?.label}</h2>
          <div style={{background:"rgba(0,0,0,0.35)",borderRadius:12,padding:"12px 20px",border:"1px dashed rgba(245,158,11,0.5)",display:"inline-block",minWidth:200}}>
            <p style={{fontSize:10,color:"#9CA3AF",margin:"0 0 4px",letterSpacing:3}}>CLAIM CODE</p>
            <p style={{fontSize:20,color:"#F59E0B",margin:0,fontWeight:"bold",letterSpacing:4,fontFamily:"monospace"}}>{prizeResult?.code}</p>
          </div>
        </div>
        <p style={{color:"#9CA3AF",fontSize:12,marginBottom:22}}>✅ Saved to claims log</p>
        <div style={{display:"flex",gap:12}}>
          <button onClick={()=>setScreen("dashboard")} style={{flex:1,padding:"16px 0",...S(14),color:"#9CA3AF",fontSize:14,cursor:"pointer"}}>← Dashboard</button>
          <button onClick={()=>startGame(pendingGame)} style={{flex:1,padding:"16px 0",background:"linear-gradient(135deg,#7C3AED,#F59E0B)",border:"none",borderRadius:14,color:"#F5F3FF",fontSize:14,fontWeight:"bold",cursor:"pointer"}}>Play Again →</button>
        </div>
      </div>
    </div>;
  }

  if(screen==="log"){
    const games=["All","Roll the Dice","Jar of Luck","Golden Hour"];
    const gEmoji={"Roll the Dice":"🎲","Jar of Luck":"🔮","Golden Hour":"⭐"};
    return <div style={{...W,justifyContent:"flex-start"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:500}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:"#9CA3AF",cursor:"pointer",fontSize:13}}>← Back</button>
          <h2 style={{fontSize:20,color:"#F59E0B",margin:0}}>📋 Claims Log</h2>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:11,color:"#9CA3AF"}}>{claims.length}/{MAX_CLAIMS}</span>
            {claims.length>0&&<button onClick={()=>{if(window.confirm("Clear all claims?"))setClaims([]);}} style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"4px 10px",color:"#F87171",cursor:"pointer",fontSize:12}}>🗑 Clear</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
          {games.map(g=>{const count=g==="All"?claims.length:claims.filter(c=>c.game===g).length;return <button key={g} onClick={()=>setLogFilter(g)} style={{padding:"8px 14px",borderRadius:20,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",background:logFilter===g?"#7C3AED":"rgba(255,255,255,0.05)",border:logFilter===g?"1px solid #7C3AED":"1px solid rgba(255,255,255,0.1)",color:logFilter===g?"#F5F3FF":"#9CA3AF",transition:"all 0.2s"}}>{g==="All"?"All":gEmoji[g]+" "+g} ({count})</button>;})}
        </div>
        {filteredClaims.length===0
          ?<div style={{textAlign:"center",padding:"60px 0",color:"#9CA3AF"}}><div style={{fontSize:44,marginBottom:12}}>📋</div><p style={{margin:0}}>No claims yet. Let the games begin!</p></div>
          :<div style={{display:"flex",flexDirection:"column",gap:9,maxHeight:"62vh",overflowY:"auto"}}>
            {filteredClaims.map(c=><div key={c.id} style={{...S(14),padding:"13px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <span style={{fontSize:11,color:"#C4B5FD",background:"rgba(124,58,237,0.25)",padding:"3px 9px",borderRadius:10}}>{gEmoji[c.game]} {c.game}</span>
                <span style={{fontSize:11,color:"#9CA3AF"}}>{c.date} · {c.time}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <span style={{fontSize:13,color:"#F59E0B",fontWeight:"bold",flex:1,lineHeight:1.4}}>{c.prize}</span>
                <span style={{fontSize:11,color:"#9CA3AF",fontFamily:"monospace",letterSpacing:1,flexShrink:0}}>{c.code}</span>
              </div>
            </div>)}
          </div>}
      </div>
    </div>;
  }
  return null;
}
