// scripts.js

// Smooth Scrolling for Navigation Links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const targetElement = document.querySelector(href);

        if (targetElement) {
            // If the link points to an element on the same page, enable smooth scrolling
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        } else {
            // If no element exists (e.g., href points to another page), allow the link to proceed normally
            console.log(`Navigating to a different page: ${href}`);
        }
    });
});
