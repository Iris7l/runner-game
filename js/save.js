const SaveManager = {
    SAVE_KEY: 'runner_save_v2',

    defaultData() {
        return {
            playerName: '',
            level: 1,
            exp: 0,
            coins: 0,
            diamonds: 0,
            totalDistance: 0,
            totalCoins: 0,
            totalGames: 0,
            bestScore: 0,
            bestDistance: 0,
            stamina: 10,
            lastStaminaTime: Date.now(),
            selectedCharacter: 'xiaoming',
            unlockedCharacters: ['xiaoming'],
            equipment: { head: null, cape: null, shoes: null, amulet: null },
            ownedEquipment: [],
            skills: {},
            skillPoints: 0,
            unlockedMaps: ['city'],
            selectedMap: 'city',
            mapBestScores: {},
            achievements: {},
            dailyMissions: [],
            dailyMissionDate: '',
            dailyMissionProgress: {},
            settings: { sound: true, vibration: true }
        };
    },

    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                const merged = { ...this.defaultData(), ...data };
                // Fix stale character references from older versions
                const validChars = ['xiaoming', 'xiaomei', 'ninja', 'sakura', 'dragon', 'luna'];
                if (!validChars.includes(merged.selectedCharacter)) {
                    merged.selectedCharacter = 'xiaoming';
                }
                merged.unlockedCharacters = merged.unlockedCharacters.filter(c => validChars.includes(c));
                if (!merged.unlockedCharacters.includes('xiaoming')) {
                    merged.unlockedCharacters.push('xiaoming');
                }
                // Ensure arrays exist
                if (!Array.isArray(merged.dailyMissions)) merged.dailyMissions = [];
                if (!Array.isArray(merged.ownedEquipment)) merged.ownedEquipment = [];
                if (!Array.isArray(merged.unlockedMaps)) merged.unlockedMaps = ['city'];
                if (typeof merged.skills !== 'object' || merged.skills === null) merged.skills = {};
                if (typeof merged.achievements !== 'object' || merged.achievements === null) merged.achievements = {};
                if (typeof merged.dailyMissionProgress !== 'object' || merged.dailyMissionProgress === null) merged.dailyMissionProgress = {};
                return merged;
            }
        } catch (e) {
            localStorage.removeItem(this.SAVE_KEY);
        }
        return this.defaultData();
    },

    save(data) {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
        } catch (e) {}
    },

    reset() {
        localStorage.removeItem(this.SAVE_KEY);
        return this.defaultData();
    }
};
