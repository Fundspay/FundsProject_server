"use strict";
module.exports = (sequelize, Sequelize) => {
  const BusinessProcess = sequelize.define(
    "BusinessProcess",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      businessWorkflow: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      currentBusinessProcess: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      departmentDependencies: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      additionalNotes: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML

      diagramUrls: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  BusinessProcess.associate = function (models) {
    BusinessProcess.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });

    BusinessProcess.hasMany(models.Department, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    BusinessProcess.hasMany(models.OperationalActivity, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    BusinessProcess.hasMany(models.ExistingReport, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    BusinessProcess.hasMany(models.ProcessDiagramFile, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return BusinessProcess;
};