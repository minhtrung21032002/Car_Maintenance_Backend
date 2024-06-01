

const FetchUrl = `http://localhost:3000/main/api`

function loadProfileData() {

    fetch(FetchUrl)

    
        .then(response => response.json())
        .then(data => {
            if (data.status === 'no_userId') {
                console.log("reach no data")
                // Redirect to another page
                window.location.href = '/';
            }
            console.log(data)
            const imgTag = document.querySelector('.navbar-nav .nav-item img');
            const notifyTag = document.getElementById('notifyImg')
            
            imgTag.src = data.login_user.user_img;
            imgTag.classList.add('user-avatar');
                    // Select the third list item (index 2, as indexing starts from 0)
            var thirdListItem = document.querySelectorAll('.navbar-nav li')[2];
            
            // Check if the element exists
            if (thirdListItem) {
                // Find the anchor element within the third list item
                var carsLink = thirdListItem.querySelector('a');
                console.log(carsLink)
                // Check if the anchor element exists
                if (carsLink) {
                    console.log(carsLink.href)
                    carsLink.href = carsLink.href + `${data.login_user._id}`
                    console.log((carsLink.href))
                    console.log("Href modified successfully.");
                } else {
                    console.log("Anchor element not found within the third list item.");
                }
            } else {
                console.log("Third list item not found.");
            }

            const modalBody = document.querySelector('#exampleModal .modal-body');
    
            // Clear previous content
            modalBody.innerHTML = '';
     

           
            // Append messages to the modal body
            data.messages.forEach(message => {
                // Create a paragraph for the send_date
                        // Create a container div for each message
                const messageContainer = document.createElement('div');
                messageContainer.className = 'message-container';

                // Create a paragraph for the send_date
                const sendDateElement = document.createElement('p');
                const dateObject = new Date(message.send_date);
                sendDateElement.textContent = `Date: ${dateObject.getDate()}/${dateObject.getMonth() + 1}/${dateObject.getFullYear()}`;
                messageContainer.appendChild(sendDateElement);

                // Create a paragraph for the message_content
                const messageContentElement = document.createElement('p');
                messageContentElement.textContent = `Message: ${message.message_content}`;
                messageContainer.appendChild(messageContentElement);

                // Create the delete icon link
                const deleteIcon = document.createElement('a');
                deleteIcon.href = '#';
                deleteIcon.className = 'delete';
                deleteIcon.title = 'Delete';
                deleteIcon.dataset.toggle = 'tooltip';
                deleteIcon.dataset.id = message._id; // Set data-id attribute

                const iconElement = document.createElement('i');
                iconElement.className = 'material-icons';
                iconElement.innerHTML = '&#xE5C9;';
                deleteIcon.appendChild(iconElement);

                // Append the delete icon to the message container
                messageContainer.appendChild(deleteIcon);

                // Append the message container to the modal body
                modalBody.appendChild(messageContainer);

             
                
            });


            notifyTag.addEventListener('click', function () {
                console.log("reach img")
                $('#exampleModal').modal('show');
            });
            const closeModalButton = document.getElementById('close-modal');

            closeModalButton.addEventListener('click', function() {
              console.log("reach close")
              $('#exampleModal').modal('hide');
            });
           
            // Select the <p> tag inside the #logout div
            const logoutPTag = document.querySelector('#logout p');
             // Log the selected element to verify
             console.log(logoutPTag);
            logoutPTag.addEventListener('click', function() {
                  // Send a delete request to the server
                  fetch(`http://localhost:3000/main/logout`, {
                    method: 'GET',
                }).then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Redirect to another page
                        window.location.href = '/';
                    } else {
                        // Display an error message
                        alert('Server error: ' + data.message);
                    }
                }).catch(error => {
                    console.error('Error:', error);
                });
           
            });

         

                // Show the modal when the button is clicked
                imgTag.addEventListener('click', function () {
                    const userModal = document.getElementById('userModal');
                    userModal.style.display = 'block';
                });
                const userModal = document.getElementById('userModal');
            window.addEventListener('click', (event) => {
                if (!userModal.contains(event.target) && event.target !== imgTag) {
                    userModal.style.display = 'none';
                }
            });
         

            document.querySelector('#exampleModal .modal-body').addEventListener('click', function (e) {
                if (e.target.closest('.delete')) {
                    e.preventDefault();
                    const messageId = e.target.closest('.delete').dataset.id;
                    console.log('Delete message with ID:', messageId);
                    
                    // Send a delete request to the server
                    fetch(`http://localhost:3000/user/message/${messageId}`, {
                        method: 'DELETE',
                    }).then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        // Optionally, remove the message from the DOM
                        e.target.closest('.message-container').remove();
                    }).catch(error => {
                        console.error('Error:', error);
                    });
                }
            });
        })
        .catch(error => console.error('Error fetching user data:', error));

}

loadProfileData()