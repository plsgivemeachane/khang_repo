const {Sequelize} = require("sequelize")
const sequelize = new Sequelize('khang', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})
const database=async()=>{
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
module.exports = database