document.addEventListener("DOMContentLoaded", () => {
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
}

function initMobileMenu() {
  const menuToggle = document.getElementById("mobile-menu");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
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
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
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
          ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - distance / 150) * 0.15})`;
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
