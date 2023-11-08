title = "";

description = ``;

characters = [];

options = {};

/** @type {{angle: number, length: number, pin: Vector}} */
let cord;
/** @type {Vector[]} */
let pins;
/** @type {Vector[]} */
let bombs;
let nextPinDist;
let nextBombDist; // Add a variable for bomb spawn distance
const cordLength = 10;
let rotationDirection = 1; // 1 for clockwise, -1 for counterclockwise
/** @type {Vector} */
let playerPin;

function update() {
  if (!ticks) { // Initialization
	color("cyan");
    playerPin = vec(50, 5);
    pins = [vec(10, 75)];
	color("red");
    bombs = [vec(2, 80)];
    nextPinDist = 5;
    nextBombDist = 10; // Initialize bomb spawn distance
    cord = { angle: 0, length: cordLength, pin: playerPin };
  }
  // Scrolling factor
  let scr = -0.1 - score * 0.01;
  if (input.isPressed) {
	if (!(cord.length>102)) cord.length += 5; 
  } else {
    cord.length += (cordLength - cord.length) * 0.5;
  }
  
  cord.angle += 0.01 * rotationDirection + score *.01 *.01 *.01;
  // Check if cord.angle is close to a multiple of π (180 degrees)
  if (Math.abs(cord.angle % Math.PI) < 0.01 || Math.abs(cord.angle % Math.PI) > 3) {
    rotationDirection *= -1;
    console.log("change rotation direction");
  }
  color("cyan");
  line(cord.pin, vec(cord.pin).addWithAngle(cord.angle, cord.length));

  // Remove pins
  remove(pins, (p) => {
	p.y += scr;
	color("black");
	box(p, 3);
	if (box(p, 3).isColliding.rect.cyan) {
		score++
		return true;
	}
	return p.y <10;
  });

  // Remove bombs
  remove(bombs, (b) => {
    b.y += scr*rnd(1,2);
    color("red");
    box(b, 3);
    if (box(b, 3).isColliding.rect.cyan) {
		end();
    }
	return b.y<25;
  });

  // Spawn new pins
  nextPinDist += scr;
  while (nextPinDist < 0) {
    pins.push(vec(rnd(10, 90), 102 + nextPinDist));
    pins.push(vec(rnd(10, 90), 102 + nextPinDist));
    nextPinDist += rnd(5, 15);
  }

  // Spawn new bombs
  nextBombDist += scr;
  while (nextBombDist < 0) {
    bombs.push(vec(rnd(10, 90), 102 + nextBombDist));
    nextBombDist += rnd(10, 20);
  }
}
