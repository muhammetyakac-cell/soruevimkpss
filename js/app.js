// App Module (Main)
const App = (function() {
    let currentCategory = null;
    let categoriesData = {}; // Kategori listesi (kısa veriler)
    let fullQuestionsData = {}; // Her kategorinin soruları (lazy load için şimdilik bellekte tutuyoruz)
    let timerMode = 'none';
    let timerDuration = 0;
    let quizStartTime = 0;

    // DOM Elements
    const sections = {
        home: document.getElementById('home'),
        quiz: document.getElementById('quiz'),
        results: document.getElementById('results')
    };

    const modal = document.getElementById('settings-modal');
    const categoriesGrid = document.getElementById('categories-grid');

    async function loadData() {
        const files = ['turkce', 'matematik', 'tarih', 'cografya', 'vatandaslik', 'guncel'];
        
        for (const file of files) {
            try {
                const response = await fetch(`data/${file}.json`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                
                categoriesData[data.id] = {
                    id: data.id,
                    title: data.category,
                    icon: data.icon,
                    description: data.description,
                    totalQuestions: data.questions.length
                };
                
                fullQuestionsData[data.id] = data.questions;
            } catch (error) {
                console.error(`Failed to load ${file}.json`, error);
            }
        }
        
        updateHomeUI();
    }

    function updateHomeUI() {
        // Global Stats
        const stats = Storage.getGlobalStats();
        
        // Eğer stat elementi null dönüyorsa HTML'de hata var demektir, kontrol ediyoruz
        const totalSolvedEl = document.getElementById('global-total-solved');
        const successRateEl = document.getElementById('global-success-rate');
        
        if (totalSolvedEl) totalSolvedEl.innerText = stats.totalSolved;
        if (successRateEl) {
            const rate = stats.totalSolved > 0 
                ? Math.round((stats.totalCorrect / stats.totalSolved) * 100) 
                : 0;
            successRateEl.innerText = `%${rate}`;
        }

        // Categories Grid
        if (!categoriesGrid) return;
        categoriesGrid.innerHTML = '';
        
        Object.values(categoriesData).forEach(cat => {
            const catStats = Storage.getCategoryStats(cat.id);
            const card = document.createElement('div');
            card.className = 'glass-card category-card';
            card.onclick = () => openSettingsModal(cat.id);
            
            card.innerHTML = `
                <div class="category-icon">${cat.icon}</div>
                <h3 class="category-title">${cat.title}</h3>
                <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1rem;">${cat.description}</p>
                <div class="category-meta">
                    <span>${cat.totalQuestions} Soru</span>
                    <span class="text-primary">En Yüksek: ${catStats.highestScore} Puan</span>
                </div>
            `;
            categoriesGrid.appendChild(card);
        });
    }

    function navigateTo(sectionId) {
        Object.values(sections).forEach(sec => sec.classList.remove('active'));
        if (sections[sectionId]) {
            sections[sectionId].classList.add('active');
            window.scrollTo(0,0);
        }
    }

    function openSettingsModal(categoryId) {
        currentCategory = categoriesData[categoryId];
        document.getElementById('modal-category-title').innerText = `${currentCategory.title} Testi Ayarları`;
        modal.classList.add('active');
    }

    function closeSettingsModal() {
        modal.classList.remove('active');
    }

    function startQuiz(e) {
        e.preventDefault();
        closeSettingsModal();
        
        const qCount = document.getElementById('setting-question-count').value;
        const tMode = document.getElementById('setting-timer-mode').value;
        
        timerMode = tMode === 'none' ? 'none' : 'question';
        timerDuration = tMode === 'none' ? 0 : parseInt(tMode);
        
        document.getElementById('quiz-title').innerText = `${currentCategory.icon} ${currentCategory.title} Testi`;
        
        // Quiz modülünü başlat
        Quiz.init(fullQuestionsData[currentCategory.id], qCount);
        
        // Timer'ı başlat
        quizStartTime = Date.now();
        const timerUI = document.getElementById('quiz-timer');
        const timerText = document.getElementById('timer-text');
        
        Timer.start(timerMode, timerDuration, 
            (secLeft, formatted) => {
                timerText.innerText = formatted;
                if (timerMode !== 'none' && secLeft <= 10) {
                    timerUI.classList.add('warning');
                } else {
                    timerUI.classList.remove('warning');
                }
            },
            () => {
                // Timeout handler
                Quiz.handleTimeout();
            }
        );

        navigateTo('quiz');
    }

    function finishQuiz() {
        Timer.stop();
        
        const results = Quiz.getResults();
        const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
        
        // Sonuçları Storage'a kaydet
        Storage.saveTestResult(currentCategory.id, {
            total: results.total,
            correct: results.correct,
            wrong: results.wrong,
            empty: results.empty,
            timeSpent: timeSpent
        });
        
        // UI Güncelle
        const score = Math.round((results.correct / results.total) * 100);
        document.getElementById('result-score').innerText = score;
        document.getElementById('result-correct').innerText = results.correct;
        document.getElementById('result-wrong').innerText = results.wrong;
        document.getElementById('result-empty').innerText = results.empty;
        
        updateHomeUI(); // Ana sayfadaki istatistikleri güncelle (arkaplanda)
        navigateTo('results');
    }

    function quitQuiz() {
        if(confirm("Testten çıkmak istediğinize emin misiniz? İlerlemeniz kaydedilmeyecek.")) {
            Timer.stop();
            navigateTo('home');
        }
    }

    // Event Listeners
    document.getElementById('btn-close-modal').addEventListener('click', closeSettingsModal);
    document.getElementById('quiz-settings-form').addEventListener('submit', startQuiz);
    document.getElementById('btn-quit-quiz').addEventListener('click', quitQuiz);
    document.getElementById('btn-restart-quiz').addEventListener('click', () => openSettingsModal(currentCategory.id));
    
    // Setup routing based on hash (simple router)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        if (['home', 'quiz', 'results'].includes(hash)) {
            // Eğer quize dışarıdan manuel girmeye çalışırsa engelle
            if (hash === 'quiz' && !currentCategory) {
                window.location.hash = 'home';
                return;
            }
            if (hash === 'home') navigateTo('home');
        }
    });

    // Init
    window.addEventListener('DOMContentLoaded', () => {
        loadData();
    });

    return {
        getTimerMode: () => timerMode,
        getTimerDuration: () => timerDuration,
        finishQuiz
    };
})();
