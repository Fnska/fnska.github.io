
// =========================
// Metronome Playlist
// Part 1
// =========================

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

// =========================
// DOM
// =========================

const playlistContainer =
    document.getElementById("playlistContainer");

const addItemBtn =
    document.getElementById("addItemBtn");

const startBtn =
    document.getElementById("startBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const stopBtn =
    document.getElementById("stopBtn");

const exportBtn =
    document.getElementById("exportBtn");

const importFile =
    document.getElementById("importFile");

const currentBpmEl =
    document.getElementById("currentBpm");

const currentIndexEl =
    document.getElementById("currentIndex");

const currentRepeatEl =
    document.getElementById("currentRepeat");

const timeLeftEl =
    document.getElementById("timeLeft");

const currentSubdivisionEl =
    document.getElementById("currentSubdivision");

const beatDisplayEl =
    document.getElementById("beatDisplay");

const totalDurationEl =
    document.getElementById("totalDuration");

const totalItemsEl =
    document.getElementById("totalItems");

const playlistProgressBar =
    document.getElementById("playlistProgressBar");

const progressRing =
    document.getElementById("currentProgressRing");

// =========================
// Presets
// =========================

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

// =========================
// Storage
// =========================

function loadPlaylist() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved)
        return [...DEFAULT_PLAYLIST];

    try {
        return JSON.parse(saved);
    }
    catch {
        return [...DEFAULT_PLAYLIST];
    }
}

function savePlaylist() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(playlist)
    );

    updateSummary();
}

// =========================
// Helpers
// =========================

function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0")
        +
        ":"
        +
        String(seconds).padStart(2, "0")
    );
}

function calculateTotalDuration() {

    let total = 0;

    playlist.forEach(item => {

        total +=
            item.duration *
            item.repeats;

    });

    return total;
}

function updateSummary() {

    playlistTotalSeconds =
        calculateTotalDuration();

    totalDurationEl.textContent =
        formatTime(
            playlistTotalSeconds
        );

    totalItemsEl.textContent =
        playlist.length;
}

// =========================
// Render Playlist
// =========================

function renderPlaylist() {

    playlistContainer.innerHTML = "";

    const template =
        document.getElementById(
            "playlistItemTemplate"
        );

    playlist.forEach((item, index) => {

        const clone =
            template.content
                .cloneNode(true);

        const row =
            clone.querySelector(
                ".playlist-item"
            );

        const bpmInput =
            clone.querySelector(
                ".bpm-input"
            );

        const durationInput =
            clone.querySelector(
                ".duration-input"
            );

        const repeatInput =
            clone.querySelector(
                ".repeat-input"
            );

        const subdivisionSelect =
            clone.querySelector(
                ".subdivision-select"
            );

        const deleteBtn =
            clone.querySelector(
                ".delete-btn"
            );

        bpmInput.value =
            item.bpm;

        durationInput.value =
            item.duration;

        repeatInput.value =
            item.repeats;

        subdivisionSelect.value =
            item.subdivision;

        bpmInput.addEventListener(
            "change",
            () => {

                item.bpm =
                    parseInt(
                        bpmInput.value
                    ) || 60;

                savePlaylist();
            }
        );

        durationInput.addEventListener(
            "change",
            () => {

                item.duration =
                    parseInt(
                        durationInput.value
                    ) || 60;

                savePlaylist();
            }
        );

        repeatInput.addEventListener(
            "change",
            () => {

                item.repeats =
                    parseInt(
                        repeatInput.value
                    ) || 1;

                savePlaylist();
            }
        );

        subdivisionSelect.addEventListener(
            "change",
            () => {

                item.subdivision =
                    subdivisionSelect.value;

                savePlaylist();
            }
        );

        deleteBtn.addEventListener(
            "click",
            () => {

                playlist.splice(
                    index,
                    1
                );

                savePlaylist();
                renderPlaylist();
            }
        );

        playlistContainer.appendChild(
            clone
        );
    });

    updateSummary();
}

// =========================
// Add Item
// =========================

function addPlaylistItem() {

    playlist.push({
        bpm: 100,
        duration: 60,
        repeats: 2,
        subdivision: "sixteenth"
    });

    savePlaylist();
    renderPlaylist();
}

addItemBtn.addEventListener(
    "click",
    addPlaylistItem
);

// =========================
// Presets
// =========================

