const fish = document.getElementById('fish');
const countdown = document.getElementById('countdown');
const instruction = document.getElementById('instruction');
const final = document.getElementById('final');
const clicksEl = document.getElementById('clicks');
const cumulativeEl = document.getElementById('cumulative');
let angryFish = 'images/angry-fish.png';
let calmFish = 'images/calm-fish.png';

let clicks = 0;
let cumulative = 0;
let gameStarted = false;
const INITIAL_PENALTY = -200;

const emojis = ['🌿', '🧘', '🌱', '😌', '🌸'];
const texts = [
  "Let it go...",
  "Breathe in calm...",
  "You are safe.",
  "No need to fight.",
  "Anger fades..."
];

let textTimeout;
let gameInterval;

// Initialize game state
function initializeGame() {
  clicks = 0;
  gameStarted = false;
  clicksEl.textContent = clicks;
  final.style.display = 'none';
  fish.src = angryFish;
  countdown.textContent = '';
  instruction.style.opacity = 1;
  
  // Check if we're continuing from a previous game
  const isFreshLoad = !sessionStorage.getItem('gameInProgress');
  if (isFreshLoad) {
    cumulative = 0;
  }
  cumulativeEl.textContent = cumulative;
}

function startGame() {
  // Mark game as in progress
  sessionStorage.setItem('gameInProgress', 'true');
  
  let timeLeft = 3;
  countdown.textContent = timeLeft;
  
  // Show penalty flash
  const flashText = document.createElement('div');
  flashText.id = 'flash';
  flashText.textContent = INITIAL_PENALTY;
  document.body.appendChild(flashText);

  // Reset fish color
  fish.style.filter = 'hue-rotate(0deg)';

  const countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft === 0) {
      clearInterval(countdownInterval);
      countdown.textContent = 30;
      instruction.style.opacity = 0;
      gameStarted = true;
      flashText.remove();
      
      // Apply initial penalty only on fresh game start
      cumulative += INITIAL_PENALTY;
      cumulativeEl.textContent = cumulative;
      
      
      startClicking();
    } else {
      countdown.textContent = timeLeft;
    }
  }, 1000);
}

function startClicking() {
  let timeLeft = 30;
  gameInterval = setInterval(() => {
    timeLeft--;
    countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  final.style.display = 'block';
  fadeFish();
  
  // Save to localStorage for replay visibility
  localStorage.setItem('lastScore', cumulative.toString());
}

function setupReplay() {
  document.getElementById('replay').addEventListener('click', () => {
    // Show last score from storage
    const lastScore = localStorage.getItem('lastScore');
    if (lastScore) {
      final.textContent = `Last Score: ${lastScore}`;
    }
    
    // Start new game without resetting cumulative score
    initializeGame();
    startGame();
  });
}

// Handle fish clicks
const handleClick = () => {
  if (!gameStarted) return;
  
  clicks++;
  cumulative++;
  clicksEl.textContent = clicks;
  cumulativeEl.textContent = cumulative;

  // Visual effects
  fish.style.transform = 'scale(0.95)';
  setTimeout(() => (fish.style.transform = 'scale(1)'), 100);

  // Emoji burst
  const emoji = document.createElement('div');
  emoji.className = 'emoji';
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  document.body.appendChild(emoji);
  const fishRect = fish.getBoundingClientRect();
  emoji.style.left = `${fishRect.left + fishRect.width / 2}px`;
  emoji.style.top = `${fishRect.top + fishRect.height / 2}px`;
  setTimeout(() => emoji.remove(), 2000);

  // Text cloud every 15 clicks
  if (clicks % 15 === 0) {
    clearTimeout(textTimeout);
    const text = document.createElement('div');
    text.className = 'text-cloud';
    text.textContent = texts[Math.floor(Math.random() * texts.length)];
    text.style.left = `${Math.random() * (window.innerWidth - 200)}px`;
    text.style.top = `${window.innerHeight / 3}px`;
    document.body.appendChild(text);
    textTimeout = setTimeout(() => text.remove(), 4000);
  }

  // Fish transition
  let progress = Math.min(clicks / 30, 1);
  if (progress >= 1) {
    fish.src = calmFish;
    fish.style.transform += ' translateY(-5px)';  // GH: not sure if this is doing anything
    fish.style.filter = 'hue-rotate(' + Math.random() * 360 + 'deg)';
  } else if (progress > 0.5) {
    fish.src = calmFish;
  }
}

fish.addEventListener('click', handleClick);  // for desktop
fish.addEventListener('touchstart', handleClick);  // for mobile

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  // Clear session storage on fresh load
  const isRefresh = performance.navigation.type === 1;
  if (isRefresh) {
    sessionStorage.removeItem('gameInProgress');
  }
  
  initializeGame();
  setupReplay();
  startGame();
});

// Clear session storage when window closes
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('gameInProgress');
});