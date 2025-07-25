let m1Slider, m2Slider, distSlider, gSlider, timeSlider, corSlider, resetButton, toggleUIButton, trailCheckbox;
let bodies = [];
let trailLayer;
let G = 1;
let timeScale = 1;
let cor = 1; // Coefficient of restitution
let softening = 10; // Base softening parameter
const BASE_DT = 0.02; // Smaller base time step
let comX, comY, totalMomentum, prevComX, prevComY, comDrift;
let lastCollisionFrame = -100; // For collision debugging
let showTrails = true; // Trail visibility toggle
let showUI = true; // UI visibility toggle

function setup() {
  createCanvas(windowWidth, windowHeight);
  trailLayer = createGraphics(width, height);
  trailLayer.background(0);

  // Responsive slider positions at the bottom
  let sliderWidth = 150;
  let spacing = 20;
  let totalWidth = 8 * sliderWidth + 7 * spacing; // 6 sliders + 1 checkbox + 2 buttons
  let startX = 20;
  let row1Y = height - 80;
  let row2Y = height - 40;

  // Adjust positions based on windowWidth
  if (totalWidth > windowWidth - 40) {
    // Wrap to two rows if screen is too narrow
    m1Slider = createSlider(10, 100, 30);
    m1Slider.position(startX, row1Y);
    m1Slider.style('width', sliderWidth + 'px');
    m1Slider.class('w-36 bg-gray-600 rounded-md h-2');

    m2Slider = createSlider(10, 100, 30);
    m2Slider.position(startX + sliderWidth + spacing, row1Y);
    m2Slider.style('width', sliderWidth + 'px');
    m2Slider.class('w-36 bg-gray-600 rounded-md h-2');

    distSlider = createSlider(50, 400, 200);
    distSlider.position(startX + 2 * (sliderWidth + spacing), row1Y);
    distSlider.style('width', sliderWidth + 'px');
    distSlider.class('w-36 bg-gray-600 rounded-md h-2');

    gSlider = createSlider(0.1, 5, 1, 0.1);
    gSlider.position(startX, row2Y);
    gSlider.style('width', sliderWidth + 'px');
    gSlider.class('w-36 bg-gray-600 rounded-md h-2');

    timeSlider = createSlider(0.1, 5, 1, 0.1);
    timeSlider.position(startX + sliderWidth + spacing, row2Y);
    timeSlider.style('width', sliderWidth + 'px');
    timeSlider.class('w-36 bg-gray-600 rounded-md h-2');

    corSlider = createSlider(0, 1, 1, 0.1);
    corSlider.position(startX + 2 * (sliderWidth + spacing), row2Y);
    corSlider.style('width', sliderWidth + 'px');
    corSlider.class('w-36 bg-gray-600 rounded-md h-2');

    trailCheckbox = createCheckbox('Trails', true);
    trailCheckbox.position(startX + 3 * (sliderWidth + spacing), row2Y);
    trailCheckbox.style('width', '16px');
    trailCheckbox.style('height', '16px');
    trailCheckbox.changed(() => showTrails = trailCheckbox.checked());

    resetButton = createButton('Reset');
    resetButton.position(startX + 4 * (sliderWidth + spacing), row2Y);
    resetButton.style('width', sliderWidth + 'px');
    resetButton.style('background-color', '#2563eb');
    resetButton.style('color', 'white');
    resetButton.style('font-family', 'Helvetica Neue');
    resetButton.style('font-size', '14px');
    resetButton.style('opacity', '1');
    resetButton.style('visibility', 'visible');
    resetButton.style('display', 'block');
    resetButton.style('z-index', '200');
    resetButton.style('pointer-events', 'auto');
    resetButton.style('border-radius', '6px');
    resetButton.class('w-36 bg-blue-600 text-white rounded-md py-1 hover:bg-blue-700 reset-button');
    resetButton.elt.style.backgroundColor = '#2563eb';
    resetButton.elt.style.color = 'white';
    resetButton.elt.style.opacity = '1';
    resetButton.elt.style.visibility = 'visible';
    resetButton.elt.style.display = 'block';
    resetButton.elt.style.zIndex = '200';

    toggleUIButton = createButton('Toggle UI');
    toggleUIButton.position(startX + 5 * (sliderWidth + spacing), row2Y);
    toggleUIButton.style('width', sliderWidth + 'px');
    toggleUIButton.style('background-color', '#2563eb');
    toggleUIButton.style('color', 'white');
    toggleUIButton.style('font-family', 'Helvetica Neue');
    toggleUIButton.style('font-size', '14px');
    toggleUIButton.style('opacity', '1');
    toggleUIButton.style('visibility', 'visible');
    toggleUIButton.style('display', 'block');
    toggleUIButton.style('z-index', '200');
    toggleUIButton.style('pointer-events', 'auto');
    toggleUIButton.style('border-radius', '6px');
    toggleUIButton.class('w-36 bg-blue-600 text-white rounded-md py-1 hover:bg-blue-700 toggle-ui-button');
    toggleUIButton.elt.style.backgroundColor = '#2563eb';
    toggleUIButton.elt.style.color = 'white';
    toggleUIButton.elt.style.opacity = '1';
    toggleUIButton.elt.style.visibility = 'visible';
    toggleUIButton.elt.style.display = 'block';
    toggleUIButton.elt.style.zIndex = '200';
  } else {
    // Single row if screen is wide enough
    m1Slider = createSlider(10, 100, 30);
    m1Slider.position(startX, row1Y);
    m1Slider.style('width', sliderWidth + 'px');
    m1Slider.class('w-36 bg-gray-600 rounded-md h-2');

    m2Slider = createSlider(10, 100, 30);
    m2Slider.position(startX + sliderWidth + spacing, row1Y);
    m2Slider.style('width', sliderWidth + 'px');
    m2Slider.class('w-36 bg-gray-600 rounded-md h-2');

    distSlider = createSlider(50, 400, 200);
    distSlider.position(startX + 2 * (sliderWidth + spacing), row1Y);
    distSlider.style('width', sliderWidth + 'px');
    distSlider.class('w-36 bg-gray-600 rounded-md h-2');

    gSlider = createSlider(0.1, 5, 1, 0.1);
    gSlider.position(startX + 3 * (sliderWidth + spacing), row1Y);
    gSlider.style('width', sliderWidth + 'px');
    gSlider.class('w-36 bg-gray-600 rounded-md h-2');

    timeSlider = createSlider(0.1, 5, 1, 0.1);
    timeSlider.position(startX + 4 * (sliderWidth + spacing), row1Y);
    timeSlider.style('width', sliderWidth + 'px');
    m1Slider.class('w-36 bg-gray-600圓-md h-2');

    corSlider = createSlider(0, 1, 1, 0.1);
    corSlider.position(startX + 5 * (sliderWidth + spacing), row1Y);
    corSlider.style('width', sliderWidth + 'px');
    corSlider.class('w-36 bg-gray-600 rounded-md h-2');

    trailCheckbox = createCheckbox('Trails', true);
    trailCheckbox.position(startX + 6 * (sliderWidth + spacing), row1Y);
    trailCheckbox.style('width', '16px');
    trailCheckbox.style('height', '16px');
    trailCheckbox.changed(() => showTrails = trailCheckbox.checked());

    resetButton = createButton('Reset');
    resetButton.position(startX + 7 * (sliderWidth + spacing), row1Y);
    resetButton.style('width', sliderWidth + 'px');
    resetButton.style('background-color', '#2563eb');
    resetButton.style('color', 'white');
    resetButton.style('font-family', 'Helvetica Neue');
    resetButton.style('font-size', '14px');
    resetButton.style('opacity', '1');
    resetButton.style('visibility', 'visible');
    resetButton.style('display', 'block');
    resetButton.style('z-index', '200');
    resetButton.style('pointer-events', 'auto');
    resetButton.style('border-radius', '6px');
    resetButton.class('w-36 bg-blue-600 text-white rounded-md py-1 hover:bg-blue-700 reset-button');
    resetButton.elt.style.backgroundColor = '#2563eb';
    resetButton.elt.style.color = 'white';
    resetButton.elt.style.opacity = '1';
    resetButton.elt.style.visibility = 'visible';
    resetButton.elt.style.display = 'block';
    resetButton.elt.style.zIndex = '200';

    toggleUIButton = createButton('Toggle UI');
    toggleUIButton.position(startX + 8 * (sliderWidth + spacing), row1Y);
    toggleUIButton.style('width', sliderWidth + 'px');
    toggleUIButton.style('background-color', '#2563eb');
    toggleUIButton.style('color', 'white');
    toggleUIButton.style('font-family', 'Helvetica Neue');
    toggleUIButton.style('font-size', '14px');
    toggleUIButton.style('opacity', '1');
    toggleUIButton.style('visibility', 'visible');
    toggleUIButton.style('display', 'block');
    toggleUIButton.style('z-index', '200');
    toggleUIButton.style('pointer-events', 'auto');
    toggleUIButton.style('border-radius', '6px');
    toggleUIButton.class('w-36 bg-blue-600 text-white rounded-md py-1 hover:bg-blue-700 toggle-ui-button');
    toggleUIButton.elt.style.backgroundColor = '#2563eb';
    toggleUIButton.elt.style.color = 'white';
    toggleUIButton.elt.style.opacity = '1';
    toggleUIButton.elt.style.visibility = 'visible';
    toggleUIButton.elt.style.display = 'block';
    toggleUIButton.elt.style.zIndex = '200';
  }

  resetButton.mousePressed(resetSimulation);
  toggleUIButton.mousePressed(toggleUIVisibility);
  resetSimulation();
}

