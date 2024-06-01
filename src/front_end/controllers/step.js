import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytes,
} from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js';

let stepsData;
let stateData;
let uploadImagesURL = [];
let blogId;
let stepId;
let prevStepNumber;
let insert_new;
// Get Blog ID and Step ID
// Get the full URL
// Get the current URL
const currentUrl = window.location.href;

// Split the URL by "/"
const parts = currentUrl.split("/");

var new_after = parts[parts.length - 2];
if(new_after === "new-after"){
    insert_new = true;
    blogId = parts[parts.length - 3];
    prevStepNumber = parts[parts.length - 1];
    getInsertStepData(prevStepNumber, blogId);
}else{
    blogId = parts[parts.length - 2]; // Get the third-to-last part
    stepId = parts[parts.length - 1]; 
    getStepData();
}

function getInsertStepData(prevStepNumber, blogId) {
    fetch(`http://localhost:3000/guide/blog/edit/steps/insert/api/${blogId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        })
        .then(data => {
            console.log(data)
            renderStepsThumbListInsert(data.steps, prevStepNumber);
            const spanElement = document.querySelector('.toggleBar span');
            spanElement.style.display = "none";
            document.querySelector('.step-title').innerHTML = `Editing Step ${parseInt(prevStepNumber) + 1}`
            document.querySelector('.history-heading').innerHTML = data.blog_information.blog_title;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching data. Please try again later.');
        });
}

function newStepId(clickedStepId, blogId) {
    const newUrl = `./step-page.html?blog_id=${blogId}&step_id=${clickedStepId}`;
    history.pushState({}, '', newUrl);
    location.reload();
}

function renderStepsThumbListInsert(steps, prevStepNumber) {
    let stepsHtml = '';

    steps.splice(prevStepNumber, 0, { step_number: [prevStepNumber + 1] });

    steps.forEach((step, index) => {
        step.step_number[0] = index + 1;
    });
    steps.forEach((step, index) => {
        if (step.step_number[0] == parseInt(prevStepNumber) + 1) {
            stepsHtml += `
            <div class="draggable-item" data-id="${index + 1}">
                <img src="https://assets.cdn.ifixit.com/static/images/guide/NoImage_56x42.jpg" alt="" width=56 height=42/>
            </div>
            `;
        } else {
            stepsHtml += `
            <div class="draggable-item" data-id="${index + 1}">
            <img src="${step. step_imgs[0].img_url}" width=56 height=42 alt="" onclick="
                newStepId('${step.stepId}', '${blogId}')"/>
            </div>
            `;
        }
    });

    document.querySelector('#draggable-list').innerHTML = stepsHtml;
}

function renderStepsThumbList(steps) {
    const stepsData = steps;
    let stepsHtml = '';
    stepsData.forEach(step => {
        stepsHtml += `
        <div class="draggable-item" data-id="${step.step_number[0]}" style="background-image: url('${step.step_imgs[0].img_url}')" onclick="newStepId('${step.stepId}','${blogId}')">
        </div>                                                                                                              
    `;
    });

    document.querySelector('#draggable-list').innerHTML = stepsHtml;
}

function getStepData() {
    fetch(`http://localhost:3000/guide/blog/edit/steps/api/${blogId}/${stepId}`)
        .then(response => {

            return response.json();
        })
        .then(data => {
            console.log(data)
            stepsData = data.steps;
            stateData = data;
            for (const img_info of data.primary_step.step_imgs) {
                uploadImagesURL.push(img_info.img_url)
            }

            renderStepsThumbList(data.steps)
            renderStepContentDiv(data.primary_step.step_content);
            renderMainContent(data.blog_information, data.primary_step, data.steps);
            stepImages = [...data.primary_step.step_imgs];
            displayImages(stepImages);
        });
}

function handleInsert() {
    const stepNumber = stateData.primary_step.step_number[0];
    const newUrl = `./new-after/${stepNumber}`;
    history.pushState({}, '', newUrl);
    location.reload();
}


document.querySelector('#insertStep').addEventListener('click', function (e) {
    e.preventDefault();
    handleInsert();
});
// Image Input START
const inputs = document.querySelectorAll('.input-image');
const imgWrappers = document.querySelectorAll('.image-wrapper.thumb-wrapper');
const bigStepImage = document.querySelector('#bigStepImage .image-wrapper');
let stepImages = [];

function displayImages(stepImages) {
    stepImages.forEach((img, index) => {
        imgWrappers[index].innerHTML = `<img src="${img.img_url}" alt=""/>`;
        imgWrappers[index].nextElementSibling.style.display = 'none';
    });
    bigStepImage.innerHTML = `<img src="${stepImages[0].img_url}" alt=""/>`;
    bigStepImage.nextElementSibling.style.display = 'none';
    console.log(stepImages)
}

if (stepImages.length > 0) {
    stepImages.forEach((img, index) => {

        imgWrappers[index].innerHTML = `<img src="${img.img_url}" alt=""/>`;
        imgWrappers[index].nextElementSibling.style.display = 'none';
    });
    displayImages(stepImages);
}
// Upload single image

inputs.forEach((input, index) => {
    input.addEventListener('change', function () {
        const file = input.files;
        const newStepImg = {
            img_url: `${URL.createObjectURL(file[0])}`,
            img_number: 1,
        };

        if (index < 2) {
            stepImages[0] = newStepImg;
        } else {
            stepImages[index - 1] = newStepImg;
        }
        console.log(stepImages);
        displayImages(stepImages);
    });
});

// Image Input END

function handleDelete(deleteHref) {
    const apiUrl = `http://localhost:3000/guide/blog/edit/steps/delete/${stepId}/${blogId}`;

   // Original URL
var originalURL = "http://localhost:3000/guide/blog/edit/steps/657e6ae7817b8b95953fa2d4/658bf0e814edd9039";

// Portion to be extracted
var portionToExtract = "http://localhost:3000/guide/blog/edit/steps/";

// Extract the portion
var extractedPortion = originalURL.substring(0, portionToExtract.length);

var result = extractedPortion + deleteHref
// Output the extracted portion
console.log(result);


    fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ steps: updatedSteps }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => { 
            console.log('Patch request successful:', data);
            if(data.blog_information.steps.length === 0){
                window.location.href = `../${blogId}/new-after/0`
            }else{
                window.location.href = result;
            }
            console.log(data)
        })
        .catch(error => {
            console.error('Error during PATCH request:', error);
        });
}

