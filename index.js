const input = $("#word");
const output = $("#wordstonked");
const submitButton = $("#submit");
const shareButton = $("#share");
const downloadButton = $("#download");
const wordList = $("#wordlist");
const isDevModeOnLoad = isLocal();
let devMode = isLocal();

const maxWordLength = 22;

if (!devMode) {
  console.log(`
  █▀ ▀█▀ █▀█ █▄░█ █▄▀ █▀ █ █▀▀ █▄█
  ▄█ ░█░ █▄█ █░▀█ █░█ ▄█ █ █▀░ ░█░`)
}

//Canvas Settings
const canvas = document.getElementById("stonkscanvas");
const ctx = canvas.getContext("2d");
ctx.shadowColor = "#fff";
ctx.shadowBlur = 50;
ctx.fillStyle = "#fff";
ctx.strokeStyle = "#000";

//Load image
const imageObj = new Image();
imageObj.src = "stonks.jpg";

if (!isDevModeOnLoad) {
  //https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
  imageObj.crossOrigin = "anonymous";
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
  // great -> gret
  ["great", "gret", 1000],
  // fame -> feim
  ["([a-z]+)(ame)", "$1aym", 2],
  // build -> bild
  ["([" + consonants + "])(uil)", "$1il", 2],
  // cybernetically -> cyberneticcly
  ["cally$", "ccly", 2],
  // enhance -> enhonce
  ["ance", "once", 2],
  // house -> haus
  ["ouse$", "aus", 2],
  // tech -> tehc
  ["([a-z]+)(ch)", "$1hc", 1],
  // word -> werd
  ["^wo([^e])", "we$1", 1],
  // stock -> stonk, but note e missing to exclude not funny examples like section -> sention
  ["([^^][aouy])(c)(?![ot])", "$1n", 1],
  // // soncer -> sonker - this rule exists to transform words with 'cc' to something funnier and more pronouncable
  // ["once", "onke", 1],
  // computer -> komputer - "h" added to prevent "china" -> "khina"
  ["^c((?!ed|er)[^hy])", "k$1", 1],
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
  ["ck$", "cc", 1],
  // action -> aktion
  ["ac", "ak", 1],
  //simpson -> sompson
  ["sim", "som", 1],
  //drunk -> dronk
  ["unk", "onk", 1],
  //poker -> ponker, think -> thonk
  ["(o|in)k", "onk", 1],
  // frog -> freg
  ["og", "eg", 1],
  // fire -> fier (no double e's allowed)
  ["ire", "ier", 1],
  // bonk -> bonmk
  ["on([" + consonants + "])(s|)$", "onm$1$2", 1],
  // emes -> ems
  ["emes$", "ems", 1],
  // doctor -> doktor
  ["oct", "okt", 1],
  // engineer -> enjineer
  ["gin", "jin", 1],


  ["([^e])re$", "$1er", 1],
  // "coffee" -> "coffay"
  ["offee", "offay", 1],
  // "hello" -> "hullo"
  ["ell", "ull", 1],
  // "pizza" -> "pizze"
  ["zza", "zze", 1],
  // "internet" -> "internoot"
  ["net$", "nit", 1],
  // "money" -> "monay"
  ["ey$", "ay", 1],
  // "burger" -> "borgar"
  ["urge", "orga", 1],
  // "chicken" -> "chikkin"
  ["cken", "kkin", 1],
  // "cheese" -> "cheez"
  ["ese", "eez", 1],
  // "potato" -> "potatoe"
  ["ato$", "atoe", 1],
  // "tomato" -> "tomatoe"
  ["ato$", "atoe", 1],
  // "banana" -> "bananar"
  ["ana$", "anar", 1],
  // "apple" -> "appl"
  ["le$", "l", 1],
  // "orange" -> "oranj"
  ["(!" + vowels + ")ge$", "$1j", 1],
  // "grape" -> "grap"
  ["pe$", "p", 1],
  // "strawberry" -> "strawberri"
  ["ry$", "ri", 1],
  // "chocolate" -> "chocolat"
  ["(" + vowels + ")(t)e$", "$1$2", 1],
  // "caramel" -> "caramell"
  ["(!" + vowels + ")el$", "$1ell", 1],
  // "peanut" -> "peenut"
  ["ea(" + consonants + ")", "ee$1", 1],
  // "hazelnut" -> "hazelnoot"
  ["ut$", "oot", 1],
  // "pistachio" -> "pistachoe"
  ["io$", "oe", 1],
  // "macadamia" -> "macadamea"
  ["ia$", "ea", 1],
  // "pecan" -> "pekan"
  ["ec(" + consonants + ")", "ek$1", 1],
  // "walnut" -> "walnoot"
  ["ut$", "oot", 1],
  // "cashew" -> "cashoo"
  ["ew$", "oo", 1],
  // "brazil" -> "brazill"
  ["il$", "ill", 1],
  // "coconut" -> "cocoanoot"
  ["ut$", "oot", 1],
  // "date" -> "daet"
  ["ate", "aet", 1],
  // "fig" -> "feg"
  ["ig$", "eg", 1],
  // light -> lite
  ["ight", "ite", 1],
  // "kiwi" -> "kewi"
  ["iwi", "ewi", 1],
  // "mango" -> "mangoe"
  ["o$", "oe", 1],
  // "peach" -> "pech"
  ["ach", "ech", 1],
  // "pear" -> "per"
  ["ear", "er", 1],
  // "plum" -> "plom"
  ["um", "om", 1],
  // "raspberry" -> "raspberri"
  ["ry$", "ri", 1],
  // "hello" -> "hullo"
  ["ello", "ullo", 1],
  // "goodbye" -> "gudbye"
  ["ood", "ud", 1],
  // "please" -> "pleez"
  ["ease", "eez", 1],
  // "thank" -> "thunk"
  ["ank", "unk", 1],
  // "you" -> "u"
  ["you", "u", 1],
  // "are" -> "r"
  ["are", "r", 1],
  // "the" -> "da"
  ["^the$", "^da$", 1],
  // spicy -> spiccy
  ["icy$", "iccy", 1],
  // "and" -> "nd"
  ["and", "nd", 1],
  // "for" -> "4"
  ["for", "4", 1],
  // "have" -> "hav"
  ["have", "hav", 1],
  // "with" -> "wif"
  ["with", "wif", 1],
  // "this" -> "dis"
  ["this", "dis", 1],
  // "that" -> "dat"
  ["that", "dat", 1],
  // "from" -> "frum"
  ["from", "frum", 1],
  // "they" -> "dey"
  ["they", "dey", 1],
  // "will" -> "wil"
  ["will", "wil", 1],
  // "would" -> "wud"
  ["would", "wud", 1],
  // "there" -> "dere"
  ["there", "dere", 1],
  // "their" -> "der"
  ["their", "der", 1],
  // "what" -> "wut"
  ["what", "wut", 1],
  // "about" -> "abot"
  ["about", "abot", 1],
  // "which" -> "wich"
  ["which", "wich", 1],
  // "when" -> "wen"
  ["when", "wen", 1],
  // "make" -> "mek"
  ["ake", "ek", 1],
  // "can" -> "kan"
  ["can", "kan", 1],
  // "like" -> "lyk"
  ["like", "lyk", 1],
  // "time" -> "tym"
  ["ime", "ym", 1],
  // "just" -> "jus"
  ["just", "jus", 1],
  // "know" -> "no"
  ["know", "no", 1],
  // "take" -> "tek"
  ["ake", "ek", 1],
  // "people" -> "peepol"
  ["ople", "opol", 1],
  // "year" -> "yer"
  ["year", "yer", 1],
  // "your" -> "ur"
  ["your", "ur", 1],
  // "good" -> "gud"
  ["ood", "ud", 1],
  // "some" -> "sum"
  ["some", "sum", 1],
  // "could" -> "cud"
  ["ould", "ud", 1],
  // "them" -> "dem"
  ["them", "dem", 1],
  // "see" -> "c"
  ["see", "c", 1],
  // "other" -> "othr"
  ["other", "othr", 1],
  // "than" -> "den"
  ["than", "den", 1],
  // "then" -> "den"
  ["then", "den", 1],
  // "look" -> "luk"
  ["ook", "uk", 1],
  // "only" -> "onli"
  ["nly$", "nli", 1],
  // "come" -> "cum"
  ["ome", "um", 1],
  // "its" -> "it's"
  ["its", "it's", 1],
  // "over" -> "ovr"
  ["over", "ovr", 1],
  // "think" -> "thnk"
  ["ink", "nk", 1],
  // "also" -> "alsu"
  ["o$", "u", 1],
  // "back" -> "bak"
  ["ack", "ak", 1],
  // "after" -> "afta"
  ["ter$", "ta", 1],
  // "use" -> "us"
  ["use", "us", 1],
  // "two" -> "2"
  ["two", "2", 1],
  // "how" -> "haw"
  ["ow", "aw", 1],
  // "our" -> "r"
  ["our", "r", 1],
  // "work" -> "wrk"
  ["ork", "rk", 1],
  // "first" -> "1st"
  ["first", "1st", 1],
  // "well" -> "wel"
  ["ell", "el", 1],
  // "way" -> "wey"
  ["ay$", "ey", 1],
  // "even" -> "evn"
  ["even$", "evn", 1],
  // "new" -> "nu"
  ["ew$", "u", 1],
  // "want" -> "wnt"
  ["ant", "nt", 1],
  // "because" -> "bcuz"
  ["because", "bcuz", 1],
  // "any" -> "ne"
  ["any", "ne", 1],
  // "these" -> "deez"
  ["these", "deez", 1],
  // "give" -> "giv"
  ["ive", "iv", 1],
  // "day" -> "dey"
  ["ay$", "ey", 1],
  // "most" -> "moast"
  ["ost", "oast", 1],
  // "us" -> "us"
  ["us", "us", 1]
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
    log("Hit Enter");
    enterWord(input.val());
  }
});

