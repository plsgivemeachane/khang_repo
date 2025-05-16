module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      {
        name: 'Admin',
        description: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'User',
        description: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Seller',
        description: 'Seller',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {});
  },
};