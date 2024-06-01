const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');




// About Page
router.get('/profile/:user_id', userController.getProfile)


router.delete('/message/:message_id', userController.deleteMessage)
module.exports = router;