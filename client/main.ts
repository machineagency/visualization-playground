import { VisualizationSpace } from './visualization-space.js'

const createExampleViz = () => {
    let geometryBox = new THREE.BoxBufferGeometry(100, 150, 20);
    let geometrySphere = new THREE.SphereBufferGeometry(50);
    let materialRed = new THREE.MeshPhongMaterial({
        color: 0xe44242,
        side: THREE.DoubleSide
    });
    let materialBlue = new THREE.MeshPhongMaterial({
        color: 0x29abe2,
        side: THREE.DoubleSide
    });
    let meshBox = new THREE.Mesh(geometryBox, materialRed);
    let meshSphere = new THREE.Mesh(geometrySphere, materialBlue);
    meshBox.position.set(-13, 71, 0);
    meshSphere.position.set(24, 36, 140);
    let group = new THREE.Group();
    group.add(meshBox);
    group.add(meshSphere);
    return group;
};

const createCoolViz = () => {
    // TODO
};

const main = () => {
    const vs = new VisualizationSpace();
    const vizGroup = createExampleViz();
    vs.addVizWithName(vizGroup, 'Maja\'s Viz');
};

window.onload = function() {
    main();
}
