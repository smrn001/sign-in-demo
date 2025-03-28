// Select the existing canvas and container
const canvas = document.querySelector(".webgl");
const container = document.querySelector(".canvas-container");

// Initialize Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, 5);

// Initialize Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;

// Update camera aspect ratio
camera.aspect = container.clientWidth / container.clientHeight;
camera.updateProjectionMatrix();

// Enable Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false; // Disable zooming
controls.enablePan = false;

// Load HDRI environment texture
new THREE.RGBELoader().load(
  "assets/hdr/blenderkit-studio-hdri-1-light_2K_5ce86ce7-0650-4e09-86fd-f9aef19a68e9.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

// Define Material Properties
const material = new THREE.MeshPhysicalMaterial({
  color: 0xce84e8, // Purple base color
  metalness: 0.5, // Slight metallic effect
  roughness: 0.1, // Smooth reflections
  clearcoat: 1.0, // Glossy finish
  clearcoatRoughness: 0.1, // Slight variation in clearcoat reflections
});

// Initialize Variables for Frame Animation
const loader = new THREE.GLTFLoader();
let frames = [];
let currentFrameIndex = 0;
let forward = true; // Track animation direction

// Load GLB Frames
function loadFrames() {
  let loadedCount = 0;
  for (let i = 0; i <= 64; i++) {
    const fileName = `assets/glb/Mball_001_frame_${i}.glb`;
    loader.load(fileName, (gltf) => {
      const frame = gltf.scene;
      frames[i] = frame;
      frames[i].visible = false; // Hide all initially

      // Adjust object position and scale
      frame.scale.set(0.6, 0.6, 0.6);
      frame.position.y += 1.2; // Move object slightly upward

      // Apply the reflective material
      frame.traverse((child) => {
        if (child.isMesh) child.material = material;
      });

      scene.add(frame);
      loadedCount++;

      // Start animation when all frames are loaded
      if (loadedCount === 65) {
        frames[0].visible = true;
        startAnimation();
      }
    });
  }
}

// Switch Between Animation Frames
function switchFrame() {
  if (frames.length < 65) return; // Ensure all frames are loaded

  frames[currentFrameIndex].visible = false; // Hide current frame
  currentFrameIndex = forward ? currentFrameIndex + 1 : currentFrameIndex - 1;

  // Reverse direction at limits
  if (currentFrameIndex > 64) {
    currentFrameIndex = 63;
    forward = false;
  } else if (currentFrameIndex < 0) {
    currentFrameIndex = 1;
    forward = true;
  }

  frames[currentFrameIndex].visible = true; // Show next frame
}

// Start Animation
function startAnimation() {
  setInterval(switchFrame, 41.67); // Adjust speed as needed
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Load all frames
loadFrames();

// Handle Window Resizing
window.addEventListener("resize", () => {
  renderer.setSize(container.clientWidth, container.clientHeight);
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
});
