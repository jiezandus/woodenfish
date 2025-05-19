let tapCount = 0;
const fish = document.getElementById('fish');
const calmFish = document.getElementById('calm-fish');
const cumulativeDisplay = document.getElementById('cumulative');
const wishInput = document.getElementById('wish-input');
const addWishButton = document.getElementById('add-wish');

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
        // Remove immediate floating text creation
    }
}

fish.addEventListener('click', () => {
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
});

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