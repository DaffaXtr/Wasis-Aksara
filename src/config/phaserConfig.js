import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MainMenuScene from '../scenes/MainMenuScene.js';
import PrologScene from '../scenes/PrologScene.js';
import MapScene from '../scenes/MapScene.js';
import Level1Scene from '../scenes/Level1Scene.js';
import Level2Scene from '../scenes/Level2Scene.js';
import Level3Scene from '../scenes/Level3Scene.js';
import Level4Scene from '../scenes/Level4Scene.js';
import Level5Scene from '../scenes/Level5Scene.js';
import ResultScene from '../scenes/ResultScene.js';
import InventoryScene from '../scenes/InventoryScene.js';
import KamusScene from '../scenes/KamusScene.js';
import AchievementScene from '../scenes/AchievementScene.js';
import FinalChallengeScene from '../scenes/FinalChallengeScene.js';
import EndingScene from '../scenes/EndingScene.js';

export const phaserConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'wasis-aksara-game',
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    PrologScene,
    MapScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    Level4Scene,
    Level5Scene,
    ResultScene,
    InventoryScene,
    KamusScene,
    AchievementScene,
    FinalChallengeScene,
    EndingScene
  ]
};
