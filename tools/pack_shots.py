"""Lossless-content re-encode: keeps each screenshot a real browser render, stores it as an
8-bit palette PNG so it fits the 256 KiB cap. Nothing is scaled, cropped or composited."""
from pathlib import Path
from PIL import Image

SHOTS = Path(__file__).resolve().parent.parent / 'screenshots'
CAP = 256 * 1024

for shot in ['cover', 'hide', 'close', 'win']:
    path = SHOTS / f'{shot}.png'
    image = Image.open(path).convert('RGB')
    size = image.size
    for colors in (256, 192, 128, 96, 64):
        work = image.quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG)
        work.save(path, optimize=True)
        if path.stat().st_size <= CAP:
            print(f'{shot}: {path.stat().st_size} bytes, {colors} colours, {size[0]}x{size[1]}')
            break
    else:
        raise SystemExit(f'{shot} still over {CAP} bytes')
