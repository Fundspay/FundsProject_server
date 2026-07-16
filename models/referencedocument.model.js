"use strict";
module.exports = (sequelize, Sequelize) => {
  const ReferenceDocument = sequelize.define(
    "ReferenceDocument",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      technicalArchitectureId: { type: Sequelize.BIGINT, allowNull: false },
      docType: { type: Sequelize.ENUM("file", "url"), allowNull: false, defaultValue: "url" },
      name: { type: Sequelize.STRING, allowNull: true }, // file name (for uploads)
      url: { type: Sequelize.STRING, allowNull: true }, // external URL or S3 URL
      fileSize: { type: Sequelize.INTEGER, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  ReferenceDocument.associate = function (models) {
    ReferenceDocument.belongsTo(models.TechnicalArchitecture, {
      foreignKey: "technicalArchitectureId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return ReferenceDocument;
};