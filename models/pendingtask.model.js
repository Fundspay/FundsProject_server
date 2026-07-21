"use strict";
module.exports = (sequelize, Sequelize) => {
  const PendingTask = sequelize.define(
    "PendingTask",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      text: { type: Sequelize.STRING, allowNull: false },
      isCompleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  PendingTask.associate = function (models) {
    PendingTask.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return PendingTask;
};