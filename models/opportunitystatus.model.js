"use strict";
module.exports = (sequelize, Sequelize) => {
  const OpportunityStatus = sequelize.define(
    "OpportunityStatus",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Active" }, // Active, On Hold, Closed
      assignedPM: { type: Sequelize.STRING, allowNull: true },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  OpportunityStatus.associate = function (models) {
    OpportunityStatus.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return OpportunityStatus;
};