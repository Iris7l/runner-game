const Progression = {
    MAX_LEVEL: 50,

    getExpForLevel(level) {
        return Math.floor(100 * level * 1.3);
    },

    addExp(amount) {
        if (!amount || amount <= 0 || isNaN(amount)) return;
        const skills = App.saveData.skills || {};
        const expBonus = 1 + (skills.exp_bonus || 0) * 0.1;
        const equipHead = App.saveData.equipment.head;
        let equipMult = 0;
        if (equipHead) {
            const item = Shop.getEquipmentData(equipHead);
            if (item && item.statType === 'exp') equipMult = item.statValue;
        }
        amount = Math.floor(amount * expBonus * (1 + equipMult));
        if (isNaN(amount) || amount <= 0) return;

        App.saveData.exp += amount;
        let safetyCounter = 0;
        while (App.saveData.level < this.MAX_LEVEL && safetyCounter < 50) {
            safetyCounter++;
            const needed = this.getExpForLevel(App.saveData.level);
            if (needed <= 0 || isNaN(needed)) break;
            if (App.saveData.exp >= needed) {
                App.saveData.exp -= needed;
                App.saveData.level++;
                this.onLevelUp(App.saveData.level);
            } else {
                break;
            }
        }
    },

    onLevelUp(newLevel) {
        App.saveData.skillPoints += 1;
        App.saveData.coins += newLevel * 50;
        if (newLevel % 5 === 0) App.saveData.diamonds += 2;
        App.saveData.stamina = App.getMaxStamina();

        this.checkMapUnlocks(newLevel);
        this.checkCharacterUnlocks(newLevel);
    },

    checkMapUnlocks(level) {
        for (const [id, map] of Object.entries(Maps.data)) {
            if (map.unlockType === 'level' && level >= map.unlockLevel) {
                if (!App.saveData.unlockedMaps.includes(id)) {
                    App.saveData.unlockedMaps.push(id);
                }
            }
        }
    },

    checkCharacterUnlocks(level) {
        for (const char of Shop.characters) {
            if (char.unlockType === 'level' && level >= char.unlockValue) {
                if (!App.saveData.unlockedCharacters.includes(char.id)) {
                    App.saveData.unlockedCharacters.push(char.id);
                }
            }
        }
    },

    getExpProgress() {
        if (App.saveData.level >= this.MAX_LEVEL) return 1;
        const needed = this.getExpForLevel(App.saveData.level);
        return App.saveData.exp / needed;
    }
};
