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














//Timers
document.addEventListener("DOMContentLoaded", () => {
    const timerList = document.getElementById("timer-list");
    const addTimerButton = document.getElementById("add-timer");
    const startButton = document.getElementById("start-timers");
    const resetButton = document.getElementById("reset-timers");
    const timerDisplay = document.getElementById("timer-display");
    const currentTask = document.getElementById("current-task");
    const nextTask = document.getElementById("next-task");

    // Audio elements
    const startSound = document.getElementById("start-sound");
    const finishSound = document.getElementById("finish-sound");

    // Preset buttons
    const presetStretch = document.getElementById("preset-stretch");
    const presetHangboard = document.getElementById("preset-hangboard");
    const presetMeditate = document.getElementById("preset-meditate");

    let timers = []; // Array to store { name, time } objects
    let currentTimerIndex = 0;
    let countdown;

    // Define preset timers
    const presets = {
        stretch: [
            { name: "Stretch 1", time: 30 },
            { name: "Stretch 2", time: 30 },
            { name: "Stretch 3", time: 30 },
        ],
        hangboard: [
            { name: "Prep", time: 10 },
            { name: "Jug Hang", time: 20 },
            { name: "Rest", time: 30 },
            { name: "4 Finger Hang", time: 10 },
            { name: "Rest", time: 30 },
            { name: "Pull Up", time: 10 },
            { name: "Rest", time: 30 },
            { name: "4 Finger Hang", time: 10 },
            { name: "Rest", time: 30 },
            { name: "Pull Up", time: 10 },
            { name: "Rest", time: 30 },
            { name: "3 Finger Hang", time: 10 },
            { name: "Rest", time: 30 },
            { name: "Pull Up", time: 10 },
            { name: "Jug Hang", time: 20 },
        ],
        meditate: [
            { name: "Breath", time: 20 },
        ],
    };

    // Function to initialize default timers
    function initializeTimers() {
        for (let i = 1; i <= 3; i++) {
            const timerItem = document.createElement("div");
            timerItem.classList.add("timer-item");

            // Task Name Input
            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.placeholder = "Activity";
            nameInput.value = `# ${i}`; // Default name

            // Time Input
            const timeInput = document.createElement("input");
            timeInput.type = "number";
            timeInput.min = "1";
            timeInput.placeholder = "Seconds";
            timeInput.value = "10"; // Default time

            // Remove Button
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                timerList.removeChild(timerItem);
            });

            // Append Inputs and Button to Timer Item
            timerItem.appendChild(nameInput);
            timerItem.appendChild(timeInput);
            timerItem.appendChild(removeButton);

            // Append Timer Item to Timer List
            timerList.appendChild(timerItem);
        }
    }

    // Call initializeTimers when the page loads
    initializeTimers();

    // Add Timer Button
    addTimerButton.addEventListener("click", () => {
        const timerItem = document.createElement("div");
        timerItem.classList.add("timer-item");

        // Task Name Input
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Task Name";

        // Time Input
        const timeInput = document.createElement("input");
        timeInput.type = "number";
        timeInput.min = "1";
        timeInput.placeholder = "Seconds";

        // Remove Button
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            timerList.removeChild(timerItem);
        });

        // Append Inputs and Button to Timer Item
        timerItem.appendChild(nameInput);
        timerItem.appendChild(timeInput);
        timerItem.appendChild(removeButton);

        // Append Timer Item to Timer List
        timerList.appendChild(timerItem);
    });

    // Start Button
    startButton.addEventListener("click", () => {
        // Populate the timers array with { name, time } objects
        timers = Array.from(timerList.children).map(timerItem => {
            const name = timerItem.querySelector("input[type='text']").value || "Unnamed Task";
            const time = parseInt(timerItem.querySelector("input[type='number']").value, 10) || 0;
            return { name, time };
        }).filter(timer => timer.time > 0); // Filter out invalid timers

        if (timers.length > 0) {
            currentTimerIndex = 0;
            runTimer();
        } else {
            alert("Please add valid timers!");
        }
    });

    // Reset Button
    resetButton.addEventListener("click", () => {
        clearInterval(countdown); // Stop the countdown
        timerDisplay.textContent = "Time Left: --s";
        currentTask.textContent = "Current: --";
        nextTask.textContent = "Next: --";
        timerList.innerHTML = ""; // Clear the timer list
        timers = []; // Reset the timers array
        currentTimerIndex = 0; // Reset the current timer index
        initializeTimers(); // Reinitialize default timers
    });

    // Preset Button Handlers
    presetStretch.addEventListener("click", () => {
        loadPreset(presets.stretch);
    });

    presetHangboard.addEventListener("click", () => {
        loadPreset(presets.hangboard);
    });

    presetMeditate.addEventListener("click", () => {
        loadPreset(presets.meditate);
    });

    // Function to load a preset
    function loadPreset(preset) {
        // Clear existing timers
        timerList.innerHTML = "";
        timers = [];

        // Add preset timers to the list
        preset.forEach((task, index) => {
            const timerItem = document.createElement("div");
            timerItem.classList.add("timer-item");

            // Task Name Input
            const nameInput = document.createElement("input");
            nameInput.type = "text";
            nameInput.placeholder = "Activity";
            nameInput.value = task.name;

            // Time Input
            const timeInput = document.createElement("input");
            timeInput.type = "number";
            timeInput.min = "1";
            timeInput.placeholder = "Seconds";
            timeInput.value = task.time;

            // Remove Button
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                timerList.removeChild(timerItem);
            });

            // Append Inputs and Button to Timer Item
            timerItem.appendChild(nameInput);
            timerItem.appendChild(timeInput);
            timerItem.appendChild(removeButton);

            // Append Timer Item to Timer List
            timerList.appendChild(timerItem);
        });

        // Update the timers array
        timers = [...preset]; // Use a copy of the preset array
    }

    // Run Timer Function
    function runTimer() {
        if (currentTimerIndex >= timers.length) {
            // All timers are complete
            timerDisplay.textContent = "All Timers Complete!";
            currentTask.textContent = "Current: --";
            nextTask.textContent = "Next: --";
            finishSound.play(); // Play the long ding sound
            return;
        }

        const currentTimer = timers[currentTimerIndex];
        let timeLeft = currentTimer.time;

        // Update Display
        currentTask.textContent = `Current: ${currentTimer.name}`;
        nextTask.textContent = currentTimerIndex + 1 < timers.length ? `Next: ${timers[currentTimerIndex + 1].name}` : "Finished";
        updateDisplay(timeLeft);

        // Play the short ding sound when a new timer starts
        startSound.play();

        // Start Countdown
        countdown = setInterval(() => {
            timeLeft--;
            updateDisplay(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(countdown); // Stop the current countdown
                currentTimerIndex++; // Move to the next timer
                if (currentTimerIndex < timers.length) {
                    // Run the next timer after a short delay (e.g., 1 second)
                    setTimeout(runTimer, 1000);
                } else {
                    // All timers are complete
                    timerDisplay.textContent = "All Timers Complete!";
                    currentTask.textContent = "Current: --";
                    nextTask.textContent = "Next: --";
                    finishSound.play(); // Play the long ding sound
                }
            }
        }, 1000);
    }

    // Update Display Function
    function updateDisplay(time) {
        timerDisplay.textContent = `Time Left: ${time}s`;
    }
});