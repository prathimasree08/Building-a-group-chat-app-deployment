const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const sequelize = require('./util/database')
var cors = require('cors');
require('dotenv').config();
const AWS = require('aws-sdk');


const cron = require('node-cron');
const archiveChat = require('./cron/archiveChatCron');

// Run the archiveChat job every night at 1:00 AM
cron.schedule('0 1 * * *', () => {
  archiveChat();
});


const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

AWS.config.update({
  accessKeyId: process.env.IAM_USER_KEY,
  secretAccessKey: process.env.IAM_USER_SECRET
});

const s3 = new AWS.S3();

const io = require('socket.io')(4000,{
    cors:{
        origin: ["http://127.0.0.1:5500","https://admin.socket.io"],
        credentials: true
    }
})


io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('joinRoom', (groupId) => {
      socket.join(groupId);
    });
  
    socket.on('sendChat', async(data) => {
      const messageData = {
        groupId: data.groupId,
        userName: data.userName,
        message: data.message
      };
      if (data.file) {
        const fileData = {
          fileName: data.file.name,
          fileType: data.file.type,
          fileSize: data.file.size,
          fileBuffer: data.file.buffer
        };
        if (!data.file.buffer || data.file.buffer.length === 0) {
          return console.error('File is empty or not found');
        }
        messageData.file = fileData;
    
        const s3Params = {
          Bucket: process.env.BUCKET,
          Key: `File${new Date().toJSON()}.jpg`,
          Body: Buffer.from(data.file.buffer) ,
          ContentType: data.file.type,
          ACL: 'public-read'
        };
        const s3Result = await s3.upload(s3Params).promise();
        // console.log(s3Result);
        const chat = await Chat.create({
          message: s3Result.Location,
          userId: data.userId,
          groupId: data.groupId
        })
        console.log(chat)
    
        fileData.fileUrl = s3Result.Location;
        messageData.fileData
      }
    
      io.in(data.groupId).emit('newChat', messageData);
    });
  })
    

const userRoutes = require('./router/user');
const chatRoutes = require('./router/chat');
const groupRoutes = require('./router/group');

const User = require('./models/user');
const Chat = require('./models/chats');
const Group = require('./models/group');
const UserGroups = require('./models/groupUser');


app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.use((req, res) => {
    res.sendFile(path.join(__dirname, `Public/${req.url}`))
})


User.belongsToMany(Group, { through: UserGroups, foreignKey: 'userId' });
Group.belongsToMany(User, { through: UserGroups, foreignKey: 'groupId' });

Group.hasMany(Chat, { foreignKey: 'groupId' });
Chat.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(User, { foreignKey: 'userId' });




sequelize
// .sync({force: true})
.sync()
.then(result =>{
    // console.log(result);
    app.listen(process.env.PORT || 3000);
})
.catch(err =>{
    console.log(err);
});

async function authenticate() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
 authenticate();
