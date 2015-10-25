const React = require("react");
const ReactDOM = require("react-dom");

export default class WebGLViewport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {scene: null};
        this.gl = null;
        this.updateTimer = null;
    }

    componentDidMount() {
        this.gl = this.refs.canvas.getContext("webgl");
        this.setUpdateTimer(100);
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
        if(newProps.scene !== this.state.scene) {
            this.setState({scene: newProps.scene});
            console.log("scene updated");
        }
    }

    updateGl() {
        const gl = this.gl;
        const scene = this.state.scene;
        const width = 800;
        const height = 600;
        scene.draw(width, height);
    }

    render() {
        return <canvas width={800} height={600} ref="canvas"/>;
    }

    getGlContext() {
        return this.gl;
    }
}
