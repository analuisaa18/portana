/**
 * Efeitos p5.js prontos para as camadas interativas do site.
 * Cada efeito é um sketch completo em "modo global" do p5.js. Os valores ajustáveis no
 * painel chegam na constante P. O botão "Converter em código" gera exatamente este texto,
 * que pode então ser editado livremente.
 *
 * Interações disponíveis em qualquer sketch (o site repassa os eventos para a camada):
 *  mouseX/mouseY, pmouseX/pmouseY, mouseIsPressed, mousePressed(), mouseReleased(),
 *  mouseDragged(), mouseClicked(), doubleClicked(), mouseWheel(e), keyPressed()/key,
 *  além de portfolio.scroll (0–1), portfolio.scrollY, portfolio.mouseDentro,
 *  portfolio.lugar e portfolio.celular.
 */
import { P5ParamValue } from '../types/portfolio';

export type P5ParamDef =
  | { key: string; label: string; type: 'range'; min: number; max: number; step?: number; default: number }
  | { key: string; label: string; type: 'color'; default: string }
  | { key: string; label: string; type: 'colors'; default: string }
  | { key: string; label: string; type: 'toggle'; default: boolean }
  | { key: string; label: string; type: 'text'; default: string }
  | { key: string; label: string; type: 'select'; options: Array<{ value: string; label: string }>; default: string };

export interface P5Preset {
  id: string;
  name: string;
  description: string;
  /** Como a pessoa interage — mostrado no painel. */
  interactions: string[];
  params: P5ParamDef[];
  body: string;
}

/** Função de estrela de 4 pontas (✦), igual à da identidade visual. */
const STAR_FN = `
function estrela(x, y, r, giro) {
  push();
  translate(x, y);
  rotate(giro);
  beginShape();
  for (let i = 0; i < 8; i++) {
    const a = i * QUARTER_PI;
    const raio = i % 2 === 0 ? r : r * 0.28;
    vertex(cos(a) * raio, sin(a) * raio);
  }
  endShape(CLOSE);
  pop();
}

function listaDeCores(texto) {
  const cores = String(texto).split(',').map((c) => c.trim()).filter(Boolean);
  return cores.length ? cores : ['#ffffff'];
}
`;

const BASE_SETUP = `createCanvas(windowWidth, windowHeight);
  pixelDensity(min(2, displayDensity()));`;

