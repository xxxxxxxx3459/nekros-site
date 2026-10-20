let gameAnimFrame = null;
let gameState = { shooterLevel: 1, runnerLevel: 1, coins: 0 };
let playerUpgrades = { fireRate: 1, speed: 1, wave: 1 };
let bossShootTime = 0;

function closeGame() {
    document.getElementById('gameOverlay').classList.remove('show');
    if (gameAnimFrame) cancelAnimationFrame(gameAnimFrame);
}

function startGame(type) {
    if (type === 'shooter') openShooterMenu();
    else if (type === 'runner') openRunnerMenu();
}

/* ================== ИГРА 1: КОСМИЧЕСКИЕ ВОЙНЫ ================== */
function openShooterMenu() {
    const area = document.getElementById('gameArea');
    document.getElementById('gameTitle').textContent = 'Космические войны';
    document.getElementById('gameOverlay').classList.add('show');
    area.innerHTML = `
        <div style="text-align:center; color:#fff; padding:20px; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <h2 style="color:#00d4ff; text-shadow:0 0 10px #00d4ff; margin-bottom:20px; font-size:32px;">Космические войны</h2>
            <div style="margin-bottom:20px; font-size:18px;">Уровень: ${gameState.shooterLevel} / 1000</div>
            <button class="game-btn" onclick="selectDifficulty()" style="width:200px; margin-bottom:10px;">▶️ Играть</button>
            <button class="game-btn" onclick="openShooterShop()" style="background:#a06cd5; width:200px; margin-bottom:10px;">🛠 Магазин</button>
            <button class="game-btn" onclick="closeGame()" style="background:#555; width:200px;">Назад</button>
        </div>`;
}

function selectDifficulty() {
    const area = document.getElementById('gameArea');
    area.innerHTML = `
        <div style="text-align:center; color:#fff; padding:20px; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <h2 style="margin-bottom:20px;">Выбери сложность</h2>
            <button class="game-btn" onclick="initShooter(1)" style="background:#4ade80; width:200px; margin-bottom:10px;">Легко</button>
            <button class="game-btn" onclick="initShooter(1.5)" style="background:#f5a623; width:200px; margin-bottom:10px;">Средне</button>
            <button class="game-btn" onclick="initShooter(2.5)" style="background:#ff5e62; width:200px; margin-bottom:10px;">Сложно</button>
            <button class="game-btn" onclick="openShooterMenu()" style="background:#555; width:200px;">Назад</button>
        </div>`;
}

let shooterObj = {};

