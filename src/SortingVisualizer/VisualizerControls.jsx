import React from 'react';
import './PixelStyles.css';
import { ALGORITHMS } from './AlgorithmFactory';

const VisualizerControls = ({
    onGenerate,
    onSort,
    onAlgorithmChange,
    selectedAlgorithm,
    sorting,
    speed,
    setSpeed,
    onStep,
    paused,
    setPaused
}) => {
    return (
        <div className="controls-bar">
            <button className="retro-btn" onClick={onGenerate} disabled={sorting}>
                RESET ARRAY
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Animation Delay</label>
                <input
                    className="retro-slider"
                    type="range"
                    min="1"
                    max="100"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    disabled={sorting && !paused}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                {Object.values(ALGORITHMS).map((algo) => (
                    <button
                        key={algo}
                        className="retro-btn"
                        style={selectedAlgorithm === algo ? { background: 'var(--color-bar-default)', borderColor: 'var(--color-border)', boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.2)' } : {}}
                        onClick={() => onAlgorithmChange(algo)}
                        disabled={sorting}
                    >
                        {algo}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px', paddingLeft: '20px', borderLeft: '2px solid var(--color-border)' }}>
                {!sorting ? (
                    <button className="retro-btn" style={{ background: 'var(--color-bar-compare)' }} onClick={() => onSort(false)}>START SORT</button>
                ) : (
                    <>
                        <button className="retro-btn" onClick={() => setPaused(!paused)}>
                            {paused ? 'RESUME' : 'PAUSE'}
                        </button>
                        <button className="retro-btn" onClick={onStep} disabled={!paused} style={{ background: '#e0e0e0' }}>
                            STEP &gt;
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VisualizerControls;
