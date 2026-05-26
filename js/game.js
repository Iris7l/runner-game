const Game = {
    score: 0,
    distance: 0,
    coinsCollected: 0,
    speed: 5,
    frameCount: 0,
    particles: [],
    paused: false,
    powerupTimers: { magnet: 0, shield: 0, double: 0, dash: 0 },
    INITIAL_SPEED: 5,
    MAX_SPEED: 13,

    // Virtual buttons
    buttons: {
        left:  { x: 36, y: 620, r: 30, pressed: false, label: '←' },
        down:  { x: 120, y: 635, r: 26, pressed: false, label: '↓' },
        right: { x: 200, y: 620, r: 30, pressed: false, label: '→' },
        jump:  { x: 360, y: 610, r: 40, pressed: false, label: '跳' }
    },
    activeTouches: {},

    start() {
        this.score = 0;
        this.distance = 0;
        this.coinsCollected = 0;
        this.speed = this.INITIAL_SPEED + this.getSpeedBonus();
        this.frameCount = 0;
        this.particles = [];
        this.paused = false;
        this.powerupTimers = { magnet: 0, shield: 0, double: 0, dash: 0 };
        Player.reset();
        Obstacles.reset();
    },

    getSpeedBonus() {
        let bonus = 0;
        const skills = App.saveData.skills;
        if (skills.speed_boost) bonus += skills.speed_boost * 0.3;
        const shoes = App.saveData.equipment.shoes;
        if (shoes) {
            const item = Shop.getEquipmentData(shoes);
            if (item && item.statType === 'speed') bonus += item.statValue;
        }
        return bonus;
    },

    handleInput(x, y) {
        if (this.paused) {
            if (y > App.H / 2 + 30) {
                this.paused = false;
                App.switchScene('menu');
            } else {
                this.paused = false;
            }
            return;
        }
        if (x > App.W - 100 && y < 80) {
            this.paused = true;
            return;
        }
        if (y < 560) {
            Player.jump();
        }
    },

    getButtonAt(x, y) {
        for (const [name, btn] of Object.entries(this.buttons)) {
            const dx = x - btn.x;
            const dy = y - btn.y;
            if (dx * dx + dy * dy < (btn.r + 10) * (btn.r + 10)) return name;
        }
        return null;
    },

    handleTouchStart(id, x, y) {
        if (this.paused) {
            if (y > App.H / 2 + 30) { this.paused = false; App.switchScene('menu'); }
            else { this.paused = false; }
            return;
        }
        if (x > App.W - 100 && y < 80) { this.paused = true; return; }

        const btn = this.getButtonAt(x, y);
        if (btn) {
            this.activeTouches[id] = btn;
            this.buttons[btn].pressed = true;
            this.applyButton(btn, true);
        } else if (y < 560) {
            Player.jump();
        }
    },

    handleTouchMove(id, x, y) {
        const prevBtn = this.activeTouches[id];
        const newBtn = this.getButtonAt(x, y);
        if (prevBtn !== newBtn) {
            if (prevBtn) {
                this.buttons[prevBtn].pressed = false;
                this.applyButton(prevBtn, false);
            }
            if (newBtn) {
                this.activeTouches[id] = newBtn;
                this.buttons[newBtn].pressed = true;
                this.applyButton(newBtn, true);
            } else {
                delete this.activeTouches[id];
            }
        }
    },

    handleTouchEnd(id) {
        const btn = this.activeTouches[id];
        if (btn) {
            this.buttons[btn].pressed = false;
            this.applyButton(btn, false);
            delete this.activeTouches[id];
        }
    },

    applyButton(name, pressed) {
        if (name === 'left') Player.moveLeft = pressed;
        else if (name === 'right') Player.moveRight = pressed;
        else if (name === 'down') {
            if (pressed) Player.startSlide();
            else Player.stopSlide();
        }
        else if (name === 'jump' && pressed) Player.jump();
    },

    update() {
        if (this.paused) return;
        const dt = Math.min(App.deltaTime || 16, 32);
        this.frameCount++;

        // Difficulty curve: gentle start, accelerates over time
        const t = this.frameCount;
        let speedGrowth;
        if (t < 1800) speedGrowth = t * 0.0005;       // first ~30s: slow ramp
        else if (t < 5400) speedGrowth = 0.9 + (t - 1800) * 0.001;  // 30s-90s: medium
        else speedGrowth = 4.5 + (t - 5400) * 0.0015;  // 90s+: aggressive
        this.speed = Math.min(this.MAX_SPEED, this.INITIAL_SPEED + this.getSpeedBonus() + speedGrowth);
        this.distance += this.speed * 0.5;
        this.score = Math.floor(this.distance);

        for (const key in this.powerupTimers) {
            if (this.powerupTimers[key] > 0) {
                this.powerupTimers[key] -= dt;
                if (this.powerupTimers[key] <= 0) {
                    this.powerupTimers[key] = 0;
                    if (key === 'magnet') Player.magnetActive = false;
                    if (key === 'shield') Player.shieldActive = false;
                    if (key === 'double') Player.doubleActive = false;
                    if (key === 'dash') { Player.dashActive = false; Player.invincible = false; }
                }
            }
        }

        Player.update(dt);
        Obstacles.update(this.speed, dt, this.frameCount);

        const collision = Obstacles.checkCollisions(Player);
        if (collision === 'hit') {
            if (Player.dashActive || Player.invincible) {
                // pass through
            } else if (Player.shieldActive) {
                Player.shieldActive = false;
                this.powerupTimers.shield = 0;
                Player.hurtTimer = 500;
                this.spawnHitParticles();
            } else if (this.hasRevive()) {
                this.useRevive();
            } else {
                this.endGame();
                return;
            }
        } else if (collision && collision.type === 'coin') {
            const multiplier = Player.doubleActive ? 2 : 1;
            const coinBonus = this.getCoinMultiplier();
            this.coinsCollected += 1 * multiplier * coinBonus;
            this.spawnCoinParticles();
        } else if (collision && collision.type === 'powerup') {
            this.activatePowerup(collision.powerType);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        Missions.trackDistance(this.speed * 0.5);
    },

    getCoinMultiplier() {
        let mult = 1;
        const skills = App.saveData.skills;
        if (skills.coin_mult) mult += skills.coin_mult * 0.15;
        const char = Shop.getCharacterData(App.saveData.selectedCharacter);
        if (char && char.passiveType === 'coins') mult += char.passiveValue;
        return mult;
    },

    hasRevive() {
        const skills = App.saveData.skills;
        return skills.revive && skills.revive > 0 && !this._reviveUsed;
    },

    useRevive() {
        this._reviveUsed = true;
        Player.y = Maps.GROUND_Y - Player.h - 50;
        Player.vy = -5;
        Player.hurtTimer = 2000;
        Player.invincible = true;
        setTimeout(() => { Player.invincible = false; }, 2000);
        this.spawnReviveParticles();
    },

    activatePowerup(type) {
        const skills = App.saveData.skills;
        if (type === 'magnet') {
            Player.magnetActive = true;
            this.powerupTimers.magnet = 5000 + (skills.magnet || 0) * 1000;
        } else if (type === 'shield') {
            Player.shieldActive = true;
            const shieldBonus = (skills.shield_ext || 0) * 2000;
            const charData = Shop.getCharacterData(App.saveData.selectedCharacter);
            const extra = (charData && charData.passiveType === 'shield') ? charData.passiveValue * 1000 : 0;
            this.powerupTimers.shield = 8000 + shieldBonus + extra;
        } else if (type === 'double') {
            Player.doubleActive = true;
            this.powerupTimers.double = 8000;
        } else if (type === 'dash') {
            Player.dashActive = true;
            Player.invincible = true;
            const dashChar = Shop.getCharacterData(App.saveData.selectedCharacter);
            const dashExtra = (dashChar && dashChar.passiveType === 'dash') ? dashChar.passiveValue : 0;
            this.powerupTimers.dash = 3000 * (1 + dashExtra + (skills.dash || 0) * 0.3);
            Player.dashTimer = this.powerupTimers.dash;
        } else if (type === 'chest') {
            const rand = Math.random();
            if (rand < 0.5) this.coinsCollected += 20;
            else if (rand < 0.8) this.coinsCollected += 50;
            else App.saveData.diamonds += 1;
            this.spawnChestParticles();
        }
        Missions.trackPowerup(type);
    },

    endGame() {
        Player.state = 'hurt';
        this.spawnDeathParticles();
        this._reviveUsed = false;

        const expGained = Math.floor(this.distance * 0.5 + this.coinsCollected * 2);
        const coinTotal = Math.floor(this.coinsCollected);

        App.saveData.coins += coinTotal;
        App.saveData.totalDistance += Math.floor(this.distance);
        App.saveData.totalCoins += coinTotal;
        App.saveData.totalGames += 1;
        if (this.score > App.saveData.bestScore) App.saveData.bestScore = this.score;
        if (this.distance > App.saveData.bestDistance) App.saveData.bestDistance = Math.floor(this.distance);

        const mapId = App.saveData.selectedMap;
        if (!App.saveData.mapBestScores[mapId] || this.score > App.saveData.mapBestScores[mapId]) {
            App.saveData.mapBestScores[mapId] = this.score;
        }

        Progression.addExp(expGained);
        Missions.trackGameEnd(this.score, this.coinsCollected, this.distance);
        SaveManager.save(App.saveData);

        Game.lastResult = { score: this.score, distance: Math.floor(this.distance), coins: coinTotal, exp: expGained };

        Leaderboard.submitScore(
            App.saveData.playerName,
            this.score,
            Math.floor(this.distance),
            App.saveData.selectedCharacter,
            App.saveData.level
        );

        App.switchScene('gameover');
    },

    draw(ctx) {
        Maps.drawBackground(ctx, Obstacles.scrollX);
        Obstacles.draw(ctx);
        Player.draw(ctx);

        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = p.color.replace('1)', `${alpha})`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawHUD(ctx);

        if (this.paused) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, App.W, App.H);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('暂停', App.W / 2, App.H / 2 - 30);
            ctx.font = '18px Arial';
            ctx.fillText('点击继续', App.W / 2, App.H / 2 + 10);
            ctx.fillText('返回菜单', App.W / 2, App.H / 2 + 50);
        }
    },

    drawHUD(ctx) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.score}m`, 16, 34);

        ctx.fillStyle = '#FFD700';
        ctx.font = '16px Arial';
        ctx.fillText(`${Math.floor(this.coinsCollected)}`, 16, 56);

        // Pause button (large touch target)
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(App.W - 44, 36, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(App.W - 54, 22, 8, 26);
        ctx.fillRect(App.W - 40, 22, 8, 26);

        // Power-up indicators
        let py = 80;
        const indicators = [
            { key: 'magnet', color: '#ff4466', label: 'M' },
            { key: 'shield', color: '#44aaff', label: 'S' },
            { key: 'double', color: '#ffaa00', label: '2x' },
            { key: 'dash', color: '#44ff88', label: 'D' }
        ];
        for (const ind of indicators) {
            if (this.powerupTimers[ind.key] > 0) {
                ctx.fillStyle = ind.color;
                ctx.beginPath();
                ctx.arc(28, py, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(ind.label, 28, py + 4);
                ctx.font = '9px Arial';
                ctx.fillText(Math.ceil(this.powerupTimers[ind.key] / 1000) + 's', 28, py + 16);
                ctx.textAlign = 'left';
                py += 34;
            }
        }

        // Speed bar
        const speedRatio = (this.speed - this.INITIAL_SPEED) / (this.MAX_SPEED - this.INITIAL_SPEED);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(App.W - 110, 14, 60, 6);
        ctx.fillStyle = `rgba(233,69,96,0.8)`;
        ctx.fillRect(App.W - 110, 14, 60 * speedRatio, 6);

        // Virtual buttons
        for (const [name, btn] of Object.entries(this.buttons)) {
            ctx.beginPath();
            ctx.arc(btn.x, btn.y, btn.r, 0, Math.PI * 2);
            ctx.fillStyle = btn.pressed ? 'rgba(233,69,96,0.5)' : 'rgba(255,255,255,0.15)';
            ctx.fill();
            ctx.strokeStyle = btn.pressed ? 'rgba(233,69,96,0.8)' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = btn.pressed ? '#fff' : 'rgba(255,255,255,0.6)';
            ctx.font = name === 'jump' ? 'bold 18px Arial' : 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(btn.label, btn.x, btn.y + 7);
        }
    },

    spawnJumpParticles() {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: Player.x + Player.w / 2, y: Player.y + Player.h,
                vx: (Math.random() - 0.5) * 4, vy: Math.random() * 2 + 1,
                life: 400, maxLife: 400, size: 2 + Math.random() * 3,
                color: 'rgba(233,69,96,1)'
            });
        }
    },

    spawnCoinParticles() {
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: Player.x + Player.w / 2, y: Player.y + Player.h / 2,
                vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3 - 1,
                life: 300, maxLife: 300, size: 2 + Math.random() * 2,
                color: 'rgba(255,215,0,1)'
            });
        }
    },

    spawnHitParticles() {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: Player.x + Player.w / 2, y: Player.y + Player.h / 2,
                vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                life: 400, maxLife: 400, size: 3 + Math.random() * 3,
                color: 'rgba(100,200,255,1)'
            });
        }
    },

    spawnDeathParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Player.x + Player.w / 2, y: Player.y + Player.h / 2,
                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                life: 600, maxLife: 600, size: 3 + Math.random() * 4,
                color: 'rgba(233,69,96,1)'
            });
        }
    },

    spawnReviveParticles() {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.particles.push({
                x: Player.x + Player.w / 2, y: Player.y + Player.h / 2,
                vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4,
                life: 500, maxLife: 500, size: 3,
                color: 'rgba(100,255,100,1)'
            });
        }
    },

    spawnChestParticles() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: Player.x + Player.w / 2, y: Player.y + Player.h / 2,
                vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5,
                life: 500, maxLife: 500, size: 2 + Math.random() * 3,
                color: 'rgba(170,100,255,1)'
            });
        }
    },

    lastResult: null
};
