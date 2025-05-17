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
        startButton.textContent = 'Stop';
    } else {
        stopExercise();
        startButton.textContent = 'Start';
    }
});

function startExercise() {
    isExerciseRunning = true;
    breathCount = 0;
    instruction.textContent = "";  // Remove the "get ready" text
    countdownDisplay.textContent = "";
    
    // Start the breathing cycle
    setTimeout(() => {
        runBreathingCycle();
    }, 1000);
}

function runBreathingCycle() {
    if (!isExerciseRunning) return;
    
    const cycleDuration = 4000; // 4 seconds
    
    // Inhale phase - shrink to 50%
    console.log('Starting inhale phase');
    createFloatingText(`Inhale ${breathCount + 1}...`);
    fish.style.transform = 'scale(0.5)';  // Direct CSS transform
    countdownDisplay.style.fontSize = '3.0em';  // Match tapping.css countdown size
    countdownDisplay.style.fontWeight = '700';  // Match tapping.css font weight
    countdownDisplay.style.color = '#666666';  // Match tapping.css text color
    updateCountdown(Date.now(), cycleDuration);
    
    setTimeout(() => {
        if (!isExerciseRunning) return;
        
        setTimeout(() => {
            if (!isExerciseRunning) return;
            
            // Exhale phase - return to 100%
            console.log('Starting exhale phase');
            createFloatingText(`Exhale ${breathCount + 1}...`);
            fish.style.transform = 'scale(1)';  // Direct CSS transform
            updateCountdown(Date.now(), cycleDuration);
            
            setTimeout(() => {
                if (!isExerciseRunning) return;
                
                setTimeout(() => {
                    if (!isExerciseRunning) return;
                    
                    breathCount++;
                    
                    if (breathCount >= 10) {
                        stopExercise();
                        instruction.textContent = "Great job! Exercise complete.";
                        startButton.textContent = 'Start New Session';
                        countdownDisplay.textContent = "";
                    } else {
                        runBreathingCycle(); // Start next breath cycle
                    }
                }, 1000); // 1 second pause before next breath
            }, cycleDuration);
        }, 1000); // 1 second pause after inhale
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

function stopExercise() {
    console.log('Stopping exercise, resetting fish scale');
    isExerciseRunning = false;
    fish.style.transform = 'scale(1)';
    instruction.textContent = "";
    countdownDisplay.textContent = "";
    startButton.textContent = 'Start';
}