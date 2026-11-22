/* =========================================================
   STUDENT VIEWS
   ========================================================= */
function shell(body, tab) {
  const t = (id, label, ic) => `<a href="#${id}" class="${tab===id?'on':''}">${ic}${label}</a>`;
  return `<div class="app">
    <div class="top"><a class="avatar" href="#profile" aria-label="My profile">${I.user}</a><span class="brandmini">FCSIT BookIt</span></div>
    <main>${body}</main>
    <nav class="tabbar">${t('home','Home',I.home)}${t('book','Book',I.cal.replace('width="22" height="22" ',''))}${t('areas','Areas',I.bars)}${t('bookings','Bookings',I.list)}${t('profile','Profile',I.user.replace('width="22" height="22" ',''))}</nav>
  </div>`;
}

function sessionCard(b) {
  const r = room(b.roomId), left = b.end - now(), total = b.end - b.start, ending = left <= 15*M;
  return `<div class="session ${ending?'ending':''}" id="session">
    <div class="row between"><span class="pill" style="color:var(--green)"><i></i>Active Session</span><span style="font-size:13px;font-weight:600">Status: Active</span></div>
    <div style="font:800 20px var(--fd);margin-top:14px">${esc(r.name)}</div>
    <div style="font-size:13px;opacity:.9">Level ${r.level}, Block ${r.block}</div>
    <div class="count" data-countdown="${b.end}">${countdown(left)}</div>
    <div style="font-size:12px;opacity:.85">Remaining time</div>
    <div class="bar"><b data-progress="${b.start}|${b.end}" style="width:${Math.max(0,left/total*100)}%"></b></div>
    <div class="meta"><span>Start: <b>${fT(b.start)}</b></span><span>End: <b>${fT(b.end)}</b></span></div>
    ${ending ? `<div class="rem">⏰ Your booking session will end in 15 minutes. Please prepare to leave the room on time.</div>` : ''}
    <div class="demo">Prototype demo: <button data-act="ff15" data-ref="${b.ref}">Jump to 15 min left</button></div>
  </div>`;
}

function feedCard(a) {
  const live = liveActive(a), lv = live ? a.live.level : level(areaPct(a));
  return `<div class="feed lvl-${lv}">
    <div class="nm"><i></i>${esc(a.name)}</div>
    <div class="tag">${live ? `<span class="livetag">● Live report</span> from on-site students` : `<span class="est">Estimated crowd level</span>`}</div>
    <div class="pct">*${live ? LV[lv].toUpperCase() : areaPct(a)+'% FULL'}</div>
  </div>`;
}

function vHome() {
  const act = activeSession(), nb = nextBooking();
  let top = '';
  if (act) top = sessionCard(act);
  else if (nb) {
    const r = room(nb.roomId), ci = canCheckIn(nb);
    top = `<div class="card">
      <div class="row between"><span class="hint" style="font-weight:700;letter-spacing:.06em">YOUR NEXT BOOKING</span>${pill(nb.status)}</div>
      <div style="font:800 19px var(--fd);margin:8px 0 2px">${esc(r.name)}</div>
      <div style="font-weight:600">${rel(nb.start)}, ${fT(nb.start)} – ${fT(nb.end)}</div>
      <div class="hint">Level ${r.level}, Block ${r.block} · ${nb.attendees} attendees</div>
      <div class="notice ${ci?'warn':''}" style="margin-top:12px">${I.qr}<span>Check-in: <b>Pending</b> · scan the room QR code by <b>${fT(nb.start+15*M)}</b>${isToday(nb.start)?'':' on '+fD(nb.start)}</span></div>
      ${ci ? `<button class="btn sm" style="width:100%;margin-top:12px" data-act="checkin" data-ref="${nb.ref}">${I.qr} Scan QR to check in</button>` : ''}
    </div>`;
  }
  return shell(`
    <h1 class="title" style="margin-top:40px">FCSIT Book It</h1>
    <p class="subtitle">Hi ${esc(S.user.name.split(' ')[0])} · ${fD(now())}</p>
    <div class="stack">
      ${top}
      <a class="bluecard" href="#book" style="min-height:160px">
        <div class="row" style="gap:10px;position:relative"><span style="background:#fff;color:var(--blue);border-radius:10px;width:40px;height:40px;display:grid;place-items:center">${I.cal}</span><span style="font:900 28px var(--fd);color:#fff">Book a Room</span></div>
        <p class="bc-sub" style="margin-top:12px;max-width:60%">Reserve discussion pods and meeting rooms by time slot. Double-bookings are blocked automatically.</p>${SOFA}
      </a>
      <a class="btn outline" href="#bookings">View my bookings</a>
    </div>
    <div class="row between"><h2 class="section-h">Live feed</h2><a href="#areas" style="font-weight:700;font-size:14px;margin-top:18px">See all</a></div>
    <div class="stack">${S.areas.map(feedCard).join('')}</div>
  `, 'home');
}

