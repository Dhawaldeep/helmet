import './style.css';
import { AmbientLight, CylinderGeometry, Fog, Group, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, Scene, PointLight, Vector3, WebGLRenderer, LoadingManager, DirectionalLight, RectAreaLight, DirectionalLightHelper, CubeTextureLoader, TextureLoader, SpotLight, sRGBEncoding } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from "gsap";
import * as dat from 'lil-gui';

let model;
let isControlled = false;
let timer;

const narration = new Audio('/sounds/narration.mpeg');
let hasPlayed = false;
let hasLoaded = false;

const size = {
    width: window.innerWidth,
    height: window.innerHeight,
};
const gui = new dat.GUI();
// gui.hide();
const parameters = {
    fogColor: '#262837',
    pedestal: {
        color: '#0b080c',
    },
    fogColor: '#21222c',
    productPositionY: -7,
    ambientLight: {
        intensity: 1,
    },
    pointLight: {
        intensity: 5,
    },
    spotLight: {
        intensity: 25,
    },
    directionLight: {
        intensity: 1,
    },
    rALight: {
        intensity: 5,
        helperVisible: true,
    },
    animationTimeSec: 20 * 1000,
    environmentMapIntensity: 10,
}

const canvas = document.querySelector('canvas.webgl');
const progressBar = document.querySelector('div.progressbar');
const description = document.querySelector('div.description');
const info = document.querySelector('div#info-icon');
info.addEventListener('click', () => {
    description.style.display = 'block';
});
const close = document.querySelector('.description svg');
close.addEventListener('click', () => {
    description.style.display = 'none';
});

const updateGlassCaseMaterials = () => {
    model.traverse(child => {
        if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
            child.material.envMapIntensity = parameters.environmentMapIntensity;
            child.material.needsUpdate = true;
        }
    });
}

gui.add(parameters, 'environmentMapIntensity').min(0).max(50).step(0.1).onChange(updateGlassCaseMaterials).name('Env Intensity');

const textureLoader = new TextureLoader();
const cubeTextureLoader = new CubeTextureLoader();

const backgroundTexture = textureLoader.load('/textures/Gray _BG.jpg');
const environmentMapTextureVS = cubeTextureLoader.load([
    '/textures/venice_sunset/px.png',
    '/textures/venice_sunset/nx.png',
    '/textures/venice_sunset/py.png',
    '/textures/venice_sunset/ny.png',
    '/textures/venice_sunset/pz.png',
    '/textures/venice_sunset/nz.png'
]);
const scene = new Scene();
scene.background = backgroundTexture;
scene.environment = environmentMapTextureVS;

// const fog = new Fog(parameters.fogColor, 1, 40);
// gui.addColor(parameters, 'fogColor')
//     .name('Fog Color')
//     .onChange(() => {
//         fog.color.set(parameters.fogColor);
//         document.body.style.backgroundColor = parameters.fogColor;
//     })
// scene.fog = fog;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.01, 100);
camera.position.set(0, 10, 30);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

const ambientLight = new AmbientLight('#ffffff', parameters.ambientLight.intensity);
scene.add(ambientLight);
gui.add(parameters.ambientLight, 'intensity').name('Ambient Light').min(0).max(50).step(0.01).onChange(() => {
    ambientLight.intensity = parameters.ambientLight.intensity;
})
// const directionLight = new DirectionalLight('#ffffff', parameters.directionLight.intensity);
// scene.add(directionLight);
// directionLight.position.set(0, 10, 0);

const spotLight = new SpotLight('#ffffff', parameters.spotLight.intensity);
scene.add(spotLight);
spotLight.position.set(0, 10, 0);

// const rectAreaLight = new RectAreaLight('#ffffff', parameters.rALight.intensity);
// scene.add(rectAreaLight);
// rectAreaLight.position.set(0, 8, 0);
// rectAreaLight.lookAt(new Vector3());

// const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
// scene.add(rectAreaLightHelper);

const dLights = [0, 0, 0, 0].map(() => {
    return new DirectionalLight('#ffffff', parameters.directionLight.intensity);
});
dLights[0].position.set(10, 5, 0);
dLights[1].position.set(0, 5, -10);
dLights[2].position.set(-10, 5, 0);
dLights[3].position.set(0, 5, 10);
scene.add(...dLights);
// const dLightHelpers = [0, 0, 0, 0].map((_, i) => new DirectionalLightHelper(dLights[i], 2))
gui.add(parameters.directionLight, 'intensity').name('Direction Light').min(0).max(50).step(0.01).onChange(() => {
    // directionLight.intensity = parameters.directionLight.intensity;
    dLights.forEach(dl => {
        dl.intensity = parameters.directionLight.intensity;
    });
});
gui.add(parameters.spotLight, 'intensity').name('Spot Light').min(0).max(100).step(0.01).onChange(() => {
    spotLight.intensity = parameters.spotLight.intensity;
});

const loadingManager = new LoadingManager(() => {
}, (_, loaded, total) => {
    const loadedPer = (loaded / total) * 100;
    progressBar.setAttribute('style', `--value: ${loadedPer}`);
    progressBar.setAttribute('aria-valuenow', loadedPer);
});

const gltfLoader = new GLTFLoader(loadingManager);

gltfLoader.load('/models/Helmet_Glasscase 01.glb', (gltf) => {
    console.log(gltf);

    document.body.removeChild(document.querySelector('div.progressbar-container'));
    model = gltf.scene.children[0];
    scene.add(model);
    model.scale.set(0.25, 0.25, 0.25);
    hasLoaded = true;
    updateGlassCaseMaterials()
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
renderer.outputEncoding = sRGBEncoding;

window.addEventListener('resize', () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()

    renderer.setSize(size.width, size.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

controls.addEventListener('start', () => {
    if (!hasPlayed & hasLoaded) {
        narration.play();
        hasPlayed = true;
    }
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

const tick = () => {
    if (model && !isControlled) {
        model.rotation.y += 0.01;
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();
