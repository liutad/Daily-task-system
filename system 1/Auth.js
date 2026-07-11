// auth.js
// Include this with <script src="auth.js"></script> as the FIRST script
// in the <head> of any page that should require login.
// It runs immediately (no defer/async) so it redirects before the page
// has a chance to flash on screen.

(function () {
  const profile = localStorage.getItem('profile');
  if (!profile) {
    window.location.href = 'loginpage.html';
  }
})();

// Call this from a "Logout" link/button on any page:
function logout() {
  localStorage.removeItem('profile');
  window.location.href = 'loginpage.html';
}