function toggleUIVisibility() {
  showUI = !showUI;
  let displayStyle = showUI ? 'block' : 'none';
  document.getElementById('ui-container').style.display = displayStyle;
  document.getElementById('ui-prompt').style.display = displayStyle;
  m1Slider.elt.style.display = showUI ? 'block' : 'none';
  m2Slider.elt.style.display = showUI ? 'block' : 'none';
  distSlider.elt.style.display = showUI ? 'block' : 'none';
  gSlider.elt.style.display = showUI ? 'block' : 'none';
  timeSlider.elt.style.display = showUI ? 'block' : 'none';
  corSlider.elt.style.display = showUI ? 'block' : 'none';
  trailCheckbox.elt.style.display = showUI ? 'block' : 'none';
  resetButton.elt.style.display = showUI ? 'block' : 'none';
  toggleUIButton.elt.style.display = showUI ? 'block' : 'none';
}

function resetSimulation() {
  bodies = [];
  G = gSlider.value();

  let dist = distSlider.value();
  let m1 = m1Slider.value();
  let m2 = m2Slider.value();

  let totalMass = m1 + m2;
  let omega = sqrt(G * totalMass / pow(dist, 3));
  
  bodies.push(new Body(-dist/2, 0, 0, omega * dist/2, m1, [0, 150, 255]));
  bodies.push(new Body(dist/2, 0, 0, -omega * dist/2, m2, [255, 100, 0]));

  trailLayer.clear();
  trailLayer.background(0);
  prevComX = null;
}