function vBook() {
  const f = S.flow;
  const days = [...Array(7)].map((_,i)=>dayStart(now()+i*DAY));
  return shell(`
    <h1 class="title">Book a Room</h1>
    <p class="subtitle">Pick a date, then choose a free pod or meeting room.</p>
    <form data-form="search" class="stack">
      <div><label class="label" for="bd">Date</label>
        <select class="field" id="bd" name="day">${days.map(d=>`<option value="${d}" ${f.day==d?'selected':''}>${fD(d)}${isToday(d)?' (Today)':''}</option>`).join('')}</select></div>
      <div><label class="label" for="bc">Capacity</label>
        <select class="field" id="bc" name="cap">${[1,2,3,4,5,6,8,10].map(n=>`<option value="${n}" ${(f.cap||4)==n?'selected':''}>${n} ${n>1?'people':'person'}</option>`).join('')}</select></div>
      <div><label class="label" for="bt">Room Type</label>
        <select class="field" id="bt" name="type">${['All Types','Discussion Pod','Meeting Room'].map(n=>`<option ${f.type===n?'selected':''}>${n}</option>`).join('')}</select></div>
      <div class="notice">${I.clock}<span>Maximum booking duration: 2 consecutive hours per booking.</span></div>
      <button class="btn" style="margin-top:10px">Search Rooms!</button>
    </form>
  `, 'book');
}

function vRooms() {
  const f = S.flow; if (!f.day) return go('book');
  const list = S.rooms.filter(r => r.active && r.seats >= f.cap && (f.type==='All Types' || r.type===f.type));
  const withFree = list.map(r => ({r, free:freeSlots(r.id,f.day)})).sort((a,b)=>(b.free>0)-(a.free>0));
  const n = withFree.filter(x=>x.free>0).length;
  return shell(`
    <a href="#book" style="display:inline-block;margin-top:18px;font-weight:700;text-decoration:none">← Change search</a>
    <h1 class="title" style="margin-top:14px">${n} ${n===1?'Room':'Rooms'}<br>Available</h1>
    <p class="subtitle">${fD(f.day)} · ${f.cap}+ people · ${esc(f.type)}</p>
    <div class="center" style="font-size:28px;margin:-10px 0 10px">↓</div>
    <div class="stack">
      ${withFree.length ? withFree.map(({r,free}) => `
        <${free?'a href="#slot" data-act="pickRoom" data-id="'+r.id+'"':'div'} class="bluecard ${free?'':'grey'}" style="min-height:190px">
          <div class="bc-title">${esc(r.name)}</div>
          <div class="bc-big">${free ? `${r.seats} Seats Available` : '0 Slots Available'}</div>
          <div class="tiles"><div class="tile"><small>LEVEL</small><b>${r.level}</b></div><div class="tile o"><small>BLOCK</small><b>${r.block}</b></div></div>
          <div class="bc-sub" style="margin-top:12px">${free ? free+' free hour slot'+(free>1?'s':'')+' · ' : 'Fully booked · '}${esc(r.features)}</div>
          ${SOFA}
        </${free?'a':'div'}>`).join('') : `<div class="notice">No rooms match this capacity and type. Try a smaller group size or "All Types".</div>`}
    </div>
  `, 'book');
}

