import React from 'react';
import './PixelStyles.css';

const StatsPanel = ({ algorithmName, complexity, comparisons }) => {
    return (
        <div className="stats-hud">
            <h3 style={{ fontSize: '12px', textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid var(--color-border)', paddingBottom: '10px' }}>
                STATISTICS
            </h3>

            <div className="hud-row">
                <span className="hud-label">Algorithm</span>
                <span className="hud-value">{algorithmName}</span>
            </div>

            <div className="hud-row">
                <span className="hud-label">Comparisons</span>
                <span className="hud-value">{comparisons}</span>
            </div>

            <div className="hud-row" style={{ flexDirection: 'column', borderBottom: 'none' }}>
                <span className="hud-label" style={{ marginBottom: '8px' }}>Time Complexity</span>
                <div style={{ paddingLeft: '10px', fontSize: '11px', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Best:</span> <span style={{ color: 'var(--color-bar-sorted)' }}>{complexity.best}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Average:</span> <span style={{ color: '#d08770' }}>{complexity.avg}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Worst:</span> <span style={{ color: 'var(--color-bar-swap)' }}>{complexity.worst}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;
