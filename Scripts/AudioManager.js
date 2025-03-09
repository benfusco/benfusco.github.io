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
            sounds[soundKey].currentTime = 0; // Reset sound if already playing
            sounds[soundKey].play().catch((e) => {
                console.log(`Audio playback failed: ${e}`);
            });
        }
    }

    // Mobile Compatibility: Play an empty sound on first user interaction
    function enableAudioOnMobile() {
        const unlock = () => {
            Object.values(sounds).forEach((sound) => {
                sound.play().then(() => sound.pause()); // Unlock audio
            });
            document.removeEventListener("touchstart", unlock);
            document.removeEventListener("click", unlock);
        };

        document.addEventListener("touchstart", unlock, { once: true });
        document.addEventListener("click", unlock, { once: true });
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
