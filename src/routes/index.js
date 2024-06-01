const authRouter = require('./authentication.js')
const guideRouter = require('./guide.js')
const userRouter = require('./user.js')
const mainRouter = require('./main.js')
const trackingRouter = require('./tracking.js')
const serviceCenterRouter = require('./serviceCenter.js')
const adminRouter = require('./admin.js')
const path = require('path');

// index-page
function route(app){

    // Landing Page
    app.get('/', (req, res) => {
        res.render('landing', { layout: false });
    });

    app.get('/test', (req, res) => {
        res.sendFile(path.join(__dirname, '../resources/views', `test.html`));
    });

    // Main Page
    app.use('/main', mainRouter)

    // Login Page
    app.use('/auth', authRouter)

    // Guide Page
    app.use('/guide', guideRouter)

    // User Page
    app.use('/user', userRouter)
    //

    app.use('/carTracking', trackingRouter)

    app.use('/serviceCenter', serviceCenterRouter)

    
    app.use('/admin', adminRouter)

}
module.exports = route