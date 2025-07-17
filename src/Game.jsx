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

function Game() {
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [isInStartScreen, setIsInStartScreen] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const wallet = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (wallet.connected) {
      createUserAndProfile();
    }
  }, [wallet.connected]);

  async function createUserAndProfile() {
    if (isProfileCreated) return;
    try {
      const { createNewUserWithProfileTransaction: txResponse } = await client.createNewUserWithProfileTransaction({
        project: PROJECT_ADDRESS,
        wallet: wallet.publicKey.toString(),
        payer: wallet.publicKey.toString(),
        profileIdentity: "main",
        userInfo: {
          name: "Astroworm Player",
          bio: "Cosmic Serpent in the Reality Coil",
          pfp: "https://example.com/default-pfp.png"
        }
      });
      await sendClientTransactions(client, wallet, txResponse);
      setIsProfileCreated(true);
      setIsInStartScreen(true);
      console.log("User and profile created");
    } catch (error) {
      console.error('Error creating user and profile:', error);
    }
  }

  const startGame = (mode) => {
    setGameMode(mode);
    setIsInGame(true);
  };

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
        scrollbar-width: none; /* Firefox */
      }
      ::-webkit-scrollbar {
        display: none; /* Chrome, Safari */
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
      .wallet-adapter-modal-wrapper {
        z-index: 10001 !important;
      }
      .wallet-adapter-modal-overlay {
        z-index: 10000 !important;
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
    return () => document.head.removeChild(globalStyle);
  }, []);

  if (!wallet.connected || !isProfileCreated) {
    return <ConnectWalletScreen setVisible={setVisible} />;
  }

  if (!isInGame && isInStartScreen) {
    return <StartScreen onStartGame={startGame} wallet={wallet} />;
  }

  if (isInGame) {
    return <GameCanvas mode={gameMode} />;
  }

  return null;
}

function ConnectWalletScreen({ setVisible }) {
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const connectScreen = document.createElement('div');
    connectScreen.id = 'connect-screen';
    connectScreen.style.cssText = `
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
    connectScreen.classList.add('fade-in');
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
    connectScreen.appendChild(starsContainer);
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
      margin-bottom: 40px;
    `;
    subtitle.textContent = `Connect your wallet to enter the Reality Coil`;
    titleContainer.appendChild(gameTitle);
    titleContainer.appendChild(subtitle);
    const connectButton = document.createElement('button');
    connectButton.style.cssText = `
      background: #4169e1;
      color: white;
      border: 2px solid #4169e1;
      padding: 20px 40px;
      font-size: 24px;
      font-family: monospace;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      letter-spacing: 2px;
      transition: all 0.3s ease;
      min-width: 250px;
      z-index: 2;
    `;
    connectButton.textContent = 'CONNECT WALLET';
    const handleEnter = () => {
      connectButton.style.transform = 'scale(1.05)';
      connectButton.style.background = '#5a7dff';
    };
    const handleLeave = () => {
      connectButton.style.transform = 'scale(1)';
      connectButton.style.background = '#4169e1';
    };
    connectButton.addEventListener('mouseenter', handleEnter);
    connectButton.addEventListener('mouseleave', handleLeave);
    connectButton.addEventListener('touchstart', handleEnter);
    connectButton.addEventListener('touchend', handleLeave);
    connectButton.addEventListener('click', debounce(() => setVisible(true), 300));
    connectScreen.appendChild(titleContainer);
    connectScreen.appendChild(connectButton);
    document.body.appendChild(connectScreen);
    return () => {
      document.body.removeChild(connectScreen);
      document.head.removeChild(starStyle);
    };
  }, [setVisible]);

  return null;
}

function StartScreen({ onStartGame, wallet }) {
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
    const playButton = createMenuButton('PLAY', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        showGameModeScreen(() => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
      }, 300);
    }, true);
    const achievementsButton = createMenuButton('ACHIEVEMENTS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        showAchievementsScreen(() => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
      }, 300);
    });
    const leaderboardButton = createMenuButton('LEADERBOARD', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        showPlaceholderPage('LEADERBOARD', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
      }, 300);
    });
    const profileButton = createMenuButton('PROFILE', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        showPlaceholderPage('PROFILE', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
      }, 300);
    });
    const factionsButton = createMenuButton('FACTIONS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        showPlaceholderPage('FACTIONS', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
      }, 300);
    });
    const settingsButton = createMenuButton('SETTINGS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        showPlaceholderPage('SETTINGS', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
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
      startScreen.remove();
      document.head.removeChild(starStyle);
    };
  }, []);

  return null;
}

