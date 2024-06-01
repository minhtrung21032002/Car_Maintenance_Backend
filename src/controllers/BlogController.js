const Blog = require('../models/blog');
const User = require('../models/user');
const mongoose = require('mongoose');
const Step = require('../models/step');
const Comment = require('../models/comment');
const Step_Comment = require('../models/step_comment');
const Guide = require('../models/guide');
const path = require('path');

class BlogController {


    // [GET] /guide/blog/:blog_id
    // async blog_page(req, res) {
    blog_page(req, res) {

        const blogId = req.params.blog_id;
        console.log(blogId)
        // Render the blog-page handlebars template, passing the blogId as a context
        res.sendFile(path.join(__dirname, '../resources/views', `blog_page.html`));
    }


    // [GET] /guide/blog/api/:blog_id
    async blog_data(req, res) {




        const blogId = req.params.blog_id;

        // Query to find the blog by ID and populate the 'steps' field
        const blog = await Blog.findById(blogId, '-user_id');

        // Increase number_access by 1 
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { $inc: { number_access: 1 } },
            { new: true }
        );


        const session_userId_query = req.session.user_id;
  
        console.log("session id in blog controller: " +  session_userId_query)
        const user_id_query = await Blog.findById(blogId, 'user_id');
        const comment_id_query = await Blog.findById(blogId, 'summary_comments');
        const loginUserInformation = await User.findOne({_id:session_userId_query }).lean();
        console.log(loginUserInformation)
        // LOOP through comment_id_query with field summary_comments is a list of id

        const user_id = user_id_query.user_id;
        const comment_ids = comment_id_query.summary_comments;

        // Use Promise.all to asynchronously fetch all summary_comments
        const summary_comments = await Promise.all(comment_ids.map(async (comment_id) => {
            return await Comment.findById(comment_id).lean();
        }));

        console.log(summary_comments)

        const summary_comments_with_user_info = await Promise.all(summary_comments.map(async (comment) => {
            // Fetch the user_information using user_id
            const user_information = await User.findById(comment.user_id).lean();

            // Return a new object that includes both comment and user_information
            return {
                ...comment,
                user_information
            };
        }));

        const user_information = await User.findOne({_id: user_id});
        const blog_information = await Blog.findById(blogId, '-user_id -steps -summary_comments');
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Extract information from the populated 'steps' field
        const stepsData = await Promise.all(blog.steps.map(async (step) => {
            // Query the 'steps' collection for each step ID to get additional information
            const detailedStep = await Step.findById(step._id);

            if (detailedStep) {


                // Check if detailedStep.comments_id is not null and has at least one comment
                if (detailedStep.comments_id && detailedStep.comments_id.length > 0) {
                    // Query comments collection for detailed information about each comment
                    const commentsData = await Promise.all(
                        detailedStep.comments_id.map(async (commentId) => {
                            // Check if commentId is not null before querying
                            if (commentId) {
                                const detailedComment = await Step_Comment.findById(commentId);

                                if (detailedComment) {
                                    const user = await User.findById(detailedComment.user_id);
                                    return {
                                        commentId: detailedComment._id,
                                        comment_content: detailedComment.comment_content,
                                        user_information: user,
                                        dateCreated: detailedComment.dateCreated,
                                        // Add other fields you want from each detailed comment
                                    };
                                }
                            }
                        })
                    );

                    return {
                        stepId: detailedStep._id,
                        step_number: detailedStep.step_number,
                        step_imgs: detailedStep.imgs,
                        step_content: detailedStep.step_content,
                        step_comments: commentsData,
                        // Add other fields you want from each detailed step
                    };
                } else {
                    // Handle the case where there are no comments
                    return {
                        stepId: detailedStep._id,
                        step_number: detailedStep.step_number,
                        step_imgs: detailedStep.imgs,
                        step_content: detailedStep.step_content,
                        step_comments: [],
                        // Add other fields you want from each detailed step
                    };
                }
            }
        }));
        const sortedStepsData = stepsData.sort((a, b) => a.step_number - b.step_number);

