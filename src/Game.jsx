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

const PROJECT_ADDRESS = "HhEQWQdVL9wagu3tHj6vSBAR4YB9UtkuQkiHZ3cLMU1y";

function StartScreen({ onStartGame, wallet, setVisible }) {
  useEffect(() => {
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
      }
    `;
    document.head.appendChild(globalStyle);
    return () => document.head.removeChild(globalStyle);
  }, []);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  function createMenuButton(text, onClick, isPrimary = false) {
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
    button.addEventListener('click', debounce(onClick, 300));
    return button;
  }

  function showPlaceholderPage(title, backToStart) {
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
      setTimeout(() => placeholderScreen.remove(), 300);
      backToStart();
    });
    placeholderScreen.appendChild(pageTitle);
    placeholderScreen.appendChild(comingSoonText);
    placeholderScreen.appendChild(backButton);
    document.body.appendChild(placeholderScreen);
  }

  function showAchievementsScreen(backToStart) {
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
      setTimeout(() => achievementsScreen.remove(), 300);
      backToStart();
    });
    footer.appendChild(backButton);
    achievementsScreen.appendChild(header);
    achievementsScreen.appendChild(content);
    achievementsScreen.appendChild(footer);
    document.body.appendChild(achievementsScreen);
  }

  function showGameModeScreen(backToStart) {
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
      gameModeScreen.classList.remove('fade-in');
      gameModeScreen.classList.add('fade-out');
      setTimeout(() => {
        if (gameModeScreen.parentNode) {
          gameModeScreen.parentNode.removeChild(gameModeScreen);
        }
        onStartGame('normal');
      }, 300);
    }, true);
    const playTimedButton = createMenuButton('PLAY TIMED MATCH', () => {
      gameModeScreen.classList.remove('fade-in');
      gameModeScreen.classList.add('fade-out');
      setTimeout(() => {
        if (gameModeScreen.parentNode) {
          gameModeScreen.parentNode.removeChild(gameModeScreen);
        }
        onStartGame('timed');
      }, 300);
    });
    const backButton = createMenuButton('BACK', () => {
      gameModeScreen.classList.remove('fade-in');
      gameModeScreen.classList.add('fade-out');
      setTimeout(() => {
        if (gameModeScreen.parentNode) {
          gameModeScreen.parentNode.removeChild(gameModeScreen);
        }
        backToStart();
      }, 300);
    });
    gameModeButtonContainer.appendChild(playVsAiButton);
    gameModeButtonContainer.appendChild(playTimedButton);
    gameModeButtonContainer.appendChild(backButton);
    gameModeScreen.appendChild(gameModeTitle);
    gameModeScreen.appendChild(subtitle);
    gameModeScreen.appendChild(gameModeButtonContainer);
    document.body.appendChild(gameModeScreen);
  }

  useEffect(() => {
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
    const connectButton = createMenuButton(wallet.connected ? 'WALLET CONNECTED' : 'CONNECT WALLET', () => {
      if (!wallet.connected) {
        setVisible(true);
      }
    });
    connectButton.classList.add('wallet-connect-button');
    buttonContainer.appendChild(connectButton);
    const playButton = createMenuButton('PLAY', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          startScreen.parentNode.removeChild(startScreen);
        }
        showGameModeScreen(() => {
          document.body.appendChild(startScreen);
        });
      }, 300);
    }, true);
    const achievementsButton = createMenuButton('ACHIEVEMENTS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          startScreen.parentNode.removeChild(startScreen);
        }
        showAchievementsScreen(() => {
          document.body.appendChild(startScreen);
        });
      }, 300);
    });
    const leaderboardButton = createMenuButton('LEADERBOARD', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          startScreen.parentNode.removeChild(startScreen);
        }
        showPlaceholderPage('LEADERBOARD', () => {
          document.body.appendChild(startScreen);
        });
      }, 300);
    });
    const profileButton = createMenuButton('PROFILE', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          startScreen.parentNode.removeChild(startScreen);
        }
        showPlaceholderPage('PROFILE', () => {
          document.body.appendChild(startScreen);
        });
      }, 300);
    });
    const factionsButton = createMenuButton('FACTIONS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          startScreen.parentNode.removeChild(startScreen);
        }
        showPlaceholderPage('FACTIONS', () => {
          document.body.appendChild(startScreen);
        });
      }, 300);
    });
    const settingsButton = createMenuButton('SETTINGS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        if (startScreen.parentNode) {
          startScreen.parentNode.removeChild(startScreen);
        }
        showPlaceholderPage('SETTINGS', () => {
          document.body.appendChild(startScreen);
        });
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
    return () => {
      if (startScreen.parentNode) {
        startScreen.parentNode.removeChild(startScreen);
      }
      if (starStyle.parentNode) {
        starStyle.parentNode.removeChild(starStyle);
      }
    };
  }, [wallet.connected]);

  return null;
}

function GameCanvas({ mode }) {
  const wallet = useWallet();
  const [profileCreated, setProfileCreated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [gameState, setGameState] = useState({
    score: 0,
    snakeSegments: [],
    snakeDirection: new THREE.Vector3(0, 0, 1),
    snakeUp: new THREE.Vector3(0, 1, 0),
    snakeSpeed: 0.0607500,
    spheres: [],
    maxSphereCount: 200,
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
    gameMode: mode,
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
  });
  let directionalLight = null;
  let galaxySkybox = null;
  let mobileControls = null;
  const inputMap = {};
  const achievements = {
    firstSteps: {
      id: 'firstSteps',
      name: 'First Steps',
      description: 'Play your first game',
      icon: '🌟',
      unlocked: false,
      condition: () => gameState.gamesPlayed >= 1
    },
    // ... (add all other achievements as in original code)
  };

  useEffect(() => {
    if (wallet.connected && !profileCreated) {
      createUserAndProfile();
    }
  }, [wallet.connected, profileCreated]);

  async function createUserAndProfile() {
    // ... (as in original)
  }

  useEffect(() => {
    const newScene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    newRenderer.shadowMap.enabled = true;
    newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    newRenderer.physicallyCorrectLights = false;
    newRenderer.toneMappingExposure = 0.8;
    document.body.appendChild(newRenderer.domElement);
    newRenderer.domElement.style.position = 'absolute';
    newRenderer.domElement.style.top = '0';
    newRenderer.domElement.style.left = '0';
    newRenderer.domElement.style.zIndex = '0'; // Full screen game
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    newScene.background = new THREE.Color(0x000000);

    const loadAssets = async () => {
      await loadSun(newScene, newCamera);
      setLoading(false);
      setGameState(prev => ({ ...prev, gameRunning: true, gameStarted: true }));
      gameState.gamesPlayed++;
      gameState.gameStartTime = Date.now();
      initializeSnake(newScene);
      initializeAiSnakes(newScene);
      if (gameState.gameMode === 'timed') {
        startTimer();
      }
      checkAchievements();
      saveAchievements();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!isTouchDevice) {
        if (gameState.gameMode === 'timed') {
          showTimedTutorial();
        } else {
          showTutorial();
        }
      }
      mobileControls = createMobileControls();
      if (mobileControls) {
        mobileControls.style.display = 'flex';
      }
      pauseButton.style.display = 'block';
      document.body.appendChild(pauseButton);
    };

    loadAssets();

    const resizeListener = () => {
      newCamera.aspect = window.innerWidth / window.innerHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resizeListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
      newRenderer.dispose();
      newScene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      document.body.removeChild(newRenderer.domElement);
      // Remove UI elements
      document.querySelectorAll('.score-text, .timer-text, #pause-button, #mobile-controls').forEach(el => el.remove());
    };
  }, []);

  useEffect(() => {
    if (renderer && scene && camera && !loading) {
      const animate = () => {
        requestAnimationFrame(animate);
        // Full animate logic from original
        // ... (paste the entire animate function here, using gameState and setGameState for updates)
        renderer.render(scene, camera);
      };
      animate();
    }
  }, [loading, renderer, scene, camera]);

  // ... paste all other functions like loadSun, initializeSpheres, updateSnake, etc., adapting to use scene/camera from state

  if (loading) {
    return <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'black', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      Loading Reality Coil...
    </div>;
  }

  return null;
}

function App() {
  const [isInGame, setIsInGame] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const wallet = useWallet();
  const { setVisible } = useWalletModal();

  const startGame = (mode) => {
    setGameMode(mode);
    setIsInGame(true);
  };

  return (
    <>
      {!isInGame ? (
        <StartScreen onStartGame={startGame} wallet={wallet} setVisible={setVisible} />
      ) : (
        <GameCanvas mode={gameMode} />
      )}
    </>
  );
}

export default App;
