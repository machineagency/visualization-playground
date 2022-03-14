import { Toolpath, GCode, EBB, ExampleToolpaths } from './example-toolpaths.js'

export class Interpreter {
    constructor() {
    }

    static basicViz(toolpath: Toolpath<EBB>) {
        let moveCurves : THREE.LineCurve3[] = [];
        let moveCurves2 : THREE.LineCurve3[] = [];
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
        //flag is 1 because of the z axis is flipped
        let flag = 1;
        let currentPosition = new THREE.Vector3();
        let newPosition : THREE.Vector3;
        let moveCurve: THREE.LineCurve3;
        let moveCurve2: THREE.LineCurve3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange;
        toolpath.instructions.forEach((instruction) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
              aSteps = parseInt(tokens[2]);
              bSteps = parseInt(tokens[3]);
              xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);

              //red
              if (flag === 1){
                newPosition = currentPosition.clone().add(xyChange);
                moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves.push(moveCurve);

              }
              //blue
              if (flag === 0){
                newPosition = currentPosition.clone().add(xyChange);
                moveCurve2 = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves2.push(moveCurve2);
              }
              currentPosition = newPosition;

            }
            //change the z axis depending on pen
            if (opcode === 'SP') {
                flag = parseInt(tokens[1]);
                if (flag === 0 ){
                  newPosition = currentPosition.clone().setZ(3);
                }
                if (flag === 1 ){
                  newPosition = currentPosition.clone().setZ(0);
                }
                moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves.push(moveCurve);
                currentPosition = newPosition;
            }

        });
        //lowered
        let material = new THREE.MeshToonMaterial({
            color: 0xe44242,
            side: THREE.DoubleSide
        });
        //raised
        let material2 = new THREE.MeshToonMaterial({
            color: 0x3D85C6,
            side: THREE.DoubleSide
        });
        //define the line?
        let pathRadius = 0.25
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let geometries2 = moveCurves2.map((curve2) => {
            return new THREE.TubeBufferGeometry(curve2, 64, pathRadius, 64, false);
        });
        //draws the figure
        let meshes = geometries.map((geom) => {
            return new THREE.Mesh(geom, material);
        });
        let meshes2 = geometries2.map((geom2) => {
            return new THREE.Mesh(geom2, material2);
        });

        let wrapperGroup = new THREE.Group();
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        meshes2.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static orderViz(toolpath: Toolpath<EBB>) {
        // TODO
        //order in speed how fast it's drawn
        //console.log(moveCurves);
         // console.log(moveCurves2);
    }

    //The begining of the heatmap? function
    static pointViz(toolpath: Toolpath<EBB>) {
        let moveCurves : THREE.LineCurve3[] = [];
        let moveCurves2 : THREE.LineCurve3[] = [];
        let coordinates : Array<Array<number>> = [];
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
        //flag is 1 because of the z axis is flipped
        let flag = 1;
        let currentPosition = new THREE.Vector3();
        let newPosition : THREE.Vector3;
        let moveCurve: THREE.LineCurve3;
        let moveCurve2: THREE.LineCurve3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange;
        toolpath.instructions.forEach((instruction) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
              aSteps = parseInt(tokens[2]);
              bSteps = parseInt(tokens[3]);
              xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
              //red
              if (flag === 1){
                newPosition = currentPosition.clone().add(xyChange);
                moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves.push(moveCurve);
              }
              //blue
              if (flag === 0){
                newPosition = currentPosition.clone().add(xyChange);
                moveCurve2 = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves2.push(moveCurve2);
                //get the coordinates and then push them in to the array with coordinates
                let point = [newPosition.x, newPosition.y, newPosition.z];
                coordinates.push(point);
              }
              currentPosition = newPosition;
            }
            //change the z axis depending on pen
            if (opcode === 'SP') {
                flag = parseInt(tokens[1]);
                if (flag === 0 ){
                  newPosition = currentPosition.clone().setZ(3);
                }
                if (flag === 1 ){
                  newPosition = currentPosition.clone().setZ(0);
                }
                moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves.push(moveCurve);
                currentPosition = newPosition;
            }
        });

        //lowered
        let materialR = new THREE.MeshToonMaterial({
            color: 0xe44242,
            side: THREE.DoubleSide
        });
        //raised
        let materialB = new THREE.MeshToonMaterial({
            color: 0x3D85C6,
            side: THREE.DoubleSide
        });
        let materialW = new THREE.MeshToonMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });

        //define the line?
        let pathRadius = 0.25
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let geometries2 = moveCurves2.map((curve2) => {
            return new THREE.TubeBufferGeometry(curve2, 64, pathRadius, 64, false);
        });

        let spheres  =  coordinates.map((sphere) => {
            return new THREE.SphereGeometry(0.5);
        });

        //draws the figure in given color
        let meshes = geometries.map((geom) => {
            return new THREE.Mesh(geom, materialR);
        });
        let meshes2 = geometries2.map((geom2) => {
            return new THREE.Mesh(geom2, materialB);
        });
        let meshes3 = spheres.map((sphere) => {
            return new THREE.Mesh(sphere, materialW);
        });

        //set the sphere mesh position to the ith element in the coordinate array
        for (let i = 0; i < coordinates.length; i++) {
          meshes3[i].position.set(coordinates[i][0], coordinates[i][1], coordinates[i][2]);
        };

        let wrapperGroup = new THREE.Group();
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        meshes2.forEach((mesh) => wrapperGroup.add(mesh));
        meshes3.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;

    }
};
