const signIn = document.getElementById('signIn');
const signUp = document.getElementById('signUp');
const signInContainer = document.querySelector('#modal-login-container');
const closeBtn = document.querySelectorAll('.close-login-modal');
const overlayModal = document.querySelector('.modal .fade .show');
const userAsset = document.querySelector('#user-asset');
const formatNumer = document.querySelectorAll('.format-number');
const formSubmit = document.querySelectorAll('.formSubmit');
const btn_pagination = document.querySelectorAll('[button-pagination]');

if (formSubmit) {
  formSubmit.forEach((item) => {
    console.log(' formSubmit.forEach ~ item:', item);
    const buttonSubmit = item.querySelector('.btn-submit');
    console.log(' formSubmit.forEach ~ buttonSubmit:', buttonSubmit);
    item.addEventListener('submit', function (e) {
      e.preventDefault();
      buttonSubmit.textContent = 'Loading...';
      buttonSubmit.disabled = true;
      item.submit();
    });
  });
}
if (formatNumer) {
  formatNumer.forEach((item) => {
    item.textContent = item.textContent.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  });
}
// covert userAsset *000 => *,000
if (userAsset) {
  userAsset.textContent = userAsset.textContent.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ','
  );
}
if (signUp) {
  signUp.addEventListener('click', () => {
    signInContainer.classList.add('right-panel-active');
  });
}
if (signIn) {
  signIn.addEventListener('click', () => {
    signInContainer.classList.remove('right-panel-active');
  });
}
if (closeBtn) {
  closeBtn.forEach((item) => {
    item.addEventListener('click', () => {
      signInContainer.classList.remove('right-panel-active');
    });
  });
}
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
    console.log(' formRegister.addEventListener ~ response:', response);

    const result = await response.json();
    console.log(' formRegister.addEventListener ~ result:', result);
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
        text: result.message || 'Có lỗi xảy ra',
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
      text: error.message || 'Có lỗi xảy ra',
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
$(document).ready(function () {
  const defaultSrc = $('#main-image').attr('src');
  let imageChanged = false;

  // Click vào ảnh phụ -> đổi ảnh chính
  $('.sub-image').on('click', function (e) {
    e.stopPropagation(); // tránh bị trigger click trên body
    const newSrc = $(this).attr('src');
    $('#main-image').attr('src', newSrc);
    imageChanged = true;
  });

  // Click ra ngoài (body) -> trả về ảnh ban đầu
  $('body').on('click', function () {
    if (imageChanged) {
      $('#main-image').attr('src', defaultSrc);
      imageChanged = false;
    }
  });

  // Ngăn click trong vùng ảnh chính không reset
  $('#main-image').on('click', function (e) {
    e.stopPropagation();
  });
  const scrollAmount = 200; // px
  const $list = $('.list_image');

  $('.prev-thumb').on('click', function () {
    $list.animate({ scrollLeft: $list.scrollLeft() - scrollAmount }, 300);
  });

  $('.next-thumb').on('click', function () {
    $list.animate({ scrollLeft: $list.scrollLeft() + scrollAmount }, 300);
  });
  $('.description-content').readmore({
    speed: 300,
    collapsedHeight: 350,
    moreLink: '<a href="#">Xem thêm</a>',
    lessLink: '<a href="#">Thu gọn</a>',
    afterToggle: function (trigger, element, expanded) {
      if (!expanded) {
        // When collapsed (after clicking "Thu gọn")
        element.attr('style', 'overflow: hidden; height: 350px;'); // Add inline style
        $('html, body').animate({ scrollTop: element.offset().top }, 100);
      } else {
        // When expanded (after clicking "Xem thêm")
        element.attr('style', 'overflow: visible;'); // Reset to visible when expanded
        // Remove the hidden content from the DOM
        const hiddenContent = element.find('.readmore-js-collapsed');
        console.log(' hiddenContent:', hiddenContent);
        if (hiddenContent.length) {
          hiddenContent.remove(); // Remove the hidden content
        }
      }
    },
  });
});
