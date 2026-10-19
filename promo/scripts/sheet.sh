#!/bin/sh
# Tile shots/f*.jpg given as frame numbers into shots/sheet.jpg (2 columns).
out=shots/sheet.jpg; args=""; n=0
for fr in "$@"; do args="$args -i shots/f$(printf %04d $fr).jpg"; n=$((n+1)); done
layout=""; for i in $(seq 0 $((n-1))); do x=$(( (i%2)*960 )); y=$(( (i/2)*540 )); layout="$layout${layout:+|}${x}_${y}"; done
ffmpeg -loglevel error -y $args -filter_complex "xstack=inputs=$n:layout=$layout:fill=black" -q:v 3 $out
