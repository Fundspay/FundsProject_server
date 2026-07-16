"use strict";
module.exports = (sequelize, Sequelize) => {
  const ResearchReference = sequelize.define(
    "ResearchReference",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      marketInformationId: { type: Sequelize.BIGINT, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      source: { type: Sequelize.STRING, allowNull: true },
      url: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      fileUrl: { type: Sequelize.STRING, allowNull: true }, // for uploaded documents
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  ResearchReference.associate = function (models) {
    ResearchReference.belongsTo(models.MarketInformation, {
      foreignKey: "marketInformationId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return ResearchReference;
};