document.addEventListener("DOMContentLoaded", () => {
    const username = "benfusco";
    const repo = "benfusco.github.io";
    const folder = "object_images";

    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;

    let currentIndex = 0;
    let images = [];

    const currentImage = document.getElementById("current-image");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const pageIndicator = document.getElementById("page-indicator");
    const metadataDisplay = document.getElementById("metadata-display");

    // Function to parse metadata from file name
    function parseMetadata(filename) {
        const parts = filename.split("_");
        if (parts.length === 3) {
            return {
                title: parts[0],
                uploader: parts[1],
                upload_date: parts[2].split(".")[0], // Remove file extension
            };
        }
        return null; // Return null if the file name doesn't match the expected format
    }

    // Function to update the image, page indicator, and metadata
    function updateImage() {
        if (images.length > 0) {
            currentImage.src = images[currentIndex].download_url;
            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === images.length - 1;
            pageIndicator.textContent = ` ${currentIndex + 1} of ${images.length}`;

            // Parse and display metadata
            const metadata = parseMetadata(images[currentIndex].name);
            if (metadata) {
                metadataDisplay.innerHTML = `
                    <p><strong>Title:</strong> ${metadata.title}</p>
                    <p><strong>Uploader:</strong> ${metadata.uploader}</p>
                    <p><strong>Upload Date:</strong> ${metadata.upload_date}</p>
                `;
            } else {
                metadataDisplay.innerHTML = "<p>No metadata available for this image.</p>";
            }
        }
    }

    // Fetch images from GitHub
    async function fetchImages() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch images");
            }
            const data = await response.json();
            images = data.filter(file => file.type === "file" && file.name.match(/\.(jpeg|jpg|png|gif)$/i));
            console.log("Fetched images:", images);
            updateImage();
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