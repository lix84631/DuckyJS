# TBJS

<details>
  <summary>Dont Laugh</summary>
  It stands for Tennis Ball JS because I really like tennis, and the sprite I defaulted to for testing was always the tennis ball png.
</details>

TBJS is a 2D game engine I made for HTML canvas. It's my first time making something like this, so don't expect much. It's designed to feel simple and approachable for beginners, especially people advancing from Scratch-style logic.

## Here's a short tutorial on how to use the engine, and make a simple game!

- Step 1: Create a new Scene

  You can do this with the ```Scene()``` class.

  ```JavaScript
  var scene1 = new Scene();
  Game.SetScene(scene1);
  ```
- Step 2: Update Loop

  Update loops are Scene oriented, so each Scene has it's own update loop. The parameter for ```Update(delta)``` is always, and only ```delta```.

  ```JavaScript
  scene1.Update = function(delta) {
    
  }
  ```
- Step 3: Game Objects

  The ```GameObject()``` class is what is used to put new objects into your scene.\
  Each game object has an ```x```, ```y```, ```width```, and ```height``` property, that tell the canvas where, and how big to draw them. The parameter is the scene you want the game object to be native to. Trying to change the scene after initializing the game object will break your game.

  Outside the update loop, you can set the defaults for the game object.
  ```JavaScript
  var tennisBall = new GameObject(scene1);
  tennisBall.x = 100;
  tennisBall.y = 425;
  tennisBall.width = 50;
  tennisBall.height = 50;
  ```
  It is also important that your game object has a sprite, unless you want it to be something like a hitbox. JavaScript has a built in tool that lets us do this, using ```Image()```.

  ```JavaScript
  var tennisBallSprite = new Image();
  tennisBallSprite.src = "/sprites/sports/tennis_ball.png";
  ```
  Inside the update loop, you can make your game object appear by calling the ```draw(sprite, opacity, flipX, flipY)``` function.

  ```JavaScript
  scene1.Update = function(delta) {
    tennisBall.draw(tennisBallSprite);
  }
  ```
- Step 4: User Input

  Our ball seems bored, so lets add some keyboard movement!\
  This is possible by using the ```Game.KeyDown(key)``` function, with ```key``` being ```event.key```, which will return either ```true``` or ```false```.

  ```JavaScript
  var tennisBallSpeed = 100;
  
  scene1.Update = function(delta) {
    if(Game.KeyDown("a")) {
        tennisBall.x -= tennisBallSpeed * delta;
    }
    if(Game.KeyDown("d")) {
        tennisBall.x += tennisBallSpeed * delta;
    }
  
    tennisBall.draw(tennisBallSprite);
  }
  ```
- Step 5: Falling Basketballs

  The game should have an objective. Collect basketballs! \
  First, there should be a function that creates a basketball, and adds it to a list of basketballs.

  ```JavaScript
  var basketballs = [];
  
  var basketballSpeed = 100;
  
  var basketballSprite = new Image();
  basketballSprite.src = "/sprites/sports/basketball.png";
  
  function spawnBasketball() {
      var basketball = new GameObject(scene1);
      basketball.x = Math.random() * 475;
      basketball.y = 0;
      basketball.width = 25;
      basketball.height = 25;
  
      basketballs.push(basketball);
  }
  ```

  Then, inside your update loop, you should loop through each basketball, move them down, then check if they are colliding with the tennis ball. This is possible using ```Game.CheckCollision(GOA, GOB)```. This function uses AABB collision detection, and will return either true or false. If true is returned, then use the ```GameObject.destroy()``` function to remove it from the scene. Then, remove it from the list of basketballs. To spawn another basketball, you can just use the ```spawnBasketball()``` function again when the tennis ball collides with it.

  ```JavaScript
  scene1.Update = function(delta) {
    if(Game.KeyDown("a")) {
        tennisBall.x -= tennisBallSpeed * delta;
    }
    if(Game.KeyDown("d")) {
        tennisBall.x += tennisBallSpeed * delta;
    }

    for(let i = 0; i < basketballs.length; i ++) {
        basketballs[i].y += basketballSpeed * delta;
        basketballs[i].draw(basketballSprite);
        
        if(Game.CheckCollision(tennisBall, basketballs[i]) && basketballs.includes(basketballs[i])) {
            basketballs[i].destroy();
            basketballs.splice(i, 1);

            spawnBasketball();
        }
    }

    tennisBall.draw(tennisBallSprite);
  }
  ```

  Last but not least, the game needs to be started. This can be done with the ```Game.Start()``` function. Because the game also needs a basketball to begin with, ```spawnBasketball``` needs to be called as well. Put these two functions at the very end of the script.

  ```JavaScript
  spawnBasketball();
  Game.Start();
  ```

  And there you have it! Your first game using TBJS!

<details> <summary>Full Code</summary>
  
  ```JavaScript
  var scene1 = new Scene();
  Game.SetScene(scene1);
  
  var tennisBall = new GameObject(scene1);
  tennisBall.x = 100;
  tennisBall.y = 425;
  tennisBall.width = 50;
  tennisBall.height = 50;
  
  var tennisBallSprite = new Image();
  tennisBallSprite.src = "/sprites/sports/tennis_ball.png";
  
  var tennisBallSpeed = 100;
  
  var basketballs = [];
  
  var basketballSpeed = 100;
  
  var basketballSprite = new Image();
  basketballSprite.src = "/sprites/sports/basketball.png";
  
  function spawnBasketball() {
      var basketball = new GameObject(scene1);
      basketball.x = Math.random() * 475;
      basketball.y = 0;
      basketball.width = 25;
      basketball.height = 25;
  
      basketballs.push(basketball);
  }
  
  scene1.Update = function(delta) {
      if(Game.KeyDown("a")) {
          tennisBall.x -= tennisBallSpeed * delta;
      }
      if(Game.KeyDown("d")) {
          tennisBall.x += tennisBallSpeed * delta;
      }
  
      for(let i = 0; i < basketballs.length; i ++) {
          basketballs[i].y += basketballSpeed * delta;
          basketballs[i].draw(basketballSprite);
  
          if(Game.CheckCollision(tennisBall, basketballs[i]) && basketballs.includes(basketballs[i])) {
              basketballs[i].destroy();
              basketballs.splice(i, 1);
  
              spawnBasketball();
          }
      }
  
      tennisBall.draw(tennisBallSprite);
  }
  
  spawnBasketball();
  Game.Start();
  ```
</details>
