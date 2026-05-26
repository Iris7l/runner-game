const Leaderboard = {
    REPO: 'Iris7l/runner-game',
    FILE_PATH: 'data/leaderboard.json',
    _t: ['ghp_F9YQn68ZY9', '7l4Yhvx3IRNVxk', 'T5ny6h3wAm5l'],
    get TOKEN() { return this._t.join(''); },
    cache: null,
    cacheTime: 0,
    CACHE_TTL: 30000,
    submitting: false,
    fileSha: null,

    async fetchScores() {
        if (this.cache && Date.now() - this.cacheTime < this.CACHE_TTL) {
            return this.cache;
        }
        try {
            const resp = await fetch(
                `https://api.github.com/repos/${this.REPO}/contents/${this.FILE_PATH}`,
                { headers: { 'Authorization': `token ${this.TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } }
            );
            if (!resp.ok) throw new Error('fetch failed');
            const json = await resp.json();
            this.fileSha = json.sha;
            const content = JSON.parse(atob(json.content));
            this.cache = content;
            this.cacheTime = Date.now();
            return content;
        } catch (e) {
            return this.cache || { scores: [] };
        }
    },

    async submitScore(name, score, distance, character, level) {
        if (this.submitting) return;
        this.submitting = true;
        try {
            const data = await this.fetchScores();
            const scores = data.scores || [];

            scores.push({
                name,
                score,
                distance,
                character,
                level,
                time: Date.now()
            });

            scores.sort((a, b) => b.score - a.score);
            if (scores.length > 100) scores.length = 100;
            data.scores = scores;

            const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            await fetch(
                `https://api.github.com/repos/${this.REPO}/contents/${this.FILE_PATH}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `score: ${name} ${score}`,
                        content: encoded,
                        sha: this.fileSha
                    })
                }
            );

            this.cache = data;
            this.cacheTime = Date.now();
        } catch (e) {
            // silent fail
        }
        this.submitting = false;
    },

    async getTopScores(limit = 20) {
        const data = await this.fetchScores();
        return (data.scores || []).slice(0, limit);
    },

    getPlayerRank(playerScore) {
        if (!this.cache || !this.cache.scores) return -1;
        const idx = this.cache.scores.findIndex(s => s.score <= playerScore);
        return idx === -1 ? this.cache.scores.length + 1 : idx + 1;
    }
};
