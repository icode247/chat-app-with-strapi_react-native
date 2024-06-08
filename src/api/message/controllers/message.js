"use strict";

/**
 * message controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::message.message");

module.exports = createCoreController("api::message.message", ({ strapi }) => ({
  async getMessages(ctx) {
    const { friendId, userId } = ctx.query;

    const entry = await strapi.entityService.findOne(
      "api::message.message",
      1,
      {
        populate: "*",
        _or: [
          { sender: friendId, recipient: userId },
          { sender: userId, recipient: friendId },
        ],
        _sort: "created_at:DESC",
      }
    );
  },
}));