function initShooter(diff) {
    const area.b = document.getElementById('gameArea'); areaoss.innerHTML = '';
    const canvasMaxHp * =  document.createElement('canvas');
0    canvas.width = window.innerWidth; canvas.height = window.innerHeight. - 100;
    area.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const baseHp = 200 + (gameState.shooterLevel * 50);
    shooterObj = {
        canvas, ctx, playerX: canvas.width/2, playerY: canvas.height - 60, bullets: [], meteors: [], ufos: [], bossProjectiles: [],
        score: 0, timeLeft: 300, waveCharge: 0, isBoss: false, bossHp: baseHp, bossMaxHp: baseHp,
        isDead: false, isFiring: false, lastShot: 0, diff: diff, bossX: canvas.width/2, bossY: 100, bossTime: 0
    };

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        shooterObj.playerX = e.touches[0].clientX - rect.left;
        if (e.touches[0].clientY - rect.top > 100) shooterObj.playerY = e.touches[0].clientY - rect.top;
    }, {passive: false});
    canvas.addEventListener('touchstart', (e) => { shooterObj.isFiring = true; });
    canvas.addEventListener('touchend', () => { shooterObj.isFiring = false; });
    canvas.addEventListener('mousedown', () => { shooterObj.isFiring = true; });
    canvas.addEventListener('mouseup', () => { shooterObj.isFiring = false; });

    const uiTop = document.createElement('div');
    uiTop.className = 'game-ui-top';
    uiTop.innerHTML = `<div>Ур: ${gameState.shooterLevel} | ⏱ <span id="shTime">05:00</span></div><div>⭐ <span id="shScore">0</span></div>`;
    area.appendChild(uiTop);

    const turboBar = document.createElement('div');
    turboBar.className = 'turbo-bar-container'; turboBar.id = 'turboBar';
    turboBar.innerHTML = '<div class="turbo-bar-fill" id="turboFill"></div><div class="turbo-bar-label" id="turboLabel">ВОЛНА 0%</div>';
    area.appendChild(turboBar);
    const turboBtn = document.createElement('button');
    turboBtn.className = 'turbo-btn'; turboBtn.id = 'turboBtn'; turboBtn.textContent = 'ВОЛНА';
    area.appendChild(turboBtn);

    turboBtn.onclick = () => {
        if (shooterObj.waveCharge >= 100) {
            shooterObj.waveCharge = 0; shooterObj.ufos = []; shooterObj.meteors = [];
            for(let i=0; i<20; i++) playSound('explosion');
            if (shooterObj.isBoss) shooterObj.bossHp -= (shooterObj2);
            document.getElementById('turboFill').style.width = '0%';
            document.getElementById('turboLabel').textContent = 'ВОЛНА 0%';
            turboBtn.classList.remove('ready');
            turboBtn.style.display = 'none';
        }
    };

    let lastTick = performance.now();
    let spawnTime = 0;

    const gameLoop = (time) => {
        if (shooterObj.isDead) return;
        if (time - lastTick > 1000 && !shooterObj.isBoss) {
            lastTick = time; shooterObj.timeLeft--;
            const m = Math.floor(shooterObj.timeLeft/60), s = shooterObj.timeLeft%60;
            document.getElementById('shTime').innerText = `0${m}:${s<10?'0':''}${s}`;
            if (shooterObj.timeLeft <= 0) shooterObj.isBoss = true;
        }

        ctx.fillStyle = '#0a0510'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (shooterObj.isFiring && time - shooterObj.lastShot > (250 / playerUpgrades.fireRate)) {
            shooterObj.bullets.push({ x: shooterObj.playerX, y: shooterObj.playerY - 20, vy: -15 });
            shooterObj.lastShot = time; playSound('laser');
        }
        ctx.fillStyle = '#ffd700';
        for(let i = shooterObj.bullets.length - 1; i >= 0; i--) {
            let b = shooterObj.bullets[i]; b.y += b.vy; ctx.fillRect(b.x - 2, b.y - 10, 4, 15);
            if (b.y < 0) shooterObj.bullets.splice(i, 1);
        }

        if (!shooterObj.isBoss) {
            if (time - spawnTime > 1000 / shooterObj.diff) {
                spawnTime = time;
                if (Math.random() > 0.5) shooterObj.meteors.push({ x: Math.random() * canvas.width, y: -30, speed: 2 * shooterObj.diff, size: 20 });
                else shooterObj.ufos.push({ x: Math.random() * canvas.width, y: -30, speed: 1.5 * shooterObj.diff, size: 25 });
            }
            ctx.fillStyle = '#8c5a45';
            for(let i = shooterObj.meteors.length - 1; i >= 0; i--) {
                let m = shooterObj.meteors[i]; m.y += m.speed; ctx.beginPath(); ctx.arc(m.x, m.y, m.size, 0, Math.PI*2); ctx.fill();
                if (m.y > canvas.height) shooterObj.meteors.splice(i, 1);
            }
            ctx.fillStyle = '#4ade80';
            for(let i = shooterObj.ufos.length - 1; i >= 0; i--) {
                let u = shooterObj.ufos[i]; u.y += u.speed; ctx.fillRect(u.x - u.size/2, u.y - u.size/2, u.size, u.size);
                if (u.y > canvas.height) shooterObj.ufos.splice(i, 1);
            }
        } else {
            shooterObj.bossTime++; shooterObj.bossX = canvas.width/2 + Math.cos(shooterObj.bossTime * 0.02) * (canvas.width/3);
            ctx.fillStyle = '#ff5e62'; ctx.beginPath(); ctx.ellipse(shooterObj.bossX, shooterObj.bossY, 60, 30, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#333'; ctx.fillRect(shooterObj.bossX - 60, shooterObj.bossY - 50, 120, 10);
            ctx.fillStyle = '#4ade80'; ctx.fillRect(shooterObj.bossX - 60, shooterObj.bossY - 50, 120 * (shooterObj.bossHp / shooterObj.bossMaxHp), 10);
            
            if (time - bossShootTime > 1500) {
                bossShootTime = time;
                const dx = shooterObj.playerX - shooterObj.bossX;
                const dy = shooterObj.playerY - shooterObj.bossY;
                const dist = Math.hypot(dx, dy);
                shooterObj.bossProjectiles.push({ x: shooterObj.bossX, y: shooterObj.bossY + 20, vx: (dx / dist) * 5, vy: (dy / dist) * 5 });
            }
        }
        
        ctx.fillStyle = '#00d4ff';
        for(let i = shooterObj.bossProjectiles.length - 1; i >= 0; i--) {
            let p = shooterObj.bossProjectiles[i]; p.x += p.vx; p.y += p.vy;
            ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
            if (Math.hypot(p.x - shooterObj.playerX, p.y - shooterObj.playerY) < 25) { endShooter(false); return; }
            if (p.y > canvas.height) shooterObj.bossProjectiles.splice(i, 1);
        }

        ctx.save(); ctx.translate(shooterObj.playerX, shooterObj.playerY);
        ctx.fillStyle = '#00d4ff'; ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(15, 10); ctx.lineTo(-15, 10); ctx.fill(); ctx.restore();

        shooterObj.waveCharge += 0.2;
        if (shooterObj.waveCharge > 100) {
            shooterObj.waveCharge = 100;
            document.getElementById('turboBar').style.display = 'block';
            document.getElementById('turboFill').style.width = '100%';
            document.getElementById('turboLabel').textContent = 'ВОЛНА ГОТОВА';
            turboBtn.classList.add('ready'); turboBtn.style.display = 'flex';
        }

        gameAnimFrame = requestAnimationFrame(gameLoop);
    };
    gameAnimFrame = requestAnimationFrame(gameLoop);
}

