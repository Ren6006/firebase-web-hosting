class ClickBoxGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.score = 0;
    this.boxSize = 50;
    this.boxX = Math.random() * (this.canvas.width - this.boxSize);
    this.boxY = Math.random() * (this.canvas.height - this.boxSize);
    this.timeRemaining = 10;

    this.canvas.addEventListener("click", this.handleClick.bind(this));
    this.interval = setInterval(this.countdown.bind(this), 1000);
    this.drawBox();

    // Firebase initialization (please replace with your config)
    const firebaseConfig = {
      apiKey: "AIzaSyDrX5FQndf59mDVq50ySgaEcN64bk1l7Ps",
      authDomain: "darren-yilmaz.firebaseapp.com",
      projectId: "darren-yilmaz",
      storageBucket: "darren-yilmaz.appspot.com",
      messagingSenderId: "398112851477",
      appId: "1:398112851477:web:542651a57813e1ab47b01c",
      measurementId: "G-TDN1Q2XEJ9",
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);

    // Initialize Cloud Firestore and get a reference to the service
    this.db = app.firestore(app);
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (
      x >= this.boxX &&
      x <= this.boxX + this.boxSize &&
      y >= this.boxY &&
      y <= this.boxY + this.boxSize
    ) {
      this.score++;
      document.getElementById("score").innerText = "Score: " + this.score;
      this.moveBox();
    }
  }

  moveBox() {
    this.boxX = Math.random() * (this.canvas.width - this.boxSize);
    this.boxY = Math.random() * (this.canvas.height - this.boxSize);
    this.drawBox();
  }

  drawBox() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(this.boxX, this.boxY, this.boxSize, this.boxSize);
  }

  countdown() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;
      document.getElementById("timeRemaining").innerText =
        "Time Remaining: " + this.timeRemaining + "s";
    } else {
      clearInterval(this.interval);
      alert("Time is up! Your score is: " + this.score);
      this.saveScore("userNameOrIP", this.score);
      this.updateScoreList();
    }
  }

  // Save the user's score to Firestore
  saveScore(userOrUserIP, score) {
    if (score > 0) {
      console.log(
        "save score:  TODO grab userOrUserIP: " + userOrUserIP + " " + score
      );
      this.db
        .collection("scores")
        .add({
          user: userOrUserIP,
          score: score,
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }
  }

  // Update the score list from Firestore
  updateScoreList() {
    this.db
      .collection("scores")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.data().score}`);
        });
      });
  }

  startGame() {
    this.score = 0;
    this.timeRemaining = 10;
    document.getElementById("score").innerText = "Score: 0";
    document.getElementById("timeRemaining").innerText = "Time Remaining: 10s";
    this.interval = setInterval(this.countdown.bind(this), 1000);
    this.drawBox();
    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  resetGame() {
    clearInterval(this.interval);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.score = 0;
    this.timeRemaining = 10;
    document.getElementById("score").innerText = "Score: 0";
    document.getElementById("timeRemaining").innerText = "Time Remaining: 10s";
    this.canvas.removeEventListener("click", this.handleClick.bind(this));
  }
}

const game = new ClickBoxGame();

document
  .getElementById("startButton")
  .addEventListener("click", () => game.startGame());
document
  .getElementById("resetButton")
  .addEventListener("click", () => game.resetGame());
