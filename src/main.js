// Bot minimaliste sans tête, uniquement yeux, sourcils et bouche
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#f0f0f0');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lumière
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

// Groupe tête (yeux, sourcils, bouche)
const headGroup = new THREE.Group();
scene.add(headGroup);

// Yeux
function createEye(x) {
  const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye.position.set(x, 0.2, 0);
  return eye;
}

const leftEye = createEye(-0.3);
const rightEye = createEye(0.3);
headGroup.add(leftEye);
headGroup.add(rightEye);

// Sourcils
function createBrow(x) {
  const browGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.05);
  const browMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const brow = new THREE.Mesh(browGeometry, browMaterial);
  brow.position.set(x, 0.40, 0);
  return brow;
}

const leftBrow = createBrow(-0.3);
const rightBrow = createBrow(0.3);
headGroup.add(leftBrow);
headGroup.add(rightBrow);

// Bouche
const mouthGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 16, Math.PI);
const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // couleur noire
const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
mouth.rotation.x = Math.PI / 2;
mouth.position.set(0, -0.2, 0);
headGroup.add(mouth);

// Animation de clignement
let blinkTimer = 0;
function blink() {
  leftEye.scale.y = 0.1;
  rightEye.scale.y = 0.1;
  setTimeout(() => {
    leftEye.scale.y = 1;
    rightEye.scale.y = 1;
  }, 200);
}

// Valeurs cibles pour animation fluide
let targetState = {
  mouthRotationZ: 0,
  mouthScale: new THREE.Vector3(1, 1, 1),
  eyeScale: new THREE.Vector3(1, 1, 1),
  leftBrowRotZ: 0,
  rightBrowRotZ: 0,
  headRotation: new THREE.Euler(0, 0, 0),
  headPosition: new THREE.Vector3(0, 0, 0) // Nouvelle position de tête
};

const expressions = [
  () => { // Heureux
    targetState.mouthRotationZ = 0;
    targetState.mouthScale.set(1, 1, 1);
    targetState.eyeScale.set(1, 1, 1);
    targetState.leftBrowRotZ = 0.2;
    targetState.rightBrowRotZ = -0.2;
    targetState.headRotation.set(0.1, 0.2, 0);  // Rotation de la tête vers la droite
    targetState.headPosition.set(0.05, -0.05, 0); // Légère translation vers la droite et vers le bas
  },
  () => { // Triste
    targetState.mouthRotationZ = Math.PI;
    targetState.mouthScale.set(1, 1, 1);
    targetState.eyeScale.set(1, 1, 1);
    targetState.leftBrowRotZ = -0.3;
    targetState.rightBrowRotZ = 0.3;
    targetState.headRotation.set(-0.1, -0.2, 0);  // Rotation de la tête vers la gauche
    targetState.headPosition.set(-0.05, 0.05, 0); // Légère translation vers la gauche et vers le haut
  },
  () => { // Surpris
    targetState.mouthRotationZ = 0;
    targetState.mouthScale.set(1, 1.5, 1);
    targetState.eyeScale.set(1.2, 1.2, 1.2);
    targetState.leftBrowRotZ = 0;
    targetState.rightBrowRotZ = 0;
    targetState.headRotation.set(0.2, 0, 0);  // Tête se tourne vers le bas
    targetState.headPosition.set(0, 0.05, 0); // Légère translation vers le haut
  },
  () => { // Neutre
    targetState.mouthRotationZ = 0;
    targetState.mouthScale.set(1, 1, 1);
    targetState.eyeScale.set(1, 1, 1);
    targetState.leftBrowRotZ = 0;
    targetState.rightBrowRotZ = 0;
    targetState.headRotation.set(0, 0, 0);  // Position neutre de la tête
    targetState.headPosition.set(0, 0, 0); // Position neutre (pas de déplacement)
  }
];

let expressionIndex = 0;
let expressionTimer = 0;

// Boucle de rendu
function animate(time) {
  requestAnimationFrame(animate);
  controls.update();

  if (time - blinkTimer > 3000 + Math.random() * 2000) {
    blink();
    blinkTimer = time;
  }

  if (time - expressionTimer > 3000) {
    expressions[expressionIndex % expressions.length]();
    expressionIndex++;
    expressionTimer = time;
  }

  // Animation plus fluide (transition lente)
  const smoothing = 0.07; // Plus bas = plus lent et plus doux

  mouth.rotation.z += (targetState.mouthRotationZ - mouth.rotation.z) * smoothing;
  mouth.scale.lerp(targetState.mouthScale, smoothing);
  leftEye.scale.lerp(targetState.eyeScale, smoothing);
  rightEye.scale.lerp(targetState.eyeScale, smoothing);
  leftBrow.rotation.z += (targetState.leftBrowRotZ - leftBrow.rotation.z) * smoothing;
  rightBrow.rotation.z += (targetState.rightBrowRotZ - rightBrow.rotation.z) * smoothing;

  // Rotation de la tête sur plusieurs axes
  headGroup.rotation.x += (targetState.headRotation.x - headGroup.rotation.x) * smoothing;
  headGroup.rotation.y += (targetState.headRotation.y - headGroup.rotation.y) * smoothing;
  headGroup.rotation.z += (targetState.headRotation.z - headGroup.rotation.z) * smoothing;

  // Déplacement léger de la tête
  headGroup.position.lerp(targetState.headPosition, smoothing);

  renderer.render(scene, camera);
}

animate();

// Redimensionnement
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
