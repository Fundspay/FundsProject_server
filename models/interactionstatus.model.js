"use strict";
module.exports = (sequelize, Sequelize) => {
  const InteractionStatus = sequelize.define(
    "InteractionStatus",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Draft" }, // Draft, Active, Follow-up, Completed
      assignedPM: { type: Sequelize.STRING, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  InteractionStatus.associate = function (models) {
    InteractionStatus.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return InteractionStatus;
};