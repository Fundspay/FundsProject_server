"use strict";
module.exports = (sequelize, Sequelize) => {
  const ThirdPartyIntegration = sequelize.define(
    "ThirdPartyIntegration",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      technicalArchitectureId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  ThirdPartyIntegration.associate = function (models) {
    ThirdPartyIntegration.belongsTo(models.TechnicalArchitecture, {
      foreignKey: "technicalArchitectureId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return ThirdPartyIntegration;
};