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
            console.log('Button clicked - starting');
            breathCount = 0;
            breathCountDisplay.textContent = `Breath: ${breathCount}/10`;
            isListening = true;  // Move this line BEFORE starting audio analysis
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Got audio stream');
            startAudioAnalysis(stream);
            startButton.textContent = 'Stop Exercise';
        } catch (err) {
            console.error('Error:', err);
            isListening = false;  // Reset if there's an error
            alert('Please allow microphone access to use this feature.');
        }
    } else {
        console.log('Stopping exercise');
        stopAudioAnalysis();
        startButton.textContent = 'Start Breathing Exercise';
        isListening = false;
    }
});

function startAudioAnalysis(stream) {
    console.log('Starting audio analysis');  // Basic start log
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('Audio context created');  // Check audio context creation
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    
    // Create and configure bandpass filters for breath sound isolation
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500; // Lower frequency for breath fundamentals
    filter.Q.value = 0.7; // Wider band to catch more breath frequencies

    const filter2 = audioContext.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.value = 2000; // Higher frequency for breath harmonics
    filter2.Q.value = 0.5; // Wide band for harmonics
    
    // Connect nodes: microphone -> filter -> filter2 -> analyser
    microphone.connect(filter);
    filter.connect(filter2);
    filter2.connect(analyser);
    
    analyser.fftSize = 1024;  // Increased for better resolution
    
    let isBreathing = false;
    let breathTimer = null;
    let lastDetected = 0;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const volumeIndicator = document.getElementById('volumeIndicator');
    
    function animate() {
        if (!isListening) {
            console.log('Not listening, animation stopped');  // Log when animation stops
            return;
        }
        
        analyser.getByteTimeDomainData(dataArray);  // Changed to time domain data
        
        // Calculate RMS value for better volume representation
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const amplitude = (dataArray[i] - 128) / 128;  // Convert to -1 to 1 range
            sum += amplitude * amplitude;
        }
        const volume = Math.sqrt(sum / dataArray.length) * 100;  // RMS calculation
        
        // Debug logging with more visible formatting
        console.log('%c Audio Debug Info ', 'background: #222; color: #bada55');
        console.log('%c Raw volume: ' + volume.toFixed(2), 'color: #00ff00');
        console.log('%c Breath state: ' + (isBreathing ? 'breathing' : 'not breathing'), 'color: #0000ff');
        console.log('%c Threshold - Start: 0.3, Stop: 0.2', 'color: #ff0000');
        
        // Update volume indicator with raw value and thresholds
        volumeIndicator.textContent = `Volume: ${Math.round(volume)} (Start: 0.15, Stop: 0.1)`;
        
        // Scale and color transition based on volume
        const scale = 1 + (volume / 50);  // Adjusted scaling factor
        const hue = Math.min(180, volume * 2);  // Adjusted color transition
        fish.style.filter = `hue-rotate(${hue}deg)`;
        fish.style.transform = `scale(${scale})`;

        const now = Date.now();
        if (volume > 0.3 && !isBreathing) {  // Increased threshold for more reliable detection
            isBreathing = true;
            instruction.textContent = "Keep breathing...";
            lastDetected = now;
            console.log('Breath start detected:', volume);
            
            breathTimer = setTimeout(() => {
                const currentTime = Date.now();
                if (currentTime - lastDetected > 500) { // Increased minimum duration
                    breathCount++;
                    breathCountDisplay.textContent = `Breath: ${breathCount}/10`;
                    isBreathing = false;
                    instruction.textContent = "Take another deep breath";
                    console.log('Breath counted, duration:', currentTime - lastDetected);
                    
                    if (breathCount >= 10) {
                        stopAudioAnalysis();
                        instruction.textContent = "Great job! Exercise complete.";
                        startButton.textContent = 'Start New Session';
                    }
                }
            }, 1500); // Reduced timeout for better responsiveness
        } else if (volume < 0.2 && isBreathing && now - lastDetected > 800) {  // Adjusted end threshold and timing
            clearTimeout(breathTimer);
            isBreathing = false;
            instruction.textContent = "Take another deep breath";
        }
        
        requestAnimationFrame(animate);
    }
    
    console.log('Starting animation loop');  // Log before starting animation
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