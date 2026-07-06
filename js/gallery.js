const slideIndices = {};

document.addEventListener("DOMContentLoaded", async () => {
  const dbGallery = (await fetchAPI("/gallery")) || [];
  const canvases = dbGallery.map((c) => ({
    ...c,
    images: JSON.parse(c.images_json || "[]"),
  }));

  renderGalleries(canvases);
  if (typeof initScrollObserver === "function") initScrollObserver();
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
                    <h3>${canvas.title}</h3>
                    <div class="gallery-meta">${canvas.subtitle}</div>
                    <p class="gallery-desc">${canvas.description}</p>
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
}

function changeSlide(canvasId, direction) {
  const container = document.getElementById(`slideshow-${canvasId}`);
  const slides = container.querySelectorAll(".slide");
  if (!slides.length) return;
  let newIndex = slideIndices[canvasId] + direction;
  if (newIndex >= slides.length) newIndex = 0;
  if (newIndex < 0) newIndex = slides.length - 1;
  goToSlide(canvasId, newIndex);
}

function goToSlide(canvasId, targetIndex) {
  const container = document.getElementById(`slideshow-${canvasId}`);
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
