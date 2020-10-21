'use strict';
module.exports = (sequelize, Sequelize) => {
  const room = sequelize.define("room", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  }
  );
  room.associate = (models) => {
    room.hasMany(models.booked_room, {
      foreignKey: 'room_id',
      as: 'booked_room',
    })
  }
  return room;
}