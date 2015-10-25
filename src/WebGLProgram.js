const defaultVertexShader = `
attribute vec3 p;
void main(){gl_Position=vec4(p,1.);}
`;

const defaultFragmentShader = `
precision mediump float;
uniform float time;
uniform vec2 resolution;
void main(void){
	vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
	gl_FragColor = vec4(p.x, p.y, 0, 1.0);
}
`;

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


export default class Program {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.info = null;
        this.uniformMap = {};
        this.attribMap = {};
        this.vertexShader = defaultVertexShader;
        this.fragmentShader = defaultFragmentShader;
    }

    destroy() {
        if (this.program) {
            this.gl.deleteProgram(this.program);
            this.program = null;
            this.info = null;
        }
    }

    link() {
        this.destroy();
        const gl = this.gl;
        const prg = gl.createProgram();
        const vSource = this.vertexShader.replace(/\r/gi, '');
        const fSource = this.fragmentShader.replace(/\r/gi, '');
        const vRes = this._compileShader(prg, gl.VERTEX_SHADER, vSource);
        const fRes = this._compileShader(prg, gl.FRAGMENT_SHADER, fSource);
        if (vRes || fRes) throw new Error("Pre-link error");
        gl.linkProgram(prg);
        if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
            throw new Error("Link error: " + gl.getProgramInfoLog(prg));
        }
        this.program = prg;
        this._refreshInfo();
    }

    _refreshInfo() {
        const gl = this.gl;
        const info = this.info = getProgramInfo(gl, this.program);
        const uMap = this.uniformMap = {};
        const aMap = this.attribMap = {};
        info.uniforms.forEach((uni) => { uMap[uni.name] = uni.location; });
        info.attributes.forEach((attr) => { aMap[attr.name] = attr.location; });
    }

    _compileShader(prg, shaderType, source) {
        const gl = this.gl;
        const shader = gl.createShader(gl[shaderType] || shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const infoLog = gl.getShaderInfoLog(shader);
            throw new Error("Compile error: " + infoLog);
        }
        gl.attachShader(prg, shader);
        return gl.getShaderInfoLog(shader);
    }

    use() {
        const gl = this.gl;
        gl.useProgram(this.program);
    }
}
