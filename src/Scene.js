const _ = require("lodash");
const defaultVertexShader = _.trim(`
attribute vec3 p;
void main(){gl_Position=vec4(p,1.);}
`);

const defaultFragmentShader = _.trim(`
precision mediump float;
uniform float time;
uniform vec2 resolution;
void main(void){
	vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
	gl_FragColor = vec4(abs(p.x), abs(p.y), mod(time, 1.0), 1.0);
}
`);

// h/t https://bocoup.com/weblog/counting-uniforms-in-webgl
function getProgramInfo(gl, program) {
    const result = {
            attributes: [],
            uniforms: [],
            attributeCount: 0,
            uniformCount: 0
        },
        activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS),
        activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    // Taken from the WebGl spec:
    // http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14
    var enums = {
        0x8B50: 'FLOAT_VEC2',
        0x8B51: 'FLOAT_VEC3',
        0x8B52: 'FLOAT_VEC4',
        0x8B53: 'INT_VEC2',
        0x8B54: 'INT_VEC3',
        0x8B55: 'INT_VEC4',
        0x8B56: 'BOOL',
        0x8B57: 'BOOL_VEC2',
        0x8B58: 'BOOL_VEC3',
        0x8B59: 'BOOL_VEC4',
        0x8B5A: 'FLOAT_MAT2',
        0x8B5B: 'FLOAT_MAT3',
        0x8B5C: 'FLOAT_MAT4',
        0x8B5E: 'SAMPLER_2D',
        0x8B60: 'SAMPLER_CUBE',
        0x1400: 'BYTE',
        0x1401: 'UNSIGNED_BYTE',
        0x1402: 'SHORT',
        0x1403: 'UNSIGNED_SHORT',
        0x1404: 'INT',
        0x1405: 'UNSIGNED_INT',
        0x1406: 'FLOAT'
    };

    // Loop through active uniforms
    for (var iUni = 0; iUni < activeUniforms; iUni++) {
        var uniform = gl.getActiveUniform(program, iUni);
        uniform.location = gl.getUniformLocation(program, uniform.name);
        uniform.typeName = enums[uniform.type];
        result.uniforms.push(uniform);
        result.uniformCount += uniform.size;
    }

    // Loop through active attributes
    for (var iAttr = 0; iAttr < activeAttributes; iAttr++) {
        var attribute = gl.getActiveAttrib(program, iAttr);
        attribute.location = gl.getAttribLocation(program, attribute.name);
        attribute.typeName = enums[attribute.type];
        result.attributes.push(attribute);
        result.attributeCount += attribute.size;
    }

    return result;
}


export default class Scene {
    constructor() {
        this.gl = null;
        this.program = null;
        this.info = null;
        this.uniformMap = {};
        this.attribMap = {};
        this.vertexShader = defaultVertexShader;
        this.fragmentShader = defaultFragmentShader;
        this.vertexBuffer = null;
        this.lastInfoLogs = null;
        this.ok = false;
        this.lastValid = {};
        this.resetTime();
    }

    setWebGLContext(gl) {
        this.gl = gl;
        this.link();
    }

    resetTime() {
        this.zeroTime = +new Date();
    }

    destroy() {
        const gl = this.gl;
        if (gl && this.vertexBuffer) {
            gl.deleteBuffer(this.vertexBuffer);
            this.vertexBuffer = null;
        }
        if (gl && this.program) {
            gl.deleteProgram(this.program);
            this.program = null;
            this.info = null;
        }
    }

    getStatus() {
        if(this.gl === null || this.program === null) return "invalid";
        if(this.ok === false) return "failed";
        return "ok";
    }

    link() {
        this.ok = false;
        const gl = this.gl;
        if(gl === null) return;
        const prg = gl.createProgram();
        const infoLogs = this.lastInfoLogs = {vertexShader: null, fragmentShader: null, link: null};
        const vSource = this.vertexShader.replace(/\r/gi, '');
        const fSource = this.fragmentShader.replace(/\r/gi, '');
        infoLogs.vertexShader = this._compileShader(prg, gl.VERTEX_SHADER, vSource);
        infoLogs.fragmentShader = this._compileShader(prg, gl.FRAGMENT_SHADER, fSource);
        if(infoLogs.vertexShader || infoLogs.fragmentShader) { // either compile failed
            this.lastInfoLogs = infoLogs;
            return false;
        }
        gl.linkProgram(prg);
        if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
            infoLogs.link = gl.getProgramInfoLog(prg);
            this.lastInfoLogs = infoLogs;
            return false;
        }
        this.destroy();
        this.program = prg;
        this._refreshInfo();
        this.lastValid = _.pick(this, ["vertexShader", "fragmentShader", "info"]);
        this.ok = true;
    }

    _refreshInfo() {
        const gl = this.gl;
        if(gl === null) return;
        const info = this.info = getProgramInfo(gl, this.program);
        const uMap = this.uniformMap = {};
        const aMap = this.attribMap = {};
        info.uniforms.forEach((uni) => { uMap[uni.name] = uni.location; });
        info.attributes.forEach((attr) => { aMap[attr.name] = attr.location; });
    }

    _compileShader(prg, shaderType, source) {
        const gl = this.gl;
        if(gl === null) throw new Error("no gl context");
        const shader = gl.createShader(gl[shaderType] || shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return gl.getShaderInfoLog(shader);
        }
        gl.attachShader(prg, shader);
        return gl.getShaderInfoLog(shader);
    }

    _recreateVertexBuffer() {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0]), gl.STATIC_DRAW);
        this.vertexBuffer = buffer;
    }

    draw(width, height) {
        const gl = this.gl;
        if(gl === null) return;
        const location = this.attribMap.p;
        if(location !== undefined) {
            if(!this.vertexBuffer) this._recreateVertexBuffer();
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
        }
        gl.clearColor(0, 0, 0, 1);
        gl.viewport(0, 0, width, height);
        gl.useProgram(this.program);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (this.uniformMap.time) gl.uniform1f(this.uniformMap.time, (+new Date() - this.zeroTime) * 0.001);
        if (this.uniformMap.resolution) gl.uniform2fv(this.uniformMap.resolution, [width, height]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
    }
}
