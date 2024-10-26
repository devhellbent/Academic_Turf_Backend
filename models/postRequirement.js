// postRequirement.model.js
module.exports = (sequelize, Sequelize) => {
  const PostRequirement = sequelize.define("PostRequirement", {
      id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
      },
      location: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      phoneNumber: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      lookingFor: {
          type: Sequelize.STRING,
      },
      skills: {
          type: Sequelize.TEXT,
      },
      requirementDescription: {
          type: Sequelize.TEXT,
      },
      meetingPreference: {
          type: Sequelize.STRING,
      },
      budget: {
          type: Sequelize.DECIMAL(10, 2),
      },
      currency: {
          type: Sequelize.STRING,
      },
      preferredGender: {
          type: Sequelize.STRING,
      },
      language: {
          type: Sequelize.STRING,
      },
      file: {
          type: Sequelize.STRING,
      },
      userId: {
          type: Sequelize.STRING,  // Kept as a simple string
          allowNull: false,        // Not null constraint
      },
  }, {
      timestamps: true, // Automatically add createdAt and updatedAt timestamps
  });

  return PostRequirement;
};
