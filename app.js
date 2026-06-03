// Metronome Playlist
const STORAGE_KEY = "metronome_playlist_v1";
const DEFAULT_PLAYLIST = [
    {
        bpm: 70,
        duration: 120,
        repeats: 2,
        subdivision: "sixteenth"
    },
    {
        bpm: 80,
        duration: 60,
        repeats: 2,
        subdivision: "sixteenth"
    },
    {
        bpm: 90,
        duration: 45,
        repeats: 2,
        subdivision: "sixteenth"
    },
    {
        bpm: 100,
        duration: 30,
        repeats: 2,
        subdivision: "sixteenth"
    }
];

let playlist = loadPlaylist();

let currentItemIndex = 0;
let currentRepeat = 1;

let isPlaying = false;
let isPaused = false;

let currentRemainingSeconds = 0;

let playlistTotalSeconds = 0;
let playlistElapsedSeconds = 0;

// DOM
const playlistContainer = document.getElementById("playlistContainer");
const addItemBtn = document.getElementById("addItemBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const currentBpmEl = document.getElementById("currentBpm");
const currentIndexEl = document.getElementById("currentIndex");
const currentRepeatEl = document.getElementById("currentRepeat");
const timeLeftEl = document.getElementById("timeLeft");
const currentSubdivisionEl = document.getElementById("currentSubdivision");
const beatDisplayEl = document.getElementById("beatDisplay");
const totalDurationEl = document.getElementById("totalDuration");
const totalItemsEl = document.getElementById("totalItems");
const playlistProgressBar = document.getElementById("playlistProgressBar");
const progressRing = document.getElementById("currentProgressRing");

// Presets
const PRESETS = {
    warmup: [
        {
            bpm: 70,
            duration: 120,
            repeats: 2,
            subdivision: "sixteenth"
        },
        {
            bpm: 80,
            duration: 60,
            repeats: 2,
            subdivision: "sixteenth"
        },
        {
            bpm: 90,
            duration: 45,
            repeats: 2,
            subdivision: "sixteenth"
        },
        {
            bpm: 100,
            duration: 30,
            repeats: 2,
            subdivision: "sixteenth"
        }
    ],
    sticks: [
        {
            bpm: 70,
            duration: 60,
            repeats: 16,
            subdivision: "sixteenth"
        }
    ],
    speed: [
        {
            bpm: 80,
            duration: 60,
            repeats: 2,
            subdivision: "sixteenth"
        },
        {
            bpm: 90,
            duration: 60,
            repeats: 2,
            subdivision: "sixteenth"
        },
        {
            bpm: 100,
            duration: 60,
            repeats: 2,
            subdivision: "sixteenth"
        },
        {
            bpm: 110,
            duration: 60,
            repeats: 2,
            subdivision: "sixteenth"
        }
    ],
    practice: [
        {
            bpm: 70,
            duration: 180,
            repeats: 2,
            subdivision: "quarter"
        },
        {
            bpm: 90,
            duration: 120,
            repeats: 2,
            subdivision: "triplet"
        },
        {
            bpm: 110,
            duration: 120,
            repeats: 2,
            subdivision: "sixteenth"
        }
    ]
};

// Storage
function loadPlaylist() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [...DEFAULT_PLAYLIST];

    try {
        return JSON.parse(saved);
    }
    catch {
        return [...DEFAULT_PLAYLIST];
    }
}

function savePlaylist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
    updateSummary();
}

// Helpers
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0"));
}

function calculateTotalDuration() {
    let total = 0;
    playlist.forEach(item => { total += item.duration * item.repeats; });

    return total;
}

function updateSummary() {
    playlistTotalSeconds = calculateTotalDuration();
    totalDurationEl.textContent = formatTime(playlistTotalSeconds);
    totalItemsEl.textContent = playlist.length;
}

