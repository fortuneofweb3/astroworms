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
    // Similar to previous, but use createElement and add back button calling backToStart
    // ... (implement as before)
  }

  function showGameModeScreen(backToStart) {
    const gameModeScreen = document.createElement('div');
    // ... implement as before, but for play buttons:
    const playVsAiButton = createMenuButton('PLAY VS A.I.', () => {
      gameModeScreen.classList.add('fade-out');
      setTimeout(() => gameModeScreen.remove(), 300);
      onStartGame('normal');
    }, true);
    const playTimedButton = createMenuButton('PLAY TIMED MATCH', () => {
      gameModeScreen.classList.add('fade-out');
      setTimeout(() => gameModeScreen.remove(), 300);
      onStartGame('timed');
    });
    const backButton = createMenuButton('BACK', () => {
      gameModeScreen.classList.add('fade-out');
      setTimeout(() => gameModeScreen.remove(), 300);
      backToStart();
    });
    // ... add to screen
    document.body.appendChild(gameModeScreen);
  }

  useEffect(() => {
    const startScreen = document.createElement('div');
    startScreen.id = 'start-screen';
    // ... add stars, title as before

    const connectButton = createMenuButton(wallet.connected ? 'WALLET CONNECTED' : 'CONNECT WALLET', () => {
      if (!wallet.connected) {
        setVisible(true);
      }
    });
    connectButton.classList.add('wallet-connect-button');
    // ... add other buttons like achievements, leaderboard (using showPlaceholderPage with back to showStartScreenInternal)

    const playButton = createMenuButton('PLAY', () => {
      startScreen.classList.add('fade-out');
      setTimeout(() => startScreen.remove(), 300);
      showGameModeScreen(() => showStartScreenInternal());
    }, true);
    // ... add to container

    document.body.appendChild(startScreen);

    return () => startScreen.remove();
  }, [wallet.connected]);

  return null;
}

function GameCanvas({ mode }) {
  // All Three.js and game logic here
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Init scene, camera, renderer as before
    // Load assets
    loadSun().then(() => {
      setLoading(false);
      // Start animate loop
      animate();
    });

    return () => {
      // Cleanup renderer, scene as before
    };
  }, []);

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
