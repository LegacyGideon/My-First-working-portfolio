

const gamePattern = [];
const userClickedPattern = [];
let gameLevel = 0;
let gameStarted = false;
let acceptingUserClicks = false;

const itemsColours = ["red", "blue", "green", "yellow"];
let audioContext = null;

function initAudio() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtor) {
        return;
    }

    if (!audioContext) {
        audioContext = new AudioCtor();
    }
}

function playTone(color) {
    initAudio();

    if (!audioContext) {
        return;
    }

    const tones = {
        green: 329.63,
        red: 220,
        yellow: 261.63,
        blue: 392,
    };

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = tones[color] || 261.63;

    gainNode.gain.value = 0.08;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, 220);
}

function flashColor(color) {
    const $button = $("." + color);
    $button.addClass("pressed");
    playTone(color);

    setTimeout(() => {
        $button.removeClass("pressed");
    }, 220);
}

function updateTitle(text) {
    $("#level-title").text(text);
}

function beginNextRound() {
    acceptingUserClicks = false;
    $("#game-status").text("Watch the pattern...");

    const randomNumber = Math.floor(Math.random() * itemsColours.length);
    const computerChosenColor = itemsColours[randomNumber];

    gamePattern.push(computerChosenColor);

    gamePattern.forEach((color, index) => {
        setTimeout(() => {
            flashColor(color);
        }, index * 600);
    });

    setTimeout(() => {
        acceptingUserClicks = true;
        $("#game-status").text("Your turn — repeat the pattern.");
    }, gamePattern.length * 600);
}

function startGame() {
    initAudio();
    gamePattern.length = 0;
    userClickedPattern.length = 0;
    gameLevel = 0;
    gameStarted = true;
    acceptingUserClicks = false;
    $("body").removeClass("game-over");
    $("#start-button").text("Restart Game");

    gameLevel++;
    updateTitle("Level " + gameLevel);
    $("#game-status").text("Get ready...");
    beginNextRound();
}

function endGame() {
    $("body").addClass("game-over");
    updateTitle("Game over");
    $("#game-status").text("You reached level " + gameLevel + ". Start again when you’re ready.");
    $("#start-button").text("Play Again");

    gamePattern.length = 0;
    userClickedPattern.length = 0;
    gameLevel = 0;
    gameStarted = false;
    acceptingUserClicks = false;

    setTimeout(() => {
        $("body").removeClass("game-over");
    }, 700);
}

$(".btn").on("click", function () {
    if (!gameStarted || !acceptingUserClicks) {
        return;
    }

    const userClickedColor = itemsColours.find((color) => this.classList.contains(color));

    if (!userClickedColor) {
        return;
    }

    userClickedPattern.push(userClickedColor);
    flashColor(userClickedColor);

    const clickedIndex = userClickedPattern.length - 1;

    if (gamePattern[clickedIndex] === userClickedColor) {
        if (userClickedPattern.length === gamePattern.length) {
            userClickedPattern.length = 0;
            gameLevel++;
            updateTitle("Level " + gameLevel);
            setTimeout(beginNextRound, 700);
        }
        return;
    }

    endGame();
});

$("#start-button").on("click", function () {
    startGame();
});

$("#year").text(new Date().getFullYear());