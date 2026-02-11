#!/bin/bash
# Image optimization script using macOS sips
# Generates web-optimized images from figure/ originals

set -e
cd "$(dirname "$0")/.."

echo "=== Optimizing images for web ==="

# --- Logo ---
echo "Copying logo..."
cp "figure/周边/SYSU_logo.png" "images/logo/sysu-logo.png"

# --- Hero (team group photo) ---
echo "Optimizing hero image..."
cp "figure/合照/640.png" "images/hero/team-group.png"
sips --resampleWidth 1920 "images/hero/team-group.png" --out "images/hero/team-group.png" 2>/dev/null

# --- Gallery: Race photos ---
echo "Processing race photos..."

# 2025 Boston
for img in "figure/比赛照片/2025_Boston/"*.JPG; do
    basename=$(basename "$img" | tr ' ' '_' | tr '()' '__')
    basename="${basename%.*}"
    echo "  Processing $basename..."
    # Thumbnail ~400px
    sips --resampleWidth 400 "$img" --out "images/gallery/thumbs/boston_${basename}.jpg" 2>/dev/null
    # Full size ~1600px
    sips --resampleWidth 1600 "$img" --out "images/gallery/full/boston_${basename}.jpg" 2>/dev/null
done

# 2025 Scrimmage
for img in "figure/比赛照片/2025_Scrimmage/"*.jpg; do
    basename=$(basename "$img" .jpg)
    echo "  Processing $basename..."
    sips --resampleWidth 400 "$img" --out "images/gallery/thumbs/scrimmage_${basename}.jpg" 2>/dev/null
    sips --resampleWidth 1600 "$img" --out "images/gallery/full/scrimmage_${basename}.jpg" 2>/dev/null
done

# --- Merchandise images ---
echo "Copying merchandise images..."
cp "figure/周边/转印贴纸.png" "images/merch/transfer-stickers.png"

# Stickers - copy individual sticker images
cp "figure/周边/贴纸_中山大学Q版校门.png" "images/merch/sticker-gate.png"
cp "figure/周边/贴纸_中山大学校徽.png" "images/merch/sticker-emblem.png"
cp "figure/周边/贴纸_双鸭山龙舟队可爱像数点.png" "images/merch/sticker-pixel.png"
cp "figure/周边/贴纸_双鸭山龙舟队经典logo.png" "images/merch/sticker-logo.png"

cp "figure/周边/渔夫帽白.jpg" "images/merch/bucket-hat-white.jpg"
cp "figure/周边/渔夫帽黑.jpg" "images/merch/bucket-hat-black.jpg"
cp "figure/周边/长袖队服.jpg" "images/merch/jersey-long.jpg"
cp "figure/周边/长袖队服尺码表.jpg" "images/merch/jersey-long-sizes.jpg"
cp "figure/周边/短袖队服.png" "images/merch/jersey-short.png"
cp "figure/周边/短袖队服尺码表.png" "images/merch/jersey-short-sizes.png"
cp "figure/周边/冲锋衣.jpg" "images/merch/windbreaker.jpg"

# --- WeChat QR code ---
echo "Copying WeChat QR code..."
cp "figure/小助手二维码.jpeg" "images/merch/wechat-qr.jpg"

# --- Resize merch images for web ---
echo "Resizing merchandise images..."
for img in images/merch/*.{jpg,png}; do
    [ -f "$img" ] || continue
    # Get current width
    w=$(sips -g pixelWidth "$img" 2>/dev/null | tail -1 | awk '{print $2}')
    if [ "$w" -gt 800 ] 2>/dev/null; then
        sips --resampleWidth 800 "$img" --out "$img" 2>/dev/null
    fi
done

echo "=== Done! ==="
echo "Generated images:"
find images -type f | sort
