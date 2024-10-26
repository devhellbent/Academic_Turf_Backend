module.exports = (sequelize, Sequelize) => {
    const Experience = sequelize.define("Experience", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      jobtitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      company: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },    
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    });
  
    Experience.associate = (models) => {
        Experience.belongsTo(models.user, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
    };
  
    return Experience;
  };
  