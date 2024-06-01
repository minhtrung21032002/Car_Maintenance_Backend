const path = require('path');
const {admin } = require('../config/firebase_admin/admin');
const User = require('../models/user');
const Admin = require('../models/admin')
class AuthController{


    // [GET] /normal/login
    async normalLogin(req,res){
        console.log('normal login get ')
        // const userIdCookie = req.cookies.user_id;
        const userId = req.session.user_id
        if (userId) {
            try {
                // const userId = userIdCookie;

                // const isValidToken = await admin.auth().verifyIdToken(userIdCookie);
                // if (isValidToken) {
                //     // Refresh time-out
                //     const refreshTime = new Date(Date.now() + 10 * 60 * 1000);

                //     res.cookie('user_id', userId, {
                //         maxAge: 10 * 60 * 1000 * 10, // 10 minutes
                //         expires: refreshTime,
                //         httpOnly: true,
                //         secure: process.env.NODE_ENV === 'production',
                //         sameSite: 'strict',
                //     });
                //     console.log(req.session.user_id)
           
                //     // Token is valid, render 'home' page
                //     res.redirect('/main');
                //     return;
                // }
                res.redirect('/main');
                return;
            } catch (error) {
                console.error('Error parsing or validating user cookie:', error);
                res.render('login', { layout: false });
            }
        }
    
    
        res.render('login', { layout: false });
       
    }
    
    //[POST] auth/normal/login
    async normalLoginProcess(req, res) {
        console.log('reach normal login process')

        const idToken = req.body.idToken;
        const rememberMe = req.body.rememberMe;
        console.log(rememberMe)
        try {
            // Verify the ID token
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            const email = decodedToken.email;
            const login_method = decodedToken.firebase.sign_in_provider
            const userInformation =  await User.findOne({ firebase_userId: uid }).lean();
            const user_id = userInformation._id.toString()

            if (rememberMe) {
               
                req.session.user_id = user_id;
                // const cookieOptions = {
                //     maxAge: 10 * 60 * 1000 * 10, // 10 minutes
                //     httpOnly: true, // Cookie cannot be accessed via JavaScript
                //     secure: process.env.NODE_ENV === 'production', // Enable only in production
                //     sameSite: 'strict', // Ensure the cookie is sent only to the same site
                // };
    
                // res.cookie('user_id', idToken, cookieOptions);
                console.log("reach here")
            }else {
                try {
                  await User.updateOne({ _id: user_id }, { $set: { loginOnce: true } });
                  console.log('Updated loginOnce to true');
                } catch (error) {
                  console.error('Error updating loginOnce:', error);
                }
            }
    
             
     
            if(login_method === "google.com"){
                const existing_account =  await User.findOne({ user_email: email });
            
                if(existing_account){
                    const user_id =  await User.findOne({ firebase_userId: uid });

                    if (user_id){
                        req.session.user_id = user_id;
                        console.log(req.session.user_id); 
                        res.status(200).json({ status: 'success'});
                    } else {
                        console.error('User not found in MongoDB');
                        throw new Error('User not found');
                    }
           
                }else{ 
                    try {
                        const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
                        const picture = decodedToken.picture;
                        const name = decodedToken.name
                        const defaultUser = new User({
                            firebase_userId: uid,
                            member_since: currentDate,
                            user_email: email,
                            firebase_id: idToken,
                            user_img : picture,
                            user_name: name,
                            signIn_method : "google",
                            loginOnce: false,
                        });
                        // Save the user to the database
                        const savedUser = await defaultUser.save();
                        req.session.user_id = savedUser._id;
                        console.log('Default user created with gmail');
                        res.status(200).json({ status: 'success', });
                    } catch (error) {
                        console.error('Error creating default user:', error);
                    }
                }
            }else{
    
              
                await User.updateOne({ _id: user_id}, { $set: { loginOnce: true } });
                // Send a success response
                // res.status(200).json({status: "success"});
            }
            res.status(200).json({status: "success"});

          
            
        } catch (error) {
            console.error('Error verifying ID token:', error.message);
            // Send an error response
            res.status(401).json({ status: 'error', error: 'Invalid ID token' });
        }
      
        
     
        
          
       
      }
    // [GET] auth/normal/register
    normalRegister(req,res){
        res.render('register', { layout: false });
    }

    // [POST] auth/normal/register
    async normalRegisterProcess(req, res) {
        const idToken = req.body.idToken;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        try {
            const currentDate = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
            const defaultUser = new User({
                member_since: currentDate,
                user_email: email,
                firebase_id: idToken,
                firebase_userId: uid,
                user_img :"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1200px-Default_pfp.svg.png",
                signIn_method : "email",
                loginOnce: true,
            });

            try {
                // Save the user to the database
                const savedUser = await defaultUser.save();
                console.log('Default user created:', savedUser);
                res.status(200).json({ status: 'success', uid, email });
            } catch (error) {
                console.error('Error creating default user:', error);
            }

            // Verify the ID token
        } catch (error) {
            console.error('Error verifying ID token:', error.message);
            // Send an error response
            res.status(401).json({ status: 'error', error: 'Invalid ID token' });
        }
    }
    adminLogin(req,res){
        res.render('adminLogin', { layout: false });
    }
    async adminLoginProcess(req, res) {
        console.log('reach admin login')
        const username = req.body.username;
        const password = req.body.password;
        console.log(username)
        console.log(password)
        try {
            // Query for admin with the provided username and password
            const admin = await Admin.findOne({ user_name: username.toString(), password: password.toString() });
            console.log(admin)
            if (admin) {
                // Update last access date
                admin.last_access_date = new Date().toISOString();
                await admin.save();
    
                res.status(200).json({ status: 'success' });
            } else {
                res.status(401).json({ message: 'Invalid username or password' });
            }
        } catch (error) {
            // Handle error
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    
}


module.exports = new AuthController