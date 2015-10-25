const Reflux = require("reflux");
const Scene = require("./Scene");

export var SceneActions = Reflux.createActions([
    "updateFragmentShader"
]);

export var sceneStore = Reflux.createStore({
    listenables: [SceneActions],
    scene: null,
    init: function() {
        this.scene = new Scene();
    },
    updateFragmentShader: function(newSource) {
        this.scene.fragmentShader = newSource;
        this.scene.link();
        this.trigger(this.scene);
    },
    setWebGLContext: function(gl) {
        this.scene.setWebGLContext(gl);
        this.trigger(this.scene);
    }
});
