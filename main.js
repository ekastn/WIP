const vertexShaderSource = `
attribute vec4 position;
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = position;
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

varying vec2 vUv;

void main() {
    vec2 st = gl_FragCoord.xy / resolution;
    vec2 p = -1.0 + 2.0 * st;

    float a = time * 40.0;
    float d, e, f, g = 1.0 / 12.0, h, i, r, q;
    e = 20.0 * (p.x * 0.5 + 0.5);
    f = 20.0 * (p.y * 0.5 + 0.5);
    i = 100.0 + sin(e * g + a / 150.0) * 20.0;
    d = 100.0 + cos(f * g / 2.0) * 18.0 + cos(e * g) * 7.0;
    r = sqrt(pow(abs(i - e), 2.0) + pow(abs(d - f), 2.0));
    q = f / r;
    e = (r * cos(q)) - a / 2.0;
    f = (r * sin(q)) - a / 2.0;
    d = sin(e * g) * 176.0 + sin(e * g) * 164.0 + r;
    h = ((f + d) + a / 2.0) * g;
    i = cos(h + r * p.x / 1.3) * (e + e + a) + cos(q * g * 6.0) * (r + h / 3.0);
    h = sin(f * g) * 144.0 - sin(e * g) * 212.0 * p.x;
    h = (h + (f - e) * q + sin(r - (a + h) / 7.0) * 10.0 + i / 4.0) * g;

    float complexShape = i + sin(time * 0.5) * 0.5;

    float mouseDist = length(mouse - st) * 5.0;
    float pulse = sin(mouseDist * 3.0 + time * 1.5) * 0.2 + 0.8;

    float wavePattern = sin(p.x * 25.0 + time * 0.6) * 0.5 + cos(p.y * 15.0 + time * 0.8) * 0.5;
    float finalPattern = complexShape + wavePattern * 0.4;

    vec3 color = vec3(
        (finalPattern / 2.0 + d / 10.0) * pulse,
        (finalPattern / 1.8 + d / 14.0) * 0.9,
        finalPattern * 0.8 + pulse * 0.1
    );

    color.r += sin(time * 0.5) * 0.2;
    color.g += cos(time * 0.3) * 0.2;
    color.b += sin(time * 0.7) * 0.2;

    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
`;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const gl = canvas.getContext("webgl");
if (!gl) {
    throw new Error("WebGL not supported");
}

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
};
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const mouse = { x: 0.5, y: 0.5 };
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
});

// Create shaders
const compileShader = (source, type) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
};
const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

// Create program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// Set up geometry
const vertices = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const position = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

// Set uniforms
const timeUniform = gl.getUniformLocation(program, "time");
const resolutionUniform = gl.getUniformLocation(program, "resolution");
const mouseUniform = gl.getUniformLocation(program, "mouse");

// Animation loop
const animate = (time) => {
    gl.uniform1f(timeUniform, time * 0.001);
    gl.uniform2f(resolutionUniform, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(mouseUniform, mouse.x, mouse.y);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    requestAnimationFrame(animate);
};
animate(0);

