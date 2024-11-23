// TERMINAL TEXT ANIMATION
const terminalOutput = document.getElementById("terminal-output");

const commands = [
  "Welcome to the Matrx Terminal...",
  "Initializing Matrix animation...",
  "Loading GSAP effects...",
  "Connecting to host server...",
  "System ready! 🎉",
  "",
  "",
  "You wanna discover more stunning website animations?",
  "",
  "For more information...",
  "",
  "Visit -> https://swissmarley.github.io/web"
];

let commandIndex = 0;
let charIndex = 0;

function typeCommand() {
  if (commandIndex < commands.length) {
    const currentCommand = commands[commandIndex];
    if (charIndex < currentCommand.length) {
      terminalOutput.textContent += currentCommand[charIndex];
      charIndex++;
      setTimeout(typeCommand, 50);
    } else {
      terminalOutput.textContent += "\n";
      charIndex = 0;
      commandIndex++;
      setTimeout(typeCommand, 500);
    }
  } else {
    setTimeout(() => {
      terminalOutput.textContent = "";
      commandIndex = 0;
      charIndex = 0;
      typeCommand();
    }, 4000);
  }
}

typeCommand();

// MATRIX BACKGROUND ANIMATION
const canvas = document.getElementById("matrix-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const matrixCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
const fontSize = 16;
const columns = canvas.width / fontSize;

const drops = Array.from({ length: columns }).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff00";
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, x) => {
    const text = matrixCharacters.charAt(Math.floor(Math.random() * matrixCharacters.length));
    ctx.fillText(text, x * fontSize, y * fontSize);

    if (y * fontSize > canvas.height && Math.random() > 0.975) {
      drops[x] = 0;
    }

    drops[x]++;
  });

  requestAnimationFrame(drawMatrix);
}

drawMatrix();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
