const React = require("react");
const ReactDOM = require("react-dom");
const WebGLViewport = require("./WebGLViewport");
const state = require("./state");

export default class Preview extends React.Component {
    componentDidMount() {
        console.log(this.refs.viewport.getGlContext());
    }
    getGlContext() {
        return this.refs.viewport.getGlContext();
    }
    render() {
        return <div id="preview">
            <WebGLViewport ref="viewport" scene={state.sceneStore.scene} />
        </div>;
    }
}
