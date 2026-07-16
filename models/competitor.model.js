"use strict";
module.exports = (sequelize, Sequelize) => {
  const Competitor = sequelize.define(
    "Competitor",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      marketInformationId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      website: { type: Sequelize.STRING, allowNull: true },
      marketPosition: { type: Sequelize.STRING, allowNull: true },
      revenue: { type: Sequelize.STRING, allowNull: true },
      overview: { type: Sequelize.TEXT, allowNull: true },
      headquarters: { type: Sequelize.STRING, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Competitor.associate = function (models) {
    Competitor.belongsTo(models.MarketInformation, {
      foreignKey: "marketInformationId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return Competitor;
};