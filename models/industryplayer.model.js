"use strict";
module.exports = (sequelize, Sequelize) => {
  const IndustryPlayer = sequelize.define(
    "IndustryPlayer",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      marketInformationId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      industrySegment: { type: Sequelize.STRING, allowNull: true },
      marketPresence: { type: Sequelize.STRING, allowNull: true },
      keyProducts: { type: Sequelize.STRING, allowNull: true },
      website: { type: Sequelize.STRING, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  IndustryPlayer.associate = function (models) {
    IndustryPlayer.belongsTo(models.MarketInformation, {
      foreignKey: "marketInformationId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return IndustryPlayer;
};