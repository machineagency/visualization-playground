/// <reference path="lib/three-types/index.d.ts" />
import { Toolpath, GCode, EBB, ExampleToolpaths } from './example-toolpaths.js'

type VizGroup = THREE.Group;

// export type InterpreterSignature = (tp: Toolpath) => VizGroup;

export class VisualizationInterpreters {
    // EBB

    public static basicVizCurves(toolpath: Toolpath<EBB>) : THREE.LineCurve3[] {
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
        let tokens, opcode, duration, penValue, aSteps, bSteps, xyChange;
        let toolOnBed = false;
        toolpath.instructions.forEach((instruction: string) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
                aSteps = parseInt(tokens[2]);
                bSteps = parseInt(tokens[3]);
                xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
                newPosition = currentPosition.clone().add(xyChange);
                moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
                if (toolOnBed) {
                    moveCurves.push(moveCurve);
                }
                currentPosition = newPosition;
            }
            if (opcode === 'SP') {
                penValue = parseInt(tokens[1]);
                toolOnBed = penValue === 0;
            }
        });
        return moveCurves;
    }

    static ebbBasicViz(toolpath: Toolpath<EBB>) : VizGroup {
        let moveCurves = VisualizationInterpreters.basicVizCurves(toolpath);
        let material = new THREE.MeshToonMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        let pathRadius = 0.25
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let meshes = geometries.map((geom) => {
            return new THREE.Mesh(geom, material);
        });
        let wrapperGroup = new THREE.Group() as VizGroup;
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static ebbColorViz(toolpath: Toolpath<EBB>) : VizGroup {
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
        let moveCurve: THREE.LineCurve3;
        let curveMaterials: THREE.Material[] = [];
        enum Colors {
            Red = 0xe44242,
            Green = 0x2ecc71
        }
        enum PenHeight {
            Up = -7,
            Down = 0
        }
        let currentColor = Colors.Green;
        let currentPenHeight = PenHeight.Up;
        let currentPosition = new THREE.Vector3(0, 0, currentPenHeight);
        let newPosition = currentPosition.clone();
        let tokens, opcode, duration, aSteps, bSteps, xyChange, material;
        let materialColor = Colors.Green;
        toolpath.instructions.forEach((instruction: string) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
                aSteps = parseInt(tokens[2]);
                bSteps = parseInt(tokens[3]);
                xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
                newPosition = currentPosition.clone().add(xyChange);
                materialColor = currentColor;
            }
            if (opcode === 'SP') {
                currentColor = currentColor === Colors.Red
                               ? Colors.Green : Colors.Red;
                currentPenHeight = currentPenHeight === PenHeight.Up
                                   ? PenHeight.Down : PenHeight.Up;
                newPosition = currentPosition.clone().setZ(currentPenHeight);
                materialColor = Colors.Green;
            }
            moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
            moveCurves.push(moveCurve);
            currentPosition = newPosition;
            material = new THREE.MeshToonMaterial({
                color: materialColor,
                side: THREE.DoubleSide
            });
            curveMaterials.push(material);
        });
        let pathRadius = 0.1;
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let meshes = geometries.map((geom, idx) => {
            return new THREE.Mesh(geom, curveMaterials[idx]);
        });
        let wrapperGroup = new THREE.Group() as VizGroup;
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static ebbVelocityThicknessViz(toolpath: Toolpath<EBB>) : VizGroup {
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
        let axidrawMaxMMPerSec = 380;
        let maxStrokeRadius = 10;
        let currentPosition = new THREE.Vector3();
        let newPosition : THREE.Vector3;
        let moveCurve: THREE.LineCurve3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange;
        let velRadii : number[] = [];
        toolpath.instructions.forEach((instruction: string) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
                duration = parseInt(tokens[1]);
                aSteps = parseInt(tokens[2]);
                bSteps = parseInt(tokens[3]);
                xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
                newPosition = currentPosition.clone().add(xyChange);
                moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
                moveCurves.push(moveCurve);
                currentPosition = newPosition;
                let durationSec = duration / 100;
                let norm = Math.sqrt(Math.pow(xyChange.x, 2) + Math.pow(xyChange.y,2));
                let mmPerSec = norm / durationSec;
                let velRadius = (mmPerSec / axidrawMaxMMPerSec) * maxStrokeRadius;
                velRadii.push(velRadius);
            }
        });
        let material = new THREE.MeshToonMaterial({
            color: 0xe44242,
            side: THREE.DoubleSide
        });
        let geometries = moveCurves.map((curve, idx) => {
            let velRadius = velRadii[idx];
            return new THREE.TubeBufferGeometry(curve, 64, velRadius, 64, false);
        });
        let meshes = geometries.map((geom) => {
            return new THREE.Mesh(geom, material);
        });
        let wrapperGroup = new THREE.Group() as VizGroup;
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static ebbHeatMapViz(toolpath: Toolpath<EBB>) : VizGroup {
        // PART 1: POINT GENERATION
        let travelPoints : THREE.Vector3[] = [];
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
        travelPoints.push(currentPosition.clone());
        let newPosition : THREE.Vector3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange, penValue;
        let msPerPoint = 100;
        let timeLeftOver = 0;
        let toolOnBed = false;
        toolpath.instructions.forEach((instruction: string) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
                duration = parseInt(tokens[1]);
                aSteps = parseInt(tokens[2]);
                bSteps = parseInt(tokens[3]);
                xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
                newPosition = currentPosition.clone().add(xyChange);
                if (toolOnBed) {
                    let startOffsetAlpha = timeLeftOver / duration;
                    let startPt = currentPosition.clone()
                                    .lerp(currentPosition, startOffsetAlpha);
                    let numSamples = Math.floor((duration + timeLeftOver) / msPerPoint);
                    let points = Array.from(Array(numSamples).keys())
                        .forEach((sIdx) => {
                            let alpha = sIdx / numSamples;
                            let interPoint = startPt.clone()
                                                .lerp(newPosition, alpha);
                            travelPoints.push(interPoint);
                    });
                    // Update leftover
                    timeLeftOver = (timeLeftOver + duration) % msPerPoint;
                }
                currentPosition = newPosition;
            }
            if (opcode === 'SP') {
                penValue = parseInt(tokens[1]);
                toolOnBed = penValue === 0;
            }
        });
        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        let radius = 0.1;
        let widthSegments = 4;
        let heightSegments = 2;
        let pointSpheres = travelPoints.map((pt) => {
            let geom = new THREE.SphereBufferGeometry(radius, widthSegments,
                                                        heightSegments);
            let mesh = new THREE.Mesh(geom, material);
            mesh.position.set(pt.x, pt.y, pt.z);
            return mesh;
        });
        let spheresGroup = new THREE.Group();
        pointSpheres.forEach((mesh) => spheresGroup.add(mesh));

        // PART 2: BINNING
        type BinGrid = number[][];
        const numRows = 18 * 4;
        const numCols = 28 * 4;
        const weHeight = 180;
        const weWidth = 280;
        const cellHeight = weHeight / numRows;
        const cellWidth = weWidth / numCols;
        // Assume ROW-MAJOR (x-coordinate FIRST).
        let column = Array.from(Array(numCols)).map(_ => 0);
        let grid: BinGrid = Array.from(Array(numRows)).map(_ => column.slice());

        travelPoints.forEach((pt) => {
            let boundCheckedY = pt.y > 0 ? pt.y : 0;
            let boundCheckedX = pt.x > 0 ? pt.x : 0;
            let rowIndex = Math.floor(boundCheckedY / cellHeight);
            let colIndex = Math.floor(boundCheckedX / cellWidth);
            grid[rowIndex][colIndex] += 1;
        });

        let maxPtsInAnyCell = 0;
        grid.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                let ptCount = grid[rowIndex][colIndex];
                if (ptCount > maxPtsInAnyCell) {
                    maxPtsInAnyCell = ptCount;
                }
            });
        });

        let overlayCellGeom = new THREE.BoxBufferGeometry(cellWidth, 0.1, cellHeight);
        let minOpacity = 0.00;
        let warningCountThreshold = 5;
        let overlayCells = grid.map((row, rowIndex) => {
            let rowCells = row.map((cellPtCount, colIndex) => {
                // Since we only want to see the most prominent points, make
                // the opacity curve sharper by exponentiating. EXP 1 is linear.
                let exponent = 3.0;
                let opacity = Math.pow(cellPtCount / maxPtsInAnyCell, exponent);
                if (opacity < minOpacity) {
                    return null;
                }
                let overlayCellMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: cellPtCount / maxPtsInAnyCell
                    // opacity: 1
                });
                let cellMesh = new THREE.Mesh(overlayCellGeom, overlayCellMaterial);
                cellMesh.rotateX(Math.PI / 2);
                cellMesh.position.set(
                    (colIndex + 0.5) * cellWidth,
                    (rowIndex + 0.5) * cellHeight,
                    0
                );
                return cellMesh;
            });
            return rowCells;
        }).flat().filter((maybeMesh) : maybeMesh is
                THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> => {
            return maybeMesh !== null;
        });
        let overlayGroup = new THREE.Group();
        overlayCells.forEach((cellMesh) => overlayGroup.add(cellMesh));

        // Package results and return.
        let wrapperGroup = new THREE.Group() as VizGroup;
        pointSpheres.forEach(sphere => wrapperGroup.add(sphere));
        overlayCells.forEach(box => wrapperGroup.add(box));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static ebbOrderViz(toolpath: Toolpath<EBB>) : VizGroup {
        let toolpathCurves : THREE.LineCurve3[] = [];
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
        let moveCurve2: THREE.LineCurve3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange;
        toolpath.instructions.forEach((instruction: string) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
              aSteps = parseInt(tokens[2]);
              bSteps = parseInt(tokens[3]);
              xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);

              newPosition = currentPosition.clone().add(xyChange);
              moveCurve2 = new THREE.LineCurve3(currentPosition, newPosition);
              toolpathCurves.push(moveCurve2);
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
                moveCurve2 = new THREE.LineCurve3(currentPosition, newPosition);
                toolpathCurves.push(moveCurve2);
                currentPosition = newPosition;
            }
        });

        //raised
        let colors : THREE.Color[] = [];
        let center = 128;
        let width = 127;
        let steps = 6;

        //rainbow color
        //let frequency = Math.PI*2/toolpathCurves.length;
        let frequency = Math.PI*(1.5)/toolpathCurves.length;
        let phase1 = 0;
        let phase2 = 2;
        let phase3 = 4;

        for (var i = 0; i < toolpathCurves.length; ++i){
          let red = Math.sin(frequency*i + phase1) * width + center;
          let grn = Math.sin(frequency*i + phase2) * width + center;
          let blu = Math.sin(frequency*i + phase3) * width + center;
          colors.push(new THREE.Color("rgb(" + Math.round(red) + "," + Math.round(grn)
                                        + "," + Math.round(blu) + ")"));
        };

        //define the line
        let pathRadius = 0.25;
        let toolpathGeometries = toolpathCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 1, pathRadius, 10, false);
        });

        //draws the figure
        let toolpathMeshes: THREE.Mesh[] = [];
        for (let i = 0; i < toolpathCurves.length; i++) {
          toolpathMeshes.push(new THREE.Mesh(toolpathGeometries[i], (new THREE.MeshToonMaterial({
                  color: colors[i],
                  side: THREE.DoubleSide}))));
        };

        let colorbar : THREE.LineCurve3[] = [];
        for (let i = 0; i < toolpathCurves.length; i++) {
            let colorBarLength = 280;
            let gradientPosition = (i / toolpathCurves.length) * colorBarLength;
            let step = (1 / toolpathCurves.length) * colorBarLength;
            colorbar.push(new THREE.LineCurve3(
                            new THREE.Vector3(gradientPosition,0,0),
                            new THREE.Vector3(gradientPosition + step,0,0)));
        };
        let toolpathGroup = new THREE.Group();
        toolpathMeshes.forEach((mesh) => toolpathGroup.add(mesh));

        let colorbarGeometries = colorbar.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 1, 1, 4, false);
        });

        let colorbarMeshes: THREE.Mesh[] = [];
        for (let i = 0; i < toolpathCurves.length; i++) {
          colorbarMeshes.push(new THREE.Mesh(colorbarGeometries[i], (new THREE.MeshToonMaterial({
                  color: colors[i],
                  side: THREE.DoubleSide}))));
        };
        let colorbarGroup = new THREE.Group();
        colorbarMeshes.forEach((mesh) => colorbarGroup.add(mesh));

        let wrapperGroup = new THREE.Group() as VizGroup;
        toolpathMeshes.forEach(mesh => wrapperGroup.add(mesh));
        colorbarMeshes.forEach((mesh) => wrapperGroup.add(mesh));
        let colorbarOffset = -10;
        colorbarGroup.position.setY(colorbarOffset);
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static ebbSharpAngleViz(toolpath: Toolpath<EBB>) : VizGroup {
        // PART 1: POINT GENERATION
        let travelPoints : THREE.Vector3[] = [];
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
        travelPoints.push(currentPosition.clone());
        let newPosition : THREE.Vector3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange, penValue;
        toolpath.instructions.forEach((instruction: string) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
                aSteps = parseInt(tokens[2]);
                bSteps = parseInt(tokens[3]);
                xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
                newPosition = currentPosition.clone().add(xyChange);
                travelPoints.push(newPosition.clone());
                currentPosition = newPosition;
            }
            if (opcode === 'SP') {
                penValue = parseInt(tokens[1]);
                newPosition = currentPosition.clone().setZ(penValue);
                travelPoints.push(newPosition.clone());
                currentPosition = newPosition;
            }
        });

        // PART 2: TRIPLET-WISE CALCULATIONS
        type Triplet = [THREE.Vector3, THREE.Vector3, THREE.Vector3];
        let warningTriplets: Triplet[] = [];
        const MIN_ANGLE = 45;
        travelPoints.forEach((midpoint, midpointIdx) => {
            if (midpointIdx === 0 || midpointIdx >= travelPoints.length - 1) {
                return;
            }
            let prevPoint = travelPoints[midpointIdx - 1];
            let nextPoint = travelPoints[midpointIdx + 1];
            if (prevPoint.z !== 0 || midpoint.z !== 0 || nextPoint.z !== 0) {
                console.log('here');
                // Do not consider any triplet with any point in the air
                return;
            }
            let a = prevPoint.clone().sub(midpoint);
            let b = nextPoint.clone().sub(midpoint);
            let arc = a.dot(b) / (a.length() * b.length());
            let angle = Math.acos(arc);
            let angleDegrees = angle * (180 / Math.PI);
            if (isNaN(angleDegrees)) { return; }
            const minNorm = 0.5;
            if (angleDegrees < MIN_ANGLE
                && (a.length() >= minNorm && b.length() >= minNorm)) {
                warningTriplets.push([
                    prevPoint,
                    midpoint,
                    nextPoint
                ]);
            }
        });

        let warningMeshesForTriplet = (triplet: Triplet) => {
            let startPt = triplet[0];
            let midpoint = triplet[1];
            let endPt = triplet[2];
            let factor = 2;
            let farStart = startPt.clone().sub(midpoint).normalize()
                            .multiplyScalar(factor).add(midpoint);
            let farEnd = endPt.clone().sub(midpoint).normalize()
                            .multiplyScalar(factor).add(midpoint)
            let pathA = new THREE.LineCurve3(farStart, midpoint);
            let pathB = new THREE.LineCurve3(midpoint, farEnd);
            let radius = 0.25;
            let radialSegments = 12;
            let tubularSegments = 10;
            let geomA = new THREE.TubeBufferGeometry(pathA, tubularSegments,
                                               radius, radialSegments, true);
            let geomB = new THREE.TubeBufferGeometry(pathB, tubularSegments,
                                               radius, radialSegments, true);
            let material = new THREE.MeshToonMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide
            });
            let meshA = new THREE.Mesh(geomA, material);
            let meshB = new THREE.Mesh(geomB, material);
            return [meshA, meshB];
        };

        let warnMeshes = warningTriplets.map((t) => {
            return warningMeshesForTriplet(t);
        }).flat();
        let warnGroup = new THREE.Group();
        warnMeshes.forEach(mesh => warnGroup.add(mesh));

        // STEP 3: add in exiting move curves for reference
        let moveCurves = VisualizationInterpreters.basicVizCurves(toolpath);
        let moveCurveMaterial = new THREE.LineBasicMaterial({
            color : 0xffffff
        });
        let moveGeoms = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, 0.1, 64, true);
        });
        let moveMeshes = moveGeoms.map((geom) => {
            return new THREE.Mesh(geom, moveCurveMaterial);
        });
        let moveGroup = new THREE.Group();
        moveMeshes.forEach(mesh => moveGroup.add(mesh));

        let wrapperGroup = new THREE.Group() as VizGroup;
        warnMeshes.forEach(mesh => wrapperGroup.add(mesh));
        moveMeshes.forEach(mesh => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static ebbDirectionViz(toolpath: Toolpath<EBB>) : VizGroup {
        let wrapperGroup = new THREE.Group() as VizGroup;
        return wrapperGroup;
    }

    static ebbScaleCheckViz(toolpath: Toolpath<EBB>) : VizGroup {
        // PART 1: POINT GENERATION
        let travelPoints : THREE.Vector3[] = [];
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
        // Do not add the origin to travel points.
        let currentPosition = new THREE.Vector3();
        let newPosition : THREE.Vector3;
        let tokens, opcode, duration, aSteps, bSteps, xyChange;
        let penDown = false;
        toolpath.instructions.forEach((instruction: string) => {
            tokens = instruction.split(',');
            opcode = tokens[0];
            if (opcode === 'SM') {
                aSteps = parseInt(tokens[2]);
                bSteps = parseInt(tokens[3]);
                xyChange = getXyMmChangeFromABSteps(aSteps, bSteps);
                newPosition = currentPosition.clone().add(xyChange);
                if (penDown) {
                    travelPoints.push(newPosition.clone());
                }
                currentPosition = newPosition;
            }
            if (opcode === 'SP') {
                let penValue = parseInt(tokens[1]);
                penDown = penValue === 0;
            }
        });

        // PART 2: find extremes
        let xMin = Infinity;
        let yMin = Infinity;
        let xMax = -Infinity;
        let yMax = -Infinity;

        travelPoints.forEach((pt) => {
            if (pt.x < xMin) {
                xMin = pt.x;
            }
            if (pt.x > xMax) {
                xMax = pt.x;
            }
            if (pt.y < yMin) {
                yMin = pt.y;
            }
            if (pt.y > yMax) {
                yMax = pt.y;
            }
        });
        let height = 1;
        let boxGeom = new THREE.BoxBufferGeometry(xMax - xMin, height, yMax - yMin);
        let material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        });
        let boundsMesh = new THREE.Mesh(boxGeom, material);

        let wrapperGroup = new THREE.Group() as VizGroup;
        wrapperGroup.add(boundsMesh);
        boundsMesh.position.setX((xMax + xMin) / 2);
        boundsMesh.position.setZ((yMax + yMin) / 2);
        return wrapperGroup;
    }

    static ebbPurgeCheckViz(toolpath: Toolpath<EBB>) : VizGroup {
        let wrapperGroup = new THREE.Group() as VizGroup;
        return wrapperGroup;
    }

    //G-Code
    static gcodeColorViz(toolpath: Toolpath<GCode>) : VizGroup {
        let moveCurves : THREE.LineCurve3[] = [];
        let moveCurve: THREE.LineCurve3;
        let curveMaterials: THREE.Material[] = [];
        enum Colors {
            Red = 0xe44242,
            Green = 0x2ecc71
        }
        let currentColor = Colors.Green;
        let currentPosition = new THREE.Vector3(0, 0, 0);
        let newPosition = currentPosition.clone();
        let tokens, opcode, duration, opX, opY, opZ, opF, material;
        let posChange;
        let materialColor = Colors.Green;
        let opcodeRe = /(G[0-9]+|M[0-9]+)/;
        let opXRe = /X(-?[0-9]+)/;
        let opYRe = /Y(-?[0-9]+)/;
        let opZRe = /Z(-?[0-9]+)/;
        let opFRe = /F(-?[0-9]+)/;
        let findOpcode = (instruction: string, argRe: RegExp) => {
            let maybeArgResults = instruction.match(argRe);
            if (!maybeArgResults) { return ''; }
            return maybeArgResults[0];
        };
        let findArg = (instruction: string, argRe: RegExp, fallback: number) => {
            let maybeArgResults = instruction.match(argRe);
            if (!maybeArgResults || maybeArgResults.length < 2) {
                return fallback;
            }
            return parseInt(maybeArgResults[1]) || 0;
        };
        toolpath.instructions.forEach((instruction: string) => {
            opcode = findOpcode(instruction, opcodeRe);
            if (opcode === 'G0' || opcode === 'G1') {
                opX = findArg(instruction, opXRe, currentPosition.x),
                opY = findArg(instruction, opYRe, currentPosition.y),
                // Two negatives here because our coordinate basis is wonky
                opZ = -findArg(instruction, opZRe, -currentPosition.z)
                newPosition = new THREE.Vector3(opX, opY, opZ);
                // Set color based on height
                if (currentPosition.z === 0 && newPosition.z === 0) {
                    currentColor = Colors.Red;
                }
                else {
                    currentColor = Colors.Green;
                }
                materialColor = currentColor;
            }
            moveCurve = new THREE.LineCurve3(currentPosition, newPosition);
            moveCurves.push(moveCurve);
            currentPosition = newPosition;
            material = new THREE.MeshToonMaterial({
                color: materialColor,
                side: THREE.DoubleSide
            });
            curveMaterials.push(material);
        });
        let pathRadius = 0.25
        let geometries = moveCurves.map((curve) => {
            return new THREE.TubeBufferGeometry(curve, 64, pathRadius, 64, false);
        });
        let meshes = geometries.map((geom, idx) => {
            return new THREE.Mesh(geom, curveMaterials[idx]);
        });
        let wrapperGroup = new THREE.Group() as VizGroup;
        meshes.forEach((mesh) => wrapperGroup.add(mesh));
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static gCodeOrderViz(toolpath: Toolpath<GCode>) : VizGroup {
        let toolpathCurves : THREE.LineCurve3[] = [];
        //flag is 1 because of the z axis is flipped
        let flag = 1;
        let currentPosition = new THREE.Vector3();
        let newPosition : THREE.Vector3;
        let moveCurve2: THREE.LineCurve3;

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
        const SCALE_FACTOR = 25;
        let findArg = (instruction: string, argRe: RegExp, fallback: number) => {
            let maybeArgResults = instruction.match(argRe);
            if (!maybeArgResults || maybeArgResults.length < 2) {
                return fallback;
            }
            return parseFloat(maybeArgResults[1]) * SCALE_FACTOR || 0;
        };

        let opcode, opX, opY, opZ;
        let positions: THREE.Vector3[] = [
            new THREE.Vector3()
        ];
        toolpath.instructions.forEach((instruction: string) => {
            opcode = findOpcode(instruction, opcodeRe);
            if (opcode === 'G0' || opcode === 'G1') {
              opX = findArg(instruction, opXRe, currentPosition.x),
              opY = findArg(instruction, opYRe, currentPosition.y),
              // Two negatives here because our coordinate basis is wonky
              opZ = -findArg(instruction, opZRe, -currentPosition.z)

              newPosition = new THREE.Vector3(opX, opY, opZ);
              moveCurve2 = new THREE.LineCurve3(currentPosition, newPosition);
              positions.push(newPosition);
              toolpathCurves.push(moveCurve2);
              currentPosition = newPosition;
            }
        });

        //raised
        let colors : THREE.Color[] = [];
        let center = 128;
        let width = 127;
        let steps = 6;

        //rainbow color
        let frequency = Math.PI*(1.5)/toolpathCurves.length;
        let phase1 = 0;
        let phase2 = 2;
        let phase3 = 4;

        for (var i = 0; i < toolpathCurves.length; ++i){
          let red = Math.sin(frequency*i + phase1) * width + center;
          let grn = Math.sin(frequency*i + phase2) * width + center;
          let blu = Math.sin(frequency*i + phase3) * width + center;
          colors.push(new THREE.Color("rgb(" + Math.round(red) + "," + Math.round(grn)
                                        + "," + Math.round(blu) + ")"));
        };
        
        let positionsFlat = positions.map(vec => [vec.x, vec.y, vec.z]).flat();
        let colorsFlat = colors.map(color => [color.r, color.g, color.b]).flat();
        let lineGeom = new THREE.LineGeometry();
        lineGeom.setPositions(positionsFlat);
        lineGeom.setColors(colorsFlat);

        let material = new THREE.LineMaterial({
            color: 0xffffff,
            linewidth: 1, // in world units with size attenuation, pixels otherwise
            vertexColors: true,
            //resolution:  // to be set by renderer, eventually
            // Hmmm the below vector works? It was never set on its own and
            // crashed the browser
            resolution: new THREE.Vector2(640, 480),
            dashed: false,
        });

        let line = new THREE.Line2(lineGeom, material);
        line.scale.set(1, 1, 1);
        line.computeLineDistances();

        let colorBarLength = 200;
        let colorbarPositions = toolpathCurves.map((_, i) => {
           let x = (i / toolpathCurves.length) * colorBarLength;
           return [x, 0, 0];
        }).flat();
        let colorbarGeom = new THREE.LineGeometry();
        colorbarGeom.setPositions(colorbarPositions);
        colorbarGeom.setColors(colorsFlat);
        let colorbar = new THREE.Line2(colorbarGeom, material);

        let wrapperGroup = new THREE.Group() as VizGroup;
        const initialZDrop = 0.6996;
        line.translateZ(-initialZDrop * SCALE_FACTOR);
        colorbar.translateY(200 + 10);
        colorbar.translateY(-15);

        wrapperGroup.add(line);
        wrapperGroup.add(colorbar);
        wrapperGroup.rotateX(Math.PI / 2);
        return wrapperGroup;
    }

    static gCodeVelocityViz(toolpath: Toolpath<GCode>) : VizGroup {
        let wrapperGroup = new THREE.Group() as VizGroup;
        return wrapperGroup;
    }

}

