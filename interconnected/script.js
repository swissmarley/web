// Initialize Particles.js with colored effects and smaller, colorful particles
particlesJS('particles-js', {
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: ['#FF6F61', '#6B5B95', '#88B04B', '#92A8D1', '#FFB6B9']
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        },
        polygon: {
          nb_sides: 5
        }
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 40,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        },
        onclick: {
          enable: true,
          mode: "push"
        }
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        }
      }
    },
    retina_detect: true
  });
  
// Typewriter Effect with Reset After 5 Seconds
const typewriteElement = document.querySelector('.typewrite');
let typewriterText = "Isn't this amazing? What you can do with CSS and Javascript!";
let i = 0;
let speed = 100;

function typewriterEffect() {
  if (i < typewriterText.length) {
    typewriteElement.innerHTML = typewriterText.substring(0, i) + "<span class='cursor'>|</span>"; 
    i++; 
  } else if (i === typewriterText.length) {
    typewriteElement.innerHTML = typewriterText + "<span class='cursor'>|</span>"; 
    clearInterval(typewriterInterval); 
    setTimeout(resetTypewriter, 5000); 
  }
}

function resetTypewriter() {
  i = 0;
  typewriteElement.innerHTML = ""; 
  typewriterInterval = setInterval(typewriterEffect, speed); 
}

let typewriterInterval = setInterval(typewriterEffect, speed);
