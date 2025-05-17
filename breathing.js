let audioContext;
let analyser;
let microphone;
let isListening = false;
let breathCount = 0;
const fish = document.getElementById('fish');
const startButton = document.getElementById('startButton');
const breathCountDisplay = document.getElementById('breathCount');
const countdownDisplay = document.getElementById('countdown');
const instruction = document.getElementById('instruction');

startButton.addEventListener('click', async () => {
    if (!isListening) {
        try {
            breathCount = 0;
            breathCountDisplay.textContent = `Breath: ${breathCount}/10`;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startAudioAnalysis(stream);
            startButton.textContent = 'Stop Exercise';
            isListening = true;
        } catch (err) {
            alert('Please allow microphone access to use this feature.');
        }
    } else {
        stopAudioAnalysis();
        startButton.textContent = 'Start Breathing Exercise';
        isListening = false;
    }
});

function startAudioAnalysis(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    
    // Create and configure bandpass filter
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000; // Center around 1kHz where breath sounds are prominent
    filter.Q.value = 1.0; // Controls the width of the band
    
    // Connect nodes: microphone -> filter -> analyser
    microphone.connect(filter);
    filter.connect(analyser);
    
    analyser.fftSize = 1024;  // Increased for better resolution
    
    let isBreathing = false;
    let breathTimer = null;
    let lastDetected = 0;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const volumeIndicator = document.getElementById('volumeIndicator');
    
    function animate() {
        if (!isListening) return;
        
        analyser.getByteTimeDomainData(dataArray);  // Changed to time domain data
        
        // Calculate RMS value for better volume representation
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const amplitude = (dataArray[i] - 128) / 128;  // Convert to -1 to 1 range
            sum += amplitude * amplitude;
        }
        const volume = Math.sqrt(sum / dataArray.length) * 100;  // RMS calculation
        
        // Update volume indicator with raw value only
        volumeIndicator.textContent = `Volume: ${Math.round(volume)}`;
        
        // Scale and color transition based on volume
        const scale = 1 + (volume / 50);  // Adjusted scaling factor
        const hue = Math.min(180, volume * 2);  // Adjusted color transition
        fish.style.filter = `hue-rotate(${hue}deg)`;
        fish.style.transform = `scale(${scale})`;

        const now = Date.now();
        if (volume > 0.15 && !isBreathing) {  // Lower threshold for better sensitivity
            isBreathing = true;
            instruction.textContent = "Keep breathing...";
            lastDetected = now;
            
            breathTimer = setTimeout(() => {
                if (now - lastDetected > 300) { // Only count if breath sustained for 300ms
                    breathCount++;
                    breathCountDisplay.textContent = `Breath: ${breathCount}/10`;
                    isBreathing = false;
                    instruction.textContent = "Take another deep breath";
                    
                    if (breathCount >= 10) {
                        stopAudioAnalysis();
                        instruction.textContent = "Great job! Exercise complete.";
                        startButton.textContent = 'Start New Session';
                    }
                }
            }, 2000); // Reduced from 3000ms to make it more responsive
        } else if (volume < 0.1 && isBreathing && now - lastDetected > 500) {  // Add timing check
            clearTimeout(breathTimer);
            isBreathing = false;
            instruction.textContent = "Take another deep breath";
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function stopAudioAnalysis() {
    if (audioContext) {
        audioContext.close();
    }
    fish.style.transform = 'scale(1)';
    fish.style.filter = 'none';
    isListening = false;
    document.getElementById('volumeIndicator').textContent = 'Volume: 0';
}