/* ---------- data ---------- */
const AREAS_LIST = ['Student Lounge','Faculty Cafe','Open Study Area','Level 3 Foyer'];
const FREE_TIMES = ['Morning (8–12)','Afternoon (12–4)','Evening (4–8)','Weekends'];
const S = {
  user:null, route:'', flow:{}, tab:'upcoming', adminFilter:'all', logQ:'', editProfile:false, refN:1043,
  users:[
    {id:'u1',role:'student',name:'Siti Aisyah binti Rahman',matric:'U2100123',email:'student@siswa.um.edu.my',password:'bookit123',area:'Open Study Area',free:['Afternoon (12–4)','Evening (4–8)']},
    {id:'u2',role:'student',name:'Lim Wei Jie',matric:'U2100456',email:'weijie@siswa.um.edu.my',password:'x',area:'Student Lounge',free:['Morning (8–12)']},
    {id:'u3',role:'student',name:'Arjun Nair',matric:'U2100789',email:'arjun@siswa.um.edu.my',password:'x',area:'Faculty Cafe',free:['Afternoon (12–4)']},
    {id:'u4',role:'student',name:'Nur Hidayah',matric:'U2101011',email:'hidayah@siswa.um.edu.my',password:'x',area:'Level 3 Foyer',free:['Evening (4–8)','Weekends']},
    {id:'a1',role:'admin',name:'Faculty Facilities Office',email:'admin@fsktm.um.edu.my',matric:'ADMIN',password:'admin123'},
  ],
  rooms:[
    {id:'r1',name:'Discussion Pod A',type:'Discussion Pod',level:2,block:'B',seats:4,features:'Whiteboard · Display',active:true},
    {id:'r2',name:'Discussion Pod B',type:'Discussion Pod',level:2,block:'B',seats:4,features:'Whiteboard',active:true},
    {id:'r3',name:'Discussion Pod C',type:'Discussion Pod',level:1,block:'A',seats:6,features:'Display · Power outlets',active:true},
    {id:'r4',name:'Discussion Pod D',type:'Discussion Pod',level:1,block:'A',seats:4,features:'Whiteboard',active:true},
    {id:'r5',name:'Meeting Room 1',type:'Meeting Room',level:3,block:'B',seats:10,features:'Projector · Video call',active:true},
    {id:'r6',name:'Meeting Room 2',type:'Meeting Room',level:3,block:'B',seats:8,features:'Projector · Whiteboard',active:true},
  ],
  areas:[
    {id:'a1',name:'Student Lounge',loc:'Block A · Level 1',cap:60,taken:35,upd:now()-2*M,live:null},
    {id:'a2',name:'Faculty Cafe',loc:'Block B · Ground floor',cap:100,taken:86,upd:now()-1*M,live:null},
    {id:'a3',name:'Open Study Area',loc:'Block B · Level 2',cap:50,taken:12,upd:now()-4*M,live:null},
    {id:'a4',name:'Level 3 Foyer',loc:'Block B · Level 3',cap:40,taken:7,upd:now()-3*M,live:null},
  ],
  bookings:[], logs:[],
};
const room = id => S.rooms.find(r => r.id === id);
const userById = id => S.users.find(u => u.id === id);
const log = (actor, action, ref, t=now()) => S.logs.unshift({t, actor, action, ref});

