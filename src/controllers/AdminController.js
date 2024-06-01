const path = require('path');
const fs = require('fs');
const Vehicle = require('../models/vehicle')
const User = require('../models/user')
const Appointment = require('../models/appointment');
const Message = require('../models/message');
const { getAuth } = require("firebase-admin/auth");
const { admin } = require("firebase-admin");
const { initializeApp } = require('firebase-admin/app');
const firebaseConfig = {
    apiKey: "AIzaSyBXGDpGLkoxPHaMGIG-E6GxviDDssv-97c",
    authDomain: "thesis-268ea.firebaseapp.com",
    projectId: "thesis-268ea",
    storageBucket: "thesis-268ea.appspot.com",
    messagingSenderId: "1065392850994",
    appId: "1:1065392850994:web:023a10aca1806650fd142b",
    measurementId: "G-XHJ0ES966N"
  };


const app = initializeApp(firebaseConfig, 'other');

class AdminController{


    async getAllVehicles(req, res) {
         const vehicles = await Vehicle.find().lean(); // Use lean() to convert documents to plain JavaScript objects
         const assetsPath = path.join(__dirname, '..', 'assets', 'imgs', 'carlogo');
         fs.readdir(assetsPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }
        
            // Loop through each vehicle
            vehicles.forEach(vehicle => {
                // Find the PNG image file that matches the manufacturer name
                const manufacturerImg = files.find(file => file.toLowerCase().includes(vehicle.manufacturer.toLowerCase()));
                vehicle.last_updated = `${vehicle.last_updated.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                // If a matching image is found, add a new field 'img' to the vehicle object
                if (manufacturerImg) {
                    vehicle.img = path.join('../imgs', 'carlogo', manufacturerImg);
                } else {
                    console.warn(`Image not found for manufacturer: ${vehicle.manufacturer}`);
                }
            });
        
            // Now, vehicles array has been updated with 'img' field for each vehicle
            console.log('Updated vehicles:', vehicles);
        });


        res.render('admin', {vehicles: vehicles});
    }   

    async changeStatusVehicle(req, res) {
        console.log("reach change status vehicle");
        console.log(req.params.vehicle_id);
        console.log(req.body);
    
        try {
            // Get the vehicle by id
            const vehicle = await Vehicle.findOne({_id: req.params.vehicle_id });
            console.log(vehicle)
            // Check if the vehicle exists
            if (!vehicle) {
                return res.status(404).send({ message: 'Vehicle not found' });
            }
    
            // Update the vehicle status
            if (req.body.status === 'Active') {
                vehicle.status = 'Active';
            } else if (req.body.status === 'Deactive') {
                vehicle.status = 'Deactive';
            } else {
                return res.status(400).send({ message: 'Invalid status' });
            }
    
            // Save the updated vehicle
            await vehicle.save();
    
            // Return a success response
            res.send({ status: req.body.status });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error updating vehicle status' });
        }
    }

    async getAllUsers(req,res){
        const users = await User.find().lean(); // Use lean() to convert documents to plain JavaScript objects

        // Convert ObjectId to string in each vehicle object
        users.forEach(users => {
            users._id = users._id.toString();
        });

       
        res.render('admin', {users: users});
    }

    async sendMessageToUser(req,res){
        console.log("reach send Message To User")
        console.log(req.body)

        try {
    
            const newMessage = new Message({
                user_id : req.body.user_id,
                send_date: new Date(),
                message_content : req.body.message
            });
            await newMessage.save()

            
            // Sending the response with the created Fuel data
            res.status(200).json(newMessage);
        } catch (error) {
            console.error('Error update reviewers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


    async getAllAppointments(req,res){
        const appointments = await Appointment.find().populate('shopId').lean(); // Use lean() to convert documents to plain JavaScript objects

        // Convert ObjectId to string in each vehicle object
        appointments.forEach(appointments => {
            appointments._id = appointments._id.toString();
            appointments.userId = appointments.userId.toString();
            appointments.shopId._id = appointments.shopId._id.toString();

            appointments.selectedDate = `${appointments.selectedDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        });
        res.render('admin', {appointments: appointments});
    }


    async deleteUser(req,res){
        
        // delete from firebase
        const firebase_uid = req.params.token

        try {
            // Check if the provided service_id is a valid ObjectId
            // Attempt to delete the service
            // const deletedUser = await User.findByIdAndDelete(user_id);
    
            // Check if the service was found and deleted

                getAuth()
                .deleteUser(firebase_uid)
                .then(() => {
                    
                    console.log('Successfully deleted user');
                })
                .catch((error) => {
                    console.log('Error deleting user:', error);
                });
        

            // find by firebase_userId Field and delete
        
            const deletedUser= await User.findOneAndDelete({ firebase_userId: firebase_uid });

            // Return success response
            return res.status(200).json({ message: "User deleted successfully",deletedUser });
        } catch (error) {
            console.error("Error in deleteing user", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    
    }

    async changeUserPassword(req,res){
        console.log("reach change password")
        console.log(req.body)
        // delete from firebase
        const user_id = req.params.user_id
        console.log(user_id)
        const user = await User.findOne({_id: user_id})
        const uid = user.firebase_userId
        try {
            // Check if the provided service_id is a valid ObjectId
            // Attempt to delete the service
            // const deletedUser = await User.findByIdAndDelete(user_id);
    
            // Check if the service was found and deleted
         
                getAuth()
                .updateUser(uid, {
        
                    password: req.body.newPassword,
                  
                  })
                  .then((userRecord) => {
                    // See the UserRecord reference doc for the contents of userRecord.
                    console.log('Successfully updated user', userRecord.toJSON());
                  })
                  .catch((error) => {
                    console.log('Error updating user:', error);
                  });
          

            // find by firebase_userId Field and delete
        
            // Return success response
            return res.status(200)
        } catch (error) {
            console.error("Error in changeing password user", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    
    }
    async testing(req,res){
        res.status(200)
    }
    async changeUserProfile(req, res) {
        try {
            console.log("reach change user profile")
            console.log(req.body)
            // delete from firebase
            const user_id = req.params.user_id
            console.log(user_id)
            
 
            
            // Send the response
            res.status(200).json({ message: "User profile updated successfully" });
        } catch (error) {
            console.error("Error in changing password user", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}


module.exports = new AdminController
