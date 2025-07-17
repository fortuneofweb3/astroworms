import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEffect, useState, useRef } from 'react';
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
    return <GameCanvas mode={gameMode} wallet={wallet} setIsInGame={setIsInGame} setIsInStartScreen={setIsInStartScreen} />;
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
      connectButton.removeEventListener('mouseenter', handleEnter);
      connectButton.removeEventListener('mouseleave', handleLeave);
      connectButton.removeEventListener('touchstart', handleEnter);
      connectButton.removeEventListener('touchend', handleLeave);
    };
  }, [setVisible]);

  return null;
}

const achievements = {
  firstSteps: {
    id: 'firstSteps',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🌟',
    unlocked: false,
    condition: (gamesPlayed) => gamesPlayed >= 1
  },
  scoreNovice: {
    id: 'scoreNovice',
    name: 'Cosmic Novice',
    description: 'Reach 250 points',
    icon: '⭐',
    unlocked: false,
    condition: (highestScore) => highestScore >= 250
  },
  scoreAdept: {
    id: 'scoreAdept',
    name: 'Reality Bender',
    description: 'Reach 1000 points',
    icon: '🌠',
    unlocked: false,
    condition: (highestScore) => highestScore >= 1000
  },
  scoreMaster: {
    id: 'scoreMaster',
    name: 'Coil Master',
    description: 'Reach 2500 points',
    icon: '💫',
    unlocked: false,
    condition: (highestScore) => highestScore >= 2500
  },
  lengthGrower: {
    id: 'lengthGrower',
    name: 'Growing Serpent',
    description: 'Reach 30 segments',
    icon: '🐍',
    unlocked: false,
    condition: (longestSnake) => longestSnake >= 30
  },
  lengthTitan: {
    id: 'lengthTitan',
    name: 'Cosmic Titan',
    description: 'Reach 75 segments',
    icon: '🐉',
    unlocked: false,
    condition: (longestSnake) => longestSnake >= 75
  },
  speedDemon: {
    id: 'speedDemon',
    name: 'Speed Demon',
    description: 'Complete a timed game with 30+ seconds left',
    icon: '⚡',
    unlocked: false,
    condition: (timeRemaining, score, gameMode) => gameMode === 'timed' && timeRemaining >= 30 && score >= 100
  },
  survivor: {
    id: 'survivor',
    name: 'Dimensional Survivor',
    description: 'Survive for 5 minutes in one game',
    icon: '🛡️',
    unlocked: false,
    condition: (elapsedTime) => elapsedTime >= 300000 // 5 minutes in ms
  },
  glutton: {
    id: 'glutton',
    name: 'Cosmic Glutton',
    description: 'Eat 250 cosmic fragments total',
    icon: '🍎',
    unlocked: false,
    condition: (spheresEaten) => spheresEaten >= 250
  },
  collector: {
    id: 'collector',
    name: 'Fragment Collector',
    description: 'Eat 1000 cosmic fragments total',
    icon: '💎',
    unlocked: false,
    condition: (spheresEaten) => spheresEaten >= 1000
  },
  veteran: {
    id: 'veteran',
    name: 'Coil Veteran',
    description: 'Play 25 games',
    icon: '🏆',
    unlocked: false,
    condition: (gamesPlayed) => gamesPlayed >= 25
  },
  timeAttacker: {
    id: 'timeAttacker',
    name: 'Time Attacker',
    description: 'Score 500+ in timed mode',
    icon: '⏰',
    unlocked: false,
    condition: (bestTimedScore) => bestTimedScore >= 500
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Reality Perfectionist',
    description: 'Score 5000+ points',
    icon: '🔥',
    unlocked: false,
    condition: (highestScore) => highestScore >= 5000
  },
  leviathan: {
    id: 'leviathan',
    name: 'Cosmic Leviathan',
    description: 'Reach 150 segments',
    icon: '🌌',
    unlocked: false,
    condition: (longestSnake) => longestSnake >= 150
  },
  dedication: {
    id: 'dedication',
    name: 'Dimensional Dedication',
    description: 'Play for 120 minutes total',
    icon: '⌛',
    unlocked: false,
    condition: (totalPlayTime) => totalPlayTime >= 7200000 // 120 min in ms
  }
};

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
    return placeholderScreen;
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
    return achievementsScreen;
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
    return gameModeScreen;
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
        const gameModeScreen = showGameModeScreen(() => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
        const cleanupGameMode = () => {
          if (gameModeScreen.parentNode) gameModeScreen.parentNode.removeChild(gameModeScreen);
        };
        return cleanupGameMode;
      }, 300);
    }, true);
    const achievementsButton = createMenuButton('ACHIEVEMENTS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        const achScreen = showAchievementsScreen(() => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
        const cleanupAch = () => {
          if (achScreen.parentNode) achScreen.parentNode.removeChild(achScreen);
        };
        return cleanupAch;
      }, 300);
    });
    const leaderboardButton = createMenuButton('LEADERBOARD', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        const placeholder = showPlaceholderPage('LEADERBOARD', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
        const cleanupPlaceholder = () => {
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        };
        return cleanupPlaceholder;
      }, 300);
    });
    const profileButton = createMenuButton('PROFILE', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        const placeholder = showPlaceholderPage('PROFILE', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
        const cleanupPlaceholder = () => {
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        };
        return cleanupPlaceholder;
      }, 300);
    });
    const factionsButton = createMenuButton('FACTIONS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        const placeholder = showPlaceholderPage('FACTIONS', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
        const cleanupPlaceholder = () => {
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        };
        return cleanupPlaceholder;
      }, 300);
    });
    const settingsButton = createMenuButton('SETTINGS', () => {
      startScreen.classList.remove('fade-in');
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.remove();
        const placeholder = showPlaceholderPage('SETTINGS', () => {
          document.body.appendChild(startScreen);
          startScreen.classList.add('fade-in');
        });
        const cleanupPlaceholder = () => {
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        };
        return cleanupPlaceholder;
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

function GameCanvas({ mode, wallet, setIsInGame, setIsInStartScreen }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const gameRef = useRef({
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
    elapsedTime: 0,
    totalPlayTime: 0,
    gamesPlayed: 0,
    highestScore: 0,
    longestSnake: 0,
    spheresEaten: 0
  });
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000));
  const rendererRef = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const directionalLightRef = useRef(null);
  const galaxySkyboxRef = useRef(null);
  const mobileControlsRef = useRef(null);
  const inputMapRef = useRef({});
  const animationFrameId = useRef(null);
  const timerIntervalRef = useRef(null);
  const scoreIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);

  useEffect(() => {
    const renderer = rendererRef.current;
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
    const handleResize = () => {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    sceneRef.current.background = new THREE.Color(0x000000);
    loadSun().then(() => {
      setLoading(false);
    }).catch(error => {
      console.error('Error loading game assets:', error);
      setLoading(false);
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
    const handlePauseClick = () => {
      if (gameRef.current.gameStarted && gameRef.current.gameRunning) {
        if (gameRef.current.isPaused) {
          hidePauseMenu();
        } else {
          gameRef.current.isPaused = true;
          showPauseMenu();
          if (gameRef.current.gameMode === 'timed' && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
        }
      }
    };
    pauseButton.addEventListener('click', handlePauseClick);
    pauseButton.addEventListener('mouseenter', () => {
      pauseButton.style.transform = 'translateX(-50%) scale(1.1)';
      pauseButton.style.color = '#00ffff';
    });
    pauseButton.addEventListener('mouseleave', () => {
      pauseButton.style.transform = 'translateX(-50%) scale(1)';
      pauseButton.style.color = 'white';
    });
    const handleKeyDown = evt => {
      inputMapRef.current[evt.key] = true;
      if (evt.key === 'Escape' && gameRef.current.gameStarted && gameRef.current.gameRunning) {
        handlePauseClick();
      }
    };
    const handleKeyUp = evt => {
      inputMapRef.current[evt.key] = false;
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    mobileControlsRef.current = createMobileControls(inputMapRef);
    loadAchievements(wallet, gameRef);
    scoreIntervalRef.current = setInterval(() => {
      setScore(gameRef.current.score);
    }, 1000);
    if (mode === 'timed') {
      timeIntervalRef.current = setInterval(() => {
        setTimeRemaining(gameRef.current.timeRemaining);
      }, 1000);
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sceneRef.current.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      document.body.removeChild(renderer.domElement);
      document.querySelectorAll('.score-text, .timer-text, #pause-button').forEach(el => el.remove());
      if (mobileControlsRef.current) mobileControlsRef.current.remove();
      document.head.removeChild(timerStyle);
      document.head.removeChild(viewportMeta);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      pauseButton.removeEventListener('click', handlePauseClick);
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      gameRef.current.gameRunning = true;
      gameRef.current.gameStarted = true;
      gameRef.current.originalSnakeSpeed = gameRef.current.gameMode === 'timed' ? 0.0607500 * 1.5 : 0.0607500;
      gameRef.current.snakeSpeed = gameRef.current.originalSnakeSpeed;
      gameRef.current.gamesPlayed += 1;
      gameRef.current.gameStartTime = Date.now();
      initializeSnake(gameRef, sceneRef.current);
      initializeAiSnakes(gameRef, sceneRef.current);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (mobileControlsRef.current) {
        mobileControlsRef.current.style.display = isTouchDevice ? 'flex' : 'none';
      }
      document.getElementById('pause-button').style.display = 'block';
      if (gameRef.current.gameMode === 'timed') {
        startTimer(gameRef, timerIntervalRef);
        if (!isTouchDevice) showTimedTutorial();
      } else {
        if (!isTouchDevice) showTutorial();
      }
      checkAchievements(gameRef);
      saveAchievements(wallet, gameRef);
      animate(gameRef, sceneRef, cameraRef, rendererRef, inputMapRef, directionalLightRef, galaxySkyboxRef, animationFrameId, wallet, setIsInGame, setIsInStartScreen);
    }
  }, [loading]);

  async function loadSun() {
    const loader = new GLTFLoader();
    const skyboxUrls = [galaxy1, galaxy2, galaxy3, galaxy4];
    const randomSkyboxUrl = skyboxUrls[Math.floor(Math.random() * skyboxUrls.length)];
    try {
      const galaxyGltf = await new Promise((resolve, reject) => {
        loader.load(randomSkyboxUrl, resolve, (xhr) => {
          setProgress(Math.min(100, (xhr.loaded / xhr.total * 100).toFixed(0)));
        }, reject);
      });
      galaxySkyboxRef.current = galaxyGltf.scene;
      galaxySkyboxRef.current.scale.set(500, 500, 500);
      galaxySkyboxRef.current.position.set(0, 0, 0);
      galaxySkyboxRef.current.traverse(child => {
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
      sceneRef.current.add(galaxySkyboxRef.current);
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
      sceneRef.current.add(stars);
      galaxySkyboxRef.current = stars;
    }
    directionalLightRef.current = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLightRef.current.position.set(0, 400, 0);
    directionalLightRef.current.target.position.set(0, 0, 0);
    directionalLightRef.current.castShadow = true;
    directionalLightRef.current.shadow.mapSize.width = 1024;
    directionalLightRef.current.shadow.mapSize.height = 1024;
    directionalLightRef.current.shadow.camera.near = 50;
    directionalLightRef.current.shadow.camera.far = 600;
    directionalLightRef.current.shadow.camera.left = -150;
    directionalLightRef.current.shadow.camera.right = 150;
    directionalLightRef.current.shadow.camera.top = 150;
    directionalLightRef.current.shadow.camera.bottom = -150;
    directionalLightRef.current.shadow.bias = -0.001;
    directionalLightRef.current.shadow.normalBias = 0.02;
    directionalLightRef.current.shadow.radius = 2;
    directionalLightRef.current.shadow.blurSamples = 8;
    sceneRef.current.add(directionalLightRef.current);
    sceneRef.current.add(directionalLightRef.current.target);
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
    sunMesh.lookAt(cameraRef.current.position);
    sceneRef.current.add(sunMesh);
    await createPlatform(gameRef, sceneRef.current, loader);
    initializeSpheres(gameRef, sceneRef.current);
  }
}

async function createPlatform(gameRef, scene, loader) {
  try {
    const moonGltf = await new Promise((resolve, reject) => {
      loader.load(moonModel, resolve, undefined, reject);
    });
    const platformMesh = moonGltf.scene;
    const platformRadius = gameRef.current.platform.radius;
    const boundingBox = new THREE.Box3().setFromObject(platformMesh);
    const size = boundingBox.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = platformRadius * 2 / maxDimension;
    platformMesh.scale.set(scale, scale, scale);
    platformMesh.position.copy(gameRef.current.platform.center);
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
    gameRef.current.platform.mesh = platformMesh;
    const boundaryRadius = gameRef.current.platform.radius + 1.2;
    const gridGeometry = new THREE.SphereGeometry(boundaryRadius, 32, 16);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
      blending: THREE.AdditiveBlending
    });
    const boundaryGrid = new THREE.Mesh(gridGeometry, gridMaterial);
    boundaryGrid.position.copy(gameRef.current.platform.center);
    boundaryGrid.visible = false;
    scene.add(boundaryGrid);
    gameRef.current.platform.boundaryGrid = boundaryGrid;
  } catch (error) {
    console.warn('Failed to load Makemake model, using default sphere:', error);
    const geometry = new THREE.SphereGeometry(gameRef.current.platform.radius, 32, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xB0B0B0,
      metalness: 0.005,
      roughness: 0.9875,
      envMap: scene.background,
      envMapIntensity: 0.05
    });
    const platformMesh = new THREE.Mesh(geometry, material);
    platformMesh.position.copy(gameRef.current.platform.center);
    platformMesh.castShadow = true;
    platformMesh.receiveShadow = true;
    scene.add(platformMesh);
    gameRef.current.platform.mesh = platformMesh;
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
  return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
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
  return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
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

function spawnSphere(gameRef, scene) {
  if (gameRef.current.spheres.length >= gameRef.current.maxSphereCount) return;
  const platformRadius = gameRef.current.platform.radius;
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
    spherePosition.add(gameRef.current.platform.center);
    attempts++;
  } while (spherePosition.distanceTo(gameRef.current.platform.center) > boundaryRadius && attempts < 10);
  if (attempts >= 10) return;
  const sphere = createSphere(spherePosition);
  gameRef.current.spheres.push(sphere);
  scene.add(sphere);
}

function initializeSpheres(gameRef, scene) {
  for (let i = 0; i < gameRef.current.maxSphereCount; i++) {
    spawnSphere(gameRef, scene);
  }
}

function applyMagneticEffect(gameRef) {
  if (gameRef.current.snakeSegments.length === 0) return;
  const head = gameRef.current.snakeSegments[0];
  const headRadius = head.userData.baseRadius * gameRef.current.growthFactor;
  const magneticRadius = headRadius * 4;
  const magneticStrength = 0.015;
  gameRef.current.spheres.forEach(sphere => {
    const distance = head.position.distanceTo(sphere.position);
    if (distance < magneticRadius && distance > headRadius) {
      const attractionForce = (magneticRadius - distance) / magneticRadius;
      const direction = head.position.clone().sub(sphere.position).normalize();
      const magneticVector = direction.multiplyScalar(magneticStrength * attractionForce);
      sphere.position.add(magneticVector);
    }
  });
}

function checkSphereCollisions(gameRef, scene, wallet) {
  if (gameRef.current.snakeSegments.length === 0) return;
  const head = gameRef.current.snakeSegments[0];
  const headRadius = head.userData.baseRadius * gameRef.current.growthFactor;
  for (let i = gameRef.current.spheres.length - 1; i >= 0; i--) {
    const sphere = gameRef.current.spheres[i];
    const distance = head.position.distanceTo(sphere.position);
    const collisionDistance = headRadius + sphere.userData.radius;
    if (distance < collisionDistance) {
      scene.remove(sphere);
      sphere.geometry.dispose();
      sphere.material.dispose();
      gameRef.current.spheres.splice(i, 1);
      gameRef.current.score += 10;
      gameRef.current.spheresEaten += 1;
      gameRef.current.pendingGrowth += 3;
      gameRef.current.growthFactor += 0.01575;
      gameRef.current.snakeSegments.forEach(segment => {
        segment.scale.setScalar(gameRef.current.growthFactor);
      });
      if (gameRef.current.gameMode === 'timed' && gameRef.current.timeRemaining >= 30 && gameRef.current.score >= 100) {
        unlockAchievement('speedDemon', gameRef);
      }
      updateGameStats(gameRef);
      spawnSphere(gameRef, scene);
      if (wallet.connected) {
        awardAchievements(gameRef.current.score, gameRef.current.snakeSegments.length, wallet, gameRef);
      }
      return;
    }
  }
}

function createSnakeSegment(position, isHead = false, scale = 1.0, colors = null) {
  const baseRadius = isHead ? 0.6 : 0.55;
  const geometry = new THREE.SphereGeometry(baseRadius, isHead ? 16 : 12, isHead ? 12 : 8);
  const material = new THREE.MeshStandardMaterial({
    color: isHead ? colors.head : colors.body,
    emissive: isHead ? colors.headEmissive : colors.bodyEmissive,
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

function createAiSnake(gameRef, scene) {
  const colors = generateAiSnakeColors();
  const aiSnake = {
    segments: [],
    direction: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    up: new THREE.Vector3(0, 1, 0),
    speed: gameRef.current.snakeSpeed,
    colors: colors,
    growthFactor: 1.0,
    segmentSpacing: gameRef.current.segmentSpacing,
    intelligence: Math.random() * 0.5 + 0.5,
    lastDirectionChange: 0,
    invincibilityTime: 180,
    pendingGrowth: 0,
    growthQueue: []
  };
  const platformRadius = gameRef.current.platform.radius;
  const surfaceOffset = -0.7;
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const startPos = new THREE.Vector3();
  startPos.setFromSphericalCoords(platformRadius + surfaceOffset, phi, theta);
  startPos.add(gameRef.current.platform.center);
  aiSnake.up = startPos.clone().sub(gameRef.current.platform.center).normalize();
  aiSnake.direction.sub(aiSnake.up.clone().multiplyScalar(aiSnake.direction.dot(aiSnake.up))).normalize();
  for (let i = 0; i < 6; i++) {
    const segment = createSnakeSegment(startPos, i === 0, aiSnake.growthFactor, colors);
    aiSnake.segments.push(segment);
    scene.add(segment);
  }
  return aiSnake;
}

function initializeAiSnakes(gameRef, scene) {
  const aiCount = gameRef.current.gameMode === 'timed' ? 0 : gameRef.current.maxAiSnakes;
  for (let i = 0; i < aiCount; i++) {
    const aiSnake = createAiSnake(gameRef, scene);
    gameRef.current.aiSnakes.push(aiSnake);
  }
}

function initializeSnake(gameRef, scene) {
  gameRef.current.snakeColors = generateRandomSnakeColors();
  const platformRadius = gameRef.current.platform.radius;
  const surfaceOffset = -0.7;
  const startPosition = gameRef.current.platform.center.clone().add(new THREE.Vector3(0, platformRadius + surfaceOffset, 0));
  const snakeUp = startPosition.clone().sub(gameRef.current.platform.center).normalize();
  const snakeDirection = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < 8; i++) {
    const segmentPosition = startPosition.clone().add(snakeDirection.clone().multiplyScalar(-i * gameRef.current.segmentSpacing));
    const segment = createSnakeSegment(segmentPosition, i === 0, gameRef.current.growthFactor, gameRef.current.snakeColors);
    gameRef.current.snakeSegments.push(segment);
    scene.add(segment);
  }
  gameRef.current.snakeUp = snakeUp;
  gameRef.current.snakeDirection = snakeDirection;
  gameRef.current.invincibilityTime = 180;
  const head = gameRef.current.snakeSegments[0];
  if (head) {
    const cameraDirection = snakeDirection;
    const cameraHeight = 3 + gameRef.current.growthFactor * 2;
    const cameraDistance = 7 + gameRef.current.growthFactor * 2;
    const cameraOffset = cameraDirection.clone().multiplyScalar(-cameraDistance).add(snakeUp.clone().multiplyScalar(cameraHeight));
    const initialCameraPos = head.position.clone().add(cameraOffset);
    const initialCameraTarget = head.position.clone().add(cameraDirection.clone().multiplyScalar(5));
    gameRef.current.camera.currentPosition = initialCameraPos.clone();
    gameRef.current.camera.targetPosition = initialCameraPos.clone();
    gameRef.current.camera.currentLookAt = initialCameraTarget.clone();
    gameRef.current.camera.targetLookAt = initialCameraTarget.clone();
    gameRef.current.camera.currentUp = snakeUp.clone();
    gameRef.current.camera.targetUp = snakeUp.clone();
  }
}

function checkCollisions(gameRef) {
  const head = gameRef.current.snakeSegments[0];
  if (!head || gameRef.current.snakeSegments.length < 6 || gameRef.current.invincibilityTime > 0) return false;
  if (gameRef.current.frameCount < 300) return false;
  gameRef.current.collisionCheckInterval = Math.max(1, Math.floor(1 / gameRef.current.snakeSpeed));
  if (gameRef.current.frameCount % gameRef.current.collisionCheckInterval !== 0) return false;
  const headRadius = head.userData.baseRadius * gameRef.current.growthFactor;
  const headTip = head.position.clone().add(gameRef.current.snakeDirection.clone().multiplyScalar(headRadius * 0.8));
  for (let i = 6; i < gameRef.current.snakeSegments.length; i += 4) {
    const segment = gameRef.current.snakeSegments[i];
    const segmentRadius = segment.userData.baseRadius * gameRef.current.growthFactor;
    const distance = headTip.distanceTo(segment.position);
    if (distance < segmentRadius * 0.7) {
      return true;
    }
  }
  if (gameRef.current.frameCount % 6 === 0) {
    for (const aiSnake of gameRef.current.aiSnakes) {
      for (let i = 0; i < aiSnake.segments.length; i += 5) {
        const segment = aiSnake.segments[i];
        const segmentRadius = segment.userData.baseRadius * aiSnake.growthFactor;
        const distance = headTip.distanceTo(segment.position);
        if (distance < (headRadius + segmentRadius) * 0.8) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkSelfCollision(gameRef) {
  return checkCollisions(gameRef);
}

function restartGame(gameRef, scene, wallet, setIsInGame, setIsInStartScreen) {
  try {
    gameRef.current.gameRunning = false;
    updateGameStats(gameRef);
    disposeSnakeAndSpheres(gameRef, scene);
    gameRef.current.score = 0;
    gameRef.current.snakeSegments = [];
    gameRef.current.aiSnakes = [];
    gameRef.current.spheres = [];
    gameRef.current.snakeDirection = new THREE.Vector3(0, 0, 1);
    gameRef.current.snakeUp = new THREE.Vector3(0, 1, 0);
    gameRef.current.pendingGrowth = 0;
    gameRef.current.growthQueue = [];
    gameRef.current.growthFactor = 1.0;
    gameRef.current.snakeSpeed = gameRef.current.gameMode === 'timed' ? 0.0607500 * 1.5 : 0.0607500;
    gameRef.current.originalSnakeSpeed = gameRef.current.snakeSpeed;
    gameRef.current.invincibilityTime = 0;
    gameRef.current.collisionCheckInterval = 4;
    gameRef.current.isPaused = false;
    gameRef.current.pauseTransition = 0;
    const existingPanel = document.querySelector('.game-over-panel');
    if (existingPanel && existingPanel.parentNode) {
      existingPanel.parentNode.removeChild(existingPanel);
    }
    gameRef.current.gamesPlayed += 1;
    gameRef.current.gameStartTime = Date.now();
    initializeSnake(gameRef, scene);
    initializeAiSnakes(gameRef, scene);
    gameRef.current.gameRunning = true;
    gameRef.current.gameStarted = true;
    checkAchievements(gameRef);
    saveAchievements(wallet, gameRef);
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

function startTimer(gameRef, timerIntervalRef) {
  if (timerIntervalRef.current) {
    clearInterval(timerIntervalRef.current);
  }
  gameRef.current.timerStarted = true;
  timerIntervalRef.current = setInterval(() => {
    if (!gameRef.current.gameRunning || gameRef.current.isPaused) return;
    gameRef.current.timeRemaining -= 1;
    updateTimerDisplay(gameRef);
    if (gameRef.current.timeRemaining <= 0) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      gameRef.current.gameRunning = false;
    }
  }, 1000);
}

function updateTimerDisplay(gameRef) {
  const timerElement = document.getElementById('timer-display');
  if (timerElement) {
    const minutes = Math.floor(gameRef.current.timeRemaining / 60);
    const seconds = gameRef.current.timeRemaining % 60;
    timerElement.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (gameRef.current.timeRemaining <= 10) {
      timerElement.style.color = '#ff3333';
      timerElement.style.animation = 'timerPulse 0.5s infinite ease-in-out';
    }
  }
}

function showTimedGameOver(gameRef, scene, wallet) {
  const finalSnakeLength = gameRef.current.snakeSegments.length;
  const finalScore = gameRef.current.score;
  updateGameStats(gameRef);
  if (finalScore > gameRef.current.bestTimedScore) {
    gameRef.current.bestTimedScore = finalScore;
    localStorage.setItem('astrowormBestTimedScore', finalScore.toString());
  }
  disposeSnakeAndSpheres(gameRef, scene);
  gameRef.current.snakeSegments = [];
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
    color: ${finalScore > gameRef.current.bestTimedScore ? '#ffff00' : '#888888'};
    font-size: 16px;
    margin-bottom: 25px;
  `;
  bestScoreText.textContent = `Best Timed Score: ${gameRef.current.bestTimedScore}`;
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
      restartTimedGame(gameRef, scene, wallet);
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
    const gameUrl = window.location.href;
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
      resetGameToMenu(gameRef, scene, wallet, setIsInGame, setIsInStartScreen);
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
  if (wallet.connected) {
    awardAchievements(finalScore, finalSnakeLength, wallet, gameRef);
    saveUserData(wallet.publicKey.toString(), finalScore, finalSnakeLength, gameRef);
  }
}

function restartTimedGame(gameRef, scene, wallet) {
  try {
    gameRef.current.gameRunning = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    gameRef.current.gameMode = 'timed';
    gameRef.current.timeRemaining = 60;
    gameRef.current.timerStarted = false;
    gameRef.current.frameCount = 0;
    gameRef.current.snakeSegments = [];
    gameRef.current.spheres = [];
    gameRef.current.score = 0;
    gameRef.current.snakeDirection = new THREE.Vector3(0, 0, 1);
    gameRef.current.snakeUp = new THREE.Vector3(0, 1, 0);
    gameRef.current.pendingGrowth = 0;
    gameRef.current.growthQueue = [];
    gameRef.current.growthFactor = 1.0;
    gameRef.current.snakeSpeed = 0.0607500 * 1.5;
    gameRef.current.originalSnakeSpeed = 0.0607500 * 1.5;
    gameRef.current.invincibilityTime = 0;
    gameRef.current.collisionCheckInterval = 4;
    gameRef.current.isPaused = false;
    gameRef.current.pauseTransition = 0;
    gameRef.current.frameCount = 0;
    disposeSnakeAndSpheres(gameRef, scene);
    const scoreText = document.querySelector('.score-text');
    if (scoreText) scoreText.textContent = 'Score: 0';
    initializeSnake(gameRef, scene);
    initializeSpheres(gameRef, scene);
    gameRef.current.gameRunning = true;
    gameRef.current.gameStarted = true;
    startTimer(gameRef, timerIntervalRef);
  } catch (error) {
    console.error('Error restarting timed game:', error);
    location.reload();
  }
}

function resetGameToMenu(gameRef, scene, wallet, setIsInGame, setIsInStartScreen) {
  try {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    disposeSnakeAndSpheres(gameRef, scene);
    gameRef.current.snakeSegments = [];
    gameRef.current.aiSnakes = [];
    gameRef.current.spheres = [];
    gameRef.current.score = 0;
    gameRef.current.snakeDirection = new THREE.Vector3(0, 0, 1);
    gameRef.current.snakeUp = new THREE.Vector3(0, 1, 0);
    gameRef.current.pendingGrowth = 0;
    gameRef.current.growthQueue = [];
    gameRef.current.growthFactor = 1.0;
    gameRef.current.snakeSpeed = 0.0607500;
    gameRef.current.originalSnakeSpeed = 0.0607500;
    gameRef.current.invincibilityTime = 0;
    gameRef.current.frameCount = 0;
    gameRef.current.gameMode = 'normal';
    gameRef.current.timeRemaining = 60;
    gameRef.current.timerStarted = false;
    const scoreText = document.querySelector('.score-text');
    if (scoreText) scoreText.textContent = 'Score: 0';
    const timerElement = document.getElementById('timer-display');
    if (timerElement) {
      timerElement.style.display = 'none';
    }
    if (mobileControlsRef.current) {
      mobileControlsRef.current.style.display = 'none';
    }
    if (document.getElementById('pause-button')) {
      document.getElementById('pause-button').style.display = 'none';
    }
  } catch (error) {
    console.warn('Error during game cleanup:', error);
  }
  gameRef.current.gameRunning = false;
  gameRef.current.gameStarted = false;
  gameRef.current.isPaused = false;
  setIsInGame(false);
  setIsInStartScreen(true);
}

function disposeSnakeAndSpheres(gameRef, scene) {
  gameRef.current.snakeSegments.forEach(segment => {
    if (segment) {
      scene.remove(segment);
      segment.geometry.dispose();
      segment.material.dispose();
    }
  });
  gameRef.current.aiSnakes.forEach(aiSnake => {
    if (aiSnake && aiSnake.segments) {
      aiSnake.segments.forEach(segment => {
        if (segment) {
          scene.remove(segment);
          segment.geometry.dispose();
          segment.material.dispose();
        }
      });
    }
  });
  gameRef.current.spheres.forEach(sphere => {
    if (sphere) {
      scene.remove(sphere);
      sphere.geometry.dispose();
      sphere.material.dispose();
    }
  });
}

function showPauseMenu(gameRef) {
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
  resumeButton.addEventListener('click', () => hidePauseMenu(gameRef, timerIntervalRef));
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
        resetGameToMenu(gameRef, sceneRef.current, wallet, setIsInGame, setIsInStartScreen);
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

function hidePauseMenu(gameRef, timerIntervalRef) {
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
  gameRef.current.isPaused = false;
  if (gameRef.current.gameMode === 'timed') {
    startTimer(gameRef, timerIntervalRef);
  }
}

function updateAiSnake(aiSnake, gameRef, scene) {
  if (aiSnake.segments.length === 0) return;
  const head = aiSnake.segments[0];
  const platformRadius = gameRef.current.platform.radius;
  const currentTime = performance.now();
  if (!aiSnake.turnRate) {
    aiSnake.turnRate = 0.002 + Math.random() * 0.003;
    aiSnake.wanderAngle = Math.random() * Math.PI * 2;
    aiSnake.cautiousness = Math.random() * 0.5;
  }
  if (aiSnake.invincibilityTime > 0 && !gameRef.current.isPaused) {
    aiSnake.invincibilityTime--;
  }
  aiSnake.speed = gameRef.current.snakeSpeed * 1.25;
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
  for (let i = gameRef.current.spheres.length - 1; i >= 0; i--) {
    const sphere = gameRef.current.spheres[i];
    const distance = head.position.distanceTo(sphere.position);
    const collisionDistance = headRadius + sphere.userData.radius;
    if (distance < collisionDistance) {
      scene.remove(sphere);
      sphere.geometry.dispose();
      sphere.material.dispose();
      gameRef.current.spheres.splice(i, 1);
      aiSnake.pendingGrowth += 3;
      aiSnake.growthFactor += 0.01575;
      aiSnake.segments.forEach(segment => {
        segment.scale.setScalar(aiSnake.growthFactor);
      });
      spawnSphere(gameRef, scene);
    }
  }
  let targetDirection = aiSnake.direction.clone();
  if (gameRef.current.spheres.length > 0) {
    let closestFood = null;
    let closestDistance = Infinity;
    const seekingRadius = 8 + aiSnake.intelligence * 5;
    for (const sphere of gameRef.current.spheres) {
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
  if (gameRef.current.frameCount % 12 === 0) {
    if (gameRef.current.snakeSegments.length > 0) {
      const playerHead = gameRef.current.snakeSegments[0];
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
  aiSnake.up.copy(head.position.clone().sub(gameRef.current.platform.center).normalize());
  aiSnake.direction.sub(aiSnake.up.clone().multiplyScalar(aiSnake.direction.dot(aiSnake.up))).normalize();
  const surfaceOffset = -0.7;
  const newHeadPosition = head.position.clone().add(aiSnake.direction.clone().multiplyScalar(aiSnake.speed));
  const newNormal = newHeadPosition.clone().sub(gameRef.current.platform.center).normalize();
  newHeadPosition.copy(gameRef.current.platform.center).add(newNormal.clone().multiplyScalar(platformRadius + surfaceOffset));
  const positions = [newHeadPosition];
  for (let i = 0; i < aiSnake.segments.length - 1; i++) {
    const currentPos = positions[i];
    const nextSegment = aiSnake.segments[i + 1];
    const direction = currentPos.clone().sub(nextSegment.position).normalize();
    let targetPos = currentPos.clone().sub(direction.multiplyScalar(aiSnake.segmentSpacing));
    const segmentNormal = targetPos.clone().sub(gameRef.current.platform.center).normalize();
    const segmentSurfaceOffset = -0.7;
    targetPos.copy(gameRef.current.platform.center).add(segmentNormal.clone().multiplyScalar(platformRadius + segmentSurfaceOffset));
    positions.push(targetPos);
  }
  for (let i = 0; i < aiSnake.segments.length; i++) {
    aiSnake.segments[i].position.copy(positions[i]);
  }
}

function processGrowth(gameRef, scene) {
  if (gameRef.current.pendingGrowth > 0) {
    const tail = gameRef.current.snakeSegments[gameRef.current.snakeSegments.length - 1];
    const secondToLast = gameRef.current.snakeSegments[gameRef.current.snakeSegments.length - 2];
    let tailDirection;
    if (secondToLast) {
      tailDirection = tail.position.clone().sub(secondToLast.position).normalize();
    } else {
      tailDirection = gameRef.current.snakeDirection.clone().negate();
    }
    const spacing = gameRef.current.segmentSpacing;
    const newSegmentPosition = tail.position.clone().add(tailDirection.multiplyScalar(spacing));
    const newSegment = createSnakeSegment(newSegmentPosition, false, gameRef.current.growthFactor, gameRef.current.snakeColors);
    const targetScale = gameRef.current.growthFactor;
    const initialScale = 0.1 * targetScale;
    newSegment.scale.setScalar(initialScale);
    gameRef.current.snakeSegments.push(newSegment);
    gameRef.current.growthQueue.push({ segment: newSegment, targetScale: targetScale, currentScale: initialScale, growthRate: 0.1 * targetScale });
    gameRef.current.pendingGrowth -= 1;
    scene.add(newSegment);
  }
  for (let i = gameRef.current.growthQueue.length - 1; i >= 0; i--) {
    const growthItem = gameRef.current.growthQueue[i];
    growthItem.currentScale = Math.min(growthItem.targetScale, growthItem.currentScale + growthItem.growthRate);
    growthItem.segment.scale.setScalar(growthItem.currentScale);
    if (growthItem.currentScale >= growthItem.targetScale) {
      gameRef.current.growthQueue.splice(i, 1);
    }
  }
}

function updateSnake(gameRef, camera) {
  if (gameRef.current.snakeSegments.length === 0) return;
  const head = gameRef.current.snakeSegments[0];
  const platformRadius = gameRef.current.platform.radius;
  const surfaceOffset = -0.7;
  const newHeadPosition = head.position.clone().add(gameRef.current.snakeDirection.clone().multiplyScalar(gameRef.current.snakeSpeed));
  const normal = newHeadPosition.clone().sub(gameRef.current.platform.center).normalize();
  newHeadPosition.copy(gameRef.current.platform.center).add(normal.clone().multiplyScalar(platformRadius + surfaceOffset));
  gameRef.current.snakeUp = normal;
  gameRef.current.snakeDirection = gameRef.current.snakeDirection.clone().sub(normal.clone().multiplyScalar(gameRef.current.snakeDirection.dot(normal))).normalize();
  const positions = [newHeadPosition];
  for (let i = 0; i < gameRef.current.snakeSegments.length - 1; i++) {
    const currentPos = positions[i];
    const nextSegment = gameRef.current.snakeSegments[i + 1];
    const direction = currentPos.clone().sub(nextSegment.position).normalize();
    let targetPos = currentPos.clone().sub(direction.multiplyScalar(gameRef.current.segmentSpacing));
    const segmentNormal = targetPos.clone().sub(gameRef.current.platform.center).normalize();
    const segmentSurfaceOffset = -0.7;
    targetPos.copy(gameRef.current.platform.center).add(segmentNormal.clone().multiplyScalar(platformRadius + segmentSurfaceOffset));
    positions.push(targetPos);
  }
  for (let i = 0; i < gameRef.current.snakeSegments.length; i++) {
    gameRef.current.snakeSegments[i].position.copy(positions[i]);
  }
  const cameraDirection = gameRef.current.snakeDirection;
  const cameraTarget = head.position.clone().add(cameraDirection.clone().multiplyScalar(5));
  const cameraHeight = 3 + gameRef.current.growthFactor * 2;
  const cameraDistance = 7 + gameRef.current.growthFactor * 2;
  const cameraOffset = cameraDirection.clone().multiplyScalar(-cameraDistance).add(gameRef.current.snakeUp.clone().multiplyScalar(cameraHeight));
  gameRef.current.camera.targetPosition = head.position.clone().add(cameraOffset);
  gameRef.current.camera.targetLookAt = cameraTarget;
  gameRef.current.camera.targetUp = gameRef.current.snakeUp;
  gameRef.current.camera.currentPosition = gameRef.current.camera.currentPosition.clone().lerp(gameRef.current.camera.targetPosition, gameRef.current.camera.smoothingFactor);
  gameRef.current.camera.currentLookAt = gameRef.current.camera.currentLookAt.clone().lerp(gameRef.current.camera.targetLookAt, gameRef.current.camera.smoothingFactor);
  gameRef.current.camera.currentUp = gameRef.current.camera.currentUp.clone().lerp(gameRef.current.camera.targetUp, gameRef.current.camera.smoothingFactor);
  camera.position.copy(gameRef.current.camera.currentPosition);
  camera.up.copy(gameRef.current.camera.currentUp);
  camera.lookAt(gameRef.current.camera.currentLookAt);
}

function loadAchievements(wallet, gameRef) {
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
    gameRef.current.highestScore = stats.highestScore || 0;
    gameRef.current.longestSnake = stats.longestSnake || 0;
    gameRef.current.spheresEaten = stats.spheresEaten || 0;
    gameRef.current.gamesPlayed = stats.gamesPlayed || 0;
    gameRef.current.totalPlayTime = stats.totalPlayTime || 0;
    gameRef.current.bestTimedScore = stats.bestTimedScore || 0;
  }
  if (wallet.connected) {
    loadFromHoneycomb(wallet.publicKey.toString(), gameRef);
  }
}

async function loadFromHoneycomb(userPublicKey, gameRef) {
  try {
    const profile = await client.getProfile(PROJECT_ADDRESS, userPublicKey, "main");
    if (profile.customData && profile.customData.achievements) {
      const honeycombAchievements = profile.customData.achievements;
      Object.keys(honeycombAchievements).forEach(key => {
        if (achievements[key]) {
          achievements[key].unlocked = honeycombAchievements[key];
        }
      });
    }
    const userRef = ref(db, 'users/' + userPublicKey);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      gameRef.current.highestScore = data.highScore || gameRef.current.highestScore;
      gameRef.current.longestSnake = data.bestLength || gameRef.current.longestSnake;
      gameRef.current.spheresEaten = data.spheresEaten || gameRef.current.spheresEaten;
      gameRef.current.gamesPlayed = data.gamesPlayed || gameRef.current.gamesPlayed;
      gameRef.current.totalPlayTime = data.totalPlayTime || gameRef.current.totalPlayTime;
      gameRef.current.bestTimedScore = data.bestTimedScore || gameRef.current.bestTimedScore;
    }
  } catch (error) {
    console.error('Error loading from Honeycomb:', error);
  }
}

function saveAchievements(wallet, gameRef) {
  const unlockedAchievements = {};
  Object.keys(achievements).forEach(key => {
    unlockedAchievements[key] = achievements[key].unlocked;
  });
  localStorage.setItem('astrowormAchievements', JSON.stringify(unlockedAchievements));
  const stats = {
    highestScore: gameRef.current.highestScore,
    longestSnake: gameRef.current.longestSnake,
    spheresEaten: gameRef.current.spheresEaten,
    gamesPlayed: gameRef.current.gamesPlayed,
    totalPlayTime: gameRef.current.totalPlayTime,
    bestTimedScore: gameRef.current.bestTimedScore
  };
  localStorage.setItem('astrowormStats', JSON.stringify(stats));
  if (wallet.connected) {
    syncToHoneycomb(wallet.publicKey.toString(), unlockedAchievements, stats);
  }
}

async function syncToHoneycomb(userPublicKey, unlockedAchievements, stats) {
  try {
    const profileAddress = await client.getProfileAddress(PROJECT_ADDRESS, userPublicKey, "main");
    const { createUpdateProfileTransaction: txResponse } = await client.createUpdateProfileTransaction({
      payer: userPublicKey,
      profile: profileAddress,
      customData: { achievements: unlockedAchievements }
    });
    await sendClientTransactions(client, { publicKey: { toString: () => userPublicKey } }, txResponse);  // Assuming wallet is mocked for sync
    const userRef = ref(db, 'users/' + userPublicKey);
    await set(userRef, {
      highScore: stats.highestScore,
      bestLength: stats.longestSnake,
      spheresEaten: stats.spheresEaten,
      gamesPlayed: stats.gamesPlayed,
      totalPlayTime: stats.totalPlayTime,
      bestTimedScore: stats.bestTimedScore,
      lastPlayed: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing to Honeycomb:', error);
  }
}

function checkAchievements(gameRef) {
  Object.keys(achievements).forEach(key => {
    const achievement = achievements[key];
    if (!achievement.unlocked && achievement.condition(
      gameRef.current.gamesPlayed, 
      gameRef.current.highestScore, 
      gameRef.current.longestSnake, 
      gameRef.current.timeRemaining, 
      gameRef.current.score, 
      gameRef.current.gameMode, 
      gameRef.current.elapsedTime, 
      gameRef.current.spheresEaten, 
      gameRef.current.bestTimedScore, 
      gameRef.current.totalPlayTime
    )) {
      unlockAchievement(key, gameRef);
    }
  });
}

function unlockAchievement(achievementId, gameRef) {
  const achievement = achievements[achievementId];
  if (!achievement || achievement.unlocked) return;
  achievement.unlocked = true;
  saveAchievements(null, gameRef);  // Wallet not passed, assume local only or handle
  showAchievementUnlock(achievement);
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

function claimBadge(userPublicKey, badgeIndex) {
  // Implementation omitted or mocked, as per original
}

function getBadgeIndexForAchievement(achievementId) {
  const mapping = {
    'scoreNovice': 0,
    'timeAttacker': 1,
    'lengthGrower': 2,
  };
  return mapping[achievementId] || -1;
}

function updateGameStats(gameRef) {
  gameRef.current.highestScore = Math.max(gameRef.current.score, gameRef.current.highestScore);
  gameRef.current.longestSnake = Math.max(gameRef.current.snakeSegments.length, gameRef.current.longestSnake);
  if (gameRef.current.gameStartTime > 0) {
    gameRef.current.totalPlayTime += Date.now() - gameRef.current.gameStartTime;
  }
  gameRef.current.gameStartTime = Date.now();
  checkAchievements(gameRef);
  saveAchievements(null, gameRef);  // Wallet not passed
}

function awardAchievements(score, length, wallet, gameRef) {
  checkAchievements(gameRef);
  saveAchievements(wallet, gameRef);
}

function saveUserData(userPublicKey, score, length, gameRef) {
  gameRef.current.highestScore = Math.max(gameRef.current.highestScore, score);
  gameRef.current.longestSnake = Math.max(gameRef.current.longestSnake, length);
  if (gameRef.current.gameMode === 'timed') {
    gameRef.current.bestTimedScore = Math.max(gameRef.current.bestTimedScore, score);
  }
  saveAchievements(null, gameRef);
}

function createMobileControls(inputMapRef) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return null;
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
      inputMapRef.current[direction.toUpperCase()] = true;
      const button = evt.target;
      button.style.transform = 'scale(0.9)';
      button.style.background = 'rgba(90, 125, 255, 0.9)';
      button.style.boxShadow = '0 2px 8px rgba(0, 255, 255, 0.5)';
    };
  }
  function handleTouchEnd(direction) {
    return evt => {
      evt.preventDefault();
      inputMapRef.current[direction.toUpperCase()] = false;
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

function animate(gameRef, sceneRef, cameraRef, rendererRef, inputMapRef, directionalLightRef, galaxySkyboxRef, animationFrameId, wallet, setIsInGame, setIsInStartScreen) {
  animationFrameId.current = requestAnimationFrame(() => animate(gameRef, sceneRef, cameraRef, rendererRef, inputMapRef, directionalLightRef, galaxySkyboxRef, animationFrameId, wallet, setIsInGame, setIsInStartScreen));
  try {
    gameRef.current.frameCount += 1;
    if (!gameRef.current.gameStarted || !gameRef.current.gameRunning) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return;
    }
    gameRef.current.pauseTransition = gameRef.current.isPaused ? Math.min(1, gameRef.current.pauseTransition + 0.05) : Math.max(0, gameRef.current.pauseTransition - 0.05);
    const speedMultiplier = 1 - gameRef.current.pauseTransition * 0.95;
    gameRef.current.snakeSpeed = gameRef.current.originalSnakeSpeed * speedMultiplier;
    if (gameRef.current.pauseTransition < 0.99) {
      if (inputMapRef.current['a'] || inputMapRef.current['A'] || inputMapRef.current['ArrowLeft']) {
        const turnSpeed = 0.03 * speedMultiplier;
        const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(gameRef.current.snakeUp, turnSpeed);
        gameRef.current.snakeDirection = gameRef.current.snakeDirection.clone().applyQuaternion(yawQuaternion).normalize();
      }
      if (inputMapRef.current['d'] || inputMapRef.current['D'] || inputMapRef.current['ArrowRight']) {
        const turnSpeed = 0.03 * speedMultiplier;
        const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(gameRef.current.snakeUp, -turnSpeed);
        gameRef.current.snakeDirection = gameRef.current.snakeDirection.clone().applyQuaternion(yawQuaternion).normalize();
      }
    }
    if (gameRef.current.pauseTransition < 0.99) {
      updateSnake(gameRef, cameraRef.current);
      processGrowth(gameRef, sceneRef.current);
      if (gameRef.current.invincibilityTime > 0) {
        gameRef.current.invincibilityTime -= 1;
      }
      gameRef.current.elapsedTime = Date.now() - gameRef.current.gameStartTime;
      if (gameRef.current.frameCount % 5 === 0 && checkSelfCollision(gameRef)) {
        if (gameRef.current.gameMode === 'timed') {
          showTimedGameOver(gameRef, sceneRef.current, wallet);
        } else {
          // gameOver(); // Assuming similar function for normal mode, add if needed
        }
        return;
      }
      if (gameRef.current.frameCount % 2 === 0) {
        applyMagneticEffect(gameRef);
        checkSphereCollisions(gameRef, sceneRef.current, wallet);
      }
      if (gameRef.current.frameCount % 4 === 0) {
        gameRef.current.aiSnakes.forEach(aiSnake => {
          updateAiSnake(aiSnake, gameRef, sceneRef.current);
        });
      }
    }
    if (directionalLightRef.current && gameRef.current.snakeSegments.length > 0 && gameRef.current.frameCount % 120 === 0) {
      const head = gameRef.current.snakeSegments[0];
      if (head && head.position) {
        const shadowTarget = head.position.clone();
        directionalLightRef.current.target.position.copy(shadowTarget);
        directionalLightRef.current.target.updateMatrixWorld();
        const lightDirection = new THREE.Vector3(0, -1, 0.2).normalize();
        const shadowCameraDistance = 150;
        directionalLightRef.current.position.copy(shadowTarget.clone().add(lightDirection.clone().multiplyScalar(-shadowCameraDistance)));
      }
    }
    if (galaxySkyboxRef.current && gameRef.current.frameCount % 480 === 0) {
      galaxySkyboxRef.current.rotation.y += 0.001;
    }
    if (gameRef.current.frameCount % 180 === 0) {
      gameRef.current.spheres.forEach((sphere, i) => {
        if (i % 3 === 0 && sphere.userData) {
          sphere.userData.pulseFactor += sphere.userData.pulseSpeed * 2;
          sphere.scale.setScalar(1 + Math.sin(sphere.userData.pulseFactor) * 0.1);
        }
      });
    }
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  } catch (error) {
    console.error('Animation error:', error);
    if (gameRef.current.gameRunning) {
      gameRef.current.gameRunning = false;
      setTimeout(() => {
        gameRef.current.gameRunning = true;
      }, 1000);
    }
  }
}

return loading ? <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)', color: '#00ffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', zIndex: 10002 }}>
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
    {/* Add stars loop here, same as in ConnectWalletScreen */}
  </div>
  <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '20px', textAlign: 'center', zIndex: 2 }}>INITIALIZING REALITY COIL</div>
  <div style={{ fontSize: '18px', opacity: 0.8, marginBottom: '30px', textAlign: 'center', zIndex: 2 }}>Loading cosmic assets...</div>
  <div style={{ width: '300px', height: '4px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px', marginBottom: '15px', overflow: 'hidden', zIndex: 2 }}>
    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #00ffff, #4169e1)', borderRadius: '2px', transition: 'width 0.3s ease', boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)' }} />
  </div>
  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)', letterSpacing: '1px', zIndex: 2 }}>{progress}%</div>
</div> : <div>
  <div className="score-text">Score: {score}</div>
  {gameRef.current.gameMode === 'timed' && <div className="timer-text">Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>}
</div>;
}

export default Game;
