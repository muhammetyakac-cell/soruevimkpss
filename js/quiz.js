// Quiz Module
const Quiz = (function() {
    let questions = [];
    let currentQuestionIndex = 0;
    let score = { correct: 0, wrong: 0, empty: 0 };
    let userAnswers = []; // Her soru için: { questionId, selectedOption, isCorrect }
    let isAnswered = false; // Mevcut soru cevaplandı mı?

    // DOM Elements
    const elements = {
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        explanationBox: document.getElementById('explanation-box'),
        explanationText: document.getElementById('explanation-text'),
        btnNext: document.getElementById('btn-next-question'),
        btnPrev: document.getElementById('btn-prev-question'),
        quizCounter: document.getElementById('quiz-counter'),
        progressBar: document.getElementById('quiz-progress'),
    };

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function init(quizQuestions, limit) {
        // Soruları kopyala ve karıştır
        questions = [...quizQuestions];
        shuffleArray(questions);
        
        // Soru limitini uygula
        if (limit !== 'all' && parseInt(limit) < questions.length) {
            questions = questions.slice(0, parseInt(limit));
        }

        currentQuestionIndex = 0;
        score = { correct: 0, wrong: 0, empty: 0 };
        userAnswers = new Array(questions.length).fill(null);
        
        showQuestion();
    }

    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            App.finishQuiz();
            return;
        }

        const q = questions[currentQuestionIndex];
        const userAnswer = userAnswers[currentQuestionIndex];
        isAnswered = userAnswer !== null;

        // Update UI
        elements.quizCounter.innerText = `Soru: ${currentQuestionIndex + 1} / ${questions.length}`;
        elements.progressBar.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;
        
        elements.questionText.innerHTML = q.question;
        elements.optionsContainer.innerHTML = '';
        elements.explanationBox.classList.remove('show');
        elements.btnNext.disabled = !isAnswered;
        elements.btnPrev.disabled = currentQuestionIndex === 0;

        // Şıkları oluştur
        const labels = ['A', 'B', 'C', 'D', 'E'];
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            
            // Seçenek metninden "A) " kısmını ayırıp daha şık göstermek için
            const textParts = opt.split(') ');
            const letter = textParts.length > 1 ? textParts[0] : labels[index];
            const text = textParts.length > 1 ? textParts.slice(1).join(') ') : opt;

            btn.innerHTML = `<span class="option-letter">${letter})</span> <span>${text}</span>`;
            
            if (isAnswered) {
                btn.disabled = true;
                if (index === q.correctAnswer) {
                    btn.classList.add('correct');
                } else if (userAnswer.selectedOption === index) {
                    btn.classList.add('wrong');
                }
            } else {
                btn.onclick = () => selectOption(index, btn);
            }

            elements.optionsContainer.appendChild(btn);
        });

        if (isAnswered) {
            showExplanation(q.explanation);
        }
    }

    function selectOption(selectedIndex, btnElement) {
        if (isAnswered) return;
        isAnswered = true;

        const q = questions[currentQuestionIndex];
        const isCorrect = selectedIndex === q.correctAnswer;
        
        // Skor güncelle
        if (isCorrect) score.correct++;
        else score.wrong++;

        // Cevabı kaydet
        userAnswers[currentQuestionIndex] = {
            questionId: q.id,
            selectedOption: selectedIndex,
            isCorrect: isCorrect
        };

        // Buton stillerini güncelle
        const allBtns = elements.optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === q.correctAnswer) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        showExplanation(q.explanation);
        elements.btnNext.disabled = false;
        
        // Eğer süreli moddaysa ve otomatik geçiş istenirse buraya eklenebilir.
    }

    function showExplanation(text) {
        if (!text) return;
        elements.explanationText.innerHTML = text;
        elements.explanationBox.classList.add('show');
    }

    function handleTimeout() {
        if (isAnswered) return;
        
        // Boş bırakıldı sayılır
        score.empty++;
        const q = questions[currentQuestionIndex];
        
        userAnswers[currentQuestionIndex] = {
            questionId: q.id,
            selectedOption: -1,
            isCorrect: false
        };

        // Doğru cevabı göster
        const allBtns = elements.optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === q.correctAnswer) {
                btn.classList.add('correct');
            }
        });

        isAnswered = true;
        showExplanation(q.explanation);
        elements.btnNext.disabled = false;
    }

    function nextQuestion() {
        if (!isAnswered) return;
        currentQuestionIndex++;
        showQuestion();
        
        // Timer'ı sıfırla (eğer süreli moddaysa)
        if (App.getTimerMode() !== 'none') {
            Timer.resetQuestionTimer(App.getTimerDuration());
        }
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    }

    // Event Listeners for Buttons
    elements.btnNext.addEventListener('click', nextQuestion);
    elements.btnPrev.addEventListener('click', prevQuestion);

    return {
        init,
        handleTimeout,
        getResults: () => {
            return {
                total: questions.length,
                correct: score.correct,
                wrong: score.wrong,
                empty: questions.length - score.correct - score.wrong
            };
        }
    };
})();
