"use strict";
module.exports = (sequelize, Sequelize) => {
  const Proposal = sequelize.define(
    "Proposal",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },
      opportunityId: { type: Sequelize.BIGINT, allowNull: false, unique: true }, // one active proposal record per opportunity

      proposalNumber: { type: Sequelize.STRING, allowNull: false, unique: true }, // PROP-YYYY-NNN
      version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 }, // stored as int, displayed as "V1"

      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "On Hold" }, // On Hold, Won, Lost, Cancelled

      // ── Financials ──
      finalDealValue: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      dealCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "INR" },
      discountPercent: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      advancePayment: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      advanceCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "INR" },

      // ── Notes ──
      negotiationNotes: { type: Sequelize.TEXT, allowNull: true },
      paymentTerms: { type: Sequelize.TEXT, allowNull: true },

      // ── Documents (each: [{name, url, size}]) ──
      proposalDocs: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },
      quotationDocs: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },
      contractDocs: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },
      ndaDocs: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },
      poDocs: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },

      // ── Handover ──
      handedOverToBuild: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      buildProjectId: { type: Sequelize.STRING, allowNull: true },
      handedOverAt: { type: Sequelize.DATE, allowNull: true },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Proposal.associate = function (models) {
    Proposal.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
    Proposal.belongsTo(models.Opportunity, {
      foreignKey: "opportunityId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return Proposal;
};