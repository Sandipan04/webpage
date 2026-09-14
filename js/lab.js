let allProjects = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchLabData();
    setupFilters();
});

async function fetchLabData() {
    try {
        const response = await window.fetchAPI('/lab');
        let projects = [];
        
        // Handle both object {data: []} and raw array [] API returns
        if (response && response.success && response.data) {
            projects = response.data;
        } else if (Array.isArray(response)) {
            projects = response;
        }

        if (projects.length > 0) {
            allProjects = projects.sort((a, b) => (b.sort_order || b.id) - (a.sort_order || a.id));
            renderLabGrid(allProjects);
        } else {
            renderEmptyState();
        }
    } catch (error) {
        console.error('Error fetching lab data:', error);
        renderEmptyState();
    } finally {
        // Manually hide loader regardless of success or failure
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
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
        return typeof str === 'string' ? JSON.parse(str) : str;
    } catch (e) {
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
        
        let imageHtml = project.image_url 
            ? `<img src="${project.image_url}" alt="${project.title}" class="lab-card-img" loading="lazy">`
            : `<div class="lab-card-fallback"><i class="fa-solid fa-flask"></i></div>`;
        
        let tagsHtml = tags.length > 0 ? `<div class="lab-card-tags">${tags.map(t => `<span class="lab-tag">${t}</span>`).join('')}</div>` : '';
        let linksHtml = links.length > 0 ? `<div class="lab-card-footer">${links.map(l => `<a href="${l.url}" target="_blank" class="lab-card-link"><i class="${l.icon || 'fa-solid fa-link'}"></i> ${l.label || 'View'}</a>`).join('')}</div>` : '';
        
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
                <div class="lab-card-desc markdown-content">${descHtml}</div>
                ${linksHtml}
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (typeof initScrollObserver === 'function') initScrollObserver();
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