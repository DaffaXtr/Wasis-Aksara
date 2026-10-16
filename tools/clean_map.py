"""Bersihkan map.webp: hapus candi 5 + jalurnya, pita 'SAAT INI', dan teks bawaan (judul & penghitung).
Pemakaian: python tools/clean_map.py public/assets/images/map.webp public/assets/images/map-4candi.webp preview.png
Butuh: opencv-python, numpy.
"""
import sys

import cv2
import numpy as np

src, out, preview = sys.argv[1:4]
img = cv2.imread(src, cv2.IMREAD_COLOR)
h, w = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)


def text_mask(x0, y0, x1, y1, thresh=110, grow=3):
    """Piksel gelap (teks) di dalam kotak, diperlebar sedikit."""
    m = np.zeros((h, w), np.uint8)
    roi = gray[y0:y1, x0:x1]
    m[y0:y1, x0:x1] = (roi < thresh).astype(np.uint8) * 255
    return cv2.dilate(m, np.ones((grow * 2 + 1, grow * 2 + 1), np.uint8))


def rect_mask(x0, y0, x1, y1):
    m = np.zeros((h, w), np.uint8)
    m[y0:y1, x0:x1] = 255
    return m


def inpaint(image, mask, radius=7):
    return cv2.inpaint(image, mask, radius, cv2.INPAINT_TELEA)


# 1. Teks judul pada gulungan & teks penghitung (latar kayu/kertas relatif rata)
img = inpaint(img, text_mask(120, 76, 565, 202) | text_mask(1350, 105, 1548, 178), 5)

# 2. Pita 'SAAT INI' di bawah candi 1: salin kertas dari tepat di bawahnya (dibalik) lalu baurkan,
#    karena inpainting menarik warna gelap dari tepi papan nama.
y0, y1, x0, x1 = 717, 760, 254, 410
source = img[y1:y1 + 22, x0:x1]  # baris kertas bersih di atas kotak legenda
patch = np.vstack([source[::-1], source])[:y1 - y0].astype(np.float32)
alpha = np.ones((y1 - y0, x1 - x0), np.float32)
alpha = cv2.GaussianBlur(np.pad(alpha, 6), (0, 0), 3)[6:-6, 6:-6][..., None]
img[y0:y1, x0:x1] = (patch * alpha + img[y0:y1, x0:x1].astype(np.float32) * (1 - alpha)).astype(np.uint8)

# 3. Candi 5 (nomor, bangunan, papan nama) + jalur putus-putus dari candi 4
big = rect_mask(968, 545, 1198, 754)
path = np.zeros((h, w), np.uint8)
points = np.array([(1334, 516), (1318, 526), (1280, 538), (1240, 552), (1218, 572), (1207, 600),
                   (1200, 630), (1186, 652), (1168, 665), (1150, 674)], np.int32)
cv2.polylines(path, [points], False, 255, 22)
path[:513] = 0  # jangan menyentuh tepi bawah papan candi 4
# Semua piksel gelap (garis putus-putus) di koridor jalur, kecuali pepohonan di kanan bawah
dashes = text_mask(1140, 513, 1345, 580, thresh=140, grow=4) | text_mask(1140, 580, 1285, 695, thresh=140, grow=4)
path |= dashes
img = inpaint(img, big | path, 9)

# Tambahkan tekstur kertas pada area isian besar agar tidak tampak polos
mask_fill = (big | path).astype(bool)
rng = np.random.default_rng(7)
noise = rng.normal(0, 1, (h, w)).astype(np.float32)
noise = cv2.GaussianBlur(noise, (0, 0), 6) * 22 + cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 1.2) * 5
soft = cv2.GaussianBlur(mask_fill.astype(np.float32), (0, 0), 6)
textured = np.clip(img.astype(np.float32) + noise[..., None] * soft[..., None], 0, 255).astype(np.uint8)
img = textured

# Sisa titik jalur tepat di bawah papan candi 4: tutup dengan kertas bersih dari sebelah kanannya
def blend_patch(image, x0, y0, x1, y1, sx, sy, feather=4):
    patch = image[sy:sy + (y1 - y0), sx:sx + (x1 - x0)].astype(np.float32)
    alpha = cv2.GaussianBlur(np.pad(np.ones((y1 - y0, x1 - x0), np.float32), feather), (0, 0), feather / 2)
    alpha = alpha[feather:-feather, feather:-feather][..., None]
    image[y0:y1, x0:x1] = (patch * alpha + image[y0:y1, x0:x1].astype(np.float32) * (1 - alpha)).astype(np.uint8)


blend_patch(img, 1306, 511, 1366, 545, 1392, 511)

cv2.imwrite(out, img, [cv2.IMWRITE_WEBP_QUALITY, 90])
cv2.imwrite(preview, img)
print('ok', out)
