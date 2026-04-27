const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Colors
const colors = {
    bg: '#020617',
    snakeHead: '#38bdf8',
    snakeBody: '#0ea5e9',
    food: '#10b981',
    foodGlow: 'rgba(16, 185, 129, 0.5)'
};

const gridSize = 20;
let tileCount = canvas.width / gridSize;
let velocityX = 0;
let velocityY = 0;
let snake = [];
let foodX = 10;
let foodY = 10;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoopId = null;
let isPlaying = false;

highScoreElement.textContent = highScore;

// Resize canvas handling to keep coordinate system simple, we just use logical 400x400
// But ensure tileCount matches
tileCount = canvas.width / gridSize;

function initGame() {
    snake = [
        { x: 10, y: 10 }
    ];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    scoreElement.textContent = score;
    placeFood();
    isPlaying = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(gameLoop, 100);
}

function gameLoop() {
    update();
    draw();
}

function update() {
    if (!isPlaying) return;

    // Move snake
    const headX = snake[0].x + velocityX;
    const headY = snake[0].y + velocityY;

    // We only process movement if velocity is not 0
    if (velocityX === 0 && velocityY === 0) return;

    const newHead = { x: headX, y: headY };

    // Check collisions
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount || checkSelfCollision(headX, headY)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    // Check food collision
    if (headX === foodX && headY === foodY) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        placeFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (optional, for aesthetics)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<=tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw Food with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.foodGlow;
    ctx.fillStyle = colors.food;
    
    // Draw food as circle
    ctx.beginPath();
    ctx.arc(foodX * gridSize + gridSize/2, foodY * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw Snake
    snake.forEach((segment, index) => {
        // Head gets a slightly different style
        ctx.fillStyle = index === 0 ? colors.snakeHead : colors.snakeBody;
        
        // Add roundness to segments
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2;
        const radius = 4;
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, size, size, radius);
        ctx.fill();
    });
}

function checkSelfCollision(x, y) {
    // Start from 1 because 0 is the current head before update
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === x && snake[i].y === y) return true;
    }
    return false;
}

function placeFood() {
    let valid = false;
    while (!valid) {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        valid = true;
        // Check if food spawned on snake
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                valid = false;
                break;
            }
        }
    }
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameLoopId);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Controls
function changeDirection(e) {
    let key;
    if (typeof e === 'string') {
        key = e; // from on-screen buttons
    } else {
        key = e.key; // from keyboard
        // Prevent default scrolling for arrow keys
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(key) > -1) {
            e.preventDefault();
        }
    }

    if (!isPlaying) {
        if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
            initGame();
        }
    }

    if (key === 'ArrowUp' && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (key === 'ArrowDown' && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (key === 'ArrowLeft' && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (key === 'ArrowRight' && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

document.addEventListener('keydown', changeDirection);

// On-screen buttons
document.getElementById('btn-up').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('ArrowUp'); });
document.getElementById('btn-down').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('ArrowDown'); });
document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('ArrowLeft'); });
document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('ArrowRight'); });

document.getElementById('btn-up').addEventListener('mousedown', () => changeDirection('ArrowUp'));
document.getElementById('btn-down').addEventListener('mousedown', () => changeDirection('ArrowDown'));
document.getElementById('btn-left').addEventListener('mousedown', () => changeDirection('ArrowLeft'));
document.getElementById('btn-right').addEventListener('mousedown', () => changeDirection('ArrowRight'));

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

// Initial draw
draw();