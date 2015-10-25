const React = require("react");
const ReactDOM = require("react-dom");
const CodemirrorComponent = require("react-codemirror");
const CodeMirror = require("codemirror");
const state = require("./state");

function getSceneAnnotations(text, options, cm) {
    const scene = state.sceneStore.scene;
    if(scene.getStatus() === "failed") {
        const fsLog = scene.lastInfoLogs.fragmentShader;
        return fsLog.split("\n").map((line) => {
            const m = /^.+?\d:(\d+): (.+)$/.exec(line);
            if(m) {
                const pos = CodeMirror.Pos((0 | m[1]) - 1, 1);
                return {severity: "error", from: pos, to: pos, message: m[2]};
            }
            return null;
        }).filter(Boolean);
    }
    return [];

    //from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
    //            to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
    //return [{message: "no!"}];
}

export default class ShaderEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {infoLogs: {}};
    }
    getOptions() {
        return {
            theme: "monokai",
            lineNumbers: true,
            mode: "text/x-glsl",
            lint: {getAnnotations: getSceneAnnotations}
        };
    }
    updateCode(newCode) {
        state.sceneStore.updateFragmentShader(newCode);
        this.setState({infoLogs: state.sceneStore.scene.lastInfoLogs});
    }
    render() {
        const scene = this.props.scene;
        const infoLogs = this.state.infoLogs;
        const infoLogElts = _.keys(infoLogs).sort().map((key) => {
            const value = infoLogs[key];
            if (!value) return null;
            return <div key={key}><h2>{key}</h2>
                <pre>{value}</pre>
            </div>;
        });
        return <div>
            <CodemirrorComponent
                value={scene ? scene.fragmentShader : ""}
                options={this.getOptions()}
                onChange={this.updateCode.bind(this)}
            />
            {infoLogElts}
        </div>;
    }
}
