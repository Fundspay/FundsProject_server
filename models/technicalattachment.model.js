"use strict";
module.exports = (sequelize, Sequelize) => {
  const TechnicalAttachment = sequelize.define(
    "TechnicalAttachment",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      technicalAnalysisId: { type: Sequelize.BIGINT, allowNull: false },
      fileName: { type: Sequelize.STRING, allowNull: false },
      fileUrl: { type: Sequelize.STRING, allowNull: false },
      fileSize: { type: Sequelize.INTEGER, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  TechnicalAttachment.associate = function (models) {
    TechnicalAttachment.belongsTo(models.TechnicalAnalysis, {
      foreignKey: "technicalAnalysisId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return TechnicalAttachment;
};