"use strict";
module.exports = (sequelize, Sequelize) => {
  const AimProjectStatus = sequelize.define(
    "AimProjectStatus",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false, unique: true },
      projectCode: { type: Sequelize.STRING, allowNull: false, unique: true }, // AIM-YYYY-NNN
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Active" }, // Active, On Hold, Closed
      currentStage: { type: Sequelize.STRING, allowNull: false, defaultValue: "Analysis" }, // Analysis, Interaction, Opportunity, BUILD
      assignedPM: { type: Sequelize.STRING, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  AimProjectStatus.associate = function (models) {
    AimProjectStatus.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return AimProjectStatus;
};