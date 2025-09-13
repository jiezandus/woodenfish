let tapCount = 0;
const fish = document.getElementById('fish');
const calmFish = document.getElementById('calm-fish');
const cumulativeDisplay = document.getElementById('cumulative');
const wishInput = document.getElementById('wish-input');
const addWishButton = document.getElementById('add-wish');

const mallet = document.getElementById('mallet');
let inactivityTimer;
let isTouching = false;

// Clear localStorage on page load/refresh
localStorage.removeItem('wishes');

// Initialize wishes array
let wishes = [];

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