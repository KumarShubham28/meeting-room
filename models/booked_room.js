'use strict';
module.exports = (sequelize, Sequelize) => {
  const booked_room = sequelize.define("booked_room", {
    startHour: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    endHour: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    purpose: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }
  );
  booked_room.associate =(models) => {
    booked_room.belongsTo(models.room, {
      foreignKey: 'room_id',
      onDelete: 'CASCADE',
    })
  }
  return booked_room;
}