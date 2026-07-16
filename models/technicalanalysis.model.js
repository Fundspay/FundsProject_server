"use strict";
module.exports = (sequelize, Sequelize) => {
  const TechnicalAnalysis = sequelize.define(
    "TechnicalAnalysis",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      existingManualProcess: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      automationOpportunities: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      approvalWorkflow: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      businessRules: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  TechnicalAnalysis.associate = function (models) {
    TechnicalAnalysis.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });

    TechnicalAnalysis.hasMany(models.BusinessProblem, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    TechnicalAnalysis.hasMany(models.FunctionalRequirement, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    TechnicalAnalysis.hasMany(models.NonFunctionalRequirement, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    TechnicalAnalysis.hasMany(models.RequiredReport, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    TechnicalAnalysis.hasMany(models.TechnicalAttachment, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return TechnicalAnalysis;
};