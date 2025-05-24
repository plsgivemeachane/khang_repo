const addInfoDetailBtn = document.getElementById('add-info');
const formControls = document.querySelectorAll('.form-control');
const deleteImageBtn = document.querySelectorAll('.delete-image');
const itemSidebarAdmin = document.querySelectorAll('.item-sidebar-admin');
const btnSubmit = document.querySelector('.btn-submit');
const deleteBtnConfirm = document.querySelectorAll('.delete-btn-confirm');
const formProduct = document.querySelector('.product-form');

if (addInfoDetailBtn) {
  addInfoDetailBtn.addEventListener('click', function () {
    let newRow = document.createElement('div');
    newRow.classList.add('row', 'mb-2', 'info-detail-item');
    newRow.innerHTML = `
        <div class="col-4">
          <input type="text" class="form-control" placeholder="Thông số" />
        </div>
        <div class="col-4">
          <input type="number" class="form-control" placeholder="Nhập giá" />
        </div>
        <div class="col-4 d-flex">
          <input type="text" class="form-control" placeholder="Chi tiết" />
          <button type="button" class="btn btn-danger ms-2 remove-info">Xóa</button>
        </div>
      `;

    document.getElementById('info-detail-list').appendChild(newRow);

    // Thêm sự kiện xóa cho nút "Xóa"
    newRow.querySelector('.remove-info').addEventListener('click', function () {
      newRow.remove();
    });
  });
}

if (deleteImageBtn) {
  deleteImageBtn.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const closestImg = btn.closest('div')?.querySelector('img');
      const closestInput = btn.closest('div').querySelector('input');
      let id = closestInput.getAttribute('data-id');
      let image = btn.getAttribute('data-image');
      let urlData = btn.getAttribute('data-url');

      $.ajax({
        url: `/admin/${urlData}/xoa-anh/${id}`,
        type: 'POST',
        data: { image: image },
        success: function (response) {
          console.log(response);
          closestImg?.remove();
          btn.remove();
        },
        error: function (xhr, status, error) {
          console.log(error);
        },
      });
    });
  });
}

if (itemSidebarAdmin) {
  itemSidebarAdmin.forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const closestDiv = item.closest('div');
      const closetIcon = closestDiv?.querySelector('.icon-sidebar-admin');

      if (closetIcon) {
        if (closetIcon.classList.contains('fa-angle-right')) {
          closetIcon.classList.replace('fa-angle-right', 'fa-angle-down');
        } else {
          closetIcon.classList.replace('fa-angle-down', 'fa-angle-right');
        }
      }
    });
  });
}

