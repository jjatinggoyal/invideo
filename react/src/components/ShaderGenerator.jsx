import React, { useState, useRef, useEffect } from 'react';
import { WebGLManager } from '../utils/webgl';

const ShaderGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [shaderCode, setShaderCode] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const webglRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        webglRef.current = new WebGLManager(canvasRef.current);
      } catch (err) {
        setError('WebGL initialization failed: ' + err.message);
      }
    }
  }, []);

  const handleGenerateShader = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:4000/api/generate_shader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      setShaderCode(data.shader_code);
      
      if (webglRef.current) {
        try {
          webglRef.current.renderShader(data.shader_code);
        } catch (err) {
          setError('Shader compilation failed: ' + err.message);
        }
      }
    } catch (error) {
      setError('API request failed: ' + error.message);
    }
  };

  return (
    <div className="shader-generator">
      <div className="input-section">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the shader you want"
        />
        <button onClick={handleGenerateShader}>Generate Shader</button>
      </div>
      
      <div className="display-section">
        <canvas ref={canvasRef} width="500" height="500" />
        {error && <div className="error">{error}</div>}
        <pre className="shader-code">{shaderCode}</pre>
      </div>
    </div>
  );
}

export default ShaderGenerator;