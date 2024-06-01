const express = require('express');
const router = express.Router();
const guideController = require('../controllers/GuideController');
const blogRouter = require('./blog.js')


// Refactor 
const multer = require('multer');

//Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder
        cb(null, './src/storage/imgs');
    },
    filename: function (req, file, cb) {
        // Set the file name to be the original name (you can customize this as needed)
        cb(null, file.originalname);
    },
  });
  
const upload = multer({ storage: storage });
//Upload images




//Put Longest URL first
//Guide Page
router.get('/api', guideController.guide_data)
router.get('/', guideController.guide_page)


//Blog Page
router.use('/blog', blogRouter)

//Guide Create
router.post('/create', guideController.guide_creating)
router.get('/create/intro/:blog_id', guideController.guide_create_intro)
router.get('/create/steps/:blog_id', guideController.guide_create_steps)


router.post('/store', upload.single('image'), guideController.guide_store)
router.use('/', guideController.guide)


module.exports = router;