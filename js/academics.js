document.addEventListener("DOMContentLoaded", async () => {
  const dbResearch = (await fetchAPI("/research")) || [];
  const dbQuals = (await fetchAPI("/qualifications")) || [];
  const dbAwards = (await fetchAPI("/awards")) || [];
  const dbAchievements = (await fetchAPI("/achievements")) || [];

  // Sort all database items in reverse (descending) order
  dbResearch.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
  dbQuals.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
  dbAwards.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
  dbAchievements.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));

  const data = {
    research: dbResearch.map((r) => ({
      ...r,
      links: JSON.parse(r.links_json || "[]"),
    })),
    qualifications: dbQuals.map((q) => {
      let semesters = JSON.parse(q.semesters_json || "[]");
      // semesters.reverse(); // Reverse the nested semesters array
      return { ...q, semesters };
    }),
    awards: dbAwards,
    achievements: dbAchievements.map((a) => ({
      ...a,
      scores: JSON.parse(a.scores_json || "[]"),
    })),
  };

  renderResearch(data.research);
  renderQualifications(data.qualifications);
  renderAwards(data.awards);
  renderAchievements(data.achievements);

  if (typeof initScrollObserver === "function") initScrollObserver();

  // Fade out the loader once everything above is finished!
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.add("hidden");
});

function renderResearch(projects) {
  const grid = document.getElementById("research-grid");
  if (!grid) return;

  grid.innerHTML = projects
    .map((proj) => {
      const parsedDesc = proj.description
        ? typeof marked !== "undefined"
          ? marked.parse(proj.description)
          : proj.description
        : "";

      return `
        <div class="glass-card research-card">
            <h3>${proj.title}</h3>
            <div class="research-meta">
                <span><strong>Type:</strong> ${proj.subtitle}</span>
                <span><strong>Guide:</strong> ${proj.guide}</span>
                <span><strong>Location:</strong> ${proj.place}</span>
                <span><strong>Timeline:</strong> ${proj.timeline}</span>
                ${proj.collaborators ? `<span><strong>Collaborators:</strong> ${proj.collaborators}</span>` : ""}
            </div>

            ${
              parsedDesc
                ? `
                <div class="research-desc-container">
                    <button class="toggle-desc-btn" onclick="this.nextElementSibling.classList.toggle('expanded'); this.innerText = this.innerText.includes('View') ? 'Hide Description' : 'View Description'">
                        <i class="fa-solid fa-align-left"></i> View Description
                    </button>
                    <div class="research-desc">${parsedDesc}</div>
                </div>
            `
                : ""
            }

            <div class="asset-links" style="margin-top: auto;">
                ${proj.report_url ? `<a href="${proj.report_url}" class="asset-btn" target="_blank"><i class="fa-solid fa-file-pdf"></i> Report</a>` : ""}
                ${proj.slides_url ? `<a href="${proj.slides_url}" class="asset-btn" target="_blank"><i class="fa-solid fa-person-chalkboard"></i> Slides</a>` : ""}
                ${(proj.links || []).map((link) => `<a href="${link.url}" class="asset-btn" target="_blank"><i class="fa-solid fa-link"></i> ${link.name}</a>`).join("")}
            </div>
        </div>
    `;
    })
    .join("");
}

// Replace your renderQualifications function:
function renderQualifications(quals) {
  const container = document.getElementById("qualifications-container");
  if (!container) return;

  container.innerHTML = quals
    .map(
      (qual) => `
        <div class="qualification-block">
            <div class="qual-header">
                <div class="qual-header-top">
                    <div>
                        <h3>${qual.program}</h3>
                        <div style="color: var(--text-main); font-weight: 500;">${qual.institution}</div>
                        <div class="timeline">${qual.timeline}</div>
                    </div>
                    ${
                      qual.overall_score
                        ? `
                        <div class="overall-score">
                            <span class="score-label">Overall</span>
                            <span class="score-value">${qual.overall_score}</span>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>

            ${
              qual.semesters && qual.semesters.length > 0
                ? `
                <div class="qual-actions" style="margin-top: 0.5rem;">
                    <button class="toggle-desc-btn" onclick="toggleSemestersVisibility(this)">
                        <i class="fa-solid fa-layer-group"></i> View Details
                    </button>
                </div>
                <div class="accordions-container">
                    ${qual.semesters
                      .map(
                        (sem) => `
                        <details class="semester-accordion">
                            <summary>${sem.name} ${sem.score ? `<span style="color: var(--accent-violet); font-size: 0.9rem;">${sem.score}</span>` : ""}</summary>
                            <div class="semester-content">
                                ${(sem.courses || [])
                                  .map(
                                    (course) => `
                                    <div class="course-row">
                                        <span class="course-name">${course.name}</span>
                                        <span class="course-score">${course.score}</span>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </details>
                    `,
                      )
                      .join("")}
                </div>
            `
                : ""
            }
        </div>
    `,
    )
    .join("");
}

// Replace the old toggleAllSemesters function with this new one:
window.toggleSemestersVisibility = function (btn) {
  const container = btn
    .closest(".qualification-block")
    .querySelector(".accordions-container");
  container.classList.toggle("expanded");

  if (container.classList.contains("expanded")) {
    btn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Hide Details';
  } else {
    btn.innerHTML = '<i class="fa-solid fa-layer-group"></i> View Details';
  }
};

function renderAwards(awards) {
  const grid = document.getElementById("awards-grid");
  if (!grid) return;

  grid.innerHTML = awards
    .map((award) => {
      const parsedDesc = award.description
        ? typeof marked !== "undefined"
          ? marked.parse(award.description)
          : award.description
        : "";
      return `
        <div class="glass-card">
            <h3 style="color: var(--text-main); margin-bottom: 0.2rem; font-weight: 600;">${award.title}</h3>
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${award.subtitle} | ${award.date}</div>
            <div class="markdown-content" style="font-size: 0.95rem;">${parsedDesc}</div>
            ${award.link ? `<div class="asset-links" style="margin-top: 1rem;"><a href="${award.link}" class="asset-btn" target="_blank"><i class="fa-solid fa-link"></i> View</a></div>` : ""}
        </div>
    `;
    })
    .join("");
}

function renderAchievements(achievements) {
  const grid = document.getElementById("achievements-grid");
  if (!grid) return;
  grid.innerHTML = achievements
    .map(
      (ach) => `
        <div class="glass-card achievement-card">
            <h3 style="color: var(--text-main); margin-bottom: 0.2rem; font-weight: 600;">${ach.title}</h3>
            <div style="color: var(--text-muted); font-size: 0.9rem;">${ach.subtitle} | ${ach.date}</div>
            <div class="achievement-score-wrap">
                ${(ach.scores || [])
                  .map(
                    (s) => `
                    <div class="score-box">
                        <span class="score-label">${s.label}</span>
                        <span class="score-value">${s.value}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            ${ach.asset_url ? `<div class="asset-links"><a href="${ach.asset_url}" class="asset-btn" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Record</a></div>` : ""}
        </div>
    `,
    )
    .join("");
}
