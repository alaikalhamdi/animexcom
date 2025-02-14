const content = document.getElementById("content");
const viewport = document.getElementById("viewport");

let scale = 1;
let startX, startY, isDragging = false;

const initialTransform = window.getComputedStyle(content).transform;
const matrix = new DOMMatrix(initialTransform);
let translateX = matrix.m41; // M41 is the X-axis translation
let translateY = matrix.m42; // M42 is the Y-axis translation

viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const zoomIntensity = 0.1;
    scale += event.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    scale = Math.min(Math.max(0.5, scale), 3);
    content.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
});

viewport.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.clientX - translateX;
    startY = event.clientY - translateY;
    viewport.style.cursor = "grabbing";
});

viewport.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    translateX = event.clientX - startX;
    translateY = event.clientY - startY;
    content.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    closeModal();
});

viewport.addEventListener("mouseup", () => {
    isDragging = false;
    viewport.style.cursor = "default";
});

viewport.addEventListener("mouseleave", () => {
    isDragging = false;
    viewport.style.cursor = "default";
});

function resetZoom() {
    scale = 1;
    translateX = matrix.m41;
    translateY = matrix.m42;
    content.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

document.getElementById("resetZoom").addEventListener("click", () => {
    resetZoom();
});