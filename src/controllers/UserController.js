const path = require('path');
const User = require('../models/user');
const Guide = require('../models/guide');
const Badge = require('../models/badge')
const Blog = require('../models/blog')
const Message = require('../models/message')



class UserController{


    async about_page(req, res) {
      
    }
    


   
    async getProfile(req,res){

        try {
            const userId = req.params.user_id;
            console.log("reach get profile")
            console.log(userId)
            // Fetch user information based on userId
            const user = await User.findById(userId)
            const list_events = await Blog.find({ user_id: userId })
            .select('number_access number_of_likes number_of_completed');
            const list_guides = await Guide.find({ user_id: userId })
            .select('_id guide_title img_url');
            console.log(list_guides)


            // Initialize variables to store the sum of each field
            let total_number_access = 0;
            let total_number_of_likes = 0;
            let total_number_of_completed = 0;

            // Loop through the list of events and update the sums
            list_events.forEach(event => {
                total_number_access += event.number_access || 0;
                total_number_of_likes += event.number_of_likes || 0;
                total_number_of_completed += event.number_of_completed || 0;
            });
            const list_badges_id = await User.findOne({ _id: userId }).select('badges');

            // Extract the badge IDs from the user document
            const badgeIds = list_badges_id.badges;
            
            // Use the find method to retrieve the corresponding badges
            const list_badges = await Badge.find({ _id: { $in: badgeIds } });
            
            // Now, list_badges contains an array of Badge documents associated with the user
            

            // Return the data as JSON
            res.status(200).json({
                user,
                list_badges,
                total_number_access,
                total_number_of_likes,
                total_number_of_completed,
                list_guides
            });
        } catch (error) {
            console.error('An error occurred while fetching profile user data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
     

    }

    async changeUserPassword(req,res){
        console.log("Reach change user password")
        console.log(req.body)
    }

    async deleteMessage(req,res){

        try{
            const message_id = req.params.message_id
            console.log(message_id)
            const deletedMessage = await Message.findOneAndDelete({_id: message_id});

            // Return success response
            return res.status(200).json({ message: "Service deleted successfully",deletedMessage });

        }catch(error){
            console.error("Error in deleteing message", error);
            return res.status(500).json({ error: "Internal server error" });
   
        }
    
    }


   

}


module.exports = new UserController