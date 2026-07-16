"use strict";
module.exports = (sequelize, Sequelize) => {
  const PainPoint = sequelize.define(
    "PainPoint",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      businessOpportunityId: { type: Sequelize.BIGINT, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      impact: {
        type: Sequelize.ENUM("Low", "Medium", "High"),
        allowNull: false,
        defaultValue: "Medium",
      },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  PainPoint.associate = function (models) {
    PainPoint.belongsTo(models.BusinessOpportunity, {
      foreignKey: "businessOpportunityId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return PainPoint;
};