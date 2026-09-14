// lab.js

let allProjects = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchLabData();
    setupFilters();
});

async function fetchLabData() {
    try {
        const response = await window.fetchAPI('/lab');
        if (response.success && response.data) {
            allProjects = response.data.sort((a, b) => b.id - a.id);
            renderLabGrid(allProjects);
            if (typeof window.dismissLoader === 'function') {
                window.dismissLoader();
            }
        } else {
            console.error('Failed to load lab data:', response);
            renderEmptyState();
        }
    } catch (error) {
        console.error('Error fetching lab data:', error);
        renderEmptyState();
    }
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const filter = e.currentTarget.getAttribute('data-filter');
            if (filter === 'all') {
                renderLabGrid(allProjects);
            } else {
                const filtered = allProjects.filter(p => {
                    const statusStr = (p.status || '').toLowerCase();
                    return statusStr === filter;
                });
                renderLabGrid(filtered);
            }
        });
    });
}

function getStatusClass(status) {
    if (!status) return 'status-archived';
    const s = status.toLowerCase();
    if (s.includes('active')) return 'status-active';
    if (s.includes('experimental')) return 'status-experimental';
    if (s.includes('completed')) return 'status-completed';
    return 'status-archived';
}

function parseJSONSafely(str, fallback = []) {
    if (!str) return fallback;
    try {
        if (typeof str === 'string') {
            return JSON.parse(str);
        }
        return str;
    } catch (e) {
        console.error('Error parsing JSON:', e, str);
        return fallback;
    }
}

function renderLabGrid(projects) {
    const grid = document.getElementById('lab-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!projects || projects.length === 0) {
        renderEmptyState();
        return;
    }
    
    projects.forEach((project, index) => {
        const delay = index * 100;
        
        const tags = parseJSONSafely(project.tags_json, []);
        const links = parseJSONSafely(project.links_json, []);
        
        const statusStr = project.status || 'Archived';
        const statusClass = getStatusClass(statusStr);
        
        const card = document.createElement('article');
        card.className = 'lab-card glass-card animate-on-scroll';
        card.style.animationDelay = `${delay}ms`;
        
        // Image or fallback
        let imageHtml = '';
        if (project.image_url) {
            imageHtml = `<img src="${project.image_url}" alt="${project.title}" class="lab-card-img" loading="lazy">`;
        } else {
            imageHtml = `
                <div class="lab-card-fallback">
                    <i class="fa-solid fa-flask"></i>
                </div>
            `;
        }
        
        // Tags
        let tagsHtml = '';
        if (tags && tags.length > 0) {
            tagsHtml = `
                <div class="lab-card-tags">
                    ${tags.map(t => `<span class="lab-tag">${t}</span>`).join('')}
                </div>
            `;
        }
        
        // Links
        let linksHtml = '';
        if (links && links.length > 0) {
            linksHtml = `
                <div class="lab-card-footer">
                    ${links.map(link => {
                        const icon = link.icon || 'fa-solid fa-link';
                        const label = link.label || 'View';
                        return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="lab-card-link"><i class="${icon}"></i> ${label}</a>`;
                    }).join('')}
                </div>
            `;
        }
        
        // Markdown parsing for description
        let descHtml = project.description || '';
        if (typeof window.marked !== 'undefined' && window.marked.parse) {
            descHtml = window.marked.parse(descHtml);
        }
        
        card.innerHTML = `
            <div class="lab-card-image-wrapper">
                ${imageHtml}
                <div class="status-badge">
                    <div class="status-dot ${statusClass}"></div>
                    <span>${statusStr}</span>
                </div>
            </div>
            <div class="lab-card-content">
                <h3 class="lab-card-title">${project.title || 'Untitled Project'}</h3>
                ${tagsHtml}
                <div class="lab-card-desc markdown-content">
                    ${descHtml}
                </div>
                ${linksHtml}
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    initScrollObserver();
}

function renderEmptyState() {
    const grid = document.getElementById('lab-grid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="lab-empty animate-on-scroll">
            <i class="fa-solid fa-vial-circle-check"></i>
            <h3>No projects found</h3>
            <p>Try adjusting your filters or check back later.</p>
        </div>
    `;
}

function initScrollObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}
