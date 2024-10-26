module.exports = (sequelize, Sequelize) => {
    const Certificate = sequelize.define("Certificate", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      organization: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      expirationDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      image: {
        type: Sequelize.TEXT('long'), // This allows for larger text
        allowNull: true,
      },      
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    });
  
    Certificate.associate = (models) => {
      Certificate.belongsTo(models.user, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
    };
  
    return Certificate;
  };
  