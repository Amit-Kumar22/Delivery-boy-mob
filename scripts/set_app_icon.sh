#!/usr/bin/env bash
set -euo pipefail

# Script: set_app_icon.sh
# Purpose: Generate Android launcher icons from assets/delivery.png and replace existing launcher resources.
# Usage: From project root run: ./scripts/set_app_icon.sh
# Requirements: ImageMagick (magick or convert) installed. Tested on macOS with zsh.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT_DIR/assets/delivery.png"
RES_DIR="$ROOT_DIR/android/app/src/main/res"

if [ ! -f "$SRC" ]; then
  echo "Error: source image not found: $SRC"
  exit 1
fi

# Find ImageMagick command
if command -v magick >/dev/null 2>&1; then
  IM="magick"
elif command -v convert >/dev/null 2>&1; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

# Sizes for mipmap densities (px) for simple launcher icons
declare -A sizes=(
  [mipmap-mdpi]=48
  [mipmap-hdpi]=72
  [mipmap-xhdpi]=96
  [mipmap-xxhdpi]=144
  [mipmap-xxxhdpi]=192
)

echo "Generating launcher icons from $SRC"
for dir in "${!sizes[@]}"; do
  size=${sizes[$dir]}
  target_dir="$RES_DIR/$dir"
  mkdir -p "$target_dir"

  echo " - $dir: ${size}x${size}"
  # full launcher
  "$IM" "$SRC" -resize "${size}x${size}" "$target_dir/ic_launcher.png"
  # foreground (transparent ideally)
  "$IM" "$SRC" -resize "${size}x${size}" "$target_dir/ic_launcher_foreground.png"
  # round icon (simple copy) - if you want perfect circle, consider masking
  "$IM" "$SRC" -resize "${size}x${size}" "$target_dir/ic_launcher_round.png"

  # Remove existing webp files if present
  if [ -f "$target_dir/ic_launcher.webp" ]; then
    rm "$target_dir/ic_launcher.webp" && echo "   removed $dir/ic_launcher.webp"
  fi
  if [ -f "$target_dir/ic_launcher_foreground.webp" ]; then
    rm "$target_dir/ic_launcher_foreground.webp" && echo "   removed $dir/ic_launcher_foreground.webp"
  fi
  if [ -f "$target_dir/ic_launcher_round.webp" ]; then
    rm "$target_dir/ic_launcher_round.webp" && echo "   removed $dir/ic_launcher_round.webp"
  fi
done

# Update mipmap-anydpi-v26 foreground if needed (it already points to @mipmap/ic_launcher_foreground)
IC_XML="$RES_DIR/mipmap-anydpi-v26/ic_launcher.xml"
if [ -f "$IC_XML" ]; then
  echo "Adaptive icon xml present at $IC_XML"
else
  echo "Warning: adaptive icon xml not found at $IC_XML. If you use adaptive icons, ensure it points to @mipmap/ic_launcher_foreground"
fi

# Done
echo "Done. Generated PNGs placed in mipmap-*/. Build the app to see the new icon."

echo "Next steps:
  1) cd android && ./gradlew assembleDebug
  2) Install the apk on a device/emulator and confirm the icon.
"