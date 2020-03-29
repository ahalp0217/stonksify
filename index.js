const input = $("#word");
const output = $("#wordstonked");
const button = $("button");
const canvas = document.getElementById("stonkscanvas");
const context = canvas.getContext("2d");
const imageObj = new Image();
const vowels = "aeiouy";
const consonants = "";
// rules have format [regex_to_replace, text_to_insert, priority]
// rules are executed in a sorted manner by priortiy, rule regex length
// default
let rules = [
  ["([a-z]+)(ch)", "$1hc", 1],
  ["([aiouy])(c)", "$1n", 1],
  ["nc", "nk", 1],
  ["^c", "k", 1]
];

const stonksifyRules = rules.sort(function compare(a, b) {
  if (a[2] > b[2]) return -1;
  else if (a[2] < b[2]) return 1;
  else {
    if (a[0].length > b[0].length) return -1;
    else if (a[0].length < b[0].length) return 1;
    else return 0;
  }
});

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
  let modifiedCharacters = Array.apply(null, Array(word.length)).map(
    function() {
      return 0;
    }
  );

  word = word.toLowerCase();
  for (let i = 0; i < stonksifyRules.length; i++) {
    let toReplace = new RegExp(stonksifyRules[i][0]);
    let replaceWith = stonksifyRules[i][1];
    let newWord = word.replace(toReplace, replaceWith);
    console.log(
      "Stonksify rule " +
        i +
        ": replace regexp '" +
        toReplace +
        "' with '" +
        replaceWith +
        "'."
    );

    let changedCharactersModified = false;
    let changedCharactersIndexesChanged = [];
    for (let ii = 0; ii < modifiedCharacters.length; ii++) {
      if (word[ii] != newWord[ii]) {
        if (modifiedCharacters[ii] != 0) {
          changedCharactersModified = true;
          console.log(
            "Rejecting applciation of rule '" +
              toReplace +
              "' because it changes already changed character at " +
              ii +
              "."
          );
          break;
        } else {
          changedCharactersIndexesChanged.push(ii);
        }
      }
    }

    if (!changedCharactersModified) {
      for (let ii = 0; ii < changedCharactersIndexesChanged.length; ii++) {
        modifiedCharacters[changedCharactersIndexesChanged[ii]] = 1;
      }
      word = newWord;
    }
  }
  return word;
}
