
document.addEventListener('DOMContentLoaded', function () {
    const debugLoginStatus = document.cookie
        .split('; ')
        .find(row => row.startsWith('debug_login_status='))
        ?.split('=')[1];
    

    let path = console.log(window.location.pathname);
    if (path != '/auth.html' && debugLoginStatus === 'loggedIn'){
        window.location.href = 'http://localhost:5500/auth.html';

    }
    
    console.log(debugLoginStatus);
  });
  