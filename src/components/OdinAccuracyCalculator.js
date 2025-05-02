import React, { useState, useEffect } from 'react';
import './OdinAccuracyCalculator.css';

const OdinAccuracyCalculator = () => {
  const [characterLevel, setCharacterLevel] = useState(50);
  const [monsterLevel, setMonsterLevel] = useState(50);
  const [accuracyStat, setAccuracyStat] = useState(150);
  const [region, setRegion] = useState('jotunheim');
  const [attackType, setAttackType] = useState('normal');
  
  const [hitRate, setHitRate] = useState(0);
  const [adjustedHitRate, setAdjustedHitRate] = useState(0);
  const [accuracyDiff, setAccuracyDiff] = useState(0);
  
  // Accuracy table data from the article
  const accuracyTable = {
    12: 88.89, 11: 87.50, 10: 86.67, 9: 85.71, 8: 84.62, 7: 83.33,
    6: 81.82, 5: 80.00, 4: 78.43, 3: 76.92, 2: 75.48, 1: 74.07,
    0: 72.73, '-1': 71.43, '-2': 70.18, '-3': 68.97, '-4': 67.80,
    '-5': 66.67, '-6': 65.57, '-7': 64.52, '-8': 63.49, '-9': 62.50,
    '-10': 61.54, '-11': 60.61, '-12': 59.70, '-13': 58.82, '-14': 57.97,
    '-15': 57.14, '-16': 56.34, '-17': 55.56, '-18': 54.79, '-19': 54.05,
    '-20': 53.33, '-21': 52.63, '-22': 51.95, '-23': 51.28, '-24': 50.63,
    '-25': 50.00, '-26': 49.38, '-27': 48.78, '-28': 48.19, '-29': 47.62,
    '-30': 47.06, '-31': 46.51, '-32': 45.98, '-33': 45.45
  };

  useEffect(() => {
    // Calculate accuracy difference
    const levelDifference = characterLevel - monsterLevel;
    const levelPenalty = levelDifference * 3;
    const baseAccuracyNeeded = characterLevel * 3;
    const adjustedAccuracy = accuracyStat - baseAccuracyNeeded + levelPenalty;
    
    setAccuracyDiff(adjustedAccuracy);
    
    // Find closest hit rate in table
    let baseHitRate = 45.45; // Default to lowest value
    
    // Clamp adjusted accuracy to table bounds
    const clampedAccuracy = Math.min(12, Math.max(-33, adjustedAccuracy));
    
    baseHitRate = accuracyTable[clampedAccuracy];
    setHitRate(baseHitRate);
    
    // Apply regional and attack type bonuses
    let finalHitRate = baseHitRate;
    
    if (region === 'midgard') {
      finalHitRate += 20; // Midgard has +20% bonus
    }
    
    if (attackType === 'skill') {
      finalHitRate += 10; // Skills have +10% bonus
    }
    
    // Cap at 99%
    finalHitRate = Math.min(99, finalHitRate);
    
    setAdjustedHitRate(finalHitRate);
    
  }, [characterLevel, monsterLevel, accuracyStat, region, attackType]);

  return (
    <div className="calculator-container">
      <h1 className="calculator-title">Odin: Valhalla Rising Accuracy Calculator</h1>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Character Level</label>
          <input
            type="number"
            value={characterLevel}
            onChange={(e) => setCharacterLevel(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Monster Level</label>
          <input
            type="number"
            value={monsterLevel}
            onChange={(e) => setMonsterLevel(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Your Accuracy Stat</label>
          <input
            type="number"
            value={accuracyStat}
            onChange={(e) => setAccuracyStat(parseInt(e.target.value) || 0)}
            min="0"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="form-select"
          >
            <option value="midgard">Midgard (+20% bonus)</option>
            <option value="jotunheim">Jotunheim/Nidavellir (no bonus)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Attack Type</label>
          <select
            value={attackType}
            onChange={(e) => setAttackType(e.target.value)}
            className="form-select"
          >
            <option value="normal">Normal Attack</option>
            <option value="skill">Skill Attack (+10% bonus)</option>
          </select>
        </div>
      </div>
      
      <div className="results-section">
        <h2 className="section-title">Results</h2>
        
        <div className="results-grid">
          <div className="results-label">Base accuracy needed:</div>
          <div className="results-value">{characterLevel * 3}</div>
          
          <div className="results-label">Level difference:</div>
          <div className="results-value">{characterLevel - monsterLevel} ({(characterLevel - monsterLevel) * 3} accuracy points)</div>
          
          <div className="results-label">Accuracy differential:</div>
          <div className="results-value">{accuracyDiff}</div>
          
          <div className="results-label">Base hit rate:</div>
          <div className="results-value">{hitRate.toFixed(2)}%</div>
          
          <div className="results-label">Final hit rate:</div>
          <div className="hit-rate">{adjustedHitRate.toFixed(2)}%</div>
        </div>
      </div>
      
      <div className="recommendations-section">
        <h2 className="section-title">Recommendations</h2>
        
        {adjustedHitRate < 70 ? (
          <p className="message-low">Your hit rate is low. Consider increasing your accuracy stat or fighting lower-level monsters.</p>
        ) : adjustedHitRate < 85 ? (
          <p className="message-medium">Your hit rate is acceptable but could be improved for optimal performance.</p>
        ) : (
          <p className="message-good">Your hit rate is good! You should have minimal issues with missed attacks.</p>
        )}
        
        {monsterLevel > characterLevel + 3 && (
          <p className="warning">Warning: You are fighting monsters significantly above your level. This will result in lower hit rates.</p>
        )}
      </div>
      
      <div className="footer">
        Based on data from <a href="https://www.inven.co.kr/webzine/news/?news=259851&site=odin" target="_blank" rel="noopener noreferrer">Inven.co.kr article</a>
      </div>
    </div>
  );
};

export default OdinAccuracyCalculator;