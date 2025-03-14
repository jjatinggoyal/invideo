import React, { useState } from 'react';

const Calculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');


  const handleCalculate = () => {
    setResult(expression)
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
      <div className="result">{result}</div>
    </div>
  );
}

export default Calculator;