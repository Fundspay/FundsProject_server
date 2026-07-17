"use strict";
module.exports = (sequelize, Sequelize) => {
  const ObjectionHandling = sequelize.define(
    "ObjectionHandling",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      objection: { type: Sequelize.STRING, allowNull: false },
      response: { type: Sequelize.TEXT, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  ObjectionHandling.associate = function (models) {
    ObjectionHandling.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return ObjectionHandling;
};