function endShooter(isWin) {
    shooterObj.isDead = true;
    const area = document.getElementById('gameArea');
    if(isWin) {
        playSound('win');
        area.innerHTML = `<div style="text-align:center; color:#fff; padding:20px;"><h1 style="color:#4ade80; font-size:40px; margin-bottom:20px;">ПОБЕДА!</h1><p>Босс уничтожен</p><button class="game-btn" onclick="openShooterMenu()" style="margin-top:20px;">В меню</button></div>`;
    } else {
        playSound('gameover'); speakPotracheno();
        area.innerHTML = `<div style="text-align:center; color:#fff; padding:20px;"><h1 style="color:#ff5e62; font-size:50px; margin-bottom:20px; text-shadow:0 0 20px #ff5e62;">ПОТРАЧЕНО</h1><button class="game-btn" onclick="openShooterMenu()" style="margin-top:20px;">Попробовать снова</button></div>`;
    }
}

function openShooterShop() {
    const area = document.getElementById('gameArea');
    area.innerHTML = `
        <div style="padding:20px; color:#fff; text-align:center; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <h2>Улучшения</h2>
            <button class="game-btn" onclick="upgrade('fireRate')" style="width:250px; margin-bottom:10px;">Скорострельность (Ур. ${playerUpgrades.fireRate})</button>
            <button class="game-btn" onclick="openShooterMenu()" style="background:#555; width:250px;">Назад</button>
        </div>`;
}
function upgrade(type) { playerUpgrades[type]++; openShooterShop(); }

