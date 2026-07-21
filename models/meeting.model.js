"use strict";
module.exports = (sequelize, Sequelize) => {
  const Meeting = sequelize.define(
    "Meeting",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      // ── Meeting Details ──
      title: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false, defaultValue: "Online" }, // Online, Offline, Demo, Discovery, Follow-up, Workshop
      date: { type: Sequelize.DATE, allowNull: false },
      followupDate: { type: Sequelize.DATE, allowNull: true },

      // ── Participants (snapshot of names; not FK-linked to Stakeholder for simplicity) ──
      participants: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      // ── Agenda & Minutes ──
      agenda: { type: Sequelize.TEXT, allowNull: true },
      minutes: { type: Sequelize.TEXT, allowNull: true },
      actionItems: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      // ── Recording & Documents ──
      recordingUrl: { type: Sequelize.STRING, allowNull: true },
      documents: { type: Sequelize.JSONB, allowNull: true, defaultValue: [] }, // [{name, url, size}]

      // ── Status ──
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "Upcoming" }, // Upcoming, Completed, Cancelled, Rescheduled

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  Meeting.associate = function (models) {
    Meeting.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return Meeting;
};