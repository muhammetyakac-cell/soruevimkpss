// Timer Module
const Timer = (function() {
    let intervalId = null;
    let secondsLeft = 0;
    let mode = 'none'; // 'none', 'question_60', 'question_90'
    let onTickCallback = null;
    let onTimeoutCallback = null;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function tick() {
        if (mode === 'none') {
            secondsLeft++; // Serbest modda yukarı sayar (geçen süre)
        } else {
            secondsLeft--; // Süreli modda aşağı sayar
        }

        if (onTickCallback) {
            onTickCallback(secondsLeft, formatTime(secondsLeft));
        }

        if (mode !== 'none' && secondsLeft <= 0) {
            stop();
            if (onTimeoutCallback) {
                onTimeoutCallback();
            }
        }
    }

    function start(timerMode, duration, onTick, onTimeout) {
        stop();
        mode = timerMode;
        secondsLeft = timerMode === 'none' ? 0 : duration;
        onTickCallback = onTick;
        onTimeoutCallback = onTimeout;

        // İlk güncellemeyi hemen yap
        if (onTickCallback) {
            onTickCallback(secondsLeft, formatTime(secondsLeft));
        }

        intervalId = setInterval(tick, 1000);
    }

    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function resetQuestionTimer(duration) {
        if (mode !== 'none') {
            secondsLeft = duration;
            if (onTickCallback) {
                onTickCallback(secondsLeft, formatTime(secondsLeft));
            }
        }
    }

    return {
        start,
        stop,
        resetQuestionTimer,
        getTime: () => secondsLeft
    };
})();
