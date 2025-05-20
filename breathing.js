let isExerciseRunning = false;
let breathCount = 0;
let audioContext;
let mediaStream;
let analyser;
let breathingPhase = 'inhale';
let sustainedTargetBreath = 0;

const fish = document.getElementById('fish');
const startButton = document.getElementById('startButton');
const instruction = document.getElementById('instruction');
const countdownDisplay = document.getElementById('countdown');

// Create breath counter
const breathCounter = document.createElement('div');
breathCounter.id = 'breath-counter';
breathCounter.textContent = '0/10';
document.body.appendChild(breathCounter);

// Create shadow fish element
/*
const fishShadow = document.createElement('div');
fishShadow.id = 'fish-shadow';
fishShadow.innerHTML = fish.innerHTML; // Copy the fish image
fishShadow.style.transform = 'scale(1.5)'; // Target scale
fish.parentNode.insertBefore(fishShadow, fish);
*/

// Add smooth transition to fish
fish.style.transition = 'transform 0.3s ease-out';

startButton.addEventListener('click', async () => {
    if (!isExerciseRunning) {
        try {
            // Request microphone access
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startExercise();
            startButton.textContent = 'Stop';
        } catch (err) {
            instruction.textContent = "Please allow microphone access to continue";
            console.error('Error accessing microphone:', err);
        }
    } else {
        stopExercise();
        startButton.textContent = 'Start';
    }
});

function startExercise() {
    isExerciseRunning = true;
    breathCount = 0;
    breathCounter.textContent = '0/10';
    instruction.textContent = "Breathe with the fish... Match the shadow!";
    
    // Initialize audio context and analyzer
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.9;
    source.connect(analyser);
    
    monitorBreathing();
}

function monitorBreathing() {
    if (!isExerciseRunning) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const scale = 1 + Math.min(Math.max(average - 30, 0) / 100, 0.5);
    
    fish.style.transform = `scale(${scale})`;
    
    // Check if fish matches shadow size (1.5)
    if (scale >= 1.45) { // Allow small margin of error
        sustainedTargetBreath++;
        if (sustainedTargetBreath >= 60) { // About 1 second at 60fps
            if (breathingPhase === 'inhale') {
                breathCount++;
                breathCounter.textContent = `${breathCount}/10`;
                instruction.textContent = "Great breath! Now exhale...";
                breathingPhase = 'exhale';
                
                if (breathCount >= 10) {
                    stopExercise();
                    instruction.textContent = "Amazing! You've completed all 10 breaths!";
                    startButton.textContent = "Start Again";
                    return;
                }
            }
        }
        instruction.textContent = "Hold it...";
    } else {
        sustainedTargetBreath = 0;
        if (scale < 1.2) {
            instruction.textContent = "Inhale deeper... match the shadow!";
            breathingPhase = 'inhale';
        }
    }
    
    requestAnimationFrame(monitorBreathing);
}

function stopExercise() {
    isExerciseRunning = false;
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }
    fish.style.transform = 'scale(1)';
    sustainedTargetBreath = 0;
    if (breathCount < 10) {
        instruction.textContent = "Click Start to begin";
        breathCounter.textContent = '0/10';
    }
}