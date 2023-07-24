const express = require('express');
const router = express.Router();

const userController = require('../controller/user');
const userAuthenticate = require('../middleware/auth')

router.post('/signup', userController.postSignUpUser);
router.post('/login', userController.postLoginUser);
router.post('/adduser/:groupId',userAuthenticate.authenticate, userController.postAddUser);
router.delete('/delete/:id/:groupId', userAuthenticate.authenticate, userController.deleteUser);
router.get('/admin/:groupId', userAuthenticate.authenticate, userController.getAdmin);
router.get('/name', userAuthenticate.authenticate, userController.getName)

module.exports = router;