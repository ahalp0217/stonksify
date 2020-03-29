const input = $("#word");
const output = $("#wordstonked");
const button = $("button");

//Canvas Settings
const canvas = document.getElementById("stonkscanvas");
const ctx = canvas.getContext("2d");
ctx.shadowColor = "#fff";
ctx.shadowBlur = 50;
ctx.fillStyle = "#fff";
ctx.font = "40pt Impact";
ctx.strokeStyle = "#000";

//Load image
const imageObj = new Image();
imageObj.onload = function () {
  ctx.drawImage(imageObj, 10, 10);
};
imageObj.src = "stonks.jpg";

input.on('keyup', function (e) {
  if (e.which === 13) {
    console.log("Hit Enter");
    enterWord(input.val());
  }
});

button.on("click", function () {
  console.log("Clicked Submit");
  enterWord(input.val());
});

function enterWord(word) {
  if (validate(word)) {
    console.log("Valid word!");
    let newWerd = stonksify(word);
    drawWordOnCanvas(newWerd);
  }
}

function drawWordOnCanvas(newWerd) {
  console.log("Start Draw");
  //Clear canvas before drawing new word
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Redraw image
  ctx.drawImage(imageObj, 10, 10);
  //Draw text multiple times so the white radial shadow is more pronounced
  for (let i = 0; i < 10; i++) {
    ctx.fillText(newWerd, 430, 350);
  }
  ctx.strokeText(newWerd, 430, 350);
  ctx.strokeText(newWerd, 430, 350);
  console.log("End Draw");
}

function validate(word) {
  if (word.indexOf(" ") >= 0) {
    alert("Please enter a valid word");
    return false;
  }
  return true;
}

function stonksify(word) {
  //If a word starts with a c replace it with a k
  //Example: cat => kat
  word = word.toLowerCase();
  if (word.indexOf("c") === 0) {
    word = word.replace(/^c/, "k");
    return word;
  }

  //If a word has one c replace it with an n
  //Example: stocks => stonks
  if (word.split("c").length - 1 === 1) {
    word = word.replace(/c/g, "n");
    return word;
  }

  //If a word has one o in it replace it with an e
  //Example: frog => freg;
  if (word.split("o").length - 1 === 1) {
    word = word.replace(/o/g, "e");
    return word;
  }

  //TODO:
  //Add more conditions, counting syllables?
  //Add instant image creation from imgflip?
  //
  return word;
}
