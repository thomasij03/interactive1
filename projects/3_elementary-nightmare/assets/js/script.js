// ============================================
// SETTINGS
// ============================================

var MAX_HEALTH = 25;

// ============================================
// GAME STATE - keeps track of what has happened
// ============================================

var state = {
  tookCandy: false,
  allergicReaction: false,
  health: MAX_HEALTH,

  // which rooms Thomas knows about
  knowsAboutClassroom204: false,
  knowsAboutClassroom206: false,
  knowsAboutClassroom208: false,
  knowsAboutStairs: false,
  knowsAboutKid: false,

  // which rooms Thomas has visited
  visited204: false,
  visited206: false,

  // how many times Thomas has been to each room
  visits: {},
};

// helper: count how many times a room has been entered
function timesVisited(room) {
  return state.visits[room] || 0;
}

// ============================================
// SCENES - each scene is a place in the game
// ============================================

var SCENES = {
  // --- FRONT OF SCHOOL ---
  cover: {
    art: "cover",
    text: "The Elementary Nightmare is based on a true story, where a boy named Thomas ate a snickers bar, not knowing at the time that it contained peanuts. He had to make sure to find the Epipen to survive.",
    exits: [{ label: "Start game", to: "frontofschool" }],
  },

  frontofschool: {
    art: "frontofschool",
    map: "Floorplan_1.png",
    text: "You are standing in front of Henry Haight school.",
    dialogue: "",
    exits: [{ label: "Enter the school", to: "hallway" }],
  },

  // --- HALLWAY (main hub) ---

  hallway: {
    art: "hallway",
    map: "Floorplan_1.png",
    text: function () {
      if (timesVisited("hallway") <= 1) {
        return "You are in the hallway. You see a staircase leading upstairs.";
      }
      if (state.tookCandy) {
        return "You are back in the hallway again. You need to find that epipen fast!";
      }
      return "You are back in the hallway.";
    },
    exits: function () {
      var options = [];

      if (!state.tookCandy) {
        options.push({ label: "Go upstairs to classroom 1", to: "classroom1" });
      }
      if (state.tookCandy) {
        options.push({
          label: "Go back upstairs to classroom 1",
          to: "classroom1_after",
        });
      }
      if (state.knowsAboutClassroom204) {
        options.push({ label: "Go to classroom 204", to: "classroom204" });
      }
      if (state.knowsAboutClassroom206) {
        options.push({ label: "Go to classroom 206", to: "classroom206" });
      }
      if (state.knowsAboutClassroom208) {
        options.push({ label: "Go to classroom 208", to: "classroom208" });
      }
      if (state.knowsAboutStairs) {
        options.push({ label: "Go down the stairway", to: "stairway" });
      }

      return options;
    },
  },

  // --- CLASSROOM 1 (candy + allergic reaction) ---

  classroom1: {
    art: "classroom1",
    map: "Floorplan_3.png",
    character: "teacher1",
    text: "You are in the classroom.",
    dialogue:
      "Teacher: Hi Thomas, welcome to class! For everyone's good work, I am giving out candy!",
    exits: [{ label: "Take the candy bar", to: "took_candy" }],
  },

  took_candy: {
    art: "classroom1",
    map: "Floorplan_3.png",
    character: "teacher1",
    text: "You are in the classroom.",
    dialogue: "Teacher: Enjoy! It's a Snickers bar!",
    onEnter: function () {
      state.tookCandy = true;
    },
    exits: [{ label: "Eat the candy bar", to: "allergy_reaction" }],
  },

  allergy_reaction: {
    art: "classroom1",
    map: "Floorplan_3.png",
    character: "teacher1",
    text: "Your throat starts to close up. You are having an allergic reaction!",
    dialogue:
      "Teacher: Oh my goodness, are you allergic to peanuts? You need to get the epipen!",
    onEnter: function () {
      state.allergicReaction = true;
      state.knowsAboutClassroom204 = true;
      state.knowsAboutClassroom206 = true;
    },
    exits: [{ label: "Go to the hallway to find the epipen", to: "hallway" }],
  },

  classroom1_after: {
    art: "classroom1",
    map: "Floorplan_3.png",
    character: "teacher1",
    text: "You are back in the classroom.",
    dialogue: "Teacher: Go get the epipen right now!",
    exits: [{ label: "Go back to the hallway", to: "hallway" }],
  },

  // --- CLASSROOM 204 ---

  classroom204: {
    art: "classroom204",
    map: "Floorplan_4.png",
    character: "teacher2",
    text: function () {
      if (timesVisited("classroom204") <= 1) return "You are in classroom 204.";
      return "You are back in classroom 204 again.";
    },
    dialogue: function () {
      if (timesVisited("classroom204") <= 1)
        return "Teacher: Hi Thomas, are you okay?";
      return "Teacher: Thomas, you're back? I already told you, try the cafeteria!";
    },
    onEnter: function () {
      state.visited204 = true;
      if (state.visited204 && state.visited206) {
        state.knowsAboutClassroom208 = true;
      }
    },
    exits: function () {
      if (timesVisited("classroom204") <= 1) {
        return [
          {
            label: "No, I need the epipen. Have you seen it?",
            to: "classroom204_response",
          },
          { label: "Go back to the hallway", to: "hallway" },
        ];
      }
      return [{ label: "Go back to the hallway", to: "hallway" }];
    },
  },

  classroom204_response: {
    art: "classroom204",
    map: "Floorplan_4.png",
    character: "teacher2",
    text: "You are in classroom 204.",
    dialogue:
      "Teacher: I think I saw it in the cafeteria. I am not too sure. Look around!",
    exits: [{ label: "Go to the hallway", to: "hallway" }],
  },

  // --- CLASSROOM 206 ---

  classroom206: {
    art: "classroom206",
    map: "Floorplan_5.png",
    character: "teacher3",
    text: function () {
      if (timesVisited("classroom206") <= 1) return "You are in classroom 206.";
      return "You are back in classroom 206. The teacher is still in her meeting.";
    },
    dialogue: function () {
      if (timesVisited("classroom206") <= 1) {
        return "Teacher: Oh I am sorry Thomas but I am in the middle of a meeting. Please check back later, I am too busy.";
      }
      return "Teacher: Thomas, I told you I am busy! Please, I cannot help you right now!";
    },
    onEnter: function () {
      state.visited206 = true;
      if (state.visited204 && state.visited206) {
        state.knowsAboutClassroom208 = true;
      }
    },
    exits: function () {
      if (timesVisited("classroom206") <= 1) {
        return [{ label: "Go back to the hallway", to: "hallway" }];
      }
      return [{ label: "Go back to the hallway", to: "hallway" }];
    },
  },

  // --- CLASSROOM 208 ---

  classroom208: {
    art: "classroom208",
    map: "Floorplan_7.png",
    character: "teacher4",
    text: function () {
      if (timesVisited("classroom208") <= 1) return "You are in classroom 208.";
      return "You are back in classroom 208.";
    },
    dialogue: function () {
      if (timesVisited("classroom208") <= 1) {
        return "Teacher: Oh my god Thomas, do you have an allergic reaction?";
      }
      return "Teacher: Thomas, you're back! Did you try the janitor's office downstairs? Hurry!";
    },
    exits: function () {
      if (timesVisited("classroom208") <= 1) {
        return [
          {
            label: "Yes, do you know where the epipen is?",
            to: "classroom208_response",
          },
          { label: "Go back to the hallway", to: "hallway" },
        ];
      }
      return [{ label: "Go back to the hallway", to: "hallway" }];
    },
  },

  classroom208_response: {
    art: "classroom208",
    map: "Floorplan_7.png",
    character: "teacher4",
    text: "You are in classroom 208.",
    dialogue:
      "Teacher: No, but I have heard it is somewhere in the cafeteria or downstairs.",
    exits: [
      { label: "Keep asking questions", to: "classroom208_followup" },
      { label: "Go back to the hallway", to: "hallway" },
    ],
  },

  classroom208_followup: {
    art: "classroom208",
    map: "Floorplan_7.png",
    character: "teacher4",
    text: "You are in classroom 208.",
    dialogue:
      "Teacher: Perhaps try the janitor's office, they keep track of everything in this school.",
    onEnter: function () {
      state.knowsAboutStairs = true;
    },
    exits: [{ label: "Go back to the hallway", to: "hallway" }],
  },

  // --- STAIRWAY + KID ---

  stairway: {
    art: "stairway",
    map: "Floorplan_6.png",
    text: function () {
      if (timesVisited("stairway") <= 1) {
        return "You start heading down the stairway to the lower floor.";
      }
      return "You are back at the stairway. You know the way down now.";
    },
    dialogue: "",
    exits: function () {
      if (state.knowsAboutKid) {
        return [
          { label: "Head downstairs", to: "downstairs" },
          { label: "Go back to the hallway", to: "hallway" },
        ];
      }
      return [
        { label: "Go down the stairs", to: "annoying_kid" },
        { label: "Go back to the hallway", to: "hallway" },
      ];
    },
  },

  annoying_kid: {
    art: "stairway",
    map: "Floorplan_9.png",
    character: "kid",
    text: "A kid blocks your path at the bottom of the stairs.",
    dialogue:
      "Kid: Hey Thomas what's up, you want to play right now? It's recess!",
    exits: [
      { label: "No I can't play right now", to: "kid_no" },
      { label: "I don't care, we should play", to: "kid_play" },
    ],
  },

  kid_no: {
    art: "stairway",
    map: "Floorplan_9.png",
    character: "kid",
    text: "The kid looks disappointed.",
    dialogue: "Kid: Aww come on! Just for a little bit?",
    exits: [
      { label: "I really can't, I need to find something", to: "kid_escape" },
    ],
  },

  kid_play: {
    art: "stairway",
    map: "Floorplan_9.png",
    character: "kid",
    text: "The kid lights up.",
    dialogue: "Kid: Sure, I have to go to the bathroom first though!",
    exits: [{ label: "Okay, I'll meet you there!", to: "kid_escape" }],
  },

  kid_escape: {
    art: "stairway",
    map: "Floorplan_9.png",
    character: "kid",
    text: "The kid runs off. The path is clear.",
    dialogue: "Kid: Okay see you out there!",
    onEnter: function () {
      state.knowsAboutKid = true;
    },
    exits: [{ label: "Head downstairs", to: "downstairs" }],
  },

  // --- DOWNSTAIRS + CAFETERIA ---

  downstairs: {
    art: "cafeteria",
    map: "Floorplan_9.png",
    text: function () {
      if (timesVisited("downstairs") <= 1) {
        return "You are now downstairs. You see doors to the cafeteria and the janitor's office.";
      }
      return "You are back downstairs. The hallway looks familiar now.";
    },
    dialogue: "",
    exits: [
      { label: "Go to the cafeteria", to: "cafeteria" },
      { label: "Go to the janitor's office", to: "janitor_office" },
      { label: "Go back up the stairs", to: "hallway" },
    ],
  },

  cafeteria: {
    art: "cafeteria",
    map: "Floorplan_10.png",
    text: function () {
      if (timesVisited("cafeteria") <= 1) {
        return "You enter the cafeteria. No one seems to be around. It is completely empty.";
      }
      return "You enter the cafeteria again. It is still empty. Nobody has come.";
    },
    dialogue: "",
    exits: [
      { label: "Call out — any teacher around?", to: "cafeteria_callout" },
      { label: "Go back downstairs", to: "downstairs" },
    ],
  },

  cafeteria_callout: {
    art: "cafeteria",
    map: "Floorplan_10.png",
    text: "Your voice echoes through the empty cafeteria. Nothing. No one is here.",
    dialogue: "...silence.",
    exits: [
      { label: "Try calling out again", to: "cafeteria_callout2" },
      { label: "Give up and leave", to: "downstairs" },
    ],
  },

  cafeteria_callout2: {
    art: "cafeteria",
    map: "Floorplan_10.png",
    text: "Still nothing. There is definitely no one here right now.",
    dialogue: "You are completely alone in the cafeteria.",
    exits: [{ label: "Leave the cafeteria", to: "downstairs" }],
  },

  // --- JANITOR'S OFFICE (where the epipen is) ---

  janitor_office: {
    art: "janitor_office",
    map: "Floorplan_11.png",
    character: "janitor",
    text: "You burst into the janitor's office. It is packed with supplies and cleaning equipment.",
    dialogue: "Janitor: Whoa, whoa, slow down kid! What's going on?",
    exits: [
      {
        label: "I'm having an allergic reaction! I need the epipen!",
        to: "janitor_response",
      },
      { label: "Go back downstairs", to: "downstairs" },
    ],
  },

  janitor_response: {
    art: "janitor_office",
    map: "Floorplan_11.png",
    character: "janitor",
    text: "The janitor's eyes go wide. He rushes to a cabinet on the wall.",
    dialogue: "Janitor: The epipen! Yes, I have it right here! Hold on!",
    exits: [{ label: "Take the epipen!", to: "win" }],
  },

  // --- WIN + GAME OVER ---

  win: {
    art: "janitor_office",
    map: "Floorplan_11.png",
    character: "janitor",
    noHealthDrain: true,
    text: "You use the epipen. Within moments you start to feel better. You made it just in time!",
    dialogue:
      "Janitor: There you go, kid. You're going to be okay. Let's get you to the nurse.",
    exits: [{ label: "Play again", to: "restart" }],
  },

  game_over: {
    art: "classroom1",
    map: "Floorplan_1.png",
    noHealthDrain: true,
    text: "Your vision blurs and you collapse. The allergic reaction was too severe. You didn't find the epipen in time.",
    dialogue:
      "A teacher finds you and calls 911. You are rushed to the hospital.",
    exits: [{ label: "Try again", to: "restart" }],
  },
};

