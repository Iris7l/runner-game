const Player = {
    x: 80,
    y: 0,
    w: 44,
    h: 64,
    baseH: 64,
    slideH: 36,
    vy: 0,
    vx: 0,
    jumpCount: 0,
    state: 'run',
    sliding: false,
    moveLeft: false,
    moveRight: false,
    stateTime: 0,
    animFrame: 0,
    animTimer: 0,
    trail: [],
    shieldActive: false,
    magnetActive: false,
    doubleActive: false,
    dashActive: false,
    dashTimer: 0,
    hurtTimer: 0,
    invincible: false,

    reset() {
        this.x = 80;
        this.y = Maps.GROUND_Y - this.h;
        this.vy = 0;
        this.vx = 0;
        this.jumpCount = 0;
        this.state = 'run';
        this.sliding = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.stateTime = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.trail = [];
        this.shieldActive = false;
        this.magnetActive = false;
        this.doubleActive = false;
        this.dashActive = false;
        this.dashTimer = 0;
        this.hurtTimer = 0;
        this.invincible = false;
        this.h = this.baseH;
    },

    getMaxJumps() {
        return 2;
    },

    getJumpForce() {
        let force = -13.5;
        const equip = App.saveData.equipment.cape;
        if (equip) {
            const item = Shop.getEquipmentData(equip);
            if (item && item.statType === 'jump') force *= (1 + item.statValue);
        }
        const char = Shop.getCharacterData(App.saveData.selectedCharacter);
        if (char && char.passiveType === 'jump') force *= (1 + char.passiveValue);
        return force;
    },

    jump() {
        if (this.dashActive) return;
        if (this.jumpCount < this.getMaxJumps()) {
            this.vy = this.getJumpForce();
            this.jumpCount++;
            this.state = this.jumpCount === 1 ? 'jump' : 'doubleJump';
            this.stateTime = 0;
            Game.spawnJumpParticles();
        }
    },

    startSlide() {
        if (this.sliding || this.state === 'jump' || this.state === 'doubleJump') return;
        this.sliding = true;
        this.h = this.slideH;
        this.y = Maps.GROUND_Y - this.h;
        this.state = 'slide';
        this.stateTime = 0;
    },

    stopSlide() {
        if (!this.sliding) return;
        this.sliding = false;
        this.h = this.baseH;
        this.y = Maps.GROUND_Y - this.h;
        if (this.state === 'slide') {
            this.state = 'run';
            this.stateTime = 0;
        }
    },

    update(dt) {
        this.stateTime += dt;
        this.animTimer += dt;

        if (this.dashActive) {
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) {
                this.dashActive = false;
                this.invincible = false;
            }
            this.trail.push({ x: this.x + this.w / 2, y: this.y + this.h / 2, life: 12 });
            return;
        }

        // Horizontal movement
        if (this.moveLeft) this.vx = -4.5;
        else if (this.moveRight) this.vx = 4.5;
        else this.vx *= 0.8;

        this.x += this.vx;
        if (this.x < 16) this.x = 16;
        if (this.x > App.W - this.w - 16) this.x = App.W - this.w - 16;

        // Vertical physics
        this.vy += 0.6;
        this.y += this.vy;

        const groundY = Maps.GROUND_Y - this.h;
        if (this.y >= groundY) {
            this.y = groundY;
            this.vy = 0;
            if (this.state === 'jump' || this.state === 'doubleJump') {
                this.state = this.sliding ? 'slide' : 'run';
                this.stateTime = 0;
            }
            this.jumpCount = 0;
        }

        if (this.animTimer > 80) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 6;
        }

        this.trail.push({ x: this.x + this.w / 2, y: this.y + this.h / 2, life: 10 });
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life--;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }

        if (this.hurtTimer > 0) this.hurtTimer -= dt;
    },

    draw(ctx) {
        const charData = Shop.getCharacterData(App.saveData.selectedCharacter);
        const colors = charData ? charData.colors : {
            skin: '#FFD5B8', hair: '#4A3728', shirt: '#E94560',
            pants: '#2B4570', shoes: '#1A1A2E', eyes: '#2B2B2B'
        };

        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (t.life / 12) * 0.3;
            ctx.fillStyle = `rgba(233,69,96,${alpha})`;
            const s = 3 + (t.life / 12) * 5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, s / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

        if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const runCycle = this.getRunCycle();
        const bodyTilt = this.state === 'dash' ? -0.2 : (this.state === 'jump' ? -0.05 : 0.02);
        ctx.rotate(bodyTilt);

        this.drawCharacter(ctx, colors, runCycle);
        this.drawEquipment(ctx, colors, runCycle);

        if (this.shieldActive) {
            ctx.strokeStyle = 'rgba(100,200,255,0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(100,200,255,0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, 34, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    },

    getRunCycle() {
        if (this.state === 'slide') {
            return { leftArm: -1.2, rightArm: -0.8, leftLeg: 1.2, rightLeg: 0.4, bodyY: 4, bodyTilt: 0.3 };
        }
        if (this.state === 'jump' || this.state === 'doubleJump') {
            return { leftArm: -0.8, rightArm: 0.5, leftLeg: -0.3, rightLeg: 0.5, bodyY: -2, bodyTilt: 0 };
        }
        if (this.state === 'dash') {
            return { leftArm: -1.5, rightArm: -1.2, leftLeg: 0.8, rightLeg: -0.2, bodyY: 0, bodyTilt: 0 };
        }
        const t = this.animFrame / 6 * Math.PI * 2;
        return {
            leftArm: Math.sin(t) * 0.7,
            rightArm: Math.sin(t + Math.PI) * 0.7,
            leftLeg: Math.sin(t + Math.PI) * 0.6,
            rightLeg: Math.sin(t) * 0.6,
            bodyY: Math.abs(Math.sin(t * 2)) * -2,
            bodyTilt: 0
        };
    },

    drawCharacter(ctx, colors, cycle, overrideHairStyle) {
        const bodyY = cycle.bodyY || 0;

        // Legs
        ctx.save();
        ctx.translate(-6, 18 + bodyY);
        ctx.rotate(cycle.leftLeg);
        ctx.fillStyle = colors.pants;
        Player.roundRect(ctx, -4, 0, 8, 18, 3);
        ctx.fillStyle = colors.shoes;
        Player.roundRect(ctx, -5, 16, 10, 6, 2);
        ctx.restore();

        ctx.save();
        ctx.translate(6, 18 + bodyY);
        ctx.rotate(cycle.rightLeg);
        ctx.fillStyle = colors.pants;
        Player.roundRect(ctx, -4, 0, 8, 18, 3);
        ctx.fillStyle = colors.shoes;
        Player.roundRect(ctx, -5, 16, 10, 6, 2);
        ctx.restore();

        // Body/torso
        ctx.fillStyle = colors.shirt;
        Player.roundRect(ctx, -12, -8 + bodyY, 24, 28, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        Player.roundRect(ctx, -4, -4 + bodyY, 8, 20, 3);

        // Arms
        ctx.save();
        ctx.translate(-13, -2 + bodyY);
        ctx.rotate(cycle.leftArm);
        ctx.fillStyle = colors.skin;
        Player.roundRect(ctx, -4, 0, 7, 16, 3);
        ctx.restore();

        ctx.save();
        ctx.translate(13, -2 + bodyY);
        ctx.rotate(cycle.rightArm);
        ctx.fillStyle = colors.skin;
        Player.roundRect(ctx, -3, 0, 7, 16, 3);
        ctx.restore();

        // Head
        const headY = -24 + bodyY;
        ctx.fillStyle = colors.skin;
        ctx.beginPath();
        ctx.ellipse(0, headY, 13, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair - different styles per character
        ctx.fillStyle = colors.hair;
        let hairStyle = overrideHairStyle || 'short';
        if (!overrideHairStyle) {
            const charInfo = Shop.getCharacterData(App.saveData.selectedCharacter);
            hairStyle = (charInfo && charInfo.hairStyle) ? charInfo.hairStyle : 'short';
        }
        switch (hairStyle) {
            case 'short':
                ctx.beginPath();
                ctx.ellipse(0, headY - 6, 14, 10, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(6, headY - 4, 6, 7, -0.2, Math.PI, Math.PI * 2);
                ctx.fill();
                break;
            case 'long':
                ctx.beginPath();
                ctx.ellipse(0, headY - 6, 14, 10, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(-13, headY - 4, 6, 22);
                ctx.fillRect(8, headY - 4, 6, 22);
                ctx.beginPath();
                ctx.ellipse(-10, headY + 16, 4, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(11, headY + 16, 4, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'ponytail':
                ctx.beginPath();
                ctx.ellipse(0, headY - 6, 14, 10, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(4, headY - 10);
                ctx.quadraticCurveTo(16, headY - 14, 14, headY + 8);
                ctx.quadraticCurveTo(12, headY + 14, 8, headY + 10);
                ctx.quadraticCurveTo(10, headY - 4, 4, headY - 10);
                ctx.fill();
                ctx.fillStyle = colors.shirt;
                ctx.beginPath();
                ctx.arc(6, headY - 10, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = colors.hair;
                break;
            case 'twintail':
                ctx.beginPath();
                ctx.ellipse(0, headY - 6, 14, 10, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-8, headY - 6);
                ctx.quadraticCurveTo(-18, headY, -16, headY + 16);
                ctx.quadraticCurveTo(-14, headY + 20, -10, headY + 14);
                ctx.quadraticCurveTo(-10, headY + 4, -8, headY - 6);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(8, headY - 6);
                ctx.quadraticCurveTo(18, headY, 16, headY + 16);
                ctx.quadraticCurveTo(14, headY + 20, 10, headY + 14);
                ctx.quadraticCurveTo(10, headY + 4, 8, headY - 6);
                ctx.fill();
                break;
            case 'bandana':
                ctx.beginPath();
                ctx.ellipse(0, headY - 8, 14, 6, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#cc0000';
                ctx.fillRect(-14, headY - 6, 28, 5);
                ctx.beginPath();
                ctx.moveTo(10, headY - 4);
                ctx.lineTo(18, headY);
                ctx.lineTo(16, headY + 4);
                ctx.lineTo(10, headY);
                ctx.fill();
                ctx.fillStyle = colors.hair;
                break;
            case 'spiky':
                ctx.beginPath();
                ctx.moveTo(-12, headY - 4);
                ctx.lineTo(-8, headY - 20);
                ctx.lineTo(-4, headY - 8);
                ctx.lineTo(0, headY - 24);
                ctx.lineTo(4, headY - 8);
                ctx.lineTo(8, headY - 18);
                ctx.lineTo(12, headY - 4);
                ctx.closePath();
                ctx.fill();
                break;
            default:
                ctx.beginPath();
                ctx.ellipse(0, headY - 6, 14, 10, 0, Math.PI, Math.PI * 2);
                ctx.fill();
        }

        // Eyes
        const blinkTimer = Math.floor(Date.now() / 100) % 40;
        const isBlinking = blinkTimer === 0;
        const eyeH = isBlinking ? 2 : 6;
        ctx.fillStyle = '#fff';
        Player.roundRect(ctx, -8, headY - 3, 7, eyeH, 2);
        Player.roundRect(ctx, 1, headY - 3, 7, eyeH, 2);
        if (!isBlinking) {
            ctx.fillStyle = colors.eyes;
            ctx.beginPath();
            ctx.arc(-5, headY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(4, headY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-4, headY - 1, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(5, headY - 1, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mouth
        ctx.strokeStyle = colors.eyes;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (this.state === 'jump' || this.state === 'doubleJump') {
            ctx.arc(0, headY + 7, 3, 0, Math.PI);
        } else if (this.state === 'hurt') {
            ctx.arc(0, headY + 9, 3, Math.PI, 0);
        } else {
            ctx.moveTo(-3, headY + 7);
            ctx.quadraticCurveTo(0, headY + 10, 3, headY + 7);
        }
        ctx.stroke();

        // Blush
        ctx.fillStyle = 'rgba(255,150,150,0.3)';
        ctx.beginPath();
        ctx.ellipse(-9, headY + 3, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(9, headY + 3, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    drawEquipment(ctx, colors, cycle) {
        const equip = App.saveData.equipment;
        const bodyY = cycle.bodyY || 0;
        const headY = -24 + bodyY;

        if (equip.head) {
            const item = Shop.getEquipmentData(equip.head);
            if (item) Player.drawHeadEquip(ctx, item, headY);
        }
        if (equip.cape) {
            const item = Shop.getEquipmentData(equip.cape);
            if (item) Player.drawCapeEquip(ctx, item, bodyY, cycle);
        }
        if (equip.shoes) {
            const item = Shop.getEquipmentData(equip.shoes);
            if (item) Player.drawShoesEquip(ctx, item, bodyY, cycle);
        }
        if (equip.amulet) {
            const item = Shop.getEquipmentData(equip.amulet);
            if (item) Player.drawAmuletEquip(ctx, item, bodyY);
        }
    },

    drawShoesEquip(ctx, item, bodyY, cycle) {
        ctx.fillStyle = item.color || '#44cc44';
        const leftLegEnd = 18 + Math.abs(cycle.leftLeg) * 4;
        const rightLegEnd = 18 + Math.abs(cycle.rightLeg) * 4;
        switch (item.visual) {
            case 'sneaker':
                ctx.save();
                ctx.translate(-6, 18 + bodyY);
                ctx.rotate(cycle.leftLeg);
                ctx.fillRect(-6, leftLegEnd - 2, 12, 6);
                ctx.restore();
                ctx.save();
                ctx.translate(6, 18 + bodyY);
                ctx.rotate(cycle.rightLeg);
                ctx.fillRect(-6, rightLegEnd - 2, 12, 6);
                ctx.restore();
                break;
            case 'spring':
                ctx.save();
                ctx.translate(-6, 18 + bodyY);
                ctx.rotate(cycle.leftLeg);
                ctx.strokeStyle = item.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    ctx.moveTo(-3, leftLegEnd + i * 3);
                    ctx.lineTo(3, leftLegEnd + i * 3 + 1.5);
                }
                ctx.stroke();
                ctx.restore();
                ctx.save();
                ctx.translate(6, 18 + bodyY);
                ctx.rotate(cycle.rightLeg);
                ctx.strokeStyle = item.color;
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    ctx.moveTo(-3, rightLegEnd + i * 3);
                    ctx.lineTo(3, rightLegEnd + i * 3 + 1.5);
                }
                ctx.stroke();
                ctx.restore();
                break;
            case 'jet':
                ctx.save();
                ctx.translate(-6, 18 + bodyY);
                ctx.rotate(cycle.leftLeg);
                ctx.fillRect(-5, leftLegEnd - 2, 10, 7);
                ctx.fillStyle = '#ff8800';
                ctx.globalAlpha = 0.6 + Math.random() * 0.4;
                ctx.fillRect(-3, leftLegEnd + 5, 6, 4 + Math.random() * 3);
                ctx.globalAlpha = 1;
                ctx.restore();
                ctx.save();
                ctx.translate(6, 18 + bodyY);
                ctx.rotate(cycle.rightLeg);
                ctx.fillStyle = item.color;
                ctx.fillRect(-5, rightLegEnd - 2, 10, 7);
                ctx.fillStyle = '#ff8800';
                ctx.globalAlpha = 0.6 + Math.random() * 0.4;
                ctx.fillRect(-3, rightLegEnd + 5, 6, 4 + Math.random() * 3);
                ctx.globalAlpha = 1;
                ctx.restore();
                break;
        }
    },

    drawAmuletEquip(ctx, item, bodyY) {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(0, 2 + bodyY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 2 + bodyY, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 1 + bodyY, 2, 0, Math.PI * 2);
        ctx.fill();
    },

    drawHeadEquip(ctx, item, headY) {
        ctx.fillStyle = item.color || '#e94560';
        switch (item.visual) {
            case 'cap':
                ctx.beginPath();
                ctx.ellipse(0, headY - 12, 14, 6, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(6, headY - 14, 12, 4);
                break;
            case 'bunny':
                Player.roundRect(ctx, -6, headY - 30, 5, 18, 2);
                Player.roundRect(ctx, 2, headY - 28, 5, 16, 2);
                break;
            case 'crown':
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(-10, headY - 12);
                ctx.lineTo(-8, headY - 22);
                ctx.lineTo(-3, headY - 16);
                ctx.lineTo(0, headY - 24);
                ctx.lineTo(3, headY - 16);
                ctx.lineTo(8, headY - 22);
                ctx.lineTo(10, headY - 12);
                ctx.closePath();
                ctx.fill();
                break;
            case 'horns':
                ctx.fillStyle = '#8B0000';
                ctx.beginPath();
                ctx.moveTo(-8, headY - 10);
                ctx.quadraticCurveTo(-14, headY - 28, -6, headY - 24);
                ctx.quadraticCurveTo(-4, headY - 18, -8, headY - 10);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(8, headY - 10);
                ctx.quadraticCurveTo(14, headY - 28, 6, headY - 24);
                ctx.quadraticCurveTo(4, headY - 18, 8, headY - 10);
                ctx.fill();
                break;
        }
    },

    drawCapeEquip(ctx, item, bodyY, cycle) {
        ctx.fillStyle = item.color || '#e94560';
        const capeWave = Math.sin(this.animFrame * 0.8) * 3;
        switch (item.visual) {
            case 'cape':
                ctx.beginPath();
                ctx.moveTo(-8, -6 + bodyY);
                ctx.quadraticCurveTo(-20 + capeWave, 10 + bodyY, -16 + capeWave, 28 + bodyY);
                ctx.lineTo(-4, 20 + bodyY);
                ctx.closePath();
                ctx.fill();
                break;
            case 'wings':
                ctx.globalAlpha = 0.7;
                const wingFlap = Math.sin(this.stateTime * 0.005) * 8;
                ctx.beginPath();
                ctx.moveTo(-12, -4 + bodyY);
                ctx.quadraticCurveTo(-30, -20 + wingFlap + bodyY, -24, 4 + bodyY);
                ctx.quadraticCurveTo(-18, 10 + bodyY, -12, 4 + bodyY);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(12, -4 + bodyY);
                ctx.quadraticCurveTo(30, -20 + wingFlap + bodyY, 24, 4 + bodyY);
                ctx.quadraticCurveTo(18, 10 + bodyY, 12, 4 + bodyY);
                ctx.fill();
                ctx.globalAlpha = 1;
                break;
            case 'flame':
                const flicker = Math.random() * 3;
                ctx.fillStyle = '#FF6B35';
                ctx.beginPath();
                ctx.moveTo(-4, 18 + bodyY);
                ctx.quadraticCurveTo(-8 + capeWave, 30 + flicker + bodyY, 0, 36 + bodyY);
                ctx.quadraticCurveTo(8 - capeWave, 30 + flicker + bodyY, 4, 18 + bodyY);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(-2, 20 + bodyY);
                ctx.quadraticCurveTo(-4, 28 + bodyY, 0, 30 + bodyY);
                ctx.quadraticCurveTo(4, 28 + bodyY, 2, 20 + bodyY);
                ctx.fill();
                break;
        }
    },

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }
};
