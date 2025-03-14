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
      const shader_code = "precision highp float;\nuniform float time;\n\nvoid main(void) {\n  vec2 uv = gl_FragCoord.xy / vec2(512.0, 512.0);\n  vec3 col = vec3(uv.x, uv.y, (uv.x + uv.y) * 0.5);\n  col += sin((uv.x + time) * 10.0) * 0.1;\n  col += sin((uv.y + time) * 15.0) * 0.1;\n  gl_FragColor = vec4(col, 1.0);\n}"
      setShaderCode(shader_code);      
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