// ============================================
// GAME ENGINE - runs the game
// ============================================

var isTransitioning = false;
var currentArt = "";
var FADE_STEPS = [0.2, 0.4, 0.6, 0.8, 1];
var STEP_MS = 70;

// Remember the state of the map
var mapVisible = false;

function toggleMap() {
  mapVisible = !mapVisible;
  var mapEl = document.getElementById("map");
  var mapBtn = document.getElementById("map-button");
  if (mapVisible) {
    mapEl.style.display = "block";
    mapBtn.textContent = "Hide Map (M)";
  } else {
    mapEl.style.display = "none";
    mapBtn.textContent = "Show Map (M)";
  }
}

// reads a scene property that might be a function or a plain value
function getValue(property) {
  if (typeof property === "function") return property();
  return property;
}

// update the health bar display
function updateHealthBar() {
  var fill = document.getElementById("health-fill");
  if (!state.allergicReaction) {
    fill.style.visibility = "hidden";
    return;
  }
  fill.style.visibility = "visible";
  var pct = (state.health / MAX_HEALTH) * 100;
  fill.style.width = pct + "%";
  fill.className = "";
  if (pct <= 25) fill.className = "low";
  else if (pct <= 50) fill.className = "medium";
}

// stepped screen fade (like an old video game)
function stepFade(fade, steps, index, callback) {
  if (index >= steps.length) {
    callback();
    return;
  }
  fade.style.opacity = steps[index];
  setTimeout(function () {
    stepFade(fade, steps, index + 1, callback);
  }, STEP_MS);
}

