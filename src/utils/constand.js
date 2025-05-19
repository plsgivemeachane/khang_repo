const MenuDashboard = [
  {
    title: 'Acc game',
    icon: 'fa-solid fa-list',
    subMenu: [
      {
        title: 'Danh sách acc game',
        path: '/admin/acc-game',
      },
      {
        title: 'Thêm sản phẩm',
        path: '/admin/acc-game/tao-moi',
      },
    ],
  },
  {
    title: 'Tool game',
    icon: 'fa-solid fa-list',
    subMenu: [
      {
        title: 'Danh sách tool game',
        path: '/admin/tool-game',
      },
      {
        title: 'Thêm sản phẩm',
        path: '/admin/tool-game/tao-moi',
      },
    ],
  },
  {
    title: 'Đơn hàng',
    icon: 'fa-solid fa-list',
    subMenu: [
      {
        title: 'Danh sách đơn hàng',
        path: '/admin/danh-sach-don-hang',
      },
    
    ],
  },
  {
    title: 'Danh mục',
    icon: 'fa-solid fa-list',
    subMenu: [
      {
        title: 'Danh sách danh mục',
        path: '/admin/danh-muc',
      },
      {
        title: 'Thêm danh mục',
        path: '/admin/danh-muc/tao-moi',
      },
    ],
  },

  {
    title: 'Người dùng',
    icon: 'fa-solid fa-users',
    subMenu: [
      {
        title: 'Danh sách người dùng',
        path: '/admin/nguoi-dung',
      },
      {
        title: 'Thêm người dùng',
        path: '/admin/user/create',
      },
    ],
  },
  {
    title: 'Phân quyền',
    icon: '',
    subMenu: [
      {
        title: 'Danh sách các quyền',
        path: '/admin/role',
      },
      {
        title: 'Thêm quyền',
        path: '/admin/role/tao-moi',
      },
    ],
  },
];
module.exports = {
  MenuDashboard,
};
