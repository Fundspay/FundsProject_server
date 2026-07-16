"use strict";
module.exports = (sequelize, Sequelize) => {
  const ExistingReport = sequelize.define(
    "ExistingReport",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      businessProcessId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: true },
      frequency: {
        type: Sequelize.ENUM("Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "On-Demand"),
        allowNull: true,
      },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  ExistingReport.associate = function (models) {
    ExistingReport.belongsTo(models.BusinessProcess, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return ExistingReport;
};