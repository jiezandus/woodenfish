const fish = document.getElementById('fish');
const countdown = document.getElementById('countdown');
const instruction = document.getElementById('instruction');
const final = document.getElementById('final');
const clicksEl = document.getElementById('clicks');
const cumulativeEl = document.getElementById('cumulative');
let angryFish = 'images/angry-fish.png';
let calmFish = 'images/calm-fish.png';

let clicks = 0;
let cumulative = -200;  // Start score at -200 each time
let gameStarted = false;

const emojis = ['🌿', '🧘', '🌱', '😌', '🌸'];
const texts = [
  "Let it go...",
  "Breathe in calm...",
  "You are safe.",
  "No need to fight.",
  "Anger fades..."
];

let textTimeout; // Track the text cloud timeout to prevent overlap

// Start the game and reset the UI elements
function startGame() {
  let timeLeft = 3;
  countdown.textContent = timeLeft;
  instruction.style.opacity = 1; // Ensure instruction text is visible
  const countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft === 0) {
      clearInterval(countdownInterval);
      countdown.textContent = 30;
      instruction.style.opacity = 0;  // Hide the instruction
      gameStarted = true;
      startClicking();
    } else {
      countdown.textContent = timeLeft;
    }
  }, 1000);
}

function startClicking() {
  let timeLeft = 30;
  const gameInterval = setInterval(() => {
    timeLeft--;
    countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(gameInterval);
      gameStarted = false;
      cumulative += clicks;
      cumulativeEl.textContent = cumulative;
      clicksEl.textContent = clicks;
      final.style.display = 'block';
      fadeFish();
      
      // Save the updated score to localStorage
      localStorage.setItem('cumulativeScore', cumulative);
    }
  }, 1000);
}

function fadeFish() {
  fish.classList.add('faded'); // Makes happy fish 30% opacity and places it behind final text
}

fish.addEventListener('click', () => {
  if (!gameStarted) return;
  clicks++;

  // Update the score
  cumulative += 1;
  cumulativeEl.textContent = cumulative;  // Display updated score in the upper-right corner
  clicksEl.textContent = clicks;

  // Wiggle animation
  fish.style.transform = 'scale(0.95)';
  setTimeout(() => (fish.style.transform = 'scale(1)'), 100);

  // Emoji burst
  const emoji = document.createElement('div');
  emoji.className = 'emoji';
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  const angle = Math.random() * 60 - 30;
  emoji.style.setProperty('--x-offset', `${angle}px`);
  document.body.appendChild(emoji);
  const fishRect = fish.getBoundingClientRect();
  emoji.style.left = `${fishRect.left + fishRect.width / 2}px`;
  emoji.style.top = `${fishRect.top + fishRect.height / 2}px`;
  setTimeout(() => emoji.remove(), 2000);

  // Remove any existing text cloud before adding a new one
  clearTimeout(textTimeout);

  // Text cloud (appear above fish only)
  const text = document.createElement('div');
  text.className = 'text-cloud';
  text.textContent = texts[Math.floor(Math.random() * texts.length)];
  text.style.left = `${Math.random() * (window.innerWidth - 400)}px`;  // Spread text evenly across the page
  text.style.top = `${window.innerHeight / 2 - 250}px`; // Start higher above the fish
  text.style.fontSize = `${1 + Math.random()}em`;
  document.body.appendChild(text);

  // Set a timeout to remove the text cloud after 4 seconds
  textTimeout = setTimeout(() => text.remove(), 4000);

  // Gradual transition
  let progress = Math.min(clicks / 30, 1);
  const transitionFish = () => {
    if (progress >= 1) {
      fish.src = calmFish;
      fish.style.transition = 'transform 1s ease-in-out';
      fish.style.transform += ' translateY(-5px)';
    } else {
      if (progress > 0.5) fish.src = calmFish;
      else fish.src = angryFish;
    }
  };
  transitionFish();
});

// Replay the game and reset everything
document.getElementById('replay').addEventListener('click', () => {
  clicks = 0;
  // Add -200 to the previous score and start the game again
  cumulative = parseInt(localStorage.getItem('cumulativeScore') || '-200') - 200;
  final.style.display = 'none';
  fish.src = angryFish;
  cumulativeEl.textContent = cumulative;  // Display the updated score
  clicksEl.textContent = clicks;  // Reset clicks
  countdown.textContent = '';
  instruction.style.opacity = 1;
  startGame();
  
  // Save the updated score to localStorage
  localStorage.setItem('cumulativeScore', cumulative);
});

// Initialize the game
startGame();