        // Construct the response JSON
        const responseData = {
            blogId: blog._id,
            login_user: loginUserInformation,
            user_information: user_information, // Include user information
            blog_information: blog_information, // Include blog information
            summary_comments: summary_comments_with_user_info,
            // Add other fields you want from the blog
            // For example: title, author, etc.
            steps: sortedStepsData,
        };

        res.json(responseData);


    }
    // POST /edit/steps/:blog_id/
    async blog_page_steps_update_create(req, res) {


        console.log('reach blog_page_steps_update_create')
        const blogId = req.params.blog_id;
        const images = req.body.images;
        const previousStepNumber = req.body.prevStepNumber;
        const currentNumber = parseInt(previousStepNumber) + 1;
        const stepContentData = JSON.parse(req.body.stepContent);
        const stepContentArray = stepContentData.step_content;
        const currentDate = new Date();

        const blog = await Blog.findById(blogId);


        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }




        try {
            // Find all Step documents associated with the given Blog
            const stepsToUpdate = await Step.find({ _id: { $in: blog.steps } });
            console.log(stepsToUpdate)

            // Update the step_number of each Step document where it's greater than or equal to currentNumber
            for (const step of stepsToUpdate) {
                // Parse step_number to an integer
                const currentStepNumber = parseInt(step.step_number[0]);

                if (!isNaN(currentStepNumber) && currentStepNumber >= currentNumber) {
                    // Increment step_number by 1 and save the document\
                    console.log('number before increase')
                    console.log(step.step_number[0])
                    step.step_number[0] = (currentStepNumber + 1).toString(); // Convert back to string after incrementing
                    console.log(step.step_number[0]);
                    await step.save();
                }
            }


            console.log('Step numbers updated successfully');
        } catch (error) {
            console.error('Error updating step numbers:', error);
            res.status(500).json({ error: 'Internal server error' });
        }

        console.log('save succfessful')




        // Extract content_div_number and content_div from each object in the step_content array
        const extractedData = stepContentArray.map(item => ({
            icon: item.icon,
            content_div_number: item.content_div_number,
            content_div: item.content_div
        }));
        const imgs = images.map((imageUrl, index) => ({
            img_url: imageUrl,
            img_number: index + 1 // Assuming img_number starts from 1
        }));

        const step = new Step({
            comments_id: [], // Assuming it's empty initially
            step_number: currentNumber, // Provide step number accordingly
            video_url: '', // Provide video URL if available
            imgs: imgs,
            step_content: extractedData
        });
        await step.save();
        console.log(step._id)
        try {
            // Assuming this is within an async function
            blog.steps.push(step._id);
            blog.last_updated = currentDate;
            await blog.save(); // Save the blog after appending the new step
            const responseData = {
                CreatedStepId: step._id
            };
            res.json(responseData); // Send the response once after saving the blog
        } catch (error) {
            // Handle any errors that occur during the process
            console.error("Error:", error);
            res.status(500).json({ error: 'An internal server error occurred' });
        }


    }
    // Patch
    async blog_page_steps_update_steps(req, res) {

        const currentDate = new Date();
        const blogId = req.params.blog_id;
        const blog = await Blog.findById(blogId);
        blog.last_updated = currentDate;
        await blog.save();



        console.log("reach steps update steps data")
        const stepId = req.params.step_id;
        const images = req.body.images;
        const currentNumber = parseInt(req.body.prevStepNumber) + 1;
        const stepContentData = JSON.parse(req.body.stepContent);
        const stepContentArray = stepContentData.step_content;


        const extractedData = stepContentArray.map(item => ({
            icon: item.icon,
            content_div_number: item.content_div_number,
            content_div: item.content_div
        }));
        const imgs = images.map((imageUrl, index) => ({
            img_url: imageUrl,
            img_number: index + 1 // Assuming img_number starts from 1
        }));
        console.log(extractedData)
        console.log(imgs)

        try {
            // Find the step by ID and update its fields
            const updatedStep = await Step.findByIdAndUpdate(stepId, {
                $set: {
                    step_content: extractedData,
                    imgs: imgs
                }
            }, { new: true });

            if (!updatedStep) {
                return res.status(404).json({ error: 'Step not found' });
            }

            res.status(200).json({ message: 'Step updated successfully', EditedStepId: updatedStep._id });
        } catch (error) {
            console.error('Error updating step:', error);
            res.status(500).json({ error: 'Internal server error' });
        }


    }
    // [PATCH] /guide/blog/edit/steps/:blog_id
    async blog_page_steps_update_rearrange(req, res) {
        // guide_title
        // blog_title
        // img_url or video_url
        // introduction
        const currentDate = new Date();
        const blogId = req.params.blog_id;
        const blog = await Blog.findById(blogId);
        blog.last_updated = currentDate;
        await blog.save();


        const updatePromises = req.body.steps.map(async (update) => {
            try {
                const { stepId, step_number } = update;

                // Find the step by ID and update the new_step_number field
                const updatedStep = await Step.findByIdAndUpdate(
                    stepId,
                    { step_number: step_number },
                    { new: true } // Return the updated document
                );

                return updatedStep;
            } catch (error) {
                console.error('Error updating step:', error);
                throw error; // Rethrow the error to stop Promise.all if an error occurs
            }
        });

        // Wait for all updates to complete
        const updatedSteps = await Promise.all(updatePromises);

        res.status(200).json({ message: 'Update successful' });


    }
    // [GET] /guide/blog/edit/steps/:blog_id/:step_id
    async blog_page_steps(req, res) {
        console.log('reach blog_page_steps')
        res.sendFile(path.join(__dirname, '../resources/views', `step_page.html`));
    }
    

    // [GET] /guide/blog/edit/steps/api/:blog_id/:step_id
    async blog_page_steps_data(req, res) {


        const blogId = req.params.blog_id;
        const stepId = req.params.step_id;

        // Query to find the blog by ID and populate the 'steps' field
        const blog = await Blog.findById(blogId, '-user_id');

        const blog_information = await Blog.findById(blogId, '-user_id -steps -summary_comments');

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Extract information from the populated 'steps' field
        const stepsData = await Promise.all(blog.steps.map(async (step) => {

            // Query the 'steps' collection for each step ID to get additional information
            const detailedStep = await Step.findById(step._id);

            if (detailedStep) {

                // Extract the information you want from each detailed step
                return {
                    stepId: detailedStep._id,
                    step_number: detailedStep.step_number,
                    step_imgs: detailedStep.imgs,
                    step_content: detailedStep.step_content,
                    // Add other fields you want from each detailed step
                };
            }
            console.log(step._id)
            console.log('not exist')
            return null; // Handle the case where detailed step is not found
        }));

        // Query the 'steps' collection for the primary step using stepId
        const primaryStep = await Step.findById(stepId);
        const sortedStepsData = stepsData.sort((a, b) => a.step_number - b.step_number);
        // Construct the response JSON
        const responseData = {
            blog_information: blog_information, // Include blog information
            primary_step: primaryStep ? {   // Check if primaryStep is found
                stepId: primaryStep._id,
                step_number: primaryStep.step_number,
                step_imgs: primaryStep.imgs,
                step_content: primaryStep.step_content,
                // Add other fields you want from the primary step
            } : null,
            steps: sortedStepsData,
        };

        res.json(responseData);
    }


    // [DELETE] /guide/blog/edit/steps/delete/:step_id/:blog_id
    async blog_page_steps_delete(req, res) {
        const blogId = req.params.blog_id;
        const stepId = req.params.step_id;
        const stepObject = await Step.findById(stepId);
        const blog = await Blog.findById(blogId);

        const currentDate = new Date();
        blog.last_updated = currentDate;
        await blog.save();

        const currentNumber = stepObject.step_number[0];
        // find the step object in the array, and retrive the currentStepNumber and then all the step.step_number >= currentNumber decrease by 1 
        try {
            // Find all Step documents associated with the given Blog
            const stepsToUpdate = await Step.find({ _id: { $in: blog.steps } });

            // Update the step_number of each Step document where it's greater than or equal to currentNumber
            for (const step of stepsToUpdate) {
                // Parse step_number to an integer
                const currentStepNumber = parseInt(step.step_number[0]);

                if (!isNaN(currentStepNumber) && currentStepNumber >= currentNumber) {
                    // Increment step_number by 1 and save the document\
                    console.log('number before increase')
                    console.log(step.step_number[0])
                    step.step_number[0] = (currentStepNumber - 1).toString(); // Convert back to string after incrementing
                    console.log(step.step_number[0]);
                    await step.save();
                }
            }

            const result = await Blog.updateOne(
                { _id: blogId },
                { $pull: { steps: stepId } }
            );
            console.log(result)
        } catch (error) {
            console.log(error)
        }

        const newBlog = await Blog.findById(blogId);
        const responseData = {

            blog_information: newBlog, // Include blog information
        }
        res.json(responseData)


    }


    // [POST] /guide/blog/edit/intro/:blog_id
    async blog_page_edit2_update(req, res) {

        console.log('blog_data_update')
        const introduction = req.body.blog_information.introduction;
        const time = req.body.blog_information.time;
        const difficulty = req.body.blog_information.difficulty;
        const conclusion = req.body.blog_information.conclusion;
        const guide_title = req.body.blog_information.guide_title;
        const blog_title = req.body.blog_information.blog_title;
        const thumbnailImage = req.body.blog_information.introImage[0]; // Note the correct property name 'introImages'
        const blogId = req.params.blog_id;
        // Find the existing blog
        const existingBlog = await Blog.findById(blogId);

        const currentDate = new Date();

        existingBlog.last_updated = currentDate;
        await existingBlog.save();

        // Update Blog model
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                introduction: introduction || existingBlog.introduction,
                time: time || existingBlog.time,
                difficulty: difficulty || existingBlog.difficulty,
                conclusion: conclusion || existingBlog.conclusion,
                blog_title: blog_title || existingBlog.blog_title
            },
            { new: true } // Return the updated document
        );

        // Find the existing guide
        const existingGuide = await Guide.findOne({ blog_id: blogId }); // Assuming 'blog_id' is the correct field name in the Guide model

        // Update Guide model
        const updatedGuide = await Guide.findOneAndUpdate(
            { blog_id: blogId }, // Assuming 'blog_id' is the correct field name in the Guide model
            {
                guide_title: guide_title || existingGuide.guide_title,
                img_url: thumbnailImage || existingGuide.img_url // Assuming 'thumbnailImage' is the correct field name in the Guide model
            },
            { new: true } // Return the updated document
        );
        console.log('update successful')
        res.status(200).json({ message: 'Update successful' });
    }
    // [GET] /guide/blog/edit/intro/:blog_id
    async blog_page_edit2(req, res) {
        console.log('blog_page_edit2')
        res.sendFile(path.join(__dirname, '../resources/views', `introduction_page.html`));
    }
    
    // [GET] /guide/blog/edit/intro/api/:blog_id
    async blog_page_edit2_data(req, res) {

        const blogId = req.params.blog_id;
        const guide = await Guide.findOne({ blog_id: blogId });
        // Query to find the blog by ID and populate the 'steps' field
        const blog = await Blog.findById(blogId, '-user_id');

        const blog_information = await Blog.findById(blogId, '-user_id -steps -summary_comments');

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Extract information from the populated 'steps' field
        const stepsData = await Promise.all(blog.steps.map(async (step) => {
            // Query the 'steps' collection for each step ID to get additional information
            const detailedStep = await Step.findById(step._id);

            if (detailedStep) {
                // Extract the information you want from each detailed step
                return {
                    stepId: detailedStep._id,
                    step_number: detailedStep.step_number,
                    step_imgs: detailedStep.imgs,
                    step_content: detailedStep.step_content,

                    // Add other fields you want from each detailed step
                };
            }

            return null; // Handle the case where detailed step is not found
        }));
        const sortedStepsData = stepsData.sort((a, b) => a.step_number - b.step_number);
        // Query the 'steps' collection for the primary step using stepId

        // Construct the response JSON
        const responseData = {
            guide_information: guide,
            blog_information: blog_information, // Include blog information
            steps: sortedStepsData, // Remove null entries
        };

        res.json(responseData);
    }





    // [POST] /guide/blog/comment/summary/:blog_id/:user_id
    async summary_comment(req, res) {
        console.log('reach summary');

        const { blog_id, user_id } = req.params;

        // Create a new Comment instance
        const newComment = new Comment({
            comment_content: req.body.text,
            user_id: user_id,
            dateCreated: new Date() // Use the current date and time
        });

        try {
            await newComment.save();
            console.log('new comment save')
        } catch (error) {
            console.error('Error saving newComment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
            // Find the blog by its ID
            const blog = await Blog.findById(blog_id);

            // Check if the blog exists
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }

            // Append the new comment to the summary comments list of the blog
            blog.summary_comments.push(newComment._id);

            // Save the updated blog document
            await blog.save();

            // Send a successful response to the client
            return res.status(200).json({ message: 'Comment added successfully', comment: newComment });

        } catch (error) {
            console.error('Error adding comment:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }





    }

    // [POST] /guide/blog/comment/step/:step_id/:user_id
    async step_comment(req, res) {


        const { step_id, user_id } = req.params;


        const newComment = new Step_Comment({
            comment_content: req.body.text,
            user_id: user_id,
            dateCreated: new Date() // Use the current date and time
        });
        try {
            await newComment.save();
            console.log('new comment save')
        } catch (error) {
            console.error('Error saving newComment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const step = await Step.findById(step_id);

        if (!step) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Append the new comment to the summary comments list of the blog
        step.comments_id.push(newComment._id);

        // Save the updated blog document
        await step.save();
        res.status(200).json({})
    }
    async blog_page_steps_insert_new(req, res) {
        console.log('reach blog_page_steps_new')
        res.sendFile(path.join(__dirname, '../resources/views', `step_page.html`));
    }
    async blog_page_steps_insert_data(req, res) {
        const blogId = req.params.blog_id;
        const blog = await Blog.findById(blogId, '-user_id');


        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Extract information from the populated 'steps' field
        const stepsData = await Promise.all(blog.steps.map(async (step) => {
            // Query the 'steps' collection for each step ID to get additional information
            const detailedStep = await Step.findById(step._id);

            if (detailedStep) {
                // Extract the information you want from each detailed step
                return {
                    stepId: detailedStep._id,
                    step_number: detailedStep.step_number,
                    step_imgs: detailedStep.imgs,
                    step_content: detailedStep.step_content,

                    // Add other fields you want from each detailed step
                };
            }

            return null; // Handle the case where detailed step is not found
        }));

        // Query the 'steps' collection for the primary step using stepId
        const sortedStepsData = stepsData.sort((a, b) => a.step_number - b.step_number);
        // Construct the response JSON
        const responseData = {
            blog_information: blog,
            steps: sortedStepsData.filter((step) => step !== null), // Remove null entries
        };

        res.json(responseData);

    }

    async donatePoint(req,res){
        const blogId = req.params.blog_id;

        // Find the blog document by its ID
        const blog = await Blog.findById(blogId);
        
        if (blog) {
            // Extract the userId from the blog document
            const userId = blog.user_id;
        
            // Find the user document by userId and update the points field
            await User.findOneAndUpdate(
                { _id: userId }, // Match user by _id
                { $inc: { points: 30 } }, // Increment points by 30
                { new: true } // Return the updated document
            );
        
            // Optionally, you can also fetch the updated user document
            // const updatedUser = await User.findById(userId);
        
            // Optionally, you can return the updated user document or other response
            // res.json(updatedUser);
        } else {
            // Handle the case where the blog document is not found
            res.status(404).json({ error: 'Blog not found' });
        }
        
    }












}
module.exports = new BlogController