// const { createCoreController } = require("@strapi/strapi").factories;

// module.exports = createCoreController("api::message.message", ({ strapi }) => ({
//   async getMessages(ctx) {
//     const { friendId, userId } = ctx.query;

//     const entry = await strapi.entityService.findOne(
//       "api::message.message",
//       1,
//       {
//         populate: "*",
//         _or: [
//           { sender: friendId, recipient: userId },
//           { sender: userId, recipient: friendId },
//         ],
//         _sort: "created_at:DESC",
//       }
//     );
//   },
// }));

'use strict';

const { sanitize } = require('@strapi/utils');

module.exports = {
  async fetchMessages(ctx) {
    const { friendId, userId } = ctx.query;
    console.log(friendId, userId)

    const messages = await strapi.entityService.findMany('api::message.message', {
      filters: {
        $or: [
          { sender: { id: friendId }, recipient: { id: userId } },
          { sender: { id: userId }, recipient: { id: friendId } }
        ]
      },
      sort: { createdAt: 'desc' },
      populate: '*'
    });
    console.log(messages)
    // @ts-ignore
    return ctx.send(messages);
  }
};

