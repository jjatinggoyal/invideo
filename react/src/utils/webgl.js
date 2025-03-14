export class WebGLManager {
    constructor(canvas) {
        this.gl = canvas.getContext('webgl2');
        if (!this.gl) {
            throw new Error('WebGL 2.0 not supported');
        }
        // Initialize with white background
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error('Shader compilation error: ' + info);
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Shader program link error: ' + this.gl.getProgramInfoLog(program));
        }
        return program;
    }

    clearCanvas() {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0); // White background
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    preprocessShader(source) {
        // Ensure shader starts with version and precision declarations
        const requiredHeader = `#version 300 es
precision highp float;
`;
        // Remove any existing version directives
        const cleanedSource = source.replace(/#version.*\n/, '');
        return requiredHeader + cleanedSource;
    }

    renderShader(fragmentShaderSource) {
        const vertexShaderSource = `#version 300 es
            in vec4 position;
            void main() {
                gl_Position = position;
            }
        `;

        const processedFragmentShader = this.preprocessShader(fragmentShaderSource);
        
        const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(processedFragmentShader, this.gl.FRAGMENT_SHADER);
        const program = this.createProgram(vertexShader, fragmentShader);

        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ]);

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        this.gl.useProgram(program);
        const positionLocation = this.gl.getAttribLocation(program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Add viewport setting to ensure correct resolution
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Set up uniforms
        const timeLocation = this.gl.getUniformLocation(program, 'time');
        const resolutionLocation = this.gl.getUniformLocation(program, 'resolution');
        
        // Set resolution uniform
        this.gl.uniform2f(resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);
        
        // Animation loop
        let startTime = performance.now();
        const animate = () => {
            const currentTime = (performance.now() - startTime) * 0.001; // Convert to seconds
            this.gl.uniform1f(timeLocation, currentTime);
            
            // Clear and draw
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
    }

    // Add cleanup method
    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}
