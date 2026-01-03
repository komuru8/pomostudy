import React from 'react';

const TimerDisplay = ({ timeLeft, totalTime }) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calculate circle progress
    const radius = 100; // Reduced from 120
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / totalTime;
    const dashoffset = circumference * (1 - progress);

    return (
        <div className="timer-container" style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px auto' }}>
            <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke="#e0f2f1" /* Light teal/green background */
                    strokeWidth="8" /* Thinner */
                    fill="var(--bg-color)" /* Fill center with page bg or white */
                />

                {/* Visual "Farm" Indicator (Leaf/Sprout) could go here later */}

                {/* Progress Ring */}
                <circle
                    className="timer-circle"
                    cx="120"
                    cy="120"
                    r={radius}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="time-text" style={{ position: 'absolute', fontSize: '3.2rem', fontWeight: '800', color: 'var(--text-color)', letterSpacing: '-2px' }}>
                {formattedTime}
            </div>
        </div>
    );
};

export default TimerDisplay;
