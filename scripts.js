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



//Flipbook 

//Test flipbook.js external script
$(document).ready(function() {
    console.log('flipbook.js loaded and ready!');
});

// Wait for the DOM to be ready
$(document).ready(function() {
    // Initialize the flipbook
    $('#flipbook').flipBook({
        width: 80,  // Set the width of the flipbook (percentage of page size)
        height: 60, // Set the height of the flipbook
        autoCenter: true, // Automatically center the flipbook
        pageWidth: 40,  // Each page's width (half the total width for two pages at once)
        pageHeight: 60, // Page height
        continuous: false, // Enable continuous flip (looping)
    });
});