// Render Playlist
function renderPlaylist() {
    playlistContainer.innerHTML = "";
    const template = document.getElementById("playlistItemTemplate");

    playlist.forEach((item, index) => {
        const clone = template.content.cloneNode(true);
        const row = clone.querySelector(".playlist-item");
        const bpmInput = clone.querySelector(".bpm-input");
        const durationInput = clone.querySelector(".duration-input");
        const repeatInput = clone.querySelector(".repeat-input");
        const subdivisionSelect = clone.querySelector(".subdivision-select");
        const deleteBtn = clone.querySelector(".delete-btn");
        bpmInput.value = item.bpm;
        durationInput.value = item.duration;
        repeatInput.value = item.repeats;
        subdivisionSelect.value = item.subdivision;

        bpmInput.addEventListener("change", () => {
            item.bpm = parseInt(bpmInput.value) || 60;
            savePlaylist();
        });

        durationInput.addEventListener("change", () => {
            item.duration = parseInt(durationInput.value) || 60;
            savePlaylist();
        });

        repeatInput.addEventListener("change", () => {
            item.repeats = parseInt(repeatInput.value) || 1;
            savePlaylist();
        });

        subdivisionSelect.addEventListener("change", () => {
            item.subdivision = subdivisionSelect.value;
            savePlaylist();
        });

        deleteBtn.addEventListener("click", () => {
            playlist.splice(index, 1);
            savePlaylist();
            renderPlaylist();
        });

        playlistContainer.appendChild(clone);
    });

    updateSummary();
}

// Add Item
function addPlaylistItem() {
    playlist.push({ bpm: 100, duration: 60, repeats: 2, subdivision: "sixteenth" });

    savePlaylist();
    renderPlaylist();
}

addItemBtn.addEventListener("click", addPlaylistItem);

// Presets
document
    .querySelectorAll("[data-preset]")
    .forEach(button => {
        button.addEventListener("click", () => {
            const name = button.dataset.preset;
            playlist = JSON.parse(JSON.stringify(PRESETS[name]));
            savePlaylist();
            renderPlaylist();
        });
    });

// Initial render
renderPlaylist();
updateSummary();

// Audio Engine + Playback
let audioContext = null;

// Transport State
let beatCounter = 0;
let subdivisionCounter = 0;

let schedulerTimer = null;
let transitionTimeout = null;
let animationFrameId = null;

// Audio scheduler
let nextNoteTime = 0;

const LOOKAHEAD = 25;
const SCHEDULE_AHEAD_TIME = 0.1;

// Current item timing
let itemStartAudioTime = 0;
let itemEndAudioTime = 0;

let pausedRemaining = 0;

// Pause between playlist items
let pendingTransition = false;
let pendingTransitionDelay = 0;
let transitionStartedAt = 0;

// Beat display sync
let currentBeatLabel = "-";
let currentBeatTime = 0;

let scheduledBeats = [];
let displayedBeatIndex = -1;

// Ring
const RING_LENGTH = 327;

// Audio
function clearTransition() {
    if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
    }

    pendingTransition = false;
    pendingTransitionDelay = 0;
    transitionStartedAt = 0;
}

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    return audioContext;
}

function createClick(frequency, volume, when, duration = 0.03) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency;

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.start(when);
    osc.stop(when + duration);
}

function clearAllTimers() {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    clearTransition();
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
}

function startRestTransition(callback, delay = 5000) {
    pendingTransition = true;
    pendingTransitionDelay = delay;
    transitionStartedAt = performance.now();

    beatDisplayEl.textContent = "REST";

    scheduledBeats = [];
    displayedBeatIndex = -1;

    transitionTimeout = setTimeout(() => {
        pendingTransition = false;
        pendingTransitionDelay = 0;
        if (!isPlaying || isPaused) {
            return;
        }
        callback();
    }, delay);
}

function calculateElapsedBeforeCurrentItem() {
    let total = 0;
    for (let i = 0; i < currentItemIndex; i++) {
        total += playlist[i].duration * playlist[i].repeats;
    }

    return total;
}

function getCurrentItemProgress(item) {
    const ctx = getAudioContext();
    const elapsed = Math.max(0, ctx.currentTime - itemStartAudioTime);
    const progress = Math.min(1, elapsed / item.duration);

    return progress;
}

// Subdivisions
function getSubdivisionFactor(subdivision) {
    switch (subdivision) {
        case "quarter":
            return 1;
        case "eighth":
            return 2;
        case "triplet":
            return 3;
        case "sixteenth":
            return 4;
        default:
            return 1;
    }
}

function subdivisionLabel(subdivision, step) {
    if (subdivision === "quarter") {
        return ((step % 4) + 1).toString();
    }

    if (subdivision === "eighth") {
        const labels = ["1", "&", "2", "&", "3", "&", "4", "&"];

        return labels[step % labels.length];
    }

    if (subdivision === "triplet") {
        const labels = ["1", "tri", "plet", "2", "tri", "plet", "3", "tri", "plet", "4", "tri", "plet"];

        return labels[step % labels.length];
    }

    if (subdivision === "sixteenth") {
        const labels = ["1", "e", "&", "a", "2", "e", "&", "a", "3", "e", "&", "a", "4", "e", "&", "a"];

        return labels[step % labels.length];
    }

    return "-";
}

