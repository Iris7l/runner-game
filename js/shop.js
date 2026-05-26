const Shop = {
    characters: [
        {
            id: 'xiaoming', name: '小明', desc: '默认男孩', gender: 'male',
            unlockType: 'free', unlockValue: 0,
            passiveType: null, passiveValue: 0,
            hairStyle: 'short',
            colors: { skin: '#FFD5B8', hair: '#4A3728', shirt: '#E94560', pants: '#2B4570', shoes: '#1A1A2E', eyes: '#2B2B2B' }
        },
        {
            id: 'xiaomei', name: '小美', desc: '默认女孩', gender: 'female',
            unlockType: 'coins', unlockValue: 500,
            passiveType: 'coins', passiveValue: 0.1,
            hairStyle: 'long',
            colors: { skin: '#FFE0CC', hair: '#8B4513', shirt: '#FF69B4', pants: '#4B0082', shoes: '#FF1493', eyes: '#2B2B2B' }
        },
        {
            id: 'ninja', name: '忍者', desc: '二段跳+15%', gender: 'male',
            unlockType: 'coins', unlockValue: 2000,
            passiveType: 'jump', passiveValue: 0.15,
            hairStyle: 'bandana',
            colors: { skin: '#FFD5B8', hair: '#1a1a1a', shirt: '#2a2a2a', pants: '#1a1a2e', shoes: '#333', eyes: '#2B2B2B' }
        },
        {
            id: 'sakura', name: '樱', desc: '护盾+2秒', gender: 'female',
            unlockType: 'coins', unlockValue: 3000,
            passiveType: 'shield', passiveValue: 2,
            hairStyle: 'ponytail',
            colors: { skin: '#FFE8D0', hair: '#FF6B9D', shirt: '#FFB7C5', pants: '#8B4585', shoes: '#C71585', eyes: '#FF69B4' }
        },
        {
            id: 'dragon', name: '龙骑士', desc: '冲刺+30%', gender: 'male',
            unlockType: 'level', unlockValue: 15,
            passiveType: 'dash', passiveValue: 0.3,
            hairStyle: 'spiky',
            colors: { skin: '#FFD5B8', hair: '#cc3300', shirt: '#aa2200', pants: '#661100', shoes: '#440000', eyes: '#ff6600' }
        },
        {
            id: 'luna', name: '露娜', desc: '体力消耗-1', gender: 'female',
            unlockType: 'distance', unlockValue: 50000,
            passiveType: 'stamina', passiveValue: 2,
            hairStyle: 'twintail',
            colors: { skin: '#F5E6D3', hair: '#6A5ACD', shirt: '#7B68EE', pants: '#483D8B', shoes: '#4B0082', eyes: '#9370DB' }
        }
    ],

    equipment: {
        head: [
            { id: 'cap_white', name: '棒球帽', slot: 'head', rarity: 'common', cost: 300, costType: 'coins', visual: 'cap', color: '#4488aa', statType: 'exp', statValue: 0.05, desc: '经验+5%' },
            { id: 'bunny_blue', name: '兔耳朵', slot: 'head', rarity: 'rare', cost: 1200, costType: 'coins', visual: 'bunny', color: '#88ccff', statType: 'exp', statValue: 0.12, desc: '经验+12%' },
            { id: 'crown_gold', name: '黄金王冠', slot: 'head', rarity: 'legendary', cost: 15, costType: 'diamonds', visual: 'crown', color: '#FFD700', statType: 'exp', statValue: 0.25, desc: '经验+25%' },
            { id: 'horns_red', name: '恶魔角', slot: 'head', rarity: 'legendary', cost: 20, costType: 'diamonds', visual: 'horns', color: '#8B0000', statType: 'exp', statValue: 0.3, desc: '经验+30%' }
        ],
        cape: [
            { id: 'cape_red', name: '红披风', slot: 'cape', rarity: 'common', cost: 400, costType: 'coins', visual: 'cape', color: '#cc2233', statType: 'jump', statValue: 0.05, desc: '跳跃+5%' },
            { id: 'wings_white', name: '天使翅膀', slot: 'cape', rarity: 'rare', cost: 1500, costType: 'coins', visual: 'wings', color: '#ddeeff', statType: 'jump', statValue: 0.12, desc: '跳跃+12%' },
            { id: 'flame_tail', name: '火焰尾', slot: 'cape', rarity: 'legendary', cost: 18, costType: 'diamonds', visual: 'flame', color: '#ff6600', statType: 'jump', statValue: 0.2, desc: '跳跃+20%' }
        ],
        shoes: [
            { id: 'sneakers', name: '运动鞋', slot: 'shoes', rarity: 'common', cost: 350, costType: 'coins', visual: 'sneaker', color: '#4488aa', statType: 'speed', statValue: 0.3, desc: '速度+0.3' },
            { id: 'spring_boots', name: '弹簧鞋', slot: 'shoes', rarity: 'rare', cost: 1300, costType: 'coins', visual: 'spring', color: '#44cc44', statType: 'speed', statValue: 0.6, desc: '速度+0.6' },
            { id: 'jet_boots', name: '喷气靴', slot: 'shoes', rarity: 'legendary', cost: 16, costType: 'diamonds', visual: 'jet', color: '#ff4400', statType: 'speed', statValue: 1.0, desc: '速度+1.0' }
        ],
        amulet: [
            { id: 'amulet_shield', name: '守护之符', slot: 'amulet', rarity: 'common', cost: 500, costType: 'coins', visual: 'amulet', color: '#44aaff', statType: 'shield_dur', statValue: 0.15, desc: '护盾+15%' },
            { id: 'amulet_magnet', name: '吸引之符', slot: 'amulet', rarity: 'rare', cost: 1400, costType: 'coins', visual: 'amulet', color: '#ff4466', statType: 'magnet_range', statValue: 0.3, desc: '磁铁范围+30%' },
            { id: 'amulet_fortune', name: '财富之符', slot: 'amulet', rarity: 'legendary', cost: 20, costType: 'diamonds', visual: 'amulet', color: '#FFD700', statType: 'coin_bonus', statValue: 0.25, desc: '金币+25%' }
        ]
    },

    getCharacterData(charId) {
        return this.characters.find(c => c.id === charId);
    },

    getEquipmentData(equipId) {
        for (const slot of Object.values(this.equipment)) {
            const item = slot.find(e => e.id === equipId);
            if (item) return item;
        }
        return null;
    },

    canBuyCharacter(charId) {
        const char = this.getCharacterData(charId);
        if (!char) return false;
        if (App.saveData.unlockedCharacters.includes(charId)) return false;
        switch (char.unlockType) {
            case 'free': return true;
            case 'coins': return App.saveData.coins >= char.unlockValue;
            case 'level': return App.saveData.level >= char.unlockValue;
            case 'map': return App.saveData.unlockedMaps.includes(char.unlockValue);
            case 'distance': return App.saveData.totalDistance >= char.unlockValue;
        }
        return false;
    },

    buyCharacter(charId) {
        const char = this.getCharacterData(charId);
        if (!char || !this.canBuyCharacter(charId)) return false;
        if (char.unlockType === 'coins') App.saveData.coins -= char.unlockValue;
        App.saveData.unlockedCharacters.push(charId);
        SaveManager.save(App.saveData);
        return true;
    },

    canBuyEquipment(equipId) {
        const item = this.getEquipmentData(equipId);
        if (!item) return false;
        if (App.saveData.ownedEquipment.includes(equipId)) return false;
        if (item.costType === 'coins') return App.saveData.coins >= item.cost;
        if (item.costType === 'diamonds') return App.saveData.diamonds >= item.cost;
        return false;
    },

    buyEquipment(equipId) {
        const item = this.getEquipmentData(equipId);
        if (!item || !this.canBuyEquipment(equipId)) return false;
        if (item.costType === 'coins') App.saveData.coins -= item.cost;
        else App.saveData.diamonds -= item.cost;
        App.saveData.ownedEquipment.push(equipId);
        SaveManager.save(App.saveData);
        return true;
    },

    equipItem(equipId) {
        const item = this.getEquipmentData(equipId);
        if (!item || !App.saveData.ownedEquipment.includes(equipId)) return false;
        App.saveData.equipment[item.slot] = equipId;
        SaveManager.save(App.saveData);
        return true;
    },

    unequipSlot(slot) {
        App.saveData.equipment[slot] = null;
        SaveManager.save(App.saveData);
    }
};
