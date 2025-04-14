document.addEventListener('DOMContentLoaded', function () {
    const debugLoginStatus = document.cookie
        .split('; ')
        .find(row => row.startsWith('debug_login_status='))
        ?.split('=')[1];

    const path = window.location.pathname;
    console.log(path);
    if (path !== '/auth.html' && debugLoginStatus !== 'loggedIn') {
        window.location.href = 'http://localhost:5500/auth.html';
    }
    
    console.log(debugLoginStatus);
});


function getCookie(name) {
    const cookieArr = document.cookie.split(";");
    for (let cookie of cookieArr) {
      cookie = cookie.trim();
      // Check if this cookie string begins with the name we want.
      if (cookie.indexOf(name + "=") === 0) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  }
  
  
function deleteCookie(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }