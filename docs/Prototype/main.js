//http://localhost:4000/?prototype
title = "Bartending Sim";

description = `
	Tap to 
	Pour Drink
`;

characters = [
  `
  lllll
  l   l
   l l
   l l
    l
  `,
  `
 llll
llllll
llllll
llllll 
  `
];

options = {};

let source = {
	/**@type {Vector} */
	pos: vec(0,0),
	/**@type {Collision} */
	sprite: undefined,
	speed: .5,
	stutter: 1,
	direction: 1,
	drip: vec(0,1),
};
let destination ={

};
//CUP THINGS
let countedDroplets = [];
let topY = 60; //middle of the screen
let bottomY = 90; //where the horizontal bottom of cup lies on y axis
let topDistance=15; // distance between the lines on top part of cup
let bottomDistance=12; // distance between the lines on bottom part of cup
let cup = {
	slant: (topDistance - bottomDistance) / (bottomY - topY)

};

/** @type {Vector[]} */
let inCup;
/** @type {Vector[]} */
let drops;
let drip = .2;

//GOAL LINE
let distFromTop = topY + 5// change number move line further down cup
/** @type {{tier:number}} */
let water_line; 

//BOTTLE THINGS
/** @type {{ pos: Vector, height: number, width: number}}*/
let bottleFill;
/** @type {{pos: Vector, height: number, width: number}} */
let bottle;

// Water physics constants
const gravity = 0.2; // Gravity force
const surfaceTension = 0.2; // Surface tension force
const buoyancy = -0.2; // Buoyancy force
const centerX = 50;
// Initialize three tiers to hold droplets
let tiers;
let tier = 0;
let dropCounter = 0; // Initialize a counter
let stutterCounter = 0;
function update() {
	if (!ticks) { //init
		//source.sprite = addWithCharCode(char, offset);
		//temporary
		drops = [];
		source.pos = vec(50,20); //initial starting position
		color("green");
		source.sprite = box(source.pos, {x: 5, y: 6});
		destination = addWithCharCode(characters[0], 0);
		destination.pos = vec(40,50);
		// Calculate the number of layers (height) based on the given dimensions
		cup.layers = bottomY - topY;
		// Initialize a list of lists with the specified number of empty lists
		tiers = new Array(cup.layers).fill().map(() => []);
		// Initial Bottle position and height
		bottleFill = {
			// note if the cork isnt centered, just just... add a one or something itll be close enough
			// changing these values will move the entire bottle 
			pos: vec(3,15),
			// you can scale it too and its fine
			height: 32,
			width: 10
		}
		bottle ={
			pos: vec(bottleFill.pos.x,bottleFill.pos.y-1),
			height: bottleFill.height + 2,
			width: bottleFill.width + 2
		}
		water_line = {
			// this number moves the water line down from the top of the cup
			tier: floor((bottomY-distFromTop)/3)-1  // the number of tiers to fill the cup
			// note 3 is currently the hard size of the droplets so each tier is 3 pixels high
		}
	}
	//BACKGROUND STUFF
	color("white");
	rect(0,0,100,100);
	color("light_black");
	rect(0,70,100,30);

	//BOTTLE SHENANIGANS
	// the neck
	color("green");
	box(bottle.pos.x+bottle.width/2, bottle.pos.y-6, bottle.width/2-2,6);
	// making the curve
	color("green");
	line(bottle.pos.x +4 ,bottle.pos.y-1 , bottle.pos.x + bottle.width -3, bottle.pos.y-1); 
	color("green");
	line(bottle.pos.x +3 ,bottle.pos.y , bottle.pos.x + bottle.width -2, bottle.pos.y); 
	color("green");
	// the bottle base
	rect(bottle.pos.x, bottle.pos.y, bottle.width, bottle.height); // bottle
	// the back fill
	color("black");
	rect(bottle.pos.x+1, bottle.pos.y+1, bottle.width-2, bottle.height-3); // back fill
	// the water fill
	color("blue");
	rect(bottleFill.pos.x+1, bottleFill.pos.y, bottleFill.width, bottleFill.height); // water fill

	//CUP SHENANIGANS//
	color("cyan");
	cup.left = line(vec(50 - topDistance, topY), vec(50 - bottomDistance,bottomY)); //left side, top -> bottom
	cup.right = line(vec(50 + topDistance, topY), vec(50 + bottomDistance,bottomY)); //right side
	cup.bottom = line(vec(50 - bottomDistance, bottomY),vec(50 + bottomDistance, bottomY)); //bottom horizontal, //left -> right
	color("green");
	source.sprite = sourceMovement();

	//WATER LIMIT LINE
	color("red");
	line(vec(50 - topDistance, distFromTop),vec(50 + topDistance, distFromTop),1);


	console.log(tier);
	if(input.isPressed){
		if (dropCounter == 10) { //reduces amount of water coming out of source
			// This block will execute as long as the counter is less than 10
			drops.push(vec(source.pos.x - 3, source.pos.y + source.drip.y));
			drops.push(vec(source.pos.x, source.pos.y + source.drip.y));
			drops.push(vec(source.pos.x + 3	, source.pos.y + source.drip.y));
			dropCounter = 0;
		}
		dropCounter++;

		//Water Amount decreasing
		bottleFill.height -= 0.05;
		bottleFill.pos.y += 0.05; // Adjust the position to move the rectangle up
		//if you run out of liquid game over
		if(bottleFill.height <=0){
			end();
		}
	}

	if (drops) {
		remove(drops, (d) => {
		  color("blue");
		  let droplet = box(d, 3);

		  // Check if a drip collides with the cup
		  if (droplet.isColliding.rect.cyan) {
			if (d.x > 50 - topDistance && d.x < 50 - bottomDistance) {
			  // Move the drip to the right
			  d.x += 1*cup.slant;
			}
			if (d.x < 50 + topDistance && d.x > 50 - bottomDistance) {
			  // Move the drip to the left
			  d.x -= 1*cup.slant;
			}
		  }
 
		if ((d.y > bottomY - tier*3 -6 && d.y < bottomY - tier*3+3) && (d.x > 50 - topDistance && d.x < 50 + topDistance)) {

			// If tier is full, move to the next empty tier
			//console.log(Math.round(((bottomDistance*2))/3+(tier*2/cup.layers)*(topDistance-bottomDistance)));
			if(tiers[tier].length >= Math.ceil(1/surfaceTension) + Math.ceil(((bottomDistance*2))/3+(tier*2/cup.layers)*(topDistance-bottomDistance))) {
				if((tier == water_line.tier)){
					//win game
					console.log("you won");
				}
				else{
					tier++;
				}
			}
			if (tier !== -1) {
				//IF IT GETS HERE THAT MEANS THE WATER DROPLET HAS OFFICIALLY ENTERED THE CUP
				//AND WILL BEHAVE WIL WATER IN CUP PHYSICS
				d.y = bottomY - tier*3 -3;
				tiers[tier].push(d); // Add the vector to the corresponding tier
				tiers[tier] = dropletSorting(tiers[tier]);
				score++;
				settle();
				return true;
			}
		}else {
			d.y += drip + rnd(-0.1, 0.2);
			if (d.y > 99) { // remove pts if water outside cup
                if (countedDroplets.indexOf(d) === -1) {
                    score--;
                    countedDroplets.push(d);
                }
            }
		}
		  return d.y > 102; //IF IT GETS HERE IT MEANS A WATER DROPLET FELL OFF SCREEN AND IS BEING DELETED
		});
	}

	// Apply water physics to droplets in each tier
	settle();
}
function settle() {
	tiers.forEach((t, index) => {
	  const dropletSpacing = 3;
	  const left = centerX - bottomDistance - cup.slant * index * dropletSpacing+2;
	  const right = centerX + bottomDistance + cup.slant * index * dropletSpacing+2;

	  t.forEach((d, i) => {
		// Gradually spread water droplets from left to right
		const targetX = left + (i / t.length) * (right - left); // Adjusted for total length
		const xOffset = targetX - d.x;
		d.x += xOffset * 0.02; // Adjust the factor for gradual convergence

		// Apply surface tension to bring adjacent droplets together (slower convergence)
		if (i > 0) {
		  const prevDroplet = t[i - 1];
		  const distance = d.x - prevDroplet.x -1.5;
		  const convergenceFactor = 0.2;
		  d.x = Math.min(Math.max(d.x - distance * surfaceTension * convergenceFactor, left), right+1);
		}

		// Clamp d.x within the range defined by left and right
		d.x = Math.min(Math.max(d.x, left), right);

		// console.log(d);
		color("blue");
		box(d, 3);

	  });
	});
  }



