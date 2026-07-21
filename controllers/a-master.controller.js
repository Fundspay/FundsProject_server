"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

function calcCompletion(record, fields) {
  if (!record) return 0;
  let filled = 0;
  fields.forEach((f) => {
    const val = record[f];
    if (Array.isArray(val)) { if (val.length > 0) filled++; }
    else if (val !== null && val !== undefined && val !== "") filled++;
  });
  return Math.round((filled / fields.length) * 100);
}

var getDashboard = async function (req, res) {
  try {
    const { companyId } = req.params;
    if (!companyId) return ReE(res, "companyId is required", 400);

    const companyRaw = await model.Company.findOne({ where: { id: companyId, isDeleted: false } });
    if (!companyRaw) return ReE(res, "Company not found", 404);
    const company = companyRaw.get({ plain: true });

    const stakeholdersRaw = await model.Stakeholder.findAll({ where: { companyId, isDeleted: false } });
    const stakeholders = stakeholdersRaw.map((s) => s.get({ plain: true }));

    const researchRaw = await model.CompanyResearch.findOne({ where: { companyId, isDeleted: false } });
    const research = researchRaw ? researchRaw.get({ plain: true }) : null;

    const a1Fields = ["companyName", "industry", "sector", "businessType", "establishedYear", "employeeCount", "headquarters"];
    const a1Progress = calcCompletion(company, a1Fields);

    const a2Progress = stakeholders.length > 0 ? 100 : 0;
    const primaryContact = stakeholders.find((s) => s.isPrimaryContact) || stakeholders[0] || null;

    const a3Fields = [
      "digitalMaturity", "businessChallenges", "painPoints", "currentSoftwareStack",
      "businessProcessSummary", "technologyGaps", "recommendedSolutions",
      "opportunityValue", "leadTemperature", "qualificationScore", "buyingReadiness",
      "swotAnalysis", "competitors"
    ];
    const a3Progress = calcCompletion(research, a3Fields);

    const overallProgress = Math.round((a1Progress + a2Progress + a3Progress) / 3);

    const dashboard = {
      company: {
        id: company.id,
        name: company.companyName,
        industry: company.industry,
        sector: company.sector,
        businessType: company.businessType,
        established: company.establishedYear,
        employees: company.employeeCount,
        headquarters: company.headquarters,
      },
      progress: { overall: overallProgress, a1: a1Progress, a2: a2Progress, a3: a3Progress },
      a2Summary: {
        totalStakeholders: stakeholders.length,
        primaryContact: primaryContact
          ? { name: primaryContact.contactName, designation: primaryContact.designation, email: primaryContact.officialEmail }
          : null,
        departments: [...new Set(stakeholders.map((s) => s.department).filter(Boolean))],
      },
      a3Summary: research
        ? {
            researchStatus: research.researchStatus,
            digitalMaturity: research.digitalMaturity,
            businessChallenges: research.businessChallenges,
            painPoints: research.painPoints,
            currentSoftwareStack: research.currentSoftwareStack,
            recommendedSolutions: research.recommendedSolutions,
            opportunityValue: research.opportunityValue,
            opportunityCurrency: research.opportunityCurrency,
            leadTemperature: research.leadTemperature,
            qualificationScore: research.qualificationScore,
            buyingReadiness: research.buyingReadiness,
            competitors: research.competitors,
            documentsCount: (research.researchDocuments || []).length,
          }
        : null,
    };

    return ReS(res, dashboard, 200);
  } catch (error) {
    return ReE(res, error.message, 500);
  }
};
module.exports.getDashboard = getDashboard;