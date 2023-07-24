
const { Op } = require('sequelize');
const Chat = require('../models/chats');
const ArchivedChat = require('../models/archivedChats');

async function archiveChat() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
  const chats = await Chat.findAll({
    where: {
      createdAt: {
        [Op.lte]: oneDayAgo
      }
    }
  });

  if (chats.length === 0) {
    console.log('No chats to archive.');
    return;
  }

  const archivedChats = chats.map(chat => ({
    message: chat.message,
    userId: chat.userId,
    groupId: chat.groupId,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt
  }));

  await ArchivedChat.bulkCreate(archivedChats);
  await Chat.destroy({
    where: {
      createdAt: {
        [Op.lte]: oneDayAgo
      }
    }
  });

  console.log(`Archived ${chats.length} chats.`);
}

module.exports = archiveChat;