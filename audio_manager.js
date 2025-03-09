const AudioManager = (() => {
    const audio = new Audio(); // Single audio element

    const sounds = {
        start: "sounds/timer_Start.m4a",
        finish: "sounds/timer_End.m4a",
    };

    console.log("AudioManager.js loaded!");

    // Function to play a sound
    function playSound(soundKey) {
        if (sounds[soundKey]) {
            audio.src = sounds[soundKey]; // Set the audio source
            audio.currentTime = 0; // Reset sound if already playing
            audio.play().catch((e) => {
                console.log(`Audio playback failed: ${e}`); // Debugging
            });
        } else {
            console.log(`Sound not found: ${soundKey}`); // Debugging
        }
    }

    // Mobile Compatibility: Play an empty sound on first user interaction
    function enableAudioOnMobile() {
        const unlock = () => {
            audio.src = sounds.start; // Use any sound file
            audio.play().then(() => {
                audio.pause(); // Unlock audio
                audio.currentTime = 0; // Reset audio
            }).catch((e) => {
                console.log(`Audio unlock failed: ${e}`); // Debugging
            });
            document.removeEventListener("touchstart", unlock);
            document.removeEventListener("click", unlock);
        };

        document.addEventListener("touchstart", unlock, { once: true });
        document.addEventListener("click", unlock, { once: true });
    }

    return {
        playSound,
        enableAudioOnMobile,
    };
})();

// Ensure sounds work on mobile
AudioManager.enableAudioOnMobile();