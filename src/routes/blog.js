const express = require('express');
const router = express.Router();
const blogController = require('../controllers/BlogController');


// Edit Steps
router.get('/edit/steps/:blog_id/:step_id', blogController.blog_page_steps)
router.get('/edit/steps/api/:blog_id/:step_id', blogController.blog_page_steps_data)


router.patch('/edit/steps/:blog_id', blogController.blog_page_steps_update_rearrange) // REARRANGE STEPS
router.post('/edit/steps/:blog_id/', blogController.blog_page_steps_update_create) // CREATE INSERT STEP
router.patch('/edit/steps/:blog_id/:step_id', blogController.blog_page_steps_update_steps) // UPDATE ALL STEPS INFORMATION
router.delete('/edit/steps/delete/:step_id/:blog_id', blogController.blog_page_steps_delete) // DELETE STEP


// Edit Insert
router.get('/edit/steps/insert/api/:blog_id/', blogController.blog_page_steps_insert_data)
router.get('/edit/steps/:blog_id/new-after/:number', blogController.blog_page_steps_insert_new)


// Edit Intro
router.get('/edit/intro/:blog_id', blogController.blog_page_edit2)
router.get('/edit/intro/api/:blog_id', blogController.blog_page_edit2_data)
router.post('/edit/intro/:blog_id', blogController.blog_page_edit2_update)


// Summary Comment
router.post('/comment/summary/:blog_id/:user_id', blogController.summary_comment)

// Step Comment
router.post('/comment/step/:step_id/:user_id', blogController.step_comment)

// Blog Page
router.get('/:blog_id', blogController.blog_page)
router.get('/api/:blog_id', blogController.blog_data)
// Create Blog




//Conclusion
router.post('/donate/:blog_id/', blogController.donatePoint)

module.exports = router;