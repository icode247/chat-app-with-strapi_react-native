module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/messages/custom',
        handler: 'api::message.custom-message.fetchMessages',
        config: {
          auth: false,  // Change to true if authentication is required
        },
      },
    ],
  };
  