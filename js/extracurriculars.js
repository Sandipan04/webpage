// Creates a URL-safe ID from a name (e.g. "RoboTech Club" -> "robotech-club")
function makeSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

document.addEventListener("DOMContentLoaded", async () => {
  const dbClubs = (await fetchAPI("/clubs")) || [];
  const dbClubActivities = (await fetchAPI("/club_activities")) || [];
  const dbVolunteering = (await fetchAPI("/volunteering")) || [];
  const dbCompetitions = (await fetchAPI("/competitions")) || [];

  // Sort all database items in reverse (descending) order
  dbClubs.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
  dbClubActivities.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
  dbVolunteering.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));

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

  // Fade out the loader once everything above is finished!
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.add("hidden");

  // Smooth scroll to the targeted club if there is a hash in the URL
  if (window.location.hash) {
    setTimeout(() => {
      const targetElement = document.querySelector(window.location.hash);
      if (targetElement) {
        // Offset by 100px so it doesn't get hidden under your sticky navbar
        const y =
          targetElement.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100); // 100ms delay ensures the DOM is fully painted
  }
});

function renderClubs(clubs) {
  const container = document.getElementById("clubs-container");
  if (!container) return;
  container.innerHTML = clubs
    .map(
      (club) => `
      <div class="club-section animate-on-scroll" id="${makeSlug(club.name)}">
            <div class="club-header">
                <h3 class="font-display">${club.name}</h3>
                <div class="club-meta">
                    ${(club.roles || [])
                      .map(
                        (role) => `
                        <div class="role-pill">
                            <span class="role-title">${role.title}</span>
                            <span class="role-timeline">${role.timeline}</span>
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
                      .map((act) => {
                        const parsedDesc = act.description
                          ? typeof marked !== "undefined"
                            ? marked.parse(act.description)
                            : act.description
                          : "";

                        return `
                        <div class="glass-card activity-card animate-on-scroll">
                            <div><span class="activity-type-tag">${act.type}</span></div>
                            <h4>${act.title}</h4>
                            <div class="activity-meta">
                                ${act.subtitle ? `<span><strong>Event:</strong> ${act.subtitle}</span>` : ""}
                                <span><strong>Date:</strong> ${act.date}</span>
                                ${act.speakers ? `<span><strong>Speaker(s):</strong> ${act.speakers}</span>` : ""}
                            </div>

                            ${
                              parsedDesc
                                ? `
                                <div class="activity-desc-container">
                                    <button class="toggle-desc-btn" onclick="this.nextElementSibling.classList.toggle('expanded'); this.innerText = this.innerText.includes('View') ? 'Hide Description' : 'View Description'">
                                        <i class="fa-solid fa-align-left"></i> View Description
                                    </button>
                                    <div class="activity-desc markdown-content">
                                        ${parsedDesc}
                                    </div>
                                </div>
                            `
                                : ""
                            }

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
                        `;
                      })
                      .join("")}
                </div>
            `
                : '<p class="empty-state">No specific highlights listed yet.</p>'
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
    grid.innerHTML = '<p class="empty-state">No volunteering records found.</p>';
    return;
  }

  grid.innerHTML = volunteering
    .map((vol) => {
      const parsedDesc = vol.description
        ? typeof marked !== "undefined"
          ? marked.parse(vol.description)
          : vol.description
        : "";

      return `
        <div class="glass-card activity-card volunteering-card animate-on-scroll">
            <div><span class="activity-type-tag volunteering-type-tag">Volunteering</span></div>
            <h4 class="volunteering-title">${vol.event_name}</h4>
            <div class="activity-meta volunteering-meta">
                <span>${vol.subtitle}</span>
                <span>${vol.date}</span>
            </div>

            ${
              parsedDesc
                ? `
                <div class="activity-desc-container">
                    <button class="toggle-desc-btn" onclick="this.nextElementSibling.classList.toggle('expanded'); this.innerText = this.innerText.includes('View') ? 'Hide Description' : 'View Description'">
                        <i class="fa-solid fa-align-left"></i> View Description
                    </button>
                    <div class="activity-desc markdown-content">
                        ${parsedDesc}
                    </div>
                </div>
            `
                : ""
            }

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
    `;
    })
    .join("");
}
