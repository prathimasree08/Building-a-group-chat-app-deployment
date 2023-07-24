const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const UserGroups = require('../models/groupUser');
const Group = require('../models/group')

exports.postSignUpUser = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;
    try{
        const user = await User.findOne({ where:{ email: email }})
        if (user) {
            return res.status(409).json({ error: "User already exists" });
        }
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, async (err, hash)=>{
            if(err){
              console.log(err);  
            }
            const result= await User.create({
                name: name,
                email: email,
                mobile: mobile,
                password: hash
            })
                return res.json(result);
        })
       
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    };
}

function generateToken(id){
    return jwt.sign({userId: id}, 'secretkey')
  }
  
exports.postLoginUser = async (req, res, next) =>{
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Incorrect password' });
        }
        // console.log(res)
        return res.status(200).json({token: generateToken(user.id)});
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };

exports.postAddUser = async (req, res, next) =>{
  const groupId = req.params.groupId;
  const mobile = req.body.mobile
  try{
    const user = await User.findOne({where:{mobile}})
    const userId = user.id
    if(user){
      const userGroup = await UserGroups.create({
        userId: userId,
        groupId: groupId
      })
    
     return res.status(200).json(userGroup)
    }
    res.status(401).json({message: "User not found"})
  }catch(err){
    console.log(err)
  }
}

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  const groupId = req.params.groupId;

  try {
    const numDeletedRows = await UserGroups.destroy({
      where: {
        userId: userId,
        groupId: groupId
      }
    });

    if (numDeletedRows > 0) {
      res.status(200).json({
        message: `User with id ${userId} has been removed from group with id ${groupId}`
      });
    } else {
      res.status(404).json({
        error: `User with id ${userId} is not a member of group with id ${groupId}`
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

exports.getAdmin = async(req, res, next)=>{
  const userId = req.user.id
  const groupId = req.params.groupId;
  try{
    const response = await Group.findOne({where:{id: groupId}});
    // console.log(typeof userId)
    if(parseInt(response.admin) === userId){
     return res.status(200).json(response.admin)
    }
    res.status(201).json({message: "not admin"});
  }catch(err){
    console.log(err)
  }
}

exports.getName = async(req, res, next)=>{
  const userId = req.user.id;
  try{
    const response = await User.findOne({where: {id: userId}});
    const name = response.name
    res.status(200).json({name, userId})
  }catch(err){
    console.log(err)
  }
}