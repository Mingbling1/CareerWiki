#!/usr/bin/env python3
"""
Process ALL avatar and work images from /home/jimmy/Descargas/empliq/
- Avatars: Split grids, remove backgrounds, clean artifacts
- Work: Crop excess white space, make transparent
Output: website/public/illustrations/avatars and /work
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

# ============================================================
# Shared utilities
# ============================================================

def remove_white_background(img: Image.Image, threshold: int = 235) -> Image.Image:
    """Remove white/near-white background and make transparent."""
    img = img.convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Pure white mask
    white_mask = (r >= threshold) & (g >= threshold) & (b >= threshold)
    data[white_mask, 3] = 0
    
    # Near-white anti-alias (smooth edge transition)
    near_threshold = threshold - 40
    near_white = (r >= near_threshold) & (g >= near_threshold) & (b >= near_threshold) & ~white_mask
    if np.any(near_white):
        avg = (r[near_white].astype(float) + g[near_white].astype(float) + b[near_white].astype(float)) / 3
        alpha_factor = np.clip(1.0 - (avg - near_threshold) / (threshold - near_threshold), 0, 1)
        data[near_white, 3] = (alpha_factor * 255).astype(np.uint8)
    
    return Image.fromarray(data)


def remove_light_background(img: Image.Image, threshold: int = 240) -> Image.Image:
    """Remove light gray/white background for grayscale images."""
    img = img.convert("RGBA")
    data = np.array(img)
    
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    brightness = (r.astype(float) + g.astype(float) + b.astype(float)) / 3
    
    # Full transparent for very light pixels
    light_mask = brightness >= threshold
    data[light_mask, 3] = 0
    
    # Gradual for near-light
    near_threshold = threshold - 30
    near_light = (brightness >= near_threshold) & (brightness < threshold)
    if np.any(near_light):
        alpha = np.clip((threshold - brightness[near_light]) / (threshold - near_threshold) * 255, 0, 255)
        data[near_light, 3] = alpha.astype(np.uint8)
    
    return Image.fromarray(data)


def trim_transparent(img: Image.Image, padding: int = 8) -> Image.Image:
    """Crop transparent areas around content."""
    data = np.array(img)
    if data.shape[2] < 4:
        return img
    alpha = data[:, :, 3]
    
    rows = np.any(alpha > 10, axis=1)
    cols = np.any(alpha > 10, axis=0)
    
    if not rows.any() or not cols.any():
        return img
    
    top = np.argmax(rows)
    bottom = len(rows) - np.argmax(rows[::-1])
    left = np.argmax(cols)
    right = len(cols) - np.argmax(cols[::-1])
    
    top = max(0, top - padding)
    bottom = min(img.height, bottom + padding)
    left = max(0, left - padding)
    right = min(img.width, right + padding)
    
    return img.crop((left, top, right, bottom))


def auto_crop_white(img: Image.Image, threshold: int = 245, padding: int = 10) -> Image.Image:
    """Auto-crop excess white space from borders without making transparent."""
    gray = np.array(img.convert("L"))
    
    rows = np.any(gray < threshold, axis=1)
    cols = np.any(gray < threshold, axis=0)
    
    if not rows.any() or not cols.any():
        return img
    
    top = np.argmax(rows)
    bottom = len(rows) - np.argmax(rows[::-1])
    left = np.argmax(cols)
    right = len(cols) - np.argmax(cols[::-1])
    
    top = max(0, top - padding)
    bottom = min(img.height, bottom + padding)
    left = max(0, left - padding)
    right = min(img.width, right + padding)
    
    return img.crop((left, top, right, bottom))


def fit_to_square(img: Image.Image, size: int = 512) -> Image.Image:
    """Resize maintaining aspect ratio and center in a transparent square canvas."""
    ratio = min(size / img.width, size / img.height)
    new_w = int(img.width * ratio)
    new_h = int(img.height * ratio)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset_x = (size - new_w) // 2
    offset_y = (size - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y), resized if resized.mode == "RGBA" else None)
    return canvas


def detect_and_split_grid(img: Image.Image, min_cells: int = 2) -> list[Image.Image]:
    """
    Intelligently detect if an image is a grid of separate illustrations.
    Returns a list of cropped cell images, or [img] if not a grid.
    """
    gray = np.array(img.convert("L"))
    h, w = gray.shape
    
    # Find rows and columns that are mostly white (potential separators)
    row_means = np.mean(gray, axis=1)
    col_means = np.mean(gray, axis=0)
    
    sep_threshold = 248
    
    # Find separator bands (consecutive white rows/cols)
    def find_separators(means, min_gap=15):
        is_white = means >= sep_threshold
        separators = []
        in_sep = False
        start = 0
        for i, white in enumerate(is_white):
            if white and not in_sep:
                in_sep = True
                start = i
            elif not white and in_sep:
                if i - start >= min_gap:
                    separators.append((start, i))
                in_sep = False
        if in_sep and len(means) - start >= min_gap:
            separators.append((start, len(means)))
        return separators
    
    row_seps = find_separators(row_means, min_gap=max(10, h // 40))
    col_seps = find_separators(col_means, min_gap=max(10, w // 40))
    
    # Determine grid boundaries
    def get_ranges(seps, total_size):
        ranges = []
        prev_end = 0
        for start, end in seps:
            if start - prev_end > total_size * 0.05:  # minimum cell size: 5% of image
                ranges.append((prev_end, start))
            prev_end = end
        if total_size - prev_end > total_size * 0.05:
            ranges.append((prev_end, total_size))
        return ranges
    
    row_ranges = get_ranges(row_seps, h)
    col_ranges = get_ranges(col_seps, w)
    
    num_rows = len(row_ranges)
    num_cols = len(col_ranges)
    
    if num_rows < min_cells and num_cols < min_cells:
        return [img]  # Not a grid
    
    print(f"    Detected grid: {num_cols}x{num_rows} = {num_cols * num_rows} cells")
    
    cells = []
    for r_start, r_end in row_ranges:
        for c_start, c_end in col_ranges:
            cell = img.crop((c_start, r_start, c_end, r_end))
            # Check if cell has actual content (not mostly white)
            cell_gray = np.array(cell.convert("L"))
            content_ratio = np.sum(cell_gray < 230) / cell_gray.size
            if content_ratio > 0.02:  # at least 2% non-white pixels
                cells.append(cell)
    
    return cells if len(cells) >= min_cells else [img]


# ============================================================
# Main processing
# ============================================================

def process_avatars(src_dir: str, out_dir: str):
    """Process all avatar images."""
    src = Path(src_dir)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    
    avatar_count = 0
    
    for f in sorted(src.iterdir()):
        if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.avif', '.webp'):
            continue
        
        print(f"\n  Processing avatar: {f.name}")
        img = Image.open(f)
        print(f"    Size: {img.size[0]}x{img.size[1]}, Mode: {img.mode}")
        
        # Try to detect and split grids
        cells = detect_and_split_grid(img)
        
        for i, cell in enumerate(cells):
            # Remove white background
            transparent = remove_white_background(cell, threshold=232)
            
            # Trim transparent edges
            trimmed = trim_transparent(transparent, padding=5)
            
            if trimmed.width < 20 or trimmed.height < 20:
                print(f"    Skipping tiny cell {i+1} ({trimmed.width}x{trimmed.height})")
                continue
            
            # Clean small isolated artifacts
            # (optional: use morphological ops)
            
            # Fit to square
            final = fit_to_square(trimmed, size=512)
            
            stem = f.stem.replace(" ", "_").replace("-", "_")
            if len(cells) > 1:
                name = f"avatar_{stem}_{i+1:02d}.png"
            else:
                name = f"avatar_{stem}.png"
            
            out_path = out / name
            final.save(out_path, "PNG", optimize=True)
            avatar_count += 1
            print(f"    ✅ Saved: {name} ({final.width}x{final.height})")
    
    print(f"\n  Total avatars: {avatar_count}")
    return avatar_count


def process_work(src_dir: str, out_dir: str):
    """Process all work/illustration images."""
    src = Path(src_dir)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    
    work_count = 0
    
    for f in sorted(src.iterdir()):
        if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.avif', '.webp'):
            continue
        
        print(f"\n  Processing work: {f.name}")
        img = Image.open(f)
        print(f"    Size: {img.size[0]}x{img.size[1]}, Mode: {img.mode}")
        
        # First, auto-crop excess white borders
        cropped = auto_crop_white(img, threshold=245, padding=5)
        print(f"    After crop: {cropped.width}x{cropped.height}")
        
        # Remove white background → transparent
        if img.mode == 'L':
            # Grayscale image
            transparent = remove_light_background(cropped, threshold=238)
        else:
            transparent = remove_white_background(cropped, threshold=232)
        
        # Trim any remaining transparent edges
        trimmed = trim_transparent(transparent, padding=5)
        
        if trimmed.width < 50 or trimmed.height < 50:
            print(f"    Skipping (too small after trim)")
            continue
        
        # For very large images, resize to reasonable web size (max 1200px)
        max_dim = 1200
        if trimmed.width > max_dim or trimmed.height > max_dim:
            ratio = min(max_dim / trimmed.width, max_dim / trimmed.height)
            new_w = int(trimmed.width * ratio)
            new_h = int(trimmed.height * ratio)
            trimmed = trimmed.resize((new_w, new_h), Image.Resampling.LANCZOS)
            print(f"    Resized to: {new_w}x{new_h}")
        
        # Clean up the name
        stem = f.stem
        # Shorten very long freepik-style names
        if len(stem) > 40:
            # Take first meaningful part
            parts = stem.split("_")
            stem = "_".join(parts[:5])
        stem = stem.replace(" ", "_").replace("-", "_")
        
        name = f"work_{stem}.png"
        out_path = out / name
        trimmed.save(out_path, "PNG", optimize=True)
        work_count += 1
        print(f"    ✅ Saved: {name} ({trimmed.width}x{trimmed.height})")
    
    print(f"\n  Total work images: {work_count}")
    return work_count


if __name__ == "__main__":
    SRC_AVATAR = "/home/jimmy/Descargas/empliq/avatars"
    SRC_WORK = "/home/jimmy/Descargas/empliq/trabajo"
    OUT_BASE = "/home/jimmy/sueldos-organigrama/apps/website/public/illustrations"
    
    print("=" * 60)
    print("🎨 AVATAR PROCESSING")
    print("=" * 60)
    avatar_count = process_avatars(SRC_AVATAR, f"{OUT_BASE}/avatars")
    
    print("\n" + "=" * 60)
    print("💼 WORK ILLUSTRATION PROCESSING")
    print("=" * 60)
    work_count = process_work(SRC_WORK, f"{OUT_BASE}/work")
    
    print("\n" + "=" * 60)
    print(f"🎉 DONE! {avatar_count} avatars + {work_count} work images")
    print(f"   Output: {OUT_BASE}")
    print("=" * 60)
