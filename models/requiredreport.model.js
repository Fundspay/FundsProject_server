"use strict";
module.exports = (sequelize, Sequelize) => {
  const RequiredReport = sequelize.define(
    "RequiredReport",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      technicalAnalysisId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: true },
      frequency: {
        type: Sequelize.ENUM("Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "On-Demand"),
        allowNull: true,
      },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  RequiredReport.associate = function (models) {
    RequiredReport.belongsTo(models.TechnicalAnalysis, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return RequiredReport;
};