#!/usr/bin/env python3
"""
Split Avatar Grid — Corta una imagen JPG con múltiples avatares en una cuadrícula
y los guarda como PNGs individuales con fondo transparente.

Uso:
    python split_avatars.py <input_image> [--cols 4] [--rows 3] [--output-dir ./avatars]
    python split_avatars.py /path/to/image.jpg
    python split_avatars.py /path/to/image.jpg --cols 4 --rows 3 --output-dir ./avatars
"""

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageFilter
import numpy as np


def remove_white_background(img: Image.Image, threshold: int = 230) -> Image.Image:
    """Remueve el fondo blanco y lo convierte en transparente."""
    img = img.convert("RGBA")
    data = np.array(img)

    # Pixels donde R, G, B son todos >= threshold → fondo blanco
    white_mask = (data[:, :, 0] >= threshold) & \
                 (data[:, :, 1] >= threshold) & \
                 (data[:, :, 2] >= threshold)

    # Hacer transparentes los pixels blancos
    data[white_mask, 3] = 0

    # Anti-alias: para pixels semi-blancos cerca de bordes, hacerlos semi-transparentes
    near_white = (data[:, :, 0] >= threshold - 30) & \
                 (data[:, :, 1] >= threshold - 30) & \
                 (data[:, :, 2] >= threshold - 30) & \
                 ~white_mask
    avg_brightness = (
        data[near_white, 0].astype(int) +
        data[near_white, 1].astype(int) +
        data[near_white, 2].astype(int)
    ) / 3
    data[near_white, 3] = np.clip(
        255 - ((avg_brightness - (threshold - 30)) / 30 * 255), 0, 255
    ).astype(np.uint8)

    return Image.fromarray(data)


def trim_transparent(img: Image.Image, padding: int = 5) -> Image.Image:
    """Recorta el espacio transparente alrededor del contenido."""
    data = np.array(img)
    alpha = data[:, :, 3]

    # Encontrar filas/columnas con contenido no transparente
    rows_with_content = np.any(alpha > 10, axis=1)
    cols_with_content = np.any(alpha > 10, axis=0)

    if not rows_with_content.any() or not cols_with_content.any():
        return img

    top = np.argmax(rows_with_content)
    bottom = len(rows_with_content) - np.argmax(rows_with_content[::-1])
    left = np.argmax(cols_with_content)
    right = len(cols_with_content) - np.argmax(cols_with_content[::-1])

    # Agregar padding
    top = max(0, top - padding)
    bottom = min(img.height, bottom + padding)
    left = max(0, left - padding)
    right = min(img.width, right + padding)

    return img.crop((left, top, right, bottom))


def detect_grid(img: Image.Image, expected_cols: int, expected_rows: int):
    """
    Detecta la cuadrícula dividiendo uniformemente, luego ajusta
    buscando las líneas de separación más blancas.
    """
    w, h = img.size
    gray = np.array(img.convert("L"))

    # Buscar la zona de contenido (excluir watermark/bordes)
    # Analizar filas para encontrar donde termina el contenido real
    row_means = np.mean(gray, axis=1)
    # El watermark "designed by freepik" está en la parte inferior
    # Buscar una franja muy blanca que separe contenido del watermark
    content_bottom = h
    for y in range(int(h * 0.85), h):
        if row_means[y] > 250:
            # Verificar que las siguientes filas también son muy blancas
            if np.mean(row_means[y:min(y + 20, h)]) > 245:
                content_bottom = y
                break

    # Similar para los bordes
    content_top = 0
    for y in range(int(h * 0.1)):
        if row_means[y] < 250:
            content_top = max(0, y - 5)
            break

    content_left = 0
    col_means = np.mean(gray, axis=0)
    for x in range(int(w * 0.1)):
        if col_means[x] < 250:
            content_left = max(0, x - 5)
            break

    content_right = w
    for x in range(w - 1, int(w * 0.9), -1):
        if col_means[x] < 250:
            content_right = min(w, x + 5)
            break

    content_w = content_right - content_left
    content_h = content_bottom - content_top

    cell_w = content_w / expected_cols
    cell_h = content_h / expected_rows

    cells = []
    for row in range(expected_rows):
        for col in range(expected_cols):
            x1 = int(content_left + col * cell_w)
            y1 = int(content_top + row * cell_h)
            x2 = int(content_left + (col + 1) * cell_w)
            y2 = int(content_top + (row + 1) * cell_h)
            cells.append((x1, y1, x2, y2))

    return cells


