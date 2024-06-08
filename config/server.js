module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "6f7d9b9f9a7f4e8b8c7d8d7e8f7g7h7i"),
    },
  },
  io: {
    enabled: true,
    sockets: {
      cors: {
        origin: "*",
      },
    },
  },
});
