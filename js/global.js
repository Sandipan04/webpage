// Run instantly to prevent flashing before DOM loads
(function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

// --- Theme Logic ---
// Note: the vein background (js/background.js) needs no color sync here —
// its SVG strokes reference the theme's CSS custom properties directly
// (--vein-base-rgb, --vein-pulse-a-rgb, etc), so toggling [data-theme]
// updates it for free.
window.toggleTheme = function () {
  // To add more themes later, just add them to this array!
  const themes = ["dark", "light"];
  let current = document.documentElement.getAttribute("data-theme") || "dark";
  let nextIndex = (themes.indexOf(current) + 1) % themes.length;
  let next = themes[nextIndex];

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcon(next);
};

function updateThemeIcon(theme) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.innerHTML =
    theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
}

document.addEventListener("DOMContentLoaded", () => {
  renderGlobalNav();
  initMobileMenu();
  initScrollObserver();

  // The actual canvas drawing lives in js/background.js so it can be
  // swapped or restyled independently of nav/theme/scroll logic.
  if (typeof window.initBackground === "function") window.initBackground();
});

function renderGlobalNav() {
  const navLinksContainer = document.getElementById("nav-links");
  if (!navLinksContainer) return;

  const path = window.location.pathname;
  navLinksContainer.innerHTML = `
        <a href="index.html" class="${path.includes("index") || path === "/" ? "active" : ""}">Home</a>
        <a href="academics.html" class="${path.includes("academics") ? "active" : ""}">Academics</a>
        <a href="extracurriculars.html" class="${path.includes("extracurriculars") ? "active" : ""}">Extracurriculars</a>
        <a href="lab.html" class="${path.includes("lab") ? "active" : ""}">The Lab</a>
        <a href="gallery.html" class="${path.includes("gallery") ? "active" : ""}">Gallery</a>
    `;

  // Inject the theme toggle directly into the main nav (outside of nav-links)
  let themeBtn = document.getElementById("theme-toggle");
  if (!themeBtn) {
    themeBtn = document.createElement("button");
    themeBtn.id = "theme-toggle";
    themeBtn.className = "theme-btn";
    themeBtn.onclick = window.toggleTheme;
    themeBtn.setAttribute("aria-label", "Toggle Theme");
    document.getElementById("main-nav").appendChild(themeBtn);
  }

  updateThemeIcon(
    document.documentElement.getAttribute("data-theme") || "dark",
  );
}

function initMobileMenu() {
  const menuToggle = document.getElementById("mobile-menu");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && navLinks) {
    const icon = menuToggle.querySelector("i");

    // Toggle menu and icon
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevents the document click listener from firing immediately
      navLinks.classList.toggle("active");

      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    });

    // Close menu when tapping outside of it
    document.addEventListener("click", (e) => {
      if (
        navLinks.classList.contains("active") &&
        !navLinks.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        navLinks.classList.remove("active");
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    });
  }
}

function initScrollObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.05 },
  );

  document
    .querySelectorAll(".animate-on-scroll")
    .forEach((el) => observer.observe(el));
}