let gameAnimFrame = null;
let gameState = { shooterLevel: 1, runnerLevel: 1, coins: 0 };

function closeGame() {
    document.getElementById('gameOverlay').classList.remove('show');
    if (gameAnimFrame) cancelAnimationFrame(gameAnimFrame);
}

function startGame(type) {
    if (type === 'shooter') openShooterMenu();
    else if (type === 'runner') openRunnerMenu();
}

// ИГРА 1: КОСМИЧЕСКИЕ ВОЙНЫ
function openShooterMenu() {
    const area = document.getElementById('gameArea');
    document.getElementById('gameTitle').textContent = 'Космические войны';
    document.getElementById('gameOverlay').classList.add('show');
    area.innerHTML = `
        <div style="text-align:center; color:#fff; padding:20px;">
            <h2 style="color:#00d4ff; text-shadow:0 0 10px #00d4ff; margin-bottom:20px;">Космические войны</h2>
            <div style="margin-bottom:20px;">Уровень: ${gameState.shooterLevel} / 1000</div>
            <button class="game-btn" onclick="selectDifficulty()">▶️ Играть</button>
            <button class="game-btn" onclick="openShooterShop()" style="background:#a06cd5; margin-left:10px;">🛠 Магазин</button>
            <button class="game-btn" onclick="closeGame()" style="background:#555; margin-top:10px;">Назад</button>
        </div>`;
}

function selectDifficulty() {
    const area = document.getElementById('gameArea');
    area.innerHTML = `
        <div style="text-align:center; color:#fff; padding:20px;">
            <h2 style="margin-bottom:20px;">Выбери сложность</h2>
            <button class="game-btn" onclick="initShooter(1)" style="background:#4ade80; width:80%; margin-bottom:10px;">Легко</button>
            <button class="game-btn" onclick="initShooter(1.5)" style="background:#f5a623; width:80%; margin-bottom:10px;">Средне</button>
            <button class="game-btn" onclick="initShooter(2.5)" style="background:#ff5e62; width:80%; margin-bottom:10px;">Сложно</button>
            <button class="game-btn" onclick="openShooterMenu()" style="background:#555; width:80%;">Назад</button>
        </div>`;
}

let shooterObj = {};
let playerUpgrades = { fireRate: 1, speed: 1, wave: 1 };
let bossHp = 200;

