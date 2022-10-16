import { VisualizationSpace } from './visualization-space.js'
import { VisualizationInterpreters } from './interpreter.js'
import { ExampleToolpaths, Toolpath, EBB, GCode } from './example-toolpaths.js'

interface IR {
    isa: EBB | GCode;
    opcode: string;
    args: Record<string, number | null>
}

const parseGCode = (toolpath: Toolpath<GCode>): IR[] => {
    let opcodeRe = /(G[0-9]+|M[0-9]+)/;
    let opXRe = /X(-?[0-9]+.[0-9]+)/;
    let opYRe = /Y(-?[0-9]+.[0-9]+)/;
    let opZRe = /Z(-?[0-9]+.[0-9]+)/;
    let opFRe = /F(-?[0-9]+.[0-9]+)/;
    let findOpcode = (instruction: string, argRe: RegExp) => {
        let maybeArgResults = instruction.match(argRe);
        if (!maybeArgResults) { return ''; }
        return maybeArgResults[0];
    };
    let findArg = (instruction: string, argRe: RegExp) => {
        let maybeArgResults = instruction.match(argRe);
        if (!maybeArgResults || maybeArgResults.length < 2) {
            return null;
        }
        return parseFloat(maybeArgResults[1]) || 0;
    };

    let opcode: string;
    let opX: number | null, opY: number | null, opZ: number | null;
    let positions: THREE.Vector3[] = [
        new THREE.Vector3()
    ];
    return toolpath.instructions.map((instruction: string) => {
        opcode = findOpcode(instruction, opcodeRe);
        if (opcode === 'G0' || opcode === 'G1') {
          opX = findArg(instruction, opXRe),
          opY = findArg(instruction, opYRe),
          opZ = findArg(instruction, opZRe)
        }
        return {
            isa: 'gcode',
            opcode: opcode,
            args: {
                x: opX,
                y: opY,
                z: opZ
            }
        }
    });

}

const main = () => {
    const vs = new VisualizationSpace();
    const someToolpath = ExampleToolpaths.gears;
    const toolpathViz = VisualizationInterpreters.gCodeOrderViz(someToolpath);
    vs.addVizWithName(toolpathViz, 'Basic Path Viz');
    console.log(parseGCode(someToolpath));
};

window.onload = function() {
    main();
}
