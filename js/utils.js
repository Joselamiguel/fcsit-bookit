/* FCSIT BookIt — shared helpers (time formatting, escaping) */
const M = 60000, H = 60 * M, DAY = 24 * H;
const OPEN = 8, CLOSE = 20; // bookable hours 8:00–20:00
const now = () => Date.now();
const dayStart = t => { const d = new Date(t); d.setHours(0,0,0,0); return d.getTime(); };
const at = (day, h) => dayStart(day) + h * H;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fT = t => new Date(t).toLocaleTimeString('en-MY',{hour:'numeric',minute:'2-digit',hour12:true}).replace(' ', ' ').toUpperCase();
const fD = t => { const d=new Date(t), o=k=>d.toLocaleDateString('en-GB',k); return `${o({weekday:'short'})}, ${d.getDate()} ${o({month:'short'})} ${d.getFullYear()}`; };
const fDT = t => `${fD(t)}, ${fT(t)}`;
const mon = t => new Date(t).toLocaleDateString('en-GB',{month:'short'}).toUpperCase();
const dnum = t => new Date(t).getDate();
const hm = h => fT(at(now(), h));
const isToday = t => dayStart(t) === dayStart(now());
const rel = t => { const d = Math.round((dayStart(t) - dayStart(now()))/DAY); return d===0?'Today':d===1?'Tomorrow':d===-1?'Yesterday':new Date(t).toLocaleDateString('en-GB',{weekday:'short'}); };
const ago = t => { const m = Math.round((now()-t)/M); return m<1?'just now':m<60?`${m} min ago`:m<1440?`${Math.round(m/60)} h ago`:`${Math.round(m/1440)} d ago`; };
