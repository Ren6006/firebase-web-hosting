class PlayerCharacter {
  constructor(canvas, floorY) {
    this.canvas = canvas;
    this.floorY = floorY;
    this.shapes = [
      { x: 50, y: 50, width: 50, height: 50, name: "Main" },
      { x: 150, y: 150, width: 50, height: 50, name: "collectable" },
      { x: 250, y: 250, width: 50, height: 50, name: "collectable" },
    ];

    this.keyState = {};

    this.characterVelocityX = 0;
    this.characterVelocityY = 0;
    this.characterSpeed = 3;
    this.characterJumpStrength = 7;
    this.characterDoubleJump = false;
    this.isCharacterOnGround = false;
    this.isCharacterJumping = false;

    this.dashAvailable = true;
    this.dashDuration = 0.2;
    this.dashTimer = 0;
    this.isDashing = false;

    this.afterimages = [];
    this.afterimageOpacity = 0.5;
    this.afterimageSize = 40;
    this.afterimageFrequency = 1;
    this.afterimageCounter = 0;

    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  createAfterimage() {
    const mainCharacter = this.shapes[0];
    const afterimage = {
      x: mainCharacter.x,
      y: mainCharacter.y + 20,
      size: this.afterimageSize,
      opacity: this.afterimageOpacity,
    };
    this.afterimages.push(afterimage);
  }

  updateAfterimages() {
    this.afterimages.forEach((afterimage) => {
      afterimage.size += 1;
      afterimage.opacity -= 0.01;
      if (afterimage.opacity <= 0) {
        this.afterimages.splice(this.afterimages.indexOf(afterimage), 1);
      }
    });
  }

  applyGravity() {
    if (!this.isCharacterOnGround) {
      this.characterVelocityY += 0.2;
    }
  }

  handleKeyDown(e) {
    this.keyState[e.key] = true;

    if (e.key === "ArrowRight" && !this.keyState["ArrowLeft"]) {
      this.characterVelocityX = this.characterSpeed;
    } else if (e.key === "ArrowLeft" && !this.keyState["ArrowRight"]) {
      this.characterVelocityX = -this.characterSpeed;
    }

    if (e.key === "ArrowUp") {
      if (this.isCharacterOnGround) {
        this.characterVelocityY = -this.characterJumpStrength;
        this.isCharacterJumping = true;
        this.isCharacterOnGround = false;
      } else if (this.characterDoubleJump) {
        this.characterVelocityY = -this.characterJumpStrength;
        this.characterDoubleJump = false;
      } else if (
        (this.keyState["ArrowRight"] || this.keyState["ArrowLeft"]) &&
        !this.isDashing &&
        this.dashAvailable
      ) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashAvailable = false;
        this.characterVelocityX =
          this.characterSpeed * (this.keyState["ArrowRight"] ? 10 : -10);
        this.isCharacterOnGround = false;
      }
    }
  }

  handleKeyUp(e) {
    this.keyState[e.key] = false;

    // Check for arrow key states and set velocity accordingly
    if (this.keyState["ArrowRight"] && !this.keyState["ArrowLeft"]) {
      this.characterVelocityX = this.characterSpeed;
    } else if (this.keyState["ArrowLeft"] && !this.keyState["ArrowRight"]) {
      this.characterVelocityX = -this.characterSpeed;
    } else {
      this.characterVelocityX = 0;
    }
  }
}

class Main {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.score = 0;
    this.floorY = this.canvas.height * (2 / 3);
    this.player = new PlayerCharacter(this.canvas, this.floorY);

    document.addEventListener("keydown", (e) => this.player.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.player.handleKeyUp(e));

    this.update();
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.floorY);
    this.ctx.lineTo(this.canvas.width, this.floorY);
    this.ctx.stroke();

    for (const shape of this.player.shapes) {
      this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
    }
  }

  update() {
    this.redraw();

    if (this.player.isDashing) {
      this.player.dashTimer -= 1 / 60;
      if (this.player.dashTimer <= 0 || !this.player.keyState["ArrowUp"]) {
        this.player.isDashing = false;
        this.player.characterVelocityX =
          this.player.characterSpeed *
          (this.player.keyState["ArrowRight"]
            ? 1
            : this.player.keyState["ArrowLeft"]
            ? -1
            : 0);
      }
      this.player.afterimageCounter++;

      if (
        this.player.afterimageCounter % this.player.afterimageFrequency ===
        0
      ) {
        this.player.createAfterimage();
      }
    }

    this.player.updateAfterimages();
    this.renderAfterimages();

    this.player.shapes[0].x += this.player.characterVelocityX;
    this.player.shapes[0].y += this.player.characterVelocityY;

    this.player.applyGravity();

    if (this.player.shapes[0].y + this.player.shapes[0].height >= this.floorY) {
      this.player.shapes[0].y = this.floorY - this.player.shapes[0].height;
      this.player.isCharacterOnGround = true;
      this.player.characterDoubleJump = true;
      this.player.characterVelocityY = 0;
      this.player.isCharacterJumping = false;
      this.player.dashAvailable = true;
    }

    for (let i = 1; i < this.player.shapes.length; i++) {
      if (this.checkCollision(this.player.shapes[0], this.player.shapes[i])) {
        console.log(
          "Collision detected between main character and collectible " + i
        );
        this.score++;
        this.player.shapes.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.update());
  }

  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }
  renderAfterimages() {
    this.ctx.globalAlpha = 1; // Reset globalAlpha

    this.player.afterimages.forEach((afterimage) => {
      this.ctx.globalAlpha = afterimage.opacity;
      this.ctx.fillStyle = "black"; // Black squares
      this.ctx.fillRect(
        afterimage.x - afterimage.size / 2,
        afterimage.y - afterimage.size / 2,
        afterimage.size,
        afterimage.size
      );
      this.ctx.globalAlpha = 1;
    });
  }
}

// Initialize the game
document.myGame = new Main();

// Log the score once every second
setInterval(() => console.log(document.myGame.score), 1000);