function renderMainContent(blog_info, primary_step, steps) {
    document.querySelector('.history-heading').innerHTML = blog_info.blog_title;
    document.querySelector('.step-title').innerHTML = `Editing Step - ${primary_step.step_number[0]}  `;
    document.title = blog_info.blog_title;
    var currentStepNumber = primary_step.step_number[0];
    var currentStepId = primary_step.stepId;
    var nextStep;
    console.log(currentStepNumber);
    // CHUA HANDLE TRUONG HOP STEPS CO 1 ELEMENT => steps[1] => error
    steps.forEach(step => {

    });
    let newHrefDelete;
    if(steps.length === 1){
        nextStep = steps[0].stepId
    }else{
        nextStep = steps[1].stepId
    }
    if (currentStepNumber === 1) {
        newHrefDelete = document.querySelector(
            '#deleteStep'
        ).href = `${blogId}/${nextStep} `;
    } else {
        const previousStep = steps[currentStepNumber - 2].stepId;
        newHrefDelete = document.querySelector(
            '#deleteStep'
        ).href = `${blogId}/${previousStep} `;
    }
    document.querySelector('#deleteStep').addEventListener('click', function (e) {
        e.preventDefault();
        handleDelete(newHrefDelete);
    });
}

function renderStepContentDiv(step_content) {

    step_content.forEach(step => {

        const lineDiv = document.createElement('div');
        lineDiv.classList.add('line');
        const paragraph = document.createElement('div');
        paragraph.classList.add('p-inline');
        paragraph.innerHTML = step.content_div;
        paragraph.dataset.icon = step.icon;
        const step_icon = step.icon;
        if (step_icon == 'icon_note') {
            lineDiv.insertAdjacentHTML(
                'afterbegin',
                '<div class="icon bullet bullet_note fa-solid fa-circle-info"></div>'
            );
        } else if (step_icon == 'icon_caution') {
            lineDiv.insertAdjacentHTML(
                'afterbegin',
                '<div class="icon bullet bullet_caution fa-solid fa-triangle-exclamation"></div>'
            );
        } else if (step_icon == 'icon_reminder') {
            lineDiv.insertAdjacentHTML(
                'afterbegin',
                '<div class="icon bullet bullet_reminder fa-solid fa-thumbtack"></div>'
            );
        } else {
            lineDiv.insertAdjacentHTML(
                'afterbegin',
                `<div class="icon fa fa-circle bullet bullet_${step_icon}"></div>`
            );
        }
        lineDiv.appendChild(paragraph);
        document.getElementById('myEditor').appendChild(lineDiv);
        newTextEditor(paragraph);

        const bulletIcon = lineDiv.querySelector('.bullet');
        bulletIcon.addEventListener('click', function (event) {
            event.stopPropagation();
            const bulletsPanel = createBulletsPanel(step_icon, lineDiv);
            togglePanel(bulletsPanel);
        });
    });
}