/* ================== ИГРА 2: КВАДРАТИК ================== */
function openRunnerMenu() {
    const area = document.getElementById('gameArea');
    document.getElementById('gameTitle').textContent = 'Квадратик';
    document.getElementById('gameOverlay').classList.add('show');
    area.innerHTML = `
        <div style="text-align:center; color:#fff; padding:20px; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <h2 style="color:#00d4ff; text-shadow:0 0 10px #00d4ff; margin-bottom:20px; font-size:32px;">Квадратик</h2>
            <div style="margin-bottom:20px; font-size:18px;">Уровень: ${gameState.runnerLevel} / 1000</div>
            <button class="game-btn" onclick="initRunner()" style="width:200px; margin-bottom:10px;">▶️ Играть</button>
            <button class="game-btn" onclick="closeGame()" style="background:#555; width:200px;">Назад</button>
        </div>`;
}

function initRunner() {
    const area = document.getElementById('gameArea'); area.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight - 100;
    area.appendChild(canvas); const ctx = canvas.getContext('2d');

    let runnerObj = {
        canvas, ctx, px: 80, py: canvas.height - 80, vy: 0, size: 30, score: 0, 
        monsterX: -100, monsterSpeed: 3 + (gameState.runnerLevel * 0.1), isDead: false
    };

    const jump = (e) => { if(e) e.preventDefault(); if (runnerObj.py >= canvas.height - 80 && !runnerObj.isDead) { runnerObj.vy = -14; playSound('jump'); } };
    canvas.addEventListener('touchstart', jump, {passive: false});
    canvas.addEventListener('mousedown', jump);

    const loop = () => {
        if (runnerObj.isDead) return;
        runnerObj.vy += 0.7; runnerObj.py += runnerObj.vy;
        if (runnerObj.py > canvas.height - 80) { runnerObj.py = canvas.height - 80; runnerObj.vy = 0; }
        
        runnerObj.monsterX += runnerObj.monsterSpeed;
        if (runnerObj.monsterX > runnerObj.px - 20) {
            runnerObj.isDead = true;
            playSound('gameover');
            ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = '#ff5e62'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Вас съели 🙁', canvas.width/2, canvas.height/2);
            setTimeout(openRunnerMenu, 3000);
            return;
        }

        ctx.fillStyle = '#0a0510'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        
        ctx.fillStyle = '#00d4ff'; ctx.fillRect(runnerObj.px, runnerObj.py, runnerObj.size, runnerObj.size);
        ctx.fillStyle = '#fff'; ctx.fillRect(runnerObj.px + 6, runnerObj.py + 8, 6, 6); ctx.fillRect(runnerObj.px + 18, runnerObj.py + 8, 6, 6);
        ctx.fillStyle = '#000'; ctx.fillRect(runnerObj.px + 8, runnerObj.py + 10, 3, 3); ctx.fillRect(runnerObj.px + 20, runnerObj.py + 10, 3, 3);

        ctx.fillStyle = '#ff5e62'; ctx.fillRect(runnerObj.monsterX, runnerObj.py, runnerObj.size, runnerObj.size);
        ctx.fillStyle = '#fff'; ctx.fillRect(runnerObj.monsterX + 6, runnerObj.py + 8, 6, 6); ctx.fillRect(runnerObj.monsterX + 18, runnerObj.py + 8, 6, 6);
        ctx.fillStyle = '#000'; ctx.fillRect(runnerObj.monsterX + 8, runnerObj.py + 10, 3, 3); ctx.fillRect(runnerObj.monsterX + 20, runnerObj.py + 10, 3, 3);
        ctx.beginPath(); ctx.arc(runnerObj.monsterX + 15, runnerObj.py + 22, 8, 0, Math.PI); ctx.fill();

        gameAnimFrame = requestAnimationFrame(loop);
    };
    gameAnimFrame = requestAnimationFrame(loop);
}
