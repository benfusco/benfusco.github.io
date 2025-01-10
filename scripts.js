// scripts.js

// Smooth Scrolling for Navigation Links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute('href'));
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        } else {
            console.warn(`No element found for selector: ${this.getAttribute('href')}`);
            //Optional: Add other handling for error, such as alert or showing error message on ui
            
        }
    });
});