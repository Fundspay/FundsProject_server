"use strict";
module.exports = (sequelize, Sequelize) => {
  const Opportunity = sequelize.define(
    "Opportunity",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      // ── Identity ──
      opportunityCode: { type: Sequelize.STRING, allowNull: false, unique: true }, // e.g. OPP-2026-001
      name: { type: Sequelize.STRING, allowNull: false },
      contactName: { type: Sequelize.STRING, allowNull: true },

      // ── Solution & Description ──
      solutions: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] }, // ERP, CRM, HRMS, etc.
      description: { type: Sequelize.TEXT, allowNull: true },

      // ── Financials ──
      estimatedBudget: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      budgetCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "INR" },
      estimatedRevenue: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      revenueCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "INR" },

      // ── Timeline & Source ──
      expectedTimeline: { type: Sequelize.STRING, allowNull: true, defaultValue: "3 Months" },
      source: { type: Sequelize.STRING, allowNull: true }, // LinkedIn, Apollo, Referral, Website, Event, Cold Call, Upwork, Fiverr, Google
      owner: { type: Sequelize.STRING, allowNull: true },

      // ── Status ──
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Active" }, // Active, On Hold, Lost, Won

      // ── Attachments ──
      attachments: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] }, // [{name, url, size}]

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Opportunity.associate = function (models) {
    Opportunity.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return Opportunity;
};