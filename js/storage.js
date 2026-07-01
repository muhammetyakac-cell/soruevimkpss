// LocalStorage Module
const Storage = (function() {
    const STORAGE_KEY = 'soruevim_kpss_data';

    // Default veriler
    const defaultData = {
        global: {
            totalSolved: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalTimeSeconds: 0
        },
        history: [], // Son çözülen testler
        categories: {
            // Örnek: 'turkce': { solved: 50, correct: 40, highestScore: 100 }
        },
        solvedTests: {
            // Örnek: 'turkce': [0, 1, 2] (Çözülen test indexleri)
        }
    };

    function getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return defaultData;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Storage parse error:', e);
            return defaultData;
        }
    }

    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return {
        getGlobalStats: function() {
            return getData().global;
        },
        
        getCategoryStats: function(categoryId) {
            const data = getData();
            return data.categories[categoryId] || { solved: 0, correct: 0, highestScore: 0 };
        },

        saveTestResult: function(categoryId, result) {
            const data = getData();
            
            // Global güncelle
            data.global.totalSolved += (result.correct + result.wrong);
            data.global.totalCorrect += result.correct;
            data.global.totalWrong += result.wrong;
            data.global.totalTimeSeconds += result.timeSpent;

            // Kategori güncelle
            if (!data.categories[categoryId]) {
                data.categories[categoryId] = { solved: 0, correct: 0, highestScore: 0 };
            }
            
            const catStat = data.categories[categoryId];
            catStat.solved += (result.correct + result.wrong);
            catStat.correct += result.correct;
            
            // Yüz üzerinden skor hesapla
            const score = Math.round((result.correct / result.total) * 100);
            if (score > catStat.highestScore) {
                catStat.highestScore = score;
            }

            // Geçmişe ekle (son 10 test)
            data.history.unshift({
                categoryId: categoryId,
                date: new Date().toISOString(),
                score: score,
                correct: result.correct,
                wrong: result.wrong
            });

            if (data.history.length > 10) {
                data.history.pop();
            }

            // Testi çözüldü olarak işaretle
            if (result.testIndex !== undefined) {
                if (!data.solvedTests) data.solvedTests = {};
                if (!data.solvedTests[categoryId]) data.solvedTests[categoryId] = [];
                if (!data.solvedTests[categoryId].includes(result.testIndex)) {
                    data.solvedTests[categoryId].push(result.testIndex);
                }
            }

            saveData(data);
        },
        
        getSolvedTests: function(categoryId) {
            const data = getData();
            if (!data.solvedTests) return [];
            return data.solvedTests[categoryId] || [];
        }
    };
})();
