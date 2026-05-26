const Missions = {
    missionPool: [
        { id: 'run_500', name: '跑步500米', type: 'distance', target: 500, reward: { coins: 100, exp: 50 } },
        { id: 'run_1000', name: '跑步1000米', type: 'distance', target: 1000, reward: { coins: 200, exp: 100 } },
        { id: 'run_2000', name: '跑步2000米', type: 'distance', target: 2000, reward: { coins: 400, exp: 200 } },
        { id: 'coins_30', name: '收集30金币', type: 'coins', target: 30, reward: { coins: 150, exp: 80 } },
        { id: 'coins_80', name: '收集80金币', type: 'coins', target: 80, reward: { coins: 300, exp: 150 } },
        { id: 'score_500', name: '单局500分', type: 'score', target: 500, reward: { coins: 200, exp: 100 } },
        { id: 'score_1500', name: '单局1500分', type: 'score', target: 1500, reward: { coins: 500, exp: 250 } },
        { id: 'games_3', name: '完成3局游戏', type: 'games', target: 3, reward: { coins: 250, exp: 120 } },
        { id: 'powerup_3', name: '使用3个道具', type: 'powerups', target: 3, reward: { coins: 150, exp: 80 } },
        { id: 'powerup_5', name: '使用5个道具', type: 'powerups', target: 5, reward: { coins: 300, exp: 150 } }
    ],

    achievements: [
        { id: 'dist_1k', name: '短跑选手', desc: '累计跑步1000米', type: 'total_distance', target: 1000, reward: 1 },
        { id: 'dist_10k', name: '马拉松', desc: '累计跑步10000米', type: 'total_distance', target: 10000, reward: 3 },
        { id: 'dist_100k', name: '环球旅行', desc: '累计跑步100000米', type: 'total_distance', target: 100000, reward: 10 },
        { id: 'coins_1k', name: '小富翁', desc: '累计收集1000金币', type: 'total_coins', target: 1000, reward: 1 },
        { id: 'coins_10k', name: '大富翁', desc: '累计收集10000金币', type: 'total_coins', target: 10000, reward: 5 },
        { id: 'coins_100k', name: '金币大亨', desc: '累计收集100000金币', type: 'total_coins', target: 100000, reward: 15 },
        { id: 'level_10', name: '初出茅庐', desc: '达到等级10', type: 'level', target: 10, reward: 2 },
        { id: 'level_25', name: '身经百战', desc: '达到等级25', type: 'level', target: 25, reward: 5 },
        { id: 'level_50', name: '传奇跑者', desc: '达到等级50', type: 'level', target: 50, reward: 20 },
        { id: 'score_2k', name: '高分达人', desc: '单局2000分', type: 'best_score', target: 2000, reward: 3 },
        { id: 'score_5k', name: '超级跑者', desc: '单局5000分', type: 'best_score', target: 5000, reward: 8 },
        { id: 'games_10', name: '常客', desc: '完成10局游戏', type: 'total_games', target: 10, reward: 1 },
        { id: 'games_100', name: '上瘾了', desc: '完成100局游戏', type: 'total_games', target: 100, reward: 5 },
        { id: 'chars_3', name: '收集者', desc: '解锁3个角色', type: 'characters', target: 3, reward: 3 },
        { id: 'chars_all', name: '全员集合', desc: '解锁全部角色', type: 'characters', target: 6, reward: 10 },
        { id: 'maps_5', name: '探险家', desc: '解锁5张地图', type: 'maps', target: 5, reward: 5 },
        { id: 'maps_all', name: '世界旅人', desc: '解锁全部地图', type: 'maps', target: 10, reward: 15 }
    ],

    _sessionDistance: 0,
    _sessionCoins: 0,
    _sessionGames: 0,
    _sessionPowerups: 0,

    checkDailyReset(saveData) {
        try {
            const today = new Date().toISOString().split('T')[0];
            if (saveData.dailyMissionDate !== today) {
                saveData.dailyMissionDate = today;
                saveData.dailyMissions = this.generateDailyMissions();
                saveData.dailyMissionProgress = {};
                this._sessionDistance = 0;
                this._sessionCoins = 0;
                this._sessionGames = 0;
                this._sessionPowerups = 0;
                SaveManager.save(saveData);
            }
        } catch (e) {
            saveData.dailyMissions = [];
            saveData.dailyMissionProgress = {};
        }
    },

    generateDailyMissions() {
        const shuffled = [...this.missionPool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3).map(m => m.id);
    },

    trackDistance(dist) {
        this._sessionDistance += dist;
    },

    trackPowerup(type) {
        this._sessionPowerups++;
    },

    trackGameEnd(score, coins, distance) {
        this._sessionGames++;
        this._sessionCoins += coins;

        const progress = App.saveData.dailyMissionProgress;
        progress.distance = (progress.distance || 0) + Math.floor(distance);
        progress.coins = (progress.coins || 0) + Math.floor(coins);
        progress.score = Math.max(progress.score || 0, score);
        progress.games = (progress.games || 0) + 1;
        progress.powerups = (progress.powerups || 0) + this._sessionPowerups;
        this._sessionPowerups = 0;

        this.checkAchievements();
    },

    getMissionProgress(missionId) {
        const mission = this.missionPool.find(m => m.id === missionId);
        if (!mission) return 0;
        const progress = App.saveData.dailyMissionProgress;
        switch (mission.type) {
            case 'distance': return progress.distance || 0;
            case 'coins': return progress.coins || 0;
            case 'score': return progress.score || 0;
            case 'games': return progress.games || 0;
            case 'powerups': return progress.powerups || 0;
        }
        return 0;
    },

    isMissionComplete(missionId) {
        const mission = this.missionPool.find(m => m.id === missionId);
        if (!mission) return false;
        return this.getMissionProgress(missionId) >= mission.target;
    },

    claimMission(missionId) {
        if (!this.isMissionComplete(missionId)) return false;
        if (App.saveData.dailyMissionProgress['claimed_' + missionId]) return false;

        const mission = this.missionPool.find(m => m.id === missionId);
        App.saveData.coins += mission.reward.coins;
        Progression.addExp(mission.reward.exp);
        App.saveData.dailyMissionProgress['claimed_' + missionId] = true;
        SaveManager.save(App.saveData);
        return true;
    },

    checkAchievements() {
        for (const ach of this.achievements) {
            if (App.saveData.achievements[ach.id]) continue;
            let current = 0;
            switch (ach.type) {
                case 'total_distance': current = App.saveData.totalDistance; break;
                case 'total_coins': current = App.saveData.totalCoins; break;
                case 'level': current = App.saveData.level; break;
                case 'best_score': current = App.saveData.bestScore; break;
                case 'total_games': current = App.saveData.totalGames; break;
                case 'characters': current = App.saveData.unlockedCharacters.length; break;
                case 'maps': current = App.saveData.unlockedMaps.length; break;
            }
            if (current >= ach.target) {
                App.saveData.achievements[ach.id] = true;
                App.saveData.diamonds += ach.reward;
            }
        }
    },

    getAchievementProgress(achId) {
        const ach = this.achievements.find(a => a.id === achId);
        if (!ach) return 0;
        switch (ach.type) {
            case 'total_distance': return App.saveData.totalDistance;
            case 'total_coins': return App.saveData.totalCoins;
            case 'level': return App.saveData.level;
            case 'best_score': return App.saveData.bestScore;
            case 'total_games': return App.saveData.totalGames;
            case 'characters': return App.saveData.unlockedCharacters.length;
            case 'maps': return App.saveData.unlockedMaps.length;
        }
        return 0;
    }
};
