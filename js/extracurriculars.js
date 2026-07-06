document.addEventListener("DOMContentLoaded", async () => {
  const dbClubs = (await fetchAPI("/clubs")) || [];
  const dbClubActivities = (await fetchAPI("/club_activities")) || [];
  const dbVolunteering = (await fetchAPI("/volunteering")) || [];
  const dbCompetitions = (await fetchAPI("/competitions")) || [];

  // Group activities by club_name
  const activitiesMap = {};
  dbClubActivities.forEach((act) => {
    if (!activitiesMap[act.club_name]) activitiesMap[act.club_name] = [];
    activitiesMap[act.club_name].push({
      ...act,
      assets: JSON.parse(act.assets_json || "[]"),
      links: JSON.parse(act.links_json || "[]"),
    });
  });

  const data = {
    clubs: dbClubs.map((c) => ({
      ...c,
      roles: JSON.parse(c.roles_json || "[]"),
      // Inject the matched activities based on club name
      activities: activitiesMap[c.name] || [],
    })),
    volunteering: dbVolunteering.map((v) => ({
      ...v,
      assets: JSON.parse(v.assets_json || "[]"),
      links: JSON.parse(v.links_json || "[]"),
    })),
    competitions: dbCompetitions,
  };

  renderClubs(data.clubs);
  renderVolunteering(data.volunteering);

  if (typeof initScrollObserver === "function") initScrollObserver();
});

// KEEP your existing renderClubs() and renderVolunteering() functions exactly the same!

function renderClubs(clubs) {
  const container = document.getElementById("clubs-container");
  if (!container) return;
  container.innerHTML = clubs
    .map(
      (club) => `
        <div class="club-section animate-on-scroll">
            <div class="club-header" style="align-items: flex-start;">
                <h3>${club.name}</h3>
                <div class="club-meta" style="flex-direction: column; gap: 0.2rem; text-align: right;">
                    ${(club.roles || [])
                      .map(
                        (role) => `
                        <div>
                            <span class="role" style="color: var(--accent-cyan); font-weight: 500;">${role.title}</span>
                            <span style="color: var(--text-muted); margin: 0 0.5rem;">|</span>
                            <span class="timeline" style="color: var(--text-muted); font-size: 0.9rem;">${role.timeline}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            ${
              club.activities && club.activities.length > 0
                ? `
                <div class="activity-grid">
                    ${club.activities
                      .map(
                        (act) => `
                        <div class="glass-card activity-card">
                            <div><span class="activity-type-tag">${act.type}</span></div>
                            <h4>${act.title}</h4>
                            <div class="activity-meta">
                                <span>${act.subtitle} | ${act.date}</span>
                                ${act.speakers ? `<span><strong>Speaker(s):</strong> ${act.speakers}</span>` : ""}
                            </div>
                            <p class="activity-desc">${act.description}</p>
                            <div class="asset-links">
                                ${(act.assets || [])
                                  .map(
                                    (asset) => `
                                    <a href="${asset.url}" class="asset-btn" target="_blank"><i class="${asset.icon || "fa-solid fa-file"}"></i> ${asset.name}</a>
                                `,
                                  )
                                  .join("")}
                                ${(act.links || [])
                                  .map(
                                    (link) => `
                                    <a href="${link.url}" class="asset-btn" target="_blank"><i class="${link.icon || "fa-solid fa-link"}"></i> ${link.name}</a>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `
                : '<p style="color: var(--text-muted); font-size: 0.95rem; font-style: italic;">No specific highlights listed yet.</p>'
            }
        </div>
    `,
    )
    .join("");
}

function renderVolunteering(volunteering) {
  const grid = document.getElementById("volunteering-grid");
  if (!grid) return;
  if (volunteering.length === 0) {
    grid.innerHTML =
      '<p style="color: var(--text-muted);">No volunteering records found.</p>';
    return;
  }
  grid.innerHTML = volunteering
    .map(
      (vol) => `
        <div class="glass-card activity-card">
            <h4>${vol.event_name}</h4>
            <div class="activity-meta"><span>${vol.subtitle} | ${vol.date}</span></div>
            <p class="activity-desc">${vol.description}</p>
            <div class="asset-links">
                ${(vol.assets || [])
                  .map(
                    (asset) => `
                    <a href="${asset.url}" class="asset-btn" target="_blank"><i class="${asset.icon || "fa-solid fa-file"}"></i> ${asset.name}</a>
                `,
                  )
                  .join("")}
                ${(vol.links || [])
                  .map(
                    (link) => `
                    <a href="${link.url}" class="asset-btn" target="_blank"><i class="${link.icon || "fa-solid fa-link"}"></i> ${link.name}</a>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `,
    )
    .join("");
}
