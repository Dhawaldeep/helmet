import './style.css';
import { AmbientLight, CylinderGeometry, Fog, Group, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, Scene, PointLight, Vector3, WebGLRenderer, LoadingManager, DirectionalLight, RectAreaLight, DirectionalLightHelper, CubeTextureLoader } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from "gsap";
import * as dat from 'lil-gui';

let productModel;
let glassCase;
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
        intensity: 15,
    },
    pointLight: {
        intensity: 5,
    },
    directionLight: {
        intensity: 20,
    },
    rALight: {
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

const cubeTextureLoader = new CubeTextureLoader()

const environmentMapTextureBlur = cubeTextureLoader.load([
    '/textures/BG01_blurred/px.png',
    '/textures/BG01_blurred/nx.png',
    '/textures/BG01_blurred/py.png',
    '/textures/BG01_blurred/ny.png',
    '/textures/BG01_blurred/pz.png',
    '/textures/BG01_blurred/nz.png'
]);

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/BG01/px.png',
    '/textures/BG01/nx.png',
    '/textures/BG01/py.png',
    '/textures/BG01/ny.png',
    '/textures/BG01/pz.png',
    '/textures/BG01/nz.png'
]);

const environmentMapTexture02 = cubeTextureLoader.load([
    '/textures/BG02/px.png',
    '/textures/BG02/nx.png',
    '/textures/BG02/py.png',
    '/textures/BG02/ny.png',
    '/textures/BG02/pz.png',
    '/textures/BG02/nz.png'
]);
const environmentMapTexture03 = cubeTextureLoader.load([
    '/textures/BG03/px.png',
    '/textures/BG03/nx.png',
    '/textures/BG03/py.png',
    '/textures/BG03/ny.png',
    '/textures/BG03/pz.png',
    '/textures/BG03/nz.png'
]);
const environmentMapTexture04 = cubeTextureLoader.load([
    '/textures/BG04/px.png',
    '/textures/BG04/nx.png',
    '/textures/BG04/py.png',
    '/textures/BG04/ny.png',
    '/textures/BG04/pz.png',
    '/textures/BG04/nz.png'
]);
const environmentMapTextureVS = cubeTextureLoader.load([
    '/textures/venice_sunset/px.png',
    '/textures/venice_sunset/nx.png',
    '/textures/venice_sunset/py.png',
    '/textures/venice_sunset/ny.png',
    '/textures/venice_sunset/pz.png',
    '/textures/venice_sunset/nz.png'
]);

parameters['Env Map Texture'] = environmentMapTexture;
/**
 * Update glass case material
 */
 const updateGlassCaseMaterials = () => {
    //  scene.background = parameters['Env Map Texture'];
     console.log(parameters['Env Map Texture']);
    glassCase.traverse(child => {
        if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
            child.material.envMap = parameters['Env Map Texture'];
            child.material.envMapIntensity = parameters.environmentMapIntensity;
            child.material.needsUpdate = true;
        }
    });
}


const scene = new Scene();
scene.background = environmentMapTextureBlur;
const productGroup = new Group();
scene.add(productGroup);
gui.add(parameters, 'environmentMapIntensity').min(0).max(50).step(0.1).onChange(updateGlassCaseMaterials).name('Env Intensity');
gui.add(parameters, 'Env Map Texture', {
    BG01: environmentMapTexture,
    BG02: environmentMapTexture02,
    BG03: environmentMapTexture03,
    BG04: environmentMapTexture04,
    'Venice Sunset': environmentMapTextureVS,
}).onChange(updateGlassCaseMaterials);
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
gui.add(parameters.ambientLight, 'intensity').name('Ambient Light').min(0.1).max(50).step(0.01).onChange(() => {
    ambientLight.intensity = parameters.ambientLight.intensity;
})
const directionLight = new DirectionalLight('#ffffff', parameters.directionLight.intensity);
scene.add(directionLight);
directionLight.position.set(0, 10, 0);

