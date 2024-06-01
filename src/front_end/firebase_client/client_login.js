

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { sendPasswordResetEmail, GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword, getAuth } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js';

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
const provider = new GoogleAuthProvider();


// Access the authentication functionality
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submit');
    const submitGoogle = document.getElementById('submit_google');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Declare a variable to store the checkbox state
    let isChecked = rememberMeCheckbox.checked;


    emailInput.addEventListener('input', function () {
        if (emailInput.value.trim() !== '') {
          emailInput.classList.add('has-value');
        } else {
          emailInput.classList.remove('has-value');
        }
      });

      passwordInput.addEventListener('input', function () {
        if (passwordInput.value.trim() !== '') {
          passwordInput.classList.add('has-value');
        } else {
          passwordInput.classList.remove('has-value');
        }
      });

    // Add a change event listener to the checkbox
    rememberMeCheckbox.addEventListener('change', function () {
        // Retrieve the state of the checkbox
        isChecked = rememberMeCheckbox.checked;
        console.log(isChecked);
    });

    // Add click event listeners to the submit buttons
    submitButton.addEventListener('click', function () {
        signIn(isChecked);
    });

    submitGoogle.addEventListener('click', function () {
        signInGoogle(isChecked);
    });
    forgotPasswordForm.addEventListener('submit', function (event) {
        event.preventDefault();
        forgetPassword()
    });

    $('#exampleModal').on('hidden.bs.modal', function () {
        // Hide the success message when the modal is closed
        document.getElementById('resetPasswordSuccessMessage').style.display = 'none';
    });
})

// Normal Login
function signIn(rememberMe) {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginEroor = document.getElementById('loginError')
    // Sign in with email and password
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log(user)
      const endPoint = "login"
      sendTokenToServer(user.accessToken, rememberMe,endPoint)

    })
    .catch((error) => {
 
      loginEroor.style.display = 'block';
      switch (error.message) {
        case 'Firebase: Error (auth/invalid-credential).':
          loginEroor.innerText = 'Invalid email address and password. Or user does not exist.';
            break;
        case 'An error occurred: Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).':
          loginEroor.innerText = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
            break;
        default:
          loginEroor.innerText = `An error occurred: ${error.message}`;
            break;
    }

    });
}

// Gmail Login
function signInGoogle(rememberMe) {
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    const user = result.user;
    const endPoint = "login"
    sendTokenToServer(user.accessToken, rememberMe,endPoint )

  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

}


// Forget Password
function forgetPassword(){
    const reset_email = document.getElementById('resetEmail').value;    

    const resetPasswordSuccessMessage = document.getElementById('resetPasswordSuccessMessage');
    sendPasswordResetEmail(auth, reset_email)
    .then(() => {
   
        resetPasswordSuccessMessage.style.display = 'block';
   
    })
    .catch((error) => {
      console.log(error)
    });
}


    


function sendTokenToServer(idToken, rememberMe, endPoint) {
    console.log('hihi')
    const serverEndpoint = `http://localhost:3000/auth/${endPoint}`;
    console.log(serverEndpoint)
    console.log(idToken)
    // Make an HTTP POST request to the server
    fetch(serverEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: idToken, rememberMe: rememberMe }),
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
            window.location.href = '/main';
        } 
    })
    .catch(error => {
        console.error('Error sending ID token to server:', error.message);
        // Display an error message
        alert('Error sending ID token to server');
    });
}
