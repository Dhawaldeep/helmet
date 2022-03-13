import './style.css';
import { AmbientLight, CylinderGeometry, Fog, Group, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, Scene, PointLight, Vector3, WebGLRenderer, Clock, LoadingManager } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from "gsap";
import * as dat from 'lil-gui';

let productModel;
let isControlled = false;
let timer;

const size = {
    width: window.innerWidth,
    height: window.innerHeight,
};
const gui = new dat.GUI();
gui.hide();
const parameters = {
    fogColor: '#262837',
    pedestal: {
        color: '#0b080c',
    },
    fogColor: '#21222c',
    productPositionY: 0.5,
    ambientLight: {
        intensity: 3,
    },
    pointLight: {
        intensity: 3,
    },
    animationTimeSec: 20 * 1000,
}

const canvas = document.querySelector('canvas.webgl');

const scene = new Scene();

const fog = new Fog(parameters.fogColor, 1, 20);
gui.addColor(parameters, 'fogColor').name('Fog Color').
    onChange(() => {
        fog.color.set(parameters.fogColor);
        document.body.style.backgroundColor = parameters.fogColor;
    })
scene.fog = fog;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.01, 100);
camera.position.set(0, 3, 20);
scene.add(camera);


const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

const ambientLight = new AmbientLight('#ffffff', parameters.ambientLight.intensity);
scene.add(ambientLight);
gui.add(parameters.ambientLight, 'intensity').name('Ambient Light').min(0.1).max(6).step(0.01).onChange(() => {
    ambientLight.intensity = parameters.ambientLight.intensity;
})
const pointLight = new PointLight('#ffffff', parameters.pointLight.intensity);
pointLight.position.set(2, 3, 0);
scene.add(pointLight);
pointLight.castShadow = true;
const pointLightB = pointLight.clone();
pointLight.position.set(- 2, 3, 0);
scene.add(pointLightB);
pointLightB.castShadow = true;
gui.add(parameters.pointLight, 'intensity').name('Point Light').min(0.1).max(6).step(0.01).onChange(() => {
    pointLight.intensity = parameters.pointLight.intensity;
    pointLightB.intensity = parameters.pointLight.intensity;
});

const pedestal = new Group();
scene.add(pedestal);
const pedestalMat = new MeshStandardMaterial({ color: parameters.pedestal.color });
gui.addColor(parameters.pedestal, 'color').name('Pedestal Color')
    .onChange(() => {
        pedestalMat.color.set(parameters.pedestal.color);
    });

const cylinderB = new Mesh(
    new CylinderGeometry(3, 3, 0.2, 50),
    pedestalMat,
);
pedestal.add(cylinderB);
cylinderB.receiveShadow = true;
const cylinderT = new Mesh(
    new CylinderGeometry(2.5, 2.5, 0.2, 50),
    pedestalMat,
);
cylinderT.position.y = 0.2;
cylinderT.receiveShadow = true;
cylinderT.castShadow = true;
pedestal.add(cylinderT);
pedestal.receiveShadow = true;
pointLight.lookAt(new Vector3(0, 0, 0));

const loadingManager = new LoadingManager(() => {
}, (_, loaded, total) => {
    console.log((loaded / total) * 100);
});

const gltfLoader = new GLTFLoader(loadingManager);

gltfLoader.load('/models/recon/scene.gltf', (gltf) => {
    productModel = gltf.scene.children[0];
    productModel.scale.set(0.1, 0.1, 0.1);
    productModel.position.y = parameters.productPositionY;
    gui.add(parameters, 'productPositionY').name('Product Position')
        .min(2).max(20).step(0.1)
        .onChange(() => {
            productModel.position.y = parameters.productPositionY;
        })
    scene.add(productModel);
    productModel.castShadow = true;

    gsap.to(camera.position, {
        y: 3.6,
        z: 5.8,
        duration: 2,
    });
});

const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

window.addEventListener('resize', () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()

    renderer.setSize(size.width, size.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

controls.addEventListener('start', () => {
    isControlled = true;
    canvas.style.cursor = 'grab';
});

controls.addEventListener('end', () => {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        isControlled = false;
    }, 2000);
    canvas.style.cursor = 'default';
});

const clock = new Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    if (productModel && !isControlled) {
        productModel.rotation.z += elapsedTime * 0.0006;
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();