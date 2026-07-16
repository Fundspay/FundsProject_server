"use strict";
module.exports = (sequelize, Sequelize) => {
  const MarketInformation = sequelize.define(
    "MarketInformation",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      technologiesUsed: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      erpCrmSystems: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] }, // [{label, cat}]

      digitalAdoptionLevel: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },

      governmentPolicies: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      marketTrends: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  MarketInformation.associate = function (models) {
    MarketInformation.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });

    MarketInformation.hasMany(models.Competitor, {
      foreignKey: "marketInformationId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    MarketInformation.hasMany(models.IndustryPlayer, {
      foreignKey: "marketInformationId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    MarketInformation.hasMany(models.ResearchReference, {
      foreignKey: "marketInformationId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return MarketInformation;
};