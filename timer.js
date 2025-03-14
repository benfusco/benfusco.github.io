//Timers
document.addEventListener("DOMContentLoaded", () => {
    const timerList = document.getElementById("timer-list");
    const addTimerButton = document.getElementById("add-timer");
    const startButton = document.getElementById("start-timers");
    const resetButton = document.getElementById("reset-timers");
    const timerDisplay = document.getElementById("timer-display");
    const currentTask = document.getElementById("current-task");
    const nextTask = document.getElementById("next-task");
    const totalTimeDisplay = document.getElementById("total-time");

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
            { name: "Down-Dog", time: 45 },
            { name: "Up-Dog", time: 30 },
            { name: "Down-Dog", time: 20 },
            { name: "Back", time: 30 },
            { name: "Twist Right", time: 30 },
            { name: "Twist Left", time: 30 },
            { name: "Back", time: 20 },
            { name: "Vietnames", time: 45 },
            { name: "Hips", time: 30 },
            { name: "Left Leg", time: 30 },
            { name: "Middle", time: 20 },
            { name: "Right Leg", time: 30 },
            { name: "Hips Forward", time: 45 },
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
            { name: "Breath", time: 600 },
        ],
    };

    // Function to calculate and display total time
    function updateTotalTime() {
        const totalSeconds = timers.reduce((sum, timer) => sum + timer.time, 0);
        const minutes = Math.floor(totalSeconds / 60); // Get minutes
        const seconds = totalSeconds % 60; // Get remaining seconds

        // Format the display
        if (minutes > 0) {
            totalTimeDisplay.textContent = `Total Time: ${minutes} minutes ${seconds} seconds`;
        } else {
            totalTimeDisplay.textContent = `Total Time: ${seconds} seconds`;
        }
    }

    // Function to update the timers array
    function updateTimersArray() {
        timers = Array.from(timerList.children).map(timerItem => {
            const name = timerItem.querySelector("input[type='text']").value || "Unnamed Task";
            const time = parseInt(timerItem.querySelector("input[type='number']").value, 10) || 0;
            return { name, time };
        }).filter(timer => timer.time > 0); // Filter out invalid timers
        updateTotalTime(); // Update total time display
    }

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
            timeInput.value = "30"; // Default time

            // Remove Button
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                timerList.removeChild(timerItem);
                updateTimersArray(); // Update timers array when a timer is removed
            });

            // Append Inputs and Button to Timer Item
            timerItem.appendChild(nameInput);
            timerItem.appendChild(timeInput);
            timerItem.appendChild(removeButton);

            // Append Timer Item to Timer List
            timerList.appendChild(timerItem);
        }

        updateTimersArray(); // Initialize the timers array and total time display
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
            timeInput.value = "30"; // Default time

            // Remove Button
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                timerList.removeChild(timerItem);
                updateTimersArray(); // Update timers array when a timer is removed
            });

            // Append Inputs and Button to Timer Item
            timerItem.appendChild(nameInput);
            timerItem.appendChild(timeInput);
            timerItem.appendChild(removeButton);

            // Append Timer Item to Timer List
            timerList.appendChild(timerItem);

            updateTimersArray(); // Update timers array when a new timer is added
        });







        // Start Button
        startButton.addEventListener("click", () => {
            updateTimersArray(); // Ensure the timers array is up-to-date

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
                    updateTimersArray(); // Update timers array when a timer is removed
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
            updateTotalTime(); // Update total time display
        }

        console.log("Timer.js loaded!");




                // Run Timer Function
                function runTimer() {
                    if (currentTimerIndex >= timers.length) {
                        // All timers are complete
                        timerDisplay.textContent = "All Timers Complete!";
                        currentTask.textContent = "Current: --";
                        nextTask.textContent = "Next: --";
                        AudioManager.playSound("finish");
                        return;
                    }

                    const currentTimer = timers[currentTimerIndex];
                    let timeLeft = currentTimer.time;

                    // Update Display
                    currentTask.textContent = `Current: ${currentTimer.name}`;
                    nextTask.textContent = currentTimerIndex + 1 < timers.length ? `Next: ${timers[currentTimerIndex + 1].name}` : "Finished";
                    updateDisplay(timeLeft);

                    // Play the short ding sound when a new timer starts
                    AudioManager.playSound("start");

                    // Start Countdown
                    countdown = setInterval(() => {
                        timeLeft--;
                        updateDisplay(timeLeft);

                        if (timeLeft <= 0) {
                            clearInterval(countdown); // Stop the current countdown
                            currentTimerIndex++; // Move to the next timer
                            if (currentTimerIndex < timers.length) {
                                // Run timer after delay (.5 second)
                                setTimeout(runTimer, 500);
                            } else {
                                // All timers are complete
                                timerDisplay.textContent = "All Timers Complete!";
                                currentTask.textContent = "Current: --";
                                nextTask.textContent = "Next: --";
                                AudioManager.playSound("finish");
                            }
                        }
                    }, 1000);
                }





                
    // Update Display Function
    function updateDisplay(time) {
        timerDisplay.textContent = `Time Left: ${time}s`;
    }
});