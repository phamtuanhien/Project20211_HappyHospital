import { Game, Types } from "phaser";
import { MainScene } from "./scenes";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const gameConfig: Types.Core.GameConfig = {
  title: "Happy Hospital",
  type: Phaser.WEBGL,
  parent: "game",
  backgroundColor: "#777",
  dom: {
    createContainer: true
  },    
  scale: {
    mode: Phaser.Scale.ScaleModes.NONE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  render: {
    antialiasGL: false,
    pixelArt: true,
  },
  callbacks: {
    postBoot: () => {
      window.sizeChanged();
    },
  },
  canvasStyle: `display: block; width: 100%; height: 100%;`,
  autoFocus: true,
  audio: {
    disableWebAudio: false,
  },
  scene: [MainScene],
  plugins: {
    scene: [{
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI'
    },
  ]
}
};

window.sizeChanged = () => {
  if (window.game.isBooted) {
    setTimeout(() => {
      window.game.scale.resize(window.innerWidth, window.innerHeight);

      window.game.canvas.setAttribute(
        "style",
        `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`
      );
    }, 100);
  }
};

window.onresize = () => window.sizeChanged();

window.game = new Game(gameConfig);
