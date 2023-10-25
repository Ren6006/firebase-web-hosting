class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.score = 0;

    // Define the shapes (example rectangles here)
    this.shapes = [
      { x: 50, y: 50, width: 50, height: 50, name: "Main" },
      { x: 150, y: 150, width: 50, height: 50, name: "collectable" },
      { x: 250, y: 250, width: 50, height: 50, name: "collectable" },
    ];

    // Gravity parameters
    this.gravity = 0.2; // Adjust gravity to suit your game
    this.floorY = this.canvas.height * (2 / 3);

    // Character movement parameters
    this.characterVelocityX = 0;
    this.characterVelocityY = 0;
    this.characterSpeed = 3; // Horizontal speed
    this.characterJumpStrength = 7; // Strength of the jump
    this.characterDoubleJump = false; // Whether double jump is allowed
    // Dash Parameters
    this.dashAvailable = true; // Flag to allow dashing
    this.dashDuration = 0.2; // Duration of the dash in seconds
    this.dashTimer = 0; // Timer to track the dash duration
    this.isDashing = false; // Flag to track whether the character is dashing

    // Jumping states
    this.isCharacterOnGround = false;
    this.isCharacterJumping = false;

    // Draw the floor
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.floorY);
    this.ctx.lineTo(this.canvas.width, this.floorY);
    this.ctx.stroke();

    // Handle keyboard input for movement and jumping
    this.keysPressed = {};
    this.keyState = {};
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));

    // Afterimage parameters
    this.afterimages = [];
    this.afterimageOpacity = 0.5; // Customize opacity (0 to 1)
    this.afterimageSize = 40; // Customize afterimage size
    this.afterimageFrequency = 1; // Customize frequency (lower is more frequent)
    this.afterimageCounter = 0; // Initialize afterimage counter

    // Start game loop
    this.update();
  }

  redraw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the floor
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.floorY);
    this.ctx.lineTo(this.canvas.width, this.floorY);
    this.ctx.stroke();

    // Draw each shape
    for (const shape of this.shapes) {
      this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
    }
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
    console.log(this.afterimages);
  }

  updateAfterimages() {
    this.afterimages.forEach((afterimage) => {
      // Increase the size and reduce opacity
      afterimage.size += 1;
      afterimage.opacity -= 0.01;

      if (afterimage.opacity <= 0) {
        // Remove afterimages that have faded out
        this.afterimages.splice(this.afterimages.indexOf(afterimage), 1);
      }
    });
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
        this.isCharacterDoubleJump = false;
      } else if (
        (this.keyState["ArrowRight"] || this.keyState["ArrowLeft"]) &&
        !this.isDashing &&
        this.dashAvailable
      ) {
        // Start dashing and set the dash timer
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashAvailable = false; // Disable dashing until character touches the ground
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

  applyGravity() {
    if (!this.isCharacterOnGround) {
      this.characterVelocityY += this.gravity;
    }
  }

  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  update() {
    this.redraw();

    // Decrement the dash timer
    if (this.isDashing) {
      this.dashTimer -= 1 / 60; // Assuming 60 frames per second
      if (this.dashTimer <= 0 || !this.keyState["ArrowUp"]) {
        this.isDashing = false;
        this.characterVelocityX =
          this.characterSpeed *
          (this.keyState["ArrowRight"]
            ? 1
            : this.keyState["ArrowLeft"]
            ? -1
            : 0);
      }
      this.afterimageCounter++; // Increment the afterimage counter

      if (this.afterimageCounter % this.afterimageFrequency === 0) {
        this.createAfterimage();
      }
    }
    // Update and render afterimages
    this.updateAfterimages();
    this.renderAfterimages();

    // Apply character velocity for movement
    this.shapes[0].x += this.characterVelocityX;
    this.shapes[0].y += this.characterVelocityY;

    // Apply gravity to the main character
    this.applyGravity();

    // Collision check with the floor
    if (this.shapes[0].y + this.shapes[0].height >= this.floorY) {
      this.shapes[0].y = this.floorY - this.shapes[0].height;
      this.isCharacterOnGround = true;
      this.isCharacterDoubleJump = true;
      this.characterVelocityY = 0;
      this.isCharacterJumping = false;
      this.dashAvailable = true;
    }

    // Example collision check between the main character and the collectibles
    for (let i = 1; i < this.shapes.length; i++) {
      if (this.checkCollision(this.shapes[0], this.shapes[i])) {
        console.log(
          "Collision detected between main character and collectible " + i
        );

        // Increase the score
        this.score++;

        // Remove the collectible from the array
        this.shapes.splice(i, 1);
      }
    }

    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => this.update());
  }
  renderAfterimages() {
    this.ctx.globalAlpha = 1; // Reset globalAlpha

    this.afterimages.forEach((afterimage) => {
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
document.myGame = new Game();

// Log the score once every second
setInterval(() => console.log(document.myGame.score), 1000);
