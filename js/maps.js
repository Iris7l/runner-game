const Maps = {
    GROUND_Y: 600,

    data: {
        city: {
            name: '城市街道', unlockLevel: 0, unlockType: 'level',
            skyColors: ['#1a1a3e', '#2d2d5e'],
            groundColor: '#2c2c3e', groundLine: '#4a4a6e',
            buildingColors: ['#1e1e3a', '#252545', '#2a2a50'],
            particleColor: 'rgba(255,255,200,0.3)',
            obstacles: ['cone', 'barrier', 'car', 'hydrant'],
            mechanic: null,
            bgLayers: [
                { type: 'buildings', speed: 0.2 },
                { type: 'trees', speed: 0.5 },
                { type: 'lamps', speed: 0.8 }
            ]
        },
        bamboo: {
            name: '竹林小径', unlockLevel: 3, unlockType: 'level',
            skyColors: ['#1a3a2a', '#2d5e3d'],
            groundColor: '#3a2e1a', groundLine: '#5a4e3a',
            buildingColors: ['#2a4a2a', '#1e3a1e', '#3a5a3a'],
            particleColor: 'rgba(150,200,100,0.4)',
            obstacles: ['bamboo_thin', 'bamboo_thick', 'rock', 'bird'],
            mechanic: 'leaves',
            bgLayers: [
                { type: 'mountains', speed: 0.15 },
                { type: 'bamboo_bg', speed: 0.4 },
                { type: 'bamboo_fg', speed: 0.7 }
            ]
        },
        desert: {
            name: '沙漠遗迹', unlockLevel: 5, unlockType: 'level',
            skyColors: ['#4a3000', '#8a6020'],
            groundColor: '#c49a3a', groundLine: '#8a6a2a',
            buildingColors: ['#8a6a2a', '#6a5020', '#a08040'],
            particleColor: 'rgba(200,180,100,0.3)',
            obstacles: ['cactus', 'pyramid_block', 'scorpion', 'quicksand'],
            mechanic: 'quicksand',
            bgLayers: [
                { type: 'dunes', speed: 0.1 },
                { type: 'ruins', speed: 0.3 },
                { type: 'cacti', speed: 0.6 }
            ]
        },
        ice: {
            name: '冰雪世界', unlockLevel: 8, unlockType: 'level',
            skyColors: ['#1a2a4a', '#4a6a8a'],
            groundColor: '#cceeff', groundLine: '#88bbdd',
            buildingColors: ['#88bbdd', '#aaddee', '#77aacc'],
            particleColor: 'rgba(255,255,255,0.6)',
            obstacles: ['icicle', 'snowman', 'ice_block', 'penguin'],
            mechanic: 'slippery',
            bgLayers: [
                { type: 'snow_mountains', speed: 0.12 },
                { type: 'pine_trees', speed: 0.35 },
                { type: 'snow_ground', speed: 0.7 }
            ]
        },
        lava: {
            name: '熔岩洞穴', unlockLevel: 12, unlockType: 'level',
            skyColors: ['#1a0000', '#3a0a00'],
            groundColor: '#2a1a0a', groundLine: '#8a2a00',
            buildingColors: ['#3a1a0a', '#4a2a10', '#2a0a00'],
            particleColor: 'rgba(255,100,0,0.5)',
            obstacles: ['fire_pillar', 'lava_rock', 'stalactite', 'fire_bat'],
            mechanic: 'lava_floor',
            bgLayers: [
                { type: 'cave_wall', speed: 0.1 },
                { type: 'lava_bg', speed: 0.3 },
                { type: 'rocks', speed: 0.6 }
            ]
        },
        sky: {
            name: '天空之城', unlockLevel: 16, unlockType: 'level',
            skyColors: ['#4a8aff', '#aaccff'],
            groundColor: '#ddeeff', groundLine: '#88aacc',
            buildingColors: ['#ffffff', '#eeeeff', '#ddeeff'],
            particleColor: 'rgba(255,255,255,0.4)',
            obstacles: ['cloud_gap', 'wind_gust', 'bird_flock', 'floating_rock'],
            mechanic: 'wind',
            bgLayers: [
                { type: 'far_clouds', speed: 0.08 },
                { type: 'mid_clouds', speed: 0.25 },
                { type: 'near_clouds', speed: 0.5 }
            ]
        },
        ocean: {
            name: '深海隧道', unlockLevel: 20, unlockType: 'level',
            skyColors: ['#001a3a', '#003a6a'],
            groundColor: '#002a4a', groundLine: '#004a7a',
            buildingColors: ['#003050', '#004060', '#002540'],
            particleColor: 'rgba(100,200,255,0.3)',
            obstacles: ['jellyfish', 'seaweed', 'current', 'anglerfish'],
            mechanic: 'current',
            bgLayers: [
                { type: 'deep_bg', speed: 0.1 },
                { type: 'coral', speed: 0.3 },
                { type: 'bubbles', speed: 0.5 }
            ]
        },
        factory: {
            name: '机械工厂', unlockLevel: 25, unlockType: 'level',
            skyColors: ['#1a1a1a', '#2a2a2a'],
            groundColor: '#3a3a3a', groundLine: '#5a5a5a',
            buildingColors: ['#2a2a2a', '#3a3a3a', '#4a4a4a'],
            particleColor: 'rgba(200,200,200,0.3)',
            obstacles: ['gear', 'conveyor', 'laser', 'piston'],
            mechanic: 'conveyor',
            bgLayers: [
                { type: 'pipes', speed: 0.15 },
                { type: 'machines', speed: 0.35 },
                { type: 'sparks', speed: 0.6 }
            ]
        },
        shadow: {
            name: '暗影森林', unlockLevel: 30, unlockType: 'level',
            skyColors: ['#0a0a1a', '#1a1a2a'],
            groundColor: '#1a1a0a', groundLine: '#3a3a2a',
            buildingColors: ['#1a1a2a', '#0a0a1a', '#2a2a3a'],
            particleColor: 'rgba(100,255,100,0.2)',
            obstacles: ['root', 'spider', 'trap', 'ghost'],
            mechanic: 'darkness',
            bgLayers: [
                { type: 'dark_trees', speed: 0.1 },
                { type: 'mist', speed: 0.2 },
                { type: 'vines', speed: 0.5 }
            ]
        },
        rainbow: {
            name: '彩虹大道', unlockLevel: 0, unlockType: 'all_maps',
            skyColors: ['#2a1a4a', '#4a2a6a'],
            groundColor: '#3a2a5a', groundLine: '#ff6b6b',
            buildingColors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
            particleColor: 'rgba(255,200,255,0.5)',
            obstacles: ['all'],
            mechanic: 'random',
            bgLayers: [
                { type: 'stars', speed: 0.05 },
                { type: 'rainbow', speed: 0.2 },
                { type: 'crystals', speed: 0.5 }
            ]
        }
    },

    getCurrentMap() {
        return this.data[App.saveData.selectedMap] || this.data.city;
    },

    isMapUnlocked(mapId) {
        const map = this.data[mapId];
        if (!map) return false;
        if (mapId === 'city') return true;
        if (map.unlockType === 'level') return App.saveData.level >= map.unlockLevel;
        if (map.unlockType === 'all_maps') {
            const allIds = Object.keys(this.data).filter(id => id !== 'rainbow');
            return allIds.every(id => App.saveData.unlockedMaps.includes(id));
        }
        return App.saveData.unlockedMaps.includes(mapId);
    },

    drawBackground(ctx, scrollX) {
        const map = this.getCurrentMap();
        const W = App.W, H = App.H;

        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, map.skyColors[0]);
        grad.addColorStop(1, map.skyColors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        for (const layer of map.bgLayers) {
            this.drawLayer(ctx, layer, scrollX, map);
        }

        ctx.fillStyle = map.groundColor;
        ctx.fillRect(0, this.GROUND_Y, W, H - this.GROUND_Y);
        ctx.strokeStyle = map.groundLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.GROUND_Y);
        ctx.lineTo(W, this.GROUND_Y);
        ctx.stroke();
    },

    drawLayer(ctx, layer, scrollX, map) {
        const W = App.W;
        const offset = -(scrollX * layer.speed) % 200;

        ctx.globalAlpha = 0.6;
        switch (layer.type) {
            case 'buildings':
            case 'machines':
            case 'pipes':
                for (let x = offset; x < W + 100; x += 100) {
                    const h = 60 + Math.abs(Math.sin(x * 0.03)) * 100;
                    const colorIdx = Math.floor(Math.abs(x * 0.01)) % map.buildingColors.length;
                    ctx.fillStyle = map.buildingColors[colorIdx];
                    ctx.fillRect(x, this.GROUND_Y - h, 50, h);
                    ctx.fillStyle = 'rgba(255,255,100,0.2)';
                    for (let wy = this.GROUND_Y - h + 10; wy < this.GROUND_Y - 10; wy += 20) {
                        ctx.fillRect(x + 10, wy, 8, 8);
                        ctx.fillRect(x + 30, wy, 8, 8);
                    }
                }
                break;
            case 'trees':
            case 'pine_trees':
            case 'dark_trees':
            case 'bamboo_bg':
            case 'bamboo_fg':
                for (let x = offset; x < W + 60; x += 60) {
                    ctx.fillStyle = map.buildingColors[0];
                    ctx.fillRect(x + 8, this.GROUND_Y - 50, 6, 50);
                    ctx.beginPath();
                    ctx.arc(x + 11, this.GROUND_Y - 55, 18, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'mountains':
            case 'dunes':
            case 'snow_mountains':
            case 'cave_wall':
                for (let x = offset - 50; x < W + 150; x += 150) {
                    ctx.fillStyle = map.buildingColors[1];
                    ctx.beginPath();
                    ctx.moveTo(x, this.GROUND_Y);
                    ctx.lineTo(x + 75, this.GROUND_Y - 180);
                    ctx.lineTo(x + 150, this.GROUND_Y);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
            case 'lamps':
                for (let x = offset; x < W + 80; x += 80) {
                    ctx.fillStyle = '#3a3a5a';
                    ctx.fillRect(x, this.GROUND_Y - 70, 3, 70);
                    ctx.fillStyle = 'rgba(255,255,150,0.3)';
                    ctx.beginPath();
                    ctx.arc(x + 1, this.GROUND_Y - 72, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'far_clouds':
            case 'mid_clouds':
            case 'near_clouds':
                for (let x = offset; x < W + 120; x += 120) {
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.beginPath();
                    ctx.ellipse(x, 100 + Math.sin(x * 0.01) * 40, 40, 15, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'coral':
            case 'seaweed':
            case 'ruins':
            case 'cacti':
                for (let x = offset; x < W + 70; x += 70) {
                    ctx.fillStyle = map.buildingColors[2] || map.buildingColors[0];
                    const h = 20 + Math.abs(Math.sin(x * 0.05)) * 30;
                    ctx.fillRect(x, this.GROUND_Y - h, 12, h);
                    ctx.beginPath();
                    ctx.arc(x + 6, this.GROUND_Y - h, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            default:
                for (let x = offset; x < W + 100; x += 100) {
                    ctx.fillStyle = map.buildingColors[0];
                    const h = 30 + Math.abs(Math.sin(x * 0.02)) * 50;
                    ctx.fillRect(x, this.GROUND_Y - h, 40, h);
                }
                break;
        }
        ctx.globalAlpha = 1;
    }
};
