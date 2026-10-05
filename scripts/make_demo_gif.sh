#!/usr/bin/env bash
# Convert a screen recording (.mov/.mp4) into docs/demo.gif for the README.
#
# Usage: scripts/make_demo_gif.sh recording.mov [output.gif]
# Env:   FPS=12  WIDTH=960  START=0  DURATION=   (seconds; empty = to the end)
set -euo pipefail

usage() { echo "usage: $0 input.mov [output.gif]   (env: FPS, WIDTH, START, DURATION)" >&2; exit 2; }

[[ $# -ge 1 && $# -le 2 ]] || usage
input=$1
output=${2:-"$(cd "$(dirname "$0")/.." && pwd)/docs/demo.gif"}
fps=${FPS:-12}
width=${WIDTH:-960}
start=${START:-0}
duration=${DURATION:-}

command -v ffmpeg >/dev/null || { echo "ffmpeg not found (macOS: brew install ffmpeg)" >&2; exit 1; }
[[ -f $input ]] || { echo "no such file: $input" >&2; exit 1; }
mkdir -p "$(dirname "$output")"

trim=(-ss "$start")
[[ -n $duration ]] && trim+=(-t "$duration")

palette=$(mktemp -t demo-palette-XXXXXX).png
trap 'rm -f "$palette"' EXIT

# Two passes: build a palette from the clip itself, then dither against it.
# Far smaller and cleaner than ffmpeg's default 256-colour GIF palette.
filters="fps=$fps,scale=$width:-1:flags=lanczos"
ffmpeg -v error -y "${trim[@]}" -i "$input" -vf "$filters,palettegen=stats_mode=diff" "$palette"
ffmpeg -v error -y "${trim[@]}" -i "$input" -i "$palette" \
  -lavfi "$filters [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -loop 0 "$output"

size=$(du -h "$output" | cut -f1)
echo "wrote $output ($size)"
echo "too big? lower FPS (e.g. 10), WIDTH (e.g. 800) or trim with START/DURATION"
