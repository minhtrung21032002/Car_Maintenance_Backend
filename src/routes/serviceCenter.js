const express = require('express');
const router = express.Router();
const serviceCenterController = require('../controllers/ServiceCenterController');


router.get('/shop/api', serviceCenterController.getAllShops)
router.get('/shop/:shop_id/reviewers/api', serviceCenterController.getReviewers)
router.get('/test', serviceCenterController.test)
router.get('/appointments', serviceCenterController.getAppointments)

//POST 
router.post('/shop/reviewers/api', serviceCenterController.addReviewers)
router.post('/shop/appointments/api', serviceCenterController.addAppointments)

module.exports = router;