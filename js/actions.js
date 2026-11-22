/* =========================================================
   ACTIONS
   ========================================================= */
const A = {
  closeModalBg(d, el, e){ if (e.target === el) modal(''); },
  close(){ modal(''); },
  toggleAdmin(d,el,e){ e.preventDefault(); S.flow.adminLogin = !S.flow.adminLogin; S.flow.okMsg=''; S.flow.prefill=''; render(); },
  logout(d,el,e){ e.preventDefault(); S.user=null; S.flow={}; S.editProfile=false; go('login'); },
  regChip(d,el){ const r = S.flow.reg = S.flow.reg || {free:[]}; r.free = r.free.includes(d.v) ? r.free.filter(x=>x!==d.v) : [...r.free,d.v]; el.classList.toggle('on'); },
  freeChip(d,el){ const f=S.draftFree; S.draftFree = f.includes(d.v)?f.filter(x=>x!==d.v):[...f,d.v]; el.classList.toggle('on'); },
  profEdit(){ S.editProfile=true; S.draftFree=[...S.user.free]; rerender(); },
  profCancel(){ S.editProfile=false; rerender(); },
  pickRoom(d){ Object.assign(S.flow,{roomId:d.id,sel:[],msg:'',zone:null}); },
  day(d){ S.flow.day=+d.d; S.flow.sel=[]; S.flow.msg=''; rerender(); },
  slot(d){
    const f=S.flow, h=+d.h, sel=f.sel||[]; f.msg='';
    if (sel.includes(h)) { f.sel = sel.length===2 ? sel.filter(x=>x!==h) : []; }
    else if (slotPast(f.day,h)) { f.msg='This time has already passed.'; }
    else if (slotTaken(f.roomId,f.day,h)) { f.msg='This slot is already booked by someone else.'; }
    else if (sel.length===0) f.sel=[h];
    else if (sel.length===1 && Math.abs(h-sel[0])===1) f.sel=[...sel,h].sort((a,b)=>a-b);
    else if (sel.length>=2) f.msg='Selection exceeds the permitted limit: maximum booking duration is 2 consecutive hours. Tap a selected slot to change your time.';
    else f.msg = Math.abs(h-sel[0])>1 ? 'Selection exceeds the 2-hour limit — slots must be next to each other, up to 2 consecutive hours.' : 'Slots must be consecutive.';
    rerender();
  },
  toLayout(){ const r=room(S.flow.roomId); go(r.type==='Discussion Pod'?'layout':'summary'); },
  zone(d){ S.flow.zone = S.flow.zone===d.z?null:d.z; rerender(); },
  toSummary(){ go('summary'); },
  resetFlow(){ S.flow = {day:S.flow.day,cap:S.flow.cap,type:S.flow.type}; },
  confirm(){
    const f=S.flow, r=room(f.roomId), st=at(f.day,f.sel[0]), en=at(f.day,f.sel[f.sel.length-1]+1);
    if (f.sel.some(h=>slotTaken(r.id,f.day,h))) { toast('Sorry — one of those slots was just booked. Please pick again.'); return go('slot'); }
    const b = mkBooking(S.user.id, r.id, st, en, 'confirmed', {att:+f.att||Math.min(f.cap||4,r.seats), purpose:f.purpose, created:now(), zone:f.zone});
    log(S.user.name.split(' ')[0], `Booked ${r.name}`, b.ref);
    S.flow = {day:f.day,cap:f.cap,type:f.type,lastRef:b.ref}; go('confirmed');
  },
  tab(d){ S.tab=d.t; rerender(); },
  checkin(d){
    const b = S.bookings.find(x=>x.ref===d.ref), r = room(b.roomId);
    modal(`<h2>Scan room QR code</h2><p class="hint">Point your camera at the QR code posted at the ${esc(r.name)} entrance. Deadline: <b>${fT(b.start+15*M)}</b>.</p>
      ${QR}<div class="notice" style="margin-bottom:14px">${I.info}<span>Prototype: camera scanning isn't available here, so tap below to simulate a successful scan.</span></div>
      <button class="btn" data-act="doCheckin" data-ref="${b.ref}">Simulate QR scan</button><button class="btn ghost" data-act="close">Cancel</button>`);
  },
  doCheckin(d){
    const b = S.bookings.find(x=>x.ref===d.ref);
    if (!canCheckIn(b)) { modal(''); toast('Check-in window has closed.'); return render(); }
    b.status='checked-in'; b.checkedAt=now(); log(S.user.name.split(' ')[0], `Checked in to ${room(b.roomId).name}`, b.ref);
    modal(''); toast('Checked in! Your session is now active.'); go('home');
  },
  ff15(d){ const b=S.bookings.find(x=>x.ref===d.ref); const shift = b.end - (now()+15*M - 1000); b.start-=shift; b.end-=shift; rerender(); },
  cancelAsk(d){
    const b=S.bookings.find(x=>x.ref===d.ref), r=room(b.roomId);
    modal(`<h2>Cancel this booking?</h2><p>${esc(r.name)} · ${fD(b.start)}, ${fT(b.start)} – ${fT(b.end)}</p><p class="hint">The slot will be released for other students. This cannot be undone.</p>
      <div class="stack" style="margin-top:16px"><button class="btn danger" data-act="doCancel" data-ref="${b.ref}">Yes, cancel booking</button><button class="btn outline" data-act="close">Keep booking</button></div>`);
  },
  doCancel(d){
    const b=S.bookings.find(x=>x.ref===d.ref); b.status='cancelled';
    log(S.user.role==='admin'?'Admin':S.user.name.split(' ')[0], `Cancelled ${room(b.roomId)?.name||''}`, b.ref);
    modal(''); toast('Booking cancelled.'); rerender();
  },
  reqLive(){
    modal(`<h2>Request Live Status</h2><p class="hint">We'll ask <b>${eligibleOnSite()} students currently checked in at FCSIT</b> to report how crowded an area is. Responses update the status for up to 30 minutes.</p>
      <label class="flabel" for="la" style="margin-top:14px">Which area?</label>
      <select class="mini" id="la">${S.areas.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select>
      <div class="stack" style="margin-top:18px"><button class="btn" data-act="sendLive">${I.bell} Send request</button><button class="btn ghost" data-act="close">Cancel</button></div>`);
  },
  sendLive(){
    const a = S.areas.find(x=>x.id===document.getElementById('la').value);
    modal(`<div class="notice good" style="margin-bottom:16px">${I.check.replace('<svg','<svg width="18" height="18"')}<span>Request sent to ${eligibleOnSite()} eligible on-site students.</span></div>
      <p class="hint" style="margin:0 0 10px">This is the notification they receive — <b>tap an answer to simulate their replies</b>:</p>
      <div class="notif"><div class="app-n"><b>F</b>FCSIT BookIt · now</div>
        <div style="font-weight:700">How busy is the ${esc(a.name)} right now?</div>
        <div class="hint">A student nearby asked for a live update. Your answer is anonymous.</div>
        <div class="three">
          <button class="lvl-empty" data-act="liveAns" data-id="${a.id}" data-v="empty">Empty</button>
          <button class="lvl-moderate" data-act="liveAns" data-id="${a.id}" data-v="moderate">Moderate</button>
          <button class="lvl-packed" data-act="liveAns" data-id="${a.id}" data-v="packed">Packed</button>
        </div></div>
      <button class="btn ghost" data-act="close" style="margin-top:10px">Close</button>`);
  },
  liveAns(d){
    const a = S.areas.find(x=>x.id===d.id), opts=['empty','moderate','packed'], i=opts.indexOf(d.v);
    // simulated: your tap + 2 more on-site replies clustered around it
    const votes=[d.v, d.v, opts[Math.max(0,Math.min(2,i+(Math.random()<.5?-1:1)))]];
    const tally = opts.map(o=>[o,votes.filter(v=>v===o).length]).filter(x=>x[1]);
    const lv = tally.sort((x,y)=>y[1]-x[1])[0][0];
    a.live = {level:lv, n:votes.length, votes:tally.map(([o,n])=>`${n} ${LV[o]}`).join(', '), t:now(), exp:now()+30*M};
    modal(''); toast(`${a.name} updated: ${LV[lv]} (live, ${votes.length} responses).`); rerender();
  },
  /* admin */
  afilter(d){ S.adminFilter=d.s; rerender(); },
  bookDetail(d){
    const b=S.bookings.find(x=>x.ref===d.ref), r=room(b.roomId), u=userById(b.userId);
    modal(`<div class="row between"><h2>${b.ref}</h2>${pill(b.status)}</div>
      <div class="kv"><span>Student</span><span>${esc(u.name)} (${esc(u.matric)})</span></div>
      <div class="kv"><span>Room</span><span>${esc(r?.name||'(removed)')}</span></div>
      <div class="kv"><span>Date</span><span>${fD(b.start)}</span></div>
      <div class="kv"><span>Time</span><span>${fT(b.start)} – ${fT(b.end)}</span></div>
      <div class="kv"><span>Attendees</span><span>${b.attendees}</span></div>
      <div class="kv"><span>Purpose</span><span>${esc(b.purpose)}</span></div>
      <div class="kv"><span>Check-in deadline</span><span>${fT(b.start+15*M)}</span></div>
      <div class="stack" style="margin-top:16px">${b.status==='confirmed'?`<button class="btn danger" data-act="doCancel" data-ref="${b.ref}">Cancel this booking</button>`:''}<button class="btn outline" data-act="close">Close</button></div>`);
  },
  avail(d){
    const r=room(d.id); const days=[0,1,2].map(i=>dayStart(now()+i*DAY));
    modal(`<h2>${esc(r.name)} availability</h2><p class="hint">Green = free · red = booked</p>${days.map(dd=>`<div style="font-weight:700;margin:14px 0 8px">${fD(dd)}</div><div class="mslots">${[...Array(CLOSE-OPEN)].map((_,i)=>{const h=OPEN+i;return `<div class="${slotTaken(r.id,dd,h)?'b':''}">${hm(h).replace(':00','')}</div>`}).join('')}</div>`).join('')}
      <button class="btn outline" data-act="close" style="margin-top:18px">Close</button>`);
  },
  roomForm(d){
    const r = d.id ? room(d.id) : {name:'',type:'Discussion Pod',level:1,block:'A',seats:4,features:'',active:true};
    modal(`<h2>${d.id?'Edit room':'Add new room'}</h2>
      <form data-form="room" data-id="${d.id||''}" class="stack" style="margin-top:12px">
        <div><label class="flabel">Room name</label><input class="mini" name="name" value="${esc(r.name)}" required></div>
        <div class="grid2"><div><label class="flabel">Type</label><select class="mini" name="type">${['Discussion Pod','Meeting Room'].map(t=>`<option ${r.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
          <div><label class="flabel">Seats</label><input class="mini" name="seats" type="number" min="1" max="40" value="${r.seats}" required></div></div>
        <div class="grid2"><div><label class="flabel">Level</label><input class="mini" name="level" type="number" min="0" max="10" value="${r.level}" required></div>
          <div><label class="flabel">Block</label><input class="mini" name="block" value="${esc(r.block)}" maxlength="3" required></div></div>
        <div><label class="flabel">Facilities</label><input class="mini" name="features" value="${esc(r.features)}" placeholder="Whiteboard · Display"></div>
        <label class="row" style="font-size:14px;font-weight:600"><input type="checkbox" name="active" ${r.active?'checked':''}> Available for booking</label>
        <button class="btn">${d.id?'Save changes':'Add room'}</button><button type="button" class="btn ghost" data-act="close">Cancel</button>
      </form>`);
  },
  roomDelAsk(d){
    const r=room(d.id), n=S.bookings.filter(b=>b.roomId===r.id&&b.status==='confirmed').length;
    modal(`<h2>Remove ${esc(r.name)}?</h2><p class="hint">${n?`<b>${n} upcoming booking${n>1?'s':''}</b> for this room will be cancelled. `:''}This cannot be undone.</p>
      <div class="stack" style="margin-top:16px"><button class="btn danger" data-act="roomDel" data-id="${r.id}">Remove room</button><button class="btn outline" data-act="close">Keep room</button></div>`);
  },
  roomDel(d){
    const r=room(d.id);
    S.bookings.filter(b=>b.roomId===r.id&&b.status==='confirmed').forEach(b=>{b.status='cancelled';log('Admin','Cancelled (room removed)',b.ref);});
    S.rooms = S.rooms.filter(x=>x.id!==r.id); log('Admin',`Removed room ${r.name}`,'—');
    modal(''); toast(`${r.name} removed.`); rerender();
  },
  areaForm(d){
    const a=S.areas.find(x=>x.id===d.id);
    modal(`<h2>Edit ${esc(a.name)}</h2><form data-form="area" data-id="${a.id}" class="stack" style="margin-top:12px">
      <div><label class="flabel">Location</label><input class="mini" name="loc" value="${esc(a.loc)}" required></div>
      <div class="grid2"><div><label class="flabel">Seat capacity</label><input class="mini" name="cap" type="number" min="1" value="${a.cap}" required></div>
      <div><label class="flabel">Estimated seats taken</label><input class="mini" name="taken" type="number" min="0" value="${a.taken}" required></div></div>
      ${liveActive(a)?`<label class="row" style="font-size:14px;font-weight:600"><input type="checkbox" name="clearLive"> Clear live student report (${LV[a.live.level]})</label>`:''}
      <button class="btn">Save changes</button><button type="button" class="btn ghost" data-act="close">Cancel</button></form>`);
  },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (fn) fn(el.dataset, el, e);
});
document.addEventListener('input', e => {
  const k = e.target.dataset.bind; if (!k) return;
  if (k==='logQ') { S.logQ = e.target.value; const pos=e.target.selectionStart; rerender(); const n=document.querySelector('[data-bind=logQ]'); n.focus(); n.setSelectionRange(pos,pos); }
  else S.flow[k] = e.target.value;
});
document.addEventListener('change', e => { const k=e.target.dataset.bind; if (k && k!=='logQ') S.flow[k]=e.target.value; });

function collectReg(){ const f=document.querySelector('[data-form=register]'); const o=Object.fromEntries(new FormData(f)); return {...o, free:(S.flow.reg?.free)||[]}; }
const showErr = (id,msg) => document.getElementById(id).innerHTML = `<div class="notice bad">${I.info}<span>${esc(msg)}</span></div>`;

document.addEventListener('submit', e => {
  const f = e.target, kind = f.dataset.form; if (!kind) return; e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  if (kind==='login') {
    const id = v.id.trim().toLowerCase();
    const u = S.users.find(x => (x.email.toLowerCase()===id || x.matric.toLowerCase()===id) && x.password===v.pw);
    if (!u) return showErr('lerr','Incorrect matric number/email or password.');
    if (S.flow.adminLogin && u.role!=='admin') return showErr('lerr','This is not an administrator account. Use the student login instead.');
    if (!S.flow.adminLogin && u.role==='admin') return showErr('lerr','Administrators must sign in through the admin login.');
    S.user = u; S.flow = {}; go(u.role==='admin'?'admin':'home');
  }
  if (kind==='register') {
    const r = S.flow.reg = collectReg();
    if (!r.name.trim() || !r.matric.trim() || !r.email.trim()) return showErr('rerr','Please fill in your full name, matric number and email.');
    if (!/^[A-Za-z]\d{6,9}$/.test(r.matric.trim())) return showErr('rerr','Matric number should look like U2100123.');
    if (!/^\S+@\S+\.\S+$/.test(r.email)) return showErr('rerr','Please enter a valid email address.');
    if (S.users.some(u=>u.matric.toLowerCase()===r.matric.trim().toLowerCase()||u.email.toLowerCase()===r.email.trim().toLowerCase())) return showErr('rerr','An account with this matric number or email already exists.');
    if ((r.pw||'').length < 6) return showErr('rerr','Password must be at least 6 characters.');
    if (r.pw !== r.pw2) return showErr('rerr','Passwords do not match.');
    if (!r.free.length) return showErr('rerr','Pick at least one usual free time.');
    S.users.push({id:'u'+(S.users.length+1),role:'student',name:r.name.trim(),matric:r.matric.trim().toUpperCase(),email:r.email.trim(),password:r.pw,area:r.area,free:r.free});
    S.flow = {prefill:r.matric.trim().toUpperCase(), okMsg:'Account created! Log in with your new password.'}; go('login');
  }
  if (kind==='search') { Object.assign(S.flow,{day:+v.day,cap:+v.cap,type:v.type,roomId:null,sel:[],msg:''}); go('rooms'); }
  if (kind==='profile') {
    if (!v.name.trim()||!v.matric.trim()||!/^\S+@\S+\.\S+$/.test(v.email)) return showErr('perr','Please enter a name, matric number and valid email.');
    if (!S.draftFree.length) return showErr('perr','Pick at least one usual free time.');
    Object.assign(S.user,{name:v.name.trim(),matric:v.matric.trim(),email:v.email.trim(),area:v.area,free:[...S.draftFree]});
    S.editProfile=false; toast('Profile updated.'); rerender();
  }
  if (kind==='room') {
    const id=f.dataset.id, data={name:v.name.trim(),type:v.type,seats:+v.seats,level:+v.level,block:v.block.trim().toUpperCase(),features:v.features.trim(),active:!!v.active};
    if (id) { Object.assign(room(id),data); log('Admin',`Edited room ${data.name}`,'—'); }
    else { S.rooms.push({id:'r'+Date.now(),...data}); log('Admin',`Added room ${data.name}`,'—'); }
    modal(''); toast(id?'Room updated.':'Room added.'); rerender();
  }
  if (kind==='area') {
    const a=S.areas.find(x=>x.id===f.dataset.id);
    a.loc=v.loc; a.cap=Math.max(1,+v.cap); a.taken=Math.min(a.cap,Math.max(0,+v.taken)); a.upd=now(); if (v.clearLive) a.live=null;
    log('Admin',`Updated common area ${a.name}`,'—'); modal(''); toast('Common area updated.'); rerender();
  }
});
