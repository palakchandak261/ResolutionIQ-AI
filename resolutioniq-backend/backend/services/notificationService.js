const Notification = require("../models/Notification");

async function notify(userId, { title, message, type = "system", relatedComplaint = null }) {
  return Notification.create({ user: userId, title, message, type, relatedComplaint });
}

module.exports = { notify };
