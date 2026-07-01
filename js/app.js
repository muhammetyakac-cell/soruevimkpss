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
        try {
            const response = await fetch('/api/questions?type=categories');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            data.forEach(cat => {
                categoriesData[cat.category_id] = {
                    id: cat.category_id,
                    title: cat.title,
                    icon: cat.icon,
                    description: cat.description,
                    totalQuestions: cat.totalQuestions
                };
            });
            updateHomeUI();
        } catch (error) {
            console.error('Failed to load categories', error);
            document.getElementById('categories-grid').innerHTML = '<p style="text-align:center;color:var(--error);">Kategoriler yüklenemedi. Sunucu bağlantısı kurulamıyor olabilir.</p>';
        }
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
        
        // Sadece ana sayfadan tıklanarak açıldıysa URL'yi güncelle
        if (window.location.pathname === '/') {
             history.pushState(null, '', `/kategori/${categoryId}`);
             setSEO(`${currentCategory.title} KPSS Testleri - SoruEvim`, currentCategory.description);
        }
    }

    function closeSettingsModal() {
        modal.classList.remove('active');
        if (window.location.pathname.startsWith('/kategori/')) {
            history.pushState(null, '', '/');
            setSEO("SoruEvim KPSS - İnteraktif Hazırlık", "KPSS adayları için interaktif, modern ve ücretsiz test çözme platformu.");
        }
    }

    async function startQuiz(e) {
        e.preventDefault();
        
        const qCount = document.getElementById('setting-question-count').value;
        const tMode = document.getElementById('setting-timer-mode').value;
        const submitBtn = document.querySelector('#quiz-settings-form button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Yükleniyor...';
        submitBtn.disabled = true;

        try {
            // API'den soruları çek (önbellekte yoksa)
            if (!fullQuestionsData[currentCategory.id]) {
                const response = await fetch(`/api/questions?categoryId=${currentCategory.id}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                fullQuestionsData[currentCategory.id] = await response.json();
            }

            closeSettingsModal();
            
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

            history.pushState(null, '', `/test/${currentCategory.id}`);
            navigateTo('quiz');
        } catch (error) {
            console.error('Failed to load questions', error);
            alert('Sorular yüklenirken bir hata oluştu.');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
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
        history.pushState(null, '', `/sonuclar`);
        navigateTo('results');
    }

    function quitQuiz() {
        if(confirm("Testten çıkmak istediğinize emin misiniz? İlerlemeniz kaydedilmeyecek.")) {
            Timer.stop();
            history.pushState(null, '', '/');
            route();
        }
    }

    function setSEO(title, description) {
        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute("content", description);
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
        document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    }

    function route() {
        const path = window.location.pathname;
        if (path.startsWith('/kategori/')) {
            const catId = path.replace('/kategori/', '');
            if (categoriesData[catId]) {
                openSettingsModal(catId);
                navigateTo('home'); // modal home üstünde açılır
                
                // SEO Update
                setSEO(`${categoriesData[catId].title} KPSS Testleri - SoruEvim`, categoriesData[catId].description);
            } else {
                navigateTo('home');
            }
        } else if (path.startsWith('/test/')) {
            // Eğer testte değilse ana sayfaya dön (refresh durumu)
            if (!currentCategory) {
                history.replaceState(null, '', '/');
                navigateTo('home');
            }
        } else if (path === '/sonuclar') {
            if (!currentCategory) {
                history.replaceState(null, '', '/');
                navigateTo('home');
            } else {
                navigateTo('results');
            }
        } else {
            navigateTo('home');
            setSEO("SoruEvim KPSS - İnteraktif Hazırlık", "KPSS adayları için interaktif, modern ve ücretsiz test çözme platformu.");
        }
    }

    // Event Listeners
    document.getElementById('btn-close-modal').addEventListener('click', closeSettingsModal);
    document.getElementById('quiz-settings-form').addEventListener('submit', startQuiz);
    document.getElementById('btn-quit-quiz').addEventListener('click', quitQuiz);
    document.getElementById('btn-restart-quiz').addEventListener('click', () => {
        history.pushState(null, '', `/kategori/${currentCategory.id}`);
        openSettingsModal(currentCategory.id);
    });
    
    // Link overrides for SPA routing
    document.getElementById('btn-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '/');
        route();
    });
    
    document.getElementById('btn-results-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '/');
        route();
    });

    document.querySelector('.logo')?.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '/');
        route();
    });

    window.addEventListener('popstate', route);

    // Init
    window.addEventListener('DOMContentLoaded', async () => {
        await loadData();
        route(); // Initial route
    });

    return {
        getTimerMode: () => timerMode,
        getTimerDuration: () => timerDuration,
        finishQuiz
    };
})();
