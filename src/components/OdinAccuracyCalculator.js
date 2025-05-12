import React, { useState, useEffect } from 'react';
import './OdinAccuracyCalculator.css';

const OdinAccuracyCalculator = () => {
  const [characterLevel, setCharacterLevel] = useState(50);
  const [monsterLevel, setMonsterLevel] = useState(50);
  const [accuracyStat, setAccuracyStat] = useState(150);
  const [region, setRegion] = useState('jotunheim');
  const [attackType, setAttackType] = useState('normal');
  const [characterClass, setCharacterClass] = useState('warrior');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAccuracyTable, setShowAccuracyTable] = useState(false);
  const [additionalAccuracy, setAdditionalAccuracy] = useState(0);
  const [targetHitRate, setTargetHitRate] = useState(80);
  const [recommendedAccuracy, setRecommendedAccuracy] = useState(0);
  
  // Secondary accuracy stats
  const [meleeAccuracy, setMeleeAccuracy] = useState(0);
  const [rangedAccuracy, setRangedAccuracy] = useState(0);
  const [impeccableMagic, setImpeccableMagic] = useState(0);
  
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

  // Finding the closest hit rate key in the accuracy table
  const findClosestAccuracyDiff = (targetRate) => {
    let closestDiff = null;
    let minRateDifference = Number.MAX_VALUE;
    
    for (const [diff, rate] of Object.entries(accuracyTable)) {
      const rateDifference = Math.abs(rate - targetRate);
      if (rateDifference < minRateDifference) {
        minRateDifference = rateDifference;
        closestDiff = parseInt(diff);
      }
    }
    
    return closestDiff;
  };

  // Get the appropriate secondary accuracy stat based on class and attack type
  const getSecondaryAccuracyStat = (characterClass, attackType) => {
    if (characterClass === 'mage' || characterClass === 'priest') {
      // Magic classes use Magic Accuracy for skill attacks
      if (attackType === 'normal') {
        return impeccableMagic;
      }
    } else if (characterClass === 'warrior' || characterClass === 'assassin') {
      // Melee classes use Melee Accuracy for normal attacks
      if (attackType === 'normal') {
        return meleeAccuracy;
      }
    } else if (characterClass === 'sniper' || characterClass === 'archer') {
      // Ranged classes use Ranged Accuracy for normal attacks
      if (attackType === 'normal') {
        return rangedAccuracy;
      }
    }
    
    // Return 0 if no special accuracy applies
    return 0;
  };

  useEffect(() => {
    // Get the appropriate secondary accuracy stat
    const secondaryAcc = getSecondaryAccuracyStat(characterClass, attackType);
    
    // Calculate accuracy difference
    const levelDifference = characterLevel - monsterLevel;
    const levelPenalty = levelDifference * 3;
    const baseAccuracyNeeded = characterLevel * 3;
    const adjustedAccuracy = accuracyStat + additionalAccuracy + secondaryAcc - baseAccuracyNeeded + levelPenalty;
    
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
    
    // Calculate recommended accuracy for target hit rate
    calculateRecommendedAccuracy();
    
  }, [characterLevel, monsterLevel, accuracyStat, region, attackType, additionalAccuracy, targetHitRate, characterClass, meleeAccuracy, rangedAccuracy, impeccableMagic]);
  
  const calculateRecommendedAccuracy = () => {
    // Adjust target hit rate based on region and attack type
    let adjustedTargetRate = targetHitRate;
    
    if (region === 'midgard') {
      adjustedTargetRate -= 20;
    }
    
    if (attackType === 'skill') {
      adjustedTargetRate -= 10;
    }
    
    // Ensure the adjusted target rate is within bounds
    adjustedTargetRate = Math.max(45.45, Math.min(88.89, adjustedTargetRate));
    
    // Find the accuracy difference needed for the target hit rate
    const neededAccuracyDiff = findClosestAccuracyDiff(adjustedTargetRate);
    
    // Calculate total accuracy needed
    const levelDifference = characterLevel - monsterLevel;
    const levelPenalty = levelDifference * 3;
    const baseAccuracyNeeded = characterLevel * 3;
    
    // Get secondary accuracy stat
    const secondaryAcc = getSecondaryAccuracyStat(characterClass, attackType);
    
    // Subtract secondary accuracy and additional accuracy from required accuracy
    const recommendedAcc = baseAccuracyNeeded - levelPenalty + neededAccuracyDiff - additionalAccuracy - secondaryAcc;
    setRecommendedAccuracy(recommendedAcc);
  };
  
  const renderAccuracyGauge = () => {
    const percentage = Math.min(100, Math.max(0, adjustedHitRate));
    let color = '#ef4444'; // Red for low hit rate
    
    if (adjustedHitRate >= 85) {
      color = '#22c55e'; // Green for high hit rate
    } else if (adjustedHitRate >= 70) {
      color = '#f59e0b'; // Yellow for medium hit rate
    }
    
    return (
      <div className="accuracy-gauge-container">
        <div className="accuracy-gauge-background">
          <div 
            className="accuracy-gauge-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
        <div className="accuracy-gauge-label">{adjustedHitRate.toFixed(2)}%</div>
      </div>
    );
  };

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
          <label className="form-label">Character Class</label>
          <select
            value={characterClass}
            onChange={(e) => setCharacterClass(e.target.value)}
            className="form-select"
          >
            <option value="warrior">Warrior (Melee Accuracy)</option>
            <option value="assassin">Assassin (Melee Accuracy)</option>
            <option value="sniper">Sniper (Ranged Accuracy)</option>
            <option value="mage">Mage (Magic Accuracy)</option>
            <option value="priest">Priest (Magic Accuracy)</option>
            <option value="none">Other (No Secondary Accuracy)</option>
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Your Base Accuracy Stat</label>
          <input
            type="number"
            value={accuracyStat}
            onChange={(e) => setAccuracyStat(parseInt(e.target.value) || 0)}
            min="0"
            className="form-input"
          />
        </div>
        
        {/* Secondary accuracy stats - conditionally shown based on class */}
        {(characterClass === 'warrior' || characterClass === 'assassin') && (
          <div className="form-group">
            <label className="form-label">Melee Accuracy</label>
            <input
              type="number"
              value={meleeAccuracy}
              onChange={(e) => setMeleeAccuracy(parseInt(e.target.value) || 0)}
              min="0"
              className="form-input"
            />
          </div>
        )}
        
        {(characterClass === 'sniper') && (
          <div className="form-group">
            <label className="form-label">Ranged Accuracy</label>
            <input
              type="number"
              value={rangedAccuracy}
              onChange={(e) => setRangedAccuracy(parseInt(e.target.value) || 0)}
              min="0"
              className="form-input"
            />
          </div>
        )}
        
        {(characterClass === 'mage' || characterClass === 'priest') && (
          <div className="form-group">
            <label className="form-label">Magic Accuracy</label>
            <input
              type="number"
              value={impeccableMagic}
              onChange={(e) => setImpeccableMagic(parseInt(e.target.value) || 0)}
              min="0"
              className="form-input"
            />
          </div>
        )}
        
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
      
      <div className="advanced-toggle">
        <button 
          className="advanced-button" 
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Buff Simulator & Target Hit Rate'}
        </button>
      </div>
      
      {showAdvanced && (
        <div className="advanced-options">
          <div className="advanced-options-grid">
            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Additional Accuracy</label>
                <i className="fa-solid fa-circle-info tooltip-icon" title="Enter accuracy bonuses from buffs, food or items that aren't yet active"></i>
              </div>
              <input
                type="number"
                value={additionalAccuracy}
                onChange={(e) => setAdditionalAccuracy(parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Target Hit Rate (%)</label>
                <i className="fa-solid fa-circle-info tooltip-icon" title="Your desired hit percentage goal"></i>
              </div>
              <input
                type="number"
                value={targetHitRate}
                onChange={(e) => setTargetHitRate(parseInt(e.target.value) || 0)}
                min="0"
                max="99"
                className="form-input"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="results-section">
        <h2 className="section-title">Your Hit Rate</h2>
        
        {renderAccuracyGauge()}
        
        <div className="results-columns">
          <div className="results-column">
            <h3 className="results-subtitle">Character & Monster</h3>
            <div className="results-item">
              <span className="results-label">Character Level:</span>
              <span className="results-value">{characterLevel}</span>
            </div>
            <div className="results-item">
              <span className="results-label">Monster Level:</span>
              <span className="results-value">{monsterLevel}</span>
            </div>
            <div className="results-item">
              <span className="results-label">Level Difference:</span>
              <span className="results-value">{characterLevel - monsterLevel} ({(characterLevel - monsterLevel) * 3} pts)</span>
            </div>
            <div className="results-item">
              <span className="results-label">Your Accuracy:</span>
              <span className="results-value">{accuracyStat}</span>
            </div>
          </div>

          <div className="results-column">
            <h3 className="results-subtitle">Hit Rate Details</h3>
            <div className="results-item">
              <span className="results-label">Accuracy Differential:</span>
              <span className="results-value">{accuracyDiff}</span>
            </div>
            <div className="results-item">
              <span className="results-label">Base Hit Rate:</span>
              <span className="results-value">{hitRate.toFixed(2)}%</span>
            </div>
            <div className="results-item">
              <span className="results-label">Bonuses:</span>
              <span className="results-value">
                {region === 'midgard' ? 'Region +20%, ' : ''}
                {attackType === 'skill' ? 'Skill +10%' : 'None'}
              </span>
            </div>
            <div className="results-item highlight">
              <span className="results-label">Final Hit Rate:</span>
              <span className="results-value hit-rate">{adjustedHitRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        {showAdvanced && (
          <div className="target-hit-rate">
            <h3 className="results-subtitle">Target Hit Rate Analysis</h3>
            <div className="results-item">
              <span className="results-label">For {targetHitRate}% hit rate:</span>
              <span className="results-value recommended">{recommendedAccuracy} accuracy needed</span>
            </div>
            <div className="results-item">
              <span className="results-label">You need:</span>
              <span className="results-value">{Math.max(0, recommendedAccuracy - accuracyStat)} more accuracy</span>
            </div>
          </div>
        )}
      </div>

      <div className="accuracy-table-section">
        <button 
          className="table-toggle-button"
          onClick={() => setShowAccuracyTable(!showAccuracyTable)}
        >
          {showAccuracyTable ? 'Hide Accuracy Table' : 'Show Accuracy Table Reference'} 
          <i className={`fas fa-chevron-${showAccuracyTable ? 'up' : 'down'}`}></i>
        </button>
        
        {showAccuracyTable && (
          <div className="accuracy-table-container">
            <p className="table-context">
              Your accuracy differential of <strong>{accuracyDiff}</strong> gives you a base hit rate of <strong>{hitRate.toFixed(2)}%</strong> according to the table below.
              {accuracyDiff < 5 && " Notice how improving your accuracy differential to higher values provides increasingly better returns."}
            </p>
            
            <div className="table-columns">
              <div className="table-column">
                <h4 className="column-title">Positive Differentials</h4>
                <div className="table-wrapper">
                  <table className="accuracy-table">
                    <thead>
                      <tr>
                        <th>Differential</th>
                        <th>Hit Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(accuracyTable)
                        .filter(([diff]) => parseInt(diff) >= 0)
                        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                        .map(([diff, rate]) => (
                          <tr key={diff} className={diff == accuracyDiff ? 'highlighted-row' : ''}>
                            <td>+{diff}</td>
                            <td>{rate.toFixed(2)}%</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="table-column">
                <h4 className="column-title">Negative Differentials</h4>
                <div className="table-wrapper">
                  <table className="accuracy-table">
                    <thead>
                      <tr>
                        <th>Differential</th>
                        <th>Hit Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(accuracyTable)
                        .filter(([diff]) => parseInt(diff) < 0)
                        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                        .map(([diff, rate]) => (
                          <tr key={diff} className={diff == accuracyDiff ? 'highlighted-row' : ''}>
                            <td>{diff}</td>
                            <td>{rate.toFixed(2)}%</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
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
        
        <div className="strategy-tips">
          <h3 className="tips-title">Strategy Tips</h3>
          <ul className="tips-list">
            <li>When fighting higher-level monsters, prioritize using skills over basic attacks</li>
            <li>For optimal performance in endgame zones, aim for 85%+ hit rate</li>
            <li>In Midgard zones, you can get by with less accuracy due to the +20% hidden bonus</li>
            <li>If your hit rate is below 70%, prioritize accuracy over other stats</li>
          </ul>
        </div>
      </div>
      
      <div className="footer">
        <p>Based on data from <a href="https://www.inven.co.kr/webzine/news/?news=259851&site=odin" target="_blank" rel="noopener noreferrer">Inven.co.kr article</a></p>
        <p className="version">Calculator Version 1.1 | Last Updated: May 2025</p>
      </div>
    </div>
  );
};

export default OdinAccuracyCalculator;