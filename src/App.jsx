import React from 'react';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import { useTimer } from './hooks/useTimer';

function App() {
  const { timeLeft, isActive, mode, MODES, switchMode, toggleTimer, resetTimer, totalTime } = useTimer();

  return (
    <div className="glass-container">
      <h1>Pomodoro Timer</h1>
      <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} />
      <Controls
        isActive={isActive}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        mode={mode}
        switchMode={switchMode}
        MODES={MODES}
      />
    </div>
  );
}

export default App;
