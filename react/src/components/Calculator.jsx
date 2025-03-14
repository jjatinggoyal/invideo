import React, { useState, useEffect } from 'react';
import init, { calculate } from '../../../rust/pkg';
import './Calculator.css';

const Calculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [wasmLoaded, setWasmLoaded] = useState(false);

  useEffect(() => {
    init().then(() => setWasmLoaded(true));
  }, []);

  const handleCalculate = () => {
    if (!wasmLoaded) return;
    try {
      const calculatedResult = calculate(expression);
      setResult(calculatedResult.toString());
    } catch (error) {
      setResult('Error: Invalid expression');
    }
  };

  return (
    <div className="calculator">
      <input
        type="text"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="Enter mathematical expression (e.g., 2+2)"
      />
      <button onClick={handleCalculate}>Calculate</button>
      <div className="result-container">
        <div className="result-label">Result</div>
        <div className="result">{result || '0'}</div>
      </div>
    </div>
  );
}

export default Calculator;