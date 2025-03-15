document.addEventListener("DOMContentLoaded", () => {
    const username = "benfusco";
    const repo = "benfusco.github.io";
    const folder = "object_images";

    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;
    console.log("API URL:", apiUrl); // Debug: Check the API URL

    let currentIndex = 0;
    let images = [];

    const currentImage = document.getElementById("current-image");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const pageIndicator = document.getElementById("page-indicator");

    // Function to update the image, page indicator, and apply small-image class
    function updateImage() {
        if (images.length > 0) {
            currentImage.src = images[currentIndex].download_url;
            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === images.length - 1;
            pageIndicator.textContent = ` ${currentIndex + 1} of ${images.length}`;
        }
    }

    // Fetch images from GitHub
    async function fetchImages() {
        try {
            console.log("Fetching images from:", apiUrl); // Debug: Check the API URL
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log("API Response:", data); // Debug: Check the API response
            images = data.filter(file => file.type === "file" && file.name.match(/\.(jpeg|jpg|png|gif)$/i));
            console.log("Filtered images:", images); // Debug: Check filtered images
            updateImage(); // Display the first image after fetching
        } catch (error) {
            console.error("Error fetching images:", error);
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
    fetchImages();
});