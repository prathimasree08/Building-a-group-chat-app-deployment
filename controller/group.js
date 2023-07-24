const User = require('../models/user');
const Chat = require('../models/chats');
const Group = require('../models/group');
const UserGroups = require('../models/groupUser');
const sequelize = require('../util/database');

exports.getGroup = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
        include: [
          {
            model: Group,
            through: {
              model: UserGroups,
            }
        }
    ]
})
        // console.log(user.groups)
        res.json(user.groups)
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

exports.postGroup = async (req, res, next) => {
  const groupName = req.body.name;
  const userId = req.user.id;
  console.log(groupName)
  try {
    const group = await Group.create({
      name: groupName,
      admin: userId,
    });

    await group.addUser(userId, {
      through: {
        admin: true,
      },
    });

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

exports.getUser = async (req, res, next) => {
  const groupId = req.params.groupId;

  try {
    const users = await User.findAll({
      include: [
        {
          model: Group,
          where: { id: groupId },
          attributes: [],
          through: {
            attributes: []
          }
        }
      ],
      attributes: ['id', 'name']
    });
    // console.log(users)
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error getting users' });
  }
};