function createBulletsPanel(step_icon, lineDiv) {
    const bulletsPanel = document.createElement('div');
    bulletsPanel.classList.add('bullets-panel');

    const icons = [{ name: "black", content: 'blackdot' }, { name: 'thumbtack', content: 'note' }, { name: 'triangle-exclamation', content: "caution" }, {
        name: 'circle-info', content:
            "reminder"
    }];
    icons.forEach(iconClass => {
        const iconContainer = document.createElement('h2');
        iconContainer.insertAdjacentHTML('afterbegin', `<span>${iconClass.content}</span>`)
        const icon = document.createElement('div');
        console.log('icon', iconClass.name)
        if (iconClass.name == 'black') {
            console.log('have black')
            icon.classList.add('bullet_black', 'fa', 'fa-circle', 'bullet')
        } else { icon.classList.add('icon', 'bullet', `fa-solid`, `fa-${iconClass.name}`, `bullet_${iconClass.content}`); }

        iconContainer.addEventListener('click', function () {
            const bulletIcon = lineDiv.querySelector('.line > .bullet');


            bulletIcon.classList.remove('fa-circle', 'bullet_black', `fa-thumbtack`, 'fa-triangle-exclamation', 'fa-circle-info', 'bullet_note', 'bullet_reminder', 'bullet_caution');
            bulletIcon.classList.add(`fa-${iconClass.name}`);
            if (iconClass.content == 'note') {
                bulletIcon.classList.add(`bullet_note`);
                lineDiv.querySelector('.p-inline').dataset.icon = 'icon_note';
            }
            else if (iconClass.content == 'caution') {
                bulletIcon.classList.add(`bullet_caution`);
                lineDiv.querySelector('.p-inline').dataset.icon = 'icon_caution';
            }
            else if (iconClass.content == 'reminder') {
                bulletIcon.classList.add('bullet_reminder');
                lineDiv.querySelector('.p-inline').dataset.icon = 'icon_reminder';
            }
            else if (iconClass.content == 'blackdot') {
                bulletIcon.className += `bullet_black fa-circle`;
                lineDiv.querySelector('.p-inline').dataset.icon = 'black';
            }
        });
        iconContainer.appendChild(icon);
        bulletsPanel.appendChild(iconContainer);
    });

    lineDiv.appendChild(bulletsPanel);
    return bulletsPanel;
}

// Add event listener to close the panel when clicking outside
document.addEventListener('click', function (event) {
    const panels = document.querySelectorAll('.bullets-panel');
    panels.forEach(panel => {
        if (!panel.contains(event.target)) {
            panel.classList.remove('active');
        }
    });
});

function togglePanel(panel) {
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
    }
}

function newHrefIntroductionandView() {
    const introductionTab = document.getElementById('introductionTab');
    const guideTab = document.getElementById('guideId');
    const viewTab = document.querySelector('#blogLink');
    // Get the link element by its id
    if(insert_new){
        console.log('insert_new = true')
        guideTab.href = '../../../../../../guide'
        introductionTab.href = `../../../`+`intro/${blogId}`;
        viewTab.href = `../../../../${blogId}`;
    }else{
        console.log('insert_new = false')
        introductionTab.href = `../../`+`intro/${blogId}`;
        viewTab.href = `../../../${blogId}`;
    }

}


