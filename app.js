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


// =========================================
// NAVIGAZIONE
// =========================================

const navItems = document.querySelectorAll(".nav-item");

let library = [];
let currentFolder = null;
let folderHistory = [];

let tracks = [];
let currentTrackIndex = 0;

let allTracks = [];


// =========================================
// CARICAMENTO MUSIC.JSON
// =========================================

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

        allTracks = getAllTracks(library);

        renderFolder();

    })
    .catch(error => {

        console.error(
            "Errore nel caricamento della libreria:",
            error
        );

    });


// =========================================
// TROVA TUTTE LE CANZONI
// =========================================

function getAllTracks(items) {

    let result = [];

    items.forEach(item => {

        if (item.type === "track") {

            result.push(item);

        }

        if (
            item.type === "folder" &&
            item.children
        ) {

            result = result.concat(
                getAllTracks(item.children)
            );

        }

    });

    return result;
}


// =========================================
// FORMATTAZIONE TEMPO
// =========================================

function formatTime(seconds) {

    if (isNaN(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


// =========================================
// MOSTRA CARTELLA
// =========================================

function renderFolder() {

    trackList.innerHTML = "";

    tracks = [];

    // Titolo

    const title = document.createElement("h2");

    title.textContent = "Libreria";

    trackList.appendChild(title);


    // Pulsante indietro

    if (currentFolder !== library) {

        const backButton =
            document.createElement("button");

        backButton.className = "folder";

        backButton.innerHTML = `
            <div class="folder-icon">←</div>
            <div class="folder-name">Indietro</div>
        `;

        backButton.addEventListener(
            "click",
            goBack
        );

        trackList.appendChild(backButton);

    }


    // Elementi

    currentFolder.forEach(item => {


        // =====================================
        // CARTELLA
        // =====================================

        if (item.type === "folder") {

            const folderElement =
                document.createElement("div");

            folderElement.className =
                "folder";

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

                    folderHistory.push(
                        currentFolder
                    );

                    currentFolder =
                        item.children;

                    renderFolder();

                }
            );

            trackList.appendChild(
                folderElement
            );

        }


        // =====================================
        // CANZONE
        // =====================================

        if (item.type === "track") {

            addTrackToList(item);

        }

    });

}


// =========================================
// AGGIUNGI CANZONE ALLA LISTA
// =========================================

function addTrackToList(track) {

    tracks.push(track);

    const trackIndex =
        tracks.length - 1;

    const trackElement =
        document.createElement("div");

    trackElement.className =
        "track";

    trackElement.innerHTML = `

        <div class="track-number">
            ${trackIndex + 1}
        </div>

        <div class="track-cover">
            🎵
        </div>

        <div class="track-details">

            <div class="track-title">
                ${track.title}
            </div>

            <div class="track-artist">
                ${track.artist}
            </div>

        </div>

        <button class="download-button">
            ↓ Download
        </button>

    `;


    // Click canzone

    trackElement.addEventListener(
        "click",
        event => {

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


    // Download

    const downloadButton =
        trackElement.querySelector(
            ".download-button"
        );

    downloadButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            downloadTrack(track);

        }
    );


    trackList.appendChild(
        trackElement
    );

}


// =========================================
// INDIETRO
// =========================================

function goBack() {

    if (folderHistory.length === 0) {
        return;
    }

    currentFolder =
        folderHistory.pop();

    renderFolder();

}


// =========================================
// HOME / LIBRERIA
// =========================================

function showLibrary() {

    currentFolder = library;

    folderHistory = [];

    renderFolder();

}


// =========================================
// RICERCA
// =========================================

function showSearch() {

    trackList.innerHTML = "";

    tracks = [];

    const searchTitle =
        document.createElement("h2");

    searchTitle.textContent =
        "Cerca";

    trackList.appendChild(
        searchTitle
    );


    const searchInput =
        document.createElement("input");

    searchInput.type = "text";

    searchInput.placeholder =
        "Cerca una canzone...";

    searchInput.className =
        "search-input";

    trackList.appendChild(
        searchInput
    );


    const results =
        document.createElement("div");

    results.className =
        "search-results";

    trackList.appendChild(
        results
    );


    searchInput.focus();


    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .toLowerCase()
                    .trim();


            results.innerHTML = "";

            tracks = [];


            if (!query) {

                return;

            }


            const matchingTracks =
                allTracks.filter(track => {

                    const title =
                        track.title
                            .toLowerCase();

                    const artist =
                        track.artist
                            .toLowerCase();

                    return (
                        title.includes(query) ||
                        artist.includes(query)
                    );

                });


            if (
                matchingTracks.length === 0
            ) {

                results.innerHTML = `
                    <p>
                        Nessun brano trovato.
                    </p>
                `;

                return;

            }


            matchingTracks.forEach(
                track => {

                    addTrackToSearchResults(
                        track,
                        results
                    );

                }
            );

        }
    );

}


