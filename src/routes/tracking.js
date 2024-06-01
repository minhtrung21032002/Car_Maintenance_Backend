const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/TrackingController');


// tracking Page
router.get('/api', trackingController.tracking_page_data)

router.get('/user/api/:user_id', trackingController.tracking_page_user)

router.get('/user/api/:vehicle_id', trackingController.tracking_page_service)

// FUEL TYPE 
router.get('/fuelType/api', trackingController.tracking_page_fuel_type)
router.post('/fuelType/api', trackingController.create_fuel_type)
router.patch('/fuelType/api/:fuel_id', trackingController.update_fuel_type)
router.delete('/fuelType/api/:fuel_id', trackingController.delete_fuel_type)

// SERVICE TYPE
router.get('/serviceType/api', trackingController.tracking_page_service_type)
router.post('/serviceType/api', trackingController.create_service_type)
router.patch('/serviceType/api/:service_type_id', trackingController.update_service_type)
router.delete('/serviceType/api/:service_type_id', trackingController.delete_service_type)

// PLACE
router.get('/place/api', trackingController.tracking_page_place)
router.post('/place/api', trackingController.create_place)
router.patch('/place/api/:place_id', trackingController.update_place)
router.delete('/place/api/:place_id', trackingController.delete_place)


// GAS STATION
router.get('/place/api', trackingController.tracking_page_place)
router.post('/place/api', trackingController.create_place)
router.patch('/place/api/:place_id', trackingController.update_place)
router.delete('/place/api/:place_id', trackingController.delete_place)


// HISTORY
router.get('/history/api/:vehicle_id', trackingController.tracking_page_history)
// Reminder
// API LISTS

// [GET] API
//Service
router.get('/service/api/', trackingController.tracking_service_api)
//Refuelling
router.get('/refuelling/api/:vehicle_id', trackingController.tracking_refuelling_api)
//Reminder
router.get('/reminder/api/:vehicle_id', trackingController.tracking_reminder_api)
//Get Vehicle List
router.get('/vehicle/api/:user_id', trackingController.tracking_vehicle_api)

// [POST] API

//Service
router.post('/service/api/:vehicle_id', trackingController.tracking_service_submit_api)
//Refuelling
router.post('/refuelling/api/:vehicle_id', trackingController.tracking_refuelling_submit_api)
//Reminder
router.post('/reminder/api/:vehicle_id', trackingController.tracking_reminder_submit_api)
//Create Vehicle
router.post('/vehicle/api/:user_id', trackingController.tracking_vehicle_submit_api)
//Modal Create Vehicle
router.post('/vehicle/modal/api/:user_id', trackingController.tracking_vehicle_modal_submit_api)


// [DELETE] API

//Service
router.delete('/service/api/:service_id', trackingController.tracking_service_delete_api)
//Refuelling
router.delete('/refuelling/api/:refuelling_id', trackingController.tracking_refuelling_delete_api)
//Reminder
router.delete('/reminder/api/:reminder_id', trackingController.tracking_reminder_delete_api)
//Create Vehicle
router.delete('/vehicle/api/:vehicle_id', trackingController.tracking_vehicle_delete_api)




// [PATCH] API

//Service
router.patch('/service/api/:service_id', trackingController.tracking_service_patch_api)
//Refuelling
router.patch('/refuelling/api/:refuelling_id', trackingController.tracking_refuelling_patch_api)
//Reminder
router.patch('/reminder/api/:reminder_id', trackingController.tracking_reminder_patch_api)
//Create Vehicle
router.patch('/vehicle/api/:vehicle_id', trackingController.tracking_vehicle_patch_api)



module.exports = router;