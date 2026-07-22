"use strict";
module.exports = (sequelize, Sequelize) => {
  const StageHistory = sequelize.define(
    "StageHistory",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      opportunityId: { type: Sequelize.BIGINT, allowNull: false },
      stage: { type: Sequelize.STRING, allowNull: false }, // C1, C2, C3, C4
      note: { type: Sequelize.TEXT, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  StageHistory.associate = function (models) {
    StageHistory.belongsTo(models.Opportunity, {
      foreignKey: "opportunityId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return StageHistory;
};