// show a scene on screen
function renderScene(sceneId) {
  var scene = SCENES[sceneId];

  // update the images
  var sceneImg = document.getElementById("scene-img");
  var newSrc = "assets/images/" + scene.art + ".png";
  if (!sceneImg.src.endsWith(newSrc)) {
    sceneImg.src = newSrc;
  }

  // update the map for this scene
  var mapEl = document.getElementById("map");
  if (scene.map) {
    mapEl.src = "assets/images/maps/" + scene.map;
  }

  // update the character image
  var characterImg = document.getElementById("character-img");
  if (scene.character) {
    var charSrc = "assets/images/" + scene.character + ".png";
    if (!characterImg.src.endsWith(charSrc)) {
      characterImg.src = charSrc;
    }
    characterImg.style.display = "block";
    characterImg.setAttribute("data-character", scene.character);
  } else {
    characterImg.style.display = "none";
  }

  // update the text
  document.getElementById("narrative").textContent = getValue(scene.text);
  document.getElementById("dialogue").textContent =
    getValue(scene.dialogue) || "";

  // create the choice buttons
  var exits = getValue(scene.exits);
  var choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  exits.forEach(function (exit) {
    var btn = document.createElement("button");
    btn.textContent = exit.label;
    btn.onclick = function () {
      goTo(exit.to);
    };
    choicesDiv.appendChild(btn);
  });
}

