let dataGlo;
console.log('gaega');
function loadBlogData(blogId) {
    fetch(`http://localhost:3000/guide/blog/api/${blogId}`)

        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (Status: ${response.status})`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            dataGlo = data;
            //console.log(dataGlo.login_user._id)
            const { _id: user_id, member_since, password, user_name, total_guides, user_img } = data.user_information;
            const {
                _id: blogId,
                blog_title,
                last_updated,
                conclusion,
                difficulty,
                introduction,
                time,
            } = data.blog_information;

            // Update the content of the blogContent div
            document.querySelector('.guide-title').innerHTML = `
            ${blog_title} 
            `;
            document.querySelector('.guide-author').innerHTML = `
            ${user_name}

            `;
            document.querySelector('.author-date').innerHTML = `
            ${last_updated}
            `;

            document.querySelector('.author-avatar__img').setAttribute('src', user_img);

            document.querySelector('.thumbnail').src = `${data.steps[0]?.step_imgs[0].img_url}`;
                ``


            const formattedDate = new Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }).format(new Date(last_updated));
            const formattedTime = Math.floor(time / 60);

            document.querySelector('.author-date').innerHTML = `Last updated ${formattedDate}`;

            document.querySelector('.difficulty').insertAdjacentText('beforeend', `${difficulty}`);

            document.querySelector('.time').insertAdjacentText('beforeend', `${formattedTime} minutes`);


            //document.querySelector('.guide-intro-main').insertAdjacentHTML('beforeend', `${introduction}`)
            document.querySelector('.guide-intro-main').insertAdjacentHTML('beforeend', introduction)
            document.querySelector('#conclusionText').innerHTML = conclusion;
            console.log(introduction)
            data.steps.forEach(step => {
                renderStep(step, dataGlo.login_user._id);
            });
            renderBlogAuthor(data.user_information);
            renderComments(data.summary_comments);

            handleConclusionUI()
        })
        .catch(error => console.error(`Error fetching blog data: ${error.message}`, error));
}
//loadBlogData();

function renderBlogAuthor(user_information) {
    console.log(user_information);

    // Get the author photo URL
    var authorPhotoElement = document.querySelector('.author-photo img');
    authorPhotoElement.setAttribute('src', user_information.user_img);

    var authorNameElement = document.querySelector('.author-info h4 a');
    authorNameElement.textContent = user_information.user_name;

    // Get the member since date
    var memberSinceElement = document.querySelector('#author .author-info p:nth-of-type(1)');
    memberSinceElement.textContent = "Member since: " + user_information.member_since;

    // Get the reputation
    var reputationElement = document.querySelector('#author .author-info p:nth-of-type(2)');
    reputationElement.textContent = "Points: " + user_information.points;

    // Get the number of guides authored
    var guidesAuthoredElement = document.querySelector('#author .author-info p:nth-of-type(3)');
    guidesAuthoredElement.textContent = "Total Guides: " + user_information.total_guides;



}

function renderStep(step, user_id) {
    console.log('step comment id')
    console.log(user_id)
    const stepList = document.getElementById('steps-container');
    const stepItem = document.createElement('li');
    stepItem.classList.add('step', 'step-wrapper');
    stepItem.innerHTML = `
        <div class="step-title">Step ${step.step_number[0]}</div>
        <div class="image-container">
        <div class="fotorama"
             data-width="100%" 
             data-nav="thumbs"
        > 
             ${renderImages(step.step_imgs)}

        </div>
           
        </div>
        <ol class="step-content step-guide">
            ${renderContent(step.step_content)}
        </ol>
        <div class="comment-section">
                <div class="comment-button-container">
                    <div class="comment-button" onclick="toggleComments(this)">Comment</div>
                </div>    
                
                <div class="comment-input" style="display: none">
                    <h4 class="js-add-comment-title">Add Comment</h4>
                    <textarea class="common-reply-textarea">Type your comment</textarea>
                    <div class="post-buttons">
                        <button onclick="postComment(this,'${step.stepId}','${user_id}')" class="post-comment-btn">
                            Post comment
                        </button>
                    </div>
                </div>
                
                <div class="comments" style="display: none">
                   ${renderStepComments(step.step_comments)}
                </div>                                  
        </div>
    `;

    stepList.appendChild(stepItem);
    $('.fotorama').fotorama();
}

// Function to render step images
function renderImages(images) {
    // prettier-ignore
    //
    return images
        .map(
            (image, index) => `
    <a href="${image.img_url}">
       <img src="${image.img_url}" alt="Step Image ${image.img_number}" width="100%">
    </a>
    `
        )
        .join('');
}

// Function to render step content
function renderContent(content) {
    return content
        .map(
            item => `
        <li class="step-item line">
            <div class="icon fa fa-circle bullet bullet_black"></div>
            <p>${item.content_div}</p>
        </li>
    `
        )
        .join('');
}

// Function to render comments
function renderComments(comments) {
    const commentsContainer = document.querySelector('.comments-container');
    const commentsCount = comments.length;

    document.querySelector('.comments-container h3').innerHTML = commentsCount + " Comments";
    let content = '';

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');

        commentElement.innerHTML = `
      <div class="comment-icon">💬</div>
      <div class="comment-content">
        <div class="comment-author">${comment.user_information.user_name}</div>
        <div class="comment-date">${new Date(comment.dateCreated).toLocaleString('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
        })}</div>
        ${comment.comment_content}
        <button onclick="replyToComment(this)" class="reply-button">Reply</button>
      </div>
    `;

        commentsContainer.appendChild(commentElement);
    });

    commentsContainer.querySelector('.comments-list').innerHTML = content;
}

function renderStepComments(comments) {
    return comments
        .map(comment => {
            return `<div class='comment'>
            <div class='comment-icon'>💬</div>
            <div class='comment-content'>
                <div class='comment-author'>${comment.user_information.user_name}</div>
                <div class='comment-date'>${comment.dateCreated.split('T')[0]}</div>
                ${comment.comment_content}
                <button onclick='replyToComment(this)' class='reply-button'>
                    Reply
            </div>
                </button>
        </div>`;
        })
        .join('');
}

//
function toggleComments(button) {
    const commentSection = button.closest('.comment-section');

    const commentInput = commentSection.querySelector('.comment-input');

    const commentsContainer = commentSection.querySelector('.comments');

    if (commentInput.style.display === 'none') {
        commentInput.style.display = 'block';
        commentsContainer.style.display = 'block';
    } else {
        commentInput.style.display = 'none';
        commentsContainer.style.display = 'none';
    }
}

function postComment(button, step_id, user_id) {
    var commentInputContainer = button.closest('.comment-input');

    var commentTextarea = commentInputContainer.querySelector('textarea');
    // /guide/blog/comment/step/:step_id/:user_id
    var commentText = commentTextarea.value.trim();

    if (commentText !== '') {
        // Prepare the data to be sent
        var postData = {
            author: 'Your Name', // You can replace this with the actual author information
            date: getCurrentDate(),
            text: commentText,
        };
        // localhost:3000/guide/blog/comment/step/658bf0e414edd9039ddc7b18/658e8240bcdfd9edfeeabd2e
        // Make the fetch POST request


        fetch(`http://localhost:3000/guide/blog/comment/step/${step_id}/${user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then(response => {
                console.log(response);
                if (response.status === 200) {
                    // Reload the page
                    window.location.reload();
                }
                return response.json();
            })

            .then(data => {
                // Handle the response data if needed
                console.log('Comment posted successfully:', data);
            })
            .catch(error => {
                console.error('Error posting comment:', error);
            });
    }
}