// =========================================
// RISULTATI RICERCA
// =========================================

function addTrackToSearchResults(
    track,
    container
) {

    const trackElement =
        document.createElement("div");

    trackElement.className =
        "track";


    trackElement.innerHTML = `

        <div class="track-cover">
            🎵
        </div>

        <div class="track-details">

            <div class="track-title">
                ${track.title}
            </div>

            <div class="track-artist">
                ${track.artist}
            </div>

        </div>

        <button class="download-button">
            ↓ Download
        </button>

    `;


    trackElement.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "download-button"
                )
            ) {
                return;
            }

            /*
                Per la ricerca utilizziamo
                direttamente il brano.
            */

            audioPlayer.src =
                track.file;

            currentTitle.textContent =
                track.title;

            currentArtist.textContent =
                track.artist;

            audioPlayer.play();

            playButton.textContent =
                "⏸";

        }
    );


    const downloadButton =
        trackElement.querySelector(
            ".download-button"
        );

    downloadButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            downloadTrack(track);

        }
    );


    container.appendChild(
        trackElement
    );

}


// =========================================
// CARICA BRANO
// =========================================

function loadTrack(index) {

    const track =
        tracks[index];

    if (!track) {
        return;
    }

    audioPlayer.src =
        track.file;

    currentTitle.textContent =
        track.title;

    currentArtist.textContent =
        track.artist;

    progressBar.value = 0;

}


// =========================================
// PLAY / PAUSE
// =========================================

function togglePlay() {

    if (!audioPlayer.src) {
        return;
    }

    if (audioPlayer.paused) {

        audioPlayer.play()
            .then(() => {

                playButton.textContent = "⏸";

            })
            .catch(error => {

                console.error(
                    "Errore durante il play:",
                    error
                );

            });

    } else {

        audioPlayer.pause();

        playButton.textContent = "▶";

    }

}
audioPlayer.addEventListener(
    "play",
    () => {

        playButton.textContent = "⏸";

    }
);


audioPlayer.addEventListener(
    "pause",
    () => {

        playButton.textContent = "▶";

    }
);
// =========================================
// EVENTI PLAYER
// =========================================

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
// =========================================
// PROSSIMO
// =========================================

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

    loadTrack(
        currentTrackIndex
    );

    audioPlayer.play();

    playButton.textContent =
        "⏸";

}


// =========================================
// PRECEDENTE
// =========================================

function previousTrack() {

    if (tracks.length === 0) {
        return;
    }

    currentTrackIndex--;

    if (
        currentTrackIndex < 0
    ) {

        currentTrackIndex =
            tracks.length - 1;

    }

    loadTrack(
        currentTrackIndex
    );

    audioPlayer.play();

    playButton.textContent =
        "⏸";

}


// =========================================
// PROGRESS BAR
// =========================================

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

        progressBar.value =
            progress;

        currentTime.textContent =
            formatTime(
                audioPlayer.currentTime
            );

    }
);


// =========================================
// DURATA
// =========================================

audioPlayer.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(
                audioPlayer.duration
            );

    }
);


// =========================================
// SEEK
// =========================================

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


// =========================================
// VOLUME
// =========================================

volumeBar.addEventListener(
    "input",
    () => {

        audioPlayer.volume =
            volumeBar.value;

    }
);


// =========================================
// NAVIGAZIONE SIDEBAR
// =========================================

navItems.forEach(
    (button, index) => {

        button.addEventListener(
            "click",
            () => {

                navItems.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );


                if (index === 0) {

                    // HOME

                    showLibrary();

                }


                if (index === 1) {

                    // CERCA

                    showSearch();

                }


                if (index === 2) {

                    // LIBRERIA

                    showLibrary();

                }

            }
        );

    }
);


// =========================================
// FINE CANZONE
// =========================================

audioPlayer.addEventListener(
    "ended",
    () => {

        nextTrack();

    }
);


// =========================================
// DOWNLOAD
// =========================================

function downloadTrack(track) {

    const link =
        document.createElement("a");

    link.href =
        track.file;

    link.download =
        track.title;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

}