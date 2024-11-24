document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('globe-canvas');
    const placeholder = document.getElementById('globe-placeholder');
    
    const globe = new Globe(canvas);

    setTimeout(() => {
        globe.addRoutes();
    }, 1000);

    setTimeout(() => {
        placeholder.style.opacity = 0;
        setTimeout(() => placeholder.remove(), 600);
    }, 1000);
});