"use strict";
module.exports = (sequelize, Sequelize) => {
  const Department = sequelize.define(
    "Department",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      businessProcessId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      head: { type: Sequelize.STRING, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Department.associate = function (models) {
    Department.belongsTo(models.BusinessProcess, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return Department;
};