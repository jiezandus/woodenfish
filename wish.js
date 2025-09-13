let tapCount = 0;
const fish = document.getElementById('fish');
const calmFish = document.getElementById('calm-fish');
const cumulativeDisplay = document.getElementById('cumulative');
const wishInput = document.getElementById('wish-input');
const addWishButton = document.getElementById('add-wish');
const countdownDisplay = document.getElementById('countdown');
const summaryElement = document.getElementById('summary');
const finalCountDisplay = document.getElementById('final-count');
const instructionElement = document.getElementById('instruction');
const wishInputContainer = document.getElementById('wish-input-container');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');

// Timer variables
let timeLeft = 60; // 1 minute in seconds
let countdownTimer;

const mallet = document.getElementById('mallet');
let inactivityTimer;
let isTouching = false;

// Clear localStorage on page load/refresh
localStorage.removeItem('wishes');

// Initialize wishes array and wish counts map
let wishes = [];
let wishCounts = new Map(); // Map to track individual wish counts

// Start the countdown timer when the page loads
function startCountdown() {
    // Display initial time
    updateTimerDisplay();
    
    // Start the countdown
    countdownTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
    countdownDisplay.textContent = ` ${timeLeft}`;
}

// End the game when time is up
function endGame() {
    clearInterval(countdownTimer);
    
    // Hide the instruction and fish elements
    instructionElement.classList.add('hidden');
    fish.classList.add('hidden');
    mallet.classList.add('hidden');
    timerElement.classList.add('hidden');
    scoreElement.classList.add('hidden');
    
    // Show the summary
    summaryElement.classList.remove('hidden');
    
    // Display individual wish counts
    const wishCountsContainer = document.getElementById('wish-counts-container');
    wishCountsContainer.innerHTML = ''; // Clear previous content
    
    if (wishCounts.size === 0) {
        wishCountsContainer.innerHTML = '<p class="wish-count-item">No wishes were made in this session.</p>';
    } else {
        // Sort wishes by count (descending)
        const sortedWishes = [...wishCounts.entries()].sort((a, b) => b[1] - a[1]);
        
        for (const [wish, count] of sortedWishes) {
            const countText = count === 1 ? 'echo' : 'echoes';
            const wishItem = document.createElement('p');
            wishItem.className = 'wish-count-item';
            wishItem.textContent = `"${wish}" received ${count} ${countText}`;
            wishCountsContainer.appendChild(wishItem);
        }
    }
    
    // Show the wish input if it was hidden
    wishInputContainer.classList.remove('hidden');
}

// Button event listeners
document.getElementById('play-again').addEventListener('click', () => {
    // Reset the game state
    tapCount = 0;
    timeLeft = 60;
    wishCounts.clear(); // Reset wish counts
    
    // Show the game elements
    instructionElement.classList.remove('hidden');
    fish.classList.remove('hidden');
    mallet.classList.remove('hidden');
    timerElement.classList.remove('hidden');
    scoreElement.classList.remove('hidden');
    
    // Hide the summary
    summaryElement.classList.add('hidden');
    
    // Update displays
    cumulativeDisplay.textContent = tapCount;
    
    // Restart the countdown
    startCountdown();
});

document.getElementById('return-main').addEventListener('click', () => {
    // Navigate to the main page
    window.location.href = 'index.html';
});

// Start the countdown when the page loads
startCountdown();

function saveWishes() {
    localStorage.setItem('wishes', JSON.stringify(wishes));
}

function addWish() {
    const wishText = wishInput.value.trim();
    if (wishText) {
        wishes.push(wishText);
        saveWishes();
        wishInput.value = '';
    }
}

// Reset inactivity timer
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (!isTouching) {
            mallet.classList.remove('hit');
        }
    }, 3000); // Hide after 3 seconds of inactivity
}

// Handle touch/mouse start
fish.addEventListener('mousedown', handleTouchStart);
fish.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default behavior
    handleTouchStart(e.touches[0]);
});

function handleTouchStart(e) {
    isTouching = true;
    
    // Position and show mallet at touch position
    const x = e.clientX || e.pageX;
    const y = e.clientY || e.pageY;
    mallet.style.left = (x - 40) + 'px';
    mallet.style.top = (y - 40) + 'px';
    mallet.classList.add('hit');
    
    // Add 15% counterclockwise rotation when tapping
    mallet.style.transform = 'rotate(-15deg) scale(1)';
    
    resetInactivityTimer();
}

// Handle touch/mouse end
document.addEventListener('mouseup', handleTouchEnd);
document.addEventListener('touchend', handleTouchEnd);

function handleTouchEnd() {
    if (isTouching) {
        isTouching = false;
        
        // Move mallet to northeast direction
        const currentLeft = parseInt(mallet.style.left) || 0;
        const currentTop = parseInt(mallet.style.top) || 0;
        
        // Move 50px northeast (up and right) with 5% clockwise rotation
        mallet.style.left = (currentLeft + 30) + 'px';
        mallet.style.top = (currentTop - 30) + 'px';
        mallet.style.transform = 'rotate(5deg) scale(1)';
        
        resetInactivityTimer();
    }
}

// Update fish animation and show wishes in the touch start handler
function updateFishAndWishes() {
    // Increment tap count
    tapCount++;
    cumulativeDisplay.textContent = tapCount;
    
    // Fish animation and color change
    fish.style.transform = 'scale(0.95)';
    fish.style.filter = 'hue-rotate(' + Math.random() * 360 + 'deg)';
    
    setTimeout(() => {
        fish.style.transform = 'scale(1)';
    }, 100);
    
    // Show random wish if available
    if (wishes.length > 0) {
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        
        // Update wish count
        if (wishCounts.has(randomWish)) {
            wishCounts.set(randomWish, wishCounts.get(randomWish) + 1);
        } else {
            wishCounts.set(randomWish, 1);
        }
        
        createFloatingWish(randomWish);
    }
}

// Call updateFishAndWishes when touch starts
fish.addEventListener('mousedown', updateFishAndWishes);
fish.addEventListener('touchstart', updateFishAndWishes);

addWishButton.addEventListener('click', addWish);
wishInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addWish();
    }
});

function createFloatingWish(text) {
    const wish = document.createElement('div');
    wish.className = 'floating-wish';
    wish.textContent = text + ' +1';  // Add +1 to the text
    
    // Random vertical position
    const verticalPosition = Math.random() * (window.innerHeight - 100);
    wish.style.top = `${verticalPosition}px`;
    
    document.body.appendChild(wish);
    
    // Remove element after animation
    wish.addEventListener('animationend', () => {
        wish.remove();
    });
}

// Remove beforeunload event listener since we want to clear on page load instead