def split_avatars(
    input_path: str,
    cols: int = 4,
    rows: int = 3,
    output_dir: str | None = None,
    white_threshold: int = 230,
    target_size: int | None = 256,
):
    """
    Corta una imagen de avatares en cuadrícula, remueve fondo blanco
    y guarda PNGs transparentes individuales.
    """
    input_path = Path(input_path)
    if not input_path.exists():
        print(f"❌ No se encontró el archivo: {input_path}")
        sys.exit(1)

    if output_dir is None:
        output_dir = input_path.parent / "avatars"
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"📂 Input:  {input_path}")
    print(f"📂 Output: {output_dir}")
    print(f"🔢 Grid:   {cols}x{rows} = {cols * rows} avatares")
    print()

    img = Image.open(input_path)
    print(f"📐 Tamaño original: {img.size[0]}x{img.size[1]}")

    # Detectar cuadrícula
    cells = detect_grid(img, cols, rows)

    avatar_names = [
        "avatar_boy_stripes",
        "avatar_man_beard",
        "avatar_person_dots",
        "avatar_man_bun",
        "avatar_grandma_glasses",
        "avatar_woman_long_hair",
        "avatar_girl_buns",
        "avatar_man_hat_glasses",
        "avatar_woman_hat",
        "avatar_kid_beanie",
        "avatar_woman_polka",
        "avatar_person_sunglasses",
    ]

    saved = 0
    for i, (x1, y1, x2, y2) in enumerate(cells):
        cell_img = img.crop((x1, y1, x2, y2))

        # Remover fondo blanco
        transparent = remove_white_background(cell_img, threshold=white_threshold)

        # Recortar espacio vacío
        trimmed = trim_transparent(transparent, padding=8)

        # Redimensionar si se especifica tamaño
        if target_size and trimmed.width > 0 and trimmed.height > 0:
            # Mantener aspect ratio, fit en un cuadrado
            ratio = min(target_size / trimmed.width, target_size / trimmed.height)
            new_w = int(trimmed.width * ratio)
            new_h = int(trimmed.height * ratio)
            trimmed = trimmed.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Centrar en un canvas cuadrado transparente
            canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
            offset_x = (target_size - new_w) // 2
            offset_y = (target_size - new_h) // 2
            canvas.paste(trimmed, (offset_x, offset_y))
            trimmed = canvas

        # Nombre del archivo
        name = avatar_names[i] if i < len(avatar_names) else f"avatar_{i + 1:02d}"
        out_path = output_dir / f"{name}.png"
        trimmed.save(out_path, "PNG", optimize=True)
        saved += 1
        print(f"  ✅ [{i + 1}/{cols * rows}] {out_path.name} ({trimmed.width}x{trimmed.height})")

    print(f"\n🎉 ¡Listo! {saved} avatares guardados en: {output_dir}")
    print(f"   Todos con fondo transparente, {target_size}x{target_size}px")
    return output_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Corta una cuadrícula de avatares en PNGs individuales")
    parser.add_argument("input", help="Ruta a la imagen JPG con la cuadrícula de avatares")
    parser.add_argument("--cols", type=int, default=4, help="Número de columnas (default: 4)")
    parser.add_argument("--rows", type=int, default=3, help="Número de filas (default: 3)")
    parser.add_argument("--output-dir", "-o", help="Directorio de salida (default: ./avatars junto al input)")
    parser.add_argument("--threshold", type=int, default=230, help="Umbral de blanco (0-255, default: 230)")
    parser.add_argument("--size", type=int, default=256, help="Tamaño del avatar cuadrado en px (default: 256, 0=sin resize)")

    args = parser.parse_args()

    split_avatars(
        input_path=args.input,
        cols=args.cols,
        rows=args.rows,
        output_dir=args.output_dir,
        white_threshold=args.threshold,
        target_size=args.size if args.size > 0 else None,
    )
