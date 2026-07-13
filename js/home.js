document.addEventListener("DOMContentLoaded", async () => {
  const dbProfile = (await fetchAPI("/profile")) || {};
  const dbContacts = (await fetchAPI("/contacts")) || [];
  const dbSkills = (await fetchAPI("/skills")) || [];

  const data = {
    hero: {
      name: dbProfile.name || "Name not set",
      tagline: dbProfile.tagline || "Tagline not set",
      photo:
        dbProfile.profile_image_url ||
        "https://placehold.net/220x220?text=Profile",
    },
    about_markdown: dbProfile.about_markdown || "",
    contacts: dbContacts,
    skills: dbSkills.map((s) => ({
      category: s.category,
      items: JSON.parse(s.items_json || "[]"),
    })),
  };

  renderHomeHero(data.hero);
  renderAboutAndContact(data);
  renderSkillsGrid(data.skills);

  if (window.MathJax) MathJax.typesetPromise();

  // Fade out the loader once everything above is finished!
  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.add("hidden");
});

function renderHomeHero(heroData) {
  const heroSection = document.getElementById("hero-section");
  if (!heroSection) return;
  heroSection.innerHTML = `
        <div class="hero-text-wrap">
            <div class="hero-eyebrow">
                <span class="pulse-dot"></span>
                <span>Available for opportunities</span>
            </div>
            <h1 class="hero-title">${heroData.name}</h1>
            <p class="hero-subtitle">${heroData.tagline}</p>
        </div>
        <div class="hero-image-wrap">
            <img src="${heroData.photo}" alt="${heroData.name}" class="hero-image" onerror="this.src='https://placehold.net/220x220?text=Profile'">
        </div>
    `;
}

function renderAboutAndContact(data) {
  const grid = document.getElementById("about-contact-grid");
  if (!grid) return;
  const parsedAbout =
    typeof marked !== "undefined"
      ? marked.parse(data.about_markdown)
      : data.about_markdown;
  grid.innerHTML = `
        <div class="glass-card card-about">
            <h3>About Me</h3>
            <div style="color: var(--text-muted);">${parsedAbout}</div>
        </div>
        <div class="glass-card card-contact">
            <h3>Connect</h3>
            <div class="contact-list">
                ${data.contacts
                  .map(
                    (c) => `
                    <a href="${c.url}" class="contact-item" target="_blank" rel="noopener noreferrer">
                        <i class="${c.icon}"></i><span>${c.label}</span>
                    </a>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `;
}

function renderSkillsGrid(skills) {
  const grid = document.getElementById("skills-grid");
  if (!grid) return;
  grid.innerHTML = skills
    .map(
      (skillGroup) => `
        <div class="glass-card card-skill">
            <h3>${skillGroup.category}</h3>
            <div class="skill-tags-wrap">
                ${skillGroup.items
                  .map((item) =>
                    item.url
                      ? `<a href="${item.url}" class="skill-tag" target="_blank" rel="noopener noreferrer">${item.label}</a>`
                      : `<span class="skill-tag">${item.label}</span>`,
                  )
                  .join("")}
            </div>
        </div>
    `,
    )
    .join("");
}
