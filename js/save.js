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
                return { ...this.defaultData(), ...data };
            }
        } catch (e) {}
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
