const CarServiceCenter = require('../models/car_service_center');
const Reviewer = require('../models/reviewer');
const User = require('../models/user');
const Appointment = require('../models/appointment');
class ServiceCenterController{


    async getAllShops(req, res) {

        try {
            // Find all shops
            const shops = await CarServiceCenter.find({}).populate('shop_reviewers');
            console.log(shops)
            // Loop through each shop
          
    
            res.status(200).json(shops);
        } catch (error) {
            console.error('Error fetching shops with reviewers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        
    }

    async getReviewers(req, res) {
        const shop_id = req.params.shop_id;
        try {
            const reviewers = await Reviewer.find({ shop_id: shop_id });
            res.status(200).json(reviewers);
        } catch (error) {
            console.error('Error fetching reviewers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async addReviewers(req,res){
        console.log(req.body)
        const shop_id = req.body.storeId;
        const user_id = req.body.userId;
        console.log(user_id)
        try {
            const user = await User.findById(user_id); // query name field in that user
            const user_name = user.user_name;
            const newReview = new Reviewer({
                reviewer_name: user_name,
                reviewer_date: new Date(),
                review_star: req.body.rating,
                reviewer_comment: req.body.comment
            });

            await newReview.save();
            const shop = await CarServiceCenter.findById(shop_id).populate('shop_reviewers');
            // Append the new review to the shop_reviewers array
            shop.shop_reviewers.push(newReview);
            const totalStars = shop.shop_reviewers.reduce((acc, curr) => acc + curr.review_star, 0);
            const reputationStar = totalStars / shop.shop_reviewers.length;
            shop.shop_reputation_star = parseFloat(reputationStar.toFixed(1));
    
            // Save the updated shop
            await shop.save();

            res.status(200).json({ message: 'Post Reviewers' });
        } catch (error) {
            console.error('Error update reviewers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAppointments(req,res){
        const appointments = await Appointment.find().populate('shopId').lean(); // Use lean() to convert documents to plain JavaScript objects

        appointments.forEach(appointments => {
            appointments.selectedDate = appointments.selectedDate
            appointments.userId = appointments.userId.toString();
            appointments.shopId._id = appointments.shopId._id.toString();
        });
        res.status(200).json(appointments)
    }

    async addAppointments(req,res){
        console.log("Reach appointment submit")
        console.log(req.body)

        try {
            const newAppointment = new Appointment({
                userId: req.body.userId, // Converting string to ObjectId
                shopId: req.body.shopId,
                selectedTime: req.body.selectedTime,
                selectedDate: req.body.selectedDate,
                make: req.body.make,
                year: req.body.year,
                model: req.body.model,
                comment: req.body.comment,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone
            });
            await newAppointment.save();
            res.status(200).json({ message: 'Post appointment successful' });
        } catch (error) {
            console.error('Error Appointments:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    }
    
    async test(req, res) {
        try {
            // Create two sample documents
            const review1 = new Reviewer({
                reviewer_name: "John Doe",
                reviewer_date: new Date(),
                review_star: 4,
                reviewer_comment: "Great experience!",
                shop_id: "6623be8e8c5bdc3ffcd572c1"
            });
    
            const review2 = new Reviewer({
                reviewer_name: "Jane Smith",
                reviewer_date: new Date(),
                review_star: 5,
                reviewer_comment: "Excellent service!",
                shop_id: "6623be8e8c5bdc3ffcd572c1"
            });
    
            // Save the documents
            await review1.save();
            await review2.save();
    
            res.status(200).json({ message: 'Sample reviews created successfully!' });
        } catch (error) {
            console.error('Error creating sample reviews:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


}

module.exports = new ServiceCenterController