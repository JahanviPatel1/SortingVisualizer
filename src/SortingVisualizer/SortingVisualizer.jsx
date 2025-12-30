import React, { useState, useEffect, useRef } from 'react';
import './PixelStyles.css';
import { AlgorithmFactory, ALGORITHMS } from './AlgorithmFactory';
import StatsPanel from './StatsPanel';
import VisualizerControls from './VisualizerControls';

const SortingVisualizer = () => {
    // State
    const [array, setArray] = useState([]);
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(ALGORITHMS.BUBBLE);
    const [stats, setStats] = useState({ comparisons: 0, complexity: { best: '-', avg: '-', worst: '-' } });

    // Refs for mutable access during high-speed loops without re-rendering everything constantly via state
    const arrayRef = useRef([]);
    const controlsRef = useRef({
        sorting: false,
        paused: false,
        speed: 50,
        generator: null
    });

    // Refs for DOM elements (bars) to manipulate styles directly for performance
    const containerRef = useRef(null);

    // Initial Setup
    useEffect(() => {
        resetArray();

        // Update stats metadata
        const { complexity } = AlgorithmFactory.getAlgorithm(selectedAlgorithm);
        setStats(s => ({ ...s, complexity, comparisons: 0 }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAlgorithm]);

    // Keep refs in sync for logic loop
    useEffect(() => {
        controlsRef.current.speed = speed;
        controlsRef.current.paused = paused;
    }, [speed, paused]);

    const resetArray = () => {
        if (sorting) return;
        const newArray = [];
        // Responsive array size? For now fixed 40 for aesthetics
        const size = 40;
        for (let i = 0; i < size; i++) {
            newArray.push(Math.floor(Math.random() * 400) + 20);
        }
        setArray(newArray);
        arrayRef.current = [...newArray];
        setStats(s => ({ ...s, comparisons: 0 }));

        // Reset colors
        const bars = containerRef.current?.children;
        if (bars) {
            for (let bar of bars) {
                bar.className = 'neon-bar';
                bar.style.backgroundColor = ''; // Reset inline style overrides
            }
        }
    };

    const handleAlgorithmChange = (algo) => {
        setSelectedAlgorithm(algo);
        const { complexity } = AlgorithmFactory.getAlgorithm(algo);
        setStats(s => ({ ...s, complexity, comparisons: 0 }));
    };

    // --- Visualization Core ---

    const processStep = (step) => {
        const bars = containerRef.current?.children;
        if (!bars) return;

        // Reset previous highlights (naive approach: reset all 'compare' class? No, too slow. 
        // We rely on 'compare' steps to turn on, and next step to turn off? 
        // Better: The generator should yield state, we apply.
        // For simplicity in this factory: 
        // We will clear 'compare' classes from previous step if we track them, 
        // or just clear all 'compare' classes every step (might be fast enough for 40 elements).
        for (let i = 0; i < bars.length; i++) {
            if (bars[i].classList.contains('compare')) bars[i].classList.remove('compare');
            if (bars[i].classList.contains('swap')) bars[i].classList.remove('swap');
            // Sorted markers persist
        }

        const { type, indices, values } = step;

        if (type === 'compare') {
            indices.forEach(idx => bars[idx].classList.add('compare'));
            setStats(prev => ({ ...prev, comparisons: prev.comparisons + 1 }));
        } else if (type === 'swap' || type === 'set') {
            indices.forEach((idx, i) => {
                bars[idx].classList.add('swap');
                bars[idx].style.height = `${values[i]}px`;
                // Also update ref
                arrayRef.current[idx] = values[i];
            });
        } else if (type === 'sorted') {
            indices.forEach(idx => bars[idx].classList.add('sorted'));
        } else if (type === 'pivot') {
            indices.forEach(idx => bars[idx].classList.add('swap')); // Reusing swap color for pivot
        }
    };

    const runSorter = async () => {
        if (sorting) return;
        setSorting(true);
        controlsRef.current.sorting = true;

        const { generator } = AlgorithmFactory.getAlgorithm(selectedAlgorithm);
        const gen = generator(arrayRef.current);
        controlsRef.current.generator = gen;

        // Animation Loop
        const animate = async () => {
            if (!controlsRef.current.sorting) return;

            if (controlsRef.current.paused) {
                // Wait loop
                await new Promise(r => setTimeout(r, 100));
                if (controlsRef.current.sorting) animate(); // Check again
                return;
            }

            const { value: step, done } = gen.next();

            if (done) {
                setSorting(false);
                controlsRef.current.sorting = false;
                controlsRef.current.generator = null;
                return;
            }

            processStep(step);

            // Delay
            // Speed 1-100. 100 = fast (1ms), 1 = slow (500ms).
            // Formula: (101 - speed) * 5
            const delay = (101 - controlsRef.current.speed) * 3;
            // If speed is max (100), we might want 0 delay? But we need async to let UI render.
            // requestAnimationFrame might be better for max speed, but setTimeout is easier to control.

            await new Promise(r => setTimeout(r, Math.max(1, delay)));

            animate();
        };

        animate();
    };

    const handleStep = () => {
        if (!controlsRef.current.generator) return;
        const { value: step, done } = controlsRef.current.generator.next();
        if (done) {
            setSorting(false);
            controlsRef.current.sorting = false;
            return;
        }
        processStep(step);
    };

    // --- Render ---

    return (
        <div className="visualizer-container">
            <h1>SORTING VISUALISER</h1>

            <div style={{ display: 'flex', width: '100%', maxWidth: '1400px', justifyContent: 'center', alignItems: 'flex-start' }}>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <VisualizerControls
                        onGenerate={resetArray}
                        onSort={runSorter}
                        onAlgorithmChange={handleAlgorithmChange}
                        selectedAlgorithm={selectedAlgorithm}
                        sorting={sorting}
                        speed={speed}
                        setSpeed={setSpeed}
                        onStep={handleStep}
                        paused={paused}
                        setPaused={setPaused}
                    />

                    <div className="visualizer-stage" style={{ height: '450px', alignItems: 'flex-end', display: 'flex' }} ref={containerRef}>
                        {array.map((value, idx) => (
                            <div
                                key={idx}
                                className="neon-bar"
                                style={{
                                    height: `${value}px`,
                                    width: `${Math.floor(800 / array.length)}px`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Stats Panel */}
                <div>
                    <StatsPanel
                        algorithmName={selectedAlgorithm}
                        complexity={stats.complexity}
                        comparisons={stats.comparisons}
                    />
                </div>
            </div>
        </div>
    );
};

export default SortingVisualizer;
