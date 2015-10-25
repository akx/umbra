const React = require("react");
const ReactDOM = require("react-dom");
const Editor = require("./Editor");
const Preview = require("./Preview");
const WebGLProgram = require("./WebGLProgram");

var globalGlContext = null;

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {program: null};
    }
    componentDidMount() {
        globalGlContext = this.refs.preview.getGlContext();
        const prog = new WebGLProgram(globalGlContext);
        prog.link();
        this.setState({program: prog});
    }

    render() {
        return <div id="app">
            <div id="header">Umbra</div>
            <div id="main-row">
                <Editor/>
                <Preview ref="preview" program={this.state.program} />
            </div>
        </div>;
    }
}
