import React, { useMemo } from 'react';

const WrappedTypography: React.FC = () => {
  const srcDoc = useMemo(() => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
    body { display: grid; place-items: center; }
    canvas { display: block; width: 100% !important; height: 100% !important; }
  </style>
</head>
<body>
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/p5.min.js"></script>
<script>
let rotX = 0;
let rotY = 0;
let targetRotX = 0;
let targetRotY = 0;
let autoTime = 0;

function setup() {
  createCanvas(900, 600, WEBGL);
  pixelDensity(1);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  describe('Experimento de tipografia 3D deformada e interativa.');
}

function draw() {
  background(0);

  targetRotY = map(mouseX, 0, width, -0.45, 0.45);
  targetRotX = map(mouseY, 0, height, 0.30, -0.30);

  rotX = lerp(rotX, targetRotX, 0.06);
  rotY = lerp(rotY, targetRotY, 0.06);
  autoTime += 0.008;

  ambientLight(80);
  directionalLight(255, 255, 255, -0.4, -0.5, -1);

  push();
  rotateX(rotX);
  rotateY(rotY);
  rotateZ(sin(autoTime) * 0.025);

  drawBlob();
  drawWrappedTypography();

  pop();
}

function drawBlob() {
  push();
  noStroke();
  fill(20, 130, 255);
  beginShape();

  const points = 80;

  for (let i = 0; i < points; i++) {
    const angle = map(i, 0, points, 0, TWO_PI);
    const wave1 = sin(angle * 3) * 55;
    const wave2 = cos(angle * 5) * 25;
    const wave3 = sin(angle * 7 + autoTime) * 15;
    const radius = 220 + wave1 + wave2 + wave3;

    const x = cos(angle) * radius;
    const y = sin(angle) * radius * 0.68;
    const z = sin(angle * 4 + autoTime) * 35;

    vertex(x, y, z);
  }

  endShape(CLOSE);
  pop();
}

function drawWrappedTypography() {
  const textContent = 'ANA BOCHENEK  •  PORTFÓLIO  •  ';

  textSize(92);
  fill(255);
  noStroke();

  for (let row = -4; row <= 4; row++) {
    push();

    const baseY = row * 82;
    const curve = sin(row * 0.7 + autoTime) * 35;
    const depth = 40 + abs(row) * 8;

    translate(curve, baseY, depth);
    rotateZ(row * 0.055);

    scale(
      1 + abs(row) * 0.035,
      1 + sin(autoTime + row) * 0.025
    );

    for (let i = -2; i <= 2; i++) {
      push();

      const offsetX = i * 470;
      const offsetZ = -abs(i) * 20;

      translate(offsetX, 0, offsetZ);
      rotateY(sin(i * 0.7 + row * 0.3) * 0.12);
      text(textContent, 0, 0);

      pop();
    }

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
</script>
</body>
</html>`, []);

  return (
    <section
      className="my-12 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-black"
      aria-label="Experimento de tipografia 3D interativa"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black text-white">
        <span className="text-xs font-bold uppercase tracking-[0.2em]">
          Wrapped Typography / 3D
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">
          mova o mouse
        </span>
      </div>

      <div className="w-full h-[420px] md:h-[560px]">
        <iframe
          title="Experimento de tipografia 3D"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default WrappedTypography;