function vSlot() {
  const f = S.flow; const r = f.roomId && room(f.roomId); if (!r) return go('book');
  const sel = f.sel || [], days = [...Array(5)].map((_,i)=>dayStart(now()+i*DAY));
  let slots = '';
  for (let h=OPEN; h<CLOSE; h++) {
    const taken = slotTaken(r.id,f.day,h), past = slotPast(f.day,h), isSel = sel.includes(h);
    let cls='', sub='Available';
    if (isSel) { cls='sel'; sub='Selected'; }
    else if (past) { cls='past'; sub='Passed'; }
    else if (taken) { cls='booked'; sub='Booked'; }
    else if (sel.length >= 2) { cls='limit'; sub='Exceeds 2-hour limit'; }
    else if (sel.length === 1 && Math.abs(h - sel[0]) !== 1) { cls='limit'; sub=Math.abs(h-sel[0])>1?'Exceeds 2-hour limit':'Not consecutive'; }
    slots += `<button type="button" class="slot ${cls}" data-act="slot" data-h="${h}" aria-pressed="${isSel}"><b>${hm(h)} – ${hm(h+1)}</b><small>${sub}</small></button>`;
  }
  const dur = sel.length;
  return shell(`
    <a href="#rooms" style="display:inline-block;margin-top:18px;font-weight:700;text-decoration:none">← Back to rooms</a>
    <h1 class="title" style="margin-top:14px">${esc(r.name)}</h1>
    <p class="subtitle">Level ${r.level}, Block ${r.block} · ${r.seats} seats · ${esc(r.features)}</p>
    <div class="stack">
      <div><span class="label">1. Choose a date</span>
        <div class="days">${days.map(d=>`<button type="button" class="day ${d==f.day?'on':''}" data-act="day" data-d="${d}"><small>${new Date(d).toLocaleDateString('en-GB',{weekday:'short'})}</small><b>${dnum(d)}</b></button>`).join('')}</div></div>
      <div><span class="label">2. Choose time slots</span>
        <div class="notice" style="margin-bottom:12px">${I.clock}<span>Maximum booking duration: 2 consecutive hours per booking.</span></div>
        <div class="slots">${slots}</div>
        <div id="slotmsg" aria-live="polite">${f.msg ? `<div class="notice bad" style="margin-top:12px">${I.info}<span>${esc(f.msg)}</span></div>` : dur===2 ? `<div class="notice good" style="margin-top:12px">${I.info}<span>You've selected the maximum of 2 consecutive hours. Other slots are disabled — tap a selected slot to change your time.</span></div>` : ''}</div>
      </div>
      <div><span class="label">3. Booking details</span>
        <div class="stack">
          <input class="field" data-bind="purpose" placeholder="Purpose (e.g. Group assignment discussion)" value="${esc(f.purpose||'')}" aria-label="Purpose">
          <select class="field" data-bind="att" aria-label="Attendees">${[...Array(r.seats)].map((_,i)=>`<option value="${i+1}" ${(+f.att||Math.min(f.cap||4,r.seats))===i+1?'selected':''}>${i+1} ${i?'people':'person'}</option>`).join('')}</select>
        </div></div>
      <button class="btn" data-act="toLayout" ${dur?'':'disabled'}>${dur ? `Continue · ${hm(sel[0])} – ${hm(sel[dur-1]+1)} (${dur} h${dur>1?'rs':''})` : 'Select at least one slot'}</button>
    </div>
  `, 'book');
}

function vLayout() {
  const f = S.flow; const r = f.roomId && room(f.roomId); if (!r || !(f.sel||[]).length) return go('book');
  const zones = ['Table 1','Table 2','Corner Booth','Table 3'];
  const blocked = 2; // demo: one area under maintenance
  return shell(`
    <a href="#slot" style="display:inline-block;margin-top:18px;font-weight:700;text-decoration:none">← Back to time slots</a>
    <h1 class="title" style="margin-top:14px">${esc(r.name.replace('Discussion ',''))} Layout</h1>
    <p class="subtitle">Select your desired area</p>
    <div class="layout">
      ${zones.map((z,i)=> i===blocked ? `<div class="zone x" title="Unavailable">${I.no}</div>` : `<button class="zone ${f.zone===z?'on':''}" data-act="zone" data-z="${z}">${f.zone===z?'Selected':'Select'}<div style="font:600 12px Inter;margin-top:4px;opacity:.8">${z}</div></button>`).join('')}
      <div class="entrance"><i></i><span>ENTRANCE</span></div>
    </div>
    <p class="hint center" style="margin:12px 0 22px">Grey areas are unavailable. Area choice is optional.</p>
    <button class="btn" data-act="toSummary">Proceed</button>
  `, 'book');
}

function vSummary() {
  const f = S.flow; const r = f.roomId && room(f.roomId); if (!r || !(f.sel||[]).length) return go('book');
  const st = at(f.day, f.sel[0]), en = at(f.day, f.sel[f.sel.length-1]+1);
  return shell(`
    <a href="#${r.type==='Discussion Pod'?'layout':'slot'}" style="display:inline-block;margin-top:18px;font-weight:700;text-decoration:none">← Back</a>
    <h1 class="title" style="margin-top:14px">Summary</h1>
    <p class="subtitle">Booking details — review before confirming</p>
    <div class="stack">
      <div class="card">
        <div class="kv"><span>Room</span><span>${esc(r.name)}</span></div>
        <div class="kv"><span>Date</span><span>${fD(st)}</span></div>
        <div class="kv"><span>Time</span><span>${fT(st)} – ${fT(en)}</span></div>
        <div class="kv"><span>Duration</span><span>${f.sel.length} hour${f.sel.length>1?'s':''}</span></div>
        <div class="kv"><span>Location</span><span>Level ${r.level}, Block ${r.block}</span></div>
        ${f.zone?`<div class="kv"><span>Area</span><span>${esc(f.zone)}</span></div>`:''}
        <div class="kv"><span>Attendees</span><span>${+f.att||Math.min(f.cap||4,r.seats)} people</span></div>
        <div class="kv"><span>Purpose</span><span>${esc(f.purpose||'Group discussion')}</span></div>
      </div>
      <div class="req">
        <h3>${I.qr} Check-in Requirement</h3>
        <p>Students must scan the QR code displayed at the room entrance within 15 minutes after their booking starts. Failure to check in within the permitted period will result in automatic booking cancellation.</p>
        <div class="req-items">
          <div class="req-item">${I.qr}<div>QR Code Check-in Required<small>Scan the code posted at the ${esc(r.name)} entrance</small></div></div>
          <div class="req-item">${I.clock}<div>15-Minute Grace Period<small>Check in between ${fT(st)} and ${fT(st+15*M)}</small></div></div>
          <div class="req-item">${I.xc}<div>Automatic Cancellation Policy<small>No check-in by ${fT(st+15*M)} → booking is auto-cancelled</small></div></div>
        </div>
      </div>
      <p class="hint center" style="margin:4px 10px">These slots are held for you once you confirm, so nobody else can double-book them.</p>
      <button class="btn" data-act="confirm">Confirm Booking</button>
      <a class="btn ghost" href="#book" data-act="resetFlow">Cancel</a>
    </div>
  `, 'book');
}

function vConfirmed() {
  const b = S.bookings.find(x => x.ref === S.flow.lastRef); if (!b) return go('home');
  const r = room(b.roomId);
  return shell(`
    <div style="width:88px;height:88px;border-radius:50%;background:var(--lav);color:var(--blue);display:grid;place-items:center;margin:40px auto 0">${I.check.replace('<svg','<svg width="44" height="44"')}</div>
    <h1 class="title" style="margin-top:20px">Booking<br>Confirmed</h1>
    <p class="subtitle">Your slot is reserved. See you at ${esc(r.name)}.</p>
    <div class="stack">
      <div class="card">
        <div class="kv"><span>Booking Reference</span><span>${b.ref}</span></div>
        <div class="kv"><span>Room Name</span><span>${esc(r.name)}</span></div>
        <div class="kv"><span>Booking Date</span><span>${fD(b.start)}</span></div>
        <div class="kv"><span>Booking Time</span><span>${fT(b.start)} – ${fT(b.end)}</span></div>
        <div class="kv"><span>Check-in Status</span><span><span class="pill st-auto-cancelled"><i></i>Pending</span></span></div>
        <div class="kv"><span>Check-in Deadline</span><span style="color:var(--amber)">${fDT(b.start+15*M)}</span></div>
      </div>
      <div class="notice warn">${I.qr}<span>Please remember to check in by scanning the QR code at the room entrance within 15 minutes after your booking starts.</span></div>
      <a class="btn outline" href="#bookings" style="margin-top:8px">View my Bookings</a>
      <a class="btn" href="#home">Back to Home</a>
    </div>
  `, 'book');
}

function areaCard(a) {
  const p = areaPct(a), live = liveActive(a), lv = live ? a.live.level : level(p);
  return `<div class="area lvl-${lv}">
    <div class="row between" style="align-items:flex-start">
      <div><div style="font:800 18px var(--fd)">${esc(a.name)}</div><div class="hint">${esc(a.loc)}</div></div>
      <span class="badge"><i></i>${LV[lv]}</span>
    </div>
    ${live ? `
      <div style="margin-top:14px" class="row"><span class="pct" style="font-size:34px">${LV[lv]}</span></div>
      <div style="margin-top:10px" class="row"><span class="livetag">● Live report</span><span class="hint">${a.live.n} on-site responses · ${a.live.votes}</span></div>
      <div class="hint" style="margin-top:8px">Reported ${ago(a.live.t)} · shown until ${fT(a.live.exp)} (30 min)</div>`
    : `
      <div class="row" style="margin-top:14px;align-items:baseline;gap:6px"><span class="pct">${p}%</span><span class="hint">full</span></div>
      <div class="track"><b style="width:${p}%"></b></div>
      <div class="row between"><span class="est">${I.info.replace('width="18" height="18"','width="12" height="12"')} Estimated crowd level</span><span class="hint">Updated ${ago(a.upd)}</span></div>`}
  </div>`;
}

function vAreas() {
  return shell(`
    <h1 class="title">Common Areas</h1>
    <p class="subtitle">Check how busy a space is before you walk across buildings.</p>
    <div class="legend"><span class="badge lvl-quiet"><i></i>Quiet &lt;40%</span><span class="badge lvl-moderate"><i></i>Moderate 40–70%</span><span class="badge lvl-busy"><i></i>Busy &gt;70%</span></div>
    <div class="card" style="margin-bottom:16px">
      <div style="font:800 18px var(--fd);margin-bottom:4px">Need a fresher reading?</div>
      <p style="margin:0 0 12px;font-size:14px;color:#1d2340">Request a live crowd update from students currently checked in at FCSIT.</p>
      <button class="btn sm" style="width:100%" data-act="reqLive">${I.bell} Request Live Status</button>
      <p class="hint" style="margin:10px 0 0">Crowd levels are <b>estimates</b> from bookings and student reports — the system does not perform an exact physical headcount.</p>
    </div>
    <div class="stack">${S.areas.map(areaCard).join('')}</div>
  `, 'areas');
}

function bookingCard(b) {
  const r = room(b.roomId), past = !ACTIVE.includes(b.status), ci = canCheckIn(b);
  return `<div class="bluecard ${past?'grey':''}" style="min-height:200px;cursor:default">
    ${pill(b.status)}
    <div class="bc-title">${esc(r.name)}</div>
    <div class="bc-big" style="font-size:22px">${fT(b.start).replace(' ','')} - ${fT(b.end).replace(' ','')}</div>
    <div class="tiles"><div class="tile"><small>${mon(b.start)}</small><b>${dnum(b.start)}</b></div><div class="tile o" style="${past?'border-color:#8a8d9c;color:#6b6f84':''}"><small>PEOPLE</small><b>${b.attendees}</b></div></div>
    <div class="bc-sub" style="margin-top:10px">${b.ref} · Level ${r.level}, Block ${r.block}${b.status==='confirmed'?` · Check in by ${fT(b.start+15*M)}`:''}${b.status==='auto-cancelled'?' · No check-in within 15 min':''}</div>
    ${b.status==='confirmed' ? `<div class="row" style="position:relative;margin-top:14px;gap:8px;z-index:1">
        ${ci ? `<button class="btn sm white" data-act="checkin" data-ref="${b.ref}">${I.qr} Check in</button>` : ''}
        <button class="btn sm white" style="color:var(--red)" data-act="cancelAsk" data-ref="${b.ref}">Cancel Booking</button></div>` : ''}
    ${b.status==='checked-in' ? `<div style="position:relative;margin-top:14px;z-index:1"><a class="btn sm white" href="#home">View active session</a></div>` : ''}
    ${SOFA}
  </div>`;
}

function vBookings() {
  const mine = myBookings();
  const up = mine.filter(b => ACTIVE.includes(b.status)).sort((a,b)=>a.start-b.start);
  const past = mine.filter(b => !ACTIVE.includes(b.status)).sort((a,b)=>b.start-a.start);
  const list = S.tab==='upcoming' ? up : past;
  return shell(`
    <h1 class="title">My Bookings</h1>
    <p class="subtitle">Manage your upcoming and past room reservations.</p>
    <div class="seg"><button class="${S.tab==='upcoming'?'on':''}" data-act="tab" data-t="upcoming">Upcoming (${up.length})</button><button class="${S.tab==='past'?'on':''}" data-act="tab" data-t="past">Past (${past.length})</button></div>
    <div class="legend">${Object.keys(STATUS).map(pill).join('')}</div>
    <div class="stack">${list.length ? list.map(bookingCard).join('') : `<div class="notice">No ${S.tab} bookings. <a href="#book">Book a room</a></div>`}</div>
  `, 'bookings');
}

function vProfile() {
  const u = S.user, e = S.editProfile;
  const ro = e ? '' : 'readonly';
  return shell(`
    <h1 class="title">My Profile</h1>
    <p class="subtitle">${esc(u.matric)} · Student</p>
    <form data-form="profile" class="stack">
      <h2 class="section-h" style="margin:0">Personal Information</h2>
      <div><label class="label" for="pn">Full Name</label><input class="field" id="pn" name="name" value="${esc(u.name)}" ${ro} required></div>
      <div><label class="label" for="pm">Matric Number</label><input class="field" id="pm" name="matric" value="${esc(u.matric)}" ${ro} required></div>
      <div><label class="label" for="pe">Email Address</label><input class="field" id="pe" name="email" type="email" value="${esc(u.email)}" ${ro} required></div>
      <h2 class="section-h" style="margin:10px 0 0">Study Preferences</h2>
      <div><label class="label" for="pa">Preferred Study Area</label>
        <select class="field" id="pa" name="area" ${e?'':'disabled'}>${AREAS_LIST.map(a=>`<option ${u.area===a?'selected':''}>${a}</option>`).join('')}</select></div>
      <div><span class="label">Usual Free Time</span>
        <div class="chips">${FREE_TIMES.map(t=>`<button type="button" class="chip ${(e?S.draftFree:u.free).includes(t)?'on':''}" ${e?`data-act="freeChip" data-v="${t}"`:'disabled'}>${t}</button>`).join('')}</div></div>
      <div id="perr"></div>
      ${e ? `<div class="row" style="gap:10px;margin-top:8px"><button type="button" class="btn outline" data-act="profCancel">Cancel</button><button class="btn">Save Changes</button></div>`
          : `<button type="button" class="btn" data-act="profEdit" style="margin-top:8px">Edit Profile</button>`}
    </form>
    <button class="btn ghost" data-act="logout" style="margin-top:10px">${I.out} Log out</button>
  `, 'profile');
}

/* ---------- auth ---------- */
function vLogin() {
  const admin = S.flow.adminLogin;
  return `<div class="auth">
    <div class="logo">F</div>
    <h1 class="title" style="margin-top:18px">FCSIT Book It</h1>
    <p class="subtitle">${admin ? 'Administrator sign-in' : 'Log in to book rooms and check common areas'}</p>
    <form data-form="login" class="stack">
      <div><label class="label" for="li">${admin?'Admin Email':'Matric Number or Email Address'}</label><input class="field" id="li" name="id" autocomplete="username" value="${esc(S.flow.prefill||'')}" placeholder="${admin?'admin@fsktm.um.edu.my':'e.g. U2100123'}" required></div>
      <div><label class="label" for="lp">Password</label><input class="field" id="lp" name="pw" type="password" autocomplete="current-password" required></div>
      <div id="lerr">${S.flow.okMsg?`<div class="notice good">${esc(S.flow.okMsg)}</div>`:''}</div>
      <button class="btn" style="margin-top:8px">Login</button>
    </form>
    ${admin ? '' : `<p class="center" style="margin-top:20px">New to BookIt? <a href="#register" style="font-weight:700">Create a student account</a></p>`}
    <div class="notice" style="margin-top:22px">${I.info}<span>Prototype demo accounts —<br>${admin ? 'Admin: <b>admin@fsktm.um.edu.my</b> / <b>admin123</b>' : 'Student: <b>U2100123</b> / <b>bookit123</b>'}</span></div>
    <p class="center" style="margin-top:18px"><a href="#" data-act="toggleAdmin" style="font-weight:600;font-size:14px">${admin?'← Student login':'Faculty administrator? Log in here'}</a></p>
  </div>`;
}

function vRegister() {
  const r = S.flow.reg || {free:[]};
  return `<div class="auth">
    <a href="#login" style="font-weight:700;text-decoration:none">← Back to login</a>
    <h1 class="title" style="margin-top:20px">Student<br>Registration</h1>
    <p class="subtitle">First time here? Set up your BookIt account.</p>
    <form data-form="register" class="stack" novalidate>
      <div><label class="label" for="rn">Full Name</label><input class="field" id="rn" name="name" value="${esc(r.name||'')}" required></div>
      <div><label class="label" for="rm">Matric Number</label><input class="field" id="rm" name="matric" value="${esc(r.matric||'')}" placeholder="e.g. U2100999" required></div>
      <div><label class="label" for="re">Email Address</label><input class="field" id="re" name="email" type="email" value="${esc(r.email||'')}" placeholder="you@siswa.um.edu.my" required></div>
      <div><label class="label" for="rp">Password</label><input class="field" id="rp" name="pw" type="password" placeholder="At least 6 characters" required></div>
      <div><label class="label" for="rc">Confirm Password</label><input class="field" id="rc" name="pw2" type="password" required></div>
      <div><label class="label" for="ra">Preferred Study Area</label>
        <select class="field" id="ra" name="area">${AREAS_LIST.map(a=>`<option ${r.area===a?'selected':''}>${a}</option>`).join('')}</select></div>
      <div><span class="label">Usual Free Time <span class="hint" style="font-family:Inter;font-weight:500">(pick any)</span></span>
        <div class="chips">${FREE_TIMES.map(t=>`<button type="button" class="chip ${r.free.includes(t)?'on':''}" data-act="regChip" data-v="${t}">${t}</button>`).join('')}</div></div>
      <div id="rerr"></div>
      <button class="btn" style="margin-top:8px">Register</button>
    </form>
    <p class="center" style="margin-top:20px">Already have an account? <a href="#login" style="font-weight:700">Log in</a></p>
  </div>`;
}
