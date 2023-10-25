class Main {
  constructor() {
    this.pageViewsKey = "pageViewsCount";
    this.initializeCounter();
    this.displayCount();

    this.heldElement = null;

    // Add event listeners to all elements with the class "page-section"
    const sections = document.querySelectorAll(".page-section");
    sections.forEach((section) => {
      section.addEventListener("mousedown", this.hideElement.bind(this));
    });

    // Add a global mouseup event listener to make sure the element reappears when you release the mouse button anywhere on the page.
    document.addEventListener("mouseup", this.showElement.bind(this));

    // Prevent click and hold behavior on links and buttons
    const linksAndButtons = document.querySelectorAll("a, button");
    linksAndButtons.forEach((element) => {
      element.addEventListener("mousedown", (event) => event.stopPropagation());
    });

    this.setupGameButton();
  }

  initializeCounter() {
    if (!localStorage.getItem(this.pageViewsKey)) {
      localStorage.setItem(this.pageViewsKey, "0");
    }
  }

  incrementCount() {
    let currentCount = parseInt(localStorage.getItem(this.pageViewsKey));
    currentCount++;
    localStorage.setItem(this.pageViewsKey, currentCount.toString());
  }

  displayCount() {
    this.incrementCount();
    // Update count in div id count
    document.getElementById("count").innerHTML =
      "You have visited this page " +
      localStorage.getItem(this.pageViewsKey) +
      " times.";
  }

  hideElement(event) {
    const target = event.target;

    // Check if the clicked element is not a link (a) or a button
    if (target.tagName !== "A" && target.tagName !== "BUTTON") {
      // Hide the element that triggered the mousedown event
      target.style.display = "none";
      this.heldElement = target;
    }
  }

  showElement(event) {
    // Check if there's a held element, and show it.
    if (this.heldElement) {
      this.heldElement.style.display = "block";
      this.heldElement = null;
    }
  }
  
  setupGameButton() {
    const gameButton = document.getElementById("gameButton");
    if (gameButton) {
      gameButton.addEventListener("click", () => {
        window.location.href = "game.html"; // Redirect to game.html when the button is clicked
      });
    }
  }
}

// Note that we construct the class here, but we don't need to assign it to a variable.
document.mainClass = new Main();
