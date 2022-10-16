import { VisualizationSpace } from './visualization-space.js'
import { VisualizationInterpreters } from './interpreter.js'
import { ExampleToolpaths, Toolpath, EBB, GCode } from './example-toolpaths.js'

interface IR {
    isa: EBB | GCode;
    original: string;
    opcode: string;
    args: Record<string, number | null>;
    timestamp: number;
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
        return parseFloat(maybeArgResults[1]) || null;
    };

    let opcode: string;
    let opX: number | null, opY: number | null, opZ: number | null,
        opF: number | null;
    let positions: THREE.Vector3[] = [
        new THREE.Vector3()
    ];
    return toolpath.instructions.map((instruction: string) => {
        opcode = findOpcode(instruction, opcodeRe);
        if (opcode === 'G0' || opcode === 'G1') {
          opX = findArg(instruction, opXRe),
          opY = findArg(instruction, opYRe),
          opZ = findArg(instruction, opZRe)
          opF = findArg(instruction, opFRe)
        }
        return {
            isa: 'gcode',
            original: instruction,
            opcode: opcode,
            args: {
                x: opX,
                y: opY,
                z: opZ,
                f: opF
            },
            timestamp: 0
        }
    });
}

const calculateTimes = (irs: IR[]): IR[] => {
    interface State {
        x: number;
        y: number;
        z: number;
        f: number;
    }
    let newIrs = structuredClone(irs);
    let curState: State = { x: 0, y: 0, z: 0, f: 1 };
    let newState: State = { x: 0, y: 0, z: 0, f: 1 };
    irs.forEach((ir, i) => {
        if (i === 0) {
            newIrs[i].timestamp = 0;
            return;
        }
        let prevIr = newIrs[i - 1];
        if (ir.opcode !== 'G0' && ir.opcode !== 'G1') {
            newIrs[i].timestamp = prevIr.timestamp;
            return
        }
        newState.x = ir.args.x || curState.x;
        newState.y = ir.args.y || curState.y;
        newState.z = ir.args.z || curState.z;
        newState.f = ir.args.f || curState.f;
        let distance = Math.sqrt(
            (newState.x - curState.x) ** 2
            + (newState.y - curState.y) ** 2
            + (newState.z - curState.z) ** 2
        );
        let time = distance / newState.f;
        newIrs[i].timestamp = prevIr.timestamp + time;
        curState.x = newState.x;
        curState.y = newState.y;
        curState.z = newState.z;
        curState.f = newState.f;
    });
    return newIrs;
}

// FIXME: eventually remove need to toolpath
const makeScrubber = (irs: IR[], tp: Toolpath<GCode>, vs: VisualizationSpace) => {
    let finalIr = irs[irs.length - 1];
    let finalTime = Math.ceil(finalIr.timestamp);
    let slider = document.createElement('input');
    slider.id = 'scrubber';
    slider.type = 'range';
    slider.min = '0';
    slider.max = `${irs.length - 1}`;
    slider.value = `${irs.length - 1}`;
    slider.step = '1';
    slider.oninput = (e: Event) => {
        let timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            let i = parseInt(slider.value);
            let time = irs[i].timestamp;
            let hours = Math.floor(time / 3600);
            let minutes = Math.floor(time / 60);
            let seconds = Math.round(((time % 60) * 10000) / 10000);
            timeDisplay.innerText = `${minutes}m ${seconds}s - #${i}`;
            vs.removeAllViz();
            let clippedTp = {
                instructions: tp.instructions.slice(0, i)
            };
            let viz = VisualizationInterpreters.gCodeOrderViz(clippedTp);
            vs.addVizWithName(viz, 'idk man');
        }
    };
    let controlsDom = document.getElementById('controls');
    if (!controlsDom) {
        throw Error('Could not find controls dom');
    }
    controlsDom.appendChild(slider);
};

const main = () => {
    const vs = new VisualizationSpace();
    const someToolpath = ExampleToolpaths.gears;
    const toolpathClipped: Toolpath<GCode> = {
        instructions: someToolpath.instructions.slice(500, 1000)
    };
    const toolpathViz = VisualizationInterpreters.gCodeOrderViz(someToolpath);
    vs.addVizWithName(toolpathViz, 'Basic Path Viz');
    const irs = parseGCode(someToolpath);
    const irTimes = calculateTimes(irs);
    console.log(irTimes);
    makeScrubber(irTimes, someToolpath, vs);
};

window.onload = function() {
    main();
}
