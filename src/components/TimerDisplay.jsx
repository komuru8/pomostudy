import React from 'react';

const TimerDisplay = ({ timeLeft, totalTime }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calculate circle progress
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / totalTime;
    const dashoffset = circumference * (1 - progress);

    return (
        <div className="timer-container" style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="300" height="300" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                    cx="150"
                    cy="150"
                    r={radius}
                    stroke="#e0f2f1" /* Light teal/green background */
                    strokeWidth="10"
                    fill="var(--bg-color)" /* Fill center with page bg or white */
                />

                {/* Visual "Farm" Indicator (Leaf/Sprout) could go here later */}

                {/* Progress Ring */}
                <circle
                    className="timer-circle"
                    cx="150"
                    cy="150"
                    r={radius}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="time-text" style={{ position: 'absolute', fontSize: '4.5rem', fontWeight: '800', color: 'var(--text-color)', letterSpacing: '-2px' }}>
                {formattedTime}
            </div>
        </div>
    );
};

export default TimerDisplay;
