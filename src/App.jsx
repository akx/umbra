const React = require("react");
const ReactDOM = require("react-dom");
const Editor = require("./Editor");
const Preview = require("./Preview");
const state = require("./state");

var globalGlContext = null;

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {scene: null};
    }
    componentDidMount() {
        globalGlContext = this.refs.preview.getGlContext();
        state.sceneStore.setWebGLContext(globalGlContext);
        this.setState({scene: state.sceneStore.scene});
    }

    render() {
        return <div id="app">
            <div id="header">Umbra</div>
            <div id="main-row">
                <Editor />
                <Preview ref="preview" />
            </div>
        </div>;
    }
}
