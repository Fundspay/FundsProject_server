"use strict";
module.exports = (sequelize, Sequelize) => {
  const EngagementScore = sequelize.define(
    "EngagementScore",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      overallScore: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      communicationQuality: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      responseRate: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      activityFrequency: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      lastCalculatedAt: { type: Sequelize.DATE, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  EngagementScore.associate = function (models) {
    EngagementScore.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return EngagementScore;
};