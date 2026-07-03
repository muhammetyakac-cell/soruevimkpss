"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { saveProgress } from '@/app/actions/progress'

export default function QuizClient({ category, testIndex, questions }: any) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, wrong: 0, empty: 0 })
  const [userAnswers, setUserAnswers] = useState<any[]>(new Array(questions.length).fill(null))
  const [isAnswered, setIsAnswered] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [seconds, setSeconds] = useState(0)

  const q = questions[currentIndex]
  const currentAnswer = userAnswers[currentIndex]
  const labels = ['A', 'B', 'C', 'D', 'E']

  useEffect(() => {
    if (isFinished) return
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isFinished])

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleOptionClick = (index: number) => {
    if (isAnswered) return
    setIsAnswered(true)

    const isCorrect = index === q.correctAnswer
    if (isCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1 }))
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }))
    }

    const newAnswers = [...userAnswers]
    newAnswers[currentIndex] = { selectedOption: index, isCorrect }
    setUserAnswers(newAnswers)
  }

  const nextQuestion = async () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true)
      const emptyCount = questions.length - score.correct - score.wrong
      // Sınav bittiğinde kaydet
      await saveProgress(category.category_id, testIndex, score.correct, score.wrong, emptyCount, userAnswers)
    } else {
      setCurrentIndex(i => i + 1)
      setIsAnswered(userAnswers[currentIndex + 1] !== null)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
      setIsAnswered(userAnswers[currentIndex - 1] !== null)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return
      
      // 1-5 keys for options
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const index = parseInt(e.key) - 1
        if (q?.options && index < q.options.length && !isAnswered) {
          handleOptionClick(index)
        }
      }
      
      // Enter key for next question
      if (e.key === 'Enter' && isAnswered) {
        nextQuestion()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFinished, isAnswered, currentIndex, q])

  if (isFinished) {
    const emptyCount = questions.length - score.correct - score.wrong
    return (
      <div className="results-container">
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Test Tamamlandı!</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Çözüm Süresi: {formatTime(seconds)}</p>
        
        <div className="score-circle">
            <div className="score-value">{Math.round((score.correct / questions.length) * 100)}</div>
            <div className="score-label">PUAN</div>
        </div>

        <div className="results-stats">
            <div className="glass-card r-stat correct">
                <h4>Doğru</h4>
                <p>{score.correct}</p>
            </div>
            <div className="glass-card r-stat wrong">
                <h4>Yanlış</h4>
                <p>{score.wrong}</p>
            </div>
            <div className="glass-card r-stat">
                <h4>Boş</h4>
                <p>{emptyCount}</p>
            </div>
        </div>

        <div className="results-actions" style={{ marginBottom: '2rem' }}>
            <button onClick={() => window.location.reload()} className="btn-primary">↻ Tekrar Çöz</button>
            <Link href={`/kategori/${category.category_id}`} className="btn-outline">Kategoriye Dön</Link>
        </div>

        <div className="detailed-report" style={{ textAlign: 'left', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Detaylı Soru Analizi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q: any, i: number) => {
              const ans = userAnswers[i];
              if (!ans) return null;
              const isCorrect = ans.isCorrect;
              return (
                <div key={i} className="glass-card" style={{ padding: '1rem', borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>Soru {i + 1}</strong>
                    <span style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                      {isCorrect ? '✓ Doğru' : '✗ Yanlış'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }} dangerouslySetInnerHTML={{ __html: q.question }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Senin Cevabın: <strong>{labels[ans.selectedOption]}</strong> {isCorrect ? '' : ` | Doğru Cevap: ${labels[q.correctAnswer]}`}
                  </div>
                  {q.explanation && (
                    <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <strong>Açıklama:</strong> <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Ana Sayfa</Link> &gt; 
        <Link href={`/kategori/${category.category_id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}> {category.title}</Link> &gt; 
        <span className="text-primary"> Test {testIndex + 1}</span>
      </div>

      <div className="quiz-header">
        <h3 id="quiz-title">{category.title} - Test {testIndex + 1}</h3>
        <div className="quiz-meta" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="timer" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>⏱</span>
              <span>{formatTime(seconds)}</span>
            </div>
            <div className="text-muted">Soru: {currentIndex + 1}/{questions.length}</div>
            <Link href={`/kategori/${category.category_id}`} className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Çıkış</Link>
        </div>
      </div>

      <div className="progress-container">
          <div className="progress-bar" style={{ width: `${((currentIndex) / questions.length) * 100}%` }}></div>
      </div>

      <div className="glass-card question-card">
        <div className="question-text" dangerouslySetInnerHTML={{ __html: q.question }} />

        <div className="options-container">
          {q.options.map((opt: string, idx: number) => {
            const textParts = opt.split(') ')
            const letter = textParts.length > 1 ? textParts[0] : labels[idx]
            const text = textParts.length > 1 ? textParts.slice(1).join(') ') : opt
            
            let btnClass = 'option-btn'
            if (isAnswered) {
              if (idx === q.correctAnswer) btnClass += ' correct'
              else if (currentAnswer?.selectedOption === idx && !currentAnswer.isCorrect) btnClass += ' wrong'
            }

            return (
              <button 
                key={idx} 
                className={btnClass} 
                disabled={isAnswered}
                onClick={() => handleOptionClick(idx)}
              >
                <span className="option-letter">{letter})</span> <span>{text}</span>
                {!isAnswered && <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5 }}>{idx + 1}</span>}
              </button>
            )
          })}
        </div>
        
        <div className={`explanation-box ${isAnswered ? 'show' : ''}`}>
            <strong>Çözüm / Açıklama:</strong>
            <p dangerouslySetInnerHTML={{ __html: q.explanation || 'Bu soru için açıklama bulunmamaktadır.' }} />
        </div>
      </div>

      <div className="quiz-footer">
          <button className="btn-outline" disabled={currentIndex === 0} onClick={prevQuestion}>← Önceki</button>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            {isAnswered ? 'Devam etmek için Enter\'a bas' : 'Şık seçmek için 1-5 arası tuşları kullan'}
          </div>
          <button className="btn-primary" disabled={!isAnswered} onClick={nextQuestion}>
            {currentIndex + 1 === questions.length ? 'Testi Bitir' : 'Sonraki Soru →'}
          </button>
      </div>
    </div>
  )
}
