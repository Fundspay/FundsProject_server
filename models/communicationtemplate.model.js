"use strict";
module.exports = (sequelize, Sequelize) => {
  const CommunicationTemplate = sequelize.define(
    "CommunicationTemplate",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false }, // e.g. "email", "whatsapp", "calling", "agenda", "pitch", "intro"
      subtype: { type: Sequelize.STRING, allowNull: true }, // e.g. "cold", "followup", "proposal" (null for pitch/intro)
      content: { type: Sequelize.TEXT, allowNull: true }, // rich text HTML
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  CommunicationTemplate.associate = function (models) {
    CommunicationTemplate.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return CommunicationTemplate;
};