// UI Updates
function finishCurrentItem() {
    const item = playlist[currentItemIndex];

    stopMetronome();

    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;

    beatDisplayEl.textContent = "REST";

    if (currentRepeat < item.repeats) {
        currentRepeat++;
        transitionTimeout = setTimeout(() => {
            if (!isPlaying || isPaused) return;
            playCurrentItem();
        }, 5000);
    } else {
        currentRepeat = 1;
        currentItemIndex++;
        transitionTimeout = setTimeout(() => {
            if (!isPlaying || isPaused) return;
            playCurrentItem();
        }, 5000);

    }
}

function updatePlaybackState() {
    if (!isPlaying) return;
    if (isPaused) return;

    const item = playlist[currentItemIndex];
    if (!item) return;

    const ctx = getAudioContext();
    const remaining = Math.max(0, itemEndAudioTime - ctx.currentTime);

    currentRemainingSeconds = Math.ceil(remaining);

    const elapsedInItem = Math.min(item.duration, Math.max(0, ctx.currentTime - itemStartAudioTime));

    playlistElapsedSeconds = calculateElapsedBeforeCurrentItem() + ((currentRepeat - 1) * item.duration) + elapsedInItem;

    while (scheduledBeats.length && ctx.currentTime >= scheduledBeats[0].time) {
        const beat = scheduledBeats.shift();
        beatDisplayEl.textContent = beat.label;
        if (scheduledBeats.length > 100) {
            scheduledBeats = scheduledBeats.slice(-20);
        }
    }

    updateCurrentUI();

    if (ctx.currentTime >= itemEndAudioTime) {
        finishCurrentItem();
        return;
    }

    animationFrameId = requestAnimationFrame(updatePlaybackState);
}

function finishCurrentItem() {
    const item = playlist[currentItemIndex];
    stopMetronome();
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    if (currentRepeat < item.repeats) {
        currentRepeat++;
        startRestTransition(() => { playCurrentItem(); });
    } else {
        currentRepeat = 1;
        currentItemIndex++;
        startRestTransition(() => { playCurrentItem(); });
    }
}

function updateCurrentUI() {
    const item = playlist[currentItemIndex];

    if (!item) return;

    currentBpmEl.textContent = item.bpm;
    currentIndexEl.textContent = (currentItemIndex + 1) + " / " + playlist.length;
    currentRepeatEl.textContent = currentRepeat + " / " + item.repeats;
    currentSubdivisionEl.textContent = item.subdivision;
    timeLeftEl.textContent = formatTime(currentRemainingSeconds);

    updateRingProgress(item);

    updatePlaylistProgress();

    document
        .querySelectorAll(".playlist-item")
        .forEach((row, index) => {
            row.classList.toggle("active", index === currentItemIndex);
        });
}

function updateRingProgress(item) {
    const progress = getCurrentItemProgress(item);
    progressRing.style.strokeDashoffset = RING_LENGTH * (1 - progress);
}

function updatePlaylistProgress() {
    const percent = playlistTotalSeconds === 0 ? 0 : (playlistElapsedSeconds / playlistTotalSeconds) * 100;
    playlistProgressBar.style.width = percent + "%";
    const txt = document.getElementById("playlistProgressText");
    txt.textContent = percent.toFixed(0) + "%";
}


// Metronome
function scheduleBeat(time, strong) {
    if (strong) {
        createClick(900, 0.25, time);
    } else {
        createClick(900, 0.25, time);
    }
}

function scheduler(item) {
    const ctx = getAudioContext();
    const factor = getSubdivisionFactor(item.subdivision);
    const secondsPerStep = (60 / item.bpm) / factor;

    while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
        const strong = subdivisionCounter % factor === 0;

        const label = subdivisionLabel(item.subdivision, beatCounter);

        scheduleBeat(nextNoteTime, strong);

        scheduledBeats.push({ time: nextNoteTime, label });
        nextNoteTime += secondsPerStep;

        subdivisionCounter++;
        beatCounter++;
    }
}

