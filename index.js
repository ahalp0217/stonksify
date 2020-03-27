const input = $("#word");
const output = $("#wordstonked");
const button = $("button");
const canvas = document.getElementById("stonkscanvas");
const context = canvas.getContext("2d");
const imageObj = new Image();

//Load image
imageObj.onload = function() {
  context.drawImage(imageObj, 10, 10);
};
imageObj.src = "stonks.jpg";

// handle click and add class
button.on("click", function() {
  let word = input.val();
  console.log("Clicked");
  if (validate(word)) {
    console.log("Good word");
    let newWerd = stonksify(word);
    //Clear canvas before drawing new word
    context.clearRect(0, 0, canvas.width, canvas.height);
    //Redraw image
    context.drawImage(imageObj, 10, 10);
    context.font = "40pt Impact";
    context.strokeText(newWerd, 430, 350);
  }
});

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
