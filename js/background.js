/* =========================================================
   js/background.js
   "Cybernetic vein" background — SVG + CSS edition.

   JS only builds the path network (once per load/resize) and
   writes it into the DOM. All motion — the flowing pulses — is
   done with a single CSS @keyframes animating stroke-dashoffset
   (see css/global.css). There is no requestAnimationFrame loop
   and no per-frame color recompute: the paths reference the
   theme's CSS custom properties directly, so toggling dark/light
   updates them for free.
========================================================= */

(function () {
    const MAX_DEPTH = 3;
    const STEP_MIN = 30;
    const STEP_MAX = 55;
    // 8-way compass directions in radians — gives the "semi-angular"
    // circuit-trace look. Small jitter is added per-step so it doesn't
    // read as a perfectly rigid PCB grid.
    const DIRECTIONS = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

    const reducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function buildNetwork(width, height) {
        const paths = [];
        const isMobile = width < 700;
        const rootCount = isMobile ? 4 : 7;

        function grow(x, y, dirIndex, depth, strokeWidth) {
            const points = [{ x, y }];
            const steps = 12 - depth * 2 + Math.floor(Math.random() * 6);
            const margin = 60;

            for (let i = 0; i < steps; i++) {
                // Mostly keep heading, occasionally turn to an adjacent compass point.
                if (Math.random() < 0.3) {
                    dirIndex = (dirIndex + (Math.random() < 0.5 ? 1 : -1) + 8) % 8;
                }
                const jitter = (Math.random() - 0.5) * 0.18;
                const angle = DIRECTIONS[dirIndex] + jitter;
                const len = STEP_MIN + Math.random() * (STEP_MAX - STEP_MIN);
                x += Math.cos(angle) * len;
                y += Math.sin(angle) * len;
                points.push({ x, y });

                if (x < -margin || x > width + margin || y < -margin || y > height + margin)
                    break;

                if (depth < MAX_DEPTH && i > 2 && i < steps - 2 && Math.random() < 0.11) {
                    const turn = Math.random() < 0.5 ? 2 : -2; // 90°-ish branch
                    grow(x, y, (dirIndex + turn + 8) % 8, depth + 1, strokeWidth * 0.6);
                }
            }

            if (points.length > 1) {
                const d = points
                    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                    .join(" ");
                let length = 0;
                for (let i = 1; i < points.length; i++) {
                    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
                }
                paths.push({ d, depth, strokeWidth, length });
            }
        }

        for (let i = 0; i < rootCount; i++) {
            const edge = Math.floor(Math.random() * 4);
            let x, y, dirIndex;
            if (edge === 0) { x = Math.random() * width; y = -20; dirIndex = 2; }
            else if (edge === 1) { x = width + 20; y = Math.random() * height; dirIndex = 4; }
            else if (edge === 2) { x = Math.random() * width; y = height + 20; dirIndex = 6; }
            else { x = -20; y = Math.random() * height; dirIndex = 0; }
            grow(x, y, dirIndex, 0, 2.2);
        }

        return paths;
    }

    function renderSVG(paths, width, height) {
        const basePaths = paths
            .map(
                (p) =>
                    `<path d="${p.d}" stroke-width="${Math.max(0.6, p.strokeWidth - p.depth * 0.3).toFixed(2)}" />`,
            )
            .join("");

        let pulsePaths = "";
        if (!reducedMotion) {
            pulsePaths = paths
                .filter((p) => p.length > 70)
                .map((p) => {
                    const colorVar = Math.random() < 0.5 ? "--vein-pulse-a-rgb" : "--vein-pulse-b-rgb";
                    const dur = (4.5 + Math.random() * 4.5).toFixed(2);
                    const delay = (-Math.random() * 8).toFixed(2);
                    const dir = Math.random() < 0.5 ? "normal" : "reverse";
                    const style = `--pulse-rgb:var(${colorVar});--dur:${dur}s;--delay:${delay}s;--dir:${dir};`;
                    return `<path d="${p.d}" style="${style}" />`;
                })
                .join("");
        }

        return `<svg id="vein-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <g class="vein-base">${basePaths}</g>
            <g class="vein-pulse">${pulsePaths}</g>
        </svg>`;
    }

    function build(container) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const paths = buildNetwork(width, height);
        container.innerHTML = renderSVG(paths, width, height);
    }

    window.initBackground = function initBackground() {
        const container = document.getElementById("network-canvas");
        if (!container) return;

        build(container);

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => build(container), 300);
        });
    };
})();