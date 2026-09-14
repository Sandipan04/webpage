let albumsData = [];
// Track the active slide index for every album independently
let albumCurrentSlides = []; 
let currentLightboxAlbum = -1;
let currentLightboxImage = -1;

document.addEventListener('DOMContentLoaded', () => {
    fetchGalleries();
    setupLightbox();
});

async function fetchGalleries() {
    try {
        const response = await window.fetchAPI('/gallery');
        if (response) {
            let galleries = Array.isArray(response) ? response : (response.data || []);
            galleries.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
            
            albumsData = galleries.map(album => {
                let images = [];
                if (album.images_json) {
                    try {
                        images = typeof album.images_json === 'string' ? JSON.parse(album.images_json) : album.images_json;
                    } catch (e) {
                        console.error('Error parsing images:', e);
                    }
                }
                return { ...album, parsedImages: images };
            });
            
            // Initialize slide trackers with 0 (first slide) for each album
            albumCurrentSlides = new Array(albumsData.length).fill(0);
            renderGalleries(albumsData);
        }
    } catch (error) {
        console.error('Failed to fetch galleries:', error);
    } finally {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
        if (typeof window.initScrollObserver === 'function') window.initScrollObserver();
    }
}

function renderGalleries(galleries) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    galleries.forEach((album, albumIndex) => {
        if (!album.parsedImages || album.parsedImages.length === 0) return;

        const card = document.createElement('div');
        card.className = 'glass-card gallery-card animate-on-scroll';
        
        // 1. Force the card to fill the grid cell and use flexbox
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.height = '100%'; 
        
        let descHtml = '';
        if (album.description) {
            descHtml = window.marked ? window.marked.parse(album.description) : escapeHtml(album.description);
        }
        
        // --- TOP: Title and Description ---
        let html = `
            <div class="gallery-info" style="margin-bottom: 1.5rem;">
                <h2 class="gallery-title font-display" style="font-size: var(--fs-h4); margin-bottom: 0.5rem; color: var(--text-main);">${escapeHtml(album.title)}</h2>
                ${album.description ? `<div class="gallery-description markdown-content" style="color: var(--text-muted);">${descHtml}</div>` : ''}
            </div>
            
            <!-- --- MIDDLE: Slideshow Canvas --- -->
            <div class="slideshow-container" id="slideshow-${albumIndex}" style="width: 100%; aspect-ratio: 4/3; position: relative; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,0.6);">
        `;
        
        album.parsedImages.forEach((img, imgIndex) => {
            html += `
                <div class="slide ${imgIndex === 0 ? 'active' : ''}" id="slide-${albumIndex}-${imgIndex}">
                    <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.caption || album.title)}" loading="lazy" onclick="openLightbox(${albumIndex}, ${imgIndex})" style="cursor: pointer; width: 100%; height: 100%; object-fit: contain;" />
                    ${img.caption ? `<div class="slide-caption" style="position: absolute; bottom: 0; width: 100%; padding: 1.5rem 1rem 1rem 1rem; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); color: #fff; text-align: center; font-size: var(--fs-sm);">${escapeHtml(img.caption)}</div>` : ''}
                </div>
            `;
        });
        
        if (album.parsedImages.length > 1) {
            html += `
                <button class="slide-btn prev-btn" onclick="changeSlide(${albumIndex}, -1)" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="slide-btn next-btn" onclick="changeSlide(${albumIndex}, 1)" aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
                
                <div class="slide-indicators" id="indicators-${albumIndex}">
                    ${album.parsedImages.map((_, imgIndex) => `
                        <span class="dot ${imgIndex === 0 ? 'active' : ''}" onclick="goToSlide(${albumIndex}, ${imgIndex})"></span>
                    `).join('')}
                </div>
            `;
        }
        
        html += `</div>`; // Close slideshow-container
        
        // --- BOTTOM: Subtitle (Pushed down by margin-top: auto) ---
        if (album.subtitle) {
            html += `
                <div class="gallery-meta" style="margin-top: auto; padding-top: 1.5rem; text-align: right; color: var(--accent-cyan); font-family: var(--font-mono); font-size: var(--fs-sm); font-weight: 500; letter-spacing: var(--ls-wide);">
                    ${escapeHtml(album.subtitle)}
                </div>
            `;
        }
        
        card.innerHTML = html;
        container.appendChild(card);
    });
}

// Inline Slideshow Logic
window.changeSlide = function(albumIndex, direction) {
    const album = albumsData[albumIndex];
    if (!album) return;
    
    let currentIndex = albumCurrentSlides[albumIndex];
    let newIndex = currentIndex + direction;
    
    // Loop around if we hit the boundaries
    if (newIndex < 0) newIndex = album.parsedImages.length - 1;
    if (newIndex >= album.parsedImages.length) newIndex = 0;
    
    goToSlide(albumIndex, newIndex);
}

window.goToSlide = function(albumIndex, slideIndex) {
    const slideshow = document.getElementById(`slideshow-${albumIndex}`);
    if (!slideshow) return;
    
    // Update slide visibility
    const slides = slideshow.querySelectorAll('.slide');
    slides.forEach((slide, idx) => {
        if (idx === slideIndex) slide.classList.add('active');
        else slide.classList.remove('active');
    });
    
    // Update dot indicators
    const indicators = slideshow.querySelectorAll('.dot');
    indicators.forEach((dot, idx) => {
        if (idx === slideIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
    
    // Save state
    albumCurrentSlides[albumIndex] = slideIndex;
}

// Fullscreen Lightbox Logic
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    
    if (!lightbox) return;
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
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
    
    currentLightboxAlbum = albumIndex;
    currentLightboxImage = imageIndex;
    updateLightboxContent();
    
    lightbox.style.display = 'flex';
    void lightbox.offsetWidth; // Force CSS reflow
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

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
    if (currentLightboxAlbum === -1 || currentLightboxImage === -1) return;
    const album = albumsData[currentLightboxAlbum];
    if (!album || !album.parsedImages.length) return;
    
    currentLightboxImage += direction;
    if (currentLightboxImage < 0) {
        currentLightboxImage = album.parsedImages.length - 1;
    } else if (currentLightboxImage >= album.parsedImages.length) {
        currentLightboxImage = 0;
    }
    updateLightboxContent();
}

function updateLightboxContent() {
    const album = albumsData[currentLightboxAlbum];
    if (!album) return;
    
    const imgData = album.parsedImages[currentLightboxImage];
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
        counterEl.textContent = `${currentLightboxImage + 1} / ${album.parsedImages.length}`;
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return (unsafe + '').replace(/[&<"'>]/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '"': '&quot;', "'": '&#039;', '>': '&gt;' }[m];
    });
}