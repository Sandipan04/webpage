let allProjects = [];

document.addEventListener("DOMContentLoaded", async () => {
  const dbLab = (await fetchAPI("/lab")) || [];
  allProjects = dbLab.map((proj) => ({
    ...proj,
    tags: JSON.parse(proj.tags_json || "[]"),
    links: JSON.parse(proj.links_json || "[]"),
  }));

  renderLabGrid(allProjects);
  setupFilters();
  if (typeof initScrollObserver === "function") initScrollObserver();
});

function setupFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      const filterValue = e.target.getAttribute("data-filter");
      const filteredProjects =
        filterValue === "all"
          ? allProjects
          : allProjects.filter(
              (proj) => (proj.status || "").toLowerCase() === filterValue,
            );
      renderLabGrid(filteredProjects);
    });
  });
}

function renderLabGrid(projects) {
  const grid = document.getElementById("lab-grid");
  if (!grid) return;
  if (projects.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);"><i class="fa-solid fa-flask" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><p>No projects found.</p></div>`;
    return;
  }
  grid.innerHTML = projects
    .map((proj) => {
      let statusClass = "status-archived";
      const status = (proj.status || "").toLowerCase();
      if (status === "active") statusClass = "status-active";
      if (status === "experimental" || status === "failed")
        statusClass = "status-experimental";
      if (status === "completed") statusClass = "status-active";

      const imageHTML = proj.cover_image_url
        ? `<img src="${proj.cover_image_url}" alt="${proj.title}" class="lab-image">`
        : `<div class="lab-image" style="background: linear-gradient(45deg, rgba(10,14,23,1) 0%, rgba(0,242,254,0.1) 100%); display:flex; align-items:center; justify-content:center; color: var(--card-border); font-size: 3rem;"><i class="fa-solid fa-flask"></i></div>`;

      return `
            <div class="glass-card lab-card">
                <div class="lab-image-wrapper">
                    ${imageHTML}
                    <div class="lab-status ${statusClass}"><div class="status-dot"></div>${proj.status}</div>
                </div>
                <div class="lab-content">
                    <h3>${proj.title}</h3>
                    <div class="lab-subtitle">${proj.subtitle}</div>
                    <p class="lab-desc">${proj.description}</p>
                    <div class="lab-tags">
                        ${(proj.tags || []).map((tag) => `<span class="lab-tag">${tag}</span>`).join("")}
                    </div>
                    ${
                      proj.links && proj.links.length > 0
                        ? `
                        <div class="lab-footer">
                            ${proj.links.map((link) => `<a href="${link.url}" class="lab-btn" target="_blank"><i class="${link.icon || "fa-solid fa-link"}"></i> ${link.name}</a>`).join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
    })
    .join("");
}
