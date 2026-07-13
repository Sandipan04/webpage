const slideIndices = {};
const slideIntervals = {}; // NEW: Stores the slideshow timers

document.addEventListener("DOMContentLoaded", async () => {
  let dbGallery = (await fetchAPI("/gallery")) || [];

  // Apply the descending sort you requested earlier
  dbGallery.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));

  const canvases = dbGallery.map((c) => ({
    ...c,
    images: JSON.parse(c.images_json || "[]"),
  }));

  renderGalleries(canvases);
  if (typeof initScrollObserver === "function") initScrollObserver();

  const loader = document.getElementById("global-loader");
  if (loader) loader.classList.add("hidden");
});

function renderGalleries(canvases) {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  grid.innerHTML = canvases
    .map((canvas) => {
      slideIndices[canvas.canvas_id] = 0;
      return `
            <div class="glass-card gallery-card animate-on-scroll">
                <div class="gallery-info">
                    <h3 style="color: var(--text-main); font-weight: 600;">${canvas.title}</h3>
                    <div class="gallery-meta">${canvas.subtitle}</div>
                    ${
                      canvas.description
                        ? `
                        <div class="gallery-desc markdown-content">
                            ${typeof marked !== "undefined" ? marked.parse(canvas.description) : canvas.description}
                        </div>
                    `
                        : ""
                    }
                </div>

                <div class="slideshow-container" id="slideshow-${canvas.canvas_id}">
                    <div class="slides-wrapper">
                        ${(canvas.images || [])
                          .map(
                            (img, index) => `
                            <div class="slide ${index === 0 ? "active" : ""}" data-index="${index}">
                                <img src="${img.url}" alt="${img.caption || ""}">
                                ${img.caption ? `<div class="slide-caption">${img.caption}</div>` : ""}
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    ${
                      (canvas.images || []).length > 1
                        ? `
                        <button class="slide-btn prev-btn" onclick="changeSlide('${canvas.canvas_id}', -1)"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="slide-btn next-btn" onclick="changeSlide('${canvas.canvas_id}', 1)"><i class="fa-solid fa-chevron-right"></i></button>
                        <div class="slide-indicators">
                            ${canvas.images.map((_, index) => `<span class="dot ${index === 0 ? "active" : ""}" onclick="goToSlide('${canvas.canvas_id}', ${index})"></span>`).join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
    })
    .join("");

  // NEW: Initialize Auto-Slideshows & Pause/Resume Events
  canvases.forEach((canvas) => {
    if (canvas.images && canvas.images.length > 1) {
      const container = document.getElementById(
        `slideshow-${canvas.canvas_id}`,
      );
      if (container) {
        startSlideshow(canvas.canvas_id);

        // Pause on hover (Desktop)
        container.addEventListener("mouseenter", () =>
          stopSlideshow(canvas.canvas_id),
        );
        container.addEventListener("mouseleave", () =>
          startSlideshow(canvas.canvas_id),
        );

        // Pause on touch (Mobile)
        container.addEventListener(
          "touchstart",
          () => stopSlideshow(canvas.canvas_id),
          { passive: true },
        );
        container.addEventListener(
          "touchend",
          () => {
            setTimeout(() => startSlideshow(canvas.canvas_id), 1500); // Resume 1.5s after taking finger off
          },
          { passive: true },
        );
      }
    }
  });
}

// --- Slideshow Logic ---

function startSlideshow(canvasId) {
  stopSlideshow(canvasId); // Prevent duplicate intervals
  slideIntervals[canvasId] = setInterval(() => {
    changeSlide(canvasId, 1);
  }, 3500); // Change image every 3.5 seconds
}

function stopSlideshow(canvasId) {
  if (slideIntervals[canvasId]) {
    clearInterval(slideIntervals[canvasId]);
    slideIntervals[canvasId] = null;
  }
}

function changeSlide(canvasId, direction) {
  const container = document.getElementById(`slideshow-${canvasId}`);
  if (!container) return;
  const slides = container.querySelectorAll(".slide");
  if (!slides.length) return;

  let newIndex = slideIndices[canvasId] + direction;
  if (newIndex >= slides.length) newIndex = 0;
  if (newIndex < 0) newIndex = slides.length - 1;
  goToSlide(canvasId, newIndex);
}

function goToSlide(canvasId, targetIndex) {
  const container = document.getElementById(`slideshow-${canvasId}`);
  if (!container) return;
  const slides = container.querySelectorAll(".slide");
  const dots = container.querySelectorAll(".dot");

  slideIndices[canvasId] = targetIndex;

  slides.forEach((slide, index) => {
    if (index === targetIndex) slide.classList.add("active");
    else slide.classList.remove("active");
  });
  dots.forEach((dot, index) => {
    if (index === targetIndex) dot.classList.add("active");
    else dot.classList.remove("active");
  });
}
