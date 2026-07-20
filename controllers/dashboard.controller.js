"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

// ✅ Get full Market Intelligence dashboard for a company
var getDashboard = async function (req, res) {
    try {
        const { companyId } = req.params;
        if (!companyId) return ReE(res, "companyId is required", 400);

        const [industryProfileRaw, marketInformationRaw, businessOpportunityRaw] = await Promise.all([
            model.IndustryProfile.findOne({ where: { companyId, isDeleted: false } }),
            model.MarketInformation.findOne({
                where: { companyId, isDeleted: false },
                include: [
                    { model: model.Competitor, where: { isDeleted: false }, required: false },
                    { model: model.IndustryPlayer, where: { isDeleted: false }, required: false },
                    { model: model.ResearchReference, where: { isDeleted: false }, required: false },
                ],
            }),
            model.BusinessOpportunity.findOne({
                where: { companyId, isDeleted: false },
                include: [{ model: model.PainPoint, where: { isDeleted: false }, required: false }],
            }),
        ]);

        // Convert to plain objects to avoid circular structure (Sequelize's include creates a 'parent' back-reference)
        const industryProfile = industryProfileRaw ? industryProfileRaw.get({ plain: true }) : null;
        const marketInformation = marketInformationRaw ? marketInformationRaw.get({ plain: true }) : null;
        const businessOpportunity = businessOpportunityRaw ? businessOpportunityRaw.get({ plain: true }) : null;

        // ── Completion calculation ──
        // M1 fields considered "filled" if key required fields are present
        const m1Fields = industryProfile ? [
            industryProfile.sector, industryProfile.subSector, industryProfile.businessType,
            industryProfile.industryOverview, industryProfile.businessModels?.length,
            industryProfile.marketSizeValue, industryProfile.revenueMin, industryProfile.targetCustomers?.length,
        ] : [];
        const m1Filled = m1Fields.filter(Boolean).length;
        const m1Total = 8;

        const m2Fields = marketInformation ? [
            marketInformation.Competitors?.length, marketInformation.IndustryPlayers?.length,
            marketInformation.technologiesUsed?.length, marketInformation.erpCrmSystems?.length,
            marketInformation.digitalAdoptionLevel, marketInformation.governmentPolicies,
            marketInformation.marketTrends, marketInformation.ResearchReferences?.length,
        ] : [];
        const m2Filled = m2Fields.filter(Boolean).length;
        const m2Total = 8;

        const m3Fields = businessOpportunity ? [
            businessOpportunity.PainPoints?.length, businessOpportunity.automationOpportunities,
            businessOpportunity.decisionMakers?.length, businessOpportunity.buyingBehaviour,
            businessOpportunity.businessLocations?.length, businessOpportunity.opportunityScore,
        ] : [];
        const m3Filled = m3Fields.filter(Boolean).length;
        const m3Total = 6;

        const totalFilled = m1Filled + m2Filled + m3Filled;
        const totalFields = m1Total + m2Total + m3Total;
        const completionPercentage = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

        // ── Documents count (from M2 research references with fileUrl) ──
        const documentsUploaded = (marketInformation?.ResearchReferences || []).filter(r => r.fileUrl).length;

        // ── Last updated (most recent updatedAt among the three) ──
        const timestamps = [industryProfile?.updatedAt, marketInformation?.updatedAt, businessOpportunity?.updatedAt]
            .filter(Boolean)
            .map(d => new Date(d).getTime());
        const lastUpdated = timestamps.length ? new Date(Math.max(...timestamps)) : null;

        return ReS(res, {
            companyId: parseInt(companyId),
            stats: {
                m1Count: 4,
                m2Count: 4,
                m3Count: 4,
                totalWidgets: 15,
                completionPercentage,
                documentsUploaded,
                lastUpdated,
            },
            industryProfile: industryProfile || null,
            marketInformation: marketInformation || null,
            businessOpportunity: businessOpportunity || null,
        }, 200);
    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.getDashboard = getDashboard;