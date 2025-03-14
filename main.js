// scripts.js



// Smooth Scrolling for Navigation Links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        if (href.startsWith('#')) {
            // Handle same-page navigation (smooth scroll)
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                console.warn(`No element found for selector: ${href}`);
            }
        } else {
            // Let browser handle navigation to other pages
            console.log(`Navigating to another page: ${href}`);
            // Do NOT preventDefault for external links
        }
    });
});


//Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksList = document.querySelectorAll('.nav-links a'); // Select all links inside nav-links

// Toggle the menu when the hamburger is clicked
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close the menu when a link is clicked
navLinksList.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active'); // Hide the dropdown menu
    });
});


// Footer
//copyright year in footer auto updates
document.getElementById("year").textContent = new Date().getFullYear();

// Function to copy email to clipboard

function copyEmail() {
    // Get the email address
    const email = "bfusco00@gmail.com";

    // Create a temporary input element to select and copy the email
    const tempInput = document.createElement("input");
    tempInput.value = email;
    document.body.appendChild(tempInput);

    // Select the input's content
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices

    // Execute the copy command
    document.execCommand("copy");

    // Remove the temporary input element
    document.body.removeChild(tempInput);

    // Optionally, show a confirmation message (you can customize this)
    alert("Email copied to clipboard!");
}


