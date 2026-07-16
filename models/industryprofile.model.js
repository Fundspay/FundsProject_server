"use strict";
module.exports = (sequelize, Sequelize) => {
  const IndustryProfile = sequelize.define(
    "IndustryProfile",
    {
      id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      companyId: { type: Sequelize.BIGINT, allowNull: false },

      sector: { type: Sequelize.STRING, allowNull: false },
      subSector: { type: Sequelize.STRING, allowNull: false },
      businessType: { type: Sequelize.STRING, allowNull: false },

      industryOverview: { type: Sequelize.TEXT, allowNull: true }, // stores rich text HTML

      businessModels: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },

      marketSizeValue: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      marketSizeUnit: { type: Sequelize.STRING, allowNull: true, defaultValue: "Billions" },
      marketSizeCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "USD" },

      revenueMin: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      revenueMax: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      revenueCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "USD" },

      targetCustomers: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true, defaultValue: [] },
      targetNotes: { type: Sequelize.TEXT, allowNull: true },

      ticketValue: { type: Sequelize.DECIMAL(18, 2), allowNull: true },
      ticketCurrency: { type: Sequelize.STRING, allowNull: true, defaultValue: "USD" },
      ticketFrequency: { type: Sequelize.STRING, allowNull: true, defaultValue: "Per Sale" },

      isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    { timestamps: true }
  );

  IndustryProfile.associate = function (models) {
    IndustryProfile.belongsTo(models.Company, {
      foreignKey: "companyId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return IndustryProfile;
};