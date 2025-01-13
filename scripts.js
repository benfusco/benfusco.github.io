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



// Portfolio Veiwer

document.addEventListener("DOMContentLoaded", () => {
    const images = [
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads3.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads4.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads5.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads6.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads7.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads8.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads9.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads10.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads11.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads12.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads13.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads14.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads15.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads16.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads17.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads18.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads19.jpg",
        "portfolio_images/Portfolio_Fall 2024_Images_Spreads20.jpg",
    ];

    let currentIndex = 0;

    const currentImage = document.getElementById("current-image");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const pageIndicator = document.getElementById("page-indicator");

   // Function to update the image, page indicator, and apply small-image class
   function updateImage() {
    currentImage.src = images[currentIndex];
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === images.length - 1;
    pageIndicator.textContent = `Spread ${currentIndex + 1} of ${images.length}`;

    // Add small-image class for the first or last image
    if (currentIndex === 0 || currentIndex === images.length - 1) {
        currentImage.classList.add('small-image');
    } else {
        currentImage.classList.remove('small-image');
    }
}

    // Event listeners for buttons
    prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateImage();
        }
    });

    // Keydown events for navigation
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            prevButton.click();
        } else if (event.key === "ArrowRight") {
            nextButton.click();
        }
    });

    // Initialize
    updateImage();
});