function draw() {
  G = gSlider.value();
  timeScale = timeSlider.value();
  cor = corSlider.value();

  updateMasses();
  softening = 10 * sqrt((bodies[0].mass + bodies[1].mass) / 20);

  let minDist = p5.Vector.dist(bodies[0].pos, bodies[1].pos);
  let dt = BASE_DT * constrain(minDist / 100, 0.1, 1);
  let numSubSteps = max(1, floor(timeScale * 50 * (BASE_DT / dt)));

  for (let i = 0; i < numSubSteps; i++) {
    for (let body of bodies) {
      body.computeForce(bodies);
    }
    for (let body of bodies) {
      body.verletStep(dt);
    }
    handleCollisions(dt);
  }

  if (showTrails && frameCount % 2 === 0) {
    updateTrails();
  }

  background(0);
  if (showTrails) {
    image(trailLayer, 0, 0);
  }

  if (frameCount - lastCollisionFrame < 10) {
    fill(255, 255, 255, 150);
    noStroke();
    let midPoint = p5.Vector.lerp(bodies[0].pos, bodies[1].pos, 0.5);
    let s = screenPos(midPoint.x, midPoint.y);
    ellipse(s.x, s.y, 80);
  }

  for (let body of bodies) {
    body.display();
    drawMomentumArrow(body);
  }

  computeCOMandMomentum();
  drawCenterOfMass();
  if (showUI) {
    drawUI();
  }
}