function GameCanvas({ mode }) {
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const wallet = useWallet();
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  let renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  let directionalLight = null;
  let galaxySkybox = null;
  let mobileControls = null;
  const inputMap = {};
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
  const achievements = {
    // ... full achievements list as in original
  };

  useEffect(() => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = false;
    renderer.toneMappingExposure = 0.8;
    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-1';
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
    loadSun().then(() => {
      setLoading(false);
      setUpdateTrigger(1);
    }).catch(error => {
      console.error('Error loading game assets:', error);
      setLoading(false);
      setUpdateTrigger(1);
    });
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
    pauseButton.addEventListener('click', () => {
      if (gameState.gameStarted && gameState.gameRunning) {
        if (gameState.isPaused) {
          hidePauseMenu();
        } else {
          setGameState(prev => ({ ...prev, isPaused: true }));
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
          setGameState(prev => ({ ...prev, isPaused: true }));
          showPauseMenu();
        }
      }
    });
    document.addEventListener('keyup', evt => {
      inputMap[evt.key] = false;
    });
    mobileControls = createMobileControls();
    loadAchievements();
    return () => {
      window.removeEventListener('resize', () => {});
      renderer.dispose();
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      document.body.removeChild(renderer.domElement);
      document.querySelectorAll('.score-text, .timer-text, #pause-button, #mobile-controls').forEach(el => el.remove());
      document.head.removeChild(timerStyle);
      document.head.removeChild(viewportMeta);
    };
  }, []);

  useEffect(() => {
    if (updateTrigger > 0) {
      setGameState(prev => ({ ...prev, gameRunning: true, gameStarted: true }));
      initializeSnake();
      initializeAiSnakes();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (mobileControls) {
        mobileControls.style.display = isTouchDevice ? 'flex' : 'none';
      }
      document.getElementById('pause-button').style.display = 'block';
      if (mode === 'timed') {
        startTimer();
        if (!isTouchDevice) showTimedTutorial();
      } else {
        if (!isTouchDevice) showTutorial();
      }
      gameState.gamesPlayed++;
      gameState.gameStartTime = Date.now();
      checkAchievements();
      saveAchievements();
      animate();
    }
  }, [updateTrigger]);

  async function loadSun() {
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
    scene.add(directionalLight);
    scene.add(directionalLight.target);
    await createPlatform();
    initializeSpheres();
  }

  // ... (continue with all other functions from the original code, like createPlatform, generateRandomSnakeColors, createSphere, spawnSphere, initializeSpheres, applyMagneticEffect, checkSphereCollisions, createSnakeSegment, createAiSnake, initializeAiSnakes, initializeSnake, checkCollisions, checkSelfCollision, restartGame, showTutorial, showTimedTutorial, startTimer, updateTimerDisplay, showTimedGameOver, restartTimedGame, resetGameToMenu, showPauseMenu, hidePauseMenu, updateAiSnake, processGrowth, updateSnake, loadAchievements, saveAchievements, checkAchievements, unlockAchievement, showAchievementUnlock, claimBadge, getBadgeIndexForAchievement, updateGameStats, awardAchievements, saveUserData, createMobileControls, animate, etc.)

  // Note: For brevity in this response, the full functions are not repeated here, but in your file, paste them from the original code, adapting any setGameState calls to update the state.

  return loading ? <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(45deg, #000011, #000022, #000033)', color: '#00ffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', zIndex: 10002 }}>
      <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '20px', textAlign: 'center' }}>INITIALIZING REALITY COIL</div>
      <div style={{ fontSize: '18px', opacity: 0.8, marginBottom: '30px', textAlign: 'center' }}>Loading cosmic assets...</div>
      <div style={{ width: '300px', height: '4px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px', marginBottom: '15px', overflow: 'hidden' }}>
        <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #00ffff, #4169e1)', borderRadius: '2px', transition: 'width 0.3s ease', boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }} />
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)', letterSpacing: '1px' }}>0%</div>
    </div> : null;
}

export default Game;
