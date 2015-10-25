const React = require("react");
const ReactDOM = require("react-dom");

export default class WebGLViewport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {program: null};
        this.gl = null;
        this.vertexBuffer = null;
        this.updateTimer = null;
        this.resetTime();
    }

    componentDidMount() {
        this.gl = this.refs.canvas.getContext("webgl");
        this.initializeGl();
        this.setUpdateTimer(100);
    }

    initializeGl() {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0]), gl.STATIC_DRAW);
        this.vertexBuffer = buffer;
    }

    resetTime() {
        this.zeroTime = +new Date();
    }

    setUpdateTimer(interval) {
        interval = 0 | interval;
        if (interval <= 0) {
            clearInterval(this.updateTimer);
            return;
        }
        this.updateTimer = setInterval(this.updateGl.bind(this), interval);
    }

    componentWillUnmount() {
        this.setUpdateTimer(0);
    }

    componentWillReceiveProps(newProps) {
        if(newProps.program !== this.state.program) {
            this.setState({program: newProps.program});
            console.log("program updated");
        }
    }

    updateGl() {
        const gl = this.gl;
        const prog = this.state.program;
        const width = 800;
        const height = 600;
        if (!(gl && prog)) return;
        const location = prog.attribMap.p;
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
        gl.clearColor(0, 0, 0, 1);

        gl.viewport(0, 0, width, height);
        prog.use();
        const time = (+new Date() - this.zeroTime) * 0.001;
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (prog.uniformMap.time) gl.uniform1f(prog.uniformMap.time, d);
        if (prog.uniformMap.resolution) gl.uniform2fv(prog.uniformMap.resolution, [width, height]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
    }

    render() {
        return <canvas width={800} height={600} ref="canvas"/>;
    }

    getGlContext() {
        return this.gl;
    }
}
