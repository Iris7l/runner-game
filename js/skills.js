const Skills = {
    tree: {
        speed: [
            { id: 'speed_boost', name: '加速跑', maxLevel: 5, cost: [100, 200, 400, 800, 1600], desc: '基础速度+0.3/级' },
            { id: 'dash', name: '冲刺', maxLevel: 3, cost: [300, 600, 1200], desc: '冲刺持续+30%/级', requires: 'speed_boost:2' },
            { id: 'hyperspeed', name: '极速模式', maxLevel: 1, cost: [3000], desc: '速度上限提升20%', requires: 'dash:2' },
            { id: 'time_slow', name: '时间减缓', maxLevel: 1, cost: [5000], desc: '障碍物间距增大15%', requires: 'hyperspeed:1' }
        ],
        defense: [
            { id: 'iron_wall', name: '铁壁', maxLevel: 5, cost: [100, 200, 400, 800, 1600], desc: '碰撞后无敌+0.5秒/级' },
            { id: 'revive', name: '复活', maxLevel: 3, cost: [500, 1000, 2000], desc: '每局可复活1次，复活血量+', requires: 'iron_wall:2' },
            { id: 'shield_ext', name: '护盾延长', maxLevel: 3, cost: [400, 800, 1600], desc: '护盾持续+2秒/级', requires: 'iron_wall:3' },
            { id: 'invincible_star', name: '无敌星', maxLevel: 1, cost: [5000], desc: '每局开始无敌3秒', requires: 'shield_ext:2' }
        ],
        collect: [
            { id: 'magnet', name: '磁铁', maxLevel: 5, cost: [100, 200, 400, 800, 1600], desc: '磁铁持续+1秒/级' },
            { id: 'coin_mult', name: '金币倍率', maxLevel: 5, cost: [150, 300, 600, 1200, 2400], desc: '金币获取+15%/级' },
            { id: 'chest_luck', name: '宝箱运', maxLevel: 3, cost: [400, 800, 1600], desc: '宝箱出现率+20%/级', requires: 'coin_mult:2' },
            { id: 'exp_bonus', name: '经验加成', maxLevel: 3, cost: [300, 600, 1200], desc: '经验获取+10%/级', requires: 'magnet:3' }
        ]
    },

    canUpgrade(skillId) {
        const skill = this.findSkill(skillId);
        if (!skill) return { can: false, reason: '技能不存在' };

        const currentLevel = App.saveData.skills[skillId] || 0;
        if (currentLevel >= skill.maxLevel) return { can: false, reason: '已满级' };

        if (skill.requires) {
            const [reqId, reqLv] = skill.requires.split(':');
            const reqLevel = App.saveData.skills[reqId] || 0;
            if (reqLevel < parseInt(reqLv)) {
                const reqSkill = this.findSkill(reqId);
                return { can: false, reason: `需要 ${reqSkill.name} Lv${reqLv}` };
            }
        }

        if (App.saveData.skillPoints < 1) return { can: false, reason: '技能点不足' };
        const cost = skill.cost[currentLevel];
        if (App.saveData.coins < cost) return { can: false, reason: `金币不足(需${cost})` };

        return { can: true, cost };
    },

    upgrade(skillId) {
        const check = this.canUpgrade(skillId);
        if (!check.can) return false;

        const skill = this.findSkill(skillId);
        const currentLevel = App.saveData.skills[skillId] || 0;
        const cost = skill.cost[currentLevel];

        App.saveData.skillPoints -= 1;
        App.saveData.coins -= cost;
        App.saveData.skills[skillId] = currentLevel + 1;
        SaveManager.save(App.saveData);
        return true;
    },

    findSkill(skillId) {
        for (const branch of Object.values(this.tree)) {
            for (const skill of branch) {
                if (skill.id === skillId) return skill;
            }
        }
        return null;
    },

    getSkillLevel(skillId) {
        return App.saveData.skills[skillId] || 0;
    }
};
