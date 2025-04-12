document.addEventListener('DOMContentLoaded', () => {
    const mainTabs = document.querySelectorAll('.main-tab');
    const loginTabContent = document.getElementById('loginTab');
    const registerTabContent = document.getElementById('registerTab');

    const registerStepTabs = document.querySelectorAll('.register-tab');
    const stepIndicators = document.querySelectorAll('.step');
    const stepConnectors = document.querySelectorAll('.step-connector');
    const stepContents = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3')
    };

    const loginForm = document.getElementById('loginForm');
    const step1Form = document.getElementById('step1Form');
    const step2Form = document.getElementById('step2Form');

    const nextToStep2Btn = document.getElementById('nextToStep2');
    const backToStep1Btn = document.getElementById('backToStep1');
    const submitRegistrationBtn = document.getElementById('submitRegistration');
    const goToLoginBtn = document.getElementById('goToLogin');

    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginEmailHint = document.getElementById('loginEmailHint');
    const loginPasswordHint = document.getElementById('loginPasswordHint');

    const fullNameInput = document.getElementById('fullName');
    const regEmailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('phoneNumber');
    const nameHint = document.getElementById('nameHint');
    const emailHint = document.getElementById('emailHint');
    const phoneHint = document.getElementById('phoneHint');

    const regPasswordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthMeter = document.getElementById('strengthMeter');
    const passwordHint = document.getElementById('passwordHint');
    const confirmHint = document.getElementById('confirmHint');

    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

    function showMessage(messageElement, message, isError = true) {
        messageElement.textContent = message;
        messageElement.className = 'message-box visible';
        messageElement.classList.add(isError ? 'message-error' : 'message-success');
    }

    function clearMessage(messageElement) {
        messageElement.textContent = '';
        messageElement.classList.remove('visible', 'message-error', 'message-success');
    }

    function setFieldState(inputElement, hintElement, message, isError) {
        hintElement.textContent = message;
        if (isError) {
            inputElement.classList.add('error');
            hintElement.classList.add('error');
        } else {
            inputElement.classList.remove('error');
            hintElement.classList.remove('error');
        }
    }

    function clearFieldState(inputElement, hintElement) {
         setFieldState(inputElement, hintElement, '', false);
         if (hintElement === passwordHint) {
             passwordHint.textContent = 'Min. 8 chars: upper, lower, number, symbol (!@#$%^&*)';
         }
         if (hintElement === confirmHint) {
             confirmHint.textContent = '';
         }
    }

    function showRegisterStep(stepNumber) {
        Object.values(stepContents).forEach(content => content.classList.remove('active'));
        if (stepContents[stepNumber]) {
            stepContents[stepNumber].classList.add('active');
        }

        registerStepTabs.forEach((tab, index) => {
            tab.classList.remove('active', 'completed');
            if (index < stepNumber - 1) {
                tab.classList.add('completed');
            } else if (index === stepNumber - 1) {
                tab.classList.add('active');
            }
        });

        stepIndicators.forEach((step, index) => {
             step.classList.remove('active', 'completed');
             if (index < stepNumber - 1) {
                 step.classList.add('completed');
             } else if (index === stepNumber - 1) {
                 step.classList.add('active');
             }
         });

         stepConnectors.forEach((line, index) => {
              line.classList.remove('active', 'completed');
              if (index < stepNumber - 1) {
                  line.classList.add('completed');
              }
              if (index === stepNumber - 2 && stepNumber > 1) {

              }
          });

        clearMessage(registerMessage);
    }

     function resetRegistrationForm() {
         step1Form.reset();
         step2Form.reset();
         [fullNameInput, regEmailInput, phoneInput, regPasswordInput, confirmPasswordInput, loginEmailInput, loginPasswordInput].forEach(input => input.classList.remove('error'));
         [nameHint, emailHint, phoneHint, passwordHint, confirmHint, loginEmailHint, loginPasswordHint].forEach(hint => {
             hint.textContent = '';
             hint.classList.remove('error');
         });
         passwordHint.textContent = 'Min. 8 chars: upper, lower, number, symbol (!@#$%^&*)';
         strengthMeter.className = 'strength-meter';
         clearMessage(registerMessage);
         clearMessage(loginMessage);
         showRegisterStep(1);
     }

    function validateEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        const regex = /^\+?[\d\s()-]{7,}$/;
        const digitRegex = /\d/g;
        const digits = (phone.match(digitRegex) || []).join('');
        return regex.test(phone) && digits.length >= 7 && digits.length <= 15;
    }

    function validatePasswordStrength(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
        return regex.test(password);
    }

    function checkPasswordStrengthUI(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

        strengthMeter.className = 'strength-meter';
        passwordHint.classList.remove('error');

        if (strength <= 2) {
            strengthMeter.classList.add('strength-weak');
        } else if (strength <= 4) {
            strengthMeter.classList.add('strength-medium');
        } else {
            strengthMeter.classList.add('strength-strong');
        }
    }

    function validateLoginField(inputElement, hintElement, type) {
          const value = inputElement.value.trim();
          let isValid = true;
          let message = '';

          if (value === '') {
              message = 'This field is required';
              isValid = false;
          } else if (type === 'email' && !validateEmail(value)) {
              message = 'Please enter a valid email address';
              isValid = false;
          }

          setFieldState(inputElement, hintElement, message, !isValid);
          return isValid;
    }


    function validateRegisterField(inputElement, hintElement, type) {
        const value = inputElement.value.trim();
        let isValid = true;
        let message = '';

        if (value === '') {
            message = 'This field is required';
            isValid = false;
        } else {
            switch (type) {
                case 'name':
                    if (value.length < 3) {
                        message = 'Name must be at least 3 characters';
                        isValid = false;
                    }
                    break;
                case 'email':
                    if (!validateEmail(value)) {
                        message = 'Please enter a valid email address';
                        isValid = false;
                    }
                    break;
                case 'phone':
                    if (!validatePhone(value)) {
                        message = 'Please enter a valid phone number (e.g., +1 XXX XXX XXXX)';
                        isValid = false;
                    }
                    break;
                case 'password':
                     checkPasswordStrengthUI(inputElement.value);
                    if (!validatePasswordStrength(inputElement.value)) {
                        message = 'Min 8 chars: upper, lower, number, symbol';
                        isValid = false;
                    }
                    break;
                case 'confirmPassword':
                    if (inputElement.value !== regPasswordInput.value) {
                        message = 'Passwords do not match';
                        isValid = false;
                    } else if (inputElement.value === '') {
                         message = 'Please confirm your password';
                        isValid = false;
                    }
                    break;
            }
        }

         setFieldState(inputElement, hintElement, message, !isValid);
         if (type === 'password' && isValid) {
             passwordHint.textContent = 'Strong password!';
             passwordHint.classList.remove('error');
         } else if (type === 'password' && !isValid && value !== '') {
             passwordHint.textContent = message;
             passwordHint.classList.add('error');
         } else if (type === 'password' && value === ''){
             passwordHint.textContent = 'Min. 8 chars: upper, lower, number, symbol (!@#$%^&*)';
             passwordHint.classList.remove('error');
         }

         if (type === 'confirmPassword' && isValid) {
             confirmHint.textContent = '';
             confirmHint.classList.remove('error');
         }

        return isValid;
    }

     function validateStep1Form() {
         const isNameValid = validateRegisterField(fullNameInput, nameHint, 'name');
         const isEmailValid = validateRegisterField(regEmailInput, emailHint, 'email');
         const isPhoneValid = validateRegisterField(phoneInput, phoneHint, 'phone');
         return isNameValid && isEmailValid && isPhoneValid;
     }

     function validateStep2Form() {
         const isPasswordValid = validateRegisterField(regPasswordInput, passwordHint, 'password');
         const isConfirmValid = validateRegisterField(confirmPasswordInput, confirmHint, 'confirmPassword');
         return isPasswordValid && isConfirmValid;
     }

     function validateLoginForm() {
         const isEmailValid = validateLoginField(loginEmailInput, loginEmailHint, 'email');
         const isPasswordValid = validateLoginField(loginPasswordInput, loginPasswordHint, 'password');
         return isEmailValid && isPasswordValid;
     }

    mainTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');

            mainTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            if (tabType === 'login') {
                loginTabContent.classList.add('active');
                registerTabContent.classList.remove('active');
            } else {
                loginTabContent.classList.remove('active');
                registerTabContent.classList.add('active');
                showRegisterStep(1);
            }

            clearMessage(loginMessage);
            clearMessage(registerMessage);
        });
    });

     loginEmailInput.addEventListener('blur', () => validateLoginField(loginEmailInput, loginEmailHint, 'email'));
     loginPasswordInput.addEventListener('blur', () => validateLoginField(loginPasswordInput, loginPasswordHint, 'password'));
     fullNameInput.addEventListener('blur', () => validateRegisterField(fullNameInput, nameHint, 'name'));
     regEmailInput.addEventListener('blur', () => validateRegisterField(regEmailInput, emailHint, 'email'));
     phoneInput.addEventListener('blur', () => validateRegisterField(phoneInput, phoneHint, 'phone'));
     regPasswordInput.addEventListener('blur', () => validateRegisterField(regPasswordInput, passwordHint, 'password'));
     confirmPasswordInput.addEventListener('blur', () => validateRegisterField(confirmPasswordInput, confirmHint, 'confirmPassword'));

     regPasswordInput.addEventListener('input', () => {
          checkPasswordStrengthUI(regPasswordInput.value);
          if (confirmPasswordInput.value) {
              validateRegisterField(confirmPasswordInput, confirmHint, 'confirmPassword');
          }
     });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearMessage(loginMessage);

        if (validateLoginForm()) {
            showMessage(loginMessage, 'Login successful! Redirecting...', false);
            console.log('Login Data:', { email: loginEmailInput.value });
            clearFieldState(loginEmailInput, loginEmailHint);
            clearFieldState(loginPasswordInput, loginPasswordHint);

             setTimeout(() => {
                 console.log("Redirecting...");
                 loginForm.reset();
                 clearMessage(loginMessage);
             }, 1500);

        } else {
            showMessage(loginMessage, 'Please check the fields marked in red.');
        }
    });

    nextToStep2Btn.addEventListener('click', function() {
        clearMessage(registerMessage);
        if (validateStep1Form()) {
            showRegisterStep(2);
        } else {
             showMessage(registerMessage, 'Please correct the errors in Step 1.');
        }
    });

    backToStep1Btn.addEventListener('click', function() {
        showRegisterStep(1);
    });

    submitRegistrationBtn.addEventListener('click', function() {
         clearMessage(registerMessage);
        if (validateStep2Form()) {
            console.log('Registration Data:', {
                fullName: fullNameInput.value.trim(),
                email: regEmailInput.value.trim(),
                phone: phoneInput.value.trim(),
            });

            showRegisterStep(3);

        } else {
            showMessage(registerMessage, 'Please correct the errors in Step 2.');
        }
    });

    goToLoginBtn.addEventListener('click', function() {
        mainTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === 'login') {
                tab.click();
            }
        });
        resetRegistrationForm();
    });

     if (registerTabContent.classList.contains('active')) {
        showRegisterStep(1);
     }

});