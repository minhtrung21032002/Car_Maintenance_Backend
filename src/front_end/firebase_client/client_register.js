

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { createUserWithEmailAndPassword, getAuth } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyBXGDpGLkoxPHaMGIG-E6GxviDDssv-97c",
  authDomain: "thesis-268ea.firebaseapp.com",
  projectId: "thesis-268ea",
  storageBucket: "thesis-268ea.appspot.com",
  messagingSenderId: "1065392850994",
  appId: "1:1065392850994:web:023a10aca1806650fd142b",
  measurementId: "G-XHJ0ES966N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Access the authentication functionality
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
    // Get the submit button element by ID
    const submitButton = document.getElementById('submit');
    console.log(submitButton)
    // Add a click event listener to the submit button
    submitButton.addEventListener('click', function () {
        signUp();
    });

    // Your existing code


    // ... rest of your code
})
function signUp() {
    const email = document.getElementById('email').value;
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    const registerError = document.getElementById('registerError');
    if (password1 !== password2) {
        registerError.style.display = 'block'; // Show the error message
        registerError.innerText = 'Passwords do not match.'; // Set the error message text
        return;
    }

    // Sign in with email and password
    createUserWithEmailAndPassword(auth, email, password1)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;

      sendTokenToServer(user.accessToken)
      // ...
    })
    .catch((error) => {
      registerError.style.display = 'block'; // Show the error message
      console.log(error.message)
      switch (error.message) {
        case 'Firebase: Error (auth/invalid-email).':
            registerError.innerText = 'Invalid email address.';
            break;
        case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
            registerError.innerText = 'Password should be at least 6 characters (auth/weak-password).';
            break;
        default:
            registerError.innerText = `An error occurred: ${error.message}`;
            break;
    }
    });
}

function sendTokenToServer(idToken) {
    
    const serverEndpoint = 'http://localhost:3000/auth/register';

    // Make an HTTP POST request to the server
    fetch(serverEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: idToken}),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Server accepted the ID token
        console.log('ID Token sent to server successfully');
    
        return response.json(); // Assuming the server sends a JSON response
    })
    .then(data => {
        // Handle the server's response
        if (data.status === 'success') {
            // Redirect to another page
            window.location.href = '/auth/login';
        } else {
            // Display an error message
            alert('Server error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error sending ID token to server:', error.message);
        // Display an error message
        alert('Error sending ID token to server');
    });
}
