"use strict";
module.exports = (sequelize, Sequelize) => {
  const CompanyResearch = sequelize.define(
    "CompanyResearch",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      // ── Research Overview ──
      researchStatus: { type: Sequelize.STRING, allowNull: true, defaultValue: "Not Started" },
      digitalMaturity: { type: Sequelize.STRING, allowNull: true },
      businessKeywords: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      // ── Business Challenges ──
      businessChallenges: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      painPoints: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      // ── Software Stack ──
      currentSoftwareStack: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      customSoftware: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      // ── Business Analysis (rich text) ──
      businessProcessSummary: { type: Sequelize.TEXT, allowNull: true },
      technologyGaps: { type: Sequelize.TEXT, allowNull: true },

      // ── Solutions & Opportunity ──
      recommendedSolutions: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      opportunityValue: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      opportunityCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "INR" },
      leadTemperature: { type: Sequelize.STRING, allowNull: true },
      qualificationScore: { type: Sequelize.INTEGER, allowNull: true },
      buyingReadiness: { type: Sequelize.STRING, allowNull: true },

      // ── SWOT & Competitors ──
      swotAnalysis: { type: Sequelize.TEXT, allowNull: true },
      competitors: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      // ── Documents & References ──
      researchDocuments: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] }, // [{name, url, size}]
      researchReferences: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      internalResearchNotes: { type: Sequelize.TEXT, allowNull: true },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  CompanyResearch.associate = function (models) {
    CompanyResearch.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return CompanyResearch;
};