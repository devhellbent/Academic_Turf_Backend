module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true  // unique constraint on email
        },
        profilePicture: {  
            type: Sequelize.STRING,
            allowNull: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {  // Role stored as a string directly in the user table
            type: Sequelize.STRING,
            defaultValue: "user"
        },
        resetPasswordToken: {
            type: Sequelize.STRING,
            allowNull: true
        },
        resetPasswordExpires: {
            type: Sequelize.DATE,
            allowNull: true
        },
        loginToken: {
            type: Sequelize.STRING,
            allowNull: true
        },
        certificates: {
            type: Sequelize.JSON,
            allowNull: true
        },
        education: {
            type: Sequelize.JSON,
            allowNull: true
        },
        experience: {
            type: Sequelize.JSON,
            allowNull: true
        },
        skills: {
            type: Sequelize.JSON,
            allowNull: true
        },
        designation: {
            type: Sequelize.STRING,
            allowNull: true
        },
        location: {
            type: Sequelize.STRING,
            allowNull: true
        },
        phoneNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },
        experienceYears: {
            type: Sequelize.INTEGER,
            allowNull: true
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['email']  // Ensure email uniqueness
            }
        ]
    });

    return User;
};
