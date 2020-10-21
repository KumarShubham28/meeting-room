'use strict';
module.exports = (sequelize, Sequelize) => {
  const user_role = sequelize.define("user_role", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: "user"
    },
  }
  );
  return user_role;
}