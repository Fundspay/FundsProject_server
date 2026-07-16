"use strict";
module.exports = (sequelize, Sequelize) => {
  const BusinessProblem = sequelize.define(
    "BusinessProblem",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      technicalAnalysisId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  BusinessProblem.associate = function (models) {
    BusinessProblem.belongsTo(models.TechnicalAnalysis, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return BusinessProblem;
};