#!/usr/bin/env python3
"""
image_to_ascii.py - Converts an image file to ASCII text format.

Usage:
    python image_to_ascii.py input.png [--width 50] [--output assets/ascii.txt]
"""

import argparse
import sys
from pathlib import Path
from PIL import Image

ASCII_CHARS = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "]


def convert_image_to_ascii(image_path: Path, width: int = 50) -> str:
    try:
        image = Image.open(image_path)
    except Exception as e:
        print(f"Error loading image '{image_path}': {e}", file=sys.stderr)
        sys.exit(1)

    # Calculate height respecting terminal character aspect ratio (~0.55 height per char width)
    orig_width, orig_height = image.size
    aspect_ratio = orig_height / float(orig_width)
    height = int(width * aspect_ratio * 0.55)
    height = max(1, height)

    resized_image = image.resize((width, height)).convert("L")
    pixels = resized_image.getdata()

    ascii_str = ""
    for i, pixel in enumerate(pixels):
        # Map grayscale value (0-255) to character array index
        char_index = int((pixel / 255) * (len(ASCII_CHARS) - 1))
        ascii_str += ASCII_CHARS[char_index]
        if (i + 1) % width == 0:
            ascii_str += "\n"

    return ascii_str


def main():
    parser = argparse.ArgumentParser(description="Convert an image to ASCII art.")
    parser.add_argument("image_path", type=Path, help="Path to the image file.")
    parser.add_argument("--width", type=int, default=50, help="Output width in characters (default: 50).")
    parser.add_argument("--output", type=Path, default=None, help="Optional output text file path.")

    args = parser.parse_args()

    ascii_art = convert_image_to_ascii(args.image_path, args.width)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(ascii_art, encoding="utf-8")
        print(f"ASCII art saved to {args.output}")
    else:
        print(ascii_art)


if __name__ == "__main__":
    main()
