const input = $("#word");
const output = $("#wordstonked");
const submitButton = $("#submit");
const shareButton = $("#share");
const devMode = isLocal();

const url = new URL(window.location.href);
const urlGetWord = url.searchParams.get("word");

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
imageObj.onload = function() {
  ctx.drawImage(imageObj, 10, 10);
  //Need to add word only after the image is loaded, otherwise no image will appear
  if (urlGetWord) {
    enterWord(urlGetWord);
  }
};
imageObj.src = "stonks.jpg";

const vowels = "aeiouy";
const consonants = "bcdfghjklmnpqrstvwxz";
// rules have format [regex_to_replace, text_to_insert, priority]
// rules are executed in a sorted manner by priortiy, then rule regex length
// default
let rules = [
  // moon -> mun supercedes all
  ["moon", "mun", 1000],
  // tech -> tehc
  ["([a-z]+)(ch)", "$1hc", 1],
  // stock -> stonk, but note e missing to exclude not funny examples like section -> sention
  ["([aiouy])(c)", "$1n", 1],
  // soncer -> sonker - this rule exists to transform words with 'cc' to something funnier and more pronouncable
  ["nc", "nk", 1],
  // computer -> komputer
  ["^c", "k", 1],
  // health -> helf
  ["ealth", "elf", 1],
  // super -> sooper, support -> soopport
  ["up([^p])", "oop$1", 1],
  // moon -> mün, boobs -> bübs, moo -> mü
  ["([^^])oo", "$1ü", 1]
];

// sorts rules to conform to above comment order. Priority and then rule regex length
const stonksifyRules = rules.sort(function compare(a, b) {
  // sort by priority
  if (a[2] > b[2]) return -1;
  else if (a[2] < b[2]) return 1;
  // sort by regex length
  else {
    if (a[0].length > b[0].length) return -1;
    else if (a[0].length < b[0].length) return 1;
    else return 0;
  }
});

input.on("keyup", function(e) {
  if (e.which === 13) {
    console.log("Hit Enter");
    enterWord(input.val());
  }
});

submitButton.on("click", function () {
  console.log("Clicked Submit");
  enterWord(input.val());
});

shareButton.on("click", function () {
  copyToClipboard();
  shareButton.text("Copied to Clipboard!")
});

function copyToClipboard() {
  //https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard
  let copyWord = urlGetWord ? urlGetWord : input.val();
  let copyText = "https://stonksify.com/?word=" + copyWord;
  const fakeInput = document.createElement('textarea');
  fakeInput.value = copyText;
  $("body").append(fakeInput);
  fakeInput.select();
  document.execCommand('copy');
  document.body.removeChild(fakeInput);
}

function enterWord(word) {
  if (validate(word)) {
    console.log("Valid word: " + word);
    let newWerd = stonksify(word);
    drawWordOnCanvas(newWerd);
    shareButton.prop('disabled', false);
    shareButton.text("Share")
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
  word = word.toLowerCase();
  console.groupCollapsed("Regex Details: " + word);
  for (let i = 0; i < stonksifyRules.length; i++) {
    let toReplace = new RegExp(stonksifyRules[i][0]);
    let replaceWith = stonksifyRules[i][1];
    let newWord = word.replace(toReplace, replaceWith);
    console.log(
      `Stonksify rule ${i}: replace regexp ${toReplace} + with '${replaceWith}.`
    );
    word = newWord;
  }
  console.groupEnd();
  return word;
}

function testStonksify() {
  //Imported testWords from words.js
  for (const key of Object.keys(testWords)) {
    if (stonksify(key) === testWords[key]) {
      colorTrace("Test Passed ✔️: " + key + " == " + testWords[key], "green");
    } else {
      colorTrace("Test Failed ❌: " + key + " != " + testWords[key], "red");
    }
  }
}

function colorTrace(msg, color) {
  console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
}

function isLocal() {
  if (!location.hostname) {
    return true;
  }
}

function addDevModeMessageBox() {
  $('body').prepend("<p class='alert'>DEVELOPER MODE</p>");
}

if (devMode) {
  addDevModeMessageBox();
  testStonksify();
}