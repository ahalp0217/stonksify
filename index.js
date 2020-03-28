const input = $("#word");
const output = $("#wordstonked");
const button = $("button");
const werdParagraph = $("#werd")

// on page load
$(function() {

  // position the werd text div over the appropriate spot
  var stonksImage = $("#stonks_image");
  var stonkImageHeight = stonksImage.height();
  var stonkImageWidth = stonksImage.width();
  var stonkImagePosition = stonksImage.position()

  var werdContainer = $("#werd_container");
  werdContainer.css({top: stonkImagePosition.top+stonkImageHeight*.51, left: stonkImagePosition.left+stonkImageWidth*.6})
  console.log("pageload done")

});

// handle click and add class
button.on("click", function() {
  let word = input.val();
  console.log("Clicked");
  if (validate(word)) {
    console.log("Good word");
    let newWerd = stonksify(word);
    werdParagraph.text(newWerd);
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
