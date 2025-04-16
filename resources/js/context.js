document.addEventListener('DOMContentLoaded', function () {
  let debugLoginStatus;
  try {
      // Try to parse the stored value (if it was saved via JSON.stringify)
      debugLoginStatus = JSON.parse(localStorage.getItem('debug_login_status'));
  } catch (e) {
      // If parsing fails, use the raw string
      debugLoginStatus = localStorage.getItem('debug_login_status');
  }

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
      if (cookie.indexOf(name + "=") === 0) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  }
  
  
function deleteCookie(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

function CreateSwitch(selfId, btnIdOn, btnIdOff, inputId){
    let btn1 = document.getElementById(btnIdOn);
    let self = document.getElementById(selfId);
    let btn2 = document.getElementById(btnIdOff);
    let input = document.getElementById(inputId);
    if (selfId === btnIdOn){
      input.value = 'on';
      btn1.classList.add('btn-primary');
      btn2.classList.remove('btn-primary');
      
    } else {
      input.value = 'off';
      btn2.classList.add('btn-primary');
      btn1.classList.remove('btn-primary');
    }
  }