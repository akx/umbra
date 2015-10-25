const React = require("react");
const ReactDOM = require("react-dom");
const ShaderEditor = require("./ShaderEditor");
const cx = require("classnames");

class EditorTabs extends React.Component {
    render() {
        const tab = (id, title) => (
            <a href="#" key={id} className={cx("tab", {active: this.props.active === id})}>{title}</a>
        );
        return (
            <div className="tabs">
                {tab("shader", "Shader")}
                {tab("tweaks", "Tweaks")}
                <a href="#" className="new-button">+</a>
            </div>
        );
    }
}

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeTab: "shader"};
    }
    render() {
        var editorComp = null;
        if(this.state.activeTab === "shader") {
            editorComp = <ShaderEditor />;
        }

        return <div id="editor">
            <EditorTabs active={this.state.activeTab}/>
            <div className="main">{editorComp}</div>
        </div>;
    }
}