function dropletSorting(droplets){
  // Use the Array.sort() method to sort the list of vectors
  droplets.sort((a, b) => a.x - b.x);
	//console.log(droplets);
  // Return the sorted list
  return droplets;
}
/*
function dropletPhysics() {
	if (tiers) {
	  tiers.forEach((t, index) => {
		const width = 2 * bottomDistance;
		const totalDroplets = !isNaN(t.length) ? 10 : t.length;
		const centerX = 50; // Middle point of the range
		const dropletSpacing = width / (totalDroplets - 1);
		const slant = (topDistance - bottomDistance) / (bottomY - topY);
		const left = centerX - bottomDistance - slant * index * dropletSpacing;
		const right = centerX + bottomDistance + (slant * index * dropletSpacing);

		console.log("left: " +left+ " right: " +right);
		// Calculate left and right variables considering slanted sides

		t.forEach((d, i) => {
		  d.y = bottomY - index * 3-3;

		  // Calculate the horizontal position based on the index, alternating between left and right
		  const targetX = i % 2 === 0 ? left + i / 2 * dropletSpacing : right - (i/2 * dropletSpacing);
		  const xOffset = targetX - d.x;
		  d.x += xOffset * 0.1; // Adjust the factor for gradual convergence

		  box(d, 3);
		});
	  });
	}
  }*/


function sourceMovement(){
	// Move the source back and forth
	if(rnd(0,100)<1) source.direction *=-1;
	source.pos.x += source.speed * source.direction;

	// Check if the source has reached the screen boundaries
	if(source.pos.x < 20){
		source.direction = 1;
	}
	if (source.pos.x > 80) {
		// Reverse the direction when the source reaches a boundary
		source.direction = -1;
	}
	// Add a random value within the stutter range to the position

	if(source.pos.x > 1+source.stutter && source.pos.x < 100-source.stutter){//if in range where game won't break
		if(stutterCounter=3){
			source.pos.x += rnd(source.stutter*-1, source.stutter);
			stutterCounter =0;
		}
		stutterCounter++;
	}

	return box(source.pos, {x: 5, y: 6});
}
