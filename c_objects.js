// Portfolio Veiwer

document.addEventListener("DOMContentLoaded", () => {
    const images = [
        "object_images/84C89669-7731-4A08-A053-3E6DF93E9175.jpeg",
        "object_images/B7B557BE-FDFA-476D-BCCC-A1B018D906A1.jpeg",
        "object_images/B8AB3553-C320-44D0-BD94-1E9DAA8241A9.jpeg",

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
    pageIndicator.textContent = ` ${currentIndex + 1} of ${images.length}`;

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