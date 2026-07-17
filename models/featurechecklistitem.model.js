"use strict";
module.exports = (sequelize, Sequelize) => {
  const FeatureChecklistItem = sequelize.define(
    "FeatureChecklistItem",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      text: { type: Sequelize.STRING, allowNull: false },
      done: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  FeatureChecklistItem.associate = function (models) {
    FeatureChecklistItem.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return FeatureChecklistItem;
};