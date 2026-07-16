"use strict";
module.exports = (sequelize, Sequelize) => {
  const TechnicalArchitecture = sequelize.define(
    "TechnicalArchitecture",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      existingSoftware: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      currentDatabase: { type: Sequelize.STRING, allowNull: true },
      currentHosting: { type: Sequelize.STRING, allowNull: true },
      technicalChallenges: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      recommendedModules: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      aiRecommendations: { type: Sequelize.TEXT, allowNull: true },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  TechnicalArchitecture.associate = function (models) {
    TechnicalArchitecture.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });

    TechnicalArchitecture.hasMany(models.ThirdPartyIntegration, {
      foreignKey: "technicalArchitectureId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    TechnicalArchitecture.hasMany(models.TechnicalRisk, {
      foreignKey: "technicalArchitectureId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    TechnicalArchitecture.hasMany(models.ReferenceDocument, {
      foreignKey: "technicalArchitectureId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return TechnicalArchitecture;
};