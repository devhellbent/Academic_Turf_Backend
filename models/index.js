const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

// Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: process.env.DB_PORT,
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.message);
  });

// DB object
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model')(sequelize, Sequelize);
db.certificate = require('./certificate.model')(sequelize, Sequelize);
db.experience = require('./experience.model')(sequelize, Sequelize);
db.postRequirement = require('./postRequirement')(sequelize, Sequelize);
// Sync models
db.sequelize.sync(); // This will create the tables if they don't exist

module.exports = db;
