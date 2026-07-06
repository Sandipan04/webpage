document.addEventListener("DOMContentLoaded", async () => {
  const dbResearch = (await fetchAPI("/research")) || [];
  const dbQuals = (await fetchAPI("/qualifications")) || [];
  const dbAwards = (await fetchAPI("/awards")) || [];
  const dbAchievements = (await fetchAPI("/achievements")) || [];

  const data = {
    research: dbResearch.map((r) => ({
      ...r,
      links: JSON.parse(r.links_json || "[]"),
    })),
    qualifications: dbQuals.map((q) => ({
      ...q,
      semesters: JSON.parse(q.semesters_json || "[]"),
    })),
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
});

function renderResearch(projects) {
  const grid = document.getElementById("research-grid");
  if (!grid) return;
  grid.innerHTML = projects
    .map(
      (proj) => `
        <div class="glass-card research-card">
            <h3>${proj.title}</h3>
            <div class="research-meta">
                <span><strong>Type:</strong> ${proj.subtitle}</span>
                <span><strong>Guide:</strong> ${proj.guide}</span>
                <span><strong>Location:</strong> ${proj.place}</span>
                <span><strong>Timeline:</strong> ${proj.timeline}</span>
                ${proj.collaborators ? `<span><strong>Collaborators:</strong> ${proj.collaborators}</span>` : ""}
            </div>
            ${proj.description ? `<p class="research-desc">${proj.description}</p>` : ""}

            <div class="asset-links">
                ${proj.report_url ? `<a href="${proj.report_url}" class="asset-btn" target="_blank"><i class="fa-solid fa-file-pdf"></i> Report</a>` : ""}
                ${proj.slides_url ? `<a href="${proj.slides_url}" class="asset-btn" target="_blank"><i class="fa-solid fa-person-chalkboard"></i> Slides</a>` : ""}
                ${(proj.links || []).map((link) => `<a href="${link.url}" class="asset-btn" target="_blank"><i class="fa-solid fa-link"></i> ${link.name}</a>`).join("")}
            </div>
        </div>
    `,
    )
    .join("");
}

function renderQualifications(quals) {
  const container = document.getElementById("qualifications-container");
  if (!container) return;
  container.innerHTML = quals
    .map(
      (qual) => `
        <div class="qualification-block">
            <div class="qual-header">
                <h3>${qual.program}</h3>
                <div style="color: var(--text-main); font-weight: 500;">${qual.institution}</div>
                <div class="timeline">${qual.timeline}</div>
            </div>
            <div class="accordions-container">
                ${(qual.semesters || [])
                  .map(
                    (sem) => `
                    <details class="semester-accordion">
                        <summary>${sem.name}</summary>
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
        </div>
    `,
    )
    .join("");
}

function renderAwards(awards) {
  const grid = document.getElementById("awards-grid");
  if (!grid) return;
  grid.innerHTML = awards
    .map(
      (award) => `
        <div class="glass-card">
            <h3 style="color: #fff; margin-bottom: 0.2rem;">${award.title}</h3>
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${award.subtitle} | ${award.date}</div>
            <p style="font-size: 0.95rem;">${award.description}</p>
            ${award.link ? `<div class="asset-links" style="margin-top: 1rem;"><a href="${award.link}" class="asset-btn" target="_blank"><i class="fa-solid fa-link"></i> View</a></div>` : ""}
        </div>
    `,
    )
    .join("");
}

function renderAchievements(achievements) {
  const grid = document.getElementById("achievements-grid");
  if (!grid) return;
  grid.innerHTML = achievements
    .map(
      (ach) => `
        <div class="glass-card achievement-card">
            <h3 style="color: #fff; margin-bottom: 0.2rem;">${ach.title}</h3>
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
