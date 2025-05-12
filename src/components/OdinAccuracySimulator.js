import React, { useState, useEffect, useRef } from 'react';

const AccuracySimulator = ({ hitRate = 72.73, accuracyDiff = 0 }) => {
    const [simulationRunning, setSimulationRunning] = useState(false);
    const [simulationLog, setSimulationLog] = useState([]);
    const [simulationResults, setSimulationResults] = useState(null);
    const [simulationStarted, setSimulationStarted] = useState(false);

    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // Run simulation
    const runSimulation = (numAttacks = 100) => {
        if (simulationRunning) return;
        
        setSimulationRunning(true);
        setSimulationStarted(true);
        setSimulationLog([]);
        setSimulationResults(null);
        
        const results = {
        totalAttacks: numAttacks,
        hits: 0,
        misses: 0,
        sequence: [],
        hitRate: 0
        };
        
        // Run simulation in batches to show progress
        let attackIndex = 0;
        
        const simulateNextBatch = () => {
        const batchSize = 5; // Process 5 attacks at a time
        const endIndex = Math.min(attackIndex + batchSize, numAttacks);
        
        for (let i = attackIndex; i < endIndex; i++) {
            // Simulate single attack
            const hit = Math.random() * 100 < hitRate;
            
            results.sequence.push({ hit });
            
            if (hit) {
                results.hits++;
                setSimulationLog(prev => [...prev, `Attack ${i + 1}: HIT`]);
            } else {
                results.misses++;
                setSimulationLog(prev => [...prev, `Attack ${i + 1}: MISS`]);
            }
        }
        
        attackIndex = endIndex;
        
        if (attackIndex < numAttacks) {
            // Continue with next batch
            setTimeout(simulateNextBatch, 50);
        } else {
            // Simulation complete
            results.hitRate = (results.hits / numAttacks) * 100;
            
            setSimulationResults(results);
            setSimulationRunning(false);
            startHitAnimation(results.sequence);
        }
        };
        
        simulateNextBatch();
    };

    // Render hit/miss animation on canvas
    const startHitAnimation = (sequence) => {
        if (!canvasRef.current || sequence.length === 0) return;
        
        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        
        // Animation settings
        const gridSize = 20; // Increased size of each hit/miss square
        const gridGap = 4; // Increased gap for better visibility
        const gridCols = Math.min(15, Math.floor(width / (gridSize + gridGap))); // Fewer columns for larger squares
        const gridRows = Math.ceil(sequence.length / gridCols); // Number of rows needed
        
        // Display settings
        const displayRows = Math.min(10, gridRows); // Maximum rows to display at once
        let rowOffset = 0; // Current row offset for scrolling
        
        const drawGrid = () => {
            if (!canvasRef.current) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw background
            ctx.fillStyle = '#f8fafc'; // Lighter background that matches site
            ctx.fillRect(0, 0, width, height);
            
            // Calculate total visible cells
            const totalVisibleCells = gridCols * displayRows;
            
            // Draw hit/miss grid
            for (let i = 0; i < Math.min(totalVisibleCells, sequence.length); i++) {
                const row = Math.floor(i / gridCols) + rowOffset;
                const col = i % gridCols;
                
                const displayRow = row - rowOffset;
                
                if (displayRow >= displayRows) continue;
                
                const x = col * (gridSize + gridGap) + 10;
                const y = displayRow * (gridSize + gridGap) + 10;
                
                const result = sequence[row * gridCols + col];
                
                if (result) {
                if (result.hit) {
                    // Hit style - rounded rectangle with shadow
                    ctx.fillStyle = '#22c55e'; // Green color matching your gauge
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 3;
                    ctx.shadowOffsetX = 1;
                    ctx.shadowOffsetY = 1;
                } else {
                    // Miss style - rounded rectangle with shadow
                    ctx.fillStyle = '#ef4444'; // Red color matching your gauge
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 3;
                    ctx.shadowOffsetX = 1;
                    ctx.shadowOffsetY = 1;
                }
                
                // Draw rounded rectangle
                ctx.beginPath();
                ctx.roundRect(x, y, gridSize, gridSize, 4);
                ctx.fill();
                
                // Reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                }
            }
        };
        
        const animate = () => {
        drawGrid();
        animationRef.current = requestAnimationFrame(animate);
        };
        
        animate();
    };

    // Clean up animation on unmount
    useEffect(() => {
        return () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        };
    }, []);

    // Initial drawing on the canvas to show an empty state with instructions
    useEffect(() => {
        if (canvasRef.current && !simulationStarted) {
        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);
        
        // Draw instruction text
        ctx.fillStyle = '#64748b';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Click one of the buttons below to simulate attacks', width/2, height/2 - 10);
        
        // Draw hit rate info
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.fillText(`Your hit rate: ${hitRate.toFixed(2)}%`, width/2, height/2 + 20);
        }
    }, [canvasRef, simulationStarted, hitRate]);

    return (
        <div className="accuracy-simulator">
        <h3 className="section-title text-center">Accuracy Simulator</h3>
        
        <div className="simulator-canvas-wrapper">
            <canvas
            ref={canvasRef}
            width={400}
            height={250}
            className="simulator-canvas"
            />
            
            <div className="simulator-controls">
            <button
                onClick={() => runSimulation(10)}
                disabled={simulationRunning}
                className="simulator-btn"
            >
                Test 10 Attacks
            </button>
            <button
                onClick={() => runSimulation(100)}
                disabled={simulationRunning}
                className="simulator-btn"
            >
                Test 100 Attacks
            </button>
            <button
                onClick={() => runSimulation(1000)}
                disabled={simulationRunning}
                className="simulator-btn"
            >
                Test 1000 Attacks
            </button>
            </div>
        </div>
        
        {/* Only show log when there are entries */}
        {simulationLog.length > 0 && (
            <div className="simulator-log-wrapper">
            {simulationLog.map((log, index) => (
                <div 
                key={index} 
                className={`simulator-log-entry ${log.includes('HIT') ? 'hit' : 'miss'}`}
                >
                {log}
                </div>
            ))}
            </div>
        )}
        
        {/* Only show results when available */}
        {simulationResults && (
            <div className="simulator-results">
            <div className="simulator-result-item">
                <span>Total Attacks:</span> <strong>{simulationResults.totalAttacks}</strong>
            </div>
            <div className="simulator-result-item">
                <span>Hits:</span> <strong>{simulationResults.hits} ({simulationResults.hitRate.toFixed(2)}%)</strong>
            </div>
            <div className="simulator-result-item">
                <span>Misses:</span> <strong>{simulationResults.misses}</strong>
            </div>
            </div>
        )}
        </div>
    );
};

export default AccuracySimulator;