export const P5_PRESETS: P5Preset[] = [
  {
    id: 'estrelas',
    name: 'Estrelas flutuantes',
    description: 'Estrelas ✦ da identidade flutuando, piscando e reagindo ao mouse.',
    interactions: ['Mouse/toque afasta ou atrai', 'Clique cria estrelas', 'Rolagem da página move as estrelas'],
    params: [
      { key: 'quantidade', label: 'Quantidade', type: 'range', min: 3, max: 160, default: 26 },
      { key: 'tamanhoMin', label: 'Tamanho mínimo', type: 'range', min: 3, max: 40, default: 8 },
      { key: 'tamanhoMax', label: 'Tamanho máximo', type: 'range', min: 6, max: 90, default: 24 },
      { key: 'cores', label: 'Cores', type: 'colors', default: '#ffffff,#090909,#ec83aa' },
      { key: 'velocidade', label: 'Velocidade da flutuação', type: 'range', min: 0, max: 4, step: 0.1, default: 0.8 },
      { key: 'interacao', label: 'Reação ao mouse', type: 'select', default: 'fugir', options: [
        { value: 'fugir', label: 'Fogem do mouse' }, { value: 'atrair', label: 'São atraídas' }, { value: 'girar', label: 'Giram ao passar' }, { value: 'nenhuma', label: 'Nenhuma' } ] },
      { key: 'raio', label: 'Alcance do mouse (px)', type: 'range', min: 30, max: 400, default: 150 },
      { key: 'brilho', label: 'Piscar', type: 'toggle', default: true },
      { key: 'cliqueCria', label: 'Clique cria estrelas', type: 'toggle', default: true },
      { key: 'rolagem', label: 'Mover com a rolagem (parallax)', type: 'toggle', default: true },
    ],
    body: `${STAR_FN}
let estrelas = [];
let cores = [];

function setup() {
  ${BASE_SETUP}
  noStroke();
  cores = listaDeCores(P.cores);
  for (let i = 0; i < P.quantidade; i++) estrelas.push(novaEstrela(random(width), random(height), Infinity));
}

function novaEstrela(x, y, vida) {
  return {
    x, y, baseX: x, baseY: y,
    r: random(P.tamanhoMin, max(P.tamanhoMin, P.tamanhoMax)),
    giro: random(TWO_PI), vGiro: random(-0.01, 0.01),
    semente: random(1000), cor: random(cores),
    vx: vida === Infinity ? 0 : random(-6, 6), vy: vida === Infinity ? 0 : random(-6, 2),
    vida,
  };
}

function draw() {
  clear();
  const t = frameCount * 0.004 * P.velocidade;
  const desloc = P.rolagem ? portfolio.scrollY * 0.2 : 0;

  for (let i = estrelas.length - 1; i >= 0; i--) {
    const e = estrelas[i];
    if (e.vida !== Infinity) {
      // estrelas criadas pelo clique: caem e somem
      e.vy += 0.12; e.x += e.vx; e.y += e.vy; e.vida--;
      if (e.vida <= 0) { estrelas.splice(i, 1); continue; }
    } else {
      const profundidade = e.r / P.tamanhoMax;
      let alvoY = e.baseY - desloc * profundidade;
      alvoY = ((alvoY % height) + height) % height;
      const alvoX = e.baseX + (noise(e.semente, t) - 0.5) * 80;
      alvoY += (noise(e.semente + 99, t) - 0.5) * 80;

      if (portfolio.mouseDentro && P.interacao !== 'nenhuma') {
        const d = dist(mouseX, mouseY, e.x, e.y);
        if (d < P.raio && d > 0.1) {
          const forca = (1 - d / P.raio) * 3;
          const ang = atan2(e.y - mouseY, e.x - mouseX);
          if (P.interacao === 'fugir') { e.vx += cos(ang) * forca; e.vy += sin(ang) * forca; }
          if (P.interacao === 'atrair') { e.vx -= cos(ang) * forca * 0.5; e.vy -= sin(ang) * forca * 0.5; }
          if (P.interacao === 'girar') e.vGiro += 0.01 * forca;
        }
      }
      // "mola" que traz a estrela de volta para o lugar
      if (abs(e.y - alvoY) > height / 2) e.y = alvoY;
      e.vx += (alvoX - e.x) * 0.01; e.vy += (alvoY - e.y) * 0.01;
      e.vx *= 0.9; e.vy *= 0.9; e.vGiro *= 0.98;
      e.x += e.vx; e.y += e.vy;
    }
    e.giro += e.vGiro + 0.002 * P.velocidade;
    const c = color(e.cor);
    const alfa = P.brilho ? 150 + 105 * sin(frameCount * 0.04 + e.semente) : 255;
    c.setAlpha(e.vida === Infinity ? alfa : map(e.vida, 0, 90, 0, 255));
    fill(c);
    estrela(e.x, e.y, e.r, e.giro);
  }
}

function mousePressed() {
  if (!P.cliqueCria || !portfolio.mouseDentro) return;
  for (let i = 0; i < 10; i++) estrelas.push(novaEstrela(mouseX, mouseY, 90));
}
`,
  },
  {
    id: 'rastro',
    name: 'Rastro do cursor',
    description: 'Formas que seguem o mouse ou o dedo e desaparecem aos poucos.',
    interactions: ['Movimento do mouse/toque', 'Clique muda a forma'],
    params: [
      { key: 'forma', label: 'Forma', type: 'select', default: 'estrela', options: [
        { value: 'estrela', label: 'Estrela ✦' }, { value: 'circulo', label: 'Círculo' }, { value: 'quadrado', label: 'Quadrado' }, { value: 'texto', label: 'Texto' } ] },
      { key: 'texto', label: 'Texto (se a forma for texto)', type: 'text', default: 'design' },
      { key: 'corInicio', label: 'Cor inicial', type: 'color', default: '#ec83aa' },
      { key: 'corFim', label: 'Cor final', type: 'color', default: '#ffffff' },
      { key: 'tamanho', label: 'Tamanho', type: 'range', min: 4, max: 90, default: 22 },
      { key: 'duracao', label: 'Duração do rastro', type: 'range', min: 10, max: 240, default: 60 },
      { key: 'girar', label: 'Girar as formas', type: 'toggle', default: true },
      { key: 'cliqueTroca', label: 'Clique alterna a forma', type: 'toggle', default: true },
    ],
    body: `${STAR_FN}
let pontos = [];
let forma;
const FORMAS = ['estrela', 'circulo', 'quadrado', 'texto'];

function setup() {
  ${BASE_SETUP}
  noStroke();
  forma = P.forma;
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
}

function draw() {
  clear();
  const moveu = dist(mouseX, mouseY, pmouseX, pmouseY) > 1;
  if (portfolio.mouseDentro && moveu) {
    pontos.push({ x: mouseX, y: mouseY, idade: 0, giro: random(TWO_PI) });
  }
  const inicio = color(P.corInicio);
  const fim = color(P.corFim);
  for (let i = pontos.length - 1; i >= 0; i--) {
    const p = pontos[i];
    p.idade++;
    const k = p.idade / P.duracao;
    if (k >= 1) { pontos.splice(i, 1); continue; }
    const c = lerpColor(inicio, fim, k);
    c.setAlpha(255 * (1 - k));
    fill(c);
    const r = P.tamanho * (1 - k * 0.7);
    const giro = P.girar ? p.giro + p.idade * 0.05 : 0;
    if (forma === 'estrela') estrela(p.x, p.y, r, giro);
    else if (forma === 'circulo') circle(p.x, p.y, r * 2);
    else if (forma === 'quadrado') { push(); translate(p.x, p.y); rotate(giro); rectMode(CENTER); square(0, 0, r * 1.5); pop(); }
    else { textSize(r * 1.4); text(P.texto, p.x, p.y); }
  }
}

function mousePressed() {
  if (!P.cliqueTroca || !portfolio.mouseDentro) return;
  forma = FORMAS[(FORMAS.indexOf(forma) + 1) % FORMAS.length];
}
`,
  },
  {
    id: 'constelacao',
    name: 'Constelação',
    description: 'Pontos que se ligam por linhas quando estão perto, inclusive do mouse.',
    interactions: ['Mouse/toque puxa as ligações', 'Clique adiciona pontos', 'Roda do mouse muda a distância'],
    params: [
      { key: 'pontos', label: 'Quantidade de pontos', type: 'range', min: 10, max: 220, default: 70 },
      { key: 'corPonto', label: 'Cor dos pontos', type: 'color', default: '#ffffff' },
      { key: 'corLinha', label: 'Cor das linhas', type: 'color', default: '#ec83aa' },
      { key: 'tamanhoPonto', label: 'Tamanho dos pontos', type: 'range', min: 1, max: 12, default: 3 },
      { key: 'distancia', label: 'Distância de ligação', type: 'range', min: 40, max: 320, default: 130 },
      { key: 'velocidade', label: 'Velocidade', type: 'range', min: 0, max: 3, step: 0.1, default: 0.5 },
      { key: 'ligaMouse', label: 'Ligar ao mouse', type: 'toggle', default: true },
    ],
    body: `
let pts = [];
let alcance;

function setup() {
  ${BASE_SETUP}
  alcance = P.distancia;
  for (let i = 0; i < P.pontos; i++) pts.push(novoPonto(random(width), random(height)));
}

function novoPonto(x, y) {
  return { x, y, vx: random(-1, 1) * P.velocidade, vy: random(-1, 1) * P.velocidade };
}

function draw() {
  clear();
  const linha = color(P.corLinha);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    a.x += a.vx; a.y += a.vy;
    if (a.x < 0 || a.x > width) a.vx *= -1;
    if (a.y < 0 || a.y > height) a.vy *= -1;
    for (let j = i + 1; j < pts.length; j++) {
      const b = pts[j];
      const d = dist(a.x, a.y, b.x, b.y);
      if (d < alcance) { linha.setAlpha(255 * (1 - d / alcance)); stroke(linha); strokeWeight(1); line(a.x, a.y, b.x, b.y); }
    }
    if (P.ligaMouse && portfolio.mouseDentro) {
      const d = dist(a.x, a.y, mouseX, mouseY);
      if (d < alcance * 1.3) {
        linha.setAlpha(255 * (1 - d / (alcance * 1.3))); stroke(linha); strokeWeight(1.4); line(a.x, a.y, mouseX, mouseY);
        a.vx += (mouseX - a.x) * 0.00005; a.vy += (mouseY - a.y) * 0.00005;
      }
    }
  }
  noStroke(); fill(P.corPonto);
  for (const p of pts) circle(p.x, p.y, P.tamanhoPonto);
}

function mousePressed() {
  if (!portfolio.mouseDentro) return;
  for (let i = 0; i < 4; i++) pts.push(novoPonto(mouseX + random(-20, 20), mouseY + random(-20, 20)));
  if (pts.length > 400) pts.splice(0, pts.length - 400);
}

function mouseWheel(evento) {
  alcance = constrain(alcance - evento.delta * 0.1, 40, 400);
}
`,
  },
  {
    id: 'fluxo',
    name: 'Fluxo de linhas',
    description: 'Partículas desenham linhas seguindo um campo de ruído (Perlin) — o mouse cria redemoinhos.',
    interactions: ['Mouse/toque cria redemoinho', 'Clique sorteia novo desenho', 'Rolagem muda o fluxo'],
    params: [
      { key: 'particulas', label: 'Partículas', type: 'range', min: 50, max: 1500, step: 10, default: 450 },
      { key: 'cores', label: 'Cores', type: 'colors', default: '#090909,#ec83aa,#ffffff' },
      { key: 'escala', label: 'Escala do ruído', type: 'range', min: 0.001, max: 0.02, step: 0.001, default: 0.004 },
      { key: 'velocidade', label: 'Velocidade', type: 'range', min: 0.3, max: 5, step: 0.1, default: 1.6 },
      { key: 'rastro', label: 'Apagar rastro (0 = permanente)', type: 'range', min: 0, max: 60, default: 10 },
      { key: 'espessura', label: 'Espessura', type: 'range', min: 0.5, max: 6, step: 0.5, default: 1.5 },
      { key: 'redemoinho', label: 'Redemoinho no mouse', type: 'toggle', default: true },
    ],
    body: `${STAR_FN}
let ps = [];
let cores = [];
let semente;

function setup() {
  ${BASE_SETUP}
  cores = listaDeCores(P.cores);
  semente = random(10000);
  noiseSeed(semente);
  for (let i = 0; i < P.particulas; i++) ps.push({ x: random(width), y: random(height), cor: random(cores) });
}

function draw() {
  if (P.rastro > 0) { push(); erase(P.rastro, P.rastro); rect(0, 0, width, height); noErase(); pop(); }
  strokeWeight(P.espessura);
  const z = frameCount * 0.002 + portfolio.scroll * 3;
  for (const p of ps) {
    let ang = noise(p.x * P.escala, p.y * P.escala, z) * TWO_PI * 2;
    if (P.redemoinho && portfolio.mouseDentro) {
      const d = dist(p.x, p.y, mouseX, mouseY);
      if (d < 160) ang = atan2(p.y - mouseY, p.x - mouseX) + HALF_PI;
    }
    const nx = p.x + cos(ang) * P.velocidade;
    const ny = p.y + sin(ang) * P.velocidade;
    stroke(p.cor);
    line(p.x, p.y, nx, ny);
    p.x = nx; p.y = ny;
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) { p.x = random(width); p.y = random(height); }
  }
}

function mousePressed() {
  if (!portfolio.mouseDentro) return;
  noiseSeed(random(10000));
  clear();
}
`,
  },
  {
    id: 'explosao',
    name: 'Explosão de confete',
    description: 'Clique, toque ou tecle e solte uma explosão de estrelas/confetes com gravidade.',
    interactions: ['Clique/toque solta a explosão', 'Arrastar solta um rastro', 'Qualquer tecla explode em lugar aleatório'],
    params: [
      { key: 'forma', label: 'Forma', type: 'select', default: 'estrela', options: [
        { value: 'estrela', label: 'Estrela ✦' }, { value: 'confete', label: 'Confete' }, { value: 'circulo', label: 'Círculo' } ] },
      { key: 'cores', label: 'Cores', type: 'colors', default: '#ec83aa,#ffffff,#090909' },
      { key: 'quantidade', label: 'Peças por explosão', type: 'range', min: 5, max: 150, default: 40 },
      { key: 'forca', label: 'Força', type: 'range', min: 2, max: 20, default: 9 },
      { key: 'gravidade', label: 'Gravidade', type: 'range', min: 0, max: 0.8, step: 0.02, default: 0.18 },
      { key: 'tamanho', label: 'Tamanho', type: 'range', min: 3, max: 40, default: 12 },
      { key: 'teclado', label: 'Teclado também explode', type: 'toggle', default: true },
      { key: 'automatico', label: 'Explosões automáticas de vez em quando', type: 'toggle', default: false },
    ],
    body: `${STAR_FN}
let pecas = [];
let cores = [];

function setup() {
  ${BASE_SETUP}
  noStroke();
  cores = listaDeCores(P.cores);
}

function explodir(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = random(TWO_PI);
    const v = random(0.3, 1) * P.forca;
    pecas.push({ x, y, vx: cos(a) * v, vy: sin(a) * v - P.forca * 0.3, giro: random(TWO_PI), vg: random(-0.2, 0.2), vida: 255, cor: random(cores), r: random(0.5, 1.2) * P.tamanho });
  }
  if (pecas.length > 1500) pecas.splice(0, pecas.length - 1500);
}

function draw() {
  clear();
  if (P.automatico && frameCount % 150 === 0) explodir(random(width), random(height * 0.6), P.quantidade);
  for (let i = pecas.length - 1; i >= 0; i--) {
    const p = pecas[i];
    p.vy += P.gravidade; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.giro += p.vg; p.vida -= 2.5;
    if (p.vida <= 0 || p.y > height + 50) { pecas.splice(i, 1); continue; }
    const c = color(p.cor); c.setAlpha(p.vida); fill(c);
    if (P.forma === 'estrela') estrela(p.x, p.y, p.r, p.giro);
    else if (P.forma === 'circulo') circle(p.x, p.y, p.r);
    else { push(); translate(p.x, p.y); rotate(p.giro); rectMode(CENTER); rect(0, 0, p.r, p.r * 0.45); pop(); }
  }
}

function mousePressed() { if (portfolio.mouseDentro) explodir(mouseX, mouseY, P.quantidade); }
function mouseDragged() { if (portfolio.mouseDentro && frameCount % 3 === 0) explodir(mouseX, mouseY, 3); }
function keyPressed() { if (P.teclado) explodir(random(width), random(height * 0.7), P.quantidade); }
`,
  },
  {
    id: 'grao',
    name: 'Grão de papel animado',
    description: 'Textura de grão que vibra, como papel fotocopiado ou filme.',
    interactions: ['Mouse/toque deixa o grão mais forte por perto'],
    params: [
      { key: 'cor', label: 'Cor do grão', type: 'color', default: '#000000' },
      { key: 'densidade', label: 'Densidade', type: 'range', min: 500, max: 20000, step: 100, default: 4000 },
      { key: 'tamanho', label: 'Tamanho do grão', type: 'range', min: 1, max: 4, step: 0.5, default: 1.5 },
      { key: 'intensidade', label: 'Intensidade', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.35 },
      { key: 'quadros', label: 'Quadros por segundo', type: 'range', min: 2, max: 30, default: 12 },
      { key: 'reageMouse', label: 'Mais grão perto do mouse', type: 'toggle', default: true },
    ],
    body: `
function setup() {
  ${BASE_SETUP}
  noStroke();
  frameRate(P.quadros);
}

function draw() {
  clear();
  const c = color(P.cor);
  const n = P.densidade * (width * height) / (1440 * 900);
  for (let i = 0; i < n; i++) {
    const x = random(width), y = random(height);
    let a = random(255 * P.intensidade);
    if (P.reageMouse && portfolio.mouseDentro) a *= map(dist(x, y, mouseX, mouseY), 0, 300, 2.2, 1, true);
    c.setAlpha(a);
    fill(c);
    rect(x, y, P.tamanho, P.tamanho);
  }
}
`,
  },
  {
    id: 'ondas',
    name: 'Ondas',
    description: 'Linhas onduladas; a altura do mouse muda a amplitude e a rolagem muda a fase.',
    interactions: ['Altura do mouse/toque muda as ondas', 'Rolagem da página', 'Clique inverte a direção'],
    params: [
      { key: 'linhas', label: 'Número de linhas', type: 'range', min: 1, max: 24, default: 7 },
      { key: 'cor', label: 'Cor', type: 'color', default: '#090909' },
      { key: 'espessura', label: 'Espessura', type: 'range', min: 0.5, max: 10, step: 0.5, default: 2 },
      { key: 'amplitude', label: 'Amplitude', type: 'range', min: 4, max: 160, default: 36 },
      { key: 'frequencia', label: 'Frequência', type: 'range', min: 0.002, max: 0.05, step: 0.001, default: 0.01 },
      { key: 'velocidade', label: 'Velocidade', type: 'range', min: 0, max: 5, step: 0.1, default: 1 },
      { key: 'mouseAmplitude', label: 'Mouse controla a amplitude', type: 'toggle', default: true },
    ],
    body: `
let direcao = 1;

function setup() {
  ${BASE_SETUP}
  noFill();
}

function draw() {
  clear();
  stroke(P.cor);
  strokeWeight(P.espessura);
  let amp = P.amplitude;
  if (P.mouseAmplitude && portfolio.mouseDentro) amp *= map(mouseY, 0, height, 0.2, 2.2, true);
  const fase = frameCount * 0.02 * P.velocidade * direcao + portfolio.scroll * TWO_PI * 2;
  for (let i = 0; i < P.linhas; i++) {
    const y0 = map(i + 1, 0, P.linhas + 1, 0, height);
    beginShape();
    for (let x = 0; x <= width + 10; x += 10) {
      vertex(x, y0 + sin(x * P.frequencia + fase + i * 0.6) * amp);
    }
    endShape();
  }
}

function mousePressed() { if (portfolio.mouseDentro) direcao *= -1; }
`,
  },
  {
    id: 'desenho',
    name: 'Desenho livre',
    description: 'Visitantes desenham arrastando o mouse ou o dedo; o traço some com o tempo.',
    interactions: ['Arrastar desenha', 'Duplo clique limpa', 'Tecla espaço limpa'],
    params: [
      { key: 'cor', label: 'Cor do traço', type: 'color', default: '#090909' },
      { key: 'espessura', label: 'Espessura', type: 'range', min: 1, max: 40, default: 6 },
      { key: 'estilo', label: 'Estilo', type: 'select', default: 'linha', options: [
        { value: 'linha', label: 'Linha' }, { value: 'estrelas', label: 'Carimbo de estrelas' }, { value: 'spray', label: 'Spray' } ] },
      { key: 'arcoIris', label: 'Cores variando', type: 'toggle', default: false },
      { key: 'duracao', label: 'Some depois de (quadros, 0 = nunca)', type: 'range', min: 0, max: 900, step: 10, default: 240 },
    ],
    body: `${STAR_FN}
let tracos = [];

function setup() {
  ${BASE_SETUP}
  colorMode(RGB);
}

function draw() {
  clear();
  if (mouseIsPressed && portfolio.mouseDentro) {
    const cor = P.arcoIris ? color('hsb(' + (frameCount * 3 % 360) + ', 70%, 95%)') : color(P.cor);
    tracos.push({ x: mouseX, y: mouseY, px: pmouseX, py: pmouseY, nasc: frameCount, cor });
  }
  for (let i = tracos.length - 1; i >= 0; i--) {
    const t = tracos[i];
    const idade = frameCount - t.nasc;
    if (P.duracao > 0 && idade > P.duracao) { tracos.splice(i, 1); continue; }
    const c = color(t.cor);
    c.setAlpha(P.duracao > 0 ? map(idade, 0, P.duracao, 255, 0) : 255);
    if (P.estilo === 'linha') { stroke(c); strokeWeight(P.espessura); line(t.px, t.py, t.x, t.y); }
    else if (P.estilo === 'estrelas') { noStroke(); fill(c); estrela(t.x, t.y, P.espessura * 1.5, t.nasc * 0.1); }
    else { noStroke(); fill(c); randomSeed(t.nasc); for (let k = 0; k < 8; k++) circle(t.x + randomGaussian() * P.espessura, t.y + randomGaussian() * P.espessura, 1.5); }
  }
  if (tracos.length > 6000) tracos.splice(0, tracos.length - 6000);
}

function doubleClicked() { tracos = []; }
function keyPressed() { if (key === ' ') tracos = []; }
`,
  },
  {
    id: 'letras',
    name: 'Letras que fogem',
    description: 'Um texto em que cada letra foge do mouse e volta ao lugar — tipografia interativa.',
    interactions: ['Mouse/toque empurra as letras', 'Clique espalha tudo', 'Teclado escreve um novo texto (Enter confirma)'],
    params: [
      { key: 'texto', label: 'Texto', type: 'text', default: 'PORTFÓLIO' },
      { key: 'fonte', label: 'Fonte', type: 'select', default: 'Arial Black', options: [
        { value: 'Arial Black', label: 'Arial Black' }, { value: 'Space Mono', label: 'Space Mono' }, { value: 'Georgia', label: 'Georgia' }, { value: 'Courier New', label: 'Courier New' } ] },
      { key: 'tamanho', label: 'Tamanho', type: 'range', min: 16, max: 320, default: 110 },
      { key: 'cor', label: 'Cor', type: 'color', default: '#090909' },
      { key: 'posX', label: 'Posição horizontal (%)', type: 'range', min: 0, max: 100, default: 50 },
      { key: 'posY', label: 'Posição vertical (%)', type: 'range', min: 0, max: 100, default: 50 },
      { key: 'inclinacao', label: 'Inclinação (graus)', type: 'range', min: -30, max: 30, default: -5 },
      { key: 'raio', label: 'Alcance do mouse', type: 'range', min: 30, max: 400, default: 140 },
      { key: 'forca', label: 'Força', type: 'range', min: 1, max: 30, default: 10 },
      { key: 'tecladoEscreve', label: 'Visitante pode digitar um texto novo', type: 'toggle', default: false },
    ],
    body: `
let letras = [];
let digitando = '';

function setup() {
  ${BASE_SETUP}
  textFont(P.fonte);
  textAlign(LEFT, CENTER);
  montar(P.texto);
}

function montar(texto) {
  letras = [];
  textSize(P.tamanho);
  const total = textWidth(texto);
  let x = width * P.posX / 100 - total / 2;
  for (const ch of texto) {
    const w = textWidth(ch);
    letras.push({ ch, baseX: x, baseY: height * P.posY / 100, x, y: height * P.posY / 100, vx: 0, vy: 0 });
    x += w;
  }
}

function draw() {
  clear();
  textSize(P.tamanho);
  fill(P.cor);
  noStroke();
  push();
  const cx = width * P.posX / 100, cy = height * P.posY / 100;
  translate(cx, cy); rotate(radians(P.inclinacao)); translate(-cx, -cy);
  for (const l of letras) {
    if (portfolio.mouseDentro) {
      const d = dist(mouseX, mouseY, l.x, l.y);
      if (d < P.raio && d > 0.1) {
        const f = (1 - d / P.raio) * P.forca * 0.3;
        l.vx += (l.x - mouseX) / d * f; l.vy += (l.y - mouseY) / d * f;
      }
    }
    l.vx += (l.baseX - l.x) * 0.06; l.vy += (l.baseY - l.y) * 0.06;
    l.vx *= 0.82; l.vy *= 0.82;
    l.x += l.vx; l.y += l.vy;
    text(l.ch, l.x, l.y);
  }
  pop();
}

function mousePressed() {
  if (!portfolio.mouseDentro) return;
  for (const l of letras) { l.vx += random(-40, 40); l.vy += random(-40, 40); }
}

function keyPressed() {
  if (!P.tecladoEscreve) return;
  if (key === 'Enter') { if (digitando) montar(digitando); digitando = ''; }
  else if (key === 'Backspace') digitando = digitando.slice(0, -1);
  else if (key.length === 1) digitando += key;
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); montar(P.texto); }
`,
  },
];

