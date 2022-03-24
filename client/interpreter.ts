import { Toolpath, GCode, EBB, ExampleToolpaths } from './example-toolpaths.js'

//make one for how fast it's drawn, speed

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
        let pathRadius = 0.25;
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let geometries2 = moveCurves2.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        //draws the figure
        let meshes = geometries.map((geom) => {
            return new THREE.Mesh(geom, material);
        });
        let meshes2 = geometries2.map((geom) => {
            return new THREE.Mesh(geom, material2);
        });

        //console.log(moveCurves2.length);

        let wrapperGroup = new THREE.Group();
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        meshes2.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

// Here is the link for the color guide
// https://krazydad.com/tutorials/makecolors.php
    static orderViz(toolpath: Toolpath<EBB>) {
        // TODO

        //order from when it's drawn
        //console.log(moveCurves);
         // console.log(moveCurves2);
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
         // toolpath.instructions.forEach((instruction) => {
         //     tokens = instruction.split(',');
         //     opcode = tokens[0];
         //     if (opcode === 'SM') {
         //       aSteps = parseInt(tokens[2]);
         //       bSteps = parseInt(tokens[3]);
         //       xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
         //
         //       //red
         //       if (flag === 1){
         //         newPosition = currentPosition.clone().add(xyChange);
         //         moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
         //         moveCurves.push(moveCurve);
         //
         //       }
         //       //blue
         //       if (flag === 0){
         //         newPosition = currentPosition.clone().add(xyChange);
         //         moveCurve2 = new THREE.LineCurve3(currentPosition, newPosition);
         //         moveCurves2.push(moveCurve2);
         //       }
         //       currentPosition = newPosition;
         //
         //     }
         //     //change the z axis depending on pen
         //     if (opcode === 'SP') {
         //         flag = parseInt(tokens[1]);
         //         if (flag === 0 ){
         //           newPosition = currentPosition.clone().setZ(3);
         //         }
         //         if (flag === 1 ){
         //           newPosition = currentPosition.clone().setZ(0);
         //         }
         //         moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
         //         moveCurves.push(moveCurve);
         //         currentPosition = newPosition;
         //     }
         //
         // });

         //original will draw everything but very no offset in the z axis
         // toolpath.instructions.forEach((instruction) => {
         //     tokens = instruction.split(',');
         //     opcode = tokens[0];
         //     if (opcode === 'SM') {
         //       //if (flag == 1){
         //         aSteps = parseInt(tokens[2]);
         //         bSteps = parseInt(tokens[3]);
         //         xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
         //         newPosition = currentPosition.clone().add(xyChange);
         //         moveCurve2 = new THREE.LineCurve3(currentPosition, newPosition);
         //         moveCurves2.push(moveCurve2);
         //         currentPosition = newPosition;
         //       //}
         //
         //     }
         //     if (opcode === 'SP') {
         //         flag = parseInt(tokens[1]);
         //         //how do i get the new positions??
         //         //moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
         //     //   moveCurves.push(moveCurve);
         //     //   currentPosition = newPosition;
         //     }
         //     //so something about just moving the position without drawing if the pen is up
         //     //value is either 0 or 1, indicating to raise or lower the pen
         //
         //     //vi har sat et flag, men vi har brug for at den kører fra nuværende
         //     //position indtil den for næste position
         // });


         //lowered
         let material = new THREE.MeshToonMaterial({
             color: 0xe44242,
             side: THREE.DoubleSide
         });
         //raised
         let colors : THREE.Color[] = [];
         // for (let i = 0; i < 256; i++) {
         //   colors.push(new THREE.Color("rgb(" + i + ", 255, 255)"));
         // };
         //
         // let RGB2Color = (r : number, g : number, b : number) =>
         // {
         //   return new THREE.Color("rgb(" + Math.round(r) + "," + Math.round(g)
         //                                 + "," + Math.round(b) + ")");
         // };
         //
         //
         // let makeColorGradient = (frequency : number, phase1 : number, phase2 : number,
         //   phase3 : number, center : number, width : number, len : number) => {
         //     if (center == undefined)   center = 128;
         //     if (width == undefined)    width = 127;
         //     if (len == undefined)      len = 50;
         //
         //     for (var i = 0; i < len; ++i){
         //       let red = Math.sin(frequency*i + phase1) * width + center;
         //       let grn = Math.sin(frequency*i + phase2) * width + center;
         //       let blu = Math.sin(frequency*i + phase3) * width + center;
         //       //return RGB2Color(red,grn,blu);
         //       return new THREE.Color("rgb(" + Math.round(red) + "," + Math.round(grn)
         //                                     + "," + Math.round(blu) + ")");
         //       //document.write( '<font color="' + RGB2Color(red,grn,blu) + '">&#9608;</font>');
         //     }
         //  };

         let center = 128;
         let width = 127;
         let steps = 6;

         //repeating cycles
         //let frequency = 2*Math.PI/steps;

         //non repeating
         //let frequency = 2.4;

         //rainbow color
         let frequency = Math.PI*2/moveCurves2.length;
         let phase1 = 0;
         let phase2 = 2;
         let phase3 = 4;

         for (var i = 0; i < moveCurves2.length; ++i){
           let red = Math.sin(frequency*i + phase1) * width + center;
           let grn = Math.sin(frequency*i + phase2) * width + center;
           let blu = Math.sin(frequency*i + phase3) * width + center;
           //return RGB2Color(red,grn,blu);
           colors.push(new THREE.Color("rgb(" + Math.round(red) + "," + Math.round(grn)
                                         + "," + Math.round(blu) + ")"));
           //document.write( '<font color="' + RGB2Color(red,grn,blu) + '">&#9608;</font>');
         };
         // for (let i = 0; i < n; i++) {
         //   colors.push( makeColorGradient(frequency, 0, 2, 4, center, width, n));
         // };


         //define the line?
         let pathRadius = 0.25;
         let geometries = moveCurves.map((curve) => {
             return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
         });
         let geometries2 = moveCurves2.map((curve) => {
             return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
         });

         //draws the figure
         let meshes = geometries.map((geom) => {
             return new THREE.Mesh(geom, material);
         });
         let meshes2: THREE.Mesh[] = [];
         for (let i = 0; i < moveCurves2.length; i++) {
           meshes2.push(new THREE.Mesh(geometries2[i], (new THREE.MeshToonMaterial({
                   color: colors[i],
                   side: THREE.DoubleSide}))));
         };

         let colorbar : THREE.LineCurve3[] = [];
         for (let i = 0; i < moveCurves2.length; i++){
           colorbar.push(new THREE.LineCurve3(new THREE.Vector3(i*2,0,0), new THREE.Vector3((i+1)*2,0,0)));
         };

         let geometries3 = colorbar.map((a) => {
             return new THREE.TubeBufferGeometry(a, 64, 1, 64, false);
         });

         let meshes3: THREE.Mesh[] = [];
         for (let i = 0; i < moveCurves2.length; i++) {
           meshes3.push(new THREE.Mesh(geometries3[i], (new THREE.MeshToonMaterial({
                   color: colors[i],
                   side: THREE.DoubleSide}))));
         };

         let wrapperGroup = new THREE.Group();
         meshes.forEach((mesh) => wrapperGroup.add(mesh));
         meshes2.forEach((mesh) => wrapperGroup.add(mesh));
         meshes3.forEach((mesh) => wrapperGroup.add(mesh));
         wrapperGroup.rotateX(Math.PI / 2);
         return wrapperGroup;

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
        let pathRadius = 0.25;
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let geometries2 = moveCurves2.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });

        let spheres  =  coordinates.map((sphere) => {
            return new THREE.SphereGeometry(0.5);
        });

        //draws the figure in given color
        let meshes = geometries.map((geom) => {
            return new THREE.Mesh(geom, materialR);
        });
        let meshes2 = geometries2.map((geom) => {
            return new THREE.Mesh(geom, materialB);
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
