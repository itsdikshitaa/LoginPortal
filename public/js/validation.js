// Client-side form validation

// Validate signup form
function validateSignupForm(form) {
  const username = form.querySelector('#username').value.trim();
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const passwordConfirm = form.querySelector('#passwordConfirm').value;

  // Username validation
  if (username.length < 3) {
    showError('Username must be at least 3 characters long');
    return false;
  }

  if (username.length > 30) {
    showError('Username must not exceed 30 characters');
    return false;
  }

  // Email validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address');
    return false;
  }

  // Password validation
  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return false;
  }

  // Confirm password validation
  if (password !== passwordConfirm) {
    showError('Passwords do not match');
    return false;
  }

  return true;
}

// Validate login form
function validateLoginForm(form) {
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;

  // Email validation
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address');
    return false;
  }

  // Password validation
  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return false;
  }

  return true;
}

// Show error message
function showError(message) {
  alert(message); // Simple alert for client-side validation
}

// Add form validation on submit
document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');

  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      if (!validateSignupForm(this)) {
        e.preventDefault();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      if (!validateLoginForm(this)) {
        e.preventDefault();
      }
    });
  }

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => {
        alert.style.display = 'none';
      }, 300);
    }, 5000);
  });
});
