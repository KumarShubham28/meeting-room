'use strict';
module.exports = (sequelize, Sequelize) => {
  const user = sequelize.define("user", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  }
  );
  return user;
}