function startMetronomeForItem(item) {
    clearInterval(schedulerTimer);
    const ctx = getAudioContext();
    nextNoteTime = ctx.currentTime + 0.05;

    schedulerTimer = setInterval(() => {
        if (!isPlaying) return;
        if (isPaused) return;
        scheduler(item);
    }, LOOKAHEAD);
}

// Playback Logic
function playCurrentItem() {
    clearInterval(schedulerTimer);

    const item = playlist[currentItemIndex];

    if (!item) {
        stopPlaylist();
        return;
    }

    beatCounter = 0;
    subdivisionCounter = 0;

    scheduledBeats = [];
    displayedBeatIndex = -1;

    currentBeatLabel = "-";
    currentBeatTime = 0;

    const ctx = getAudioContext();

    itemStartAudioTime = ctx.currentTime;

    itemEndAudioTime = itemStartAudioTime + item.duration;

    currentRemainingSeconds = item.duration;

    progressRing.style.strokeDashoffset = RING_LENGTH;

    updateCurrentUI();

    startMetronomeForItem(item);

    cancelAnimationFrame(animationFrameId);

    animationFrameId = requestAnimationFrame(updatePlaybackState);
}

function stopMetronome() {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
}

// Controls
async function startPlaylist() {

    if (playlist.length === 0) {
        return;
    }

    await getAudioContext().resume();

    if (isPlaying && isPaused) {
        pausePlaylist();
        return;
    }
    if (isPlaying) return;

    isPlaying = true;
    isPaused = false;

    currentItemIndex = 0;
    currentRepeat = 1;

    playlistElapsedSeconds = 0;

    playCurrentItem();
}

function pausePlaylist() {

    if (!isPlaying) return;

    isPaused = !isPaused;

    pauseBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";

    if (isPaused) {
        const ctx = getAudioContext();

        if (!pendingTransition) {
            pausedRemaining = Math.max(0, itemEndAudioTime - ctx.currentTime);
            stopMetronome();
        } else {
            clearTimeout(transitionTimeout);
            pendingTransitionDelay -= (performance.now() - transitionStartedAt);
        }

        beatDisplayEl.textContent = "PAUSED";

        return;
    }
    const ctx = getAudioContext();
    if (pendingTransition) {
        transitionStartedAt = performance.now();
        transitionTimeout = setTimeout(() => {
            pendingTransition = false;
            if (!isPlaying || isPaused) return;
            playCurrentItem();
        }, pendingTransitionDelay);

        beatDisplayEl.textContent = "REST";
        return;
    }

    const item = playlist[currentItemIndex];

    itemStartAudioTime = ctx.currentTime - (item.duration - pausedRemaining);

    itemEndAudioTime = ctx.currentTime + pausedRemaining;

    startMetronomeForItem(item);

    cancelAnimationFrame(animationFrameId);

    animationFrameId = requestAnimationFrame(updatePlaybackState);
}

function stopPlaylist() {

    isPlaying = false;
    isPaused = false;

    clearAllTimers();

    pendingTransition = false;
    pendingTransitionDelay = 0;
    transitionStartedAt = 0;

    pausedRemaining = 0;

    itemStartAudioTime = 0;
    itemEndAudioTime = 0;

    beatCounter = 0;
    subdivisionCounter = 0;

    scheduledBeats = [];
    displayedBeatIndex = -1;

    currentBeatLabel = "-";
    currentBeatTime = 0;

    currentItemIndex = 0;
    currentRepeat = 1;

    playlistElapsedSeconds = 0;

    beatDisplayEl.textContent = "-";

    currentBpmEl.textContent = "--";
    currentIndexEl.textContent = "-";
    currentRepeatEl.textContent = "-";
    currentSubdivisionEl.textContent = "-";
    timeLeftEl.textContent = "--:--";

    progressRing.style.strokeDashoffset = RING_LENGTH;

    playlistProgressBar.style.width = "0%";

    const txt = document.getElementById("playlistProgressText");

    txt.textContent = "0%";

    pauseBtn.textContent = "⏸ Pause";

    document
        .querySelectorAll(".playlist-item")
        .forEach(row => {
            row.classList.remove("active");
        });
}

// Events
startBtn.addEventListener("click", startPlaylist);
pauseBtn.addEventListener("click", pausePlaylist);
stopBtn.addEventListener("click", stopPlaylist);



// Initial
renderPlaylist();
updateSummary();
