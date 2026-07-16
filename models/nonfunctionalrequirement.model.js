"use strict";
module.exports = (sequelize, Sequelize) => {
  const NonFunctionalRequirement = sequelize.define(
    "NonFunctionalRequirement",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      technicalAnalysisId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: true },
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

  NonFunctionalRequirement.associate = function (models) {
    NonFunctionalRequirement.belongsTo(models.TechnicalAnalysis, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return NonFunctionalRequirement;
};