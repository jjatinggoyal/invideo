import React, { useState, useRef, useEffect } from 'react';
import { WebGLManager } from '../utils/webgl';
import './ShaderGenerator.css';

const ShaderGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [shaderCode, setShaderCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      setError('');
      setShaderCode(''); // Clear existing shader code
      
      // Clear canvas
      if (webglRef.current) {
        webglRef.current.clearCanvas();
      }
      
      const apiHost = import.meta.env.VITE_API_HOST || 'http://localhost:4000';
      const response = await fetch(`${apiHost}/api/generate_shader`, {
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
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          required
        />
        <button 
          onClick={handleGenerateShader} 
          disabled={isLoading || !prompt.trim()}
        >
          Generate Shader
          {isLoading && <div className="spinner" />}
        </button>
      </div>
      
      <div className="display-section">
        <div className="canvas-container">
          <h3>Preview</h3>
          <canvas ref={canvasRef} width="500" height="500" />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="code-container">
          <h3>Generated Shader Code</h3>
          <pre className="shader-code">{shaderCode}</pre>
        </div>
      </div>
    </div>
  );
}

export default ShaderGenerator;