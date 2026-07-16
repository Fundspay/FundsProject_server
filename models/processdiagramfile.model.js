"use strict";
module.exports = (sequelize, Sequelize) => {
  const ProcessDiagramFile = sequelize.define(
    "ProcessDiagramFile",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      businessProcessId: { type: Sequelize.BIGINT, allowNull: false },
      fileName: { type: Sequelize.STRING, allowNull: false },
      fileUrl: { type: Sequelize.STRING, allowNull: false }, // S3 URL after upload
      fileSize: { type: Sequelize.INTEGER, allowNull: true }, // bytes
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  ProcessDiagramFile.associate = function (models) {
    ProcessDiagramFile.belongsTo(models.BusinessProcess, {
      foreignKey: "businessProcessId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return ProcessDiagramFile;
};