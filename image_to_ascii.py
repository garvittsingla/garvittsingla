#!/usr/bin/env python3
"""
image_to_ascii.py - Converts an image file to ASCII text format.

Usage:
    python image_to_ascii.py input.png [--width 50] [--output assets/ascii.txt] [--ramp blocks|standard|detailed]
"""

import argparse
import sys
from pathlib import Path
from PIL import Image, ImageEnhance

RAMPS = {
    "standard": ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "],
    "blocks": ["█", "▓", "▒", "░", " "],
    "detailed": ["$", "@", "B", "%", "8", "&", "W", "M", "#", "*", "o", "a", "h", "k", "b", "p", "q", "w", "m", "Z", "O", "0", "Q", "L", "C", "J", "Y", "X", "z", "c", "v", "u", "n", "x", "r", "f", "t", "j", "f", "/", "\\", "|", "(", ")", "1", "{", "}", "[", "]", "?", "-", "_", "+", "~", "<", ">", "i", "!", "l", "I", ";", ":", ",", "\"", "^", "`", "'", ".", " "],
}


def convert_image_to_ascii(
    image_path: Path,
    width: int = 50,
    ramp_name: str = "standard",
    enhance_contrast: float = 1.3,
) -> str:
    try:
        image = Image.open(image_path)
    except Exception as e:
        print(f"Error loading image '{image_path}': {e}", file=sys.stderr)
        sys.exit(1)

    # Enhance contrast slightly for better ASCII definition
    if enhance_contrast != 1.0:
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(enhance_contrast)

    # Calculate height respecting terminal character aspect ratio (~0.55 height per char width)
    orig_width, orig_height = image.size
    aspect_ratio = orig_height / float(orig_width)
    height = int(width * aspect_ratio * 0.55)
    height = max(1, height)

    resized_image = image.resize((width, height)).convert("L")

    try:
        pixels = list(resized_image.get_flattened_data())
    except AttributeError:
        pixels = list(resized_image.getdata())

    ramp = RAMPS.get(ramp_name, RAMPS["standard"])
    ramp_len = len(ramp)

    ascii_str = ""
    for i, pixel in enumerate(pixels):
        # Map grayscale value (0-255) to character array index
        char_index = int((pixel / 255.0) * (ramp_len - 1))
        ascii_str += ramp[char_index]
        if (i + 1) % width == 0:
            ascii_str += "\n"

    return ascii_str


def main():
    parser = argparse.ArgumentParser(description="Convert an image to ASCII art.")
    parser.add_argument("image_path", type=Path, help="Path to the image file.")
    parser.add_argument("--width", type=int, default=50, help="Output width in characters (default: 50).")
    parser.add_argument("--ramp", choices=list(RAMPS.keys()), default="standard", help="ASCII character ramp style.")
    parser.add_argument("--contrast", type=float, default=1.3, help="Contrast enhancement factor (default: 1.3).")
    parser.add_argument("--output", type=Path, default=None, help="Optional output text file path.")

    args = parser.parse_args()

    ascii_art = convert_image_to_ascii(
        args.image_path,
        width=args.width,
        ramp_name=args.ramp,
        enhance_contrast=args.contrast,
    )

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(ascii_art, encoding="utf-8")
        print(f"ASCII art saved to {args.output}")
    else:
        print(ascii_art)


if __name__ == "__main__":
    main()
