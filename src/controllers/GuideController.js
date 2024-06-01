const path = require('path');
const Guide = require('../models/guide');
const User = require('../models/user');
const Comment = require('../models/comment');
const Blog = require('../models/blog');
const Badge = require('../models/badge')
const Step = require('../models/step');
const mongoose = require('mongoose');
const { response } = require('express');
class GuildController{


    // [GET] /guide
    guide(req,res){
        
    
}
    
    // [GET] /guide
    guide_page(req,res){
        console.log(__dirname)
        res.sendFile(path.join(__dirname, '../resources/views', 'guides.html'));
    

    }
    // [GET] /guide/api
    async guide_data(req,res){
        try {
            // Filter guides where guide_title is not equal to "Guide Title"
            const data = await Guide.find({ guide_title: { $ne: "Guide Title" } });
            
            res.json(data);
        } catch (error) {
            // Handle any errors that occur during the query
            console.error("Error fetching guide data:", error);
            res.status(500).json({ error: "Internal server error" });
        }

    }
   
    new_page(req,res){

        res.render('') // view new_page
        // in new_page, has a form that will submit to 
        // guide/new_page/introduction/::slug

        // call the url new_page/introduction//::slug with json
    }
    /*
    new_page/introduction/::slug{
        res.json()
    }


        tra ve trang introduction with json = name
        co nut bam toi trang new_page/detail/::slug
    }
    */

    /*
    new_page/detail/::slug(guide_id)
    */

   

    async guide_create_intro(req,res){
        res.sendFile(path.join(__dirname, '../resources/views', `introduction_page.html`));

    }

    async guide_create_steps(req,res){
        res.sendFile(path.join(__dirname, '../resources/views', `step_page.html`));

    }

    async guide_creating(req,res){
        const newBlog = new Blog({
            blog_title: "Blog Title",
            last_updated: new Date("2024-02-22T07:41:35.414Z"),
            conclusion: "<p>Conclusion</p>",
            difficulty: "Easy",
            introduction: "<p>Introduction</p>",
            summary_comments: [],
            time: 68,
            steps: [],
            user_id: "658e8240bcdfd9edfeeabd2e", // Assuming this is a valid user ID
            number_of_comments: 0,
            number_access: 0,
            number_of_likes: 0,
            number_of_completed: 0
        });
        
        // Save the blog document to the database
        const savedBlog = await newBlog.save();
        
        // Create a new guide document
        const newGuide = new Guide({
            guide_title: "Guide Title",
            img_url: "https://guide-images.cdn.ifixit.com/igi/qZEfWObqRESuGwM4.large",
            blog_id: savedBlog._id, // Use the ID of the newly created blog
            user_id: "658e8240bcdfd9edfeeabd2e" // Assuming this is a valid user ID
        });
        
        // Save the guide document to the database
        const savedGuide = await newGuide.save();
        
    
        const retrievedBlog = await Blog.findById(savedBlog._id);
        const retrievedGuide = await Guide.findById(savedGuide._id);
        
       
        const responseData = {
            blogId: savedBlog._id
        };
        console.log('reach guide create data')
        res.json(responseData);
    }
    // POST /guild/guide_store
    guide_store(req,res,next){
        console.log('image uploaded')
        res.json(req.body)
    }




}


module.exports = new GuildController