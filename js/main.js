const App = {
    canvas: null,
    ctx: null,
    W: 420,
    H: 680,
    currentScene: 'menu',
    saveData: null,
    lastTime: 0,
    deltaTime: 0,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.saveData = SaveManager.load();

        if (!this.saveData.playerName) {
            this.currentScene = 'naming';
        }

        this.updateStamina();
        Missions.checkDailyReset(this.saveData);

        this.bindInput();
        this.loop(0);
    },

    resize() {
        const ratio = this.W / this.H;
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (w / h > ratio) {
            w = h * ratio;
        } else {
            h = w / ratio;
        }
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
    },

    updateStamina() {
        const now = Date.now();
        const elapsed = now - this.saveData.lastStaminaTime;
        const maxStamina = this.getMaxStamina();
        const recovered = Math.floor(elapsed / (8 * 60 * 1000));
        if (recovered > 0 && this.saveData.stamina < maxStamina) {
            this.saveData.stamina = Math.min(maxStamina, this.saveData.stamina + recovered);
            this.saveData.lastStaminaTime = now;
            SaveManager.save(this.saveData);
        }
    },

    getMaxStamina() {
        const char = Shop.getCharacterData(this.saveData.selectedCharacter);
        return 10 + (char && char.passiveType === 'stamina' ? char.passiveValue : 0);
    },

    bindInput() {
        const getPos = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: (clientX - rect.left) * (this.W / rect.width),
                y: (clientY - rect.top) * (this.H / rect.height)
            };
        };

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this._lastTouchTime = Date.now();
            for (const touch of e.changedTouches) {
                const pos = getPos(touch.clientX, touch.clientY);
                if (this.currentScene === 'playing') {
                    Game.handleTouchStart(touch.identifier, pos.x, pos.y);
                } else {
                    this.handleInput(pos.x, pos.y);
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.currentScene !== 'playing') return;
            for (const touch of e.changedTouches) {
                const pos = getPos(touch.clientX, touch.clientY);
                Game.handleTouchMove(touch.identifier, pos.x, pos.y);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.currentScene !== 'playing') return;
            for (const touch of e.changedTouches) {
                Game.handleTouchEnd(touch.identifier);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchcancel', (e) => {
            if (this.currentScene !== 'playing') return;
            for (const touch of e.changedTouches) {
                Game.handleTouchEnd(touch.identifier);
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this._lastTouchTime && Date.now() - this._lastTouchTime < 500) return;
            const pos = getPos(e.clientX, e.clientY);
            if (this.currentScene === 'playing') {
                Game.handleTouchStart('mouse', pos.x, pos.y);
            } else {
                this.handleInput(pos.x, pos.y);
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this._lastTouchTime && Date.now() - this._lastTouchTime < 500) return;
            if (this.currentScene === 'playing') {
                Game.handleTouchEnd('mouse');
            }
        });

        // Keyboard support
        const keyMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', KeyA: 'left', KeyD: 'right', KeyS: 'down' };
        document.addEventListener('keydown', (e) => {
            if (this.currentScene === 'playing') {
                if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                    Player.jump();
                } else if (keyMap[e.code]) {
                    Game.applyButton(keyMap[e.code], true);
                    Game.buttons[keyMap[e.code]].pressed = true;
                }
            } else {
                if (e.code === 'Space') this.handleInput(this.W / 2, this.H / 2, 'space');
            }
        });
        document.addEventListener('keyup', (e) => {
            if (this.currentScene === 'playing' && keyMap[e.code]) {
                Game.applyButton(keyMap[e.code], false);
                Game.buttons[keyMap[e.code]].pressed = false;
            }
        });
    },

    handleInput(x, y, key) {
        switch (this.currentScene) {
            case 'naming': UI.handleNamingInput(x, y, key); break;
            case 'menu': UI.handleMenuInput(x, y); break;
            case 'playing': Game.handleInput(x, y); break;
            case 'gameover': UI.handleGameOverInput(x, y); break;
            case 'mapselect': UI.handleMapSelectInput(x, y); break;
            case 'shop': UI.handleShopInput(x, y); break;
            case 'skills': UI.handleSkillsInput(x, y); break;
            case 'missions': UI.handleMissionsInput(x, y); break;
            case 'leaderboard': UI.handleLeaderboardInput(x, y); break;
        }
    },

    switchScene(scene) {
        this.currentScene = scene;
        if (scene === 'playing') {
            Game.start();
        }
    },

    loop(timestamp) {
        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, this.W, this.H);

        switch (this.currentScene) {
            case 'naming': UI.drawNaming(this.ctx); break;
            case 'menu': UI.drawMenu(this.ctx); break;
            case 'playing': Game.update(); Game.draw(this.ctx); break;
            case 'gameover': UI.drawGameOver(this.ctx); break;
            case 'mapselect': UI.drawMapSelect(this.ctx); break;
            case 'shop': UI.drawShop(this.ctx); break;
            case 'skills': UI.drawSkills(this.ctx); break;
            case 'missions': UI.drawMissions(this.ctx); break;
            case 'leaderboard': UI.drawLeaderboard(this.ctx); break;
        }

        requestAnimationFrame((t) => this.loop(t));
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
