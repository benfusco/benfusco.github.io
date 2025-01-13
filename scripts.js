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



// Flipbook

$(document).ready(function () {
    console.log('flipbook.js loaded and ready!');

    // Initialize the flipbook
    $('#flipbook').flipBook({
        width: 800,          // Total width of the flipbook container
        height: 600,         // Total height of the flipbook container
        pageWidth: 400,      // Width of a single page (half of the total width)
        pageHeight: 600,     // Height of a single page
        autoCenter: true,    // Automatically center the flipbook
        clickToFlip: true,   // Allow flipping by clicking
        flipSound: false,    // Disable flip sound (optional)
        responsive: true,    // Make it responsive
    });

    // Add click events for navigation
    $('#flipbook').on('click', '.flipbook-page img', function (event) {
        const $target = $(event.target);
        const $parent = $target.closest('.flipbook-page');

        if ($parent.index() % 2 === 0) {
            // If clicked on the left page, go to the previous page
            $('#flipbook').flipBook('prev');
        } else {
            // If clicked on the right page, go to the next page
            $('#flipbook').flipBook('next');
        }
    });

    console.log('Flipbook initialized with interactive page flipping!');
});

    
