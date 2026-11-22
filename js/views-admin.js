/* =========================================================
   ADMIN VIEWS
   ========================================================= */
const ANAV = [['admin','Dashboard',I.grid],['admin-users','Manage Users',I.users],['admin-rooms','Manage Rooms',I.door],['admin-bookings','Manage Bookings',I.book],['admin-logs','Reservation Logs',I.log],['admin-areas','Manage Common Areas',I.bars.replace('<svg','<svg width="20" height="20"')]];
function ashell(route, title, sub, body, action='') {
  const nav = ANAV.map(([id,l,ic])=>`<a href="#${id}" class="${route===id?'on':''}">${ic}${l}</a>`).join('');
  return `<div class="admin">
    <aside class="side"><div class="brand"><b>F</b><div>FCSIT BookIt<small>Administrator</small></div></div>${nav}
      <a href="#" class="out" data-act="logout">${I.out}Log out</a></aside>
    <div style="min-width:0">
      <div class="atop"><div class="brand"><span>FCSIT BookIt · Admin</span><a href="#" data-act="logout" style="color:#fff;font:600 13px Inter">Log out</a></div><nav>${ANAV.map(([id,l])=>`<a href="#${id}" class="${route===id?'on':''}">${l}</a>`).join('')}</nav></div>
      <div class="amain"><div class="ah"><div><h1>${title}</h1><p>${sub}</p></div>${action}</div>${body}</div>
    </div></div>`;
}
const studentName = id => esc(userById(id)?.name || '—');

function vAdmin() {
  const t = now(), B = S.bookings;
  const upcoming = B.filter(b=>b.status==='confirmed'&&b.start>t).length;
  const today = B.filter(b=>isToday(b.start)&&ACTIVE.concat('completed').includes(b.status)).length;
  const counts = Object.keys(STATUS).map(s=>[s,B.filter(b=>b.status===s).length]);
  return ashell('admin','Admin Dashboard',`Faculty facilities overview · ${fD(t)}`, `
    <div class="stats">
      <div class="stat hero"><small>Total Discussion Rooms</small><b>${S.rooms.filter(r=>r.active).length}</b><small>${S.rooms.filter(r=>!r.active).length} inactive</small></div>
      <div class="stat"><small>Total Reservations</small><b>${B.length}</b><small class="hint">all time</small></div>
      <div class="stat"><small>Upcoming Reservations</small><b>${upcoming}</b><small class="hint">confirmed, not started</small></div>
      <div class="stat"><small>Rooms in use today</small><b>${today}</b><small class="hint">${B.filter(b=>b.status==='checked-in').length} checked in now</small></div>
    </div>
    <div class="qnav">${ANAV.slice(1).map(([id,l,ic])=>`<a href="#${id}">${ic}${l}</a>`).join('')}</div>
    <div class="grid2" style="grid-template-columns:1.4fr 1fr">
      <div class="panel"><div class="row between"><h3>Recent Booking Activities</h3><a href="#admin-logs" style="font-weight:600;font-size:13px">View all logs</a></div>
        ${S.logs.slice(0,7).map(l=>`<div class="act"><span class="dot">${l.actor==='System'?I.clock.replace('22','18').replace('22','18'):I.book.replace('20','18').replace('20','18')}</span><div><b>${esc(l.actor)}</b> · ${esc(l.action)}<div class="hint">${l.ref} · ${ago(l.t)}</div></div></div>`).join('')}
      </div>
      <div class="panel"><h3>Bookings by status</h3>
        ${counts.map(([s,n])=>`<div class="row between" style="padding:8px 0">${pill(s)}<b>${n}</b></div><div style="height:6px;background:#F1F2F5;border-radius:6px;overflow:hidden"><div class="st-${s}" style="height:100%;width:${n/B.length*100}%;background:currentColor"></div></div>`).join('')}
      </div>
    </div>
  `);
}

function vAdminRooms() {
  return ashell('admin-rooms','Manage Rooms','Add, edit or remove discussion rooms and check availability.', `
    <div class="panel tw"><table>
      <thead><tr><th>Room</th><th>Type</th><th>Location</th><th>Seats</th><th>Facilities</th><th>Today's availability</th><th>Status</th><th></th></tr></thead>
      <tbody>${S.rooms.map(r=>{ const f=freeSlots(r.id,now()); return `<tr>
        <td><b>${esc(r.name)}</b></td><td>${esc(r.type)}</td><td>Level ${r.level}, Block ${esc(r.block)}</td><td>${r.seats}</td><td class="hint">${esc(r.features)}</td>
        <td><button class="ib" data-act="avail" data-id="${r.id}">${r.active?`${f} free slot${f===1?'':'s'}`:'—'} · View</button></td>
        <td>${r.active?'<span class="pill st-checked-in"><i></i>Active</span>':'<span class="pill st-completed"><i></i>Inactive</span>'}</td>
        <td style="white-space:nowrap"><button class="ib" data-act="roomForm" data-id="${r.id}">Edit</button> <button class="ib r" data-act="roomDelAsk" data-id="${r.id}">Remove</button></td></tr>`;}).join('')}</tbody>
    </table></div>`, `<button class="btn sm" data-act="roomForm">+ Add new room</button>`);
}

