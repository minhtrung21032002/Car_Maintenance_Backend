import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import {
    getStorage,
    ref,
    getDownloadURL, uploadBytes,
} from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js';

// Get the full URL
const currentUrl = window.location.href;

// Split the URL by '/' and get the last part
const parts = currentUrl.split('/');
const blogId = parts[parts.length - 1];
const create = parts[4]; // Get the fifth part, which is "create"
console.log('createa reach')
console.log(create); // Output: "create"

function hideCreateBanner(){
    let banner = document.querySelector('.newGuideBanner');
    console.log(banner)
    if (banner) {
        // Set the display property to "none"
        banner.style.display = 'none';
    }
}


function loadIntroductionData() {
    // Find Blog Id in URL
    // if (blogId == null) {
    //     console.log('blog id = null')
    //     fetch(` http://localhost:3000/guide/create/`).then(res => {
    //         console.log(res); return res.json();
    //     }).then(data => {
    //         renderStepInsertButton();
    //         renderIntroduction(data);
    //         handleInsert(blogId);
    //         console.log(data);

    //         // ./step-page.html?blog_id=${blogId}/new-after/0`;
    //     })

    // } else {

    // Fetch
    fetch(`http://localhost:3000/guide/blog/edit/intro/api/${blogId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            let stepsData;

        
            renderIntroduction(data);
            if (create === "create") {
                console.log("run run run");
                renderStepInsertButton();
                handleInsert(blogId);
            } else 
            { 
                renderStepsThumbList(data.steps, blogId);
                hideCreateBanner()
            }

        });
    // }
}
loadIntroductionData();

function renderIntroduction(data) {
    console.log(data.blog_information);
    console.log(data.blog_information.blog_title);
    document.querySelector('.guide-title').innerHTML = `
    ${data.blog_information.blog_title}`;


    document.getElementById('guideTitle').value = `${data.guide_information.guide_title
        }`;
    document.title = data.blog_information.blog_title;
    document.getElementById('introTitle').value = `${data.blog_information.blog_title}`;
    document.querySelector('#mytextarea').innerHTML = data.blog_information.introduction;
    document.querySelector('#mytextarea2').innerHTML = data.blog_information.conclusion ?
        data.blog_information.conclusion : 'Write conclusion here';
    // renderImages(data.intro_images);
    console.log(document.querySelector('#mytextarea').innerHTML)
    console.log( document.querySelector('#mytextarea2').innerHTML)
}

function renderImages(introImages) {
    const galleryElement = document.querySelector('#gallery');

    if (introImages.length > 0) {
        introImages.forEach(imageObj => {

            const imgElement = document.createElement('img');
            imgElement.src = imageObj.imgUrl;

            galleryElement.appendChild(imgElement);
        });
    }
}

function newHrefView() {
    const viewTab = document.querySelector('#blogLink');
    const newHref = (viewTab.href = `../../../blog/${blogId}`);
    console.log('view href:', newHref);
}
newHrefView();
function renderStepsThumbList(steps, blogId) {
    const stepsData = steps;
    const defaultStep = stepsData && stepsData[0]?.stepId;

    stepPageHref(blogId, defaultStep);

    let stepsHtml = '';
    stepsData.forEach(step => {
        stepsHtml += `
            <div class="draggable-item" data-id="${step.step_number[0]}">
            <img src="${step.step_imgs[0].img_url}" alt="" width=40 />
            </div>
        `;
    });

    document.querySelector('#draggable-list').innerHTML = stepsHtml;
}
console.log(document.getElementById('guideTitle'))
document.querySelector('#save').addEventListener('click', () => {
    // List hình
    /*
    var imageFiles = document.querySelector('input[type=file]').files;
    console.log(imageFiles);
    var introImages = [];

    for (var i = 0; i < imageFiles.length; i++) {
        var file = imageFiles[i];
        introImages.push({
            file: file,
        });
    }
    */
    uploadDataServer()

})

async function uploadDataServer() {

    const firebaseConfig = {
        apiKey: 'AIzaSyBXGDpGLkoxPHaMGIG-E6GxviDDssv-97c',
        authDomain: 'thesis-268ea.firebaseapp.com',
        projectId: 'thesis-268ea',
        storageBucket: 'thesis-268ea.appspot.com',
        messagingSenderId: '1065392850994',
        appId: '1:1065392850994:web:023a10aca1806650fd142b',
        measurementId: 'G-XHJ0ES966N',
    };

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app, 'gs://thesis-268ea.appspot.com');

    // Create a storage reference from our storage service
    const storageRef = ref(storage);
    var imageFiles = document.querySelector('input[type=file]').files;
    console.log(imageFiles[0])
    let imagesURL = [];
    let introductionIdRef = ref(storageRef, `introduction_edit_images/introduction_edit_${blogId}`);
    try {
        console.log('before reach file')
        const file = imageFiles[0];

        console.log(file);

        if (file !== undefined) {
            // Increment the uploaded file count
            const fileName = '/image.jpg';

            // Create a reference to the file inside the 'introduction_edit_images' folder
            const fileRef = ref(introductionIdRef, fileName);

            try {
                // Upload the file to Firebase Storage
                const snapshot = await uploadBytes(fileRef, file);
                console.log('Uploaded a blob or file!');

                // Get the download URL for the uploaded file
                const url = await getDownloadURL(fileRef);
                imagesURL.push(url);
                console.log(imagesURL);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        } else {
            console.log('File is undefined. Skipping upload.');
        }
    } catch (error) {
        console.log('Error:', error);
    }
    console.log('data')
    var introductionContent = tinymce.get('mytextarea').getContent();
    var conclusionContent = tinymce.get('mytextarea2').getContent();
    console.log(
        introductionContent, conclusionContent
    )
    var updatedData = {
        blog_information: {
            guide_title: document.getElementById('guideTitle').value,
            blog_title: document.getElementById('introTitle').value,
            time: document.getElementById("myRange").value * 60,
            difficulty: document.getElementById("difficultySelect").value,
            introduction: introductionContent,
            conclusion: conclusionContent,
            introImage: imagesURL
        }
    };

    fetch(`http://localhost:3000/guide/blog/edit/intro/${blogId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
        .then(response =>
            response.json())
        .then(data => {
            console.log(data.message)
            if (data.message === 'Update successful') {
                const currentUrl = window.location.href;
                const parts = currentUrl.split("/");
                let newUrl = `${parts.slice(0, -3).join("/")}/blog/edit/intro/${blogId}`;
                console.log(newUrl)
                if(create === "create"){
                    console.log('create')
              


                    history.pushState({}, '', newUrl);
                    location.reload();
                }else{
                    console.log('not reload')
                    location.reload();
                }
            }
            renderIntroduction(data);
        })
        .catch(error => {
            // console.error(error.message);
        });


}




// Update Href Value Of Step Page
function stepPageHref(blogId, stepId) {
    const guideStepsTab = document.querySelector('.tab-link[data-tab="guidesteps"]');

        // Get the base URL
    const baseUrl = window.location.origin + window.location.pathname;

    // Construct the new URL
    const newUrl = baseUrl.replace('/intro/', '/steps/');
    console.log('new url: ')
    console.log(newUrl)
   //  /edit/steps/:blog_id/new-after/:number
    if(stepId == undefined){
        console.log('step id = null')
        guideStepsTab.href = `../steps/${blogId}/new-after/0`
    }else{
        // Assign the new URL to href
        guideStepsTab.href = newUrl + `/${stepId}`
        console.log(guideStepsTab.href);
    }
    
}



tinymce.init({
    selector: '#mytextarea',
    toolbar:
        'undo redo | formatpainter casechange blocks | bold italic | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist checklist outdent indent | removeformat | a11ycheck code table',
    menubar: false,
    plugins: 'autoresize',
    height: 220,
    statusbar: false,
});
tinymce.init({
    selector: '#mytextarea2',
    toolbar:
        'undo redo | formatpainter casechange blocks | bold italic | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist checklist outdent indent | removeformat | a11ycheck code table',
    menubar: false,
    plugins: 'autoresize',
    height: 220,
    statusbar: false,
});

// renderNewIntroduction
function renderStepInsertButton() {
    const draggableList = document.querySelector('#draggable-list');
    draggableList.innerHTML = `
        <div style="width: 56px; height: 42px; border: 1px dashed black; display: flex; align-items: center; justify-content: center;">
            <a href="#" style="text-decoration: none; color: inherit;" id="insertStepLink">
                <i class="fa-solid fa-plus"></i>
            </a>
        </div>
    `;
}

function handleInsert(blogId) {
    console.log('runrun handleInsert')

    const newUrl = `../../blog/edit/steps/${blogId}/new-after/0`;
    document.querySelector('#insertStepLink').href = newUrl;

    document.querySelector('#guidestepsTab').classList.add('disabled');
    document.querySelector('#guidestepsTab').setAttribute('disabled', 'disabled');
    document.querySelector('#guidestepsTab').addEventListener('click', function(event) {
        // Prevent the default behavior of the click event
        event.preventDefault();

    })
}
