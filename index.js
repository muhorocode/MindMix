/* select the html elements */
const searchInput=document.getElementById('search-input')
const searchButton=document.getElementById('search-button')
const categoriesList=document.getElementById('categories-list')
const themeToggleButton=document.getElementById('theme-toggle')
const signInLink=document.getElementById('sign-in-link')
const sideBarPopularContainer=document.getElementById('popular-sidebar')
const popularPostsContainer=document.getElementById('popular-posts')
const latestArticlesContainer=document.getElementById('latest-articles')
const toggleSound=new Audio('audio/toggle sound.wav')
const noPosts=document.getElementById('no-posts-message')
// select the form elements
const writePostBtn=document.getElementById('write-post-btn')
const writePostForm=document.getElementById('write-post-form')
const titleInput=document.getElementById('post-title')
const authorInput=document.getElementById('post-author')
const categoryInput=document.getElementById('post-category')
const contentInput=document.getElementById('post-content')
const cancelBtn=document.getElementById('cancel-btn')
const imageUrl=document.getElementById('post-image-url')
  //trucks which post is being edited and if its null
let editPostId=null

//the display categories function
// render categories(reusable)
function displayCategories(categories){
    categoriesList.innerHTML='' //to clear any existing items

    categories.forEach(categoryObj=>{
        const li=document.createElement('li')
        const link=document.createElement('a')

        link.href='#'
        link.textContent=categoryObj.name // an object {id,name}

        //filter posts when category link is clicked

        link.addEventListener('click',()=>{
            fetch('http://localhost:3000/blogs')
            .then(response=>response.json())
            .then(blogs=>{
                const filteredPosts=categoryObj.name==='All'?blogs:blogs.filter(post=>post.category.toLowerCase()===categoryObj.name.toLowerCase())

                displayBlogPosts(filteredPosts, latestArticlesContainer)
            })
        })
        li.appendChild(link)
        categoriesList.appendChild(li)
    })
}
        //this function loads post into form for editing

 function loadPostIntoForm(post){
            titleInput.value=post.title
            authorInput.value=post.author
            categoryInput.value=post.category
            contentInput.value=post.content
            imageUrl.value=post.imageUrl

            editPostId=post.id //we are editing this post

            writePostForm.style.display='block' //display the form
            writePostBtn.style.display='none'// hide the write post button
            writePostForm.scrollIntoView({behavior:'smooth'})// smooth scroll to the form
        }

// display blog posts function
//display blog posts(reusable) any container
function displayBlogPosts(postsArray, container){
    container.innerHTML=''//clear container before adding posts
    if(postsArray.length===0){
        noPosts.style.display='block'
        return;//stops the function
    }else{
        noPosts.style.display='none'
    }
    postsArray.forEach(post=>{
        const card=document.createElement('div')
        card.classList.add('blog-card')

        card.innerHTML=`
        ${post.imageUrl? `<img src="${post.imageUrl}" alt="Blog Image" style="width: 100%; max-height: 200px; object-fit: cover;">` : ''}
        <h3>${post.title}</h3>
        <p><strong>By:</strong> ${post.author} | <strong>Category:</strong>${post.category}</p>
        <p>${post.content}</p>
        <p><em>${post.date}</em></P>
        <button class='edit-btn'>Edit</button>
        <button class='delete-btn'>Delete</button>`

        //edit button functionality

        const editbtn=card.querySelector('.edit-btn')
        editbtn.addEventListener('click', ()=>{
            loadPostIntoForm(post) //calls global function
        })

        //delete button functionality
        const deleteBtn=card.querySelector('.delete-btn')
        deleteBtn.addEventListener('click',()=>{
            deletePost(post.id)
        })
        container.appendChild(card)
    })
}