newHrefIntroductionandView()

function handleUpdateSteps() {
    let isDraggingEnabled = false;

    function toggleButtonsVisibility(isDraggingEnabled) {
        const saveCancelButtons = document.getElementById('saveCancelButtons');

        if (isDraggingEnabled) {
            saveCancelButtons.style.display = 'block';
        } else {
            saveCancelButtons.style.display = 'none';
        }
    }

    toggleButtonsVisibility(isDraggingEnabled);

    const draggableList = new Draggable.Sortable(document.querySelectorAll('#draggable-list'), {
        draggable: '.draggable-item',
        mirror: {
            constrainDimensions: true,
        },
        classes: {
            mirror: 'draggable-mirror',
        },
        dragClass: 'sortable-source--is-dragging',
    });

    draggableList.on('sortable:start', event => {
        if (!isDraggingEnabled) {
            event.cancel();
        }
    });

    draggableList.on('sortable:stop', event => {
        const draggedItem = event.data.dragEvent.source;
        const itemId = draggedItem.getAttribute('data-id');
        console.log('Dropped item with ID:', itemId);
    });

    document.querySelector('.rearrange-steps-button').addEventListener('click', function () {
        isDraggingEnabled = !isDraggingEnabled;
        console.log(isDraggingEnabled);

        toggleButtonsVisibility(isDraggingEnabled);
    });

    document.getElementById('saveStepsButton').addEventListener('click', function () {
        console.log(stepsData);
        const updatedOrder = Array.from(document.querySelectorAll('.draggable-item')).map(item =>
            item.getAttribute('data-id')
        );

        const updatedSteps = stepsData.map(step => {
            const newStepNumber = updatedOrder.indexOf(step.step_number[0].toString()) + 1;
            return { ...step, step_number: [newStepNumber] };
        });
        console.log(updatedSteps);
        sendPatchRequest(updatedSteps);
        isDraggingEnabled = false;
        toggleButtonsVisibility(isDraggingEnabled);
    });

    document.getElementById('cancelStepsButton').addEventListener('click', function () {
        isDraggingEnabled = false;
        toggleButtonsVisibility(isDraggingEnabled);
    });

    function sendPatchRequest(updatedSteps) {
        const apiUrl = `http://localhost:3000/guide/blog/edit/steps/${blogId}`;

        fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ steps: updatedSteps }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.message === 'Update successful') {
                    // Reload the page
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error during PATCH request:', error);
            });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    handleUpdateSteps();
});



