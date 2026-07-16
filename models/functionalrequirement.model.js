"use strict";
module.exports = (sequelize, Sequelize) => {
  const FunctionalRequirement = sequelize.define(
    "FunctionalRequirement",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      technicalAnalysisId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      priority: {
        type: Sequelize.ENUM("High", "Medium", "Low"),
        allowNull: false,
        defaultValue: "Medium",
      },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  FunctionalRequirement.associate = function (models) {
    FunctionalRequirement.belongsTo(models.TechnicalAnalysis, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return FunctionalRequirement;
};