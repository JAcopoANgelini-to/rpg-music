const audioPlayer = document.getElementById("audioPlayer");

const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const trackList = document.getElementById("trackList");


/* =========================================
   LIBRERIA
========================================= */

let library = [];

let currentFolder = null;

let folderHistory = [];

let tracks = [];

let currentTrackIndex = 0;

/* =========================================
   CARICAMENTO MUSIC.JSON
========================================= */

fetch("data/music.json")
    .then(response => {

        if (!response.ok) {
            throw new Error("Impossibile caricare music.json");
        }

        return response.json();

    })
    .then(data => {

        library = data.library;

        currentFolder = library;

        renderFolder();

    })
    .catch(error => {

        console.error(
            "Errore nel caricamento della libreria:",
            error
        );

    });


/* =========================================
   FORMATTAZIONE TEMPO
========================================= */

function formatTime(seconds) {

    if (isNaN(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


/* =========================================
   MOSTRA CARTELLA
========================================= */

function renderFolder() {

    trackList.innerHTML = "";

    /*
        Puliamo la lista dei brani
        della cartella corrente.
    */

    tracks = [];

    /*
        Pulsante INDIETRO
    */

    if (currentFolder !== library) {

        const backButton =
            document.createElement("button");

        backButton.className = "folder";

        backButton.innerHTML = `
            ← Indietro
        `;

        backButton.addEventListener(
            "click",
            goBack
        );

        trackList.appendChild(backButton);

    }


    /*
        Elementi della cartella
    */

    currentFolder.forEach(item => {

        /*
            CARTELLA
        */

        if (item.type === "folder") {

            const folderElement =
                document.createElement("div");

            folderElement.className = "folder";

            folderElement.innerHTML = `
                <div class="folder-icon">
                    📁
                </div>

                <div class="folder-name">
                    ${item.name}
                </div>
            `;

            folderElement.addEventListener(
                "click",
                () => {

                    folderHistory.push(currentFolder);

                    currentFolder =
                        item.children;

                    renderFolder();

                }
            );

            trackList.appendChild(folderElement);

        }


        /*
            CANZONE
        */

        if (item.type === "track") {

            tracks.push(item);

            const trackElement =
                document.createElement("div");

            trackElement.className = "track";

            const trackIndex =
                tracks.length - 1;

            trackElement.innerHTML = `

                <div class="track-number">
                    ${trackIndex + 1}
                </div>

                <div class="track-cover">
                    🎵
                </div>

                <div class="track-details">

                    <div class="track-title">
                        ${item.title}
                    </div>

                    <div class="track-artist">
                        ${item.artist}
                    </div>

                </div>

                <button class="download-button">
                    ↓ Download
                </button>

            `;


            /*
                CLICK SULLA CANZONE
            */

            trackElement.addEventListener(
                "click",
                event => {

                    /*
                        Evitiamo che il click
                        sul Download riproduca
                        la canzone.
                    */

                    if (
                        event.target.classList.contains(
                            "download-button"
                        )
                    ) {
                        return;
                    }

                    currentTrackIndex =
                        trackIndex;

                    loadTrack(trackIndex);

                    audioPlayer.play();

                    playButton.textContent = "⏸";

                }
            );


            /*
                DOWNLOAD
            */

            const downloadButton =
                trackElement.querySelector(
                    ".download-button"
                );

            downloadButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    downloadTrack(item);

                }
            );


            trackList.appendChild(trackElement);

        }

    });

}


/* =========================================
   INDIETRO
========================================= */

function goBack() {

    if (folderHistory.length === 0) {
        return;
    }

    currentFolder =
        folderHistory.pop();

    renderFolder();

}


/* =========================================
   CARICA BRANO
========================================= */

function loadTrack(index) {

    const track = tracks[index];

    if (!track) {
        return;
    }

    audioPlayer.src = track.file;

    currentTitle.textContent =
        track.title;

    currentArtist.textContent =
        track.artist;

    progressBar.value = 0;

}


/* =========================================
   PLAY / PAUSE
========================================= */

function togglePlay() {

    if (!audioPlayer.src) {
        return;
    }

    if (audioPlayer.paused) {

        audioPlayer.play();

        playButton.textContent = "⏸";

    } else {

        audioPlayer.pause();

        playButton.textContent = "▶";

    }

}


/* =========================================
   PROSSIMO BRANO
========================================= */

function nextTrack() {

    if (tracks.length === 0) {
        return;
    }

    currentTrackIndex++;

    if (
        currentTrackIndex >=
        tracks.length
    ) {
        currentTrackIndex = 0;
    }

    loadTrack(currentTrackIndex);

    audioPlayer.play();

    playButton.textContent = "⏸";

}


/* =========================================
   BRANO PRECEDENTE
========================================= */

function previousTrack() {

    if (tracks.length === 0) {
        return;
    }

    currentTrackIndex--;

    if (currentTrackIndex < 0) {

        currentTrackIndex =
            tracks.length - 1;

    }

    loadTrack(currentTrackIndex);

    audioPlayer.play();

    playButton.textContent = "⏸";

}


/* =========================================
   PROGRESS BAR
========================================= */

audioPlayer.addEventListener(
    "timeupdate",
    () => {

        if (!audioPlayer.duration) {
            return;
        }

        const progress =
            (
                audioPlayer.currentTime /
                audioPlayer.duration
            ) * 100;

        progressBar.value = progress;

        currentTime.textContent =
            formatTime(
                audioPlayer.currentTime
            );

    }
);


/* =========================================
   DURATA
========================================= */

audioPlayer.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(
                audioPlayer.duration
            );

    }
);


/* =========================================
   SEEK
========================================= */

progressBar.addEventListener(
    "input",
    () => {

        if (!audioPlayer.duration) {
            return;
        }

        audioPlayer.currentTime =
            (
                progressBar.value /
                100
            ) *
            audioPlayer.duration;

    }
);


/* =========================================
   VOLUME
========================================= */

volumeBar.addEventListener(
    "input",
    () => {

        audioPlayer.volume =
            volumeBar.value;

    }
);


/* =========================================
   EVENTI PLAYER
========================================= */

playButton.addEventListener(
    "click",
    togglePlay
);

nextButton.addEventListener(
    "click",
    nextTrack
);

previousButton.addEventListener(
    "click",
    previousTrack
);


/* =========================================
   FINE BRANO
========================================= */

audioPlayer.addEventListener(
    "ended",
    () => {

        nextTrack();

    }
);


/* =========================================
   DOWNLOAD
========================================= */

function downloadTrack(track) {

    const link =
        document.createElement("a");

    link.href = track.file;

    link.download = "";

    document.body.appendChild(link);

    link.click();

    link.remove();

}