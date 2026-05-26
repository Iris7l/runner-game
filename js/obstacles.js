const Obstacles = {
    list: [],
    collectibles: [],
    powerups: [],
    spawnTimer: 0,
    coinTimer: 0,
    powerupTimer: 0,
    scrollX: 0,

    reset() {
        this.list = [];
        this.collectibles = [];
        this.powerups = [];
        this.spawnTimer = 0;
        this.coinTimer = 0;
        this.powerupTimer = 0;
        this.scrollX = 0;
    },

    getDifficulty(frameCount) {
        // Difficulty ramps up over time: 0 → 1.0 over ~3 minutes
        const t = Math.min(1, frameCount / 10000);
        return {
            level: t,
            spawnInterval: Math.max(500, 1800 - t * 1300),
            doubleSpawnChance: t * 0.3,
            fastObstacleChance: t * 0.2,
            mixedHeightChance: t * 0.4
        };
    },

    update(speed, dt, frameCount) {
        this.scrollX += speed;
        this.spawnTimer += dt;
        this.coinTimer += dt;
        this.powerupTimer += dt;

        const map = Maps.getCurrentMap();
        const diff = this.getDifficulty(frameCount);

        if (this.spawnTimer > diff.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnObstacle(map);
            // Higher difficulty: chance to spawn a second obstacle close behind
            if (Math.random() < diff.doubleSpawnChance) {
                setTimeout(() => this.spawnObstacle(map), 200);
            }
        }

        if (this.coinTimer > 400) {
            this.coinTimer = 0;
            this.spawnCoins(speed);
        }

        if (this.powerupTimer > 8000 + Math.random() * 5000) {
            this.powerupTimer = 0;
            this.spawnPowerup();
        }

        for (let i = this.list.length - 1; i >= 0; i--) {
            const ob = this.list[i];
            ob.x -= speed;
            if (ob.animate) ob.animate(ob, frameCount);
            if (ob.x + ob.w < -20) this.list.splice(i, 1);
        }

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            c.x -= speed;
            c.animTime = (c.animTime || 0) + dt;
            if (c.x < -20) this.collectibles.splice(i, 1);
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.x -= speed;
            p.animTime = (p.animTime || 0) + dt;
            if (p.x < -20) this.powerups.splice(i, 1);
        }
    },

    spawnObstacle(map) {
        const W = App.W;
        const groundY = Maps.GROUND_Y;
        const types = map.obstacles[0] === 'all'
            ? ['cone', 'barrier', 'cactus', 'icicle', 'gear', 'bird']
            : map.obstacles;
        const type = types[Math.floor(Math.random() * types.length)];
        let ob = { x: W + 30, type, color: '#444' };

        switch (type) {
            case 'cone': case 'hydrant': case 'cactus': case 'rock':
                ob.w = 24; ob.h = 36; ob.y = groundY - ob.h;
                ob.color = type === 'cactus' ? '#2d8a4e' : '#ff6633';
                break;
            case 'barrier': case 'bamboo_thin': case 'icicle': case 'stalactite':
                ob.w = 18; ob.h = 56; ob.y = groundY - ob.h;
                ob.color = type === 'icicle' ? '#aaddff' : '#ff9900';
                break;
            case 'car': case 'bamboo_thick': case 'pyramid_block': case 'ice_block':
            case 'lava_rock': case 'conveyor': case 'root':
                ob.w = 56; ob.h = 34; ob.y = groundY - ob.h;
                ob.color = type === 'car' ? '#3355aa' : '#886644';
                break;
            case 'bird': case 'fire_bat': case 'jellyfish': case 'ghost':
            case 'spider': case 'anglerfish': case 'bird_flock':
                ob.w = 30; ob.h = 24;
                ob.y = groundY - 80 - Math.random() * 60;
                ob.color = type === 'jellyfish' ? '#ff66cc' : '#cc3333';
                ob.animate = (o, f) => { o.floatY = Math.sin(f * 0.08) * 5; };
                ob.floatY = 0;
                break;
            case 'gear': case 'piston': case 'floating_rock':
                ob.w = 36; ob.h = 36;
                ob.y = groundY - 50 - Math.random() * 40;
                ob.color = '#666';
                ob.animate = (o, f) => { o.rotation = f * 0.05; };
                ob.rotation = 0;
                break;
            case 'fire_pillar': case 'laser':
                ob.w = 16; ob.h = 80; ob.y = groundY - ob.h;
                ob.color = type === 'laser' ? '#ff0000' : '#ff4400';
                ob.animate = (o, f) => { o.intensity = 0.5 + Math.sin(f * 0.1) * 0.5; };
                ob.intensity = 1;
                break;
            case 'quicksand': case 'current': case 'trap':
                ob.w = 60; ob.h = 12; ob.y = groundY - 6;
                ob.color = type === 'quicksand' ? '#c4993a' : '#0066aa';
                ob.isDanger = false;
                ob.isZone = true;
                break;
            default:
                ob.w = 28; ob.h = 40; ob.y = groundY - ob.h;
                ob.color = '#555';
                break;
        }
        this.list.push(ob);
    },

    spawnCoins(speed) {
        const W = App.W;
        const groundY = Maps.GROUND_Y;
        const pattern = Math.random();

        if (pattern < 0.4) {
            for (let i = 0; i < 5; i++) {
                this.collectibles.push({
                    x: W + 30 + i * 28,
                    y: groundY - 50,
                    type: 'coin', w: 16, h: 16, animTime: 0
                });
            }
        } else if (pattern < 0.7) {
            for (let i = 0; i < 5; i++) {
                const arcY = Math.sin(i / 4 * Math.PI) * 60;
                this.collectibles.push({
                    x: W + 30 + i * 28,
                    y: groundY - 40 - arcY,
                    type: 'coin', w: 16, h: 16, animTime: 0
                });
            }
        } else {
            for (let i = 0; i < 3; i++) {
                this.collectibles.push({
                    x: W + 30 + i * 24,
                    y: groundY - 90 - Math.random() * 30,
                    type: 'coin', w: 16, h: 16, animTime: 0
                });
            }
        }
    },

    spawnPowerup() {
        const W = App.W;
        const groundY = Maps.GROUND_Y;
        const types = ['magnet', 'shield', 'double', 'dash', 'chest'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerups.push({
            x: W + 30,
            y: groundY - 70 - Math.random() * 40,
            type, w: 28, h: 28, animTime: 0
        });
    },

    draw(ctx) {
        for (const ob of this.list) {
            ctx.save();
            const drawY = ob.y + (ob.floatY || 0);

            if (ob.rotation) {
                ctx.translate(ob.x + ob.w / 2, drawY + ob.h / 2);
                ctx.rotate(ob.rotation);
                ctx.translate(-(ob.x + ob.w / 2), -(drawY + ob.h / 2));
            }

            if (ob.isZone) {
                ctx.fillStyle = ob.color;
                ctx.globalAlpha = 0.5;
                ctx.fillRect(ob.x, drawY, ob.w, ob.h);
                ctx.globalAlpha = 1;
            } else {
                ctx.fillStyle = ob.color;
                ctx.beginPath();
                const r = 4;
                ctx.moveTo(ob.x + r, drawY);
                ctx.lineTo(ob.x + ob.w - r, drawY);
                ctx.quadraticCurveTo(ob.x + ob.w, drawY, ob.x + ob.w, drawY + r);
                ctx.lineTo(ob.x + ob.w, drawY + ob.h - r);
                ctx.quadraticCurveTo(ob.x + ob.w, drawY + ob.h, ob.x + ob.w - r, drawY + ob.h);
                ctx.lineTo(ob.x + r, drawY + ob.h);
                ctx.quadraticCurveTo(ob.x, drawY + ob.h, ob.x, drawY + ob.h - r);
                ctx.lineTo(ob.x, drawY + r);
                ctx.quadraticCurveTo(ob.x, drawY, ob.x + r, drawY);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(ob.x + 2, drawY + 2, ob.w - 4, 4);

                if (ob.intensity !== undefined) {
                    ctx.fillStyle = `rgba(255,100,0,${ob.intensity * 0.4})`;
                    ctx.fillRect(ob.x - 4, drawY, ob.w + 8, ob.h);
                }
            }
            ctx.restore();
        }

        for (const c of this.collectibles) {
            this.drawCoin(ctx, c);
        }

        for (const p of this.powerups) {
            this.drawPowerup(ctx, p);
        }
    },

    drawCoin(ctx, c) {
        const bob = Math.sin(c.animTime * 0.005) * 3;
        const scaleX = Math.abs(Math.cos(c.animTime * 0.004));
        ctx.save();
        ctx.translate(c.x + c.w / 2, c.y + c.h / 2 + bob);
        ctx.scale(scaleX, 1);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', 0, 3);
        ctx.restore();
    },

    drawPowerup(ctx, p) {
        const bob = Math.sin(p.animTime * 0.004) * 4;
        const glow = 0.3 + Math.sin(p.animTime * 0.006) * 0.2;
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2 + bob);

        ctx.fillStyle = `rgba(255,255,255,${glow})`;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        let color, icon;
        switch (p.type) {
            case 'magnet': color = '#ff4466'; icon = 'M'; break;
            case 'shield': color = '#44aaff'; icon = 'S'; break;
            case 'double': color = '#ffaa00'; icon = '2x'; break;
            case 'dash': color = '#44ff88'; icon = 'D'; break;
            case 'chest': color = '#aa66ff'; icon = '?'; break;
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(icon, 0, 4);
        ctx.restore();
    },

    checkCollisions(player) {
        const shrink = 6;
        const px = player.x + shrink;
        const py = player.y + shrink;
        const pw = player.w - shrink * 2;
        const ph = player.h - shrink * 2;

        for (const ob of this.list) {
            if (ob.isZone) continue;
            const oy = ob.y + (ob.floatY || 0);
            if (px < ob.x + ob.w && px + pw > ob.x && py < oy + ob.h && py + ph > oy) {
                return 'hit';
            }
        }

        const magnetRange = Player.magnetActive ? 120 : 0;
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            if (magnetRange > 0) {
                const dx = (player.x + player.w / 2) - (c.x + c.w / 2);
                const dy = (player.y + player.h / 2) - (c.y + c.h / 2);
                if (Math.sqrt(dx * dx + dy * dy) < magnetRange) {
                    c.x += dx * 0.15;
                    c.y += dy * 0.15;
                }
            }
            if (px < c.x + c.w && px + pw > c.x && py < c.y + c.h && py + ph > c.y) {
                this.collectibles.splice(i, 1);
                return { type: 'coin' };
            }
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            if (px < p.x + p.w && px + pw > p.x && py < p.y + p.h && py + ph > p.y) {
                this.powerups.splice(i, 1);
                return { type: 'powerup', powerType: p.type };
            }
        }

        return null;
    }
};
