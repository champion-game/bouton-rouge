# Mur de fond (assets/img/mur_fond.webp) reconstruit à partir des zones de mur vides de keyart.webp.
# Usage : python3 tools/fond-mur.py
# Le relief (taches, béton) vient du modèle ; l'éclairage est retiré (la carte d'ombre s'en charge).
import numpy as np
from PIL import Image
R = np.random.default_rng(41)
W, H, BAND = 1780, 900, 500          # bandeau à y=500 dans l'image (= y 375 de la pièce)

def box(x, r, ax):
    pad = [(r + 1, r) if i == ax else (0, 0) for i in range(x.ndim)]
    c = np.cumsum(np.pad(x, pad, mode='edge'), axis=ax); n = x.shape[ax]
    return (np.take(c, range(2 * r + 1, 2 * r + 1 + n), axis=ax) - np.take(c, range(0, n), axis=ax)) / (2 * r + 1)
def gauss(x, s):
    r = max(1, int(s * 1.15))
    for _ in range(3): x = box(box(x, r, 0), r, 1)
    return x

k = np.asarray(Image.open('assets/img/keyart.webp').convert('RGB')).astype(float) / 255
lum = k.mean(2)
def detail(x1, y1, x2, y2):
    p = lum[y1:y2, x1:x2]
    return np.clip(p / (gauss(p, 18) + 1e-3), 0.6, 1.5)
pool = [detail(1110, 0, 1470, 108), detail(486, 20, 530, 380), detail(1110, 0, 1470, 108)]

# Synthèse : morceaux tirés au hasard, retournés, fondus sur des bords doux.
acc = np.zeros((H, W)); wsum = np.zeros((H, W))
for _ in range(1400):
    p = pool[R.integers(len(pool))]
    ph, pw = p.shape; h = min(ph, R.integers(60, 112)); w = min(pw, R.integers(40, 220))
    y0 = R.integers(0, ph - h + 1); x0 = R.integers(0, pw - w + 1)
    q = p[y0:y0 + h, x0:x0 + w]
    if R.random() < .5: q = q[:, ::-1]
    if R.random() < .5: q = q[::-1]
    fy = np.sin(np.linspace(0, np.pi, h))[:, None]; fx = np.sin(np.linspace(0, np.pi, w))[None]
    m = (fy * fx) ** 1.0
    Y = R.integers(-h // 2, H - h // 2); X = R.integers(-w // 2, W - w // 2)
    for yy in range(h):
        ty = (Y + yy) % H
        xs = (X + np.arange(w)) % W
        acc[ty, xs] += q[yy] * m[yy]; wsum[ty, xs] += m[yy]
D = np.where(wsum > 0.05, acc / np.maximum(wsum, 1e-3), 1.0)
D = D / gauss(D, 40)                                     # pas de grandes plages claires ou sombres

# Coulures verticales et salissures larges, discrètes.
n = gauss(R.normal(0, 1, (1, W)).repeat(8, 0), 3)[0]
coul = 1 - 0.10 * np.clip(n, 0, None)[None] * np.linspace(0.3, 1, H)[:, None] ** 2
sale = 1 + 0.12 * gauss(R.normal(0, 1, (H, W)), 60) / 0.02 * 0.02
D = D ** 0.9 * coul * np.clip(sale, 0.8, 1.2)

haut = np.array([104, 106, 97]) / 255; bas = np.array([58, 69, 64]) / 255
y = np.arange(H)[:, None, None]
col = np.where(y < BAND, haut, bas)
img = col * np.where(y < BAND, D[..., None] ** 1.5, D[..., None] ** 1.1)
# bord du bandeau : trait sombre puis reflet
img[BAND - 2:BAND + 1] *= 0.45; img[BAND + 1:BAND + 3] *= 1.35
# raccord gauche-droite : la synthèse boucle déjà (positions modulo W)
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save('assets/img/mur_fond.webp', quality=88, method=6)
print('ok', img.mean())
