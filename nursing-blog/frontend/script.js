// Configuration
const API_BASE_URL = 'http://localhost:3000'; // Change this for production

// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// Mobile Menu Toggle
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Blog Post Loading (for blog.html)
async function loadPosts() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const blogPosts = document.getElementById('blog-posts');
    const emptyState = document.getElementById('empty-state');

    // Show loading state
    if (loading) loading.classList.remove('hidden');
    if (error) error.classList.add('hidden');
    if (blogPosts) blogPosts.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/posts`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        // Hide loading
        if (loading) loading.classList.add('hidden');
        
        if (posts.length === 0) {
            // Show empty state
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            // Show posts
            if (blogPosts) {
                blogPosts.innerHTML = '';
                posts.forEach(post => {
                    const postElement = createPostCard(post);
                    blogPosts.appendChild(postElement);
                });
                blogPosts.classList.remove('hidden');
            }
        }
        
    } catch (err) {
        console.error('Error loading posts:', err);
        
        // Hide loading and show error
        if (loading) loading.classList.add('hidden');
        if (error) error.classList.remove('hidden');
    }
}

// Create post card HTML
function createPostCard(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition';
    
    // Format date
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Truncate content for preview
    const preview = post.content.length > 150 
        ? post.content.substring(0, 150) + '...' 
        : post.content;
    
    // Category color mapping
    const categoryColors = {
        'Clinical Care': 'bg-blue-100 text-blue-800',
        'Education': 'bg-green-100 text-green-800',
        'Career Growth': 'bg-purple-100 text-purple-800',
        'Community': 'bg-pink-100 text-pink-800',
        'Research': 'bg-yellow-100 text-yellow-800',
        'Technology': 'bg-indigo-100 text-indigo-800',
        'Leadership': 'bg-red-100 text-red-800',
        'Specialties': 'bg-gray-100 text-gray-800'
    };
    
    const categoryClass = categoryColors[post.category] || 'bg-gray-100 text-gray-800';
    
    postDiv.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${categoryClass}">
                ${post.category || 'General'}
            </span>
            <span class="text-sm text-gray-500">${formattedDate}</span>
        </div>
        <h3 class="text-xl font-bold text-nurse-dark-red mb-3 line-clamp-2">
            ${post.title}
        </h3>
        <p class="text-gray-600 mb-4 line-clamp-3">
            ${preview}
        </p>
        <div class="flex items-center justify-between">
            <div class="flex items-center text-sm text-gray-500">
                <i class="fas fa-user-circle mr-2"></i>
                <span>${post.author || 'Nurse Emerge'}</span>
            </div>
            <button onclick="readPost('${post.id}')" class="text-nurse-red font-semibold hover:text-nurse-dark-red transition">
                Read More →
            </button>
        </div>
        ${post.tags ? `
            <div class="mt-4 pt-4 border-t border-gray-100">
                <div class="flex flex-wrap gap-2">
                    ${post.tags.split(',').map(tag => 
                        `<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">${tag.trim()}</span>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    return postDiv;
}

// Read full post (placeholder for future implementation)
function readPost(postId) {
    // For now, just scroll to top and show an alert
    // In a full implementation, this would navigate to a detailed post view
    alert('Post reading functionality would be implemented here. Post ID: ' + postId);
}

// Form submission (for new-post.html)
const postForm = document.getElementById('post-form');
if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Publishing...';
        submitBtn.disabled = true;
        
        // Hide previous messages
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        try {
            // Get form data
            const formData = new FormData(postForm);
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                author: formData.get('author'),
                category: formData.get('category'),
                tags: formData.get('tags'),
                featured: formData.get('featured') === 'on',
                newsletter: formData.get('newsletter') === 'on',
                date: new Date().toISOString()
            };
            
            // Validate required fields
            if (!postData.title || !postData.content || !postData.author || !postData.category) {
                throw new Error('Please fill in all required fields');
            }
            
            if (postData.content.length < 200) {
                throw new Error('Post content must be at least 200 characters long');
            }
            
            // Submit to backend
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to publish post');
            }
            
            // Success
            successMessage.classList.remove('hidden');
            postForm.reset();
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth' });
            
        } catch (err) {
            console.error('Error submitting post:', err);
            errorText.textContent = err.message;
            errorMessage.classList.remove('hidden');
            
            // Scroll to error message
            errorMessage.scrollIntoView({ behavior: 'smooth' });
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Save draft functionality
function saveDraft() {
    const formData = new FormData(document.getElementById('post-form'));
    const draftData = {
        title: formData.get('title'),
        content: formData.get('content'),
        author: formData.get('author'),
        category: formData.get('category'),
        tags: formData.get('tags'),
        savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('blogDraft', JSON.stringify(draftData));
    
    // Show confirmation
    alert('Draft saved successfully!');
}

// Load draft on page load
function loadDraft() {
    const draft = localStorage.getItem('blogDraft');
    if (draft && postForm) {
        const draftData = JSON.parse(draft);
        
        // Ask user if they want to restore the draft
        if (confirm('A saved draft was found. Would you like to restore it?')) {
            document.getElementById('title').value = draftData.title || '';
            document.getElementById('content').value = draftData.content || '';
            document.getElementById('author').value = draftData.author || '';
            document.getElementById('category').value = draftData.category || '';
            document.getElementById('tags').value = draftData.tags || '';
        }
    }
}

// Character counter for content field
const contentField = document.getElementById('content');
if (contentField) {
    const counter = document.createElement('div');
    counter.className = 'text-sm text-gray-500 text-right mt-1';
    counter.id = 'char-counter';
    contentField.parentNode.appendChild(counter);
    
    function updateCharCounter() {
        const length = contentField.value.length;
        counter.textContent = `${length} characters`;
        
        if (length < 200) {
            counter.className = 'text-sm text-red-500 text-right mt-1';
        } else {
            counter.className = 'text-sm text-gray-500 text-right mt-1';
        }
    }
    
    contentField.addEventListener('input', updateCharCounter);
    updateCharCounter(); // Initial count
}

// Auto-resize textarea
if (contentField) {
    contentField.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

// Newsletter subscription (placeholder)
function subscribeNewsletter(email) {
    // Placeholder for newsletter subscription
    if (email && email.includes('@')) {
        alert('Thank you for subscribing to our newsletter!');
        return true;
    } else {
        alert('Please enter a valid email address.');
        return false;
    }
}

// Add newsletter form handlers
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForms = document.querySelectorAll('form, .newsletter-form');
    
    newsletterForms.forEach(form => {
        const emailInput = form.querySelector('input[type="email"]');
        const subscribeBtn = form.querySelector('button');
        
        if (emailInput && subscribeBtn && !form.id) { // Avoid the main post form
            subscribeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const email = emailInput.value;
                if (subscribeNewsletter(email)) {
                    emailInput.value = '';
                }
            });
        }
    });
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'blog.html':
        case '': // Default page
            if (document.getElementById('blog-posts')) {
                loadPosts();
            }
            break;
            
        case 'new-post.html':
            loadDraft();
            break;
    }
});

// Add loading states for buttons
function addLoadingState(button, loadingText = 'Loading...') {
    const originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
    button.disabled = true;
    
    return function() {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility function to truncate text
function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Export functions for global access
window.loadPosts = loadPosts;
window.readPost = readPost;
window.saveDraft = saveDraft;
window.subscribeNewsletter = subscribeNewsletter;