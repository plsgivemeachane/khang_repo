const signIn = document.getElementById('signIn');
const signUp = document.getElementById('signUp');
const signInContainer = document.querySelector('#modal-login-container');
const closeBtn = document.querySelectorAll('.close-login-modal');
const overlayModal = document.querySelector('.modal .fade .show');
const userAsset = document.querySelector('#user-asset');
const formatNumer = document.querySelectorAll('.format-number');
if(formatNumer){
  formatNumer.forEach((item) => {
    item.textContent = item.textContent.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  });
}
// covert userAsset *000 => *,000
if(userAsset){
  userAsset.textContent = userAsset.textContent.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
signUp.addEventListener('click', () => {
  signInContainer.classList.add('right-panel-active');
});
signIn.addEventListener('click', () => {
  signInContainer.classList.remove('right-panel-active');
});
closeBtn.forEach((item) => {
  item.addEventListener('click', () => {
    signInContainer.classList.remove('right-panel-active');
  });
});
if (overlayModal) {
  overlayModal.addEventListener('click', () => {
    signInContainer.classList.remove('right-panel-active');
  });
}

const showPassword = document.querySelectorAll('.show-password');
showPassword.forEach((item) => {
  item.addEventListener('click', () => {
    const input = item.parentElement.querySelector('input');
    if (input.getAttribute('type') === 'password') {
      input.setAttribute('type', 'text');
      // rename fa-eye to fa-eye-slash
      item.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.setAttribute('type', 'password');
      // rename fa-eye-slash to fa-eye
      item.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
});
// Đăng ký
const formRegister = document.querySelector('#formRegister');
formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formRegister);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/tai-khoan/dang-ky', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      Toastify({
        text: 'Đăng ký thành công',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: '#26e6a3',
        },
      }).showToast();
      formRegister.reset();
      document.getElementById('signIn').click(); // chuyển sang tab đăng nhập
    } else {
      Toastify({
        text: 'Có lỗi xảy ra',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: '#f7462e',
        },
      }).showToast();
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    Toastify({
      text: 'Có lỗi xảy ra',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: '#f7462e',
      },
    }).showToast();
  }
});

// Đăng nhập
const formLogin = document.querySelector('#formLogin');
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formLogin);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/tai-khoan/dang-nhap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      Toastify({
        text: 'Đăng nhập thành công',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: '#26e6a3',
        },
      }).showToast();
      window.location.href = '/'; // hoặc redirect đến trang chính
    } else {
      Toastify({
        text: 'Sai email hoặc mật khẩu',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
          background: '#f7462e',
        },
      }).showToast();
    }
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    Toastify({
      text: 'Có lỗi xảy ra',
      duration: 3000,
      gravity: 'top',
      position: 'right',
      style: {
        background: '#f7462e',
      },
    }).showToast();
  }
});
