const React = require("react");
const ReactDOM = require("react-dom");
const App = require("./App");
require("!style!css!stylus!./umbra.styl");
require("!style!css!codemirror/lib/codemirror.css");
require("!style!css!codemirror/theme/monokai.css");
require("./vendor/glsl");
const wrapper = document.createElement("div");
wrapper.id = "wrapper";
document.body.appendChild(wrapper);
ReactDOM.render(<App />, wrapper);
window.React = React;  // For debugging
