/*
*  Copyright (c)  2018 Ilias Boutchichi
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
* @author Ilias Boutchichi
*/

'use strict'; //more secure

var TEXT = 0, RECT = 1, INDEX = 2, VALUE = 3, RECT_HEIGHT = 70;

var Insertion = {};

Insertion.animations = [];
Insertion.case = [];
Insertion.animid = 0;
Insertion.tmp = null;
window.stepSpeed = 500;

var initInterpreterApi = function(interpreter, scope) {
  interpreter.setProperty(scope, 'shift_tmp',
  interpreter.createNativeFunction(function(index) {
    Insertion.tmp = Insertion.case[Number(index)];
    Insertion.animations.push(Insertion.changeColor('red', Insertion.tmp[RECT]));
    Insertion.animations.push(Insertion.dmove(250, 0, Insertion.tmp));
  }));

  interpreter.setProperty(scope, 'shift',
  interpreter.createNativeFunction(function(index) {
    Insertion.animations.push(Insertion.dmove(0, RECT_HEIGHT, Insertion.case[Number(index)]));
    Insertion.case[Number(index)+1] = Insertion.case[Number(index)];
    Insertion.case[Number(index)+1][INDEX] = Number(index)+1;
  }));

  interpreter.setProperty(scope, 'put',
  interpreter.createNativeFunction(function(dy, index) {
    Insertion.animations.push(Insertion.dmove(0, -Number(dy), Insertion.tmp));
    Insertion.animations.push(Insertion.dmove(-250, 0, Insertion.tmp));
    Insertion.animations.push(Insertion.changeColor('black', Insertion.tmp[RECT]));
    Insertion.case[Number(index)] = Insertion.tmp;
    Insertion.case[Number(index)][INDEX] = Number(index);
  }));
};

var animate = function() {
    Insertion.animate();
};

Insertion.init = function() {
  if (typeof Blockly === "undefined" || typeof Blockly.getMainWorkspace() === "undefined"
  || Blockly.getMainWorkspace() === null) {
    console.warn("Insertion.init() called but Blockly or workspace was not loaded.");
    window.setTimeout(Insertion.init, 20);
    return;
  }
  var svg = document.getElementById('blocklySvgZone');
  svg.setAttribute('style', '');
  svg.setAttribute('viewBox', '0, 0, 400, 800');
  svg.setAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');

  Insertion.list = Lst.liste;

  var svg = SVG('blocklySvgZone').size('100%', '100%');
  Insertion.list.forEach(function(item, index, array) {
    var text = svg.text('' + item).font({ fill: 'black', family: 'Inconsolata', size:50})
                  .move(0, index*RECT_HEIGHT);
    var rect = svg.rect(120,RECT_HEIGHT).fill('none').stroke({width:4,color:'black'})
                  .move(0,RECT_HEIGHT*index);
    Insertion.case.push([text,rect,index,item]);
  });
  Insertion.reset();
};

Insertion.reset = function() {
  for(var x=0; x < Insertion.animations.length; x++){
    clearTimeout(Insertion.animations[x]);
  }
  Insertion.animations = [];

  Insertion.case.forEach(function(item, index, array) {
    item[TEXT].stroke('black').move(0,index*RECT_HEIGHT);
    item[RECT].stroke('black').move(0,index*RECT_HEIGHT);
  });
};

Insertion.changeColor = function(color, rect) {
  return function() {
    rect.animate(window.stepSpeed, '<>').stroke(color);
  };
};

Insertion.dmove = function(x,y,elem) {
  return function() {
    elem[TEXT].animate(window.stepSpeed, '<>').dmove(x,y);
    elem[RECT].animate(window.stepSpeed, '<>').dmove(x,y);
  };
};

Insertion.animate = function() {
  while(Insertion.animations.length) {
    window.setTimeout(Insertion.animations.shift(), Insertion.animid++*window.stepSpeed);
  }
  Insertion.animid = 0;
};

if (document.getElementById('blocklySvgZone') != null) {
  window.addEventListener('load', Insertion.init);
} else {
  console.warn('Cannot find blocklySvgZone element.');
}
