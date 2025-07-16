import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEffect, useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import createEdgeClient from "@honeycomb-protocol/edge-client";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { BadgesCondition } from '@honeycomb-protocol/edge-client';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

import moonModel from './assets/makemake_an_artists_interpretation_f4892653.glb';
import galaxy1 from './assets/inside_galaxy_skybox_hdri_360_panorama_dbec329b.glb';
import galaxy2 from './assets/space_nebula_hdri_panorama_360_skydome_8bbd7364.glb';
import galaxy3 from './assets/space_nebula_hdri_panorama_360_skydome (1)_10bfb108.glb';
import galaxy4 from './assets/billions_stars_skybox_hdri_panorama_94b83198.glb';

const API_URL = "https://edge.test.honeycombprotocol.com/";
const client = createEdgeClient(API_URL, true);

const firebaseConfig = {
  apiKey: "AIzaSyBryYJ_BEXB9zuJCRnO1RdDbj1T5piAuKc",
  authDomain: "astroworld-ac31d.firebaseapp.com",
  databaseURL: "https://astroworld-ac31d-default-rtdb.firebaseio.com",
  projectId: "astroworld-ac31d",
  storageBucket: "astroworld-ac31d.firebasestorage.app",
  messagingSenderId: "589271153603",
  appId: "1:589271153603:web:028ab408f1ac3f3bbddb76",
  measurementId: "G-FYJBPBFM34"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

const PROJECT_ADDRESS = "HhEQWQdVL9wagu3tHj6vSBAR4YB9UtkuQkiHZ3cLMU1y"; // From setup-honeycomb.js

function Game() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    if (wallet.connected) {
      createUserAndProfile();
    }
  }, [wallet.connected]);

  async function createUserAndProfile() {
    if (profileCreated) return;
    try {
      const { createNewUserWithProfileTransaction: txResponse } = await client.createNewUserWithProfileTransaction({
        project: PROJECT_ADDRESS,
        wallet: wallet.publicKey.toString(),
        payer: wallet.publicKey.toString(),
        profileIdentity: "main",
        userInfo: {
          name: "Astroworm Player",
          bio: "Cosmic Serpent in the Reality Coil",
          pfp: "https://example.com/default-pfp.png" // Replace with default pfp
        }
      });
      await sendClientTransactions(client, wallet, txResponse);
      setProfileCreated(true);
      console.log("User and profile created");
    } catch (error) {
      console.error('Error creating user and profile:', error);
    }
  }

  // Original game code with modifications

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;
  renderer.physicallyCorrectLights = false;
  renderer.toneMappingExposure = 0.8;
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '-1';
  const globalStyle = document.createElement('style');
  globalStyle.textContent = `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: monospace;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    * {
      box-sizing: border-box;
    }
    .fade-in {
      opacity: 0;
      animation: fadeIn 0.5s ease-in-out forwards;
    }
    .fade-out {
      animation: fadeOut 0.3s ease-in-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    /* Mobile responsive styles */
    @media (max-width: 768px) {
      .mobile-controls {
        display: flex !important;
      }
      /* Adjust UI elements for mobile */
      .game-title {
        font-size: 48px !important;
      }
      .menu-button {
        font-size: 16px !important;
        padding: 12px 25px !important;
        min-width: 180px !important;
      }
      .menu-button.primary {
        font-size: 20px !important;
        padding: 16px 30px !important;
      }
      .tutorial-overlay {
        bottom: 80px !important;
      }
      .score-text, .timer-text {
        font-size: 16px !important;
      }
      .game-over-panel, .timed-game-over-panel {
        width: 90% !important;
        max-width: 350px !important;
        padding: 20px !important;
      }
      .pause-menu {
        padding: 20px !important;
      }
    }
    @media (max-width: 480px) {
      .game-title {
        font-size: 36px !important;
        letter-spacing: 4px !important;
      }
      .menu-button {
        font-size: 14px !important;
        padding: 10px 20px !important;
        min-width: 160px !important;
      }
      .menu-button.primary {
        font-size: 18px !important;
        padding: 14px 25px !important;
      }
      .game-over-panel, .timed-game-over-panel {
        width: 95% !important;
        padding: 15px !important;
      }
    }
  `;
  document.head.appendChild(globalStyle);
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(viewportMeta);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  scene.background = new THREE.Color(0x000000);
  let loadingComplete = false;
  let directionalLight = null;
  let galaxySkybox = null;
  let mobileControls = null;
  let gameState = {
    score: 0,
    snakeSegments: [],
    snakeDirection: new THREE.Vector3(0, 0, 1),
    snakeUp: new THREE.Vector3(0, 1, 0),
    snakeSpeed: 0.0607500,
    spheres: [],
    maxSphereCount: 300,
    gameRunning: false,
    gameStarted: false,
    growthFactor: 1.0,
    segmentSpacing: 0.2,
    pendingGrowth: 0,
    growthQueue: [],
    platform: {
      mesh: null,
      radius: 100,
      center: new THREE.Vector3(0, 0, 0)
    },
    invincibilityTime: 0,
    camera: {
      currentPosition: new THREE.Vector3(0, 0, 0),
      targetPosition: new THREE.Vector3(0, 0, 0),
      currentLookAt: new THREE.Vector3(0, 0, 0),
      targetLookAt: new THREE.Vector3(0, 0, 0),
      currentUp: new THREE.Vector3(0, 1, 0),
      targetUp: new THREE.Vector3(0, 1, 0),
      smoothingFactor: 0.06
    },
    snakeColors: {
      head: new THREE.Color(),
      body: new THREE.Color(),
      headEmissive: new THREE.Color(),
      bodyEmissive: new THREE.Color()
    },
    aiSnakes: [],
    maxAiSnakes: 3,
    frameCount: 0,
    collisionCheckInterval: 4,
    isPaused: false,
    pauseTransition: 0,
    originalSnakeSpeed: 0.0607500,
    gameMode: 'normal',
    timeRemaining: 60,
    timerStarted: false,
    bestTimedScore: 0,
    timerInterval: null,
    gameStartTime: 0,
    totalPlayTime: 0,
    gamesPlayed: 0,
    highestScore: 0,
    longestSnake: 0,
    spheresEaten: 0
  };
  const scoreText = document.createElement('div');
  scoreText.className = 'score-text';
  scoreText.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-size: 20px;
    font-family: monospace;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    z-index: 1000;
  `;
  scoreText.textContent = 'Score: 0';
  document.body.appendChild(scoreText);
  const timerText = document.createElement('div');
  timerText.id = 'timer-display';
  timerText.className = 'timer-text';
  timerText.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    color: #ffff00;
    font-size: 20px;
    font-family: monospace;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: none;
  `;
  timerText.textContent = 'Time: 1:00';
  document.body.appendChild(timerText);
  const timerStyle = document.createElement('style');
  timerStyle.textContent = `
    @keyframes timerPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  document.head.appendChild(timerStyle);
  const pauseButton = document.createElement('div');
  pauseButton.id = 'pause-button';
  pauseButton.style.cssText = `
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    height: auto;
    padding: 8px 12px;
    color: white;
    font-size: 28px;
    font-weight: bold;
    font-family: monospace;
    cursor: pointer;
    user-select: none;
    display: none;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    z-index: 1000;
  `;
  pauseButton.innerHTML = '||';
  document.body.appendChild(pauseButton);
  const inputMap = {};
  async function createPlatform() {
    const loader = new GLTFLoader();
    try {
      const moonGltf = await new Promise((resolve, reject) => {
        loader.load(moonModel, resolve, undefined, reject);
      });
      const platformMesh = moonGltf.scene;
      const platformRadius = gameState.platform.radius;
      const boundingBox = new THREE.Box3().setFromObject(platformMesh);
      const size = boundingBox.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = platformRadius * 2 / maxDimension;
      platformMesh.scale.set(scale, scale, scale);
      platformMesh.position.copy(gameState.platform.center);
      platformMesh.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.color = new THREE.Color(0x1a1a1a);
            child.material.metalness = child.material.metalness !== undefined ? child.material.metalness * 0.01 : 0.005;
            child.material.roughness = child.material.roughness !== undefined ? Math.max(child.material.roughness, 0.98) : 0.9875;
            child.material.shadowSide = THREE.DoubleSide;
            child.material.transparent = false;
            child.material.alphaTest = 0;
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
            const textureTypes = ['map', 'normalMap', 'roughnessMap'];
            textureTypes.forEach(textureType => {
              if (child.material[textureType]) {
                const texture = child.material[textureType];
                texture.anisotropy = 4;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                if (textureType === 'map') {
                  texture.repeat.set(16, 16);
                }
                texture.generateMipmaps = true;
                texture.needsUpdate = true;
              }
            });
            if (child.material.normalMap) {
              child.material.normalScale.set(2.0, 2.0);
            }
            child.material.needsUpdate = true;
          }
        }
      });
      scene.add(platformMesh);
      gameState.platform.mesh = platformMesh;
      const boundaryRadius = gameState.platform.radius + 1.2;
      const gridGeometry = new THREE.SphereGeometry(boundaryRadius, 32, 16);
      const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
        blending: THREE.AdditiveBlending
      });
      const boundaryGrid = new THREE.Mesh(gridGeometry, gridMaterial);
      boundaryGrid.position.copy(gameState.platform.center);
      boundaryGrid.visible = false;
      scene.add(boundaryGrid);
      gameState.platform.boundaryGrid = boundaryGrid;
    } catch (error) {
      console.warn('Failed to load Makemake model, using default sphere:', error);
      const geometry = new THREE.SphereGeometry(gameState.platform.radius, 32, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0xB0B0B0,
        metalness: 0.005,
        roughness: 0.9875,
        envMap: scene.background,
        envMapIntensity: 0.05
      });
      const platformMesh = new THREE.Mesh(geometry, material);
      platformMesh.position.copy(gameState.platform.center);
      platformMesh.castShadow = true;
      platformMesh.receiveShadow = true;
      scene.add(platformMesh);
      gameState.platform.mesh = platformMesh;
    }
  }
  async function loadSun() {
    try {
      const loader = new GLTFLoader();
      const skyboxUrls = [galaxy1, galaxy2, galaxy3, galaxy4];
      const randomSkyboxUrl = skyboxUrls[Math.floor(Math.random() * skyboxUrls.length)];
      try {
        const galaxyGltf = await new Promise((resolve, reject) => {
          loader.load(randomSkyboxUrl, resolve, undefined, reject);
        });
        galaxySkybox = galaxyGltf.scene;
        galaxySkybox.scale.set(500, 500, 500);
        galaxySkybox.position.set(0, 0, 0);
        galaxySkybox.traverse(child => {
          if (child.isMesh) {
            child.material.side = THREE.BackSide;
            child.material.depthWrite = false;
            child.renderOrder = -1000;
            if (child.material.color) {
              child.material.color.multiplyScalar(0.8);
            }
            if (child.material.emissive) {
              child.material.emissive.multiplyScalar(1.2);
            }
            child.material.emissiveIntensity = 0.6;
          }
        });
        scene.add(galaxySkybox);
      } catch (error) {
        console.warn('Failed to load galaxy skybox, using fallback:', error);
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 2,
          sizeAttenuation: false
        });
        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
          const radius = 400;
          const x = (Math.random() - 0.5) * radius;
          const y = (Math.random() - 0.5) * radius;
          const z = (Math.random() - 0.5) * radius;
          starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
        galaxySkybox = stars;
      }
      directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
      directionalLight.position.set(0, 400, 0);
      directionalLight.target.position.set(0, 0, 0);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 50;
      directionalLight.shadow.camera.far = 600;
      directionalLight.shadow.camera.left = -150;
      directionalLight.shadow.camera.right = 150;
      directionalLight.shadow.camera.top = 150;
      directionalLight.shadow.camera.bottom = -150;
      directionalLight.shadow.bias = -0.001;
      directionalLight.shadow.normalBias = 0.02;
      directionalLight.shadow.radius = 2;
      directionalLight.shadow.blurSamples = 8;
      scene.add(directionalLight);
      scene.add(directionalLight.target);
      const sunPosition = new THREE.Vector3(0, 400, 0);
      const sunGeometry = new THREE.CircleGeometry(7.5, 32);
      const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
      sunMesh.position.copy(sunPosition);
      sunMesh.lookAt(camera.position);
      scene.add(sunMesh);
      scene.userData.sunPosition = sunPosition;
      await createPlatform();
      gameState.food = [];
      initializeSpheres();
      loadingComplete = true;
    } catch (error) {
      console.error('Error loading game assets:', error);
      loadingComplete = true;
    }
  }
  function generateRandomSnakeColors() {
    const colorSchemes = [{
      head: new THREE.Color(0xFF6B35),
      body: new THREE.Color(0x8B4513),
      headEmissive: new THREE.Color(0x4A1810),
      bodyEmissive: new THREE.Color(0x2F1B14)
    }, {
      head: new THREE.Color(0x00FF9F),
      body: new THREE.Color(0x006B3C),
      headEmissive: new THREE.Color(0x003322),
      bodyEmissive: new THREE.Color(0x001A11)
    }, {
      head: new THREE.Color(0xFF3333),
      body: new THREE.Color(0x990000),
      headEmissive: new THREE.Color(0x330000),
      bodyEmissive: new THREE.Color(0x1A0000)
    }, {
      head: new THREE.Color(0x9333FF),
      body: new THREE.Color(0x5B21B6),
      headEmissive: new THREE.Color(0x2D1B69),
      bodyEmissive: new THREE.Color(0x1A1034)
    }, {
      head: new THREE.Color(0xFFD700),
      body: new THREE.Color(0xB8860B),
      headEmissive: new THREE.Color(0x4D3800),
      bodyEmissive: new THREE.Color(0x2A1F00)
    }, {
      head: new THREE.Color(0x00BFFF),
      body: new THREE.Color(0x0080CC),
      headEmissive: new THREE.Color(0x003D66),
      bodyEmissive: new THREE.Color(0x001F33)
    }];
    const scheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    gameState.snakeColors.head.copy(scheme.head);
    gameState.snakeColors.body.copy(scheme.body);
    gameState.snakeColors.headEmissive.copy(scheme.headEmissive);
    gameState.snakeColors.bodyEmissive.copy(scheme.bodyEmissive);
  }
  function generateAiSnakeColors() {
    const colorSchemes = [{
      head: new THREE.Color(0xFF1493),
      body: new THREE.Color(0x8B008B),
      headEmissive: new THREE.Color(0x4B0A2C),
      bodyEmissive: new THREE.Color(0x2D0A1A)
    }, {
      head: new THREE.Color(0x32CD32),
      body: new THREE.Color(0x228B22),
      headEmissive: new THREE.Color(0x0F4C0F),
      bodyEmissive: new THREE.Color(0x0A2A0A)
    }, {
      head: new THREE.Color(0xFF4500),
      body: new THREE.Color(0xCC3300),
      headEmissive: new THREE.Color(0x551100),
      bodyEmissive: new THREE.Color(0x330A00)
    }, {
      head: new THREE.Color(0x00CED1),
      body: new THREE.Color(0x008B8B),
      headEmissive: new THREE.Color(0x003333),
      bodyEmissive: new THREE.Color(0x001A1A)
    }, {
      head: new THREE.Color(0xFFA500),
      body: new THREE.Color(0xD2691E),
      headEmissive: new THREE.Color(0x4D2B0A),
      bodyEmissive: new THREE.Color(0x2A1505)
    }, {
      head: new THREE.Color(0x9370DB),
      body: new THREE.Color(0x663399),
      headEmissive: new THREE.Color(0x2D1B4D),
      bodyEmissive: new THREE.Color(0x1A0F29)
    }, {
      head: new THREE.Color(0x20B2AA),
      body: new THREE.Color(0x008080),
      headEmissive: new THREE.Color(0x003030),
      bodyEmissive: new THREE.Color(0x001818)
    }, {
      head: new THREE.Color(0xDC143C),
      body: new THREE.Color(0xB22222),
      headEmissive: new THREE.Color(0x440A0A),
      bodyEmissive: new THREE.Color(0x2A0606)
    }];
    const scheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    return {
      head: scheme.head,
      body: scheme.body,
      headEmissive: scheme.headEmissive,
      bodyEmissive: scheme.bodyEmissive
    };
  }
  function createSphere(position) {
    const radius = 0.1568;
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff4500, 0x9400d3, 0x00bfff, 0xff1493, 0x32cd32, 0xffd700];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const geometry = new THREE.SphereGeometry(radius, 4, 3);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(randomColor)
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    sphere.userData.pulseFactor = Math.random() * 2;
    sphere.userData.pulseSpeed = 0.02 + Math.random() * 0.03;
    sphere.userData.radius = radius;
    sphere.userData.baseColor = randomColor;
    return sphere;
  }
  function spawnSphere() {
    if (gameState.spheres.length >= gameState.maxSphereCount) return;
    const platformRadius = gameState.platform.radius;
    const boundaryRadius = platformRadius + 1.2;
    const surfaceOffset = -0.8;
    let spherePosition;
    let attempts = 0;
    do {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      spherePosition = new THREE.Vector3();
      spherePosition.setFromSphericalCoords(platformRadius + surfaceOffset, phi, theta);
      spherePosition.add(gameState.platform.center);
      attempts++;
    } while (spherePosition.distanceTo(gameState.platform.center) > boundaryRadius && attempts < 10);
    if (attempts >= 10) return;
    const sphere = createSphere(spherePosition);
    gameState.spheres.push(sphere);
    scene.add(sphere);
  }
  function initializeSpheres() {
    for (let i = 0; i < gameState.maxSphereCount; i++) {
      spawnSphere();
    }
  }
  function applyMagneticEffect() {
    if (gameState.snakeSegments.length === 0) return;
    const head = gameState.snakeSegments[0];
    const headRadius = head.userData.baseRadius * gameState.growthFactor;
    const magneticRadius = headRadius * 4;
    const magneticStrength = 0.015;
    gameState.spheres.forEach(sphere => {
      const distance = head.position.distanceTo(sphere.position);
      if (distance < magneticRadius && distance > headRadius) {
        const attractionForce = (magneticRadius - distance) / magneticRadius;
        const direction = head.position.clone().sub(sphere.position).normalize();
        const magneticVector = direction.multiplyScalar(magneticStrength * attractionForce);
        sphere.position.add(magneticVector);
      }
    });
  }
  function checkSphereCollisions() {
    if (gameState.snakeSegments.length === 0) return;
    const head = gameState.snakeSegments[0];
    const headRadius = head.userData.baseRadius * gameState.growthFactor;
    for (let i = gameState.spheres.length - 1; i >= 0; i--) {
      const sphere = gameState.spheres[i];
      const distance = head.position.distanceTo(sphere.position);
      const collisionDistance = headRadius + sphere.userData.radius;
      if (distance < collisionDistance) {
        scene.remove(sphere);
        if (sphere.geometry) sphere.geometry.dispose();
        if (sphere.material) sphere.material.dispose();
        gameState.spheres.splice(i, 1);
        gameState.score += 10;
        gameState.spheresEaten++;
        gameState.pendingGrowth += 3;
        gameState.growthFactor += 0.01575;
        gameState.snakeSegments.forEach(segment => {
          segment.scale.setScalar(gameState.growthFactor);
        });
        if (gameState.gameMode === 'timed' && gameState.timeRemaining >= 30 && gameState.score >= 100) {
          unlockAchievement('speedDemon');
        }
        updateGameStats();
        spawnSphere();
        // NEW: Award on eat
        if (wallet.connected) {
          awardAchievements(gameState.score, gameState.snakeSegments.length);
        }
      }
    }
  }
  function createSnakeSegment(position, isHead = false, scale = 1.0, colors = null) {
    const baseRadius = isHead ? 0.6 : 0.55;
    const geometry = new THREE.SphereGeometry(baseRadius, isHead ? 16 : 12, isHead ? 12 : 8);
    const snakeColors = colors || gameState.snakeColors;
    const material = new THREE.MeshStandardMaterial({
      color: isHead ? snakeColors.head : snakeColors.body,
      emissive: isHead ? snakeColors.headEmissive : snakeColors.bodyEmissive,
      emissiveIntensity: isHead ? 0.15 : 0.08,
      transparent: true,
      opacity: 0.98,
      metalness: 0.3,
      roughness: 0.4,
      envMapIntensity: 0.8
    });
    const segment = new THREE.Mesh(geometry, material);
    segment.position.copy(position);
    segment.scale.setScalar(scale);
    segment.userData.isHead = isHead;
    segment.userData.baseRadius = baseRadius;
    segment.castShadow = true;
    segment.receiveShadow = true;
    segment.material.shadowSide = THREE.DoubleSide;
    return segment;
  }
  function createAiSnake() {
    const colors = generateAiSnakeColors();
    const aiSnake = {
      segments: [],
      direction: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      up: new THREE.Vector3(0, 1, 0),
      speed: gameState.snakeSpeed,
      colors: colors,
      growthFactor: 1.0,
      segmentSpacing: gameState.segmentSpacing,
      intelligence: Math.random() * 0.5 + 0.5,
      lastDirectionChange: 0,
      invincibilityTime: 180,
      pendingGrowth: 0,
      growthQueue: []
    };
    const platformRadius = gameState.platform.radius;
    const surfaceOffset = -0.7;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const startPos = new THREE.Vector3();
    startPos.setFromSphericalCoords(platformRadius + surfaceOffset, phi, theta);
    startPos.add(gameState.platform.center);
    aiSnake.up = startPos.clone().sub(gameState.platform.center).normalize();
    aiSnake.direction.sub(aiSnake.up.clone().multiplyScalar(aiSnake.direction.dot(aiSnake.up))).normalize();
    for (let i = 0; i < 6; i++) {
      const segment = createSnakeSegment(startPos, i === 0, aiSnake.growthFactor, colors);
      aiSnake.segments.push(segment);
      scene.add(segment);
    }
    return aiSnake;
  }
  function initializeAiSnakes() {
    const aiCount = gameState.gameMode === 'timed' ? 0 : gameState.maxAiSnakes;
    for (let i = 0; i < aiCount; i++) {
      const aiSnake = createAiSnake();
      gameState.aiSnakes.push(aiSnake);
    }
  }
  function initializeSnake() {
    generateRandomSnakeColors();
    const platformRadius = gameState.platform.radius;
    const surfaceOffset = -0.7;
    const startPosition = gameState.platform.center.clone().add(new THREE.Vector3(0, platformRadius + surfaceOffset, 0));
    gameState.snakeUp = startPosition.clone().sub(gameState.platform.center).normalize();
    gameState.snakeDirection = new THREE.Vector3(0, 0, 1);
    gameState.snakeSegments = [];
    for (let i = 0; i < 8; i++) {
      const segmentPosition = startPosition.clone().add(gameState.snakeDirection.clone().multiplyScalar(-i * gameState.segmentSpacing));
      const segment = createSnakeSegment(segmentPosition, i === 0, gameState.growthFactor);
      gameState.snakeSegments.push(segment);
      scene.add(segment);
    }
    gameState.invincibilityTime = 180;
    const head = gameState.snakeSegments[0];
    if (head) {
      const cameraDirection = gameState.snakeDirection;
      const cameraHeight = 3 + gameState.growthFactor * 2;
      const cameraDistance = 7 + gameState.growthFactor * 2;
      const cameraOffset = cameraDirection.clone().multiplyScalar(-cameraDistance).add(gameState.snakeUp.clone().multiplyScalar(cameraHeight));
      const initialCameraPos = head.position.clone().add(cameraOffset);
      const initialCameraTarget = head.position.clone().add(cameraDirection.clone().multiplyScalar(5));
      gameState.camera.currentPosition.copy(initialCameraPos);
      gameState.camera.targetPosition.copy(initialCameraPos);
      gameState.camera.currentLookAt.copy(initialCameraTarget);
      gameState.camera.targetLookAt.copy(initialCameraTarget);
      gameState.camera.currentUp.copy(gameState.snakeUp);
      gameState.camera.targetUp.copy(gameState.snakeUp);
      camera.position.copy(initialCameraPos);
      camera.up.copy(gameState.snakeUp);
      camera.lookAt(initialCameraTarget);
    }
  }
  function checkCollisions() {
    try {
      const head = gameState.snakeSegments[0];
      if (!head || gameState.snakeSegments.length < 6 || gameState.invincibilityTime > 0) return false;
      if (gameState.frameCount < 300) return false;
      if (!gameState.collisionCheckInterval) gameState.collisionCheckInterval = 3;
      if (gameState.frameCount % gameState.collisionCheckInterval !== 0) return false;
      if (!head.userData || !head.userData.baseRadius) return false;
      const headRadius = head.userData.baseRadius * gameState.growthFactor;
      const headTip = head.position.clone().add(gameState.snakeDirection.clone().multiplyScalar(headRadius * 0.8));
      for (let i = 6; i < gameState.snakeSegments.length; i += 4) {
        const segment = gameState.snakeSegments[i];
        if (!segment || !segment.userData || !segment.userData.baseRadius) continue;
        const segmentRadius = segment.userData.baseRadius * gameState.growthFactor;
        const distance = headTip.distanceTo(segment.position);
        if (distance < segmentRadius * 0.7) {
          return true;
        }
      }
      if (gameState.frameCount % 6 === 0) {
        for (const aiSnake of gameState.aiSnakes) {
          if (!aiSnake || !aiSnake.segments) continue;
          for (let i = 0; i < aiSnake.segments.length; i += 5) {
            const segment = aiSnake.segments[i];
            if (!segment || !segment.userData || !segment.userData.baseRadius) continue;
            const segmentRadius = segment.userData.baseRadius * aiSnake.growthFactor;
            const distance = headTip.distanceTo(segment.position);
            if (distance < (headRadius + segmentRadius) * 0.8) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.warn('Error in collision detection:', error);
      return false;
    }
  }
  function checkSelfCollision() {
    return checkCollisions();
  }
  function restartGame() {
    try {
      gameState.gameRunning = false;
      updateGameStats();
      gameState.snakeSegments.forEach(segment => {
        if (segment) {
          scene.remove(segment);
          if (segment.geometry) segment.geometry.dispose();
          if (segment.material) segment.material.dispose();
        }
      });
      gameState.aiSnakes.forEach(aiSnake => {
        if (aiSnake && aiSnake.segments) {
          aiSnake.segments.forEach(segment => {
            if (segment) {
              scene.remove(segment);
              if (segment.geometry) segment.geometry.dispose();
              if (segment.material) segment.material.dispose();
            }
          });
        }
      });
      gameState.spheres.forEach(sphere => {
        if (sphere) {
          scene.remove(sphere);
          if (sphere.geometry) sphere.geometry.dispose();
          if (sphere.material) sphere.material.dispose();
        }
      });
      gameState.score = 0;
      gameState.snakeSegments = [];
      gameState.aiSnakes = [];
      gameState.spheres = [];
      gameState.snakeDirection = new THREE.Vector3(0, 0, 1);
      gameState.snakeUp = new THREE.Vector3(0, 1, 0);
      gameState.pendingGrowth = 0;
      gameState.growthQueue = [];
      gameState.growthFactor = 1.0;
      gameState.snakeSpeed = gameState.gameMode === 'timed' ? 0.0607500 * 1.5 : 0.0607500;
      gameState.originalSnakeSpeed = gameState.gameMode === 'timed' ? 0.0607500 * 1.5 : 0.0607500;
      gameState.invincibilityTime = 0;
      gameState.collisionCheckInterval = 4;
      gameState.isPaused = false;
      gameState.pauseTransition = 0;
      const existingPanel = document.querySelector('.game-over-panel');
      if (existingPanel && existingPanel.parentNode) {
        existingPanel.parentNode.removeChild(existingPanel);
      }
      setTimeout(() => {
        gameState.gamesPlayed++;
        gameState.gameStartTime = Date.now();
        initializeSnake();
        initializeAiSnakes();
        gameState.gameRunning = true;
        gameState.gameStarted = true;
        checkAchievements();
        saveAchievements();
      }, 100);
    } catch (error) {
      console.error('Error restarting game:', error);
      location.reload();
    }
  }
  function showTutorial() {
    const tutorialOverlay = document.createElement('div');
    tutorialOverlay.id = 'tutorial-overlay';
    tutorialOverlay.className = 'tutorial-overlay';
    tutorialOverlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 8888;
      font-family: monospace;
      color: white;
      pointer-events: none;
      opacity: 0;
    `;
    tutorialOverlay.classList.add('fade-in');
    const keysContainer = document.createElement('div');
    keysContainer.style.cssText = `
      display: flex;
      gap: 40px;
      align-items: center;
      margin-bottom: 15px;
    `;
    const leftKeys = document.createElement('div');
    leftKeys.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    `;
    const leftKeyVisual = document.createElement('div');
    leftKeyVisual.style.cssText = `
      background: #4169e1;
      color: white;
      padding: 10px 15px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #00ffff;
      animation: tutorialPulse 1.5s infinite ease-in-out;
    `;
    leftKeyVisual.textContent = `A / ←`;
    const leftLabel = document.createElement('div');
    leftLabel.style.cssText = `
      font-size: 14px;
      color: #ffffff;
      text-align: center;
    `;
    leftLabel.textContent = `TURN LEFT`;
    leftKeys.appendChild(leftKeyVisual);
    leftKeys.appendChild(leftLabel);
    const rightKeys = document.createElement('div');
    rightKeys.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    `;
    const rightKeyVisual = document.createElement('div');
    rightKeyVisual.style.cssText = `
      background: #4169e1;
      color: white;
      padding: 10px 15px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #00ffff;
      animation: tutorialPulse 1.5s infinite ease-in-out;
      animation-delay: 0.7s;
    `;
    rightKeyVisual.textContent = `D / →`;
    const rightLabel = document.createElement('div');
    rightLabel.style.cssText = `
      font-size: 14px;
      color: #ffffff;
      text-align: center;
    `;
    rightLabel.textContent = `TURN RIGHT`;
    rightKeys.appendChild(rightKeyVisual);
    rightKeys.appendChild(rightLabel);
    keysContainer.appendChild(leftKeys);
    keysContainer.appendChild(rightKeys);
    const instructionText = document.createElement('div');
    instructionText.style.cssText = `
      font-size: 16px;
      color: #00ffff;
      text-align: center;
      letter-spacing: 1px;
    `;
    instructionText.textContent = `Navigate the Reality Coil • Devour Cosmic Fragments`;
    tutorialOverlay.appendChild(keysContainer);
    tutorialOverlay.appendChild(instructionText);
    const tutorialStyle = document.createElement('style');
    tutorialStyle.textContent = `
      @keyframes tutorialPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(tutorialStyle);
    document.body.appendChild(tutorialOverlay);
    setTimeout(() => {
      tutorialOverlay.classList.remove('fade-in');
      tutorialOverlay.classList.add('fade-out');
      setTimeout(() => {
        if (tutorialOverlay && tutorialOverlay.parentNode) {
          tutorialOverlay.parentNode.removeChild(tutorialOverlay);
        }
        if (tutorialStyle && tutorialStyle.parentNode) {
          tutorialStyle.parentNode.removeChild(tutorialStyle);
        }
      }, 300);
    }, 5000);
  }
  function showTimedTutorial() {
    const tutorialOverlay = document.createElement('div');
    tutorialOverlay.id = 'timed-tutorial-overlay';
    tutorialOverlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 8888;
      font-family: monospace;
      color: white;
      pointer-events: none;
      opacity: 0;
    `;
    tutorialOverlay.classList.add('fade-in');
    const keysContainer = document.createElement('div');
    keysContainer.style.cssText = `
      display: flex;
      gap: 40px;
      align-items: center;
      margin-bottom: 15px;
    `;
    const leftKeys = document.createElement('div');
    leftKeys.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    `;
    const leftKeyVisual = document.createElement('div');
    leftKeyVisual.style.cssText = `
      background: #ff6b35;
      color: white;
      padding: 10px 15px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #ffff00;
      animation: timedTutorialPulse 1s infinite ease-in-out;
    `;
    leftKeyVisual.textContent = `A / ←`;
    const leftLabel = document.createElement('div');
    leftLabel.style.cssText = `
      font-size: 14px;
      color: #ffffff;
      text-align: center;
    `;
    leftLabel.textContent = `TURN LEFT`;
    leftKeys.appendChild(leftKeyVisual);
    leftKeys.appendChild(leftLabel);
    const rightKeys = document.createElement('div');
    rightKeys.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    `;
    const rightKeyVisual = document.createElement('div');
    rightKeyVisual.style.cssText = `
      background: #ff6b35;
      color: white;
      padding: 10px 15px;
      border-radius: 6px;
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #ffff00;
      animation: timedTutorialPulse 1s infinite ease-in-out;
      animation-delay: 0.5s;
    `;
    rightKeyVisual.textContent = `D / →`;
    const rightLabel = document.createElement('div');
    rightLabel.style.cssText = `
      font-size: 14px;
      color: #ffffff;
      text-align: center;
    `;
    rightLabel.textContent = `TURN RIGHT`;
    rightKeys.appendChild(rightKeyVisual);
    rightKeys.appendChild(rightLabel);
    keysContainer.appendChild(leftKeys);
    keysContainer.appendChild(rightKeys);
    const instructionText = document.createElement('div');
    instructionText.style.cssText = `
      font-size: 18px;
      color: #ffff00;
      text-align: center;
      letter-spacing: 1px;
      font-weight: bold;
    `;
    instructionText.textContent = `60 SECONDS • GROW AS BIG AS POSSIBLE!`;
    tutorialOverlay.appendChild(keysContainer);
    tutorialOverlay.appendChild(instructionText);
    const timedTutorialStyle = document.createElement('style');
    timedTutorialStyle.textContent = `
      @keyframes timedTutorialPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 10px #ffff00; }
        50% { transform: scale(1.1); box-shadow: 0 0 20px #ffff00; }
      }
    `;
    document.head.appendChild(timedTutorialStyle);
    document.body.appendChild(tutorialOverlay);
    setTimeout(() => {
      tutorialOverlay.classList.remove('fade-in');
      tutorialOverlay.classList.add('fade-out');
      setTimeout(() => {
        if (tutorialOverlay && tutorialOverlay.parentNode) {
          tutorialOverlay.parentNode.removeChild(tutorialOverlay);
        }
        if (timedTutorialStyle && timedTutorialStyle.parentNode) {
          timedTutorialStyle.parentNode.removeChild(timedTutorialStyle);
        }
      }, 300);
    }, 4000);
  }
  function startTimer() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }
    gameState.timerStarted = true;
    gameState.timerInterval = setInterval(() => {
      if (!gameState.gameRunning || gameState.isPaused) return;
      gameState.timeRemaining--;
      updateTimerDisplay();
      if (gameState.timeRemaining <= 0) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        gameState.gameRunning = false;
        showTimedGameOver();
      }
    }, 1000);
  }
  function updateTimerDisplay() {
    const timerElement = document.getElementById('timer-display');
    if (timerElement) {
      const minutes = Math.floor(gameState.timeRemaining / 60);
      const seconds = gameState.timeRemaining % 60;
      timerElement.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      if (gameState.timeRemaining <= 10) {
        timerElement.style.color = '#ff3333';
        timerElement.style.animation = 'timerPulse 0.5s infinite ease-in-out';
      }
    }
  }
  function showTimedGameOver() {
    const finalSnakeLength = gameState.snakeSegments.length;
    const finalScore = gameState.score;
    updateGameStats();
    if (finalScore > gameState.bestTimedScore) {
      gameState.bestTimedScore = finalScore;
      localStorage.setItem('astrowormBestTimedScore', finalScore.toString());
    }
    gameState.snakeSegments.forEach((segment, index) => {
      setTimeout(() => {
        scene.remove(segment);
        segment.geometry.dispose();
        segment.material.dispose();
      }, index * 50);
    });
    gameState.snakeSegments = [];
    const gameOverPanel = document.createElement('div');
    gameOverPanel.className = 'timed-game-over-panel';
    gameOverPanel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      height: 320px;
      border-radius: 15px;
      color: white;
      border: 3px solid #ffff00;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: monospace;
      font-weight: bold;
      box-sizing: border-box;
      padding: 25px;
      z-index: 1000;
      opacity: 0;
    `;
    gameOverPanel.classList.add('fade-in');
    const timeUpText = document.createElement('div');
    timeUpText.style.cssText = `
      color: #ffff00;
      font-size: 36px;
      margin-bottom: 15px;
      text-shadow: 0 0 10px #ffff00;
    `;
    timeUpText.textContent = `TIME'S UP!`;
    const finalScoreText = document.createElement('div');
    finalScoreText.style.cssText = `
      color: #00ffff;
      font-size: 24px;
      margin-bottom: 8px;
    `;
    finalScoreText.textContent = `Final Score: ${finalScore}`;
    const lengthReachedText = document.createElement('div');
    lengthReachedText.style.cssText = `
      color: #ffffff;
      font-size: 18px;
      margin-bottom: 8px;
    `;
    lengthReachedText.textContent = `Final Length: ${finalSnakeLength}`;
    const bestScoreText = document.createElement('div');
    bestScoreText.style.cssText = `
      color: ${finalScore > gameState.bestTimedScore - finalScore ? '#ffff00' : '#888888'};
      font-size: 16px;
      margin-bottom: 25px;
    `;
    bestScoreText.textContent = `Best Timed Score: ${gameState.bestTimedScore}`;
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    `;
    const playAgainButton = document.createElement('button');
    playAgainButton.style.cssText = `
      background: #ffff00;
      color: black;
      border: none;
      padding: 12px 18px;
      font-size: 15px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    playAgainButton.textContent = `PLAY AGAIN`;
    playAgainButton.addEventListener('click', () => {
      gameOverPanel.classList.remove('fade-in');
      gameOverPanel.classList.add('fade-out');
      setTimeout(() => {
        if (gameOverPanel.parentNode) {
          document.body.removeChild(gameOverPanel);
        }
        restartTimedGame();
      }, 300);
    });
    const shareButton = document.createElement('button');
    shareButton.style.cssText = `
      background: #1DA1F2;
      color: white;
      border: none;
      padding: 12px 18px;
      font-size: 15px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    shareButton.textContent = `SHARE TO X`;
    shareButton.addEventListener('click', () => {
      const tweetText = `🐍 Just scored ${finalScore} points in ASTROWORM's 60-second time attack! My cosmic serpent reached ${finalSnakeLength} segments in the Reality Coil! 🌌⏰`;
      const gameUrl = 'https://dev.fun/p/c0e5947aa562d27d5083';
      const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gameUrl)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
    });
    shareButton.addEventListener('mouseenter', () => {
      shareButton.style.transform = 'scale(1.05)';
      shareButton.style.background = '#1991DA';
    });
    shareButton.addEventListener('mouseleave', () => {
      shareButton.style.transform = 'scale(1)';
      shareButton.style.background = '#1DA1F2';
    });
    const mainMenuButton = document.createElement('button');
    mainMenuButton.style.cssText = `
      background: #666666;
      color: white;
      border: none;
      padding: 12px 18px;
      font-size: 15px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    mainMenuButton.textContent = `MAIN MENU`;
    mainMenuButton.addEventListener('click', () => {
      gameOverPanel.classList.remove('fade-in');
      gameOverPanel.classList.add('fade-out');
      setTimeout(() => {
        if (gameOverPanel.parentNode) {
          document.body.removeChild(gameOverPanel);
        }
        resetGameToMenu();
      }, 300);
    });
    buttonContainer.appendChild(playAgainButton);
    buttonContainer.appendChild(shareButton);
    buttonContainer.appendChild(mainMenuButton);
    gameOverPanel.appendChild(timeUpText);
    gameOverPanel.appendChild(finalScoreText);
    gameOverPanel.appendChild(lengthReachedText);
    gameOverPanel.appendChild(bestScoreText);
    gameOverPanel.appendChild(buttonContainer);
    document.body.appendChild(gameOverPanel);
    // NEW: Award and save
    if (wallet.connected) {
      awardAchievements(finalScore, finalSnakeLength);
      saveUserData(wallet.publicKey.toString(), finalScore, finalSnakeLength);
    }
  }
  function restartTimedGame() {
    try {
      gameState.gameRunning = false;
      if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
      }
      gameState.gameMode = 'timed';
      gameState.timeRemaining = 60;
      gameState.timerStarted = false;
      gameState.frameCount = 0;
      gameState.snakeSegments.forEach(segment => {
        if (segment) {
          scene.remove(segment);
          if (segment.geometry) segment.geometry.dispose();
          if (segment.material) segment.material.dispose();
        }
      });
      gameState.spheres.forEach(sphere => {
        if (sphere) {
          scene.remove(sphere);
          if (sphere.geometry) sphere.geometry.dispose();
          if (sphere.material) sphere.material.dispose();
        }
      });
      gameState.score = 0;
      gameState.snakeSegments = [];
      gameState.spheres = [];
      gameState.snakeDirection = new THREE.Vector3(0, 0, 1);
      gameState.snakeUp = new THREE.Vector3(0, 1, 0);
      gameState.pendingGrowth = 0;
      gameState.growthQueue = [];
      gameState.growthFactor = 1.0;
      gameState.snakeSpeed = 0.0607500;
      gameState.originalSnakeSpeed = 0.0607500;
      gameState.invincibilityTime = 0;
      gameState.collisionCheckInterval = 4;
      gameState.isPaused = false;
      gameState.pauseTransition = 0;
      gameState.frameCount = 0;
      scoreText.textContent = 'Score: 0';
      setTimeout(() => {
        initializeSnake();
        initializeSpheres();
        gameState.gameRunning = true;
        gameState.gameStarted = true;
        startTimer();
      }, 100);
    } catch (error) {
      console.error('Error restarting timed game:', error);
      location.reload();
    }
  }
  function resetGameToMenu() {
    try {
      if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
      }
      gameState.snakeSegments.forEach(segment => {
        if (segment) {
          scene.remove(segment);
          if (segment.geometry) segment.geometry.dispose();
          if (segment.material) segment.material.dispose();
        }
      });
      gameState.aiSnakes.forEach(aiSnake => {
        if (aiSnake && aiSnake.segments) {
          aiSnake.segments.forEach(segment => {
            if (segment) {
              scene.remove(segment);
              if (segment.geometry) segment.geometry.dispose();
              if (segment.material) segment.material.dispose();
            }
          });
        }
      });
      gameState.spheres.forEach(sphere => {
        if (sphere) {
          scene.remove(sphere);
          if (sphere.geometry) sphere.geometry.dispose();
          if (sphere.material) sphere.material.dispose();
        }
      });
      gameState.snakeSegments = [];
      gameState.aiSnakes = [];
      gameState.spheres = [];
      gameState.score = 0;
      gameState.snakeDirection = new THREE.Vector3(0, 0, 1);
      gameState.snakeUp = new THREE.Vector3(0, 1, 0);
      gameState.pendingGrowth = 0;
      gameState.growthQueue = [];
      gameState.growthFactor = 1.0;
      gameState.snakeSpeed = 0.0607500;
      gameState.originalSnakeSpeed = 0.0607500;
      gameState.invincibilityTime = 0;
      gameState.frameCount = 0;
      gameState.gameMode = 'normal';
      gameState.timeRemaining = 60;
      gameState.timerStarted = false;
      scoreText.textContent = 'Score: 0';
      const timerElement = document.getElementById('timer-display');
      if (timerElement) {
        timerElement.style.display = 'none';
      }
      if (mobileControls) {
        mobileControls.style.display = 'none';
      }
      if (pauseButton) {
        pauseButton.style.display = 'none';
      }
    } catch (error) {
      console.warn('Error during game cleanup:', error);
    }
    gameState.gameRunning = false;
    gameState.gameStarted = false;
    gameState.isPaused = false;
    showStartScreen();
  }
  function showPauseMenu() {
    const pauseMenu = document.createElement('div');
    pauseMenu.id = 'pause-menu';
    pauseMenu.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: monospace;
      color: white;
      opacity: 0;
    `;
    pauseMenu.classList.add('fade-in');
    const pauseTitle = document.createElement('div');
    pauseTitle.style.cssText = `
      font-size: 48px;
      font-weight: bold;
      color: #4169e1;
      letter-spacing: 4px;
      margin-bottom: 30px;
    `;
    pauseTitle.textContent = `PAUSED`;
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      font-size: 18px;
      color: #ffffff;
      text-align: center;
      margin-bottom: 30px;
      opacity: 0.9;
    `;
    instructions.textContent = `Press ESCAPE to resume your cosmic journey`;
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 20px;
      flex-direction: column;
      align-items: center;
    `;
    const resumeButton = document.createElement('button');
    resumeButton.style.cssText = `
      background: #4169e1;
      color: white;
      border: 2px solid #4169e1;
      padding: 15px 30px;
      font-size: 18px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      letter-spacing: 2px;
      transition: all 0.3s ease;
    `;
    resumeButton.textContent = `RESUME`;
    resumeButton.addEventListener('mouseenter', () => {
      resumeButton.style.transform = 'scale(1.05)';
      resumeButton.style.background = '#5a7dff';
    });
    resumeButton.addEventListener('mouseleave', () => {
      resumeButton.style.transform = 'scale(1)';
      resumeButton.style.background = '#4169e1';
    });
    resumeButton.addEventListener('click', hidePauseMenu);
    const quitButton = document.createElement('button');
    quitButton.style.cssText = `
      background: #FF3333;
      color: white;
      border: 2px solid #FF3333;
      padding: 15px 30px;
      font-size: 18px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      letter-spacing: 2px;
      transition: all 0.3s ease;
    `;
    quitButton.textContent = `QUIT GAME`;
    quitButton.addEventListener('mouseenter', () => {
      quitButton.style.transform = 'scale(1.05)';
      quitButton.style.background = '#FF5555';
    });
    quitButton.addEventListener('mouseleave', () => {
      quitButton.style.transform = 'scale(1)';
      quitButton.style.background = '#FF3333';
    });
    quitButton.addEventListener('click', () => {
      const pauseMenu = document.getElementById('pause-menu');
      if (pauseMenu) {
        pauseMenu.classList.remove('fade-in');
        pauseMenu.classList.add('fade-out');
        setTimeout(() => {
          if (pauseMenu.parentNode) {
            document.body.removeChild(pauseMenu);
          }
          resetGameToMenu();
        }, 300);
      }
    });
    buttonContainer.appendChild(resumeButton);
    buttonContainer.appendChild(quitButton);
    pauseMenu.appendChild(pauseTitle);
    pauseMenu.appendChild(instructions);
    pauseMenu.appendChild(buttonContainer);
    document.body.appendChild(pauseMenu);
  }
  function hidePauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
      pauseMenu.classList.remove('fade-in');
      pauseMenu.classList.add('fade-out');
      setTimeout(() => {
        if (pauseMenu.parentNode) {
          document.body.removeChild(pauseMenu);
        }
      }, 300);
    }
    gameState.isPaused = false;
  }
  function showStartScreenInternal() {
    const startScreen = document.createElement('div');
    startScreen.id = 'start-screen';
    startScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: monospace;
      color: white;
      overflow: hidden;
      opacity: 0;
    `;
    startScreen.classList.add('fade-in');
    const starsContainer = document.createElement('div');
    starsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    `;
    for (let i = 0; i < 200; i++) {
      const star = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const opacity = Math.random() * 0.8 + 0.2;
      const animationDelay = Math.random() * 3;
      const driftDuration = 20 + Math.random() * 40;
      const driftDelay = Math.random() * 10;
      const driftAnimation = Math.random() > 0.5 ? 'starDrift' : 'starDriftAlt';
      star.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        opacity: ${opacity};
        animation: twinkle 3s infinite ease-in-out, ${driftAnimation} ${driftDuration}s infinite linear;
        animation-delay: ${animationDelay}s, ${driftDelay}s;
      `;
      starsContainer.appendChild(star);
    }
    startScreen.appendChild(starsContainer);
    const starStyle = document.createElement('style');
    starStyle.textContent = `
      @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      @keyframes starDrift {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-100vw, 50vh); }
      }
      @keyframes starDriftAlt {
        0% { transform: translate(0, 0); }
        100% { transform: translate(100vw, -30vh); }
      }
    `;
    document.head.appendChild(starStyle);
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      text-align: center;
      margin-bottom: 50px;
      z-index: 2;
      position: relative;
    `;
    const gameTitle = document.createElement('div');
    gameTitle.className = 'game-title';
    gameTitle.style.cssText = `
      font-size: 72px;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 8px;
      margin-bottom: 20px;
    `;
    gameTitle.textContent = `ASTROWORM`;
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      font-size: 18px;
      color: #b0b0b0;
      opacity: 0.9;
      letter-spacing: 2px;
    `;
    subtitle.textContent = `COSMIC SERPENT REALITY COIL`;
    titleContainer.appendChild(gameTitle);
    titleContainer.appendChild(subtitle);
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: center;
      z-index: 2;
      position: relative;
    `;
    function createMenuButton(text, clickHandler, isPrimary = false) {
      const button = document.createElement('button');
      button.className = `menu-button${isPrimary ? ' primary' : ''}`;
      button.style.cssText = `
        background: ${isPrimary ? '#4169e1' : '#2a4d8a'};
        color: white;
        border: 2px solid ${isPrimary ? '#4169e1' : '#2a4d8a'};
        padding: ${isPrimary ? '20px 40px' : '15px 35px'};
        font-size: ${isPrimary ? '24px' : '18px'};
        font-family: monospace;
        font-weight: bold;
        border-radius: 10px;
        cursor: pointer;
        letter-spacing: 2px;
        transition: all 0.3s ease;
        z-index: 2;
        position: relative;
        min-width: 200px;
      `;
      button.textContent = text;
      const handleEnter = () => {
        button.style.transform = 'scale(1.05)';
        button.style.background = isPrimary ? '#5a7dff' : '#3d6bb3';
      };
      const handleLeave = () => {
        button.style.transform = 'scale(1)';
        button.style.background = isPrimary ? '#4169e1' : '#2a4d8a';
      };
      button.addEventListener('mouseenter', handleEnter);
      button.addEventListener('mouseleave', handleLeave);
      button.addEventListener('touchstart', handleEnter);
      button.addEventListener('touchend', handleLeave);
      button.addEventListener('click', clickHandler);
      return button;
    }
    // NEW: Wallet connect button
    const connectButton = createMenuButton(wallet.connected ? 'WALLET CONNECTED' : 'CONNECT WALLET', () => {
      if (!wallet.connected) {
        setVisible(true);
      }
    });
    connectButton.classList.add('wallet-connect-button');
    buttonContainer.appendChild(connectButton);
    function showAchievementsScreen() {
      const achievementsScreen = document.createElement('div');
      achievementsScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%);
        display: flex;
        flex-direction: column;
        z-index: 10001;
        font-family: monospace;
        color: white;
        overflow-y: auto;
        opacity: 0;
      `;
      achievementsScreen.classList.add('fade-in');
      const header = document.createElement('div');
      header.style.cssText = `
        text-align: center;
        padding: 30px 20px 20px;
        position: sticky;
        top: 0;
        background: rgba(10, 10, 26, 0.9);
        backdrop-filter: blur(10px);
        z-index: 2;
      `;
      const achievementsTitle = document.createElement('div');
      achievementsTitle.style.cssText = `
        font-size: 48px;
        font-weight: bold;
        color: #4169e1;
        letter-spacing: 4px;
        margin-bottom: 10px;
      `;
      achievementsTitle.textContent = `ACHIEVEMENTS`;
      const subtitle = document.createElement('div');
      subtitle.style.cssText = `
        font-size: 18px;
        color: #b0b0b0;
        opacity: 0.8;
        margin-bottom: 20px;
      `;
      const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
      const totalCount = Object.keys(achievements).length;
      subtitle.textContent = `${unlockedCount}/${totalCount} Cosmic Badges Earned`;
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        width: 300px;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        margin: 0 auto 10px;
        overflow: hidden;
      `;
      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        width: ${unlockedCount / totalCount * 100}%;
        height: 100%;
        background: linear-gradient(90deg, #4169e1, #00ffff);
        border-radius: 3px;
        transition: width 0.5s ease;
      `;
      progressBar.appendChild(progressFill);
      const progressText = document.createElement('div');
      progressText.style.cssText = `
        font-size: 14px;
        color: #00ffff;
        margin-bottom: 20px;
      `;
      progressText.textContent = `${Math.round(unlockedCount / totalCount * 100)}% Complete`;
      header.appendChild(achievementsTitle);
      header.appendChild(subtitle);
      header.appendChild(progressBar);
      header.appendChild(progressText);
      const content = document.createElement('div');
      content.style.cssText = `
        flex: 1;
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
      `;
      Object.values(achievements).forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.style.cssText = `
          background: ${achievement.unlocked ? 'linear-gradient(135deg, rgba(65, 105, 225, 0.2), rgba(0, 255, 255, 0.1))' : 'rgba(128, 128, 128, 0.1)'};
          border: 2px solid ${achievement.unlocked ? '#4169e1' : '#666666'};
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: default;
          opacity: ${achievement.unlocked ? '1' : '0.6'};
          position: relative;
          overflow: hidden;
        `;
        if (achievement.unlocked) {
          achievementCard.style.boxShadow = '0 0 20px rgba(65, 105, 225, 0.3)';
        }
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
          font-size: 48px;
          text-align: center;
          margin-bottom: 15px;
          filter: ${achievement.unlocked ? 'none' : 'grayscale(100%)'};
        `;
        iconContainer.textContent = achievement.icon;
        const nameElement = document.createElement('div');
        nameElement.style.cssText = `
          font-size: 18px;
          font-weight: bold;
          color: ${achievement.unlocked ? '#ffffff' : '#888888'};
          text-align: center;
          margin-bottom: 8px;
        `;
        nameElement.textContent = achievement.name;
        const descElement = document.createElement('div');
        descElement.style.cssText = `
          font-size: 14px;
          color: ${achievement.unlocked ? '#b0b0b0' : '#666666'};
          text-align: center;
          line-height: 1.4;
        `;
        descElement.textContent = achievement.description;
        if (achievement.unlocked) {
          const unlockedBadge = document.createElement('div');
          unlockedBadge.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #00ff00;
            color: #000000;
            font-size: 12px;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 12px;
          `;
          unlockedBadge.textContent = '✓ UNLOCKED';
          achievementCard.appendChild(unlockedBadge);
        }
        achievementCard.appendChild(iconContainer);
        achievementCard.appendChild(nameElement);
        achievementCard.appendChild(descElement);
        content.appendChild(achievementCard);
      });
      const footer = document.createElement('div');
      footer.style.cssText = `
        text-align: center;
        padding: 20px;
        background: rgba(10, 10, 26, 0.9);
        backdrop-filter: blur(10px);
      `;
      const backButton = createMenuButton('BACK TO MAIN MENU', () => {
        achievementsScreen.classList.remove('fade-in');
        achievementsScreen.classList.add('fade-out');
        setTimeout(() => {
          if (achievementsScreen.parentNode) {
            document.body.removeChild(achievementsScreen);
          }
          showStartScreenInternal();
        }, 300);
      });
      footer.appendChild(backButton);
      achievementsScreen.appendChild(header);
      achievementsScreen.appendChild(content);
      achievementsScreen.appendChild(footer);
      document.body.appendChild(achievementsScreen);
    }
    function showPlaceholderPage(title) {
      const placeholderScreen = document.createElement('div');
      placeholderScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        font-family: monospace;
        color: white;
        opacity: 0;
      `;
      placeholderScreen.classList.add('fade-in');
      const pageTitle = document.createElement('div');
      pageTitle.style.cssText = `
        font-size: 48px;
        font-weight: bold;
        color: #4169e1;
        letter-spacing: 4px;
        margin-bottom: 30px;
        text-align: center;
      `;
      pageTitle.textContent = title;
      const comingSoonText = document.createElement('div');
      comingSoonText.style.cssText = `
        font-size: 24px;
        color: #ffffff;
        opacity: 0.8;
        margin-bottom: 40px;
        text-align: center;
      `;
      comingSoonText.textContent = `Coming Soon to the Reality Coil`;
      const backButton = createMenuButton('BACK TO MAIN MENU', () => {
        placeholderScreen.classList.remove('fade-in');
        placeholderScreen.classList.add('fade-out');
        setTimeout(() => {
          if (placeholderScreen.parentNode) {
            document.body.removeChild(placeholderScreen);
          }
          showStartScreenInternal();
        }, 300);
      });
      placeholderScreen.appendChild(pageTitle);
      placeholderScreen.appendChild(comingSoonText);
      placeholderScreen.appendChild(backButton);
      document.body.appendChild(placeholderScreen);
    }
    function showGameModeScreen() {
      const gameModeScreen = document.createElement('div');
      gameModeScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        font-family: monospace;
        color: white;
        opacity: 0;
      `;
      gameModeScreen.classList.add('fade-in');
      const gameModeTitle = document.createElement('div');
      gameModeTitle.style.cssText = `
        font-size: 48px;
        font-weight: bold;
        color: #4169e1;
        letter-spacing: 4px;
        margin-bottom: 20px;
        text-align: center;
      `;
      gameModeTitle.textContent = `SELECT GAME MODE`;
      const subtitle = document.createElement('div');
      subtitle.style.cssText = `
        font-size: 18px;
        color: #b0b0b0;
        opacity: 0.8;
        margin-bottom: 40px;
        text-align: center;
      `;
      subtitle.textContent = `Choose your path through the Reality Coil`;
      const gameModeButtonContainer = document.createElement('div');
      gameModeButtonContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
      `;
      const playVsAiButton = createMenuButton('PLAY VS A.I.', () => {
        gameState.gameMode = 'normal';
        if (gameModeScreen.parentNode) {
          document.body.removeChild(gameModeScreen);
        }
        renderer.domElement.style.zIndex = '1';
        initializeSnake();
        initializeAiSnakes();
        if (mobileControls) {
          mobileControls.style.display = 'flex';
        }
        if (pauseButton) {
          pauseButton.style.display = 'block';
        }
        gameState.gameStarted = true;
        gameState.gameRunning = true;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouchDevice) {
          showTutorial();
        }
        gameState.gamesPlayed++;
        gameState.gameStartTime = Date.now();
        checkAchievements();
        saveAchievements();
      }, true);
      const playOnlineButton = createMenuButton('PLAY ONLINE', () => {
        gameModeScreen.classList.remove('fade-in');
        gameModeScreen.classList.add('fade-out');
        setTimeout(() => {
          if (gameModeScreen.parentNode) {
            document.body.removeChild(gameModeScreen);
          }
          showPlaceholderPage('ONLINE MULTIPLAYER');
        }, 300);
      });
      const playTimedButton = createMenuButton('PLAY TIMED MATCH', () => {
        gameState.gameMode = 'timed';
        gameState.timeRemaining = 60;
        gameState.timerStarted = false;
        gameState.snakeSpeed = 0.0607500 * 1.5;
        gameState.originalSnakeSpeed = 0.0607500 * 1.5;
        if (gameModeScreen.parentNode) {
          document.body.removeChild(gameModeScreen);
        }
        renderer.domElement.style.zIndex = '1';
        initializeSnake();
        initializeAiSnakes();
        if (mobileControls) {
          mobileControls.style.display = 'flex';
        }
        if (pauseButton) {
          pauseButton.style.display = 'block';
        }
        gameState.gameStarted = true;
        gameState.gameRunning = true;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (gameState.gameMode === 'timed') {
          if (!isTouchDevice) {
            showTimedTutorial();
          }
          startTimer();
        }
        gameState.gamesPlayed++;
        gameState.gameStartTime = Date.now();
        checkAchievements();
        saveAchievements();
      });
      const backButton = createMenuButton('BACK', () => {
        gameModeScreen.classList.remove('fade-in');
        gameModeScreen.classList.add('fade-out');
        setTimeout(() => {
          if (gameModeScreen.parentNode) {
            document.body.removeChild(gameModeScreen);
          }
          showStartScreenInternal();
        }, 300);
      });
      gameModeButtonContainer.appendChild(playVsAiButton);
      gameModeButtonContainer.appendChild(playOnlineButton);
      gameModeButtonContainer.appendChild(playTimedButton);
      gameModeButtonContainer.appendChild(backButton);
      gameModeScreen.appendChild(gameModeTitle);
      gameModeScreen.appendChild(subtitle);
      gameModeScreen.appendChild(gameModeButtonContainer);
      document.body.appendChild(gameModeScreen);
    }
    const playButton = createMenuButton('PLAY', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          document.body.removeChild(startScreen);
        }
        showGameModeScreen();
      }, 300);
    }, true);
    const achievementsButton = createMenuButton('ACHIEVEMENTS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          document.body.removeChild(startScreen);
        }
        showAchievementsScreen();
      }, 300);
    });
    const leaderboardButton = createMenuButton('LEADERBOARD', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          document.body.removeChild(startScreen);
        }
        showPlaceholderPage('LEADERBOARD');
      }, 300);
    });
    const profileButton = createMenuButton('PROFILE', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          document.body.removeChild(startScreen);
        }
        showPlaceholderPage('PROFILE');
      }, 300);
    });
    const factionsButton = createMenuButton('FACTIONS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          document.body.removeChild(startScreen);
        }
        showPlaceholderPage('FACTIONS');
      }, 300);
    });
    const settingsButton = createMenuButton('SETTINGS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          document.body.removeChild(startScreen);
        }
        showPlaceholderPage('SETTINGS');
      }, 300);
    });
    buttonContainer.appendChild(playButton);
    buttonContainer.appendChild(achievementsButton);
    buttonContainer.appendChild(leaderboardButton);
    buttonContainer.appendChild(profileButton);
    buttonContainer.appendChild(factionsButton);
    buttonContainer.appendChild(settingsButton);
    startScreen.appendChild(titleContainer);
    startScreen.appendChild(buttonContainer);
    document.body.appendChild(startScreen);
  }
  function showAssetsLoadingScreen() {
    const assetsLoadingScreen = document.createElement('div');
    assetsLoadingScreen.id = 'assets-loading-screen';
    assetsLoadingScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(45deg, #000011, #000022, #000033);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10002;
      font-family: monospace;
      color: white;
      opacity: 0;
    `;
    assetsLoadingScreen.classList.add('fade-in');
    const loadingTitle = document.createElement('div');
    loadingTitle.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      color: #00ffff;
      letter-spacing: 3px;
      margin-bottom: 20px;
      text-align: center;
    `;
    loadingTitle.textContent = `INITIALIZING REALITY COIL`;
    const statusText = document.createElement('div');
    statusText.style.cssText = `
      font-size: 18px;
      color: #ffffff;
      opacity: 0.8;
      margin-bottom: 30px;
      text-align: center;
    `;
    statusText.textContent = `Loading cosmic assets...`;
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      width: 300px;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin-bottom: 15px;
    `;
    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #00ffff, #4169e1);
      border-radius: 2px;
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
    `;
    progressBar.appendChild(progressFill);
    const percentageText = document.createElement('div');
    percentageText.style.cssText = `
      font-size: 24px;
      color: #00ffff;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      letter-spacing: 1px;
    `;
    percentageText.textContent = `0%`;
    const startButton = document.createElement('button');
    startButton.style.cssText = `
      background: #4169e1;
      color: white;
      border: 2px solid #4169e1;
      padding: 15px 30px;
      font-size: 18px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      letter-spacing: 2px;
      transition: all 0.3s ease;
      opacity: 0.5;
      pointer-events: none;
    `;
    startButton.textContent = `CLICK TO START`;
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
      @keyframes buttonPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .button-ready {
        animation: buttonPulse 2s infinite ease-in-out;
      }
      @keyframes progressGlow {
        0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.3); }
        50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.6); }
      }
    `;
    document.head.appendChild(loadingStyle);
    assetsLoadingScreen.appendChild(loadingTitle);
    assetsLoadingScreen.appendChild(statusText);
    assetsLoadingScreen.appendChild(progressBar);
    assetsLoadingScreen.appendChild(percentageText);
    assetsLoadingScreen.appendChild(startButton);
    document.body.appendChild(assetsLoadingScreen);
    let assetsLoaded = false;
    let loadingProgress = 0;
    let displayProgress = 0;
    let isClicked = false;
    const updateProgress = (progress, status) => {
      loadingProgress = Math.max(loadingProgress, progress);
      progressFill.style.width = `${loadingProgress}%`;
      statusText.textContent = status;
      const animatePercentage = () => {
        if (displayProgress < loadingProgress) {
          displayProgress = Math.min(loadingProgress, displayProgress + 1);
          percentageText.textContent = `${Math.floor(displayProgress)}%`;
          if (displayProgress >= 75) {
            percentageText.style.color = '#ffff00';
            percentageText.style.textShadow = '0 0 15px rgba(255, 255, 0, 0.8)';
          } else if (displayProgress >= 50) {
            percentageText.style.color = '#00ff00';
            percentageText.style.textShadow = '0 0 15px rgba(0, 255, 0, 0.6)';
          }
          if (displayProgress < loadingProgress) {
            setTimeout(animatePercentage, 30);
          }
        }
      };
      animatePercentage();
    };
    const enableStartButton = () => {
      startButton.style.opacity = '1';
      startButton.style.pointerEvents = 'auto';
      startButton.classList.add('button-ready');
      statusText.textContent = `Reality Coil fully materialized!`;
      progressFill.style.width = '100%';
      progressFill.style.animation = 'progressGlow 1.5s infinite ease-in-out';
      displayProgress = 100;
      percentageText.textContent = '100%';
      percentageText.style.color = '#00ff00';
      percentageText.style.textShadow = '0 0 20px rgba(0, 255, 0, 1)';
      startButton.addEventListener('mouseenter', () => {
        startButton.style.transform = 'scale(1.1)';
        startButton.style.background = '#5a7dff';
      });
      startButton.addEventListener('mouseleave', () => {
        startButton.style.transform = 'scale(1)';
        startButton.style.background = '#4169e1';
      });
      startButton.addEventListener('click', async () => {
        if (isClicked) return;
        isClicked = true;
        startButton.disabled = true;
        startButton.style.pointerEvents = 'none';
        startButton.style.opacity = '0.5';
        assetsLoadingScreen.classList.remove('fade-in');
        assetsLoadingScreen.classList.add('fade-out');
        setTimeout(() => {
          if (assetsLoadingScreen.parentNode) {
            document.body.removeChild(assetsLoadingScreen);
          }
          if (loadingStyle.parentNode) {
            document.head.removeChild(loadingStyle);
          }
          showStartScreenInternal();
        }, 300);
      });
    };
    const checkAllLoaded = () => {
      if (assetsLoaded) {
        if (!gameState.aiSnakes || gameState.aiSnakes.length === 0) {
          for (let i = 0; i < gameState.maxAiSnakes; i++) {
            const aiSnake = createAiSnake();
            gameState.aiSnakes.push(aiSnake);
          }
        }
        enableStartButton();
      }
    };
    loadSun().then(() => {
      updateProgress(100, 'Cosmic environment materialized...');
      assetsLoaded = true;
      setTimeout(() => {
        checkAllLoaded();
      }, 500);
    }).catch(error => {
      console.warn('Assets failed to load:', error);
      assetsLoaded = true;
      updateProgress(100, 'Assets loaded with warnings...');
      checkAllLoaded();
    });
    setTimeout(() => {
      if (!assetsLoaded) {
        console.warn('Assets load timeout - proceeding anyway');
        assetsLoaded = true;
        updateProgress(100, 'Loading complete (timeout)');
        checkAllLoaded();
      }
    }, 30000);
  }
  function showStartScreen() {
    showAssetsLoadingScreen();
  }
  function gameOver() {
    gameState.gameRunning = false;
    const finalSnakeLength = gameState.snakeSegments.length;
    if (gameState.gameStartTime > 0) {
      const survivalTime = Date.now() - gameState.gameStartTime;
      if (survivalTime >= 300000) {
        unlockAchievement('survivor');
      }
    }
    updateGameStats();
    gameState.snakeSegments.forEach((segment, index) => {
      setTimeout(() => {
        scene.remove(segment);
        segment.geometry.dispose();
        segment.material.dispose();
      }, index * 100);
    });
    gameState.snakeSegments = [];
    const gameOverPanel = document.createElement('div');
    gameOverPanel.className = 'game-over-panel';
    gameOverPanel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 240px;
      border-radius: 15px;
      color: white;
      border: 3px solid #FF3333;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: monospace;
      font-weight: bold;
      box-sizing: border-box;
      padding: 20px;
      z-index: 1000;
      opacity: 0;
    `;
    gameOverPanel.classList.add('fade-in');
    const gameOverText = document.createElement('div');
    gameOverText.style.cssText = `
      color: #FF3333;
      font-size: 32px;
      margin-bottom: 10px;
    `;
    gameOverText.textContent = `GAME OVER`;
    gameOverPanel.appendChild(gameOverText);
    const finalScoreText = document.createElement('div');
    finalScoreText.style.cssText = `
      color: white;
      font-size: 18px;
      margin-bottom: 5px;
    `;
    finalScoreText.textContent = `Final Score: ${gameState.score}`;
    gameOverPanel.appendChild(finalScoreText);
    const lengthReachedText = document.createElement('div');
    lengthReachedText.style.cssText = `
      color: white;
      font-size: 16px;
      margin-bottom: 20px;
    `;
    lengthReachedText.textContent = `Length Reached: ${finalSnakeLength}`;
    gameOverPanel.appendChild(lengthReachedText);
    const restartButton = document.createElement('button');
    restartButton.style.cssText = `
      background: #33FF33;
      color: black;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    restartButton.textContent = `RESTART GAME`;
    restartButton.addEventListener('click', restartGame);
    restartButton.addEventListener('mouseenter', () => {
      restartButton.style.background = '#66FF66';
      restartButton.style.transform = 'scale(1.05)';
    });
    restartButton.addEventListener('mouseleave', () => {
      restartButton.style.background = '#33FF33';
      restartButton.style.transform = 'scale(1)';
    });
    gameOverPanel.appendChild(restartButton);
    document.body.appendChild(gameOverPanel);
    // NEW: Award and save
    if (wallet.connected) {
      awardAchievements(gameState.score, finalSnakeLength);
      saveUserData(wallet.publicKey.toString(), gameState.score, finalSnakeLength);
    }
  }
  function updateAiSnake(aiSnake) {
    if (aiSnake.segments.length === 0) return;
    const head = aiSnake.segments[0];
    const platformRadius = gameState.platform.radius;
    const currentTime = performance.now();
    if (!aiSnake.turnRate) {
      aiSnake.turnRate = 0.002 + Math.random() * 0.003;
      aiSnake.wanderAngle = Math.random() * Math.PI * 2;
      aiSnake.cautiousness = Math.random() * 0.5;
    }
    if (aiSnake.invincibilityTime > 0) {
      aiSnake.invincibilityTime--;
    }
    aiSnake.speed = gameState.snakeSpeed * 1.25;
    if (aiSnake.pendingGrowth > 0) {
      const tail = aiSnake.segments[aiSnake.segments.length - 1];
      const secondToLast = aiSnake.segments[aiSnake.segments.length - 2];
      let tailDirection;
      if (secondToLast) {
        tailDirection = tail.position.clone().sub(secondToLast.position).normalize();
      } else {
        tailDirection = aiSnake.direction.clone().negate();
      }
      const spacing = aiSnake.segmentSpacing;
      const newSegmentPosition = tail.position.clone().add(tailDirection.multiplyScalar(spacing));
      const newSegment = createSnakeSegment(newSegmentPosition, false, aiSnake.growthFactor, aiSnake.colors);
      const targetScale = aiSnake.growthFactor;
      const initialScale = 0.1 * targetScale;
      newSegment.scale.setScalar(initialScale);
      aiSnake.segments.push(newSegment);
      scene.add(newSegment);
      aiSnake.growthQueue.push({
        segment: newSegment,
        targetScale: targetScale,
        currentScale: initialScale,
        growthRate: 0.1 * targetScale
      });
      aiSnake.pendingGrowth--;
    }
    for (let i = aiSnake.growthQueue.length - 1; i >= 0; i--) {
      const growthItem = aiSnake.growthQueue[i];
      growthItem.currentScale = Math.min(growthItem.targetScale, growthItem.currentScale + growthItem.growthRate);
      growthItem.segment.scale.setScalar(growthItem.currentScale);
      if (growthItem.currentScale >= growthItem.targetScale) {
        aiSnake.growthQueue.splice(i, 1);
      }
    }
    const headRadius = head.userData.baseRadius * aiSnake.growthFactor;
    for (let i = gameState.spheres.length - 1; i >= 0; i--) {
      const sphere = gameState.spheres[i];
      const distance = head.position.distanceTo(sphere.position);
      const collisionDistance = headRadius + sphere.userData.radius;
      if (distance < collisionDistance) {
        scene.remove(sphere);
        if (sphere.geometry) sphere.geometry.dispose();
        if (sphere.material) sphere.material.dispose();
        gameState.spheres.splice(i, 1);
        aiSnake.pendingGrowth += 3;
        aiSnake.growthFactor += 0.01575;
        aiSnake.segments.forEach(segment => {
          segment.scale.setScalar(aiSnake.growthFactor);
        });
        spawnSphere();
      }
    }
    let targetDirection = aiSnake.direction.clone();
    if (gameState.spheres.length > 0) {
      let closestFood = null;
      let closestDistance = Infinity;
      const seekingRadius = 8 + aiSnake.intelligence * 5;
      for (const sphere of gameState.spheres) {
        const distance = head.position.distanceTo(sphere.position);
        if (distance < seekingRadius && distance < closestDistance) {
          closestFood = sphere;
          closestDistance = distance;
        }
      }
      if (closestFood) {
        const foodDirection = closestFood.position.clone().sub(head.position).normalize();
        const seekingStrength = 0.3 * aiSnake.intelligence;
        targetDirection.lerp(foodDirection, seekingStrength);
      }
    }
    aiSnake.wanderAngle += (Math.random() - 0.5) * 0.05;
    const wanderDirection = new THREE.Vector3(Math.cos(aiSnake.wanderAngle) * 0.1, (Math.random() - 0.5) * 0.05, Math.sin(aiSnake.wanderAngle) * 0.1);
    targetDirection.add(wanderDirection);
    const avoidanceRadius = 4 + aiSnake.cautiousness * 3;
    let needsAvoidance = false;
    if (gameState.frameCount % 12 === 0) {
      if (gameState.snakeSegments.length > 0) {
        const playerHead = gameState.snakeSegments[0];
        const distanceToPlayer = head.position.distanceTo(playerHead.position);
        if (distanceToPlayer < avoidanceRadius) {
          const avoidDirection = head.position.clone().sub(playerHead.position).normalize();
          const cross = new THREE.Vector3().crossVectors(aiSnake.direction, avoidDirection);
          const rotationAxis = cross.normalize();
          const avoidStrength = (avoidanceRadius - distanceToPlayer) / avoidanceRadius;
          const avoidTurnAngle = aiSnake.turnRate * 2 * avoidStrength;
          const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, avoidTurnAngle);
          targetDirection.applyQuaternion(quaternion);
          needsAvoidance = true;
        }
      }
    }
    if (currentTime - aiSnake.lastDirectionChange > 5000 + Math.random() * 4000 && !needsAvoidance) {
      const randomTurnAngle = (Math.random() - 0.5) * aiSnake.turnRate * 4;
      const randomAxis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const quaternion = new THREE.Quaternion().setFromAxisAngle(randomAxis, randomTurnAngle);
      targetDirection.applyQuaternion(quaternion);
      aiSnake.lastDirectionChange = currentTime;
    }
    targetDirection.normalize();
    const smoothingFactor = needsAvoidance ? 0.08 : 0.03;
    aiSnake.direction.lerp(targetDirection, smoothingFactor);
    aiSnake.direction.normalize();
    aiSnake.up.copy(head.position.clone().sub(gameState.platform.center).normalize());
    aiSnake.direction.sub(aiSnake.up.clone().multiplyScalar(aiSnake.direction.dot(aiSnake.up))).normalize();
    const surfaceOffset = -0.7;
    const newHeadPosition = head.position.clone().add(aiSnake.direction.clone().multiplyScalar(aiSnake.speed));
    const newNormal = newHeadPosition.clone().sub(gameState.platform.center).normalize();
    newHeadPosition.copy(gameState.platform.center).add(newNormal.clone().multiplyScalar(platformRadius + surfaceOffset));
    const positions = [newHeadPosition];
    for (let i = 0; i < aiSnake.segments.length - 1; i++) {
      const currentPos = positions[i];
      const nextSegment = aiSnake.segments[i + 1];
      const direction = currentPos.clone().sub(nextSegment.position).normalize();
      let targetPos = currentPos.clone().sub(direction.multiplyScalar(aiSnake.segmentSpacing));
      const segmentNormal = targetPos.clone().sub(gameState.platform.center).normalize();
      const segmentSurfaceOffset = -0.7;
      targetPos.copy(gameState.platform.center).add(segmentNormal.clone().multiplyScalar(platformRadius + segmentSurfaceOffset));
      positions.push(targetPos);
    }
    for (let i = 0; i < aiSnake.segments.length; i++) {
      aiSnake.segments[i].position.copy(positions[i]);
    }
  }
  function processGrowth() {
    if (gameState.pendingGrowth > 0) {
      const tail = gameState.snakeSegments[gameState.snakeSegments.length - 1];
      const secondToLast = gameState.snakeSegments[gameState.snakeSegments.length - 2];
      let tailDirection;
      if (secondToLast) {
        tailDirection = tail.position.clone().sub(secondToLast.position).normalize();
      } else {
        tailDirection = gameState.snakeDirection.clone().negate();
      }
      const spacing = gameState.segmentSpacing;
      const newSegmentPosition = tail.position.clone().add(tailDirection.multiplyScalar(spacing));
      const newSegment = createSnakeSegment(newSegmentPosition, false, gameState.growthFactor);
      const targetScale = gameState.growthFactor;
      const initialScale = 0.1 * targetScale;
      newSegment.scale.setScalar(initialScale);
      gameState.snakeSegments.push(newSegment);
      scene.add(newSegment);
      gameState.growthQueue.push({
        segment: newSegment,
        targetScale: targetScale,
        currentScale: initialScale,
        growthRate: 0.1 * targetScale
      });
      gameState.pendingGrowth--;
    }
    for (let i = gameState.growthQueue.length - 1; i >= 0; i--) {
      const growthItem = gameState.growthQueue[i];
      growthItem.currentScale = Math.min(growthItem.targetScale, growthItem.currentScale + growthItem.growthRate);
      growthItem.segment.scale.setScalar(growthItem.currentScale);
      if (growthItem.currentScale >= growthItem.targetScale) {
        gameState.growthQueue.splice(i, 1);
      }
    }
  }
  function updateSnake() {
    if (gameState.snakeSegments.length === 0) return;
    const head = gameState.snakeSegments[0];
    const platformRadius = gameState.platform.radius;
    const surfaceOffset = -0.7;
    const newHeadPosition = head.position.clone().add(gameState.snakeDirection.clone().multiplyScalar(gameState.snakeSpeed));
    const normal = newHeadPosition.clone().sub(gameState.platform.center).normalize();
    newHeadPosition.copy(gameState.platform.center).add(normal.clone().multiplyScalar(platformRadius + surfaceOffset));
    gameState.snakeUp.copy(normal);
    gameState.snakeDirection.sub(normal.clone().multiplyScalar(gameState.snakeDirection.dot(normal))).normalize();
    const positions = [newHeadPosition];
    for (let i = 0; i < gameState.snakeSegments.length - 1; i++) {
      const currentPos = positions[i];
      const nextSegment = gameState.snakeSegments[i + 1];
      const direction = currentPos.clone().sub(nextSegment.position).normalize();
      let targetPos = currentPos.clone().sub(direction.multiplyScalar(gameState.segmentSpacing));
      const segmentNormal = targetPos.clone().sub(gameState.platform.center).normalize();
      const segmentSurfaceOffset = -0.7;
      targetPos.copy(gameState.platform.center).add(segmentNormal.clone().multiplyScalar(platformRadius + segmentSurfaceOffset));
      positions.push(targetPos);
    }
    for (let i = 0; i < gameState.snakeSegments.length; i++) {
      gameState.snakeSegments[i].position.copy(positions[i]);
    }
    const cameraDirection = gameState.snakeDirection;
    const cameraTarget = head.position.clone().add(cameraDirection.clone().multiplyScalar(5));
    const cameraHeight = 3 + gameState.growthFactor * 2;
    const cameraDistance = 7 + gameState.growthFactor * 2;
    const cameraOffset = cameraDirection.clone().multiplyScalar(-cameraDistance).add(gameState.snakeUp.clone().multiplyScalar(cameraHeight));
    gameState.camera.targetPosition.copy(head.position.clone().add(cameraOffset));
    gameState.camera.targetLookAt.copy(cameraTarget);
    gameState.camera.targetUp.copy(gameState.snakeUp);
    gameState.camera.currentPosition.lerp(gameState.camera.targetPosition, gameState.camera.smoothingFactor);
    gameState.camera.currentLookAt.lerp(gameState.camera.targetLookAt, gameState.camera.smoothingFactor);
    gameState.camera.currentUp.lerp(gameState.camera.targetUp, gameState.camera.smoothingFactor);
    camera.position.copy(gameState.camera.currentPosition);
    camera.up.copy(gameState.camera.currentUp);
    camera.lookAt(gameState.camera.currentLookAt);
  }
  if (localStorage.getItem('astrowormBestTimedScore')) {
    gameState.bestTimedScore = parseInt(localStorage.getItem('astrowormBestTimedScore'));
  }
  const achievements = {
    firstSteps: {
      id: 'firstSteps',
      name: 'First Steps',
      description: 'Play your first game',
      icon: '🌟',
      unlocked: false,
      condition: () => gameState.gamesPlayed >= 1
    },
    scoreNovice: {
      id: 'scoreNovice',
      name: 'Cosmic Novice',
      description: 'Reach 250 points',
      icon: '⭐',
      unlocked: false,
      condition: () => gameState.highestScore >= 250
    },
    scoreAdept: {
      id: 'scoreAdept',
      name: 'Reality Bender',
      description: 'Reach 1000 points',
      icon: '🌠',
      unlocked: false,
      condition: () => gameState.highestScore >= 1000
    },
    scoreMaster: {
      id: 'scoreMaster',
      name: 'Coil Master',
      description: 'Reach 2500 points',
      icon: '💫',
      unlocked: false,
      condition: () => gameState.highestScore >= 2500
    },
    lengthGrower: {
      id: 'lengthGrower',
      name: 'Growing Serpent',
      description: 'Reach 30 segments',
      icon: '🐍',
      unlocked: false,
      condition: () => gameState.longestSnake >= 30
    },
    lengthTitan: {
      id: 'lengthTitan',
      name: 'Cosmic Titan',
      description: 'Reach 75 segments',
      icon: '🐉',
      unlocked: false,
      condition: () => gameState.longestSnake >= 75
    },
    speedDemon: {
      id: 'speedDemon',
      name: 'Speed Demon',
      description: 'Complete a timed game with 30+ seconds left',
      icon: '⚡',
      unlocked: false,
      condition: () => false // Set in checkSphereCollisions
    },
    survivor: {
      id: 'survivor',
      name: 'Dimensional Survivor',
      description: 'Survive for 5 minutes in one game',
      icon: '🛡️',
      unlocked: false,
      condition: () => false // Set in gameOver
    },
    glutton: {
      id: 'glutton',
      name: 'Cosmic Glutton',
      description: 'Eat 250 cosmic fragments total',
      icon: '🍎',
      unlocked: false,
      condition: () => gameState.spheresEaten >= 250
    },
    collector: {
      id: 'collector',
      name: 'Fragment Collector',
      description: 'Eat 1000 cosmic fragments total',
      icon: '💎',
      unlocked: false,
      condition: () => gameState.spheresEaten >= 1000
    },
    veteran: {
      id: 'veteran',
      name: 'Coil Veteran',
      description: 'Play 25 games',
      icon: '🏆',
      unlocked: false,
      condition: () => gameState.gamesPlayed >= 25
    },
    timeAttacker: {
      id: 'timeAttacker',
      name: 'Time Attacker',
      description: 'Score 500+ in timed mode',
      icon: '⏰',
      unlocked: false,
      condition: () => gameState.bestTimedScore >= 500
    },
    perfectionist: {
      id: 'perfectionist',
      name: 'Reality Perfectionist',
      description: 'Score 5000+ points',
      icon: '🔥',
      unlocked: false,
      condition: () => gameState.highestScore >= 5000
    },
    leviathan: {
      id: 'leviathan',
      name: 'Cosmic Leviathan',
      description: 'Reach 150 segments',
      icon: '🌌',
      unlocked: false,
      condition: () => gameState.longestSnake >= 150
    },
    dedication: {
      id: 'dedication',
      name: 'Dimensional Dedication',
      description: 'Play for 120 minutes total',
      icon: '⌛',
      unlocked: false,
      condition: () => gameState.totalPlayTime >= 7200000
    }
  };
  function loadAchievements() {
    const savedAchievements = localStorage.getItem('astrowormAchievements');
    const savedStats = localStorage.getItem('astrowormStats');
    if (savedAchievements) {
      const unlocked = JSON.parse(savedAchievements);
      Object.keys(unlocked).forEach(key => {
        if (achievements[key]) {
          achievements[key].unlocked = unlocked[key];
        }
      });
    }
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      gameState.highestScore = stats.highestScore || 0;
      gameState.longestSnake = stats.longestSnake || 0;
      gameState.spheresEaten = stats.spheresEaten || 0;
      gameState.gamesPlayed = stats.gamesPlayed || 0;
      gameState.totalPlayTime = stats.totalPlayTime || 0;
    }
    // NEW: Load from Honeycomb if connected
    if (wallet.connected) {
      loadFromHoneycomb(wallet.publicKey.toString());
    }
  }
  async function loadFromHoneycomb(userPublicKey) {
    try {
      // Fetch profile
      const profile = await client.getProfile(PROJECT_ADDRESS, userPublicKey, "main");
      if (profile.customData && profile.customData.achievements) {
        const honeycombAchievements = profile.customData.achievements;
        Object.keys(honeycombAchievements).forEach(key => {
          if (achievements[key]) {
            achievements[key].unlocked = honeycombAchievements[key];
          }
        });
      }
      // Fetch stats if stored
      const userRef = ref(db, 'users/' + userPublicKey);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        gameState.highestScore = data.highScore || gameState.highestScore;
        gameState.longestSnake = data.bestLength || gameState.longestSnake;
        gameState.spheresEaten = data.spheresEaten || gameState.spheresEaten;
        gameState.gamesPlayed = data.gamesPlayed || gameState.gamesPlayed;
        gameState.totalPlayTime = data.totalPlayTime || gameState.totalPlayTime;
        gameState.bestTimedScore = data.bestTimedScore || gameState.bestTimedScore;
      }
    } catch (error) {
      console.error('Error loading from Honeycomb:', error);
    }
  }
  function saveAchievements() {
    const unlockedAchievements = {};
    Object.keys(achievements).forEach(key => {
      unlockedAchievements[key] = achievements[key].unlocked;
    });
    localStorage.setItem('astrowormAchievements', JSON.stringify(unlockedAchievements));
    const stats = {
      highestScore: gameState.highestScore,
      longestSnake: gameState.longestSnake,
      spheresEaten: gameState.spheresEaten,
      gamesPlayed: gameState.gamesPlayed,
      totalPlayTime: gameState.totalPlayTime
    };
    localStorage.setItem('astrowormStats', JSON.stringify(stats));
    // NEW: Sync to Honeycomb if connected
    if (wallet.connected) {
      syncToHoneycomb(wallet.publicKey.toString(), unlockedAchievements, stats);
    }
  }
  async function syncToHoneycomb(userPublicKey, unlockedAchievements, stats) {
    try {
      const profileAddress = await client.getProfileAddress(PROJECT_ADDRESS, userPublicKey, "main");
      const { createUpdateProfileTransaction: txResponse } = await client.createUpdateProfileTransaction({
        payer: wallet.publicKey.toString(),
        profile: profileAddress,
        customData: { achievements: unlockedAchievements }
      });
      await sendClientTransactions(client, wallet, txResponse);
      const userRef = ref(db, 'users/' + userPublicKey);
      await set(userRef, {
        highScore: stats.highestScore,
        bestLength: stats.longestSnake,
        spheresEaten: stats.spheresEaten,
        gamesPlayed: stats.gamesPlayed,
        totalPlayTime: stats.totalPlayTime,
        bestTimedScore: gameState.bestTimedScore,
        lastPlayed: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing to Honeycomb:', error);
    }
  }
  function checkAchievements() {
    Object.keys(achievements).forEach(key => {
      const achievement = achievements[key];
      if (!achievement.unlocked && achievement.condition()) {
        unlockAchievement(key);
      }
    });
  }
  function unlockAchievement(achievementId) {
    const achievement = achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    achievement.unlocked = true;
    saveAchievements();
    showAchievementUnlock(achievement);
    // NEW: Claim badge if applicable (map achievement to badge index)
    if (wallet.connected) {
      const badgeIndex = getBadgeIndexForAchievement(achievementId);
      if (badgeIndex !== -1) {
        claimBadge(wallet.publicKey.toString(), badgeIndex);
      }
    }
  }
  async function claimBadge(userPublicKey, badgeIndex) {
    try {
      const profileAddress = await client.getProfileAddress(PROJECT_ADDRESS, userPublicKey, "main");
      const { createClaimBadgeCriteriaTransaction: txResponse } = await client.createClaimBadgeCriteriaTransaction({
        args: {
          profileAddress,
          projectAddress: PROJECT_ADDRESS,
          proof: BadgesCondition.Public,
          payer: wallet.publicKey.toString(),
          criteriaIndex: badgeIndex,
        },
      });
      await sendClientTransactions(client, wallet, txResponse);
    } catch (error) {
      console.error('Error claiming badge:', error);
    }
  }
  function getBadgeIndexForAchievement(achievementId) {
    const mapping = {
      'scoreNovice': 0, // HighScorer
      'timeAttacker': 1, // TimedMaster
      'lengthGrower': 2, // LongSerpent
      // Add more mappings for other achievements as needed
    };
    return mapping[achievementId] || -1;
  }
  function showAchievementUnlock(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 300px;
      padding: 15px;
      background: linear-gradient(135deg, #4169e1, #00ffff);
      color: white;
      font-family: monospace;
      font-weight: bold;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(65, 105, 225, 0.4);
      z-index: 9999;
      opacity: 0;
      transform: translateX(320px);
      transition: all 0.5s ease;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
        <div style="font-size: 24px;">${achievement.icon}</div>
        <div style="font-size: 14px; color: #ffff00;">ACHIEVEMENT UNLOCKED!</div>
      </div>
      <div style="font-size: 16px; margin-bottom: 5px;">${achievement.name}</div>
      <div style="font-size: 12px; opacity: 0.9;">${achievement.description}</div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(320px)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 4000);
  }
  function updateGameStats() {
    if (gameState.score > gameState.highestScore) {
      gameState.highestScore = gameState.score;
    }
    if (gameState.snakeSegments.length > gameState.longestSnake) {
      gameState.longestSnake = gameState.snakeSegments.length;
    }
    if (gameState.gameStartTime > 0) {
      gameState.totalPlayTime += Date.now() - gameState.gameStartTime;
      gameState.gameStartTime = Date.now();
    }
    checkAchievements();
    saveAchievements();
  }
  function awardAchievements(score, length) {
    checkAchievements();
    saveAchievements();
  }
  function saveUserData(userPublicKey, score, length) {
    gameState.highestScore = Math.max(gameState.highestScore, score);
    gameState.longestSnake = Math.max(gameState.longestSnake, length);
    if (gameState.gameMode === 'timed') {
      gameState.bestTimedScore = Math.max(gameState.bestTimedScore, score);
    }
    saveAchievements();
  }
  loadAchievements();
  function createMobileControls() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;
    const mobileControlsContainer = document.createElement('div');
    mobileControlsContainer.id = 'mobile-controls';
    mobileControlsContainer.className = 'mobile-controls';
    mobileControlsContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      gap: 60px;
      z-index: 9000;
      pointer-events: auto;
    `;
    const leftButton = document.createElement('button');
    leftButton.innerHTML = '◀';
    leftButton.style.cssText = `
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(65, 105, 225, 0.8);
      border: 3px solid #00ffff;
      color: white;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
    `;
    const rightButton = document.createElement('button');
    rightButton.innerHTML = '▶';
    rightButton.style.cssText = `
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(65, 105, 225, 0.8);
      border: 3px solid #00ffff;
      color: white;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
    `;
    function handleTouchStart(direction) {
      return evt => {
        evt.preventDefault();
        inputMap[direction] = true;
        const button = evt.target;
        button.style.transform = 'scale(0.9)';
        button.style.background = 'rgba(90, 125, 255, 0.9)';
        button.style.boxShadow = '0 2px 8px rgba(0, 255, 255, 0.5)';
      };
    }
    function handleTouchEnd(direction) {
      return evt => {
        evt.preventDefault();
        inputMap[direction] = false;
        const button = evt.target;
        button.style.transform = 'scale(1)';
        button.style.background = 'rgba(65, 105, 225, 0.8)';
        button.style.boxShadow = '0 4px 15px rgba(0, 255, 255, 0.3)';
      };
    }
    leftButton.addEventListener('touchstart', handleTouchStart('a'), { passive: false });
    leftButton.addEventListener('touchend', handleTouchEnd('a'), { passive: false });
    leftButton.addEventListener('touchcancel', handleTouchEnd('a'), { passive: false });
    rightButton.addEventListener('touchstart', handleTouchStart('d'), { passive: false });
    rightButton.addEventListener('touchend', handleTouchEnd('d'), { passive: false });
    rightButton.addEventListener('touchcancel', handleTouchEnd('d'), { passive: false });
    leftButton.addEventListener('contextmenu', e => e.preventDefault());
    rightButton.addEventListener('contextmenu', e => e.preventDefault());
    mobileControlsContainer.appendChild(leftButton);
    mobileControlsContainer.appendChild(rightButton);
    document.body.appendChild(mobileControlsContainer);
    return mobileControlsContainer;
  }
  mobileControls = createMobileControls();
  pauseButton.addEventListener('click', () => {
    if (gameState.gameStarted && gameState.gameRunning) {
      if (gameState.isPaused) {
        hidePauseMenu();
      } else {
        gameState.isPaused = true;
        showPauseMenu();
      }
    }
  });
  pauseButton.addEventListener('mouseenter', () => {
    pauseButton.style.transform = 'translateX(-50%) scale(1.1)';
    pauseButton.style.color = '#00ffff';
  });
  pauseButton.addEventListener('mouseleave', () => {
    pauseButton.style.transform = 'translateX(-50%) scale(1)';
    pauseButton.style.color = 'white';
  });
  document.addEventListener('keydown', evt => {
    inputMap[evt.key] = true;
    if (evt.key === 'Escape' && gameState.gameStarted && gameState.gameRunning) {
      if (gameState.isPaused) {
        hidePauseMenu();
      } else {
        gameState.isPaused = true;
        showPauseMenu();
      }
    }
  });
  document.addEventListener('keyup', evt => {
    inputMap[evt.key] = false;
  });
  function animate() {
    requestAnimationFrame(animate);
    try {
      gameState.frameCount++;
      if (!gameState.gameStarted || !gameState.gameRunning) {
        renderer.render(scene, camera);
        return;
      }
      const head = gameState.snakeSegments[0];
      if (!head || !head.position) return;
      if (gameState.isPaused) {
        gameState.pauseTransition = Math.min(1, gameState.pauseTransition + 0.05);
      } else {
        gameState.pauseTransition = Math.max(0, gameState.pauseTransition - 0.05);
      }
      const speedMultiplier = 1 - gameState.pauseTransition * 0.95;
      gameState.snakeSpeed = gameState.originalSnakeSpeed * speedMultiplier;
      if (gameState.pauseTransition < 0.99) {
        if (inputMap['a'] || inputMap['A'] || inputMap['ArrowLeft']) {
          const turnSpeed = 0.03 * speedMultiplier;
          const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(gameState.snakeUp, turnSpeed);
          gameState.snakeDirection.applyQuaternion(yawQuaternion).normalize();
        }
        if (inputMap['d'] || inputMap['D'] || inputMap['ArrowRight']) {
          const turnSpeed = 0.03 * speedMultiplier;
          const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(gameState.snakeUp, -turnSpeed);
          gameState.snakeDirection.applyQuaternion(yawQuaternion).normalize();
        }
      }
      if (gameState.pauseTransition < 0.99) {
        updateSnake();
        processGrowth();
        if (gameState.invincibilityTime > 0) {
          gameState.invincibilityTime--;
        }
        if (gameState.frameCount % 5 === 0 && checkSelfCollision()) {
          if (gameState.gameMode === 'timed') {
            showTimedGameOver();
          } else {
            gameOver();
          }
          return;
        }
        if (gameState.frameCount % 2 === 0) {
          applyMagneticEffect();
          checkSphereCollisions();
        }
        if (gameState.frameCount % 4 === 0) { // Throttled for performance
          gameState.aiSnakes.forEach(aiSnake => {
            if (aiSnake && aiSnake.segments && aiSnake.segments.length > 0) {
              updateAiSnake(aiSnake);
            }
          });
        }
      }
      if (directionalLight && gameState.snakeSegments.length > 0 && gameState.frameCount % 120 === 0) {
        const head = gameState.snakeSegments[0];
        if (head && head.position) {
          const shadowTarget = head.position.clone();
          directionalLight.target.position.copy(shadowTarget);
          directionalLight.target.updateMatrixWorld();
          const lightDirection = new THREE.Vector3(0, -1, 0.2).normalize();
          const shadowCameraDistance = 150;
          directionalLight.position.copy(shadowTarget.clone().add(lightDirection.clone().multiplyScalar(-shadowCameraDistance)));
        }
      }
      if (galaxySkybox && gameState.frameCount % 480 === 0) {
        galaxySkybox.rotation.y += 0.001;
      }
      if (gameState.frameCount % 180 === 0) {
        for (let i = 0; i < gameState.spheres.length; i += 3) {
          const sphere = gameState.spheres[i];
          if (sphere && sphere.userData) {
            sphere.userData.pulseFactor += sphere.userData.pulseSpeed * 2;
            sphere.scale.setScalar(1 + Math.sin(sphere.userData.pulseFactor) * 0.1);
          }
        }
      }
      if (gameState.frameCount % 60 === 0) {
        scoreText.textContent = `Score: ${gameState.score}`;
        if (gameState.gameMode === 'timed') {
          const timerElement = document.getElementById('timer-display');
          if (timerElement) {
            timerElement.style.display = 'block';
            updateTimerDisplay();
          }
        }
      }
      renderer.render(scene, camera);
    } catch (error) {
      console.error('Animation error:', error);
      if (gameState.gameRunning) {
        gameState.gameRunning = false;
        setTimeout(() => {
          gameState.gameRunning = true;
        }, 1000);
      }
    }
  }
  showStartScreen();
  animate();

  useEffect(() => {
    const updateWalletButton = () => {
      const button = document.querySelector('.wallet-connect-button');
      if (button) {
        button.textContent = wallet.connected ? 'WALLET CONNECTED' : 'CONNECT WALLET';
      }
    };
    updateWalletButton();
  }, [wallet.connected]);

  useEffect(() => {
    return () => {
      renderer.dispose();
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null; // Since game is appended to body, no render
}

export default Game;