const fish = document.getElementById('fish');
const angryFish = document.getElementById('angry-fish');
const calmFish = document.getElementById('calm-fish');
const countdown = document.getElementById('countdown');
const instruction = document.getElementById('instruction');
const final = document.getElementById('final');
const clicksEl = document.getElementById('clicks');
const cumulativeEl = document.getElementById('cumulative');

let clicks = 0;
let cumulative = 0;
let gameStarted = false;
const INITIAL_PENALTY = -300;

const emojis = ['🌿', '🧘', '🌱', '😌', '🌸'];
const texts = [
  "Don't hold onto anger.",
  "Breathe.",
  "You are doing great.",
  "No need to fight.",
  "Let it pass."
];

const finalMessages = [
  "You released {N} ripples of tension.",
  "{N} taps closer to calmness.",
  "{N} splashes later...a little lighter?",
  "Each tap a small letting go - {N} in total.",
  "Not anger. Just {N} chances to begin again."
];

let textTimeout;
let gameInterval;

// Initialize game state
function initializeGame() {
  clicks = 0;
  gameStarted = false;
  clicksEl.textContent = clicks;
  final.style.display = 'none';
  countdown.textContent = '';
  countdown.style.display = 'block'; // Ensure it's visible when starting
  countdown.style.opacity = '1'; // Ensure it's visible when starting;
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
  
  let timeLeft = 5;
  countdown.textContent = timeLeft;
  
  // Show penalty flash
  const flashText = document.createElement('div');
  flashText.id = 'flash';
  flashText.textContent = INITIAL_PENALTY;
  document.body.appendChild(flashText);

  // Reset fish color
  angryFish.style.opacity = 1;
  calmFish.style.opacity = 0;
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
  countdown.style.opacity = '0'; // Fade out instead of hide
  setTimeout(() => countdown.style.display = 'none', 500); // Hide after fade
  const randomMessage = finalMessages[Math.floor(Math.random() * finalMessages.length)];
  document.getElementById("final-message").innerHTML = randomMessage.replace("{N}", clicks);
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
  const emojiRect = emoji.getBoundingClientRect();
  emoji.style.left = `${fishRect.left + fishRect.width / 2 - emojiRect.width/2}px`;
  emoji.style.top = `${fishRect.top + fishRect.height / 2}px`;
  setTimeout(() => emoji.remove(), 2000);

  // Text cloud every 30 clicks
  if (clicks % 30 === 0) {
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
  let progress = clicks / 50;
  if (progress <= 1) {
    angryFish.style.opacity = 1 - progress;
    calmFish.style.opacity = progress;
  } else if (progress > 1.5) {
    fish.style.filter = 'hue-rotate(' + Math.random() * 360 + 'deg)';
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