let isExerciseRunning = false;
let breathCount = 0;
const fish = document.getElementById('fish');
const startButton = document.getElementById('startButton');
const instruction = document.getElementById('instruction');
const countdownDisplay = document.getElementById('countdown');

// Add smooth transition to fish
fish.style.transition = 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)';

startButton.addEventListener('click', () => {
    if (!isExerciseRunning) {
        startExercise();
        startButton.textContent = 'I give up';
    } else {
        stopExercise();
        startButton.textContent = 'Start';
    }
});

// Add progress bar elements at the start
const progressBar = document.createElement('div');
progressBar.id = 'progressBar';
const progressFill = document.createElement('div');
progressFill.id = 'progressFill';
progressBar.appendChild(progressFill);
document.body.appendChild(progressBar);

// Add progress text element
const progressText = document.createElement('div');
progressText.id = 'progressText';
progressBar.appendChild(progressText);

function startExercise() {
    isExerciseRunning = true;
    breathCount = 0;
    instruction.textContent = "";
    countdownDisplay.textContent = "";
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // Hide button, show progress bar
    startButton.style.display = 'none';
    progressBar.style.display = 'block';
    
    // Start continuous progress update
    startContinuousProgress();
    
    setTimeout(() => {
        runBreathingCycle();
    }, 1000);
}

// Add continuous progress update function
function startContinuousProgress() {
    const totalDuration = 10 * 10000; // 10 breaths * 10 seconds each
    const startTime = Date.now();
    
    function updateProgress() {
        if (!isExerciseRunning) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / totalDuration) * 100, 100);
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        if (progress < 100 && isExerciseRunning) {
            requestAnimationFrame(updateProgress);
        }
    }
    
    requestAnimationFrame(updateProgress);
}

function runBreathingCycle() {
    if (!isExerciseRunning) return;
    
    const cycleDuration = 4000;
    
    // Remove progress update from here since it's now continuous
    createFloatingText('Inhale...');
    fish.style.transform = 'scale(0.5)';
    countdownDisplay.style.fontSize = '3.0em';
    countdownDisplay.style.fontWeight = '700';
    countdownDisplay.style.color = '#666666';
    updateCountdown(Date.now(), cycleDuration);
    
    setTimeout(() => {
        if (!isExerciseRunning) return;
        
        setTimeout(() => {
            if (!isExerciseRunning) return;
            
            // Exhale phase
            createFloatingText('Exhale...');
            fish.style.transform = 'scale(1)';
            updateCountdown(Date.now(), cycleDuration);
            
            setTimeout(() => {
                if (!isExerciseRunning) return;
                
                setTimeout(() => {
                    if (!isExerciseRunning) return;
                    
                    breathCount++;
                    const newProgress = (breathCount / 10) * 100;
                    progressFill.style.width = `${newProgress}%`;
                    progressText.textContent = `${Math.round(newProgress)}%`;
                    
                    if (breathCount >= 10) {
                        stopExercise();
                        instruction.textContent = "Great job! Let's move on, positively.";
                        startButton.textContent = 'Do it again';
                        countdownDisplay.textContent = "";
                    } else {
                        runBreathingCycle();
                    }
                }, 1000);
            }, cycleDuration);
        }, 1000);
    }, cycleDuration);
}

// Add this new function to create floating text
function createFloatingText(text) {
    const textElement = document.createElement('div');
    textElement.className = 'text-float';
    textElement.textContent = text;
    
    // Position the text with more random positioning
    const fishRect = fish.getBoundingClientRect();
    const randomHorizontalOffset = (Math.random() - 0.5) * 200; // Increased from 100 to 200
    const randomVerticalOffset = Math.random() * 100; // Random vertical offset up to 100px above fish
    
    textElement.style.left = `${fishRect.left + fishRect.width/2 + randomHorizontalOffset}px`;
    textElement.style.top = `${fishRect.top - 50 - randomVerticalOffset}px`; // Start higher and vary vertically
    
    document.body.appendChild(textElement);
    
    // Remove the element after animation completes
    setTimeout(() => {
        textElement.remove();
    }, 4000);
}

function updateCountdown(startTime, duration) {
    const updateTimer = () => {
        if (!isExerciseRunning) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const count = Math.floor(elapsed / 1000) + 1; // Count up from 1
        
        if (count <= 4) { // Show numbers 1 through 4
            countdownDisplay.textContent = count.toString();
            requestAnimationFrame(updateTimer);
        }
    };
    
    updateTimer();
}