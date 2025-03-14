import React, { useState } from 'react';
import Calculator from './components/Calculator';
import ShaderGenerator from './components/ShaderGenerator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="App">
      <div className="tabs">
        <button 
          className={activeTab === 'calculator' ? 'active' : ''} 
          onClick={() => setActiveTab('calculator')}
        >
          Calculator
        </button>
        <button 
          className={activeTab === 'shader' ? 'active' : ''} 
          onClick={() => setActiveTab('shader')}
        >
          Shader Generator
        </button>
      </div>
      
      <div className="content">
        {activeTab === 'calculator' ? <Calculator /> : <ShaderGenerator />}
      </div>
    </div>
  );
}

export default App;
