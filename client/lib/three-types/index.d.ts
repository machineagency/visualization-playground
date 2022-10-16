// Type definitions for three 0.137
// Project: https://threejs.org/
// Definitions by: Josh Ellis <https://github.com/joshuaellis>
//                 Nathan Bierema <https://github.com/Methuselah96>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// Minimum TypeScript Version: 3.6

export * from './src/Three';
// Add additional typing
export * from './examples/jsm/controls/OrbitControls';
export * from './examples/jsm/lines/LineGeometry';
export * from './examples/jsm/lines/LineMaterial';
export * from './examples/jsm/lines/Line2';

/*~ If this module is a UMD module that exposes a global variable 'myLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace THREE;
