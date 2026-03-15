// Portfolio Veiwer

document.addEventListener("DOMContentLoaded", () => {
    const images = [
"portfolio_images/Portfolio_Winter_26_0.jpg",
"portfolio_images/Portfolio_Winter_26_1.jpg",
"portfolio_images/Portfolio_Winter_26_2.jpg",
"portfolio_images/Portfolio_Winter_26_3.jpg",
"portfolio_images/Portfolio_Winter_26_4.jpg",
"portfolio_images/Portfolio_Winter_26_5.jpg",
"portfolio_images/Portfolio_Winter_26_6.jpg",
"portfolio_images/Portfolio_Winter_26_7.jpg",
"portfolio_images/Portfolio_Winter_26_8.jpg",
"portfolio_images/Portfolio_Winter_26_9.jpg",
"portfolio_images/Portfolio_Winter_26_10.jpg",
"portfolio_images/Portfolio_Winter_26_11.jpg",
"portfolio_images/Portfolio_Winter_26_12.jpg",
"portfolio_images/Portfolio_Winter_26_13.jpg",
"portfolio_images/Portfolio_Winter_26_14.jpg",
"portfolio_images/Portfolio_Winter_26_15.jpg",

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