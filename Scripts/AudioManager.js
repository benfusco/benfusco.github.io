const AudioManager = (() => {
    const sounds = {
        start: new Audio("Sounds/Timer_Start.m4a"),
        finish: new Audio("Sounds/Timer_End.m4a"),
    };

    // Ensure audio files are preloaded (helps with mobile)
    function preloadAudio() {
        Object.values(sounds).forEach((sound) => {
            sound.load();
        });
    }

    // Function to play a sound
    function playSound(soundKey) {
        if (sounds[soundKey]) {
            // Reset the audio and play it
            sounds[soundKey].currentTime = 0; // Reset sound if already playing
            sounds[soundKey].play().catch((e) => {
                console.log(`Audio playback failed: ${e}`); // Debugging
            });
        } else {
            console.log(`Sound not found: ${soundKey}`); // Debugging
        }
    }

    function enableAudioOnMobile() {
        console.log("Enabling audio for mobile..."); // Debugging
    
        const unlock = () => {
            console.log("Unlocking audio..."); // Debugging
            Object.values(sounds).forEach((sound) => {
                sound.play().then(() => sound.pause()); // Unlock audio
            });
        };
    
        // Re-enable audio on every interaction
        document.addEventListener("touchstart", unlock);
        document.addEventListener("click", unlock);
    }

    return {
        preloadAudio,
        playSound,
        enableAudioOnMobile,
    };
})();

// Preload audio when the script loads
AudioManager.preloadAudio();

// Ensure sounds work on mobile
AudioManager.enableAudioOnMobile();
