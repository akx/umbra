const React = require("react");
const ReactDOM = require("react-dom");
const Codemirror = require("react-codemirror");

export default class ShaderEditor extends React.Component {
    getOptions() {
        return {
            theme: "monokai",
            lineNumbers: true,
            mode: "text/x-glsl"
        };
    }
    render() {
        return <Codemirror value="hi" options={this.getOptions()} />;
    }
}
