"use strict";
module.exports = (sequelize, Sequelize) => {
  const Company = sequelize.define(
    "Company",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyName: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      state: { type: Sequelize.STRING, allowNull: true },
      country: { type: Sequelize.STRING, allowNull: true, defaultValue: "India" },
      pincode: { type: Sequelize.STRING, allowNull: true },
      gstNumber: { type: Sequelize.STRING, allowNull: true },
      panNumber: { type: Sequelize.STRING, allowNull: true },
      website: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "active" },
      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Company.associate = function (models) {
    // Example, once you have related models:
    // Company.hasMany(models.Employee, {
    //   foreignKey: "companyId",
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // });
  };

  return Company;
};