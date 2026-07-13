// Run instantly to prevent flashing before DOM loads
(function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

// --- Theme Logic ---
window.canvasColors = {
  dot: "255, 255, 255",
  line: "0, 242, 254",
  opacity: 0.15,
};

function syncCanvasColors() {
  const styles = getComputedStyle(document.documentElement);
  // Read the values straight from your CSS!
  window.canvasColors.dot =
    styles.getPropertyValue("--canvas-dot-rgb").trim() || "255, 255, 255";
  window.canvasColors.line =
    styles.getPropertyValue("--canvas-line-rgb").trim() || "0, 242, 254";
  window.canvasColors.opacity =
    parseFloat(styles.getPropertyValue("--canvas-line-opacity")) || 0.15;
}

window.toggleTheme = function () {
  // To add more themes later, just add them to this array!
  const themes = ["dark", "light"];
  let current = document.documentElement.getAttribute("data-theme") || "dark";
  let nextIndex = (themes.indexOf(current) + 1) % themes.length;
  let next = themes[nextIndex];

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcon(next);
  syncCanvasColors();
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
  syncCanvasColors();

  renderGlobalNav();
  initMobileMenu();
  initBackground();
  initScrollObserver();
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

// --- Background Canvas Logic ---
function initBackground() {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width,
    height,
    particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 1.5 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      // Automatically uses the synced CSS variable
      ctx.fillStyle = `rgba(${window.canvasColors.dot}, 0.35)`;
      ctx.fill();
    }
  }

  function initParticles() {
    resize();
    particles = [];
    for (let i = 0; i < 40; i++) particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const distance = Math.hypot(
          particles[i].x - particles[j].x,
          particles[i].y - particles[j].y,
        );
        if (distance < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          // Automatically uses the synced CSS variables for dynamic opacity and color
          const dynamicOpacity =
            (1 - distance / 150) * window.canvasColors.opacity;
          ctx.strokeStyle = `rgba(${window.canvasColors.line}, ${dynamicOpacity})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", initParticles);
  initParticles();
  animate();
}
