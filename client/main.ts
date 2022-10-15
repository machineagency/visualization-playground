import { VisualizationSpace } from './visualization-space.js'
import { VisualizationInterpreters } from './interpreter.js'
import { ExampleToolpaths, Toolpath, EBB, GCode } from './example-toolpaths.js'

const main = () => {
    const vs = new VisualizationSpace();
    const someToolpath = ExampleToolpaths.gears;
    const toolpathViz = VisualizationInterpreters.gCodeOrderViz(someToolpath);
    vs.addVizWithName(toolpathViz, 'Basic Path Viz');

};

window.onload = function() {
    main();
}
