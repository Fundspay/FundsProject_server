"use strict";
module.exports = (sequelize, Sequelize) => {
  const BusinessOpportunity = sequelize.define(
    "BusinessOpportunity",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      automationOpportunities: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      decisionMakers: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      buyingBehaviour: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      businessLocations: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] }, // [{label, cat}]

      opportunityScore: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      opportunityScoreIsAuto: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },

      additionalNotes: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  BusinessOpportunity.associate = function (models) {
    BusinessOpportunity.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });

    BusinessOpportunity.hasMany(models.PainPoint, {
      foreignKey: "businessOpportunityId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return BusinessOpportunity;
};