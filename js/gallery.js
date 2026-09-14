// gallery.js

let albumsData = [];
let currentAlbumIndex = -1;
let currentImageIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    fetchGalleries();
    setupLightbox();
});

async function fetchGalleries() {
    try {
        const response = await window.fetchAPI('/gallery');
        if (!response) return;

        let galleries = response;
        galleries.sort((a, b) => b.sort_order - a.sort_order);

        albumsData = galleries.map(album => {
            let images = [];
            if (album.images_json) {
                try {
                    images = typeof album.images_json === 'string' ? JSON.parse(album.images_json) : album.images_json;
                } catch (e) {
                    console.error('Error parsing images_json for album:', album.title, e);
                }
            }
            return { ...album, parsedImages: images };
        });

        renderGalleries(albumsData);
        if (window.dismissLoader) window.dismissLoader();
        if (window.initScrollObserver) window.initScrollObserver();
    } catch (error) {
        console.error('Failed to fetch galleries:', error);
        const container = document.getElementById('galleries-container');
        if (container) {
            container.innerHTML = '<p class="error-msg">Failed to load galleries. Please try again later.</p>';
        }
        if (window.dismissLoader) window.dismissLoader();
    }
}

function renderGalleries(galleries) {
    const container = document.getElementById('galleries-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    galleries.forEach((album, albumIndex) => {
        const card = document.createElement('div');
        card.className = 'glass-card gallery-card animate-on-scroll';
        
        let descHtml = '';
        if (album.description) {
            descHtml = window.marked ? window.marked.parse(album.description) : escapeHtml(album.description);
        }

        let html = `
            <div class="gallery-info">
                <h2 class="gallery-title font-display">${escapeHtml(album.title)}</h2>
                ${album.subtitle ? `<div class="gallery-subtitle">${escapeHtml(album.subtitle)}</div>` : ''}
                ${album.description ? `<div class="gallery-description markdown-content">${descHtml}</div>` : ''}
            </div>
            <div class="gallery-thumbs-grid">
        `;
        
        album.parsedImages.forEach((img, imgIndex) => {
            html += `
                <div class="gallery-thumb" onclick="openLightbox(${albumIndex}, ${imgIndex})">
                    <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.caption || album.title)}" loading="lazy" />
                    ${img.caption ? `<div class="thumb-caption">${escapeHtml(img.caption)}</div>` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        card.innerHTML = html;
        container.appendChild(card);
    });
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    
    if (!lightbox) return;

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'none' || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') navigateLightbox(-1);
        else if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

window.openLightbox = function(albumIndex, imageIndex) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    currentAlbumIndex = albumIndex;
    currentImageIndex = imageIndex;
    
    updateLightboxContent();
    
    lightbox.style.display = 'flex';
    // Trigger reflow for animation
    void lightbox.offsetWidth;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
};

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    lightbox.classList.remove('active');
    setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

function navigateLightbox(direction) {
    if (currentAlbumIndex === -1 || currentImageIndex === -1) return;
    
    const album = albumsData[currentAlbumIndex];
    if (!album || !album.parsedImages.length) return;
    
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = album.parsedImages.length - 1;
    } else if (currentImageIndex >= album.parsedImages.length) {
        currentImageIndex = 0;
    }
    
    updateLightboxContent();
}

function updateLightboxContent() {
    const album = albumsData[currentAlbumIndex];
    if (!album) return;
    
    const imgData = album.parsedImages[currentImageIndex];
    if (!imgData) return;
    
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const counterEl = document.getElementById('lightbox-counter');
    
    if (imgEl) {
        imgEl.src = imgData.url;
        imgEl.alt = imgData.caption || album.title;
    }
    
    if (captionEl) {
        captionEl.textContent = imgData.caption || '';
    }
    
    if (counterEl) {
        counterEl.textContent = `${currentImageIndex + 1} / ${album.parsedImages.length}`;
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return (unsafe + '').replace(/[&<"'>]/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '"': '&quot;',
            "'": '&#039;',
            '>': '&gt;'
        }[m];
    });
}