export const CUSTOM_CODE_TEMPLATE = `// Sketch p5.js livre. Ele roda numa camada transparente do tamanho da área escolhida.
// Use "function setup()" e "function draw()" (não use const/arrow para essas funções).
//
// Interações que funcionam aqui:
//   mouseX, mouseY, pmouseX, pmouseY, mouseIsPressed
//   function mousePressed() {}   function mouseReleased() {}   function mouseDragged() {}
//   function doubleClicked() {}  function mouseWheel(evento) {}  function keyPressed() {}  (key)
//   portfolio.scroll   → rolagem da página de 0 a 1
//   portfolio.scrollY  → rolagem em pixels
//   portfolio.mouseDentro → true quando o mouse/dedo está sobre a área
//   portfolio.lugar    → 'navbar', 'home', 'projetos', 'sobre', 'contato' ou 'projeto'
//   portfolio.celular  → true em telas pequenas

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  clear(); // deixa o fundo transparente, mostrando o site por trás

  if (portfolio.mouseDentro) {
    noStroke();
    fill(236, 131, 170, 180);
    circle(mouseX, mouseY, mouseIsPressed ? 80 : 40);
  }
}
`;

export const getPreset = (id: string) => P5_PRESETS.find((preset) => preset.id === id) || P5_PRESETS[0];

