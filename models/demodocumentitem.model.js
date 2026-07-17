"use strict";
module.exports = (sequelize, Sequelize) => {
  const DemoDocumentItem = sequelize.define(
    "DemoDocumentItem",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false }, // e.g. demo_dashboard, demo_videos, sample_screens, etc.
      docType: { type: Sequelize.ENUM("file", "url"), allowNull: false, defaultValue: "url" },
      name: { type: Sequelize.STRING, allowNull: true },
      url: { type: Sequelize.STRING, allowNull: false },
      fileSize: { type: Sequelize.INTEGER, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  DemoDocumentItem.associate = function (models) {
    DemoDocumentItem.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return DemoDocumentItem;
};