const iframe = document.querySelector("iframe");

const iframeContainer = iframe.parentElement;

const gamepadStatusEl = document.getElementById("gamepad-status");

const outputSelectEl = document.getElementById("output-select");

const midiSignalEl = document.getElementById("midi-signals");

let lastTimestamp = undefined;

let midiDevice = undefined;

let synth = undefined; // Variable to hold the Tone.js synth

main();

function main() {

  window.addEventListener("gamepadconnected", updateGamePads);

  window.addEventListener("gamepadconnected", updateGamePads);

  navigator.requestMIDIAccess().then(processMidiOutputs);

}

function updateGamePads() {

  const gamepad = navigator.getGamepads()[0];

  if (gamepad) {

    gamepadStatusEl.innerText = gamepad.id;

    iframe.classList.add("active");

    gamePadProcessLoop();

  } else {

    gamepadStatusEl.innerText = "(disconnected)";

    iframe.classList.remove("active");

  }

}

function gamePadProcessLoop() {

  requestAnimationFrame(gamePadProcessLoop);

  const gamepad = navigator.getGamepads()[0]; // Re-query to get latest gamepad state.

  if (!gamepad || lastTimestamp >= gamepad.timestamp) {

    return;

  }

  lastTimestamp = gamepad.timestamp;

  const midiMessages = convertGamepadInputToMidi(gamepad);

  if (synth) {

    midiMessages.forEach((message) => synth.triggerAttackRelease(message));

  }

  renderTable(midiMessages);

}

function convertGamepadInputToMidi(gamepad) {

  const buttonMessages = gamepad.buttons.map((button, i) => {

    return {

      pitch: i,

      velocity: button.value

    };

  });

  const axesMessages = gamepad.axes.map((axis, i) => {

    return {

      pitch: i + gamepad.buttons.length,

      velocity: (axis / 2 + 0.5)

    };

  });

  return [...buttonMessages, ...axesMessages];

}

function processMidiOutputs(midiAccess) {

  outputSelectEl.innerHTML = "";

  function selectMidiOutput(id) {

    midiDevice = midiAccess.outputs.get(id);

    // Create a virtual MIDI synth using Tone.js

    if (id === "virtual-synth") {

      synth = new Tone.PolySynth().toDestination();

    }

  }

  outputSelectEl.onchange = (event) => selectMidiInput(event.target.value);

  // Add the virtual synth option to the output select element

  const virtualSynthOption = document.createElement("option");

  virtualSynthOption.text = "Virtual Synth";

  virtualSynthOption.value = "virtual-synth";

  outputSelectEl.options.add(virtualSynthOption);

  for (const output of midiAccess.outputs.values()) {

    const option = document.createElement("option");

    option.text = output.name;

    option.value = output.id;

    outputSelectEl.options.add(option);

  }

  if (outputSelectEl.firstChild) {

    selectMidiOutput(outputSelectEl.firstChild.value);

  } else {

    const option = document.createElement("option");

    option.text = "(none found)";

    option.disabled = true;

    outputSelectEl.options.add(option);

  }

  outputSelectEl.firstChild.selected = true;

}

function renderTable(midiMessages) {

  const columns = [

    ["COMMAND ", "CHAN", "PTCH", "VELO"],

    ...midiMessages.map((message, index) => [

      "NOTE ON ",

      "1", // Assuming channel 1 for all messages

      message.pitch,

      Math.round(message.velocity * 127),

    ]),

  ].map((row) => row.map((cell) => cell.toString().padStart(6)).join(""));

  midiSignalEl.innerText = columns.join("\n");

}