function drawMomentumArrow(body) {
  let vel = p5.Vector.sub(body.pos, body.prevPos).div(BASE_DT);
  let momentum = p5.Vector.mult(vel, body.mass);
  let scale = 0.5; // Scale for visibility
  let arrowLength = momentum.mag() * scale;
  if (arrowLength > 0) {
    let s = screenPos(body.pos.x, body.pos.y);
    let endPoint = screenPos(body.pos.x + momentum.x * scale, body.pos.y + momentum.y * scale);
    stroke(body.color[0], body.color[1], body.color[2], 200);
    strokeWeight(2);
    line(s.x, s.y, endPoint.x, endPoint.y);
    // Arrowhead
    let angle = atan2(endPoint.y - s.y, endPoint.x - s.x);
    let arrowSize = 10;
    push();
    translate(endPoint.x, endPoint.y);
    rotate(angle);
    line(0, 0, -arrowSize, -arrowSize / 2);
    line(0, 0, -arrowSize, arrowSize / 2);
    pop();
  }
}

function updateMasses() {
  let m1 = m1Slider.value();
  let m2 = m2Slider.value();

  if (abs(bodies[0].mass - m1) > 0.1 || abs(bodies[1].mass - m2) > 0.1) {
    let v1 = p5.Vector.sub(bodies[0].pos, bodies[0].prevPos).div(BASE_DT);
    let v2 = p5.Vector.sub(bodies[1].pos, bodies[1].prevPos).div(BASE_DT);
    let p1 = p5.Vector.mult(v1, bodies[0].mass);
    let p2 = p5.Vector.mult(v2, bodies[1].mass);
    let totalP = p5.Vector.add(p1, p2);

    bodies[0].mass = m1;
    bodies[1].mass = m2;
    bodies[0].radius = sqrt(m1) * 0.8;
    bodies[1].radius = sqrt(m2) * 0.8;

    let totalMass = m1 + m2;
    if (totalMass > 0) {
      let v1New = p5.Vector.div(totalP, totalMass);
      let v2New = v1New;
      bodies[0].prevPos = p5.Vector.sub(bodies[0].pos, p5.Vector.mult(v1New, BASE_DT));
      bodies[1].prevPos = p5.Vector.sub(bodies[1].pos, p5.Vector.mult(v2New, BASE_DT));
    }
  }
}

function computeCOMandMomentum() {
  let totalMass = 0, xSum = 0, ySum = 0;
  let momentumX = 0, momentumY = 0;
  for (let body of bodies) {
    totalMass += body.mass;
    xSum += body.pos.x * body.mass;
    ySum += body.pos.y * body.mass;
    let vel = p5.Vector.sub(body.pos, body.prevPos).div(BASE_DT);
    momentumX += body.mass * vel.x;
    momentumY += body.mass * vel.y;
  }
  comX = totalMass > 0 ? xSum / totalMass : 0;
  comY = totalMass > 0 ? ySum / totalMass : 0;
  totalMomentum = createVector(momentumX, momentumY).mag();

  if (prevComX !== null) {
    comDrift = createVector(comX - prevComX, comY - prevComY).mag();
  } else {
    comDrift = 0;
  }
  prevComX = comX;
  prevComY = comY;
}

function handleCollisions(dt) {
  let b1 = bodies[0];
  let b2 = bodies[1];
  
  let distVec = p5.Vector.sub(b2.pos, b1.pos);
  let distance = distVec.mag();
  let minDist = (sqrt(b1.mass) + sqrt(b2.mass)) * 1.5;

  if (distance < minDist) {
    lastCollisionFrame = frameCount;
    console.log("Collision detected: distance=", distance, "minDist=", minDist, "cor=", cor);
    
    distVec.normalize();
    let v1 = p5.Vector.sub(b1.pos, b1.prevPos).div(dt);
    let v2 = p5.Vector.sub(b2.pos, b2.prevPos).div(dt);
    let relVel = p5.Vector.sub(v1, v2).dot(distVec);
    
    let impulse = (1 + cor) * relVel / (b1.mass + b2.mass);
    let impulseVec = distVec.mult(impulse);
    
    b1.prevPos = p5.Vector.sub(b1.pos, p5.Vector.sub(v1, p5.Vector.mult(impulseVec, b1.mass)).mult(dt));
    b2.prevPos = p5.Vector.sub(b2.pos, p5.Vector.add(v2, p5.Vector.mult(impulseVec, b2.mass)).mult(dt));
    
    let correction = distVec.copy().mult((minDist - distance) * 0.5);
    b1.pos.sub(correction);
    b2.pos.add(correction);
    
    if (cor === 0) {
      let totalMass = b1.mass + b2.mass;
      let vAvg = p5.Vector.add(p5.Vector.mult(v1, b1.mass), p5.Vector.mult(v2, b2.mass)).div(totalMass);
      b1.prevPos = p5.Vector.sub(b1.pos, p5.Vector.mult(vAvg, dt));
      b2.prevPos = p5.Vector.sub(b2.pos, p5.Vector.mult(vAvg, dt));
    }
  }
}

