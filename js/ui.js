const UI = {
    shopTab: 'characters',
    shopScroll: 0,
    mapScroll: 0,
    missionTab: 'daily',
    skillBranch: 'speed',
    namingText: '',
    toast: null,
    toastTimer: 0,

    showToast(msg, duration = 2000) {
        this.toast = msg;
        this.toastTimer = duration;
    },

    drawToast(ctx) {
        if (!this.toast || this.toastTimer <= 0) return;
        this.toastTimer -= App.deltaTime || 16;
        const alpha = Math.min(1, this.toastTimer / 500);
        ctx.fillStyle = `rgba(0,0,0,${0.7 * alpha})`;
        const tw = ctx.measureText(this.toast).width + 30;
        ctx.fillRect((App.W - tw) / 2, App.H - 120, tw, 36);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.toast, App.W / 2, App.H - 98);
        if (this.toastTimer <= 0) this.toast = null;
    },

    // === NAMING SCREEN ===
    drawNaming(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, App.W, App.H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('欢迎来到跑酷冲刺!', App.W / 2, 200);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText('请输入你的昵称', App.W / 2, 240);

        ctx.fillStyle = '#2a2a4e';
        ctx.fillRect(80, 280, App.W - 160, 44);
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 280, App.W - 160, 44);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(this.namingText + '|', App.W / 2, 308);

        this.drawButton(ctx, 140, 360, 140, 44, '确认', '#e94560');

        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('（电脑端直接键盘输入）', App.W / 2, 430);

        const keys = ['跑者', '闪电侠', '风之子', '小飞侠'];
        ctx.font = '13px Arial';
        for (let i = 0; i < keys.length; i++) {
            this.drawButton(ctx, 50 + i * 85, 460, 75, 32, keys[i], '#2a4a6a');
        }
    },

    handleNamingInput(x, y, key) {
        if (key === 'space') return;
        if (y >= 460 && y <= 492) {
            const keys = ['跑者', '闪电侠', '风之子', '小飞侠'];
            const idx = Math.floor((x - 50) / 85);
            if (idx >= 0 && idx < 4) this.namingText = keys[idx];
        }
        if (x >= 140 && x <= 280 && y >= 360 && y <= 404 && this.namingText.length > 0) {
            App.saveData.playerName = this.namingText;
            SaveManager.save(App.saveData);
            App.switchScene('menu');
        }
    },

    // === MAIN MENU ===
    drawMenu(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, App.W, App.H);

        const grad = ctx.createLinearGradient(0, 0, 0, 200);
        grad.addColorStop(0, '#0f3460');
        grad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, App.W, 200);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('跑酷冲刺', App.W / 2, 60);

        ctx.font = '13px Arial';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText(`Lv.${App.saveData.level} ${App.saveData.playerName}`, 16, 90);

        const expProg = Progression.getExpProgress();
        ctx.fillStyle = '#333';
        ctx.fillRect(16, 96, 150, 8);
        ctx.fillStyle = '#e94560';
        ctx.fillRect(16, 96, 150 * expProg, 8);

        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'right';
        ctx.fillText(`${App.saveData.coins}`, App.W - 16, 85);
        ctx.fillStyle = '#aa88ff';
        ctx.fillText(`${App.saveData.diamonds}`, App.W - 16, 103);

        // Character preview
        ctx.save();
        ctx.translate(App.W / 2, 170);
        ctx.scale(1.8, 1.8);
        const charData = Shop.getCharacterData(App.saveData.selectedCharacter);
        const colors = charData ? charData.colors : { skin: '#FFD5B8', hair: '#4A3728', shirt: '#E94560', pants: '#2B4570', shoes: '#1A1A2E', eyes: '#2B2B2B' };
        const menuHairStyle = (charData && charData.hairStyle) ? charData.hairStyle : 'short';
        const previewFrame = Math.floor(Date.now() / 150) % 6;
        const t = previewFrame / 6 * Math.PI * 2;
        const cycle = {
            leftArm: Math.sin(t) * 0.7, rightArm: Math.sin(t + Math.PI) * 0.7,
            leftLeg: Math.sin(t + Math.PI) * 0.6, rightLeg: Math.sin(t) * 0.6,
            bodyY: Math.abs(Math.sin(t * 2)) * -2
        };
        const previewCtx = { animFrame: previewFrame, stateTime: Date.now(), roundRect: Player.roundRect };
        Player.drawCharacter.call(previewCtx, ctx, colors, cycle, menuHairStyle);
        Player.drawEquipment.call(previewCtx, ctx, colors, cycle);
        ctx.restore();

        // Stamina
        ctx.font = '12px Arial';
        ctx.fillStyle = '#44cc88';
        ctx.textAlign = 'left';
        ctx.fillText(`体力: ${App.saveData.stamina}/${App.getMaxStamina()}`, 16, 120);

        // Menu buttons
        const btnY = 270;
        this.drawButton(ctx, 60, btnY, 300, 52, '开始游戏', '#e94560');
        this.drawButton(ctx, 60, btnY + 66, 145, 44, '选择地图', '#0f3460');
        this.drawButton(ctx, 215, btnY + 66, 145, 44, '商店', '#533483');
        this.drawButton(ctx, 60, btnY + 124, 145, 44, '技能树', '#2d6a4f');
        this.drawButton(ctx, 215, btnY + 124, 145, 44, '任务', '#8a5000');
        this.drawButton(ctx, 60, btnY + 182, 300, 38, '排行榜', '#333');

        // Best scores
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText(`最高分: ${App.saveData.bestScore}m | 总里程: ${App.saveData.totalDistance}m`, App.W / 2, App.H - 36);

        ctx.font = 'italic 13px Arial';
        ctx.fillStyle = '#e94560';
        ctx.fillText('For 小兰宝宝～', App.W / 2, App.H - 14);
    },

    handleMenuInput(x, y) {
        const btnY = 270;
        if (this.inRect(x, y, 60, btnY, 300, 52)) {
            if (App.saveData.stamina > 0) {
                App.saveData.stamina--;
                App.saveData.lastStaminaTime = Date.now();
                SaveManager.save(App.saveData);
                App.switchScene('playing');
            } else {
                this.showToast('体力不足！等待恢复或观看广告');
            }
        }
        else if (this.inRect(x, y, 60, btnY + 66, 145, 44)) App.switchScene('mapselect');
        else if (this.inRect(x, y, 215, btnY + 66, 145, 44)) { this.shopTab = 'characters'; App.switchScene('shop'); }
        else if (this.inRect(x, y, 60, btnY + 124, 145, 44)) App.switchScene('skills');
        else if (this.inRect(x, y, 215, btnY + 124, 145, 44)) App.switchScene('missions');
        else if (this.inRect(x, y, 60, btnY + 182, 300, 38)) {
            this._leaderboardLoading = true;
            this._leaderboardScores = [];
            App.switchScene('leaderboard');
            Leaderboard.getTopScores(20).then(scores => {
                this._leaderboardScores = scores;
                this._leaderboardLoading = false;
            });
        }
    },

    // === GAME OVER ===
    drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(10,10,30,0.95)';
        ctx.fillRect(0, 0, App.W, App.H);

        const result = Game.lastResult;
        if (!result) return;

        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', App.W / 2, 100);

        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`距离: ${result.distance}m`, App.W / 2, 170);
        ctx.fillText(`金币: +${result.coins}`, App.W / 2, 210);
        ctx.fillText(`经验: +${result.exp}`, App.W / 2, 250);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`Lv.${App.saveData.level} (${App.saveData.exp}/${Progression.getExpForLevel(App.saveData.level)})`, App.W / 2, 290);

        const expProg = Progression.getExpProgress();
        ctx.fillStyle = '#333';
        ctx.fillRect(100, 300, 220, 10);
        ctx.fillStyle = '#e94560';
        ctx.fillRect(100, 300, 220 * expProg, 10);

        this.drawButton(ctx, 80, 370, 260, 50, '再来一次', '#e94560');
        this.drawButton(ctx, 80, 440, 260, 44, '返回主菜单', '#333');
    },

    handleGameOverInput(x, y) {
        if (this.inRect(x, y, 80, 370, 260, 50)) {
            if (App.saveData.stamina > 0) {
                App.saveData.stamina--;
                SaveManager.save(App.saveData);
                App.switchScene('playing');
            } else {
                this.showToast('体力不足！');
            }
        }
        if (this.inRect(x, y, 80, 440, 260, 44)) App.switchScene('menu');
    },

    // === MAP SELECT ===
    drawMapSelect(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, App.W, App.H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('选择地图', App.W / 2, 40);

        this.drawButton(ctx, 16, 10, 60, 30, '返回', '#444');

        const maps = Object.entries(Maps.data);
        let y = 70;
        for (const [id, map] of maps) {
            const unlocked = Maps.isMapUnlocked(id);
            const selected = App.saveData.selectedMap === id;
            const bgColor = selected ? '#e94560' : (unlocked ? '#2a2a4e' : '#1a1a1a');

            ctx.fillStyle = bgColor;
            ctx.fillRect(30, y, App.W - 60, 52);
            if (selected) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(30, y, App.W - 60, 52);
            }

            ctx.fillStyle = unlocked ? '#fff' : '#555';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(unlocked ? map.name : '???', 50, y + 22);

            ctx.font = '11px Arial';
            ctx.fillStyle = unlocked ? '#aaa' : '#444';
            if (!unlocked) {
                const cond = map.unlockType === 'level' ? `等级${map.unlockLevel}解锁` : '通关全部地图解锁';
                ctx.fillText(cond, 50, y + 40);
            } else {
                const best = App.saveData.mapBestScores[id] || 0;
                ctx.fillText(`最高: ${best}m`, 50, y + 40);
            }

            // Color preview
            if (unlocked) {
                ctx.fillStyle = map.skyColors[0];
                ctx.fillRect(App.W - 100, y + 8, 36, 36);
                ctx.fillStyle = map.groundColor;
                ctx.fillRect(App.W - 100, y + 30, 36, 14);
            }

            y += 58;
        }
    },

    handleMapSelectInput(x, y) {
        if (this.inRect(x, y, 16, 10, 60, 30)) { App.switchScene('menu'); return; }

        const maps = Object.entries(Maps.data);
        let by = 70;
        for (const [id, map] of maps) {
            if (this.inRect(x, y, 30, by, App.W - 60, 52)) {
                if (Maps.isMapUnlocked(id)) {
                    App.saveData.selectedMap = id;
                    SaveManager.save(App.saveData);
                } else {
                    this.showToast('尚未解锁');
                }
            }
            by += 58;
        }
    },

    // === SHOP ===
    drawShop(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, App.W, App.H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('商店', App.W / 2, 36);

        this.drawButton(ctx, 16, 10, 60, 30, '返回', '#444');

        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'right';
        ctx.fillText(`${App.saveData.coins}`, App.W - 80, 30);
        ctx.fillStyle = '#aa88ff';
        ctx.fillText(`${App.saveData.diamonds}`, App.W - 16, 30);

        const tabs = ['characters', 'head', 'cape', 'shoes', 'amulet'];
        const tabNames = ['角色', '头饰', '披风', '鞋子', '护符'];
        for (let i = 0; i < tabs.length; i++) {
            const selected = this.shopTab === tabs[i];
            ctx.fillStyle = selected ? '#e94560' : '#2a2a4e';
            ctx.fillRect(10 + i * 82, 52, 76, 28);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tabNames[i], 10 + i * 82 + 38, 70);
        }

        let y = 92;
        if (this.shopTab === 'characters') {
            for (const char of Shop.characters) {
                const owned = App.saveData.unlockedCharacters.includes(char.id);
                const selected = App.saveData.selectedCharacter === char.id;
                ctx.fillStyle = selected ? '#3a2a4a' : '#222';
                ctx.fillRect(20, y, App.W - 40, 60);
                if (selected) { ctx.strokeStyle = '#e94560'; ctx.lineWidth = 1; ctx.strokeRect(20, y, App.W - 40, 60); }

                // Mini character preview
                ctx.save();
                ctx.translate(56, y + 30);
                ctx.scale(0.6, 0.6);
                const miniCycle = { leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, bodyY: 0 };
                const miniCtx = { animFrame: 0, stateTime: Date.now(), roundRect: Player.roundRect, state: 'run' };
                Player.drawCharacter.call(miniCtx, ctx, char.colors, miniCycle, char.hairStyle || 'short');
                ctx.restore();

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(char.name, 90, y + 22);
                ctx.font = '11px Arial';
                ctx.fillStyle = '#aaa';
                ctx.fillText(char.desc, 90, y + 40);

                if (!owned) {
                    const canBuy = Shop.canBuyCharacter(char.id);
                    let costText = '';
                    if (char.unlockType === 'coins') costText = `${char.unlockValue}金币`;
                    else if (char.unlockType === 'level') costText = `等级${char.unlockValue}`;
                    else if (char.unlockType === 'distance') costText = `${char.unlockValue}m`;
                    else if (char.unlockType === 'map') costText = `通关指定地图`;
                    ctx.fillStyle = canBuy ? '#44cc88' : '#666';
                    ctx.textAlign = 'right';
                    ctx.fillText(costText, App.W - 36, y + 35);
                } else if (!selected) {
                    ctx.fillStyle = '#44aaff';
                    ctx.textAlign = 'right';
                    ctx.font = '12px Arial';
                    ctx.fillText('使用', App.W - 36, y + 35);
                }
                y += 66;
            }
        } else {
            const items = Shop.equipment[this.shopTab] || [];
            for (const item of items) {
                const owned = App.saveData.ownedEquipment.includes(item.id);
                const equipped = App.saveData.equipment[item.slot] === item.id;
                ctx.fillStyle = equipped ? '#2a3a4a' : '#222';
                ctx.fillRect(20, y, App.W - 40, 56);

                const rarityColors = { common: '#aaa', rare: '#44aaff', legendary: '#FFD700' };
                ctx.fillStyle = rarityColors[item.rarity] || '#aaa';
                ctx.fillRect(20, y, 4, 56);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 13px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(item.name, 36, y + 20);
                ctx.font = '11px Arial';
                ctx.fillStyle = '#aaa';
                ctx.fillText(item.desc, 36, y + 38);

                if (!owned) {
                    const canBuy = Shop.canBuyEquipment(item.id);
                    ctx.fillStyle = canBuy ? '#44cc88' : '#666';
                    ctx.textAlign = 'right';
                    ctx.font = '12px Arial';
                    const costText = item.costType === 'coins' ? `${item.cost}金` : `${item.cost}钻`;
                    ctx.fillText(costText, App.W - 36, y + 32);
                } else if (!equipped) {
                    ctx.fillStyle = '#44aaff';
                    ctx.textAlign = 'right';
                    ctx.font = '12px Arial';
                    ctx.fillText('装备', App.W - 36, y + 32);
                } else {
                    ctx.fillStyle = '#e94560';
                    ctx.textAlign = 'right';
                    ctx.font = '12px Arial';
                    ctx.fillText('已装备', App.W - 36, y + 32);
                }
                y += 62;
            }
        }
        this.drawToast(ctx);
    },

    handleShopInput(x, y) {
        if (this.inRect(x, y, 16, 10, 60, 30)) { App.switchScene('menu'); return; }

        const tabs = ['characters', 'head', 'cape', 'shoes', 'amulet'];
        for (let i = 0; i < tabs.length; i++) {
            if (this.inRect(x, y, 10 + i * 82, 52, 76, 28)) { this.shopTab = tabs[i]; return; }
        }

        let iy = 92;
        if (this.shopTab === 'characters') {
            for (const char of Shop.characters) {
                if (this.inRect(x, y, 20, iy, App.W - 40, 60)) {
                    const owned = App.saveData.unlockedCharacters.includes(char.id);
                    if (owned) {
                        App.saveData.selectedCharacter = char.id;
                        SaveManager.save(App.saveData);
                    } else if (Shop.canBuyCharacter(char.id)) {
                        Shop.buyCharacter(char.id);
                        App.saveData.selectedCharacter = char.id;
                        SaveManager.save(App.saveData);
                        this.showToast(`解锁 ${char.name}!`);
                    } else {
                        this.showToast('条件不满足');
                    }
                }
                iy += 66;
            }
        } else {
            const items = Shop.equipment[this.shopTab] || [];
            for (const item of items) {
                if (this.inRect(x, y, 20, iy, App.W - 40, 56)) {
                    const owned = App.saveData.ownedEquipment.includes(item.id);
                    if (owned) {
                        if (App.saveData.equipment[item.slot] === item.id) {
                            Shop.unequipSlot(item.slot);
                        } else {
                            Shop.equipItem(item.id);
                        }
                    } else if (Shop.canBuyEquipment(item.id)) {
                        Shop.buyEquipment(item.id);
                        Shop.equipItem(item.id);
                        this.showToast(`购买并装备 ${item.name}!`);
                    } else {
                        this.showToast('货币不足');
                    }
                }
                iy += 62;
            }
        }
    },

    // === SKILLS ===
    drawSkills(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, App.W, App.H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('技能树', App.W / 2, 36);

        this.drawButton(ctx, 16, 10, 60, 30, '返回', '#444');

        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'right';
        ctx.fillText(`技能点: ${App.saveData.skillPoints}`, App.W - 16, 30);

        const branches = ['speed', 'defense', 'collect'];
        const branchNames = ['速度系', '防御系', '收集系'];
        const branchColors = ['#e94560', '#44aaff', '#FFD700'];
        for (let i = 0; i < 3; i++) {
            const sel = this.skillBranch === branches[i];
            ctx.fillStyle = sel ? branchColors[i] : '#2a2a4e';
            ctx.fillRect(20 + i * 130, 52, 120, 28);
            ctx.fillStyle = '#fff';
            ctx.font = '13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(branchNames[i], 80 + i * 130, 70);
        }

        const skills = Skills.tree[this.skillBranch] || [];
        let y = 96;
        for (const skill of skills) {
            const level = Skills.getSkillLevel(skill.id);
            const check = Skills.canUpgrade(skill.id);
            const maxed = level >= skill.maxLevel;

            ctx.fillStyle = maxed ? '#1a3a2a' : '#222';
            ctx.fillRect(20, y, App.W - 40, 62);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${skill.name}`, 36, y + 20);
            ctx.font = '12px Arial';
            ctx.fillStyle = maxed ? '#44cc88' : '#e94560';
            ctx.fillText(`Lv.${level}/${skill.maxLevel}`, 200, y + 20);

            ctx.fillStyle = '#aaa';
            ctx.font = '11px Arial';
            ctx.fillText(skill.desc, 36, y + 38);

            if (!maxed) {
                const cost = skill.cost[level];
                ctx.fillStyle = check.can ? '#44cc88' : '#666';
                ctx.textAlign = 'right';
                ctx.font = '11px Arial';
                ctx.fillText(check.can ? `升级(${cost}金)` : check.reason, App.W - 36, y + 38);
            }

            // Progress bar
            ctx.fillStyle = '#333';
            ctx.fillRect(36, y + 48, 200, 6);
            ctx.fillStyle = '#e94560';
            ctx.fillRect(36, y + 48, 200 * (level / skill.maxLevel), 6);

            y += 70;
        }
        this.drawToast(ctx);
    },

    handleSkillsInput(x, y) {
        if (this.inRect(x, y, 16, 10, 60, 30)) { App.switchScene('menu'); return; }

        const branches = ['speed', 'defense', 'collect'];
        for (let i = 0; i < 3; i++) {
            if (this.inRect(x, y, 20 + i * 130, 52, 120, 28)) { this.skillBranch = branches[i]; return; }
        }

        const skills = Skills.tree[this.skillBranch] || [];
        let iy = 96;
        for (const skill of skills) {
            if (this.inRect(x, y, 20, iy, App.W - 40, 62)) {
                if (Skills.upgrade(skill.id)) {
                    this.showToast(`${skill.name} 升级成功!`);
                } else {
                    const check = Skills.canUpgrade(skill.id);
                    this.showToast(check.reason);
                }
            }
            iy += 70;
        }
    },

    // === MISSIONS ===
    drawMissions(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, App.W, App.H);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('任务 & 成就', App.W / 2, 36);

        this.drawButton(ctx, 16, 10, 60, 30, '返回', '#444');

        const tabSel = this.missionTab;
        ctx.fillStyle = tabSel === 'daily' ? '#e94560' : '#2a2a4e';
        ctx.fillRect(60, 52, 140, 28);
        ctx.fillStyle = tabSel === 'achieve' ? '#FFD700' : '#2a2a4e';
        ctx.fillRect(220, 52, 140, 28);
        ctx.fillStyle = '#fff';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('每日任务', 130, 70);
        ctx.fillText('成就', 290, 70);

        let y = 94;
        if (tabSel === 'daily') {
            const missionIds = App.saveData.dailyMissions || [];
            for (const id of missionIds) {
                const mission = Missions.missionPool.find(m => m.id === id);
                if (!mission) continue;
                const progress = Missions.getMissionProgress(id);
                const complete = progress >= mission.target;
                const claimed = App.saveData.dailyMissionProgress['claimed_' + id];

                ctx.fillStyle = claimed ? '#1a3a2a' : '#222';
                ctx.fillRect(20, y, App.W - 40, 64);

                ctx.fillStyle = complete ? '#44cc88' : '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(mission.name, 36, y + 20);

                ctx.font = '11px Arial';
                ctx.fillStyle = '#aaa';
                ctx.fillText(`奖励: ${mission.reward.coins}金 + ${mission.reward.exp}经验`, 36, y + 38);

                ctx.fillStyle = '#333';
                ctx.fillRect(36, y + 48, 200, 6);
                ctx.fillStyle = complete ? '#44cc88' : '#e94560';
                ctx.fillRect(36, y + 48, 200 * Math.min(1, progress / mission.target), 6);

                ctx.font = '11px Arial';
                ctx.textAlign = 'right';
                if (claimed) {
                    ctx.fillStyle = '#44cc88';
                    ctx.fillText('已领取', App.W - 36, y + 35);
                } else if (complete) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillText('领取奖励', App.W - 36, y + 35);
                } else {
                    ctx.fillStyle = '#aaa';
                    ctx.fillText(`${Math.floor(progress)}/${mission.target}`, App.W - 36, y + 35);
                }
                y += 72;
            }
        } else {
            for (const ach of Missions.achievements) {
                const done = App.saveData.achievements[ach.id];
                const progress = Missions.getAchievementProgress(ach.id);
                const ratio = Math.min(1, progress / ach.target);

                ctx.fillStyle = done ? '#1a2a3a' : '#222';
                ctx.fillRect(20, y, App.W - 40, 54);

                ctx.fillStyle = done ? '#44cc88' : '#fff';
                ctx.font = 'bold 13px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(ach.name, 36, y + 18);
                ctx.font = '10px Arial';
                ctx.fillStyle = '#aaa';
                ctx.fillText(ach.desc, 36, y + 34);

                ctx.fillStyle = '#333';
                ctx.fillRect(36, y + 42, 180, 5);
                ctx.fillStyle = done ? '#44cc88' : '#e94560';
                ctx.fillRect(36, y + 42, 180 * ratio, 5);

                ctx.fillStyle = '#aa88ff';
                ctx.font = '11px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(done ? '已完成' : `${ach.reward}钻`, App.W - 36, y + 30);

                y += 58;
            }
        }
        this.drawToast(ctx);
    },

    handleMissionsInput(x, y) {
        if (this.inRect(x, y, 16, 10, 60, 30)) { App.switchScene('menu'); return; }
        if (this.inRect(x, y, 60, 52, 140, 28)) { this.missionTab = 'daily'; return; }
        if (this.inRect(x, y, 220, 52, 140, 28)) { this.missionTab = 'achieve'; return; }

        if (this.missionTab === 'daily') {
            const missionIds = App.saveData.dailyMissions || [];
            let iy = 94;
            for (const id of missionIds) {
                if (this.inRect(x, y, 20, iy, App.W - 40, 64)) {
                    if (Missions.claimMission(id)) {
                        this.showToast('奖励已领取!');
                    }
                }
                iy += 72;
            }
        }
    },

    // === LEADERBOARD ===
    _leaderboardScores: [],
    _leaderboardLoading: false,

    drawLeaderboard(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, App.W, App.H);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('排行榜', App.W / 2, 40);

        this.drawButton(ctx, 16, 10, 60, 30, '返回', '#444');

        if (this._leaderboardLoading) {
            ctx.fillStyle = '#aaa';
            ctx.font = '16px Arial';
            ctx.fillText('加载中...', App.W / 2, App.H / 2);
            return;
        }

        const scores = this._leaderboardScores;
        if (!scores || scores.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.fillText('暂无记录，快去创造吧！', App.W / 2, App.H / 2);
            return;
        }

        ctx.font = '11px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('排名    玩家        分数       距离', App.W / 2, 70);

        let y = 90;
        for (let i = 0; i < Math.min(scores.length, 15); i++) {
            const s = scores[i];
            const isMe = s.name === App.saveData.playerName;
            ctx.fillStyle = isMe ? '#2a1a3a' : (i % 2 === 0 ? '#1e1e3e' : '#222244');
            ctx.fillRect(20, y, App.W - 40, 34);

            if (i < 3) {
                const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];
                ctx.fillStyle = medals[i];
            } else {
                ctx.fillStyle = isMe ? '#e94560' : '#aaa';
            }
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${i + 1}`, 32, y + 22);

            ctx.fillStyle = isMe ? '#fff' : '#ccc';
            ctx.font = '13px Arial';
            ctx.fillText(s.name || '???', 70, y + 22);

            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'right';
            ctx.fillText(`${s.score}m`, App.W - 100, y + 22);

            ctx.fillStyle = '#aaa';
            ctx.font = '11px Arial';
            ctx.fillText(`Lv.${s.level || 1}`, App.W - 36, y + 22);

            y += 36;
        }

        const rank = Leaderboard.getPlayerRank(App.saveData.bestScore);
        if (rank > 0) {
            ctx.fillStyle = '#e94560';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`你的排名: 第${rank}名 (最高${App.saveData.bestScore}m)`, App.W / 2, App.H - 30);
        }
    },

    handleLeaderboardInput(x, y) {
        if (this.inRect(x, y, 16, 10, 60, 30)) { App.switchScene('menu'); return; }
    },

    // === UTILITIES ===
    drawButton(ctx, x, y, w, h, text, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        const r = 6;
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

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.min(16, h * 0.4)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w / 2, y + h / 2 + 5);
    },

    inRect(x, y, rx, ry, rw, rh) {
        return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }
};

document.addEventListener('keydown', (e) => {
    if (App.currentScene === 'naming') {
        if (e.key === 'Backspace') {
            UI.namingText = UI.namingText.slice(0, -1);
        } else if (e.key === 'Enter') {
            if (UI.namingText.length > 0) {
                App.saveData.playerName = UI.namingText;
                SaveManager.save(App.saveData);
                App.switchScene('menu');
            }
        } else if (e.key.length === 1 && UI.namingText.length < 8) {
            UI.namingText += e.key;
        }
    }
    if (App.currentScene === 'playing' && e.code === 'Escape') {
        Game.paused = !Game.paused;
    }
});