function initShooter(diff) {
    const area = document.getElementById('gameArea'); area.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight - 100;
    area.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    shooterObj = {
        canvas, ctx, playerX: canvas.width/2, playerY: canvas.height - 60, bullets: [], meteors: [], ufos: [],
        score: 0, timeLeft: 300, waveCharge: 0, isBoss: false, bossHp: bossHp + (gameState.shooterLevel * 50), bossMaxHp: bossHp + (gameState.shooterLevel * 50),
        isDead: false, isFiring: false, lastShot: 0, diff: diff, bossX: canvas.width/2, bossY: 100, bossTime: 0, bossShootTime: 0
    };

    canvas.addEventListener('touchmove', (e) => {
        const rect = canvas.getBoundingClientRect();
        shooterObj.playerX = e.touches[0].clientX - rect.left;
        shooterObj.playerY = e.touches[0].clientY - rect.top;
    }, {passive: false});
    canvas.addEventListener('touchstart', (e) => { shooterObj.isFiring = true; });

    let lastTick = performance.now();
    const gameLoop = (time) => {
        if (shooterObj.isDead) return;
        if (time - lastTick > 1000 && !shooterObj.isBoss) {
            lastTick = time; shooterObj.timeLeft--;
            if (shooterObj.timeLeft <= 0) { shooterObj.isBoss = true; }
        }
        ctx.fillStyle = '#0a0510'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (shooterObj.isFiring && time - shooterObj.lastShot > (300 / playerUpgrades.fireRate)) {
            shooterObj.bullets.push({ x: shooterObj.playerX, y: shooterObj.playerY - 20, vy: -15 });
            shooterObj.lastShot = time;
        }
        ctx.fillStyle = '#ffd700';
        shooterObj.bullets.forEach((b, i) => {
            b.y += b.vy; ctx.fillRect(b.x - 2, b.y - 10, 4, 15);
            if (b.y < 0) shooterObj.bullets.splice(i, 1);
        });

        if (!shooterObj.isBoss) {
            if (Math.random() < 0.02 * shooterObj.diff) shooterObj.meteors.push({ x: Math.random() * canvas.width, y: -30, speed: 2 * shooterObj.diff, size: 20 });
            shooterObj.meteors.forEach((m, i) => {
                m.y += m.speed; ctx.fillStyle = '#8c5a45'; ctx.beginPath(); ctx.arc(m.x, m.y, m.size, 0, Math.PI*2); ctx.fill();
                if (m.y > canvas.height) shooterObj.meteors.splice(i, 1);
            });
        } else {
            shooterObj.bossTime++; shooterObj.bossX = canvas.width/2 + Math.cos(shooterObj.bossTime * 0.02) * (canvas.width/3);
            ctx.fillStyle = '#ff5e62'; ctx.beginPath(); ctx.ellipse(shooterObj.bossX, shooterObj.bossY, 60, 30, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#333'; ctx.fillRect(shooterObj.bossX - 60, shooterObj.bossY - 50, 120, 10);
            ctx.fillStyle = '#4ade80'; ctx.fillRect(shooterObj.bossX - 60, shooterObj.bossY - 50, 120 * (shooterObj.bossHp / shooterObj.bossMaxHp), 10);
        }

        ctx.save(); ctx.translate(shooterObj.playerX, shooterObj.playerY);
        ctx.fillStyle = '#00d4ff'; ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(15, 10); ctx.lineTo(-15, 10); ctx.fill(); ctx.restore();

        gameAnimFrame = requestAnimationFrame(gameLoop);
    };
    gameAnimFrame = requestAnimationFrame(gameLoop);
}

function openShooterShop() {
    const area = document.getElementById('gameArea');
    area.innerHTML = `
        <div style="padding:20px; color:#fff; text-align:center;">
            <h2>Улучшения</h2>
            <button class="game-btn" onclick="upgrade('fireRate')">Скорострельность (Ур. ${playerUpgrades.fireRate}) - 100 🪙</button>
            <button class="game-btn" onclick="openShooterMenu()" style="background:#555; margin-top:20px;">Назад</button>
        </div>`;
}
function upgrade(type) { playerUpgrades[type]++; openShooterShop(); }

// ИГРА 2: КВАДРАТИК
function openRunnerMenu() {
    const area = document.getElementById('gameArea');
    document.getElementById('gameTitle').textContent = 'Квадратик';
    document.getElementById('gameOverlay').classList.add('show');
    area.innerHTML = `
        <div style="text-align:center; color:#fff; padding:20px;">
            <h2 style="color:#00d4ff; text-shadow:0 0 10px #00d4ff; margin-bottom:20px;">Квадратик</h2>
            <div style="margin-bottom:20px;">Уровень: ${gameState.runnerLevel} / 1000</div>
            <button class="game-btn" onclick="initRunner()">▶️ Играть</button>
            <button class="game-btn" onclick="closeGame()" style="background:#555; margin-top:10px;">Назад</button>
        </div>`;
}

let runnerObj = {};
function initRunner() {
    const area = document.getElementById('gameArea'); area.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight - 100;
    area.appendChild(canvas); const ctx = canvas.getContext('2d');

    runnerObj = {
        canvas, ctx, px: 50, py: canvas.height - 80, vy: 0, size: 30, obstacles: [], score: 0, speed: 5,
        monsterX: -100, monsterSpeed: 4, isDead: false, isEnd: false
    };

    const jump = (e) => { if(e) e.preventDefault(); if (runnerObj.py >= canvas.height - 80 && !runnerObj.isDead) { runnerObj.vy = -15; } };
    canvas.addEventListener('touchstart', jump, {passive: false});
    canvas.addEventListener('mousedown', jump);

    const loop = () => {
        if (runnerObj.isDead || runnerObj.isEnd) return;
        runnerObj.vy += 0.8; runnerObj.py += runnerObj.vy;
        if (runnerObj.py > canvas.height - 80) { runnerObj.py = canvas.height - 80; runnerObj.vy = 0; }
        
        runnerObj.monsterX += runnerObj.monsterSpeed;
        if (runnerObj.monsterX > runnerObj.px - 50 && runnerObj.monsterX < runnerObj.px + runnerObj.size) {
            runnerObj.isDead = true;
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = '#ff5e62'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Вас съели 🙁', canvas.width/2, canvas.height/2);
            return;
        }

        ctx.fillStyle = '#0a0510'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        
        ctx.fillStyle = '#00d4ff'; ctx.fillRect(runnerObj.px, runnerObj.py, runnerObj.size, runnerObj.size);
        ctx.fillStyle = '#000'; ctx.fillRect(runnerObj.px + 8, runnerObj.py + 10, 5, 5); ctx.fillRect(runnerObj.px + 18, runnerObj.py + 10, 5, 5);

        ctx.fillStyle = '#ff5e62'; ctx.fillRect(runnerObj.monsterX, runnerObj.py, runnerObj.size, runnerObj.size);
        ctx.fillStyle = '#000'; ctx.fillRect(runnerObj.monsterX + 5, runnerObj.py + 10, 5, 5); ctx.fillRect(runnerObj.monsterX + 20, runnerObj.py + 10, 5, 5);
        ctx.beginPath(); ctx.arc(runnerObj.monsterX + 15, runnerObj.py + 20, 8, 0, Math.PI, false); ctx.fill();

        gameAnimFrame = requestAnimationFrame(loop);
    };
    gameAnimFrame = requestAnimationFrame(loop);
}