// const dLights = [0, 0, 0, 0].map(() => {
//     return new DirectionalLight('#ffffff', parameters.directionLight.intensity);
// });
// dLights[0].position.set(10, 0, 0);
// dLights[1].position.set(0, 0, -10);
// dLights[2].position.set(-10, 0, 0);
// dLights[3].position.set(0, 0, 10);
// scene.add(...dLights);
gui.add(parameters.directionLight, 'intensity').name('Direction Light').min(0.1).max(50).step(0.01).onChange(() => {
    directionLight.intensity = parameters.directionLight.intensity;
    // dLights.forEach(dl => {
    //     dl.intensity = parameters.directionLight.intensity;
    // });
});

// const directionalLightHelper = new DirectionalLightHelper(directionLight, 2);
// scene.add(directionalLightHelper);
// const pointLight = new PointLight('#ffffff', parameters.pointLight.intensity);
// pointLight.position.set(2, 3, 0);
// scene.add(pointLight);
// pointLight.castShadow = true;
// const pointLightB = pointLight.clone();
// pointLightB.position.set(- 2, 3, 0);
// scene.add(pointLightB);
// pointLightB.castShadow = true;
// const pointLightC = pointLight.clone();
// pointLightC.position.set(0, 3, 0);
// scene.add(pointLightC);
// pointLightB.castShadow = true;
// gui.add(parameters.pointLight, 'intensity').name('Point Light').min(0.1).max(6).step(0.01).onChange(() => {
//     pointLight.intensity = parameters.pointLight.intensity;
//     pointLightB.intensity = parameters.pointLight.intensity;
// });

// const pedestal = new Group();
// // scene.add(pedestal);
// const pedestalMat = new MeshStandardMaterial({ color: parameters.pedestal.color });
// gui.addColor(parameters.pedestal, 'color').name('Pedestal Color')
//     .onChange(() => {
//         pedestalMat.color.set(parameters.pedestal.color);
//     });

// const cylinderB = new Mesh(
//     new CylinderGeometry(3, 3, 0.2, 50),
//     pedestalMat,
// );
// pedestal.add(cylinderB);
// cylinderB.receiveShadow = true;
// const cylinderT = new Mesh(
//     new CylinderGeometry(2.5, 2.5, 0.2, 50),
//     pedestalMat,
// );
// cylinderT.position.y = 0.2;
// cylinderT.receiveShadow = true;
// cylinderT.castShadow = true;
// pedestal.add(cylinderT);
// pedestal.receiveShadow = true;
// pointLight.lookAt(new Vector3(0, 0, 0));

const loadingManager = new LoadingManager(() => {
}, (_, loaded, total) => {
    const loadedPer = (loaded / total) * 100;
    progressBar.setAttribute('style', `--value: ${loadedPer}`);
    progressBar.setAttribute('aria-valuenow', loadedPer);
});

const gltfLoader = new GLTFLoader(loadingManager);

gltfLoader.load('/models/helmet-editor.glb', (gltf) => {
    document.body.removeChild(document.querySelector('div.progressbar-container'));
    productModel = gltf.scene.children[0].children[0];
    productModel.scale.set(0.25, 0.25, 0.25);
    // productModel.scale.set(0.1, 0.1, 0.1);
    productModel.position.y = parameters.productPositionY;
    camera.lookAt(productModel.children[1].position);
    gui.add(parameters, 'productPositionY').name('Product Position')
        .min(-20).max(20).step(0.1)
        .onChange(() => {
            productModel.position.y = parameters.productPositionY;
        })
    productGroup.add(productModel);
    productModel.castShadow = true;

    // gsap.to(camera.position, {
    //     x: -0.35,
    //     y: 1,
    //     z: 2.5,
    //     duration: 2,
    // });
    hasLoaded = true;
});

gltfLoader.load('/models/Glasscase.glb', (gltf) => {
    console.log(gltf);
    glassCase = gltf.scene;
    productGroup.add(glassCase);
    glassCase.scale.set(10, 10, 10);
    glassCase.position.y = -7;
    updateGlassCaseMaterials();
})

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
    if (productModel && !isControlled) {
        productGroup.rotation.y += 0.01;
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

tick();
