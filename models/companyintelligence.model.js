"use strict";
module.exports = (sequelize, Sequelize) => {
  const CompanyIntelligence = sequelize.define(
    "CompanyIntelligence",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      // ── Company Identity ──
      companyName: { type: Sequelize.STRING, allowNull: false },
      website: { type: Sequelize.STRING, allowNull: true },
      logoUrl: { type: Sequelize.STRING, allowNull: true }, // S3 URL after upload

      // ── Business Classification ──
      industry: { type: Sequelize.STRING, allowNull: false },
      sector: { type: Sequelize.STRING, allowNull: true },
      subSector: { type: Sequelize.STRING, allowNull: true },
      businessType: { type: Sequelize.STRING, allowNull: true },

      // ── Company Overview ──
      overview: { type: Sequelize.TEXT, allowNull: true },

      // ── Quantitative Data ──
      yearEstablished: { type: Sequelize.INTEGER, allowNull: true },
      employeeStrength: { type: Sequelize.INTEGER, allowNull: true },
      annualRevenue: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      revenueCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "INR" },
      headquarters: { type: Sequelize.STRING, allowNull: true },

      // ── Dynamic Lists ──
      branchLocations: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      productsServices: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      socialMediaLinks: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      // ── Status & Meta ──
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Draft" },
      owner: { type: Sequelize.STRING, allowNull: true },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  CompanyIntelligence.associate = function (models) {
    CompanyIntelligence.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return CompanyIntelligence;
};