function updateTrails() {
  trailLayer.fill(0, 10);
  trailLayer.noStroke();
  trailLayer.rect(0, 0, width, height);
  for (let body of bodies) {
    body.drawTrail(trailLayer);
  }
}

function drawCenterOfMass() {
  let pulse = 50 + 20 * sin(frameCount * 0.1);
  noStroke();
  fill(0, 255, 0, 100);
  let s = screenPos(comX, comY);
  ellipse(s.x, s.y, pulse);
  fill(0, 255, 0);
  ellipse(s.x, s.y, 8);
}

function drawUI() {
  // Remove semi-transparent rect; use #ui-container's Tailwind background
  fill(255);
  textSize(14);
  textFont('Helvetica Neue');
  textAlign(CENTER);
  // Slider labels above sliders
  text('Mass 1: ' + m1Slider.value().toFixed(2), m1Slider.x + 75, m1Slider.y - 10);
  text('Mass 2: ' + m2Slider.value().toFixed(2), m2Slider.x + 75, m2Slider.y - 10);
  text('Distance: ' + distSlider.value(), distSlider.x + 75, distSlider.y - 10);
  text('G: ' + G.toFixed(2), gSlider.x + 75, gSlider.y - 10);
  text('Time Scale: ' + timeScale.toFixed(2), timeSlider.x + 75, timeSlider.y - 10);
  text('Restitution: ' + cor.toFixed(2), corSlider.x + 75, corSlider.y - 10);
  
  // Metrics at the bottom of the UI strip
  textAlign(LEFT);
  text('Momentum: ' + totalMomentum.toFixed(4), 20, height - 20);
  text('COM Drift: ' + comDrift.toFixed(4), 150, height - 20);
  if (frameCount - lastCollisionFrame < 10) {
    fill(255, 0, 0);
    text('COLLISION!', 280, height - 20);
  }
}

function screenPos(x, y) {
  return createVector(width / 2 + x, height / 2 + y);
}

class Body {
  constructor(x, y, vx, vy, mass, color) {
    this.pos = createVector(x, y);
    this.prevPos = createVector(x - vx * BASE_DT, y - vy * BASE_DT);
    this.mass = mass;
    this.color = color;
    this.force = createVector(0, 0);
    this.radius = sqrt(mass) * 0.8;
  }

  computeForce(others) {
    this.force.set(0, 0);
    for (let other of others) {
      if (other === this) continue;
      
      let r = p5.Vector.sub(other.pos, this.pos);
      let distSq = r.magSq() + softening;
      let f = (G * this.mass * other.mass) / (distSq * sqrt(distSq));
      
      this.force.add(p5.Vector.mult(r, f));
    }
  }

  verletStep(dt) {
    let accel = p5.Vector.div(this.force, this.mass);
    let newPos = p5.Vector.sub(
      p5.Vector.mult(this.pos, 2),
      this.prevPos
    ).add(p5.Vector.mult(accel, dt * dt));
    
    this.prevPos = this.pos.copy();
    this.pos = newPos;
  }

  drawTrail(pg) {
    pg.noStroke();
    pg.fill(this.color[0], this.color[1], this.color[2], 150);
    let s = screenPos(this.pos.x, this.pos.y);
    pg.ellipse(s.x, s.y, 3);
  }

  display() {
    push();
    let s = screenPos(this.pos.x, this.pos.y);
    translate(s.x, s.y);
    noStroke();
    
    fill(this.color[0], this.color[1], this.color[2], 50);
    ellipse(0, 0, this.radius * 3);
    fill(this.color[0], this.color[1], this.color[2], 100);
    ellipse(0, 0, this.radius * 2);
    
    fill(this.color);
    ellipse(0, 0, this.radius * 2);
    
    fill(255, 255, 255, 100);
    ellipse(-this.radius/3, -this.radius/3, this.radius/2);
    pop();
  }
}