document
    .querySelectorAll(
        "[data-preset]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const name =
                    button.dataset.preset;

                playlist =
                    JSON.parse(
                        JSON.stringify(
                            PRESETS[name]
                        )
                    );

                savePlaylist();
                renderPlaylist();
            }
        );
    });

// =========================
// Initial render
// =========================

renderPlaylist();
updateSummary();


// =========================
// Part 2
// Audio Engine + Playback
// =========================

let audioContext = null;

let metronomeTimer = null;
let countdownTimer = null;

let beatCounter = 0;
let subdivisionCounter = 0;

let pausedAt = null;
let resumeTimeout = null;
let transitionTimeout = null;

const RING_LENGTH = 327;

// =========================
// Audio
// =========================

function clearTransition() {
    if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
    }
}

function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    return audioContext;
}

function createClick(
    frequency,
    volume,
    duration = 0.05
) {

    const ctx =
        getAudioContext();

    const osc =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    osc.type = "sine";

    osc.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        volume,
        ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    osc.stop(
        ctx.currentTime + duration
    );
}

function strongBeat() {

    createClick(
        900,
        0.25
    );
}

function weakBeat() {

    // createClick(
    //     900,
    //     0.12
    // );

    createClick(
        900,
        0.25
    );
}

// =========================
// Subdivisions
// =========================

