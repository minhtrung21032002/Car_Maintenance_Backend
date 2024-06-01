const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');


// USERS
router.get('/users', AdminController.getAllUsers)
router.post('/users/messages', AdminController.sendMessageToUser)
router.delete('/users/:token', AdminController.deleteUser)
router.patch('/users/:user_id', AdminController.changeUserPassword)
router.patch('/users/profile/:user_id', AdminController.changeUserProfile)
// VEHICLES
router.get('/vehicles', AdminController.getAllVehicles)
router.patch('/vehicles/:vehicle_id', AdminController.changeStatusVehicle)



// APPOINTMENTS
router.get('/appointments', AdminController.getAllAppointments)


module.exports = router;