export const presetDefaults = (id: string): Record<string, P5ParamValue> =>
  Object.fromEntries(getPreset(id).params.map((param) => [param.key, param.default]));

/** Mistura os valores salvos com os padrões, descartando tipos inválidos. */
export function resolveParams(id: string, saved?: Record<string, P5ParamValue>) {
  const preset = getPreset(id);
  const out: Record<string, P5ParamValue> = {};
  for (const param of preset.params) {
    const value = saved?.[param.key];
    if (param.type === 'range') {
      const n = typeof value === 'number' ? value : Number(value);
      out[param.key] = Number.isFinite(n) ? Math.min(param.max, Math.max(param.min, n)) : param.default;
    } else if (param.type === 'toggle') {
      out[param.key] = typeof value === 'boolean' ? value : param.default;
    } else if (param.type === 'select') {
      out[param.key] = param.options.some((o) => o.value === value) ? (value as string) : param.default;
    } else {
      out[param.key] = typeof value === 'string' && value.trim() ? value : param.default;
    }
  }
  return out;
}

/** Código completo do efeito com os valores escolhidos (usado na camada e no "Converter em código"). */
export function buildPresetCode(id: string, saved?: Record<string, P5ParamValue>) {
  const preset = getPreset(id);
  const params = resolveParams(id, saved);
  return `// Efeito "${preset.name}" — gerado pelo painel. Pode editar à vontade.\nconst P = ${JSON.stringify(params, null, 2)};\n${preset.body}`;
}
