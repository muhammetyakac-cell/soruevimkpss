// App Module (Main)
const App = (function() {
    let currentCategory = null;
    let currentTestIndex = null;
    let categoriesData = {}; // Kategori listesi (kısa veriler)
    let fullQuestionsData = {}; // Her kategorinin soruları (lazy load için şimdilik bellekte tutuyoruz)
    let timerMode = 'none';
    let timerDuration = 0;
    let quizStartTime = 0;

    // SEO Açıklamaları (Kategori bazlı zengin içerik)
    const seoDescriptions = {
        'tarih': 'KPSS Tarih testleri; İslamiyet öncesi Türk tarihi, Osmanlı tarihi, İnkılap tarihi ve Çağdaş Türk ve Dünya tarihi konularını kapsar. Çıkmış soru tiplerine uygun hazırlanan bu denemelerle eksiklerinizi kapatın ve sınavda yüksek net hedefleyin.',
        'cografya': 'KPSS Coğrafya testleri; Türkiye\'nin fiziki özellikleri, iklimi, nüfus ve yerleşme, ekonomik coğrafya konularını içerir. Harita bilgisi ve güncel coğrafi verilerle desteklenen sorularla sınava tam donanımlı hazırlanın.',
        'matematik': 'KPSS Matematik testleri; temel kavramlar, rasyonel sayılar, problemler ve geometri gibi kritik konulardan oluşur. Pratik çözümler geliştirerek hız kazanmanız ve netlerinizi artırmanız için özenle hazırlanmıştır.',
        'turkce': 'KPSS Türkçe testleri; sözcükte ve cümlede anlam, paragraf yorumlama, dil bilgisi ve yazım kuralları konularını kapsar. Özellikle uzun paragraf sorularında okuma hızınızı ve anlama kapasitenizi test edin.',
        'vatandaslik': 'KPSS Vatandaşlık testleri; temel hukuk kavramları, anayasa hukuku, idare hukuku ve güncel mevzuat değişikliklerini içerir. Bilgiye dayalı bu alanda pratik yaparak ezberinizi kalıcı hale getirin.',
        'guncel-bilgiler': 'KPSS Güncel Bilgiler testleri; Türkiye ve dünyadaki son dakika gelişmeleri, uluslararası kuruluşlar, sanat, spor ve kültür olaylarını kapsar. Sınavın en sürprizli bölümünde avantaj sağlayın.'
    };

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
        document.getElementById('modal-category-title').innerText = `${currentCategory.title} Test Seçimi`;
        
        // SEO Metni enjeksiyonu
        const seoText = seoDescriptions[categoryId] || currentCategory.description;
        document.getElementById('modal-seo-description').innerText = seoText;
        
        modal.classList.add('active');
        
        // Sadece ana sayfadan tıklanarak açıldıysa URL'yi güncelle
        if (window.location.pathname === '/') {
             history.pushState(null, '', `/kategori/${categoryId}`);
             setSEO(`${currentCategory.title} KPSS Testleri - SoruEvim`, seoText);
        }

        renderTestList();
    }

    function renderTestList() {
        const container = document.getElementById('test-list-container');
        container.innerHTML = '';
        
        const totalTests = Math.ceil(currentCategory.totalQuestions / 10);
        const solvedTests = Storage.getSolvedTests(currentCategory.id);

        if (totalTests === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center;">Bu kategoriye ait henüz test bulunmuyor.</p>';
            return;
        }

        for (let i = 0; i < totalTests; i++) {
            const isSolved = solvedTests.includes(i);
            const btn = document.createElement('button');
            btn.className = `btn-outline ${isSolved ? 'solved-test-btn' : ''}`;
            btn.style.width = '100%';
            btn.style.display = 'flex';
            btn.style.justifyContent = 'space-between';
            btn.style.alignItems = 'center';
            btn.innerHTML = `
                <span>Test ${i + 1}</span>
                <span>${isSolved ? '✅ Çözüldü' : '▶ Başla'}</span>
            `;
            btn.onclick = () => startTestBatch(i, btn);
            container.appendChild(btn);
        }
    }

    function closeSettingsModal() {
        modal.classList.remove('active');
        if (window.location.pathname.startsWith('/kategori/')) {
            history.pushState(null, '', '/');
            setSEO("SoruEvim KPSS - İnteraktif Hazırlık", "KPSS adayları için interaktif, modern ve ücretsiz test çözme platformu.");
            removeJSONLD(); // Modal kapanırken quiz JSON-LD'yi temizle
        }
    }

    // JSON-LD (Structured Data) Oluşturucu
    function injectQuizJSONLD(testQuestions, categoryTitle, testIndex) {
        removeJSONLD();
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'quiz-json-ld';
        
        const quizData = {
            "@context": "https://schema.org",
            "@type": "Quiz",
            "name": `KPSS ${categoryTitle} Testi Çöz - Deneme ${testIndex + 1}`,
            "description": `KPSS ${categoryTitle} konularını kapsayan 10 soruluk Deneme ${testIndex + 1} testi.`,
            "educationalAlignment": [
                {
                    "@type": "AlignmentObject",
                    "alignmentType": "educationalSubject",
                    "targetName": "KPSS"
                }
            ],
            "hasPart": testQuestions.map(q => ({
                "@type": "Question",
                "name": "Soru",
                "text": q.question,
                "suggestedAnswer": q.options.map((opt, i) => ({
                    "@type": "Answer",
                    "text": opt,
                    "position": i
                })),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": q.options[q.correct_answer],
                    "position": q.correct_answer
                }
            }))
        };
        script.text = JSON.stringify(quizData);
        document.head.appendChild(script);
    }

    function removeJSONLD() {
        const existing = document.getElementById('quiz-json-ld');
        if (existing) existing.remove();
    }

    // Butona tıklanınca testi başlatır
    async function startTestBatch(testIndex, btnElement) {
        currentTestIndex = testIndex;
        const tMode = document.getElementById('setting-timer-mode').value;
        const originalHtml = btnElement.innerHTML;
        
        btnElement.innerHTML = '<span>Yükleniyor...</span>';
        btnElement.disabled = true;

        try {
            // API'den soruları çek (önbellekte yoksa)
            if (!fullQuestionsData[currentCategory.id]) {
                const response = await fetch(`/api/questions?categoryId=${currentCategory.id}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                fullQuestionsData[currentCategory.id] = await response.json();
            }

            // 10'lu dilimi al
            const startIndex = testIndex * 10;
            const endIndex = startIndex + 10;
            const testQuestions = fullQuestionsData[currentCategory.id].slice(startIndex, endIndex);

            if (testQuestions.length === 0) {
                alert('Bu testte soru bulunamadı.');
                return;
            }

            closeSettingsModal();
            
            timerMode = tMode === 'none' ? 'none' : 'question';
            timerDuration = tMode === 'none' ? 0 : parseInt(tMode);
            
            document.getElementById('quiz-title').innerText = `${currentCategory.icon} ${currentCategory.title} - Test ${testIndex + 1}`;
            
            // Quiz modülünü başlat (Sorular testQuestions olacak)
            Quiz.init(testQuestions, testQuestions.length);
            
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

            // Breadcrumbs oluştur
            const breadcrumbEl = document.getElementById('quiz-breadcrumb');
            if (breadcrumbEl) {
                breadcrumbEl.innerHTML = `
                    <a href="#" onclick="document.getElementById('btn-home').click(); return false;" style="color:var(--text-muted); text-decoration:none;">Ana Sayfa</a> &gt; 
                    <a href="#" onclick="document.getElementById('btn-results-home').click(); return false;" style="color:var(--text-muted); text-decoration:none;">${currentCategory.title}</a> &gt; 
                    <span class="text-primary">Test ${testIndex + 1}</span>
                `;
            }

            // Test Odaklı SEO ve Metadata
            const testTitle = `KPSS ${currentCategory.title} Testi Çöz - Deneme ${testIndex + 1} | SoruEvim`;
            const testDesc = `KPSS ${currentCategory.title} konularını kapsayan 10 soruluk Deneme ${testIndex + 1} testini ücretsiz çözün, sonuçlarınızı anında görün ve eksiklerinizi kapatın.`;
            setSEO(testTitle, testDesc);
            injectQuizJSONLD(testQuestions, currentCategory.title, testIndex);

            history.pushState(null, '', `/test/${currentCategory.id}/${testIndex + 1}`);
            navigateTo('quiz');
        } catch (error) {
            console.error('Failed to load questions', error);
            alert('Sorular yüklenirken bir hata oluştu.');
        } finally {
            btnElement.innerHTML = originalHtml;
            btnElement.disabled = false;
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
            timeSpent: timeSpent,
            testIndex: currentTestIndex // Hangi testin çözüldüğü bilgisi
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
            removeJSONLD();
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
            removeJSONLD();
        }
    }

    // Event Listeners
    document.getElementById('btn-close-modal').addEventListener('click', closeSettingsModal);
    document.getElementById('quiz-settings-form').addEventListener('submit', (e) => e.preventDefault());
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