//the search function
function handleSearch(){
    const query=searchInput.value.trim().toLowerCase()
    fetch('http://localhost:3000/blogs')
    .then(response=>response.json())
    .then(blogs=>{
        const filteredPosts=blogs.filter(post=>
            post.title.toLowerCase().includes(query)||
            post.author.toLowerCase().includes(query)||
            post.content.toLowerCase().includes(query)
        )
      
        displayBlogPosts(filteredPosts,latestArticlesContainer)
    })
       .catch(error=>console.error('Error fetching blogs:', error))
}
// the fetch functions
// fetch categories from json server
function fetchAndDisplayCategories(){
    fetch('http://localhost:3000/categories')
    .then(response=>response.json())
    .then(categories=>displayCategories(categories))
    .catch(error=>console.error('Error Loading Categories:', error))
}

//fetch blog posts from json server
function fetchAndDisplayBlogPosts(){
    fetch('http://localhost:3000/blogs')
    .then(response=>response.json())
    .then(blogs=>{
        // display the latest 3 as 'popular' in sidebar

        const popularPosts=blogs.slice(-3).reverse()//latest 3 posts
        displayBlogPosts(popularPosts, sideBarPopularContainer)//sidebar
        displayBlogPosts(blogs.reverse(), latestArticlesContainer)//main section
    })
    .catch(error=>console.error('Error Loading blog posts:', error))
}

//the delete function
function deletePost(postId){
   fetch(`http://localhost:3000/blogs/${postId}`, {
    method:`DELETE`
   })
   .then(()=>{
    fetchAndDisplayBlogPosts()//refresh after delete
   })
   .catch(error=>console.error('Error Deleting Post', error))
}
//toggle function
function toggleTheme(){
    document.body.classList.toggle('dark-mode')
    toggleSound.play()//play toggle sound

    if(document.body.classList.contains('dark-mode')){
        themeToggleButton.textContent='☀️'
    }else{
        themeToggleButton.textContent='🌙'
    }
}

//event listener for theme toggle
themeToggleButton.addEventListener('click', toggleTheme)

//search event listener
searchButton.addEventListener('click',handleSearch)
searchInput.addEventListener('input',handleSearch)
searchInput.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){
        handleSearch()
    }
})
//call the fetch functions
fetchAndDisplayCategories()
fetchAndDisplayBlogPosts()

//show form when button is clicked
writePostBtn.addEventListener('click', ()=>{
    writePostForm.style.display='block'
    writePostBtn.style.display='none'
    writePostForm.scrollIntoView({behavior:'smooth'})
})
    //the cancel button
    cancelBtn.addEventListener('click',()=>{
        editPostId=null //to cancel editing
        writePostForm.reset()
        writePostForm.style.display='none'
        writePostBtn.style.display='block'
    })

//handling form submission
writePostForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    const goodImageUrl=imageUrl.value.trim()
     if(goodImageUrl.includes('<img')){
        alert('Please enter a valid image url!')
        return;
     }
    const newPost={
        title:titleInput.value,
        author: authorInput.value,
        category:categoryInput.value,
        content:contentInput.value,
        imageUrl:imageUrl.value,
        date: new Date().toISOString().split('T')[0]//today's date
        }

    //when we are in edit mode, do this
    
    if(editPostId){
        fetch(`http://localhost:3000/blogs/${editPostId}`, {
            method:'PUT',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(newPost)
        })
           .then(response=>response.json())
           .then(()=>{
            editPostId=null //resets after updating
            writePostForm.reset() //clears the form inputs
            writePostForm.style.display='none' //hide form
            writePostBtn.style.display='block' //display back write post button
                    //refresh blog posts
            fetchAndDisplayBlogPosts()
           })
           .catch(error=>console.error('Error updating the post', error))
    }else{

    fetch('http://localhost:3000/blogs',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(newPost)
    })
    .then(response=>response.json())
    .then(()=>{
        writePostForm.reset() //clear form inputs
        writePostForm.style.display='none'// hide form
        writePostBtn.style.display='block'// display back the button

        //refresh blog posts
        fetchAndDisplayBlogPosts()
    })
      .catch(error=>console.error('Error Creating New Post', error))
}
})