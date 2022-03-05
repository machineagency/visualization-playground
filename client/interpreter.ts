import { Toolpath, GCode, EBB, ExampleToolpaths } from './example-toolpaths.js'

export class Interpreter {
    constructor() {
    }

    static basicViz(toolpath: Toolpath<EBB>) {
        let moveCurves : THREE.LineCurve3[] = [];
        let getXyMmChangeFromABSteps = (aSteps: number, bSteps: number) => {
            let x = 0.5 * (aSteps + bSteps);
            let y = -0.5 * (aSteps - bSteps);
            // TODO: read this from an EM instruction
            let stepsPerMm = 80;
            return new THREE.Vector3(
                (x / stepsPerMm),
                (y / stepsPerMm),
                0.0
            );
        };
        let currentPosition = new THREE.Vector3();
        let newPosition : THREE.Vector3;
        let moveCurve: THREE.LineCurve3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange;
        toolpath.instructions.forEach((instruction) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
                aSteps = parseInt(tokens[2]);
                bSteps = parseInt(tokens[3]);
                xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
                newPosition = currentPosition.clone().add(xyChange);
                moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves.push(moveCurve);
                currentPosition = newPosition;
            }
        });
        let material = new THREE.MeshToonMaterial({
            color: 0xe44242,
            side: THREE.DoubleSide
        });
        let pathRadius = 0.25
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let meshes = geometries.map((geom) => {
            return new THREE.Mesh(geom, material);
        });
        let wrapperGroup = new THREE.Group();
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static orderViz(toolpath: Toolpath<EBB>) {
        // TODO
    }

};
