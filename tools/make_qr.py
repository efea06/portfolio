#!/usr/bin/env python3
"""
Regenerate everything that depends on your live site URL:

  assets/qr.svg                       QR code shown on the website
  assets/qr.png                       same QR as an image (for slides, LinkedIn, etc.)
  assets/Efe_Ahworegba_Resume.pdf     your resume with the QR code stamped in the top-right corner
  assets/resume-preview.png           the preview image shown in the Resume section

Usage (run from the repository root):

    pip install reportlab pypdf pillow
    python tools/make_qr.py https://efea06.github.io/portfolio/

The stamped resume is always built from tools/resume-original.pdf, so you can run this as
many times as you like. To update your resume, replace tools/resume-original.pdf and run it again.

For the preview image the script uses pypdfium2 (pip install pypdfium2) or, if that is not
installed, the pdftoppm command from poppler-utils.
"""
import io
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter
from reportlab.graphics.barcode import qrencoder
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SOURCE_RESUME = ROOT / "tools" / "resume-original.pdf"
OUT_RESUME = ASSETS / "Efe_Ahworegba_Resume.pdf"

SITE_INK = "#0A1230"  # QR colour on the website; dark enough to scan reliably


def build_matrix(url):
    """Return the QR code as a list of rows of booleans (True = dark module)."""
    qr = qrencoder.QRCode(None, qrencoder.QRErrorCorrectLevel.M)
    qr.addData(url)
    qr.make()
    n = qr.getModuleCount()
    return [[bool(qr.isDark(r, c)) for c in range(n)] for r in range(n)]


def write_svg(matrix, path, quiet=4, color=SITE_INK):
    n = len(matrix)
    size = n + quiet * 2
    parts = []
    for r, row in enumerate(matrix):
        c = 0
        while c < n:
            if row[c]:
                start = c
                while c < n and row[c]:
                    c += 1
                parts.append(f"M{start + quiet} {r + quiet}h{c - start}v1h-{c - start}z")
            else:
                c += 1
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
        f'shape-rendering="crispEdges" role="img" aria-label="QR code linking to the portfolio website">'
        f'<rect width="{size}" height="{size}" fill="#ffffff"/>'
        f'<path fill="{color}" d="{"".join(parts)}"/></svg>'
    )
    path.write_text(svg, encoding="utf-8")


def write_png(matrix, path, quiet=4, module_px=16, color=SITE_INK):
    n = len(matrix)
    size = (n + quiet * 2) * module_px
    img = Image.new("RGB", (size, size), "white")
    draw = ImageDraw.Draw(img)
    for r in range(n):
        for c in range(n):
            if matrix[r][c]:
                x = (c + quiet) * module_px
                y = (r + quiet) * module_px
                draw.rectangle([x, y, x + module_px - 1, y + module_px - 1], fill=color)
    img.save(path)


def stamp_resume(matrix, url):
    """Draw the QR code (and a small label) in the top-right corner of page 1."""
    reader = PdfReader(str(SOURCE_RESUME))
    page = reader.pages[0]
    page_w = float(page.mediabox.width)
    page_h = float(page.mediabox.height)

    qr_size = 42          # points (about 1.5 cm)
    right_edge = page_w - 14
    top_edge = page_h - 13
    x0 = right_edge - qr_size
    y0 = top_edge - qr_size
    module = qr_size / len(matrix)

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(page_w, page_h))
    c.setFillColorRGB(0, 0, 0)
    for r, row in enumerate(matrix):
        for col, dark in enumerate(row):
            if dark:
                # small overlap between modules avoids hairline gaps in some PDF viewers
                c.rect(x0 + col * module, top_edge - (r + 1) * module, module + 0.15, module + 0.15,
                       stroke=0, fill=1)
    c.setFillColorRGB(0.25, 0.25, 0.25)
    c.setFont("Helvetica", 6.5)
    c.drawRightString(x0 - 6, y0 + qr_size / 2 + 2, "Scan for my")
    c.drawRightString(x0 - 6, y0 + qr_size / 2 - 6, "portfolio")
    c.linkURL(url, (x0 - 40, y0, right_edge, top_edge), relative=0)
    c.save()
    buf.seek(0)

    overlay = PdfReader(buf).pages[0]
    page.merge_page(overlay)

    writer = PdfWriter()
    for p in reader.pages:
        writer.add_page(p)
    writer.add_metadata({"/Title": "Efe Ahworegba - Resume", "/Author": "Efe Ahworegba"})
    with open(OUT_RESUME, "wb") as f:
        writer.write(f)


def render_preview(pdf_path, out_path, dpi=130):
    try:
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(str(pdf_path))
        image = pdf[0].render(scale=dpi / 72).to_pil()
        image.convert("RGB").save(out_path, optimize=True)
        return True
    except ImportError:
        pass
    if shutil.which("pdftoppm"):
        with tempfile.TemporaryDirectory() as tmp:
            stem = Path(tmp) / "p"
            subprocess.run(
                ["pdftoppm", "-r", str(dpi), "-png", "-f", "1", "-l", "1", "-singlefile", str(pdf_path), str(stem)],
                check=True,
            )
            Image.open(f"{stem}.png").convert("RGB").save(out_path, optimize=True)
        return True
    return False


def main():
    if len(sys.argv) != 2 or not sys.argv[1].startswith("http"):
        sys.exit("Usage: python tools/make_qr.py https://efea06.github.io/REPO-NAME/")
    url = sys.argv[1]
    ASSETS.mkdir(exist_ok=True)

    matrix = build_matrix(url)
    write_svg(matrix, ASSETS / "qr.svg")
    write_png(matrix, ASSETS / "qr.png")
    stamp_resume(matrix, url)
    print(f"QR code for {url}")
    print(f"  wrote {ASSETS / 'qr.svg'}")
    print(f"  wrote {ASSETS / 'qr.png'}")
    print(f"  wrote {OUT_RESUME}")

    if render_preview(OUT_RESUME, ASSETS / "resume-preview.png"):
        print(f"  wrote {ASSETS / 'resume-preview.png'}")
    else:
        print("  Could not render resume-preview.png (install pypdfium2 or poppler-utils), so the")
        print("  preview image on the site still shows the old QR code.")


if __name__ == "__main__":
    main()
