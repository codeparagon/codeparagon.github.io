(function () {
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const envelope = document.getElementById("envelope");
  const letterBody = document.getElementById("letter-body");
  const letterCard = document.querySelector(".letter-card");
  const noBtn = document.getElementById("btn-no");
  const yesBtn = document.getElementById("btn-yes");
  const noTease = document.getElementById("no-tease");
  const canvas = document.getElementById("petals");
  const ctx = canvas.getContext("2d");

  const letterText =
    "If I could write this in the stars, I would.\n" +
    "If I could hide it inside a thousand roses, I would.\n\n" +
    "Tonight I have only this page — and my whole heart.\n\n" +
    "Your name means rare. And that is exactly what you are to me: the quiet miracle I was searching for without knowing how to ask.\n\n" +
    "I choose you. Not for a day. Not for a season. For every prayer, every winter, every tomorrow I am given.\n\n" +
    "Nayab… will you let me spend my life loving you?";

  const noLines = [
    "That button is shy. Try the other one.",
    "My heart already knows your answer.",
    "Nayab… even the moon is waiting.",
    "I will ask a thousand times if I must.",
    "There is only one right forever. It is yes."
  ];

  let noTries = 0;
  let petals = [];
  let celebrating = false;

  function showScene(id) {
    scenes.forEach((scene) => {
      scene.classList.toggle("active", scene.id === id);
    });
  }

  function typeLetter(text, i = 0) {
    if (i === 0) letterBody.innerHTML = "";
    if (i < text.length) {
      letterBody.textContent = text.slice(0, i + 1);
      const cursor = document.createElement("span");
      cursor.className = "cursor";
      letterBody.appendChild(cursor);
      const delay = text[i] === "\n" ? 42 : 22 + Math.random() * 18;
      setTimeout(() => typeLetter(text, i + 1), delay);
    } else {
      letterCard.classList.add("ready");
    }
  }

  function moveNoButton() {
    const parent = noBtn.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const pad = 8;
    const maxX = Math.max(pad, parentRect.width - btnRect.width - pad);
    const maxY = Math.max(pad, 90);
    const x = Math.random() * maxX - maxX / 2;
    const y = Math.random() * maxY - 20;
    noBtn.style.position = "relative";
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
    noBtn.style.transform = "rotate(" + (Math.random() * 18 - 9) + "deg)";
  }

  function handleNo() {
    noTries += 1;
    noTease.hidden = false;
    noTease.textContent = noLines[Math.min(noTries - 1, noLines.length - 1)];
    moveNoButton();
    yesBtn.style.transform = "scale(" + (1 + Math.min(noTries, 6) * 0.08) + ")";
    if (noTries >= 6) {
      noBtn.style.display = "none";
      noTease.textContent = "Your heart already said yes.";
    }
  }

  function celebrate() {
    celebrating = true;
    document.body.classList.add("celebrate");
    showScene("scene-yes");
    burst(80);
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnPetal(burstMode) {
    const colors = ["#8b2942", "#c45c74", "#d4af37", "#e8c4c8", "#6b1d32"];
    return {
      x: Math.random() * canvas.width,
      y: burstMode ? canvas.height * 0.35 + Math.random() * 80 : -20,
      r: 5 + Math.random() * 8,
      vy: burstMode ? -(2 + Math.random() * 4) : 0.6 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * (burstMode ? 6 : 1.2),
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.04,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: burstMode ? 1 : 1
    };
  }

  function burst(count) {
    for (let i = 0; i < count; i += 1) petals.push(spawnPetal(true));
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(p.r, -p.r, p.r * 1.6, p.r * 0.2, 0, p.r * 1.6);
    ctx.bezierCurveTo(-p.r * 1.6, p.r * 0.2, -p.r, -p.r, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (petals.length < (celebrating ? 90 : 28) && Math.random() < 0.35) {
      petals.push(spawnPetal(false));
    }
    petals.forEach((p) => {
      p.x += p.vx + Math.sin(p.rot) * 0.3;
      p.y += p.vy;
      p.vy += celebrating ? 0.04 : 0.01;
      p.rot += p.vr;
      drawPetal(p);
    });
    petals = petals.filter((p) => p.y < canvas.height + 40);
    requestAnimationFrame(tick);
  }

  document.getElementById("btn-begin").addEventListener("click", () => {
    showScene("scene-envelope");
  });

  document.getElementById("btn-seal").addEventListener("click", () => {
    envelope.classList.add("open");
    setTimeout(() => {
      showScene("scene-letter");
      typeLetter(letterText);
    }, 1100);
  });

  document.getElementById("btn-after-letter").addEventListener("click", () => {
    showScene("scene-verses");
  });

  document.getElementById("btn-to-question").addEventListener("click", () => {
    showScene("scene-question");
  });

  yesBtn.addEventListener("click", celebrate);
  noBtn.addEventListener("click", handleNo);
  noBtn.addEventListener("mouseenter", handleNo);

  window.addEventListener("resize", resize);
  resize();
  tick();
})();