function mkBooking(userId, roomId, start, end, status, extra={}) {
  const b = {ref:'FCSIT-RB-'+(S.refN++), userId, roomId, start, end, attendees:extra.att||room(roomId).seats, purpose:extra.purpose||'Group assignment discussion', status, created:extra.created||start-2*DAY, zone:extra.zone||null};
  S.bookings.push(b); return b;
}
(function seed(){
  const t = now(), D = d => t + d*DAY;
  // current student: one starting right now (check-in window open), one upcoming, plus history
  const s0 = Math.floor((t - 4*M)/(5*M))*5*M;
  const b1 = mkBooking('u1','r1', s0, s0+2*H, 'confirmed', {att:4, created:t-DAY});
  const b2 = mkBooking('u1','r5', at(D(3),10), at(D(3),12), 'confirmed', {att:8, purpose:'FYP supervisor meeting', created:t-3*H});
  const b3 = mkBooking('u1','r4', at(D(-2),15), at(D(-2),16), 'completed', {att:4});
  const b4 = mkBooking('u1','r2', at(D(-5),9), at(D(-5),11), 'auto-cancelled', {att:3});
  const b5 = mkBooking('u1','r3', at(D(-7),13), at(D(-7),14), 'cancelled', {att:5});
  // other students
  const o = [
    ['u2','r2',0,9,2],['u3','r6',0,14,2],['u4','r3',0,16,1],['u2','r5',1,11,2],['u3','r1',1,9,1],['u4','r2',2,15,2],
    ['u2','r6',-1,10,2],['u3','r4',-1,13,1],['u4','r1',-3,16,2],['u2','r3',-4,11,1],
  ];
  o.forEach(([u,r,d,h,len]) => {
    const st = at(D(d),h), en = st+len*H;
    const status = en < t ? 'completed' : st > t ? 'confirmed' : 'checked-in';
    mkBooking(u,r,st,en,status,{att:Math.min(room(r).seats,3+len)});
  });
  S.bookings.find(b=>b.userId==='u3'&&b.roomId==='r4').status='auto-cancelled';
  // logs
  [...S.bookings].sort((a,b)=>a.created-b.created).forEach(b=>{
    const n = userById(b.userId).name.split(' ')[0];
    log(n, `Booked ${room(b.roomId).name}`, b.ref, b.created);
    if (b.status==='completed'||b.status==='checked-in') log(n, `Checked in to ${room(b.roomId).name}`, b.ref, b.start+5*M);
    if (b.status==='completed') log('System', `Session completed · ${room(b.roomId).name}`, b.ref, b.end);
    if (b.status==='cancelled') log(n, `Cancelled ${room(b.roomId).name}`, b.ref, b.start-DAY);
    if (b.status==='auto-cancelled') log('System', `Auto-cancelled (no check-in within 15 min)`, b.ref, b.start+15*M);
  });
  S.logs = S.logs.filter(l=>l.t<=t).sort((a,b)=>b.t-a.t);
})();

/* ---------- derived ---------- */
const level = p => p < 40 ? 'quiet' : p <= 70 ? 'moderate' : 'busy';
const LV = {quiet:'Quiet',moderate:'Moderate',busy:'Busy',empty:'Empty',packed:'Packed'};
const liveActive = a => a.live && a.live.exp > now();
const areaPct = a => Math.round(a.taken / a.cap * 100);
const ACTIVE = ['confirmed','checked-in'];
function slotTaken(roomId, day, h) {
  const s = at(day,h), e = s+H;
  if (S.bookings.some(b => b.roomId===roomId && ACTIVE.concat('completed').includes(b.status) && b.start < e && b.end > s)) return true;
  const n = +roomId.replace(/\D/g,'') || 1, dd = new Date(day).getDate();
  return ((n*7 + dd*3 + h*5) % 6) === 0;  // background demand from other students
}
const slotPast = (day,h) => at(day,h) + 30*M < now() && isToday(day) || dayStart(day) < dayStart(now());
const freeSlots = (roomId, day) => { let c=0; for(let h=OPEN;h<CLOSE;h++) if(!slotTaken(roomId,day,h)&&!slotPast(day,h)) c++; return c; };
const myBookings = () => S.bookings.filter(b => b.userId === S.user.id);
const activeSession = () => myBookings().find(b => b.status==='checked-in' && b.end > now());
const nextBooking = () => myBookings().filter(b=>b.status==='confirmed').sort((a,b)=>a.start-b.start)[0];
const canCheckIn = b => b.status==='confirmed' && now() >= b.start - 15*M && now() <= b.start + 15*M;
const STATUS = {'confirmed':'Confirmed','checked-in':'Checked In','completed':'Completed','cancelled':'Cancelled','auto-cancelled':'Auto-Cancelled'};
const pill = s => `<span class="pill st-${s}"><i></i>${STATUS[s]}</span>`;
const eligibleOnSite = () => S.bookings.filter(b=>b.status==='checked-in').length + 4; // checked-in students + recent on-site check-ins

/* status engine: anti-ghost-booking + session completion */
function applyRules() {
  let changed = false; const t = now();
  S.bookings.forEach(b => {
    if (b.status==='confirmed' && t > b.start + 15*M) { b.status='auto-cancelled'; log('System','Auto-cancelled (no check-in within 15 min)',b.ref); changed=true;
      if (S.user && b.userId===S.user.id) toast(`${room(b.roomId).name} was auto-cancelled — no check-in within 15 minutes.`); }
    if (b.status==='checked-in' && t >= b.end) { b.status='completed'; log('System',`Session completed · ${room(b.roomId).name}`,b.ref); changed=true; }
  });
  S.areas.forEach(a => { if (a.live && a.live.exp <= t) { a.live = null; changed = true; } });
  return changed;
}
