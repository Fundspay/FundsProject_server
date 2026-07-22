"use strict";
module.exports = (sequelize, Sequelize) => {
  const Journey = sequelize.define(
    "Journey",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      opportunityId: { type: Sequelize.BIGINT, allowNull: false, unique: true }, // one journey record per opportunity

      stage: { type: Sequelize.STRING, allowNull: false, defaultValue: "C1" }, // C1, C2, C3, C4
      meetingOutcome: { type: Sequelize.STRING, allowNull: true, defaultValue: "Neutral" }, // Positive, Neutral, Negative
      demoStatus: { type: Sequelize.STRING, allowNull: true, defaultValue: "Pending" }, // Pending, Scheduled, Completed
      reqClarity: { type: Sequelize.STRING, allowNull: true, defaultValue: "Pending" }, // Pending, Partial, Complete
      probability: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, // 0-100
      riskLevel: { type: Sequelize.STRING, allowNull: true, defaultValue: "Medium" }, // Low, Medium, High
      proposalRequired: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      nextAction: { type: Sequelize.STRING, allowNull: true },
      nextActionDate: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Journey.associate = function (models) {
    Journey.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
    Journey.belongsTo(models.Opportunity, {
      foreignKey: "opportunityId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return Journey;
};