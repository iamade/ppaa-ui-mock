/* PPAA harness mock v3 — Tobi — 2026-09-26.
 * Vanilla JS. No network. No build. State in localStorage under ppaa-v3-*.
 *
 * Key v3 changes vs v2 (Tobi+Akande 2026-09-22):
 *  - Mature visual system: neutral palette, single amber accent, JetBrains Mono for code,
 *    Inter for UI, larger breathing room.
 *  - Default avatars are human-like portraits (4 included); animal/robot stay optional.
 *  - State model expanded to 7 explicit states: idle, listening, thinking, speaking,
 *    working, approval, error. Each renders with a different ring colour + spinner speed.
 *  - Approval flow: pre-execution cards in conversation + dedicated approvals queue +
 *    policy toggles (low-risk auto, repeat-window, money gate, daily digest).
 *  - Memory panel adds source attribution, export, and "wipe all" (settings).
 *  - Composer has tool chips (attach, search, add tool) and a hold-to-talk mic with
 *    live waveform mock.
 *  - Top bar with global search, environment chip ("Hosted"), and account avatar.
 *  - All routes from v2 preserved; new pre-execution approval surface is in-conversation
 *    but the approvals queue remains the canonical list.
 */
(function () {
  'use strict';

  // ============ PORTRAITS (photoreal AI-generated, fictional people) ============
  // v3 fix pass 2026-09-26: replaced inline SVG human illustrations with
  // photoreal AI-generated headshots for the four default human personas
  // (Ada / Marcus / Helena / Arjun). All images are fictional people, no real
  // likenesses. See assets/portraits/LICENCE.md.
  // Animal/robot personas stay as original inline SVG (Plan §1 — optional).
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, children) {
    const e = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (children) children.forEach(c => e.appendChild(c));
    return e;
  }
  // Build a portrait: photoreal <img> for humans, SVG for animal/robot.
  // Humans use assets/portraits/<name>.jpg (fictional AI-generated people).
  function portraitImg({src, alt}) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.loading = 'eager';
    img.decoding = 'async';
    img.draggable = false;
    img.className = 'portrait-img';
    return img;
  }
  // Legacy SVG builder (kept for animal/robot personas only).
  function portraitSvg({skin='#caa68a', hair='#2b1b12', hairStyle='short', cloth='#1f3a4d', collar='round', glasses=false, accent='#f5a524', id}){
    const w = 200, h = 200;
    const svg = el('svg', {viewBox:'0 0 200 200', xmlns:SVG_NS});
    // soft radial bg
    const defs = el('defs');
    const bg = el('radialGradient', {id:'bg-'+id, cx:'50%', cy:'40%', r:'60%'});
    bg.appendChild(el('stop', {offset:'0%', 'stop-color':'#2a3142'}));
    bg.appendChild(el('stop', {offset:'100%', 'stop-color':'#161b22'}));
    defs.appendChild(bg);
    svg.appendChild(defs);
    svg.appendChild(el('rect', {width:200, height:200, fill:'url(#bg-'+id+')'}));
    // shoulders / clothing
    const shoulder = el('path', {d:'M30 200 q0 -60 70 -64 q70 4 70 64 z', fill:cloth});
    svg.appendChild(shoulder);
    // collar detail
    if (collar === 'v') {
      svg.appendChild(el('path', {d:'M80 200 q20 -22 20 -22 q20 22 20 22', fill:'#0e1117'}));
    } else if (collar === 'crew') {
      svg.appendChild(el('path', {d:'M70 200 q30 -10 60 0', fill:'none', stroke:'#0e1117', 'stroke-width':2}));
    }
    // neck
    svg.appendChild(el('rect', {x:88, y:140, width:24, height:24, rx:6, fill:skin}));
    // hair back (behind head)
    if (hairStyle === 'long') {
      svg.appendChild(el('path', {d:'M50 110 q0 -70 50 -70 q50 0 50 70 q-6 50 -16 60 q-2 -40 -34 -40 q-32 0 -34 40 q-10 -10 -16 -60z', fill:hair}));
    } else if (hairStyle === 'curly') {
      svg.appendChild(el('path', {d:'M48 108 q0 -64 52 -64 q52 0 52 64 q-2 14 -8 18 q-2 -16 -16 -16 q-2 -14 -16 -14 q-2 -12 -12 -12 q-10 0 -12 12 q-14 0 -16 14 q-14 0 -16 16 q-6 -4 -8 -18z', fill:hair}));
    } else if (hairStyle === 'fade') {
      svg.appendChild(el('path', {d:'M58 96 q0 -50 42 -50 q42 0 42 50 q-2 12 -10 16 q0 -14 -32 -14 q-32 0 -32 14 q-8 -4 -10 -16z', fill:hair}));
    } else if (hairStyle === 'wavy') {
      svg.appendChild(el('path', {d:'M52 96 q0 -46 48 -46 q48 0 48 46 q-2 18 -10 22 q-2 -10 -16 -10 q-2 -8 -16 -8 q-14 0 -16 8 q-14 0 -16 10 q-8 -4 -10 -22z', fill:hair}));
    } else {
      svg.appendChild(el('path', {d:'M58 100 q0 -54 42 -54 q42 0 42 54 q-2 10 -10 14 q-2 -12 -32 -12 q-30 0 -32 12 q-8 -4 -10 -14z', fill:hair}));
    }
    // face (head)
    svg.appendChild(el('ellipse', {cx:100, cy:108, rx:38, ry:42, fill:skin}));
    // ears
    svg.appendChild(el('ellipse', {cx:62, cy:112, rx:5, ry:8, fill:skin}));
    svg.appendChild(el('ellipse', {cx:138, cy:112, rx:5, ry:8, fill:skin}));
    // hair front (over forehead)
    if (hairStyle === 'long' || hairStyle === 'wavy') {
      svg.appendChild(el('path', {d:'M62 96 q0 -42 38 -42 q38 0 38 42 q-6 -12 -22 -12 q-8 -2 -16 -2 q-8 0 -16 2 q-16 0 -22 12z', fill:hair}));
    } else if (hairStyle === 'curly') {
      svg.appendChild(el('path', {d:'M64 96 q0 -38 36 -38 q36 0 36 38 q-4 -10 -18 -10 q-4 -8 -18 -8 q-14 0 -18 8 q-14 0 -18 10z', fill:hair}));
    }
    // eyebrows
    svg.appendChild(el('rect', {x:78, y:96, width:14, height:3, rx:1.5, fill:hair}));
    svg.appendChild(el('rect', {x:108, y:96, width:14, height:3, rx:1.5, fill:hair}));
    // glasses
    if (glasses) {
      svg.appendChild(el('circle', {cx:85, cy:108, r:10, fill:'none', stroke:'#1a1a1a', 'stroke-width':2}));
      svg.appendChild(el('circle', {cx:115, cy:108, r:10, fill:'none', stroke:'#1a1a1a', 'stroke-width':2}));
      svg.appendChild(el('line', {x1:95, y1:108, x2:105, y2:108, stroke:'#1a1a1a', 'stroke-width':2}));
    }
    // eyes
    svg.appendChild(el('ellipse', {cx:85, cy:108, rx:3.2, ry:3.6, fill:'#1a1a1a'}));
    svg.appendChild(el('ellipse', {cx:115, cy:108, rx:3.2, ry:3.6, fill:'#1a1a1a'}));
    svg.appendChild(el('circle', {cx:86, cy:107, r:1, fill:'#fff'}));
    svg.appendChild(el('circle', {cx:116, cy:107, r:1, fill:'#fff'}));
    // nose (subtle)
    svg.appendChild(el('path', {d:'M100 116 q-2 8 0 12', fill:'none', stroke:skin, 'stroke-width':1.5, opacity:0.6}));
    // mouth (small smile)
    svg.appendChild(el('path', {d:'M90 134 q10 8 20 0', fill:'none', stroke:'#7a3a3a', 'stroke-width':2.5, 'stroke-linecap':'round'}));
    // small accent (a subtle warm highlight on cheek) — for warmth
    svg.appendChild(el('circle', {cx:76, cy:124, r:5, fill:accent, opacity:0.10}));
    svg.appendChild(el('circle', {cx:124, cy:124, r:5, fill:accent, opacity:0.10}));
    return svg;
  }

  // Animal/robot personas stay optional (per Plan §1 — not the default, but selectable).
  function foxSvg(){
    const svg = el('svg', {viewBox:'0 0 100 100', xmlns:SVG_NS});
    svg.appendChild(el('rect', {width:100, height:100, fill:'#1a0f08'}));
    svg.appendChild(el('polygon', {points:'22,30 32,62 42,42', fill:'#f5a524'}));
    svg.appendChild(el('polygon', {points:'78,30 68,62 58,42', fill:'#f5a524'}));
    svg.appendChild(el('ellipse', {cx:50, cy:60, rx:30, ry:26, fill:'#f5a524'}));
    svg.appendChild(el('ellipse', {cx:50, cy:68, rx:16, ry:12, fill:'#ffe9d6'}));
    svg.appendChild(el('circle', {cx:38, cy:52, r:4.5, fill:'#0e1117'}));
    svg.appendChild(el('circle', {cx:62, cy:52, r:4.5, fill:'#0e1117'}));
    svg.appendChild(el('rect', {x:46, y:64, width:8, height:4, rx:2, fill:'#0e1117'}));
    return svg;
  }
  function owlSvg(){
    const svg = el('svg', {viewBox:'0 0 100 100', xmlns:SVG_NS});
    svg.appendChild(el('rect', {width:100, height:100, fill:'#0c1422'}));
    svg.appendChild(el('ellipse', {cx:50, cy:58, rx:32, ry:34, fill:'#8b6b4a'}));
    svg.appendChild(el('circle', {cx:38, cy:50, r:12, fill:'#ffe9d6'}));
    svg.appendChild(el('circle', {cx:62, cy:50, r:12, fill:'#ffe9d6'}));
    svg.appendChild(el('circle', {cx:38, cy:50, r:4.5, fill:'#0e1117'}));
    svg.appendChild(el('circle', {cx:62, cy:50, r:4.5, fill:'#0e1117'}));
    svg.appendChild(el('polygon', {points:'50,58 44,66 56,66', fill:'#f5a524'}));
    return svg;
  }
  function robotSvg(){
    const svg = el('svg', {viewBox:'0 0 100 100', xmlns:SVG_NS});
    svg.appendChild(el('rect', {width:100, height:100, fill:'#0a1018'}));
    svg.appendChild(el('rect', {x:24, y:30, width:52, height:46, rx:10, fill:'#5aa9ff'}));
    svg.appendChild(el('rect', {x:48, y:18, width:4, height:12, fill:'#5aa9ff'}));
    svg.appendChild(el('circle', {cx:50, cy:16, r:4, fill:'#f5a524'}));
    svg.appendChild(el('circle', {cx:38, cy:48, r:4.5, fill:'#0e1117'}));
    svg.appendChild(el('circle', {cx:62, cy:48, r:4.5, fill:'#0e1117'}));
    svg.appendChild(el('rect', {x:40, y:62, width:20, height:4, rx:2, fill:'#0e1117'}));
    return svg;
  }

  // PERSONAS registry. v3 default = humans (per Ade 2026-09-21 / Plan §1).
  // Humans use photoreal AI-generated portraits (assets/portraits/*.jpg).
  const PERSONAS = {
    ada:      { label:'Ada',      kind:'human', build: () => portraitImg({src:'assets/portraits/ada.jpg',    alt:'Ada (fictional portrait, AI-generated)'}) },
    marcus:   { label:'Marcus',   kind:'human', build: () => portraitImg({src:'assets/portraits/marcus.jpg', alt:'Marcus (fictional portrait, AI-generated)'}) },
    helena:   { label:'Helena',   kind:'human', build: () => portraitImg({src:'assets/portraits/helena.jpg', alt:'Helena (fictional portrait, AI-generated)'}) },
    arjun:    { label:'Arjun',    kind:'human', build: () => portraitImg({src:'assets/portraits/arjun.jpg',  alt:'Arjun (fictional portrait, AI-generated)'}) },
    // optional (kept from v2, but not the default)
    fox:      { label:'Fox',      kind:'animal', build: foxSvg },
    owl:      { label:'Owl',      kind:'animal', build: owlSvg },
    robot:    { label:'Robot',    kind:'robot',  build: robotSvg },
  };
  const VOICE_LABEL = { Warm:'Warm voice', Calm:'Calm voice', Bright:'Bright voice' };
  const STATE_LABEL = {
    idle:'Idle', listening:'Listening…', thinking:'Thinking…', speaking:'Speaking',
    working:'Working on it…', approval:'Needs your OK', error:'Something went wrong'
  };

  // ============ STATE ============
  const defaultAgents = [
    { id:'a1', name:'Ada',    persona:'ada',    voice:'Warm',  role:'Everyday helper', status:'idle' },
    { id:'a2', name:'Marcus', persona:'marcus', voice:'Bright', role:'Coder',           status:'approval' },
    { id:'a3', name:'Helena', persona:'helena', voice:'Calm',   role:'Researcher',      status:'working' },
    { id:'a4', name:'Arjun',  persona:'arjun',  voice:'Bright', role:'Writer',          status:'idle' },
  ];
  const defaultApprovals = [
    { id:'p1', agent:'a2', title:'Push code to GitHub', cmd:'git push origin feature/persona-plugin', risk:'med', why:'You asked Marcus to ship the persona plugin.' },
    { id:'p2', agent:'a3', title:'Send an email on your behalf', cmd:'mail.send(to="landlord@…", subject="Lease renewal")', risk:'high', why:'Helena drafted the lease email you discussed.' },
    { id:'p3', agent:'a1', title:'Read your calendar', cmd:'calendar.list(range="next 7 days")', risk:'low', why:'Ada wants to plan your week.' },
  ];
  const defaultMemory = {
    a1: ['You prefer short answers, no fluff.', 'You live in Edmonton (MDT).', "Your partner's birthday is in October."],
    a2: ['Main repo: peopleprotocolinc. Always branch off dev_branch.', 'You dislike force-push.'],
    a3: ['Research style: cite sources, flag unverified items with (?).'],
    a4: ['Voice: punchy, second-person. No exclamation marks.'],
  };
  const defaultTeam = [
    { id:'t1', agent:'a2', text:'Pulled latest dev_branch — 2 conflicts to resolve.', at:'2 min ago' },
    { id:'t2', agent:'a3', text:'Found 3 sources for the lease-renewal question. Sending to Ada for review.', at:'6 min ago' },
    { id:'t3', agent:'a1', text:'Cross-checked Helena\'s draft. Looks solid; ready for your OK.', at:'9 min ago' },
  ];
  const defaultTasks = {
    a1: null,
    a2: { name:'Resolve merge conflicts on persona plugin', steps:[
      { id:'s1', label:'Read current conflicts', state:'done' },
      { id:'s2', label:'Ask you which side to keep', state:'active' },
      { id:'s3', label:'Apply changes & commit', state:'pending' },
      { id:'s4', label:'Push branch (awaits approval)', state:'pending' },
    ]},
    a3: { name:'Draft lease-renewal email', steps:[
      { id:'s1', label:'Read prior correspondence', state:'done' },
      { id:'s2', label:'Draft body', state:'done' },
      { id:'s3', label:'Send (awaits approval)', state:'active' },
    ]},
    a4: null,
  };

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem('ppaa-v3-'+k)); return v ?? d; } catch { return d; } };
  const save = (k, v) => localStorage.setItem('ppaa-v3-'+k, JSON.stringify(v));

  let agents        = load('agents', defaultAgents);
  let approvals     = load('approvals', defaultApprovals);
  let memory        = load('memory', defaultMemory);
  let team          = load('team', defaultTeam);
  let tasks         = load('tasks', defaultTasks);
  let policies      = load('policies', { autolow:true, repeat:true, money:true, summary:false });
  let currentAgent  = load('current', 'a1');
  let approvalFilter= 'all';
  const draft = { persona:'ada', voice:'Warm', role:'Everyday helper' };
  const transcripts = load('transcripts', {});

  // Pre-seed transcripts for the default agents so the conversation isn't empty on first paint.
  function seedTranscripts() {
    defaultAgents.forEach(a => {
      if (!transcripts[a.id]) {
        transcripts[a.id] = [
          { who:'sys', text:`You're talking to ${a.name} (${a.role}). Voice: ${a.voice}.` },
          { who:'agent', text:`Hey — I'm ${a.name}. Hold the mic to talk, or type below. What are we doing today?` },
        ];
      }
    });
    // Also seed a realistic exchange for Marcus (a2) so the Talk screenshot shows the approval-card path.
    if (!transcripts.a2 || transcripts.a2.length <= 2) {
      transcripts.a2 = [
        { who:'sys', text:`You're talking to Marcus (Coder). Voice: Bright.` },
        { who:'agent', text:`Morning — I was working on the persona plugin. Two of the files I touched conflict with what's already on dev_branch. Want me to show you?` },
        { who:'user', text:`Yeah, show me the conflicts and resolve them in favor of theirs.` },
        { who:'agent', text:`On it. I'll need your OK before I push anything to GitHub.` },
        { who:'tool', cmd:'git checkout --theirs src/persona.ts  (resolve 2 conflicts in persona.ts)', risk:'med', why:'Two hunks conflict. Auto-resolve in favor of theirs; you can review the diff before commit.' },
      ];
    }
    save('transcripts', transcripts);
  }
  seedTranscripts();

  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const agentById = id => agents.find(a => a.id === id) || agents[0];

  function avatarNode(a) {
    const wrap = document.createElement('div');
    wrap.className = 'portrait';
    wrap.dataset.state = a.status;
    const p = (PERSONAS[a.persona] || PERSONAS.ada);
    const inner = p.build();
    // For human (img) portraits, wrap with a `.portrait-fill` so the <img>
    // fills the round .portrait container without breaking the state border.
    if (p.kind === 'human') {
      const fill = document.createElement('div');
      fill.className = 'portrait-fill';
      fill.appendChild(inner);
      wrap.appendChild(fill);
    } else {
      wrap.appendChild(inner);
    }
    return wrap;
  }
  function avatarHTML(a) {
    const tmp = document.createElement('div');
    tmp.appendChild(avatarNode(a));
    return tmp.innerHTML;
  }
  // Serialised SVG string for templates (so we can use it in innerHTML)
  function avatarSVGString(a) {
    const tmp = document.createElement('div');
    tmp.appendChild(avatarNode(a));
    return tmp.innerHTML;
  }

  // ============ TOAST ============
  let toastT;
  function toast(msg, ms=2200) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
  }

  // ============ ROUTER ============
  const VIEWS = ['welcome','home','talk','approvals','memory','settings'];
  function route() {
    let h = (location.hash || '').replace('#', '');
    if (!VIEWS.includes(h)) h = agents.length ? 'home' : 'welcome';
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-'+h));
    $$('#rail .rail-item').forEach(a => a.classList.toggle('on', a.dataset.nav === h));
    if (h === 'home')        renderHome();
    if (h === 'talk')        renderTalk();
    if (h === 'approvals')   renderApprovals();
    if (h === 'memory')      renderMemory();
    if (h === 'welcome')     renderWelcome();
    updateBadge();
    window.scrollTo({top:0, behavior:'instant'});
  }
  const go = h => { location.hash = h; };

  // ============ TOP BAR ============
  function renderMeAvatar() {
    const me = $('#me-avatar'); me.innerHTML = '';
    const a = agents[0];
    me.appendChild(avatarNode(a));
  }

  // ============ 1. WELCOME ============
  function renderWelcome() {
    const grid = $('#persona-grid');
    grid.innerHTML = '';
    Object.entries(PERSONAS).forEach(([k, p]) => {
      const opt = document.createElement('button');
      opt.className = 'persona-opt' + (k === draft.persona ? ' selected' : '');
      opt.dataset.persona = k;
      const av = document.createElement('div');
      av.className = 'avatar-md';
      if (k === draft.persona) av.classList.add('selected');
      const port = document.createElement('div');
      port.className = 'portrait';
      port.appendChild(p.build());
      av.appendChild(port);
      const lbl = document.createElement('span');
      lbl.className = 'name';
      lbl.textContent = p.label;
      opt.appendChild(av);
      opt.appendChild(lbl);
      grid.appendChild(opt);
    });
    const preview = $('#welcome-preview'); preview.innerHTML = '';
    preview.dataset.state = 'idle';
    preview.appendChild((PERSONAS[draft.persona] || PERSONAS.ada).build());
    $('#welcome-preview-name').textContent = $('#agent-name').value || 'Ada';
    $('#welcome-preview-meta').textContent = `${VOICE_LABEL[draft.voice]} · ${draft.role}`;
    // state pill
    const pill = $('#welcome-state');
    pill.querySelector('.state-dot').dataset.state = 'idle';
    pill.querySelector('span:last-child').textContent = 'Idle';
    $('#welcome-ring').dataset.state = 'idle';
  }

  // ============ 2. HOME ============
  function renderHome() {
    const pending = approvals.length;
    $('#home-sub').textContent = pending
      ? `${pending} action${pending > 1 ? 's' : ''} waiting for your OK.`
      : 'Tap one to talk.';
    const grid = $('#agent-grid');
    grid.innerHTML = '';
    agents.forEach(a => {
      const card = document.createElement('div');
      card.className = 'card agent-card';
      card.dataset.open = a.id;
      card.appendChild(avatarNode(a));
      const name = document.createElement('div'); name.className='name'; name.textContent = a.name;
      const role = document.createElement('div'); role.className='role'; role.textContent = a.role;
      const stat = document.createElement('div'); stat.className='row small muted';
      const dot = document.createElement('span'); dot.className = 'dot ' + a.status;
      stat.appendChild(dot);
      stat.appendChild(document.createTextNode(' ' + (STATE_LABEL[a.status] || 'Idle')));
      card.appendChild(name); card.appendChild(role); card.appendChild(stat);
      // quick actions
      const acts = document.createElement('div'); acts.className='row-actions';
      const tBtn = mkBtn('Talk', () => { currentAgent = a.id; save('current', currentAgent); go('talk'); }, 'btn sm');
      const mBtn = mkBtn('Memory', () => { currentAgent = a.id; save('current', currentAgent); go('memory'); }, 'btn sm ghost');
      acts.appendChild(tBtn); acts.appendChild(mBtn);
      card.appendChild(acts);
      grid.appendChild(card);
    });
    // new agent card
    const nu = document.createElement('button');
    nu.className = 'card agent-card new';
    nu.dataset.route = 'welcome';
    nu.innerHTML = '<div style="font-size:32px;line-height:1">+</div><div class="strong">New agent</div><div class="small muted">Pick a persona, name them, give a role</div>';
    grid.appendChild(nu);

    // team feed
    const feed = $('#team-feed'); feed.innerHTML = '';
    team.slice(0, 6).forEach(t => {
      const a = agentById(t.agent);
      const row = document.createElement('div'); row.className='row';
      const av = document.createElement('div'); av.className='agent-mini';
      av.appendChild(avatarNode(a));
      const text = document.createElement('div'); text.style.flex='1';
      text.innerHTML = `<strong>${a.name}</strong> <span class="muted small">· ${t.at}</span><br><span class="small">${t.text}</span>`;
      row.appendChild(av); row.appendChild(text);
      feed.appendChild(row);
    });
    updateBadge();
  }

  function mkBtn(label, fn, cls='btn') {
    const b = document.createElement('button');
    b.className = cls; b.textContent = label;
    b.addEventListener('click', fn);
    return b;
  }

  // ============ 3. TALK ============
  function ensureTranscript(id) {
    if (!transcripts[id]) {
      const a = agentById(id);
      transcripts[id] = [
        { who:'sys', text:`You're talking to ${a.name} (${a.role}). Voice: ${a.voice}.` },
        { who:'agent', text:`Hey — I'm ${a.name}. Hold the mic to talk, or type below. What are we doing today?` },
      ];
    }
    return transcripts[id];
  }
  function renderSwitch(containerId) {
    const c = $('#'+containerId); c.innerHTML = '';
    agents.forEach(a => {
      const chip = document.createElement('button');
      chip.className = 'chip ' + (a.id === currentAgent ? 'on' : '');
      chip.dataset.pick = a.id;
      const av = document.createElement('span'); av.className='avatar-sm';
      const p = document.createElement('div'); p.className='portrait'; p.appendChild((PERSONAS[a.persona]||PERSONAS.ada).build());
      av.appendChild(p);
      chip.appendChild(av);
      chip.appendChild(document.createTextNode(' ' + a.name));
      c.appendChild(chip);
    });
  }
  function setTalkState(state) {
    const a = agentById(currentAgent);
    a.status = state; save('agents', agents);
    $('#talk-avatar').dataset.state = state;
    $('#talk-ring').dataset.state = state;
    const pill = $('#talk-state');
    pill.querySelector('.state-dot').dataset.state = state;
    pill.querySelector('#talk-state-label').textContent = STATE_LABEL[state] || 'Idle';
    $('#composer-status').textContent = STATE_LABEL[state] || 'Idle';
  }
  function renderTalk() {
    renderSwitch('talk-switch');
    const a = agentById(currentAgent);
    $('#talk-avatar').innerHTML = '';
    $('#talk-avatar').appendChild((PERSONAS[a.persona]||PERSONAS.ada).build());
    $('#talk-avatar').dataset.state = a.status;
    $('#talk-ring').dataset.state = a.status;
    $('#talk-name').textContent = a.name;
    $('#talk-role').textContent = `${a.role} · ${a.voice} voice`;
    const ct = $('#conv-title'); if (ct) ct.textContent = `Conversation with ${a.name}`;
    const cs = $('#conv-sub');  if (cs) cs.textContent  = `${a.role} · ${a.voice} voice · started just now`;
    // state pill
    const pill = $('#talk-state');
    pill.querySelector('.state-dot').dataset.state = a.status;
    $('#talk-state-label').textContent = STATE_LABEL[a.status] || 'Idle';
    $('#composer-status').textContent = STATE_LABEL[a.status] || 'Idle';

    // active task panel
    const at = $('#active-task');
    at.innerHTML = '';
    const task = tasks[a.id];
    if (task) {
      const wrap = document.createElement('div');
      const t = document.createElement('div'); t.className='strong'; t.textContent = task.name;
      wrap.appendChild(t);
      const prog = document.createElement('div'); prog.className='task-progress';
      task.steps.forEach(s => {
        const r = document.createElement('div');
        r.className = 'step ' + s.state;
        const n = document.createElement('div'); n.className='num'; n.textContent = s.state==='done' ? '✓' : (s.state==='active' ? '●' : '○');
        const lbl = document.createElement('div'); lbl.textContent = s.label;
        r.appendChild(n); r.appendChild(lbl);
        prog.appendChild(r);
      });
      wrap.appendChild(prog);
      at.appendChild(wrap);
    } else {
      at.innerHTML = `<div class="muted small">No active task. Ask ${a.name} something.</div>`;
    }

    // memory peek
    const peek = $('#memory-peek'); peek.innerHTML = '';
    const items = (memory[a.id] || []).slice(0, 4);
    if (!items.length) {
      const li = document.createElement('li'); li.className='empty'; li.textContent='Nothing remembered yet.';
      peek.appendChild(li);
    } else {
      items.forEach(m => {
        const li = document.createElement('li'); li.textContent = m;
        peek.appendChild(li);
      });
    }

    renderTranscript();
  }

  function renderTranscript() {
    const t = ensureTranscript(currentAgent);
    const tr = $('#transcript');
    tr.innerHTML = '';
    t.forEach((m, i) => {
      if (m.who === 'tool') {
        const card = document.createElement('div');
        card.className = 'toolcard ' + (m.done ? 'done' : 'approval');
        const head = document.createElement('div'); head.className='head';
        const left = document.createElement('div'); left.className='left';
        const ico = document.createElement('span'); ico.textContent='🔧';
        const title = document.createElement('div'); title.className='title';
        title.innerHTML = `${ico.outerHTML} <span>${agentById(currentAgent).name} wants to run a tool</span>`;
        const badge = document.createElement('span'); badge.className = 'badge ' + m.risk;
        badge.textContent = m.risk + ' risk';
        left.appendChild(title);
        head.appendChild(left);
        head.appendChild(badge);
        card.appendChild(head);

        const why = document.createElement('p'); why.className='why'; why.textContent = m.why;
        card.appendChild(why);
        const code = document.createElement('code'); code.textContent = m.cmd;
        card.appendChild(code);

        if (m.done) {
          const sl = document.createElement('div'); sl.className = 'status-line ' + (m.done === 'ok' ? 'ok' : 'no');
          sl.textContent = m.done === 'ok' ? '✅ Approved · running' : '⛔ Denied';
          card.appendChild(sl);
        } else {
          const actions = document.createElement('div'); actions.className='actions';
          const ok = document.createElement('button'); ok.className='btn ok'; ok.textContent='Approve'; ok.dataset.tool='ok'; ok.dataset.i=i;
          const no = document.createElement('button'); no.className='btn bad'; no.textContent='Deny'; no.dataset.tool='no'; no.dataset.i=i;
          const edit = document.createElement('button'); edit.className='btn sm ghost'; edit.textContent='Edit & approve'; edit.dataset.tool='edit'; edit.dataset.i=i;
          actions.appendChild(ok); actions.appendChild(no); actions.appendChild(edit);
          card.appendChild(actions);
        }
        tr.appendChild(card);
      } else if (m.who === 'sys') {
        const sys = document.createElement('div'); sys.className='msg sys'; sys.textContent = m.text;
        tr.appendChild(sys);
      } else if (m.who === 'agent') {
        const a = agentById(currentAgent);
        const wrap = document.createElement('div'); wrap.style.maxWidth='86%'; wrap.style.alignSelf='flex-start';
        const meta = document.createElement('div'); meta.className='msg-meta';
        const av = document.createElement('div'); av.className='avatar-sm';
        const p = document.createElement('div'); p.className='portrait'; p.dataset.state = a.status;
        p.appendChild((PERSONAS[a.persona]||PERSONAS.ada).build());
        av.appendChild(p);
        meta.appendChild(av);
        const nm = document.createElement('span'); nm.textContent = a.name;
        meta.appendChild(nm);
        wrap.appendChild(meta);
        const body = document.createElement('div'); body.className='msg agent' + (m.streaming ? ' streaming' : '');
        body.textContent = m.text;
        wrap.appendChild(body);
        tr.appendChild(wrap);
      } else if (m.who === 'user') {
        const body = document.createElement('div'); body.className='msg user';
        body.textContent = m.text;
        tr.appendChild(body);
      }
    });
    tr.scrollTop = tr.scrollHeight;
    save('transcripts', transcripts);
  }

  function userSay(text) {
    ensureTranscript(currentAgent).push({ who:'user', text });
    renderTranscript();
    setTalkState('thinking');
    setTimeout(() => agentSay(replyFor(text)), 900);
  }
  function agentSay(text, streamingMs=900) {
    const t = ensureTranscript(currentAgent);
    t.push({ who:'agent', text, streaming:true });
    renderTranscript();
    setTalkState('speaking');
    const dur = Math.min(4500, 900 + text.length * 35);
    setTimeout(() => {
      // remove streaming flag
      const arr = ensureTranscript(currentAgent);
      const last = arr[arr.length - 1];
      if (last && last.streaming) last.streaming = false;
      renderTranscript();
      setTalkState('idle');
    }, streamingMs + dur);
    // update agent status after speech
    setTimeout(() => { const a = agentById(currentAgent); if (a.status === 'speaking') a.status = 'idle'; save('agents', agents); }, dur + streamingMs + 100);
  }
  function replyFor(text) {
    const a = agentById(currentAgent);
    const t = text.toLowerCase();
    if (/push|deploy|ship/.test(t)) { setTimeout(pushToolDemo, 1100); return "On it. I'll need your OK before I push anything."; }
    if (/conflict/.test(t)) { setTimeout(conflictToolDemo, 1100); return "Yeah, two of them. Let me show you what's conflicting and you can decide."; }
    if (/remember|forget/.test(t)) return "Got it — I'll keep that in mind. You can always check what I know about you under Memory.";
    if (/who are you|your name/.test(t)) return `I'm ${a.name}, your ${a.role.toLowerCase()}. I speak with the ${a.voice.toLowerCase()} voice you picked.`;
    if (/email|lease/.test(t)) { setTimeout(emailToolDemo, 1100); return "Drafted. You'll see the approval card in a moment."; }
    return `“${text}” — sure. (In the real app this is a live model reply, spoken aloud with lip-sync on the avatar.)`;
  }

  function pushToolDemo() {
    ensureTranscript(currentAgent).push({ who:'tool', cmd:'git push origin feature/persona-plugin', risk:'med', why:'Pushes 3 commits to GitHub. Reversible, but visible to others.' });
    renderTranscript(); setAgentStatus(currentAgent, 'approval');
    setTalkState('approval');
  }
  function conflictToolDemo() {
    ensureTranscript(currentAgent).push({ who:'tool', cmd:'git checkout --theirs src/persona.ts  (resolve 2 conflicts in persona.ts)', risk:'med', why:'Two hunks conflict. Auto-resolve in favor of theirs; you can review the diff before commit.' });
    renderTranscript(); setAgentStatus(currentAgent, 'approval');
    setTalkState('approval');
  }
  function emailToolDemo() {
    ensureTranscript(currentAgent).push({ who:'tool', cmd:'mail.send(to="landlord@example.com", subject="Lease renewal — confirming terms")', risk:'high', why:'Sends the email Helena drafted. External, irreversible.' });
    renderTranscript(); setAgentStatus(currentAgent, 'approval');
    setTalkState('approval');
  }
  function setAgentStatus(id, s) { const a = agentById(id); a.status = s; save('agents', agents); }

  // mic hold-to-talk
  (function mic(){
    const m = $('#mic'); let holding=false, t0, wave;
    const start = e => {
      e.preventDefault(); holding=true; t0=Date.now();
      m.classList.add('hold');
      setTalkState('listening');
      // add waveform mock to status
      $('#composer-status').innerHTML = 'Listening <span class="waveform" id="wf"><span></span><span></span><span></span><span></span><span></span></span>';
    };
    const end = () => {
      if (!holding) return; holding=false; m.classList.remove('hold');
      const held = Date.now() - t0;
      if (held < 250) { toast('Hold the mic to talk'); setTalkState('idle'); return; }
      setTalkState('thinking');
      setTimeout(() => {
        // pick a contextual demo line for whichever agent
        const a = agentById(currentAgent);
        const lines = {
          a1: 'Can you plan my week based on my calendar?',
          a2: 'Resolve the merge conflicts on the persona plugin.',
          a3: 'Draft the lease renewal email I asked about.',
          a4: 'Help me rewrite this blog intro — punchier, less corporate.',
        };
        userSay(lines[a.id] || 'Can you help me with something?');
      }, 250);
    };
    m.addEventListener('pointerdown', start);
    m.addEventListener('pointerup', end);
    m.addEventListener('pointercancel', end);
    m.addEventListener('pointerleave', end);
  })();

  // textarea autoresize
  (function autoresize(){
    const ta = $('#talk-input');
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(200, ta.scrollHeight) + 'px';
    });
  })();

  // ============ 4. APPROVALS ============
  function renderApprovals() {
    const list = approvals.filter(p => approvalFilter === 'all' || p.risk === approvalFilter);
    $$('[data-filter]').forEach(c => c.classList.toggle('on', c.dataset.filter === approvalFilter));
    // counts
    ['all','high','med','low'].forEach(k => {
      const el = $('#filter-count-'+k);
      if (!el) return;
      const n = k === 'all' ? approvals.length : approvals.filter(p => p.risk === k).length;
      el.textContent = String(n);
    });
    const wrap = $('#approval-list'); wrap.innerHTML = '';
    if (!list.length) {
      const e = document.createElement('div'); e.className='card';
      e.style.textAlign='center';
      e.innerHTML = '<div style="font-size:36px;line-height:1">🎉</div><p class="muted" style="margin:8px 0 0">Nothing waiting. Your agents are good to go.</p>';
      wrap.appendChild(e);
    } else {
      list.forEach(p => {
        const a = agentById(p.agent);
        const card = document.createElement('div'); card.className='card approval';
        // head
        const head = document.createElement('div'); head.className='head';
        const left = document.createElement('div'); left.className='left';
        const av = document.createElement('div'); av.className='avatar-md';
        const port = document.createElement('div'); port.className='portrait'; port.dataset.state = a.status;
        port.appendChild((PERSONAS[a.persona]||PERSONAS.ada).build());
        av.appendChild(port);
        const txt = document.createElement('div');
        const h4 = document.createElement('h4'); h4.textContent = p.title;
        const who = document.createElement('div'); who.className='who'; who.textContent = `${a.name} · ${a.role}`;
        txt.appendChild(h4); txt.appendChild(who);
        left.appendChild(av); left.appendChild(txt);
        head.appendChild(left);
        const badge = document.createElement('span'); badge.className='badge '+p.risk;
        badge.innerHTML = '<span class="pulse"></span>'+p.risk;
        head.appendChild(badge);
        card.appendChild(head);

        const why = document.createElement('p'); why.className='why muted'; why.textContent = p.why;
        card.appendChild(why);
        const code = document.createElement('code'); code.textContent = p.cmd;
        card.appendChild(code);

        const actions = document.createElement('div'); actions.className='actions';
        const ok = document.createElement('button'); ok.className='btn ok'; ok.textContent='Approve'; ok.dataset.approve=p.id;
        const no = document.createElement('button'); no.className='btn bad'; no.textContent='Deny'; no.dataset.deny=p.id;
        const ask = document.createElement('button'); ask.className='btn sm ghost'; ask.textContent='Ask why'; ask.dataset.ask=p.id;
        const edt = document.createElement('button'); edt.className='btn sm ghost'; edt.textContent='Edit & approve'; edt.dataset.edit=p.id;
        actions.appendChild(ok); actions.appendChild(no); actions.appendChild(ask); actions.appendChild(edt);
        card.appendChild(actions);
        wrap.appendChild(card);
      });
    }
    updateBadge();
  }
  function updateBadge() {
    const c = $('#approval-count'); if (!c) return;
    c.textContent = String(approvals.length);
    c.classList.toggle('hidden', !approvals.length);
  }
  function resolveApproval(id, ok) {
    const p = approvals.find(x => x.id === id); if (!p) return;
    approvals = approvals.filter(x => x.id !== id); save('approvals', approvals);
    const a = agentById(p.agent);
    if (a.status === 'approval') a.status = ok ? 'working' : 'idle';
    save('agents', agents);
    toast(ok ? `✅ ${a.name} is running: ${p.title}` : `⛔ Denied. ${a.name} will ask again next time.`, 2800);
    renderApprovals();
    if ((location.hash || '#home').replace('#','') === 'home') renderHome();
  }

  // ============ 5. MEMORY ============
  function renderMemory() {
    const a = agentById(currentAgent);
    renderSwitch('memory-switch');
    $('#memory-name').textContent = a.name;
    const items = memory[a.id] || [];
    $('#mem-count').textContent = String(items.length);
    const filtered = items; // simple (search filter applied below)
    const list = $('#memory-list'); list.innerHTML = '';
    if (!filtered.length) {
      const e = document.createElement('div'); e.className='card muted'; e.style.textAlign='center';
      e.textContent = `${a.name} doesn't remember anything about you yet.`;
      list.appendChild(e);
    } else {
      filtered.forEach((m, i) => {
        const row = document.createElement('div'); row.className='card tight mem';
        const av = document.createElement('div'); av.className='avatar-sm';
        const p = document.createElement('div'); p.className='portrait'; p.dataset.state='idle';
        p.appendChild((PERSONAS[a.persona]||PERSONAS.ada).build());
        av.appendChild(p);
        const ta = document.createElement('textarea'); ta.dataset.mem = i; ta.value = m;
        const acts = document.createElement('div'); acts.className='row-actions';
        const sv = document.createElement('button'); sv.className='btn sm'; sv.textContent='Save'; sv.dataset.memSave=i;
        const dl = document.createElement('button'); dl.className='btn sm bad ghost'; dl.textContent='Delete'; dl.dataset.memDel=i;
        acts.appendChild(sv); acts.appendChild(dl);
        row.appendChild(av); row.appendChild(ta); row.appendChild(acts);
        list.appendChild(row);
      });
    }
  }

  // ============ EVENTS ============
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-route],[data-action],[data-persona],[data-voice],[data-role],[data-open],[data-pick],[data-tool],[data-approve],[data-deny],[data-ask],[data-edit],[data-filter],[data-toggle],[data-mem-save],[data-mem-del],[data-model]');
    if (!el) return;
    const d = el.dataset;
    if (d.route) return go(d.route);
    if (d.persona) {
      draft.persona = d.persona; renderWelcome();
      // brief speaking pulse on preview
      const wrap = $('#welcome-preview').parentElement.parentElement;
      wrap.dataset.state = 'speaking';
      setTimeout(() => wrap.dataset.state = 'idle', 700);
      return;
    }
    if (d.voice) {
      draft.voice = d.voice;
      $$('#voice-chips .chip').forEach(c => c.classList.toggle('on', c === el));
      $('#welcome-preview-meta').textContent = `${VOICE_LABEL[d.voice]} · ${draft.role}`;
      const wrap = $('#welcome-preview').parentElement.parentElement;
      wrap.dataset.state = 'speaking';
      setTimeout(() => wrap.dataset.state = 'idle', 1100);
      toast(`${d.voice} voice: "Hi, I'm ${$('#agent-name').value || 'your agent'}."`);
      return;
    }
    if (d.role) { draft.role = d.role; $$('#role-chips .chip').forEach(c => c.classList.toggle('on', c === el)); $('#welcome-preview-meta').textContent = `${VOICE_LABEL[d.voice]} · ${draft.role}`; return; }
    if (d.open) { currentAgent = d.open; save('current', currentAgent); return go('talk'); }
    if (d.pick) { currentAgent = d.pick; save('current', currentAgent); renderTalk(); return; }
    if (d.tool) {
      const t = ensureTranscript(currentAgent); const m = t[+d.i];
      if (d.tool === 'edit') {
        const newCmd = prompt('Edit the command before approving:', m.cmd);
        if (newCmd == null) return;
        m.cmd = newCmd; m.done = 'ok';
      } else { m.done = d.tool; }
      renderTranscript();
      if (m.done === 'ok') {
        setAgentStatus(currentAgent, 'working');
        setTalkState('working');
        setTimeout(() => agentSay('Done. Want me to open a PR?'), 900);
      } else {
        setAgentStatus(currentAgent, 'idle');
        setTalkState('idle');
        setTimeout(() => agentSay("No problem — I won't push. Tell me when you're ready."), 500);
      }
      return;
    }
    if (d.approve) return resolveApproval(d.approve, true);
    if (d.deny)   return resolveApproval(d.deny, false);
    if (d.ask)    { const p = approvals.find(x => x.id === d.ask); toast(`${agentById(p.agent).name}: "${p.why}"`, 3200); return; }
    if (d.edit)   {
      const p = approvals.find(x => x.id === d.edit);
      const newCmd = prompt('Edit the command before approving:', p.cmd);
      if (newCmd == null) return;
      p.cmd = newCmd;
      resolveApproval(p.id, true);
      return;
    }
    if (d.filter) { approvalFilter = d.filter; return renderApprovals(); }
    if (d.toggle) {
      el.classList.toggle('on');
      const k = d.toggle;
      policies[k] = el.classList.contains('on');
      save('policies', policies);
      toast(`${el.classList.contains('on') ? 'On' : 'Off'} — saved (mock, on this device only)`);
      return;
    }
    if (d.memSave !== undefined) {
      const ta = $(`textarea[data-mem="${d.memSave}"]`);
      memory[currentAgent][+d.memSave] = ta.value.trim();
      save('memory', memory); toast('Memory updated'); return;
    }
    if (d.memDel !== undefined) {
      memory[currentAgent].splice(+d.memDel, 1); save('memory', memory); toast('Forgotten'); return renderMemory();
    }
    if (d.model) {
      $$('[data-model]').forEach(o => o.classList.toggle('on', o === el));
      $('#byo-fields').classList.toggle('hidden', d.model !== 'byo');
      toast(d.model === 'byo' ? 'Bring your own key: paste it below' : 'Using PPAA-hosted models');
      return;
    }

    switch (d.action) {
      case 'preview-voice': {
        const wrap = $('#welcome-preview').parentElement.parentElement;
        wrap.dataset.state = 'speaking';
        setTimeout(() => wrap.dataset.state = 'idle', 1500);
        toast(`${draft.voice} voice: "Hi! I'm ${$('#agent-name').value || 'your agent'}. Nice to meet you."`, 2400);
        break;
      }
      case 'upload': toast('Upload your own avatar: PNG or JPG, stored only on this device (mock — file picker would open).'); break;
      case 'create-agent': {
        const name = ($('#agent-name').value || 'Agent').trim().slice(0, 24);
        const a = { id: 'a' + Date.now(), name, persona: draft.persona, voice: draft.voice, role: draft.role, status: 'idle' };
        agents.push(a); save('agents', agents);
        currentAgent = a.id; save('current', currentAgent);
        toast(`${name} joined your team`);
        go('talk');
        setTimeout(() => agentSay(`Hi, I'm ${name}! You picked the ${draft.voice.toLowerCase()} voice for me. What should we do first?`), 400);
        break;
      }
      case 'skip-welcome': go('home'); break;
      case 'talk-demo': agentSay("This is what it looks like when I talk. In the real app my mouth follows the audio, and you hear me in the voice you chose."); break;
      case 'talk-tool-demo': pushToolDemo(); toast('Tool request added to the transcript'); break;
      case 'send': {
        const i = $('#talk-input'); const v = i.value.trim(); if (!v) { toast('Type something first'); break; }
        i.value = ''; i.style.height = 'auto'; userSay(v); break;
      }
      case 'memory-add': {
        const ta = $('#memory-new'); const v = ta.value.trim(); if (!v) { toast('Type something to remember'); break; }
        (memory[currentAgent] = memory[currentAgent] || []).push(v);
        save('memory', memory); ta.value = '';
        toast('Remembered'); renderMemory(); break;
      }
      case 'memory-forget-all':
        memory[currentAgent] = []; save('memory', memory);
        toast(`${agentById(currentAgent).name} forgot everything about you`);
        renderMemory(); break;
      case 'download': toast(`Download for ${d.os} would start (mock installer).`, 2400); break;
      case 'filter-agents': toast(`Filter: ${d.filter} (mock — would re-render the grid)`); break;
      case 'toast': toast(d.msg || 'OK'); break;
    }
  });

  // keyboard: Enter to send (shift+enter = newline)
  $('#talk-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('[data-action="send"]').click(); }
  });
  $('#agent-name').addEventListener('input', e => {
    const v = e.target.value || 'your agent';
    $('#create-name').textContent = v;
    $('#welcome-preview-name').textContent = v;
  });
  $('#memory-new').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); $('[data-action="memory-add"]').click(); }
  });
  $('#mem-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('#memory-list .mem').forEach(row => {
      const ta = row.querySelector('textarea');
      row.style.display = !q || ta.value.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  $('#global-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      // very simple: if matches an agent name → talk; else approvals
      const a = agents.find(x => x.name.toLowerCase().includes(q));
      if (a) { currentAgent = a.id; save('current', currentAgent); go('talk'); toast(`Jumped to ${a.name}`); }
      else if (q.includes('approv') || q.includes('ok')) go('approvals');
      else if (q.includes('memor')) go('memory');
      else if (q.includes('set')) go('settings');
      else go('home');
    }
  });

  window.addEventListener('hashchange', route);
  // initial render
  renderMeAvatar();
  route();
})();
