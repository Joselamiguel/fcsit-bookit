/* FCSIT BookIt — boot: live countdown tick + first render */
/* live tick: countdowns + status rules */
setInterval(() => {
  if (applyRules() && !document.querySelector('#modal .scrim') && !document.activeElement?.matches('input,select')) return rerender();
  document.querySelectorAll('[data-countdown]').forEach(el => {
    const end=+el.dataset.countdown, left=end-now(); el.textContent=countdown(left);
    const s=document.getElementById('session'); if (s && left<=15*M && !s.classList.contains('ending')) rerender();
  });
  document.querySelectorAll('[data-progress]').forEach(el => { const [s,e]=el.dataset.progress.split('|').map(Number); el.style.width=Math.max(0,(e-now())/(e-s)*100)+'%'; });
}, 1000);

render();