submitButton.on("click", function () {
  log("Clicked Submit");
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
    log(
      'Image can\'t be downloaded unless running on a server. Try "python -m SimpleHTTPServer 8000"'
    );
  }
});

//Create logging functions to toggle logging between dev and prod modes
function log(text, style = "") {
  if (devMode) {
    console.log(text, style);
  }
}

function groupCollapsed(text) {
  if (devMode) {
    console.groupCollapsed(text);
  }
}

function groupEnd(text) {
  if (devMode) {
    console.groupEnd(text);
  }
}

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
    log("Valid word: " + word);
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
      log(
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
  log("Start Draw");
  ctx.font = "40pt Impact";
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

  ctx.font = "10pt Arial"
  ctx.fillText("stonksify.com", 5, 460);
  log("End Draw");
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
  let lockedWords = Array(wordsList).fill(false); //Used for hardcoded lookup/replace
  groupCollapsed("Regex Details: " + sLower);

  allStonksWords.add(wordsList.join(" "));
  for (let i = 0; i < stonksifyRules.length; i++) {
    let toReplace = new RegExp(stonksifyRules[i][0]);
    let replaceWith = stonksifyRules[i][1];

    // for each word in the string to be stonked
    for (let j = 0; j < wordsList.length; j++) {
      let originalWord = wordsList[j];
      if (!lockedWords[j] && !devMode && originalWord in hardCodedDictionary) { //Only run this on prod, need to run test cases locally without hardcoded lookup to see if regex working
        let hardCodedValue = hardCodedDictionary[originalWord];
        wordsList[j] = hardCodedValue;
        log(`Hardcoded match found! Replacing ${originalWord} with ${hardCodedValue}`);
        lockedWords[j] = true;
      }
      if (!lockedWords[j]) {
        // apply rule to word at j
        let newWord = wordsList[j].replace(toReplace, replaceWith);
        wordsList[j] = newWord;
        log(
          `Stonksify rule ${i} (${newWord}): replace regexp ${toReplace} + with '${replaceWith}.`
        );
      }
    }
    // add stonkified word to list of combinations to return
    allStonksWords.add(wordsList.join(" "));
  }
  groupEnd();
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
  let numTestCasesPassed = 0;
  let numTestCasesFailed = 0;
  for (const key of Object.keys(testWords)) {
    let words = getStonksifiedWords(key);
    let stonksWord = getTopStonksifiedWord(words);
    if (stonksWord === testWords[key]) {
      colorTrace("Test Passed ✔️: " + key + " == " + testWords[key], "green");
      numTestCasesPassed++;
    } else {
      colorTrace("Test Failed ❌: " + key + " != " + testWords[key], "red");
      numTestCasesFailed++;
    }
    console.log("\n")
  }
  console.log("-----------------------------------------------")
  colorTrace(`Total cases passed: ${numTestCasesPassed} ✔️`);
  colorTrace(`Total cases failed: ${numTestCasesFailed} ❌`);
  if (numTestCasesFailed > 0 && devMode) {
    $("body").prepend(`<p class="failed">Failed Test Cases: ${numTestCasesFailed}. See console for details.</p>`)
  }
}

function colorTrace(msg, color) {
  log("%c" + msg, "color:" + color + ";font-weight:bold;");
}

function isLocal() {
  if (!location.hostname) {
    return true;
  }
}

function addDevModeMessageBox() {
  $("body").prepend("<p class='alert' id='devOn'><a class='devLink'>DEVELOPER MODE ON</a></p>");
}

if (devMode) {
  addDevModeMessageBox();
  testStonksify();
}

//Toggle Dev Mode on Local
$(".devLink").on("click", function () {
  if (devMode) {
    $(".devLink").text("DEVELOPER MODE OFF");
    $(".alert").attr("id", "devOff");
  }
  else if (!devMode) {
    $(".devLink").text("DEVELOPER MODE ON");
    $(".alert").attr("id", "devOn");
  }

  devMode = !devMode;
  //Rerun word if there is one
  if (input.val()) {
    enterWord(input.val());
  }

});