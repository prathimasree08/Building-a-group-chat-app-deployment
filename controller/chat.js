const User = require('../models/user');
const Chat = require('../models/chats');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


exports.postChat = async (req, res, next) => {
  const msg  = req.body.message;
  const userId = req.user.id;
  const groupId = req.params.groupId;
  console.log(groupId)

  try {
    const user = await User.findByPk(userId);
    const name = user.name;
    const chat = await Chat.create({
      message: msg,
      groupId: groupId,
      userId: userId
    });
    const message = chat.message
    res.status(201).json({message, name});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error posting chat' });
  }
};

exports.getChat = async (req, res, next) => {
  const groupId = req.params.groupId;

  try {
    const chats = await Chat.findAll({
      where: { groupId: groupId },

      include: [{ model: User, attributes: ['id', 'name'] }]
    });
    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error getting chat' });
  }
};



/*let lastMessageId = 0;

exports.getNewChat = async (req, res, next) => {
  const groupId = req.params.groupId;

  try {
    const chats = await Chat.findAll({
      where: { groupId: groupId, id: { [Op.gt]: lastMessageId } },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['id', 'ASC']]
    });
    if (chats.length > 0) {
      lastMessageId = chats[chats.length - 1].id;
    }
    res.status(200).json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error getting chat' });
  }
};*/


  