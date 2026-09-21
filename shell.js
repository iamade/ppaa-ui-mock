// PPAA harness UI shell — Phase 1. Mock state only. Spec: issue #1.
const PERSONAS = [
  {id:'akande', name:'Akande', role:'VPS operations', status:'online · vps-main', color:'#4c8dff', provider:'zai/glm-5.3'},
  {id:'mavis',  name:'Mavis',  role:'Mac supervisor', status:'online · mac-01',   color:'#3fb950', provider:'minimax/m3'},
  {id:'lc',     name:'LC',     role:'Coordinator',    status:'idle · heartbeat 30m', color:'#d29922', provider:'zai/glm-5.3-flash'},
];
const MESSAGES = [
  {persona:'akande', text:'Heartbeat sweep complete. Four PPAA crons green after the 15:12Z wedge self-cleared at 18:35Z. Timeline posted to the lane with run receipts.'},
  {persona:'user',   text:'Good. What is blocked on me tonight?'},
  {persona:'akande', text:'Two items: the backend production host decision, and the fixture-project ruling for the MTMBC five. Everything else is in motion.'},
  {persona:'lc',     text:'Drain status: thirteen of eighteen zero-comment tickets moved to Awaiting Ade Approval. Remaining five carry named dispositions.'},
  {persona:'mavis',  text:'Sandbox verification finished — faster-whisper runs clean; the source artifact was the missing piece, now confirmed gone and closed.'},
];
const APPROVALS = [
  {persona:'akande', title:'Restart gateway (quiet window)', detail:'Protected-config patch + restart. Owner-only action; staged diff attached.', risk:'high'},
  {persona:'mavis',  title:'Publish staging build 8138d24', detail:'Character-creation modal fix. Staging evidence verified.', risk:'low'},
  {persona:'lc',     title:'Bulk transition: 5 MTMBC tickets', detail:'Awaiting fixture-project ruling before transition.', risk:'medium'},
];
function initials(name){return name.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()}
function el(tag,cls,html){const n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n}
function render(activeId){
  const roster=document.getElementById('roster');roster.innerHTML='';
  PERSONAS.forEach(p=>{
    const li=el('li',p.id===activeId?'active':'');
    li.innerHTML=`<div class="avatar" style="background:${p.color}">${initials(p.name)}</div>
      <div class="who"><span class="name">${p.name}</span><span class="status">${p.status}</span></div>`;
    li.addEventListener('click',()=>render(p.id));
    roster.appendChild(li);
  });
  const sel=document.getElementById('persona-select');sel.innerHTML='';
  PERSONAS.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=`${p.name} — ${p.role}`;sel.appendChild(o)});
  sel.value=activeId;sel.addEventListener('change',()=>render(sel.value));
  const active=PERSONAS.find(p=>p.id===activeId);
  document.getElementById('model-pill').textContent=active.provider;
  const msgs=document.getElementById('messages');msgs.innerHTML='';
  MESSAGES.forEach(m=>{
    const div=el('div','msg'+(m.persona==='user'?' user':''));
    if(m.persona==='user'){div.innerHTML=`<div class="bubble"><header><span class="name">You</span></header>${m.text}</div>`}
    else{const p=PERSONAS.find(x=>x.id===m.persona);
      div.innerHTML=`<div class="avatar" style="background:${p.color}">${initials(p.name)}</div>
        <div class="bubble"><header><span class="name">${p.name}</span><span class="provider">${p.provider}</span></header>${m.text}</div>`}
    msgs.appendChild(div);
  });
  const ap=document.getElementById('approvals');ap.innerHTML='';
  APPROVALS.forEach(a=>{const p=PERSONAS.find(x=>x.id===a.persona);
    const card=el('div','card');
    card.innerHTML=`<div class="title">${a.title}</div>
      <div class="detail">requested by ${p?p.name:'?'} — ${a.detail}</div>
      <div class="risk ${a.risk}">risk: ${a.risk}</div>
      <div class="actions"><button class="approve" disabled>Approve</button><button disabled>Reject</button></div>`;
    ap.appendChild(card);
  });
}
render('akande');
