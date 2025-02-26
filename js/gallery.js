document.addEventListener('DOMContentLoaded', () => {
    fetch('data/gallery.json')
        .then(response => response.json())
        .then(data => renderGallery(data.posts));

    function renderGallery(posts) {
        const container = document.getElementById('gallery-posts');
        
        posts.forEach(post => {
            const postHTML = `
                <div class="gallery-post">
                    <img src="${post.image}" alt="${post.caption}" class="gallery-image">
                    <div class="caption">${post.caption}</div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', postHTML);
        });
    }
});

// Updated to handle markdown files
document.addEventListener('DOMContentLoaded', () => {
    fetch('/_data/gallery/*.json')
        .then(response => response.json())
        .then(data => renderGallery(data));
});