function saveImageAndParagraphFirebase() {
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
    document.getElementById('saveBtn').addEventListener('click', async () => {
        // Paragraph input
        const paragraphs = document.querySelectorAll('.p-inline');

        const paragraphsArray = Array.from(paragraphs);
        console.log(paragraphsArray);
        const stepContentArray = [];

        paragraphsArray.forEach((paragraph, index) => {
            const content = paragraph.innerHTML.trim();
            const icon = paragraph.dataset.icon;
            console.log(icon);

            const stepContentObj = {
                content_div_number: index + 1,
                content_div: content,
                icon: icon,
            };

            stepContentArray.push(stepContentObj);
        });

        const jsonStepContent = {
            step_content: stepContentArray,
        };

        const jsonString = JSON.stringify(jsonStepContent);

        // Images input
        console.log(stepImages);
        const fileInputs = document.querySelectorAll('.input-image');


        try {
            let stepIdRef = ref(storageRef, `steps_edit_images/step_edit_${stepId}`);
            if (stepId == null) {
                stepIdRef = ref(storageRef, `steps_edit_images/step_insert_${parseInt(prevStepNumber) + 1}`);
            }
            let uploadedFileCount = 0;
            let method;
            let apiURL;
            const promises = [];
            let sharedFileName = '';

            for (let i = 0; i < fileInputs.length; i++) {
                const file = fileInputs[i].files[0];
                console.log(file)

                if (file !== undefined) {

                    // Increment the uploaded file count
                    const fileName = i < 2 ? sharedFileName || `/image_${i}.jpg` : `/image_${i}.jpg`;

                    if (i < 2 && sharedFileName === '') {
                        sharedFileName = fileName;
                    }

                    // Create a reference to the file inside the 'step_id' folder
                    const fileRef = ref(stepIdRef, fileName);

                    try {
                        // Upload the file to Firebase Storage
                        const snapshot = await uploadBytes(fileRef, file);
                        console.log('Uploaded a blob or file!');

                        // Push the promise returned by getDownloadURL() into the promises array
                        promises.push(getDownloadURL(fileRef).then(url => {

                            if (i === 0 || i === 1) {
                                uploadImagesURL[0] = url;
                            } else if (i === 2) {
                                uploadImagesURL[1] = url;
                            } else if (i === 3) {
                                uploadImagesURL[2] = url;
                            }


                            console.log(uploadImagesURL);
                        }).catch(error => {
                            console.log('Error getting download URL:', error);
                        }));
                    } catch (error) {
                        console.error('Error uploading file:', error);
                    }
                } else {
                    console.log('File is undefined. Skipping upload.');
                }

                await Promise.all(promises);


            }
            if (stepId == null) { // EDIT WHEN USER CLICK INSERT
                method = "POST"
                apiURL = `http://localhost:3000/guide/blog/edit/steps/${blogId}`;
                console.log('POST')
                uploadDataServer(uploadImagesURL, jsonString, apiURL, method);
            } else { // EDIT WHEN USER EDIT AN EXISTING STEP
                method = "PATCH"
                apiURL = `http://localhost:3000/guide/blog/edit/steps/${blogId}/${stepId}`;
                console.log('PATCH')
                uploadDataServer(uploadImagesURL, jsonString, apiURL, method);
            }

        } catch (error) {
            console.error('Error uploading images:', error);
        }



    });
}

saveImageAndParagraphFirebase();
function uploadDataServer(stepImages, stepContent, apiURL, method) {
    const filteredStepImages = stepImages.filter(image => image.img_url !== null);
    console.log('before submit')
    console.log(stepContent)
    fetch(apiURL, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: filteredStepImages, stepContent: stepContent, prevStepNumber: prevStepNumber }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Request submit data successful:', data);
            console.log(data)
            const newStepId = data.CreatedStepId;
            const editedStepId = data.EditedStepId;

            if (newStepId != undefined) {
                const newUrl = `../../${blogId}/${newStepId}`;
                console.log(newUrl);
                history.pushState({}, '', newUrl);
                location.reload();
            } else {
                const newUrl = `../${blogId}/${editedStepId}`;
                history.pushState({}, '', newUrl);
                location.reload();
            }




            //window.location.href = deleteHref;
        })
        .catch(error => {
            console.error('Error during submit data request:', error);
        });
}


// Editor START
function newTextEditor(targetElement) {
    const editor = tinymce.init({
        target: targetElement,
        inline: true,
        menubar: false,
        toolbar: 'undo redo bold italic underline',
        min_height: 100,
        resize: true,
        plugins: 'autoresize',
        statusbar: false,
    });
}

document.getElementById('addBtn').addEventListener('click', () => {
    const lineDiv = document.createElement('div');
    lineDiv.classList.add('line');
    lineDiv.insertAdjacentHTML('afterbegin', '<div class="icon fa fa-circle bullet bullet_black"></div>');
    const paragraph = document.createElement('div');
    paragraph.classList.add('p-inline');
    paragraph.innerHTML = 'Your wisdom here';
    paragraph.dataset.icon = 'black';
    lineDiv.appendChild(paragraph);

    const bulletIcon = lineDiv.querySelector('.bullet');
    bulletIcon.addEventListener('click', function (event) {
        event.stopPropagation();
        const bulletsPanel = createBulletsPanel('black', lineDiv);
        togglePanel(bulletsPanel);
    });


    document.getElementById('myEditor').appendChild(lineDiv);
    if (!paragraph) {
        return;
    }
    newTextEditor(paragraph);
});
// Editor End