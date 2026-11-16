import numpy as np, wave, json
from scipy.signal import lfilter
T=json.load(open('/home/claude/estudio-longo/atlas-motion/public/b52/tempos.json'))
sr=48000; dur=T['total']; n=int(sr*dur); t=np.arange(n)/sr
rng=np.random.default_rng(3)
lp=lambda x,a: lfilter([a],[1,a-1],x)
out=np.zeros(n)
B={b['cena']:b for b in T['blocos']}
def ts(c,i): return B[c]['falas'][i]['t']
def ini(c): return B[c]['ini']
# trilha: acordes graves que mudam a cada bloco (Dm, Bb, F, C ...)
prog=[(73.42,87.31,110.0),(58.27,73.42,87.31),(87.31,110.0,130.81),(65.41,82.41,98.0)]
for k,b in enumerate(T['blocos']):
    a,z=b['ini'],b['fim']; i0,i1=int(a*sr),min(n,int(z*sr)+int(sr*0.6))
    tt=np.arange(i1-i0)/sr; env=np.minimum(1,tt/1.2)*np.minimum(1,(i1-i0-np.arange(i1-i0))/sr/1.0)
    ch=prog[k%4]; seg=np.zeros(i1-i0)
    for j,f0 in enumerate(ch):
        seg+= (0.05-0.012*j)*np.sin(2*np.pi*f0*tt+0.6*np.sin(2*np.pi*0.25*tt+j))
        seg+= 0.012*np.sin(2*np.pi*f0*2*tt)
    out[i0:i1]+=seg*env
# pulso suave a 90 bpm (para nos blocos calmos: título e final)
beat=60/90
for k in range(int(dur/beat)):
    t0=k*beat
    if ini('titulo')<=t0<ini('vetor') or t0>B['final']['falas'][1]['t']: continue
    i0=int(t0*sr); m=int(0.4*sr); tt=np.arange(m)/sr
    if i0+m<n: out[i0:i0+m]+=0.16*np.sin(2*np.pi*46*tt*(1-0.3*tt))*np.exp(-tt*10)
# vento ambiente nas cenas de pista
w=lp(rng.standard_normal(n),0.03); w/=np.abs(w).max()
for c in ['pista','comercial','erro','rolagem']:
    a,z=B[c]['ini'],B[c]['fim']; m=(t>=a)&(t<z+0.5)
    out[m]+=w[m]*0.12*np.minimum(1,(t[m]-a)/1.0)*np.minimum(1,(z+0.5-t[m])/1.0)
def whoosh(t0,d=.8,g=.35):
    i0=int(t0*sr); m=int(d*sr); x=lp(rng.standard_normal(m),0.12); e=np.sin(np.pi*np.linspace(0,1,m))**3
    out[i0:i0+m]+=x*e/np.abs(x).max()*g
def hit(t0,g=.6,f=55,ru=.3):
    i0=int(t0*sr); m=int(.9*sr); tt=np.arange(m)/sr
    x=np.sin(2*np.pi*f*tt*(1-0.35*tt))*np.exp(-tt*5)+ru*lp(rng.standard_normal(m),0.4)*np.exp(-tt*22)
    k=min(m,n-i0); out[i0:i0+k]+=x[:k]*g
def chiado(t0,d=.6,g=.3):
    i0=int(t0*sr); m=int(d*sr); tt=np.arange(m)/sr; x=rng.standard_normal(m); x=x-lp(x,0.3); out[i0:i0+m]+=x*np.exp(-tt*5)*g*0.6
def tick(t0,g=.12):
    i0=int(t0*sr); m=int(.03*sr); tt=np.arange(m)/sr; out[i0:i0+m]+=np.sin(2*np.pi*2600*tt)*np.exp(-tt*220)*g
for b in T['blocos'][1:]: whoosh(b['ini']-0.45)
hit(ini('titulo')+0.1,.5,80,.2)
hit(ts('pista',4),.5,75,.5)                         # ON PURPOSE
hit(ts('pista',4)+10/30,.4,42,.2); chiado(ts('pista',4)+10/30)  # toque
hit(ts('frente',5)+1.0,.8,46,.6); chiado(ts('frente',5)+1.0,.4,.45)  # ponta bate
hit(ts('frente',6),.5,75,.5)                        # OFF THE TABLE
hit(ts('erro',3)+10/30,.9,42,.6); chiado(ts('erro',3)+10/30,1.0,.5)  # carga lateral
for k in range(18): tick(ini('trem')+16/30+k*(54/30/17))
hit(ini('trem')+72/30,.6,60,.3)
hit(ts('rolagem',3)+12/30,.5,75,.5)                 # CLASSIFIED
for k in range(30): tick(ts('linha',1)+k*0.12,.06)
whoosh(ts('final',2)-0.3,.8,.3)
out=np.tanh(out*1.1)*0.7
wv=wave.open('sfx.wav','wb');wv.setnchannels(1);wv.setsampwidth(2);wv.setframerate(sr);wv.writeframes((out*32767).astype(np.int16).tobytes());wv.close()
print('ok',round(dur,1))