if (deleteBtnConfirm) {
  deleteBtnConfirm.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const closestForm = btn.closest('form');

      const check = confirm('Bạn có muốn xóa sản phẩm này không');
      if (check) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        closestForm.submit();
      }
    });
  });
}
$(document).ready(function () {
  const listImageProduct = document.querySelector('.list-image-product');
  const sortTable = document.getElementById('sortable');
  if (listImageProduct) {
    listImageProduct.slick({
      infinite: false, // Tắt tính năng vô hạn để tránh tạo clone
      slidesToShow: 4,
      slidesToScroll: 1,
      prevArrow: $('#prev-slide'),
      nextArrow: $('#next-slide'),
    });
  }

  if (typeof Fancybox !== 'undefined') {
    Fancybox.bind('[data-fancybox="gallery"]:not(.slick-cloned)', {
      Toolbar: {
        display: ['zoom', 'prev', 'next', 'close'],
      },
    });
  }
  // Khi click vào ảnh nhỏ, cập nhật ảnh lớn
  $('.image-product-slide').click(function () {
    var newSrc = $(this).attr('src'); // Lấy ảnh từ thuộc tính src
    $('.image-product').attr('src', newSrc);
    $('.image-product').parent().attr('href', newSrc);

    // Xóa class active khỏi tất cả ảnh nhỏ
    $('.image-product-slide').removeClass('active');

    // Thêm class active vào ảnh được chọn
    $(this).addClass('active');
  });
  if (sortTable) {
    let isSortingEnabled = false; // Biến kiểm tra trạng thái kéo thả

    // Khi nhấn nút "Sắp xếp theo vị trí"
    $('#enableSort').click(function () {
      if (!isSortingEnabled) {
        $('#sortable').sortable('enable'); // Kích hoạt sắp xếp
        // add class to tr
        $('#sortable tr').addClass('sort-product');
        $('#saveOrder').removeClass('d-none'); // Hiện nút "Lưu vị trí"
        $(this)
          .text('🛑 Dừng sắp xếp')
          .removeClass('btn-primary')
          .addClass('btn-danger');
        isSortingEnabled = true;
      } else {
        $('#sortable').sortable('disable'); // Vô hiệu hóa sắp xếp
        $('#saveOrder').addClass('d-none'); // Ẩn nút "Lưu vị trí"
        $(this)
          .text('Sắp xếp theo vị trí')
          .removeClass('btn-danger')
          .addClass('btn-primary');
        isSortingEnabled = false;
      }
    });

    // Kích hoạt jQuery UI Sortable (mặc định disable)
    $('#sortable').sortable({
      disabled: true, // Ban đầu tắt tính năng sắp xếp
      update: function () {
        $('#saveOrder').removeClass('d-none'); // Hiện nút "Lưu vị trí" sau khi kéo thả
      },
    });

    // Khi nhấn "Lưu vị trí"
    $('#saveOrder').click(function () {
      let sortedIds = $('#sortable tr')
        .map(function () {
          return $(this).attr('data-id');
        })
        .get();

      $.ajax({
        url: '/admin/product/update-position',
        type: 'POST',
        data: { sortedIds },
        success: function (response) {
          console.log('✅ Success:', response);
          Toastify({
            text: 'Cập nhật vị trí thành công',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            style: {
              background: '#26e6a3',
            },
          }).showToast();
          location.reload();
        },
        error: function (xhr) {
          console.log(
            '❌ Error:',
            xhr.responseJSON?.message || 'Có lỗi xảy ra'
          );
          Toastify({
            text: xhr.responseJSON?.message || 'Có lỗi xảy ra',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            style: {
              background: '#f7462e',
            },
          }).showToast();
        },
      });
    });
  }
});
const sort = document.querySelector('.sort');
if (sort) {
  const selectedSort = document.querySelector('.select-sort');
  let currentUrl = new URL(window.location.href);
  if (selectedSort) {
    selectedSort.addEventListener('change', function () {
      const selectedValue = this.value;
      const sortBy = selectedValue.split('-')[0];

      const order = selectedValue.split('-')[1];
      // const url = `/admin/product?sortBy=${sortBy}&order=${order}`;
      currentUrl.searchParams.set('sortBy', sortBy);
      currentUrl.searchParams.set('order', order);
      window.location.href = currentUrl.href;
    });
    const restBtn = document.querySelector('#reset');
    restBtn.addEventListener('click', function () {
      currentUrl.searchParams.delete('sortBy');
      currentUrl.searchParams.delete('order');
      window.location.href = currentUrl.href;
    });
    const sortBy = currentUrl.searchParams.get('sortBy');
    const order = currentUrl.searchParams.get('order');
    if (sortBy && order) {
      const querySelector = document.querySelector(
        `option[value="${sortBy}-${order}"]`
      );
      if (querySelector) {
        querySelector.selected = true;
      }
    }
  }
}
const btn_pagination = document.querySelectorAll('[button-pagination]');
if (btn_pagination) {
  btn_pagination.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const page = btn.getAttribute('button-pagination');
      let url = new URL(window.location.href);

      try {
        console.log('btn.addEventListener ~ url:', url);
        if (page === '1') {
          // Xóa tham số "page" nếu đang ở trang 1
          url.searchParams.delete('page');
        } else {
          url.searchParams.set('page', page);
        }
        window.location.href = url.toString();
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
}

(function ($) {
  'use strict';

  // Sidebar toggle
  $('#sidebarToggle, #sidebarToggleTop').on('click', function (e) {
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
    if ($('.sidebar').hasClass('toggled')) {
      $('.sidebar .collapse').collapse('hide');
    }
  });

  // Close collapses on window resize
  $(window).resize(function () {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
    }

    if ($(window).width() < 480 && !$('.sidebar').hasClass('toggled')) {
      $('body').addClass('sidebar-toggled');
      $('.sidebar').addClass('toggled');
      $('.sidebar .collapse').collapse('hide');
    }
  });

  // Prevent the content wrapper from scrolling when the sidebar is hovered over
  $('body.fixed-nav .sidebar').on(
    'mousewheel DOMMouseScroll wheel',
    function (e) {
      if ($(window).width() > 768) {
        var e0 = e.originalEvent;
        var delta = e0.wheelDelta || -e0.detail;
        this.scrollTop += (delta < 0 ? 1 : -1) * 30;
        e.preventDefault();
      }
    }
  );

  // Scroll-to-top button show/hide
  $(document).on('scroll', function () {
    if ($(this).scrollTop() > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scroll when clicking scroll-to-top
  $(document).on('click', 'a.scroll-to-top', function (e) {
    var $anchor = $(this);
    $('html, body')
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr('href')).offset().top,
        },
        1000,
        'easeInOutExpo'
      );
    e.preventDefault();
  });
})(jQuery);
