"use strict";
module.exports = (sequelize, Sequelize) => {
  const OperationalActivity = sequelize.define(
    "OperationalActivity",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      businessProcessId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  OperationalActivity.associate = function (models) {
    OperationalActivity.belongsTo(models.BusinessProcess, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return OperationalActivity;
};