function getSubdivisionFactor(
    subdivision
) {

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

function subdivisionLabel(
    subdivision,
    step
) {

    if (
        subdivision === "quarter"
    ) {

        return (
            (step % 4) + 1
        ).toString();
    }

    if (
        subdivision === "eighth"
    ) {

        const labels =
            [
                "1",
                "&",
                "2",
                "&",
                "3",
                "&",
                "4",
                "&"
            ];

        return labels[
            step % labels.length
        ];
    }

    if (
        subdivision === "triplet"
    ) {

        const labels =
            [
                "1",
                "tri",
                "plet",
                "2",
                "tri",
                "plet",
                "3",
                "tri",
                "plet",
                "4",
                "tri",
                "plet"
            ];

        return labels[
            step % labels.length
        ];
    }

    if (
        subdivision ===
        "sixteenth"
    ) {

        const labels =
            [
                "1",
                "e",
                "&",
                "a",
                "2",
                "e",
                "&",
                "a",
                "3",
                "e",
                "&",
                "a",
                "4",
                "e",
                "&",
                "a"
            ];

        return labels[
            step % labels.length
        ];
    }

    return "-";
}

// =========================
// UI Updates
// =========================

function updateCurrentUI() {

    const item =
        playlist[
        currentItemIndex
        ];

    if (!item)
        return;

    currentBpmEl.textContent =
        item.bpm;

    currentIndexEl.textContent =
        (
            currentItemIndex + 1
        )
        +
        " / "
        +
        playlist.length;

    currentRepeatEl.textContent =
        currentRepeat
        +
        " / "
        +
        item.repeats;

    currentSubdivisionEl.textContent =
        item.subdivision;

    timeLeftEl.textContent =
        formatTime(
            currentRemainingSeconds
        );

    updateRingProgress(
        item
    );

    updatePlaylistProgress();

    document
        .querySelectorAll(
            ".playlist-item"
        )
        .forEach(
            (
                row,
                index
            ) => {

                row.classList.toggle(
                    "active",
                    index ===
                    currentItemIndex
                );

            }
        );
}

function updateRingProgress(
    item
) {

    const ratio =
        currentRemainingSeconds
        /
        item.duration;

    const offset =
        RING_LENGTH * ratio;

    progressRing.style
        .strokeDashoffset =
        offset;
}

function updatePlaylistProgress() {

    const percent =
        playlistTotalSeconds === 0
            ? 0
            :
            (
                playlistElapsedSeconds
                /
                playlistTotalSeconds
            ) * 100;

    playlistProgressBar
        .style.width =
        percent + "%";

    const txt =
        document
            .getElementById(
                "playlistProgressText"
            );

    txt.textContent =
        percent.toFixed(0)
        + "%";
}

// =========================
// Metronome
// =========================

function startMetronomeForItem(
    item
) {

    clearInterval(
        metronomeTimer
    );

    beatCounter = 0;
    subdivisionCounter = 0;

    const factor =
        getSubdivisionFactor(
            item.subdivision
        );

    const intervalMs =
        (
            60000
            /
            item.bpm
        )
        /
        factor;

    metronomeTimer =
        setInterval(
            () => {

                if (!isPlaying || isPaused) return;

                const strong =
                    subdivisionCounter
                    %
                    factor
                    === 0;

                if (strong) {

                    strongBeat();

                } else {

                    weakBeat();
                }

                beatDisplayEl
                    .textContent =
                    subdivisionLabel(
                        item.subdivision,
                        beatCounter
                    );

                beatCounter++;
                subdivisionCounter++;

            },
            intervalMs
        );
}

// =========================
// Playback Logic
// =========================

function playCurrentItem() {
    clearInterval(metronomeTimer);
    clearInterval(countdownTimer);
    clearTransition();

    const item = playlist[currentItemIndex];

    if (!item) {
        stopPlaylist();
        return;
    }

    currentRemainingSeconds = item.duration;

    updateCurrentUI();

    startMetronomeForItem(item);

    countdownTimer = setInterval(() => {
        if (!isPlaying || isPaused) return;

        currentRemainingSeconds--;
        playlistElapsedSeconds++;

        updateCurrentUI();

        if (currentRemainingSeconds <= 0) {
            clearInterval(countdownTimer);
            clearInterval(metronomeTimer);

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
    }, 1000);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function stopMetronome() {
    clearInterval(metronomeTimer);
    metronomeTimer = null;
}

// =========================
// Controls
// =========================

async function startPlaylist() {

    if (
        playlist.length === 0
    )
        return;

    await getAudioContext()
        .resume();

    if (
        isPlaying &&
        isPaused
    ) {

        isPaused = false;

        return;
    }

    if (
        isPlaying
    )
        return;

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

    pauseBtn.textContent =
        isPaused
            ? "▶ Resume"
            : "⏸ Pause";

    if (isPaused) {
        stopMetronome();
        beatDisplayEl.textContent = "PAUSED";
    } else {
        const item = playlist[currentItemIndex];
        if (item) {
            startMetronomeForItem(item);
        }
    }
}

function stopPlaylist() {

    isPlaying = false;

    isPaused = false;

    clearTransition();
    clearInterval(metronomeTimer);
    clearInterval(countdownTimer);

    stopMetronome();

    currentItemIndex = 0;

    currentRepeat = 1;

    playlistElapsedSeconds = 0;

    beatDisplayEl.textContent =
        "-";

    currentBpmEl.textContent =
        "--";

    currentIndexEl.textContent =
        "-";

    currentRepeatEl.textContent =
        "-";

    currentSubdivisionEl.textContent =
        "-";

    timeLeftEl.textContent =
        "--:--";

    progressRing.style
        .strokeDashoffset =
        RING_LENGTH;

    playlistProgressBar
        .style.width =
        "0%";

    pauseBtn.textContent =
        "⏸ Pause";

    document
        .querySelectorAll(
            ".playlist-item"
        )
        .forEach(
            row =>
                row.classList.remove(
                    "active"
                )
        );
}

// =========================
// Events
// =========================

startBtn.addEventListener(
    "click",
    startPlaylist
);

pauseBtn.addEventListener(
    "click",
    pausePlaylist
);

stopBtn.addEventListener(
    "click",
    stopPlaylist
);


// =========================
// Part 3
// Drag & Drop + Import/Export
// =========================

// =========================
// Drag & Drop Reordering
// =========================





// =========================
// Export / Import
// =========================

function exportPlaylist() {

    const data =
        JSON.stringify(
            playlist,
            null,
            2
        );

    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement(
            "a"
        );

    a.href =
        url;

    a.download =
        "metronome-playlist.json";

    a.click();

    URL.revokeObjectURL(url);
}

function importPlaylist(file) {

    const reader =
        new FileReader();

    reader.onload =
        (e) => {

            try {

                playlist =
                    JSON.parse(
                        e.target.result
                    );

                savePlaylist();

                renderPlaylist();

            } catch (err) {

                alert(
                    "Invalid file"
                );
            }

        };

    reader.readAsText(file);
}

// =========================
// Bind UI
// =========================

exportBtn.addEventListener(
    "click",
    exportPlaylist
);

importFile.addEventListener(
    "change",
    (e) => {

        const file =
            e.target.files[0];

        if (file) {

            importPlaylist(file);
        }

    }
);

// =========================
// Initial
// =========================

renderPlaylist();
updateSummary();
