import { VisualizationSpace } from './visualization-space.js'
import { Interpreter } from './interpreter.js'
import { ExampleToolpaths, Toolpath, EBB, GCode } from './example-toolpaths.js'

const createExampleViz = () => {
    let geometryBox = new THREE.BoxBufferGeometry(100, 150, 20);
    let geometrySphere = new THREE.SphereBufferGeometry(50);
    let geometrySphere2 = new THREE.SphereBufferGeometry(30);
    let geometrySphere3 = new THREE.SphereBufferGeometry(5);
    let geometryCone = new THREE.ConeBufferGeometry(5, 40, 10);
    let materialRed = new THREE.MeshPhongMaterial({
        color: 0xe44242,
        side: THREE.DoubleSide
    });
    let materialBlue = new THREE.MeshPhongMaterial({
        color: 0x29abe2,
        side: THREE.DoubleSide
    });
    let materialYellow = new THREE.MeshPhongMaterial({
        color: 0xFFFF00,
        side: THREE.DoubleSide
    });
    let materialBlack = new THREE.MeshPhongMaterial({
        color: 0x000000,
        side: THREE.DoubleSide
    });
    let materialWhite = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
    });
    let materialOrange = new THREE.MeshPhongMaterial({
        color: 0xFF9900,
        side: THREE.DoubleSide
    });

    let meshBox = new THREE.Mesh(geometryBox, materialRed);
    let meshSphere = new THREE.Mesh(geometrySphere, materialWhite);
    let meshSphere2 = new THREE.Mesh(geometrySphere2, materialWhite);
    let meshSphere3 = new THREE.Mesh(geometrySphere3, materialBlack);
    let meshSphere4 = new THREE.Mesh(geometrySphere3, materialBlack);
    let meshSphere5 = new THREE.Mesh(geometrySphere3, materialBlack);
    let meshSphere6 = new THREE.Mesh(geometrySphere3, materialBlack);
    let meshSphere7 = new THREE.Mesh(geometrySphere3, materialBlack);
    let meshCone = new THREE.Mesh(geometryCone, materialOrange);
    meshBox.position.set(-13, 71, 0);
    meshSphere.position.set(24, 36, 140);
    meshSphere2.position.set(24, 100, 140);
    meshSphere3.position.set(24, 36, 192);
    meshSphere4.position.set(24, 70, 179);
    meshSphere5.position.set(24, 3, 180);
    meshSphere6.scale.set(0.7,0.7,0.7);
    meshSphere6.position.set(12,110,165);
    meshSphere7.scale.set(0.7,0.7,0.7);
    meshSphere7.position.set(36,110,165);
    meshCone.position.set(24, 100, 180);
    meshCone.rotation.set(1.5, 0, 0);
    let group = new THREE.Group();
    group.add(meshBox);
    group.add(meshSphere);
    group.add(meshSphere2);
    group.add(meshSphere3);
    group.add(meshSphere4);
    group.add(meshSphere5);
    group.add(meshSphere6);
    group.add(meshSphere7);
    group.add(meshCone);
    return group;
};

//PointsMaterial test
const test = () => {
  const vertices = [];

  for ( let i = 0; i < 10000; i ++ ) {

  const x = THREE.MathUtils.randFloatSpread( 2000 );
  const y = THREE.MathUtils.randFloatSpread( 2000 );
  const z = THREE.MathUtils.randFloatSpread( 2000 );

  vertices.push( x, y, z );

  }
//need to specify
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

  const material = new THREE.PointsMaterial( { color: 0xFF9900 } );

  const points = new THREE.Points( geometry, material );
  let group = new THREE.Group();

  group.add( points);
  return group;
};

const colorTest = () => {
  let curves : THREE.LineCurve3[] = [];
  // curves.push(new THREE.LineCurve3(
  //               new THREE.Vector3(0,0,0), new THREE.Vector3(0,50,0)));
  // curves.push(new THREE.LineCurve3(
  //               new THREE.Vector3(0,50,0), new THREE.Vector3(0,100,0)));
  // curves.push(new THREE.LineCurve3(
  //               new THREE.Vector3(0,100,0), new THREE.Vector3(0,150,0)));

for (let i = 0; i < 256; i++){
  curves.push(new THREE.LineCurve3(new THREE.Vector3(0,i*2,0), new THREE.Vector3(0,(i+1)*2,0)));
};


  //let color = new THREE.Color();
  // color.lerpColors(new THREE.Color(0xe44242), new THREE.Color(0x3D85C6), 0.5);
  //

  let colors : THREE.Color[] = [];
  for (let i = 0; i < 256; i++) {
    colors.push(new THREE.Color("rgb(" + i + ", 255, 255)"));
  };

  console.log(colors)
  // let material = new THREE.MeshToonMaterial({
  //     color: color,
  //     side: THREE.DoubleSide
  // });

  let materialR = new THREE.Color( 0xe44242);
  materialR.lerpHSL(new THREE.Color(0x3D85C6), 0.5);

  // let material = new THREE.MeshToonMaterial({
  //     color: materialR,
  //     side: THREE.DoubleSide
  // });

  let pathRadius = 0.25;
  let geometries = curves.map((a) => {
      return new THREE.TubeBufferGeometry(a, 64, pathRadius, 64, false);
  });

  //let colors = []; (for i = 0, i < 256, i++ )
  //{ colors.push(new Color("rgb(" + i + ", 0, 0)"); };


let meshes: THREE.Mesh[] = [];
for (let i = 0; i < 256; i++) {
  meshes.push(new THREE.Mesh(geometries[i], (new THREE.MeshToonMaterial({
          color: colors[i],
          side: THREE.DoubleSide}))));
};
  // let meshes = geometries.map((geom) => {
  //     return new THREE.Mesh(geom,material);
  // });
  let wrapperGroup = new THREE.Group();
  meshes.forEach((mesh) => wrapperGroup.add(mesh));
  wrapperGroup.rotateX(Math.PI / 2);
  return wrapperGroup;
};

const createCoolViz = () => {
    // TODO
};

const main = () => {
    const vs = new VisualizationSpace();
    const vizGroup = createExampleViz();
    //vs.addVizWithName(vizGroup, 'Maja\'s Viz');
    //const tester = test();
    //vs.addVizWithName(tester, 'point test');
    //const tester = colorTest();
    //vs.addVizWithName(tester, 'colour test');
    const someToolpath = ExampleToolpaths.ebbBox;
    //const someToolpath = ExampleToolpaths.ebbSignature;
    //const toolpathViz = Interpreter.basicViz(someToolpath);
    // const toolpathViz = Interpreter.pointViz(someToolpath);
    const toolpathViz = Interpreter.orderViz(someToolpath);
    vs.addVizWithName(toolpathViz, 'Basic Path Viz');

};

window.onload = function() {
    main();
}
