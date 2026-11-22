/* =========================================================
   ROUTER
   ========================================================= */
const STUDENT = {home:vHome,book:vBook,rooms:vRooms,slot:vSlot,layout:vLayout,summary:vSummary,confirmed:vConfirmed,areas:vAreas,bookings:vBookings,profile:vProfile};
const ADMIN = {'admin':vAdmin,'admin-rooms':vAdminRooms,'admin-bookings':vAdminBookings,'admin-logs':vAdminLogs,'admin-users':vAdminUsers,'admin-areas':vAdminAreas};
function render() {
  applyRules();
  let r = location.hash.slice(1);
  if (!S.user) { if (r !== 'register') r = 'login'; }
  else if (S.user.role === 'admin') { if (!ADMIN[r]) r = 'admin'; }
  else if (!STUDENT[r]) r = 'home';
  if ('#'+r !== location.hash) { history.replaceState(null,'','#'+r); }
  S.route = r;
  const v = r==='login'?vLogin : r==='register'?vRegister : (ADMIN[r]||STUDENT[r]);
  const html = v();
  if (typeof html === 'string') { document.getElementById('root').innerHTML = html; }
  window.scrollTo(0, S.keepScroll ? S.keepScroll : 0); S.keepScroll = 0;
}
const rerender = () => { S.keepScroll = window.scrollY; render(); };
window.addEventListener('hashchange', render);
