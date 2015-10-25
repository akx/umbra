const React = require("react");
const ReactDOM = require("react-dom");
const WebGLViewport = require("./WebGLViewport");

export default class Preview extends React.Component {
    componentDidMount() {
        console.log(this.refs.viewport.getGlContext());
    }
    getGlContext() {
        return this.refs.viewport.getGlContext();
    }
    render() {
        return <div id="preview">
            <WebGLViewport ref="viewport" program={this.props.program} />
        </div>;
    }
}