function postSummaryComment(button) {


    const user_id  = dataGlo.login_user._id;
    const { _id: blog_id, } = dataGlo.blog_information;
    console.log('post summary comment')
    var commentInputContainer = button.closest('.comment-input');
    var textarea = commentInputContainer.querySelector('textarea');
    // Get the input value of the textarea
    var commentText = textarea.value;

    if (commentText !== '') {
        // Prepare the data to be sent
        var postData = {
            author: 'Your Name', // You can replace this with the actual author information
            date: getCurrentDate(),
            text: commentText,
        };
        // localhost:3000/guide/blog/comment/step/658bf0e414edd9039ddc7b18/658e8240bcdfd9edfeeabd2e
        // Make the fetch POST request


        fetch(`http://localhost:3000/guide/blog/comment/summary/${blog_id}/${user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then(response => {
                console.log(response);
                if (response.status === 200) {
                    // Reload the page
                    window.location.reload();
                }
                return response.json();
            })

            .then(data => {
                // Handle the response data if needed
                console.log('Comment posted successfully:', data);
            })
            .catch(error => {
                console.error('Error posting comment:', error);
            });
    }
}


function getCurrentDate() {
    var currentDate = new Date();
    return currentDate.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function replyToComment(button) {
    document.querySelectorAll('.reply-input').forEach(function (replyInput) {
        replyInput.style.display = 'none';
    });

    var closestCommonReplyInput = button.closest('.comment-section').querySelector('.common-reply-textarea');
    closestCommonReplyInput.parentElement.style.display = 'block';

    closestCommonReplyInput.focus();
}

// Get blog ID from the URL parameter
// const urlParams = new URLSearchParams(window.location.search);
// const blogId = urlParams.get('id');
// console.log(blogId);

// Get the full URL
const currentUrl = window.location.href;

// Split the URL by '/' and get the last part
const parts = currentUrl.split('/');
const blogId = parts[parts.length - 1];

console.log(blogId);


// Load blog data on page load
if (blogId) {
    loadBlogData(blogId);
    editPageHref(blogId);
}



function editPageHref(blogId) {

    const blogEditBtn = document.getElementsByClassName('blog-edit-btn')[0];
    console.log('blog id: ' + blogId);

    // Update the href property
    blogEditBtn.href = `./edit/intro/${blogId}`;

    // Log the updated href value
    console.log(blogEditBtn.href);
}
function donatePoints(){
    const donateButton = document.querySelector('.donate-button');
    const icon = document.querySelector('.donate-button i');

    // Add click event listener
    donateButton.addEventListener('click', function() {
        console.log('donate point click')
        donateButton.style.backgroundColor = 'transparent';
        icon.style.display = 'none';
        donateButton.style.color = 'black';
        donateButton.textContent = 'You are finished!';
        // Set border-color to transparent
        donateButton.style.borderColor = '#d1d5db';
        let conclusionHeader = document.querySelector('#conclusion h3');

        // Check if the element is found
        if (conclusionHeader) {
            // Set the display style to "none"
            conclusionHeader.style.display = 'inline';
        } else {
            console.error('Element not found');
        }

        fetch(`http://localhost:3000/guide/blog/donate/${dataGlo.blogId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: ''
        })
            .then(response => {
                // console.log(response);
                // if (response.status === 200) {
                //     // Reload the page
                //     window.location.reload();
                // }
                return response.json();
            })

            .then(data => {
                // Handle the response data if needed
                console.log('DONATE posted successfully:', data);
            })
            .catch(error => {
                console.error('Error posting comment:', error);
            });
    })
}
donatePoints()
function handleConclusionUI() {
    const conclusionTextElement = document.querySelector('#conclusionText');


    if (conclusionTextElement && conclusionTextElement.innerHTML.trim() !== '') {

        const conclusionHeading = document.querySelector('#conclusion h3');


        conclusionHeading.style.marginBottom = '15px'; conclusionTextElement.style.marginBottom = '15px';
    }


}