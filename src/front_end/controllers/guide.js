
const renderUI = data => {
    let content = '';
    data.forEach(blog => {
        content += ` 
        <a href="/guide/blog/${blog.blog_id}" class="col-md-4 blog-link">
            <figure class="blog-card">
                <div class="img-wrapper">
                    <img
                        src="${blog.img_url}"
                        onerror="this.src='../../assets/img/cat.jpg';"
                        class="blog-card-image" />
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${blog.guide_title}</h3>
                </div>
            </figure>
        </a>
    `;
    });
    document.querySelector('.cards-container').innerHTML = content;
};

// const getListBlogs = () => {
//     api.fetchData()
//         .then(result => {
//             renderUI(result.data);
//         })
//         .catch(err => {
//             console.log(err);
//         });
// };

// Assuming your JSON file is hosted or part of your project
const filePath = 'http://localhost:3000/guide/api';

// Fetch JSON data
fetch(filePath)
    .then(response => response.json())
    .then(data => {
        // Now 'data' contains the contents of the JSON file
        console.log(data);
        renderUI(data);
    })
    .catch(error => console.error('Error fetching JSON:', error));

function createGuide(){
    console.log('create guide')
    const addGuideLink = document.getElementById("addGuideLink");
    addGuideLink.addEventListener("click", function(event) {
        console.log('click')
        event.preventDefault(); // Prevent default behavior of anchor tag

        fetch("http://localhost:3000/guide/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Include any necessary data for creating the new document
            })
        })
        .then(response => response.json())
            .then(data => {
                console.log(data);
                // guide/
                window.location.href = `./guide/create/intro/${data.blogId}`;
            })

        .catch(error => {
            // Handle network errors
            console.error("Network error:", error);
        });
    });
}


createGuide()