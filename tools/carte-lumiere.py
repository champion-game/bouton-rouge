# Carte d'ombre de la pièce (assets/img/ombre.webp), tirée de l'image de référence keyart.webp.
# Usage : python3 tools/carte-lumiere.py 0.24 38 0.5   (ombre min, flou, contraste)
import sys, numpy as np
from PIL import Image
def box(x,r,ax):
    c=np.cumsum(np.pad(x,[(r+1,r) if i==ax else (0,0) for i in range(2)],mode='edge'),axis=ax)
    n=x.shape[ax]
    return (np.take(c,range(2*r+1,2*r+1+n),axis=ax)-np.take(c,range(0,n),axis=ax))/(2*r+1)
def gauss(x,s):
    r=int(s*1.15)
    for _ in range(3): x=box(box(x,r,0),r,1)
    return x
MIN=float(sys.argv[1]); SIG=float(sys.argv[2]); G=float(sys.argv[3])
a=np.asarray(Image.open('/home/user/bouton-rouge/assets/img/keyart.webp').convert('RGB')).astype(np.float64)/255
L=0.2126*a[...,0]**2.2+0.7152*a[...,1]**2.2+0.0722*a[...,2]**2.2
P=400; Q=220
L=np.pad(L,((Q,Q),(P,P)),mode='edge')
B=gauss(L,SIG); B=np.clip(B/np.percentile(B,99.7),0,1)**G
alpha=(1-MIN)*(1-B)
h,w=alpha.shape; yy,xx=np.mgrid[0:h,0:w]
f=np.minimum(np.clip(np.minimum(xx,w-1-xx)/P,0,1),np.clip(np.minimum(yy,h-1-yy)/Q,0,1))**0.5
alpha=alpha*f+(1-MIN)*(1-f)
out=np.zeros((h,w,4),np.uint8); out[...,3]=(alpha*255).round().astype(np.uint8)
Image.fromarray(out,'RGBA').resize((w//2,h//2),Image.LANCZOS).save('/home/user/bouton-rouge/assets/img/ombre.webp',quality=82,method=6)
print(w//2,h//2,alpha.min(),alpha.max())
