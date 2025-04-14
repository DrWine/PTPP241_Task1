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