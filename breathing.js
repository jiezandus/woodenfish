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
    microphone.connect(analyser);
    analyser.fftSize = 256;
    
    let isBreathing = false;
    let breathTimer = null;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const volumeIndicator = document.getElementById('volumeIndicator');
    
    function animate() {
        if (!isListening) return;
        
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Update volume indicator
        volumeIndicator.textContent = `Volume: ${Math.round(volume)}`;
        
        // Scale and color transition based on volume
        const scale = 1 + (volume / 128) * 0.5;
        const hue = Math.min(180, volume); // 0 = red, 180 = cyan
        fish.style.filter = `hue-rotate(${hue}deg)`;
        fish.style.transform = `scale(${scale})`;

        if (volume > 50 && !isBreathing) {
            isBreathing = true;
            instruction.textContent = "Keep breathing...";
            
            breathTimer = setTimeout(() => {
                breathCount++;
                breathCountDisplay.textContent = `Breath: ${breathCount}/10`;
                isBreathing = false;
                instruction.textContent = "Take another deep breath";
                
                if (breathCount >= 10) {
                    stopAudioAnalysis();
                    instruction.textContent = "Great job! Exercise complete.";
                    startButton.textContent = 'Start New Session';
                }
            }, 3000); // 3 seconds for each breath
        } else if (volume < 30 && isBreathing) {
            clearTimeout(breathTimer);
            isBreathing = false;
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