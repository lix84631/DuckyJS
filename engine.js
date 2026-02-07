let gameCanvas = document.getElementById("gameCanvas");
var ctx = gameCanvas.getContext("2d");

let keysDown = [];

window.addEventListener("keydown", function(event) {
    if(keysDown.includes(event.key)) return;

    keysDown.push(event.key);
});

window.addEventListener("keyup", function(event) {
    if(!keysDown.includes(event.key)) return;

    const index = keysDown.indexOf(event.key);
    keysDown.splice(index, 1);
});

window.addEventListener("mousedown", function() {
    Game.Mouse.down = true;
});

window.addEventListener("mouseup", function() {
    Game.Mouse.down = false;
});

window.addEventListener("mousemove", (event) => {
    const rect = gameCanvas.getBoundingClientRect();

    const canvasX =
        (event.clientX - rect.left) * (gameCanvas.width / rect.width);
    const canvasY =
        (event.clientY - rect.top) * (gameCanvas.height / rect.height);

    const matrix = ctx.getTransform();
    const inv = matrix.invertSelf();

    const worldX = canvasX * inv.a + canvasY * inv.c + inv.e;
    const worldY = canvasX * inv.b + canvasY * inv.d + inv.f;

    Game.Mouse.x = worldX;
    Game.Mouse.y = worldY;
});

var Game = {
    _rAF : null,

    Start : function() {
        if(this._rAF) return;
        this._rAF = requestAnimationFrame(update);
    },

    Stop : function() {
        this._rAF = null;
        cancelAnimationFrame(update);
    },

    currentScene : null,

    SetScene : function(_Scene) {
        this.currentScene = _Scene
    },

    KeyDown : function(key) {
        return keysDown.includes(key);
    },

    Mouse : {
        x : null,
        y : null,
        down : false,
    },

    currentLayer : 0,

    CheckCollision : function(A, B) {
        if(this.currentScene.Objects.includes(A) && this.currentScene.Objects.includes(B)) {
            return (
                A.x < B.x + B.width &&
                A.x + A.width > B.x &&
                A.y < B.y + B.height &&
                A.y + A.height > B.y
            )
        }
    },

    PointInGO : function(x, y, _GameObject) {
        return (
        x >= _GameObject.x &&
        x <= _GameObject.x + _GameObject.width &&
        y >= _GameObject.y &&
        y <= _GameObject.y + _GameObject.height
    );
    }
}

class Scene {
    constructor() {
        this.paused = false;

        this.Objects = [];
        this.UI = [];
    }

    Update(delta) {}
}

let currentLayer = 0;

class GameObject {
    constructor(_Scene) {
        this.Scene = _Scene;

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.drawn = false;
        this.drawLayer = null;

        this.LeftClicked = function() {
            if (!Game.PointInGO(Game.Mouse.x, Game.Mouse.y, this) || !Game.Mouse.down) return false;

            for (let i = _Scene.Objects.length - 1; i >= 0; i--) {
                let other = _Scene.Objects[i];
                if (other === this) continue;

                if (other.drawLayer <= this.drawLayer) break;
                if (!Game.CheckCollision(this, other)) continue;

                if (Game.PointInGO(Game.Mouse.x, Game.Mouse.y, other)) {
                    return false;
                }
            }

            return true;
        }

        _Scene.Objects.push(this);
    }

    draw(_Texture, opacity, flipX, flipY) {
        if(!this.Scene.Objects.includes(this)) return;
        if(!opacity) opacity = 1;
        if(!flipX) flipX = 1;
        if(!flipY) flipY = 1;

        ctx.globalAlpha = opacity;
        ctx.drawImage(_Texture, this.x, this.y, this.width * flipX, this.height * flipY);
        ctx.globalAlpha = 1;

        if(!this.drawn) this.drawn = true; Game.currentLayer += 1; this.drawLayer = Game.currentLayer;
    }

    destroy() {
        let sceneObjects = this.Scene.Objects;
        
        if(!sceneObjects.includes(this)) return;

        let index = sceneObjects.indexOf(this);
        sceneObjects.splice(index, 1);

        Game.currentLayer -= 1;
    }
}

class ScreenGUI {
    constructor(_Scene) {
        this.Scene = _Scene
        this.enabled = true;

        this.x = 0;
        this.y = 0;

        this.children = [];

        _Scene.UI.push(this);
    }

    update(delta) {
        for(let i = 0; i < this.children.length; i ++) {
            var child = this.children[i];
            child.update(delta);
        }
    }
}

var UI = {
    Frame : function(parent) {
        this.parent = parent;
        this.children = [];

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.visible = true;

        this.backgroundColor = [1, 1, 1];
        this.opacity = 1;

        this.update = function(delta) {
            if(!this.visible) return;
            ctx.fillStyle = `rgb(${this.backgroundColor[0]}, ${this.backgroundColor[1]}, ${this.backgroundColor[2]})`;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(this.parent.x + this.x, this.parent.y + this.y, this.width, this.height);
            ctx.fillStyle = "";
            ctx.globalAlpha = 1;

            for(let i = 0; i < this.children.length; i ++) {
                var child = this.children[i];
                child.update(delta);
            }
        }

        parent.children.push(this);
    },

    TextLabel : function(parent) {
        this.parent = parent;
        this.children = [];

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.visible = true;

        this.backgroundColor = [1, 1, 1];
        this.opacity = 1;
        this.text = "";
        this.textColor = [0, 0, 0];
        this.fontFamily = "serif";
        this.fontSize = 0;

        this.update = function(delta) {
            if(!this.visible) return;
            ctx.fillStyle = `rgb(${this.backgroundColor[0]}, ${this.backgroundColor[1]}, ${this.backgroundColor[2]})`;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(this.parent.x + this.x, this.parent.y + this.y, this.width, this.height);
            ctx.fillStyle = "";
            ctx.globalAlpha = 1;

            ctx.fillStyle = `rgb(${this.textColor[0]}, ${this.textColor[1]}, ${this.textColor[2]})`;
            //ctx.globalAlpha = this.opacity;
            ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            ctx.fillText(this.text, this.parent.x + this.x, (this.parent.y + this.y) + this.fontSize);
            ctx.fillStyle = "";
            ctx.font = "";

            for(let i = 0; i < this.children.length; i ++) {
                var child = this.children[i];
                child.update(delta);
            }
        }

        parent.children.push(this);
    }
}

let lastTime = 0;

function update(currentTime) {
    let delta = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;

    if(Game.currentScene && !Game.currentScene.paused) {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        Game.currentScene.Update(delta);

        for(let i = 0; i < Game.currentScene.UI.length; i ++) {
            var _UI = Game.currentScene.UI[i];
            if(_UI.enabled) {
                _UI.update(delta);
            }
        }
    }

    Game._rAF = requestAnimationFrame(update);
}