function vAdminBookings() {
  const f = S.adminFilter;
  const list = S.bookings.filter(b=>f==='all'||b.status===f).sort((a,b)=>b.start-a.start);
  return ashell('admin-bookings','Manage Bookings','View all student reservations and monitor their status.', `
    <div class="filters">${['all',...Object.keys(STATUS)].map(s=>`<button class="chip ${f===s?'on':''}" data-act="afilter" data-s="${s}">${s==='all'?'All':STATUS[s]} (${s==='all'?S.bookings.length:S.bookings.filter(b=>b.status===s).length})</button>`).join('')}</div>
    <div class="panel tw"><table>
      <thead><tr><th>Reference</th><th>Student</th><th>Room</th><th>Date & time</th><th>Attendees</th><th>Status</th><th></th></tr></thead>
      <tbody>${list.map(b=>`<tr><td><b>${b.ref}</b></td><td>${studentName(b.userId)}</td><td>${esc(room(b.roomId)?.name||'(removed room)')}</td>
        <td>${fD(b.start)}<div class="hint">${fT(b.start)} – ${fT(b.end)}</div></td><td>${b.attendees}</td><td>${pill(b.status)}</td>
        <td><button class="ib" data-act="bookDetail" data-ref="${b.ref}">Details</button></td></tr>`).join('') || '<tr><td colspan="7" class="hint">No bookings with this status.</td></tr>'}</tbody>
    </table></div>`);
}

function vAdminLogs() {
  const q = S.logQ.toLowerCase();
  const list = S.logs.filter(l=>!q||`${l.actor} ${l.action} ${l.ref}`.toLowerCase().includes(q));
  return ashell('admin-logs','Reservation Logs','Historical reservation records and room usage activity.', `
    <div style="max-width:360px;margin-bottom:14px"><input class="mini" data-bind="logQ" placeholder="Search by student, room or reference…" value="${esc(S.logQ)}"></div>
    <div class="panel tw"><table>
      <thead><tr><th>Date & time</th><th>Actor</th><th>Activity</th><th>Reference</th></tr></thead>
      <tbody>${list.map(l=>`<tr><td style="white-space:nowrap">${fDT(l.t)}</td><td><b>${esc(l.actor)}</b></td><td>${esc(l.action)}</td><td class="hint">${l.ref}</td></tr>`).join('') || '<tr><td colspan="4" class="hint">No matching records.</td></tr>'}</tbody>
    </table></div>`);
}

function vAdminUsers() {
  const st = S.users.filter(u=>u.role==='student');
  return ashell('admin-users','Manage Users','Registered students and their study preferences.', `
    <div class="panel tw"><table>
      <thead><tr><th>Name</th><th>Matric no.</th><th>Email</th><th>Preferred area</th><th>Usual free time</th><th>Bookings</th></tr></thead>
      <tbody>${st.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.matric)}</td><td>${esc(u.email)}</td><td>${esc(u.area)}</td><td class="hint">${esc((u.free||[]).join(', ')||'—')}</td><td>${S.bookings.filter(b=>b.userId===u.id).length}</td></tr>`).join('')}</tbody>
    </table></div>`);
}

function vAdminAreas() {
  return ashell('admin-areas','Manage Common Areas','Baseline capacity and estimated occupancy used by the Common Area Status module.', `
    <div class="panel tw"><table>
      <thead><tr><th>Area</th><th>Location</th><th>Capacity</th><th>Estimated occupancy</th><th>Shown to students</th><th>Students preferring</th><th></th></tr></thead>
      <tbody>${S.areas.map(a=>{const p=areaPct(a),lv=liveActive(a)?a.live.level:level(p);return `<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.loc)}</td><td>${a.cap}</td><td>${a.taken} seats (${p}%)</td>
        <td><span class="badge lvl-${lv}"><i></i>${LV[lv]}${liveActive(a)?' · live':''}</span></td><td>${S.users.filter(u=>u.area===a.name).length}</td>
        <td><button class="ib" data-act="areaForm" data-id="${a.id}">Edit</button></td></tr>`;}).join('')}</tbody>
    </table></div>`);
}