// reset everything for a new game
function resetState() {
  state.tookCandy = false;
  state.allergicReaction = false;
  state.health = MAX_HEALTH;
  state.knowsAboutClassroom204 = false;
  state.knowsAboutClassroom206 = false;
  state.knowsAboutClassroom208 = false;
  state.knowsAboutStairs = false;
  state.knowsAboutKid = false;
  state.visited204 = false;
  state.visited206 = false;
  state.visits = {};
}

// go to a new scene (this is the main game function)
function goTo(sceneId) {
  // handle restart
  if (sceneId === "restart") {
    resetState();
    currentArt = "";
    goTo("cover");
    return;
  }

  // don't allow clicking during a fade
  if (isTransitioning) return;

  var scene = SCENES[sceneId];

  // count this visit
  state.visits[sceneId] = (state.visits[sceneId] || 0) + 1;

  // run the scene's onEnter code (if it has any)
  if (scene.onEnter) scene.onEnter();

  // lose health after the allergic reaction
  if (state.allergicReaction && !scene.noHealthDrain) {
    state.health--;
    if (state.health <= 0) {
      state.health = 0;
      updateHealthBar();
      goTo("game_over");
      return;
    }
  }

  updateHealthBar();

  // fade transition if the background art changed
  if (scene.art !== currentArt) {
    var fade = document.getElementById("scene-fade");
    isTransitioning = true;
    stepFade(fade, FADE_STEPS, 0, function () {
      renderScene(sceneId);
      currentArt = scene.art;
      stepFade(fade, FADE_STEPS.slice().reverse(), 0, function () {
        fade.style.opacity = 0;
        isTransitioning = false;
      });
    });
  } else {
    renderScene(sceneId);
  }
}

// Map toggle interactions
document.getElementById("map-button").addEventListener("click", toggleMap);
document.addEventListener("keydown", function (e) {
  if (e.key === "m" || e.key === "M") toggleMap();
});

// ── COVER SCREEN LOGIC ──
(function () {
  var coverScreen = document.getElementById("cover-screen");
  var coverFade = document.getElementById("cover-fade");
  var startBtn = document.getElementById("cover-start-btn");

  function dismissCover() {
    startBtn.disabled = true;
    stepFade(coverFade, FADE_STEPS, 0, function () {
      coverScreen.style.display = "none";
      coverFade.style.opacity = 0;
    });
  }

  startBtn.addEventListener("click", dismissCover);
  document.addEventListener("keydown", function (e) {
    if (
      !coverScreen.classList.contains("hidden") &&
      (e.key === "Enter" || e.key === " ")
    ) {
      dismissCover();
    }
  });
})();

// Pre-load the first real scene behind the cover screen
goTo("frontofschool");
