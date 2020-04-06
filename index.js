const input = $("#word");
const output = $("#wordstonked");
const submitButton = $("#submit");
const shareButton = $("#share");
const downloadButton = $("#download");
const wordList = $("#wordlist");
const devMode = isLocal();

const maxWordLength = 22;

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
if (!devMode) {
  //https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
  imageObj.crossOrigin = "anonymous";
  //No console statements on production
  //https://stackoverflow.com/questions/7042611/override-console-log-for-production
  let console = {};
  console.log = function () { };
  console.groupCollapsed = function () { };
  console.groupEnd = function () { };
}

imageObj.onload = function () {
  ctx.drawImage(imageObj, 0, 0);
  //Need to add word only after the image is loaded, otherwise no image will appear

  let urlWord = getURLWord();
  if (urlWord) {
    //input.val goes before enterWord to generate correct URL with params in address bar
    input.val(urlWord);
    enterWord(urlWord);
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
  // jackson -> jonkson
  ["jack", "jonk", 1000],
  // fuck -> frick
  ["fuck", "frick", 1000],
  // huge -> yuge
  ["huge", "yuge", 1000],
  // tech -> tehc
  ["([a-z]+)(ch)", "$1hc", 1],
  // word -> werd
  ["^wo([^e])", "we$1", 1],
  // stock -> stonk, but note e missing to exclude not funny examples like section -> sention
  ["([^^][aouy])(c)", "$1n", 1],
  // soncer -> sonker - this rule exists to transform words with 'cc' to something funnier and more pronouncable
  ["nc", "nk", 1],
  // computer -> komputer
  ["^c([^e])", "k$1", 1],
  // health -> helf
  ["ealth", "elf", 1],
  // super -> sooper, support -> soopport
  ["up([^p])", "oop$1", 1],
  // moon -> mun, boobs -> bubs, moo -> mu
  ["([^^s])oo", "$1u", 1],
  // buisness -> bizness
  ["([^^])usi", "$1iz", 1],
  // daniel -> doniel, jackson -> jonkson
  ["([^^])(an|ac)", "$1on", 1],
  // jad -> jed
  ["([^^e])ad", "$1ed", 1],
  // math -> meth
  ["([^^ed])a([" + consonants + "])", "$1e$2", 1],
  // thick -> thicc
  ["ck", "cc", 1],
  // action -> aktion
  ["ac", "ak", 1]
];

// sorts rules to conform to above comment order. Priority and then rule regex length desc
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

input.on("keyup", function (e) {
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
  // adds a span to display "Link Copied"
  // then, styles the text above the input field's position and animates the text to float upward before removing from the dom
  shareButton.after('<span id="copied_popup">Link Copied!</span>');
  let copiedLeft = shareButton.offset().left - 100;
  let copiedTop = shareButton.offset().top + 30
  let copiedPopup = $("#copied_popup")
    .offset({
      top: copiedTop,
      left: copiedLeft
    })
    .animate({ top: "-=15" }, 400, "swing");

  setTimeout(function () {
    copiedPopup.fadeOut(300, function () {
      $(this).remove();
    })
  }, 1000);
});

downloadButton.on("click", function () {
  let link = document.createElement("a");
  link.download = getDisplayedWord() + ".png";
  try {
    link.href = canvas.toDataURL();
    link.click();
    downloadButton.text("Downloaded!");
  } catch {
    console.log(
      'Image can\'t be downloaded unless running on a server. Try "python -m SimpleHTTPServer 8000"'
    );
  }
});

function getURLWord() {
  let url = new URL(window.location.href);
  return url.searchParams.get("word");
}

function copyToClipboard() {
  //https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard
  let urlWord = getURLWord();
  let copyWord = urlWord ? urlWord : input.val();
  let copyText = "https://stonksify.com/?word=" + encodeURI(copyWord);
  const fakeInput = document.createElement("textarea");
  fakeInput.value = copyText;
  $("body").append(fakeInput);
  fakeInput.select();
  document.execCommand("copy");
  document.body.removeChild(fakeInput);
}

function enterWord(word) {
  if (validate(word)) {
    console.log("Valid word: " + word);
    let werds = getStonksifiedWords(word);
    let newWerd = getTopStonksifiedWord(werds);
    displayAllStonksifiedWords(werds);
    drawWordOnCanvas(newWerd);
    shareButton.prop("disabled", false);
    shareButton.text("Share");
    downloadButton.prop("disabled", false);
    downloadButton.text("Download");
    try {
      history.pushState(null, "", "/?word=" + input.val());
    } catch {
      console.log(
        'URL parameter can\'t be generated unless running on a server. Try "python -m SimpleHTTPServer 8000"'
      );
    }
  }
}

function getTextXCoordinate(newWerd) {
  //Calculate proper x coordinate based on text length
  let xCoordinate = 430;
  let rightPadding = 60;
  let difference =
    canvas.width - (xCoordinate + ctx.measureText(newWerd).width);
  if (difference < rightPadding) {
    xCoordinate = xCoordinate + difference - rightPadding;
  }
  return xCoordinate;
}

function drawWordOnCanvas(newWerd) {
  console.log("Start Draw");
  //Clear canvas before drawing new word
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Redraw image
  ctx.drawImage(imageObj, 0, 0);
  //Get x coordinate
  let xCoordinate = getTextXCoordinate(newWerd);
  //Draw text multiple times so the white radial shadow is more pronounced
  for (let i = 0; i < 10; i++) {
    ctx.fillText(newWerd, xCoordinate, 350);
  }
  ctx.strokeText(newWerd, xCoordinate, 350);
  ctx.strokeText(newWerd, xCoordinate, 350);
  console.log("End Draw");
}

function validate(word) {
  if (word.length > maxWordLength) {
    alert(`Max entry is ${maxWordLength} characters.`);
    return false;
  }
  if (!word) {
    alert("Please enter a valid word");
    return false;
  }
  return true;
}

function getStonksifiedWords(s) {
  // allstonkswords is the set of final stonkified permutations to be returned
  let allStonksWords = new Set();
  let sLower = s.toLowerCase();
  let wordsList = sLower.split(" ");
  console.groupCollapsed("Regex Details: " + sLower);

  allStonksWords.add(wordsList.join(" "));
  for (let i = 0; i < stonksifyRules.length; i++) {
    let toReplace = new RegExp(stonksifyRules[i][0]);
    let replaceWith = stonksifyRules[i][1];

    // for each word in the string to be stonked
    for (let ii = 0; ii < wordsList.length; ii++) {
      // apply rule to word at ii
      let newWord = wordsList[ii].replace(toReplace, replaceWith);
      wordsList[ii] = newWord;
      console.log(
        `Stonksify rule ${i} (${newWord}): replace regexp ${toReplace} + with '${replaceWith}.`
      );
      if (newWord != wordsList[ii]) {
        console.log(`Rule applied, created werd ${newWord}.`);
      }
    }

    // add stonkified word to list of combinations to return
    allStonksWords.add(wordsList.join(" "));
  }
  console.groupEnd();
  return allStonksWords;
}

function getTopStonksifiedWord(words) {
  return Array.from(words).pop();
}

function displayAllStonksifiedWords(words) {
  let wordsArray = Array.from(words);
  wordList.html("");
  for (let i = 0; i < wordsArray.length; i++) {
    let pword = wordsArray[i];
    wordList.append(
      `<button class="wordoptions ${
      i === wordsArray.length - 1 ? "selectedword" : ""
      }" onclick="clickedPossibleWords('${pword}')">` +
      pword +
      "</button>"
    );
  }
}

function getDisplayedWord() {
  return $(".selectedword").text();
}

function clickedPossibleWords(word) {
  $(".wordoptions").each(function (index) {
    if ($(this).text() === word) {
      $(this)
        .toggleClass("selectedword")
        .siblings()
        .removeClass("selectedword");
    }
  });
  drawWordOnCanvas(word);
}

function testStonksify() {
  //Imported testWords from words.js
  for (const key of Object.keys(testWords)) {
    let words = getStonksifiedWords(key);
    let stonksWord = getTopStonksifiedWord(words);
    if (stonksWord === testWords[key]) {
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
  $("body").prepend("<p class='alert'>DEVELOPER MODE</p>");
}

if (devMode) {
  addDevModeMessageBox();
  testStonksify();
}
