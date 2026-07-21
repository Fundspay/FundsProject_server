"use strict";
module.exports = (sequelize, Sequelize) => {
  const CommunicationLog = sequelize.define(
    "CommunicationLog",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      // ── Stakeholder link (optional — snapshot name kept in case stakeholder is later deleted) ──
      stakeholderId: { type: Sequelize.BIGINT, allowNull: true },
      contactName: { type: Sequelize.STRING, allowNull: false },

      // ── Communication Details ──
      type: { type: Sequelize.STRING, allowNull: false }, // Email, WhatsApp, Phone Call, SMS, LinkedIn, Teams, Google Meet
      direction: { type: Sequelize.STRING, allowNull: false, defaultValue: "Outbound" }, // Outbound / Inbound
      templateUsed: { type: Sequelize.STRING, allowNull: true },
      subject: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: true },

      // ── Status ──
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Draft" }, // Draft, Sent, Delivered, Read, Replied, Failed

      // ── Attachments ──
      attachments: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] }, // [{name, url, size}]

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  CommunicationLog.associate = function (models) {
    CommunicationLog.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return CommunicationLog;
};