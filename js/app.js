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
        results: document.getElementById('results'),
        'category-page': document.getElementById('category-page'),
        'blog-page': document.getElementById('blog-page'),
        'blog-article': document.getElementById('blog-article')
    };

    // Blog Makaleleri
    const blogArticles = {
        'kpss-tarih-nasil-calisilir': {
            title: "KPSS Tarih Nasıl Çalışılır? (2024 Güncel Taktikler)",
            desc: "Tarih dersini ezberlemeden, mantığını kavrayarak nasıl full çekebilirsiniz?",
            content: `
                <h2 style="color:var(--primary-color); margin-bottom:1rem;">KPSS Tarih: Ezberlemeden Başarmak</h2>
                <p style="margin-bottom:1rem;">Tarih pek çok aday için ezber yığını gibi görünür. Ancak olaylar arası sebep-sonuç ilişkisini kurduğunuzda aslında çok mantıklı bir hikaye okuduğunuzu fark edersiniz.</p>
                <h3 style="margin-bottom:0.5rem; margin-top:1.5rem;">1. Kronolojiye Hakim Olun</h3>
                <p style="margin-bottom:1rem;">Olayların tarihini gün gün ezberlemek yerine, hangi padişahın hangi dönemde yaşadığını ve o dönemin ruhunu bilmek çok daha önemlidir.</p>
                <h3 style="margin-bottom:0.5rem; margin-top:1.5rem;">2. Harita Bilgisi</h3>
                <p style="margin-bottom:1rem;">Özellikle Osmanlı'nın duraklama ve gerileme dönemlerindeki antlaşmalar harita üzerinden çalışıldığında akılda daha kalıcı olur.</p>
                <h3 style="margin-bottom:0.5rem; margin-top:1.5rem;">3. Bol Soru Çözün</h3>
                <p style="margin-bottom:1rem;">Konuyu ne kadar iyi bilirseniz bilin, ÖSYM'nin soru tarzını görmek için bol bol çıkmış soru ve deneme çözmelisiniz. SoruEvim üzerinden ücretsiz Tarih testlerine göz atabilirsiniz.</p>
            `
        },
        'kpss-deneme-cozmenin-onemi': {
            title: "Günde Kaç KPSS Denemesi Çözmelisiniz?",
            desc: "Sınava aylar kala deneme çözme sıklığınızı nasıl ayarlamalısınız?",
            content: `
                <h2 style="color:var(--primary-color); margin-bottom:1rem;">Deneme Çözmek Neden Önemli?</h2>
                <p style="margin-bottom:1rem;">Birçok aday konu çalışmayı bitirmeden deneme çözmeye başlamaz. Bu büyük bir hatadır! Sınav stresini yönetmek, süreyi efektif kullanmak için erken deneme çözümü şarttır.</p>
                <h3 style="margin-bottom:0.5rem; margin-top:1.5rem;">Yanlış Defteri Tutun</h3>
                <p style="margin-bottom:1rem;">Her deneme sonrası yanlış yaptığınız veya boş bıraktığınız soruları bir deftere kaydedin. Bu defter, sınava son bir ay kala en değerli kaynağınız olacak.</p>
            `
        }
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
            card.onclick = () => openCategoryPage(cat.id);
            
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

    async function openCategoryPage(categoryId) {
        currentCategory = categoriesData[categoryId];
        
        // SEO Metni enjeksiyonu
        const seoText = seoDescriptions[categoryId] || currentCategory.description;
        document.getElementById('page-category-title').innerText = `${currentCategory.icon} ${currentCategory.title} Testleri`;
        document.getElementById('page-seo-description').innerText = seoText;
        
        const breadcrumbEl = document.getElementById('cat-breadcrumb');
        if(breadcrumbEl) {
            breadcrumbEl.innerHTML = `
                <a href="#" onclick="document.getElementById('btn-home').click(); return false;" style="color:var(--text-muted); text-decoration:none;">Ana Sayfa</a> &gt; 
                <span class="text-primary">${currentCategory.title}</span>
            `;
        }

        navigateTo('category-page');
        
        // Sadece ana sayfadan tıklanarak açıldıysa veya doğrudan gelindiyse URL'yi güncelle
        if (window.location.pathname === '/' || window.location.pathname.startsWith('/kategori/')) {
             history.pushState(null, '', `/kategori/${categoryId}`);
             setSEO(`${currentCategory.title} KPSS Testleri - SoruEvim`, seoText, `https://soruevimkpss.vercel.app/kategori/${categoryId}`);
        }

        await renderTestList();
    }

    async function renderTestList() {
        const container = document.getElementById('page-test-list-container');
        container.innerHTML = '<p class="text-muted">Testler yükleniyor...</p>';
        
        // API'den soruları çek (önbellekte yoksa)
        if (!fullQuestionsData[currentCategory.id]) {
            try {
                const response = await fetch(`/api/questions?categoryId=${currentCategory.id}`);
                if (response.ok) {
                    fullQuestionsData[currentCategory.id] = await response.json();
                }
            } catch (e) {
                console.error("Sorular yüklenemedi", e);
            }
        }

        const totalTests = Math.ceil(currentCategory.totalQuestions / 10);
        const solvedTests = Storage.getSolvedTests(currentCategory.id);

        if (totalTests === 0) {
            container.innerHTML = '<p class="text-muted">Bu kategoriye ait henüz test bulunmuyor.</p>';
            return;
        }

        container.innerHTML = '';
        for (let i = 0; i < totalTests; i++) {
            const isSolved = solvedTests.includes(i);
            const startIndex = i * 10;
            const testQuestions = fullQuestionsData[currentCategory.id]?.slice(startIndex, startIndex + 10) || [];
            
            // Soru önizlemesi (Snippet)
            let previewText = "Sorular yükleniyor...";
            if(testQuestions.length > 0) {
                previewText = testQuestions[0].question.substring(0, 80) + '...';
            }

            const card = document.createElement('div');
            card.className = `glass-card ${isSolved ? 'solved-test-btn' : ''}`;
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';
            card.style.cursor = 'pointer';
            card.style.padding = '1.2rem';
            
            card.innerHTML = `
                <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <h4 style="margin:0;">Test ${i + 1}</h4>
                        <span style="font-size:0.8rem; color:var(--text-muted);">${testQuestions.length} Soru</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem; font-style:italic;">"${previewText}"</p>
                </div>
                <button class="btn-primary" style="width:100%; padding:0.6rem; ${isSolved ? 'background:var(--success);border-color:var(--success);' : ''}">
                    ${isSolved ? '✅ Çözüldü' : '▶ Başla'}
                </button>
            `;
            
            card.onclick = () => startTestBatch(i, card.querySelector('button'));
            container.appendChild(card);
        }
    }

    function openBlogList() {
        navigateTo('blog-page');
        setSEO("KPSS Rehberliği ve Blog - SoruEvim", "KPSS sınav taktikleri, çalışma programları, deneme çözme yöntemleri ve güncel duyurular.", "https://soruevimkpss.vercel.app/blog");
    }

    function openArticle(slug) {
        const article = blogArticles[slug];
        if(!article) {
            navigateTo('blog-page');
            return;
        }

        const breadcrumbEl = document.getElementById('blog-breadcrumb');
        if(breadcrumbEl) {
            breadcrumbEl.innerHTML = `
                <a href="#" onclick="document.getElementById('btn-home').click(); return false;" style="color:var(--text-muted); text-decoration:none;">Ana Sayfa</a> &gt; 
                <a href="/blog" onclick="document.getElementById('btn-blog').click(); return false;" style="color:var(--text-muted); text-decoration:none;">Blog</a> &gt; 
                <span class="text-primary">${article.title}</span>
            `;
        }

        document.getElementById('article-content').innerHTML = `
            <h1 style="font-size:2.2rem; margin-bottom:0.5rem;">${article.title}</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem; font-style:italic;">${article.desc}</p>
            ${article.content}
        `;

        navigateTo('blog-article');
        
        if (window.location.pathname !== `/blog/${slug}`) {
            history.pushState(null, '', `/blog/${slug}`);
        }
        setSEO(`${article.title} | SoruEvim Blog`, article.desc, `https://soruevimkpss.vercel.app/blog/${slug}`);
    }

    // Modal artık kullanılmıyor, ancak fonksiyon durabilir veya boşaltılabilir
    function closeSettingsModal() {
        if (window.location.pathname.startsWith('/kategori/')) {
            history.pushState(null, '', '/');
            route();
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
        
        const existingFaq = document.getElementById('faq-json-ld');
        if (existingFaq) existingFaq.remove();
    }

    function injectFaqJSONLD() {
        removeJSONLD();
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'faq-json-ld';
        
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": "KPSS testlerini ücretsiz mi çözüyorum?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Evet, SoruEvim platformundaki Tarih, Coğrafya, Vatandaşlık, Matematik ve Türkçe gibi tüm KPSS online deneme ve yaprak testleri tamamen ücretsizdir."
                }
            }, {
                "@type": "Question",
                "name": "Online KPSS denemeleri güncel mi?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sistemimize düzenli olarak yeni müfredata ve ÖSYM'nin yeni nesil soru tiplerine uygun güncel bilgiler ve testler otomatik olarak eklenmektedir."
                }
            }, {
                "@type": "Question",
                "name": "Çözdüğüm testlerin sonucunu görebilir miyim?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Testi bitirdiğiniz anda kaç doğru, kaç yanlış yaptığınızı görebilir, soruların detaylı çözümlerini ve açıklamalarını anında inceleyebilirsiniz. İlerlemeniz cihazınıza kaydedilir."
                }
            }]
        };
        script.text = JSON.stringify(faqData);
        document.head.appendChild(script);
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
            
            timerMode = 'none'; // Şimdilik varsayılan süre yok
            timerDuration = 0;
            
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
            setSEO(testTitle, testDesc, `https://soruevimkpss.vercel.app/test/${currentCategory.id}/${testIndex + 1}`);
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

    function setSEO(title, description, url = "https://soruevimkpss.vercel.app/") {
        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute("content", description);
        
        // Open Graph Meta Etiketleri
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if(!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
        ogTitle.setAttribute("content", title);
        
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if(!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
        ogDesc.setAttribute("content", description);
        
        let ogUrl = document.querySelector('meta[property="og:url"]');
        if(!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
        ogUrl.setAttribute("content", url);
        
        let ogImage = document.querySelector('meta[property="og:image"]');
        if(!ogImage) { ogImage = document.createElement('meta'); ogImage.setAttribute('property', 'og:image'); document.head.appendChild(ogImage); }
        ogImage.setAttribute("content", "https://soruevimkpss.vercel.app/og-image.jpg"); // Varsayılan bir görsel varsayalım
    }

    function route() {
        const path = window.location.pathname;
        if (path.startsWith('/kategori/')) {
            const catId = path.replace('/kategori/', '');
            if (categoriesData[catId]) {
                openCategoryPage(catId);
            } else {
                navigateTo('home');
            }
        } else if (path.startsWith('/test/')) {
            // Eğer testte değilse ana sayfaya dön (refresh durumu)
            if (!currentCategory) {
                history.replaceState(null, '', '/');
                navigateTo('home');
            }
        } else if (path === '/blog') {
            openBlogList();
            if(window.location.pathname !== '/blog') history.pushState(null, '', '/blog');
        } else if (path.startsWith('/blog/')) {
            const slug = path.replace('/blog/', '');
            openArticle(slug);
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
            injectFaqJSONLD();
        }
    }

    // Event Listeners
    // Modal iptal edildiği için form listener kaldırılabilir
    document.getElementById('btn-quit-quiz').addEventListener('click', quitQuiz);
    document.getElementById('btn-restart-quiz').addEventListener('click', () => {
        history.pushState(null, '', `/kategori/${currentCategory.id}`);
        openCategoryPage(currentCategory.id);
    });
    
    // Link overrides for SPA routing
    document.getElementById('btn-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '/');
        route();
    });
    
    document.getElementById('btn-blog')?.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '/blog');
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
        finishQuiz,
        openArticle,
        openBlogList
    };
})();
