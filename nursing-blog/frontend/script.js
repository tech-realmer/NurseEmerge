// Hamburger menu toggle
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});

// Blog page: Fetch and display posts
if (document.getElementById('posts-container')) {
  fetch('/api/posts')
    .then(response => response.json())
    .then(posts => {
      const container = document.getElementById('posts-container');
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
          <h2>${post.title}</h2>
          <p>${post.content.substring(0, 100)}...</p>
          <p>${new Date(post.date).toLocaleDateString()}</p>
          <a href="
