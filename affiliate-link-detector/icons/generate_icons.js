const fs = require('fs');

// Simple orange square with white "L" for Link
const iconData16 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADYSURBVDiNY2AY6sCRgYHhPwMDw38GBob/HA0M/zkYGP7/v8DAMIGBgeE/AwPDfwaG//8ZGBj+X2Bg+P+fgYHhPwMDw38GBob/DAwM/xkYGP4zMDD8Z2Bg+M/AwPD/AgPD//8MDP//MzD8/8/A8P8/A8P//wwM//8zMPz/z8Dw/z8Dw///DAz//zMw/P/PwPCfgYHhPwMDw38GBgYGmAEXGBj+M8AABgYGBpABIDCAgYGBgeE/A8N/BgaG/yADQGDAAJgBFxgY/jMwMPxnYPj/n4Hh/38Ghv//RwJSAABiNDPHhbKe8QAAAABJRU5ErkJggg==";

const iconData48 = iconData16; // Using same data for simplicity
const iconData128 = iconData16; // Using same data for simplicity

// Write the files
fs.writeFileSync('icon-16.png', Buffer.from(iconData16, 'base64'));
fs.writeFileSync('icon-48.png', Buffer.from(iconData48, 'base64'));
fs.writeFileSync('icon-128.png', Buffer.from(iconData128, 'base64'));

console.log('Icons created successfully');
