/* ---------- ui helpers ---------- */
let toastT;
function toast(msg){ const el=document.getElementById('toast'); el.innerHTML=`<div class="toast">${esc(msg)}</div>`; clearTimeout(toastT); toastT=setTimeout(()=>el.innerHTML='',3200); }
function modal(html){ document.getElementById('modal').innerHTML = html ? `<div class="scrim" data-act="closeModalBg"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>` : ''; }
const go = r => { if (location.hash === '#'+r) render(); else location.hash = r; };
const countdown = ms => { ms=Math.max(0,ms); const s=Math.floor(ms/1000); return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(n=>String(n).padStart(2,'0')).join(':'); };
