title = "SQUARES";

description = `
[tap] to make 
the square 
dance!
`;

characters = [];

const G = {
  WIDTH: 100,
  HEIGHT: 100,
};

options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT }
};

// variables
/** @type {{ pos: Vector, height: number, width: number, speed: number }} */
let squares;
let Ransquare;
let pressed = false;
let playerTimerActive;
let moveSquareTimer;
let ChangeAxis = false;
let leftRight = false;
let bool = 0;

function update() {
  if (!ticks) {
    // initializing the state of the squares
    squares = {
      pos: vec(G.WIDTH / 2 - 5, G.HEIGHT / 2 - 5),
      width: 10,
      height: 10,
      speed: 1
    };
    Ransquare = {
      pos: vec(0,0),
      width: 10,
      height:10,
      speed:0.5
    }
  }

  // the player square
  color("light_blue");
  rect(squares.pos, squares.width, squares.height);

  // calls function to move the square to avoid
  slideSquareRandomly();

  // Draw the square to avoid
  color("red");
  rect(Ransquare.pos.x, Ransquare.pos.y, Ransquare.width, Ransquare.height);

  // delays the speed in which the square automatically shrinks to a 2x2 square
  if(!playerTimerActive){
    playerTimer(200);
    if(squares.width >2 && squares.height >2){
      // Decrease the rectangle's width and height only when the button is just pressed
      squares.width -= 2;
      squares.height -= 2;
    }
    
  }else{
    if (input.isJustPressed) {
      bool++;
      // Increase the rectangle's width and height when the button is pressed
      squares.width += 3;
      squares.height += 3;
      // lets you move up in position 3 times and then down in position 3 times
      // allows for a little moveablity
      if(bool>=4 && bool<=6){
        squares.pos.x += 2
        squares.pos.y += 2
        if(bool==6){
          bool = 0;
        }
      }else{
        squares.pos.x -= 2
        squares.pos.y -= 2
      }
    }
  }
}

function playerTimer(duration) {
  // the timer to delay the players scaling bigger and smaller
  const delay = duration;

  // Function to be executed after the delay
  const timerCallback = function () {
    // Reset the timer status
    playerTimerActive = false;
  };

  // Activate the timer
  setTimeout(timerCallback, delay);

  // Set the timer status to active
  playerTimerActive = true;
  
}

function moveTimer(duration) {
  // a timer for the square to avoid. It randomly changes direction 
  // after a "random" amount of time in between half a second and 2 seconds
  const delay = duration;
  // Function to be executed after the delay
  const timerCallback = function () {
    // Toggling on and off the axis and left right changes
    ChangeAxis = !ChangeAxis;
    leftRight = !leftRight;
    moveSquareTimer= false;
  };
  // Activate the timer
  setTimeout(timerCallback, delay);
  // Set the timer status to active
  moveSquareTimer = true;
}

function slideSquareRandomly() {
  // this function is what actually moves the random square
  let bool = true;
  if (!moveSquareTimer) {
    moveTimer(rnd(500, 2000));
  } else {
    if (ChangeAxis) {
      // Move vertically
      Ransquare.pos.y += leftRight ? Ransquare.speed : -Ransquare.speed;
    } else {
      // Move horizontally
      Ransquare.pos.x += leftRight ? Ransquare.speed : -Ransquare.speed;
    }
  }
  // wrap around the edges
  Ransquare.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
}