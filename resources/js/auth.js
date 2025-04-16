document.addEventListener('DOMContentLoaded', () => {
  // DOM Helpers
  const $ = s => document.querySelector(s),
        $$ = s => document.querySelectorAll(s);
  const mainTabs = $$(".main-tab"),
        loginTab = $('#loginTab'),
        registerTab = $('#registerTab'),
        regStepTabs = $$(".register-tab"),
        steps = $$(".step"),
        conns = $$(".step-connector"),
        stepContents = { 1: $('#step1'), 2: $('#step2'), 3: $('#step3') },
        loginForm = $('#loginForm'),
        step1Form = $('#step1Form'),
        step2Form = $('#step2Form'),
        nextBtn = $('#nextToStep2'),
        backBtn = $('#backToStep1'),
        submitBtn = $('#submitRegistration'),
        loginBtn = $('#goToLogin'),
        loginEmail = $('#loginEmail'), loginPassword = $('#loginPassword'),
        loginEmailHint = $('#loginEmailHint'), loginPasswordHint = $('#loginPasswordHint'),
        fullName = $('#fullName'), regEmail = $('#regEmail'),
        phone = $('#phoneNumber'), nameHint = $('#nameHint'),
        emailHint = $('#emailHint'), phoneHint = $('#phoneHint'),
        regPassword = $('#regPassword'), confirmPassword = $('#confirmPassword'),
        strengthMeter = $('#strengthMeter'),
        passwordHint = $('#passwordHint'), confirmHint = $('#confirmHint'),
        loginMsg = $('#loginMessage'), registerMsg = $('#registerMessage');

  // UI & Validation Functions
  const showMsg = (el, msg, err = true) => { 
          el.textContent = msg; 
          el.className = `message-box visible ${err ? 'message-error' : 'message-success'}`; 
      },
      clearMsg = el => { 
          el.textContent = ''; 
          el.classList.remove('visible','message-error','message-success'); 
      },
      setField = (inp, hint, msg, err) => { 
          hint.textContent = msg; 
          inp.classList.toggle('error', err); 
          hint.classList.toggle('error', err); 
      },
      clearField = (inp, hint) => { 
          setField(inp, hint, '', false); 
          if (hint === passwordHint) hint.textContent = 'Min. 8 chars: upper, lower, number, symbol (!@#$%^&*)'; 
          if (hint === confirmHint) hint.textContent = ''; 
      },
      showStep = s => {
          Object.values(stepContents).forEach(sc => sc.classList.remove('active'));
          stepContents[s] && stepContents[s].classList.add('active');
          [...regStepTabs].forEach((tab, i) => {
              tab.classList.remove('active','completed');
              if(i < s - 1) tab.classList.add('completed'); 
              else if(i === s - 1) tab.classList.add('active');
          });
          [...steps].forEach((st, i) => {
              st.classList.remove('active','completed');
              if(i < s - 1) st.classList.add('completed'); 
              else if(i === s - 1) st.classList.add('active');
          });
          [...conns].forEach((line, i) => { 
              line.classList.remove('active','completed'); 
              if(i < s - 1) line.classList.add('completed'); 
          });
          clearMsg(registerMsg);
      },
      resetForm = () => {
          step1Form.reset(); 
          step2Form.reset();
          [fullName, regEmail, phone, regPassword, confirmPassword, loginEmail, loginPassword].forEach(i => i.classList.remove('error'));
          [nameHint, emailHint, phoneHint, passwordHint, confirmHint, loginEmailHint, loginPasswordHint].forEach(h => { 
              h.textContent = ''; 
              h.classList.remove('error'); 
          });
          passwordHint.textContent = 'Min. 8 chars: upper, lower, number, symbol (!@#$%^&*)';
          strengthMeter.className = 'strength-meter'; 
          clearMsg(registerMsg); 
          clearMsg(loginMsg);
          showStep(1);
      },
      validateEmail = email => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.toLowerCase()),
      validatePhone = phone => {
          const digits = (phone.match(/\d/g) || []).join('');
          return /^(\+?\d{0,3}[\s-]?)?(06|07)\d{5,13}$/.test(digits) && digits.length >= 7 && digits.length <= 15;
      },
      validatePW = pw => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(pw),
      checkStrength = pw => { 
          let s = 0; 
          s += pw.length >= 8; 
          s += /[A-Z]/.test(pw); 
          s += /[a-z]/.test(pw); 
          s += /\d/.test(pw); 
          s += /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw); 
          strengthMeter.className = 'strength-meter'; 
          passwordHint.classList.remove('error'); 
          if(s <= 2) strengthMeter.classList.add('strength-weak'); 
          else if(s <= 4) strengthMeter.classList.add('strength-medium'); 
          else strengthMeter.classList.add('strength-strong');
      },
      validateField = (inp, hint, type) => {
          let val = inp.value.trim(), 
              valid = val !== '', 
              msg = valid ? (type==='email' && !validateEmail(val) ? 'Please enter a valid email address' : '') : 'This field is required';
          valid = valid && (type==='email' ? validateEmail(val) : true);
          setField(inp, hint, msg, !valid); 
          return valid;
      },
      validateRegField = (inp, hint, type) => {
          let val = inp.value.trim(), valid = val !== '', msg = '';
          if(!valid) msg = 'This field is required'; 
          else if(type==='name' && val.length < 3) { msg = 'Name must be at least 3 characters'; valid = false; }
          else if(type==='email' && !validateEmail(val)) { msg = 'Please enter a valid email address'; valid = false; }
          else if(type==='phone' && !validatePhone(val)) { msg = 'Please enter a valid phone number (e.g., +1 06XXX XXX XXXX)'; valid = false; }
          else if(type==='password') { 
              checkStrength(val); 
              if(!validatePW(val)) { msg = 'Min 8 chars: upper, lower, number, symbol'; valid = false; } 
          }
          else if(type==='confirmPassword') { 
              if(val !== regPassword.value) { msg = 'Passwords do not match'; valid = false; } 
              else if(val === '') { msg = 'Please confirm your password'; valid = false; } 
          }
          setField(inp, hint, msg, !valid);
          if(type==='password')
              passwordHint.textContent = valid ? 'Strong password!' : (val ? msg : 'Min. 8 chars: upper, lower, number, symbol (!@#$%^&*)');
          if(type==='confirmPassword' && valid) { 
              confirmHint.textContent = ''; 
              confirmHint.classList.remove('error'); 
          }
          return valid;
      },
      validateStep1 = () => validateRegField(fullName, nameHint, 'name') &&
                              validateRegField(regEmail, emailHint, 'email') &&
                              validateRegField(phone, phoneHint, 'phone'),
      validateStep2 = () => validateRegField(regPassword, passwordHint, 'password') &&
                              validateRegField(confirmPassword, confirmHint, 'confirmPassword'),
      validateLogin = () => validateField(loginEmail, loginEmailHint, 'email') &&
                              validateField(loginPassword, loginPasswordHint, 'password');
  
  // Event Listeners
  mainTabs.forEach(tab => tab.addEventListener('click', function(){
      const t = this.getAttribute('data-tab');
      mainTabs.forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      if(t==='login') { 
          loginTab.classList.add('active'); 
          registerTab.classList.remove('active'); 
      } else { 
          loginTab.classList.remove('active'); 
          registerTab.classList.add('active'); 
          showStep(1); 
      }
      clearMsg(loginMsg); 
      clearMsg(registerMsg);
  }));
  [loginEmail, loginPassword].forEach((el, i) => 
      el.addEventListener('blur', () => validateField(el, i ? loginPasswordHint : loginEmailHint, i ? 'password' : 'email'))
  );
  [fullName, regEmail, phone, regPassword, confirmPassword].forEach((el, i) => {
      const type = ['name','email','phone','password','confirmPassword'][i];
      el.addEventListener('blur', () => 
          validateRegField(el, type==='name'?nameHint: type==='email'?emailHint: type==='phone'?phoneHint: type==='password'?passwordHint:confirmHint, type)
      );
  });
  regPassword.addEventListener('input', () => { 
      checkStrength(regPassword.value); 
      if(confirmPassword.value) validateRegField(confirmPassword, confirmHint, 'confirmPassword');
  });
  
  loginForm.addEventListener('submit', e => {
      e.preventDefault(); 
      clearMsg(loginMsg);
      if (validateLogin()) {
          const em = loginEmail.value.trim(), pw = loginPassword.value;
          let users = getData('debug_user_accounts') || [];
          if(users.find(u => u.email === em && u.password === pw)) {
              showMsg(loginMsg, 'Login successful! Redirecting...', false);
              saveData('debug_login_status', 'loggedIn');
              clearField(loginEmail, loginEmailHint); 
              clearField(loginPassword, loginPasswordHint);
              setTimeout(() => window.location.href = 'http://localhost:5500/main.html', 1500);
          } else {
              showMsg(loginMsg, 'Invalid email or password (debug check).');
          }
      } else {
          showMsg(loginMsg, 'Please check the fields marked in red.');
      }
  });
  nextBtn.addEventListener('click', () => { 
      clearMsg(registerMsg); 
      validateStep1() ? showStep(2) : showMsg(registerMsg, 'Please correct the errors in Step 1.'); 
  });
  backBtn.addEventListener('click', () => showStep(1));
  submitBtn.addEventListener('click', () => {
      clearMsg(registerMsg);
      if (validateStep2()) {
          let em = regEmail.value.trim(), pw = regPassword.value;
          let users = getData('debug_user_accounts') || [];
          if (users.some(u => u.email === em)) {
              showMsg(registerMsg, 'Email already registered for debugging.');
          } else { 
              users.push({ email: em, password: pw }); 
              saveData('debug_user_accounts', users); 
              showStep(3); 
          }
      } else {
          showMsg(registerMsg, 'Please correct the errors in Step 2.');
      }
  });
  loginBtn.addEventListener('click', () => { 
      mainTabs.forEach(tab => { 
          if(tab.getAttribute('data-tab')==='login') tab.click(); 
      });
      resetForm(); 
  });
  if(registerTab.classList.contains('active')) showStep(1);
});
