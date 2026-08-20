import os
import json
import subprocess
from pathlib import Path


# ==========================================
# CONFIGURAZIONE
# ==========================================

PROJECT_DIR = Path(__file__).parent
MUSIC_DIR = PROJECT_DIR / "music"
JSON_FILE = PROJECT_DIR / "data" / "music.json"


# ==========================================
# ESTENSIONI AUDIO SUPPORTATE
# ==========================================

AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a",
    ".flac"
}


# ==========================================
# CREA LA STRUTTURA DELLA LIBRERIA
# ==========================================

def build_library(folder):

    children = []

    # Cartelle
    directories = sorted(
        [
            item for item in folder.iterdir()
            if item.is_dir()
        ],
        key=lambda x: x.name.lower()
    )

    for directory in directories:

        children.append({
            "type": "folder",
            "name": directory.name,
            "children": build_library(directory)
        })


    # File audio
    files = sorted(
        [
            item for item in folder.iterdir()
            if item.is_file()
            and item.suffix.lower() in AUDIO_EXTENSIONS
        ],
        key=lambda x: x.name.lower()
    )

    for file in files:

        title = file.stem

        relative_path = file.relative_to(
            PROJECT_DIR
        ).as_posix()

        children.append({
            "type": "track",
            "title": title,
            "artist": "RPG Music",
            "file": relative_path
        })


    return children


# ==========================================
# GENERAZIONE JSON
# ==========================================

print()
print("======================================")
print("       RPG MUSIC - UPDATE LIBRARY")
print("======================================")
print()


if not MUSIC_DIR.exists():

    print("ERRORE: la cartella music non esiste.")

    input("\nPremi INVIO per chiudere...")

    exit()


library = build_library(MUSIC_DIR)


data = {
    "library": library
}


JSON_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


with open(
    JSON_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        data,
        file,
        ensure_ascii=False,
        indent=4
    )


print("✓ music.json aggiornato")


# ==========================================
# GIT ADD
# ==========================================

print()
print("Aggiungo i file a Git...")

subprocess.run(
    ["git", "add", "."],
    cwd=PROJECT_DIR,
    check=True
)

print("✓ Git add completato")


# ==========================================
# GIT COMMIT
# ==========================================

print()
print("Creo il commit...")

commit = subprocess.run(
    [
        "git",
        "commit",
        "-m",
        "Update music library"
    ],
    cwd=PROJECT_DIR
)


if commit.returncode != 0:

    print()
    print("Nessun cambiamento da committare.")


# ==========================================
# GIT PUSH
# ==========================================

print()
print("Invio tutto su GitHub...")

push = subprocess.run(
    [
        "git",
        "push"
    ],
    cwd=PROJECT_DIR
)


if push.returncode != 0:

    print()
    print("ERRORE durante il push.")

else:

    print()
    print("======================================")
    print("        ✓ PUBBLICAZIONE COMPLETATA")
    print("======================================")
    print()


input("Premi INVIO per chiudere...")