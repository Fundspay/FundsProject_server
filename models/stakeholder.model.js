"use strict";
module.exports = (sequelize, Sequelize) => {
  const Stakeholder = sequelize.define(
    "Stakeholder",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      // ── Contact Information ──
      photoUrl: { type: Sequelize.STRING, allowNull: true },
      contactName: { type: Sequelize.STRING, allowNull: false },
      designation: { type: Sequelize.STRING, allowNull: false },
      department: { type: Sequelize.STRING, allowNull: false },
      decisionLevel: { type: Sequelize.STRING, allowNull: false },
      reportsTo: { type: Sequelize.STRING, allowNull: true },
      relationshipSince: { type: Sequelize.DATEONLY, allowNull: true },

      // ── Contact Numbers ──
      mobileCountryCode: { type: Sequelize.STRING, allowNull: true, defaultValue: "+91" },
      mobileNumber: { type: Sequelize.STRING, allowNull: false },
      altMobileCountryCode: { type: Sequelize.STRING, allowNull: true },
      altMobileNumber: { type: Sequelize.STRING, allowNull: true },
      whatsappCountryCode: { type: Sequelize.STRING, allowNull: true },
      whatsappNumber: { type: Sequelize.STRING, allowNull: true },

      // ── Emails & Links ──
      officialEmail: { type: Sequelize.STRING, allowNull: false },
      personalEmail: { type: Sequelize.STRING, allowNull: true },
      linkedinProfile: { type: Sequelize.STRING, allowNull: true },

      // ── Preferences ──
      communicationPreferences: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      bestTimeToContact: { type: Sequelize.STRING, allowNull: true },
      preferredLanguage: { type: Sequelize.STRING, allowNull: true, defaultValue: "English" },
      birthday: { type: Sequelize.DATEONLY, allowNull: true },

      // ── Assistant ──
      assistantName: { type: Sequelize.STRING, allowNull: true },
      assistantContact: { type: Sequelize.STRING, allowNull: true },
      assistantEmail: { type: Sequelize.STRING, allowNull: true },

      // ── Tags, Notes, Attachments ──
      tags: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      internalNotes: { type: Sequelize.TEXT, allowNull: true },
      attachments: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] },

      // ── Status ──
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Active" },
      isPrimaryContact: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Stakeholder.associate = function (models) {
    Stakeholder.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return Stakeholder;
};