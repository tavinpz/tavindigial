# Trilha e efeitos do Crosswind #02 (SR-71). Modelo: cw01/sfx.py. Uso: python3 cw02/sfx.py  -> cw02/sfx.wav
import numpy as np, wave, json, os
from scipy.signal import lfilter
AQUI=os.path.dirname(os.path.abspath(__file__))
T=json.load(open(os.path.join(AQUI,'..','atlas-motion','public','sr71','tempos.json')))
sr=48000; dur=T['total']; n=int(sr*dur); t=np.arange(n)/sr
rng=np.random.default_rng(7)
lp=lambda x,a: lfilter([a],[1,a-1],x)
out=np.zeros(n)
B={b['cena']:b for b in T['blocos']}
def ts(c,i,palavra=None):
    f=B[c]['falas'][i]; x=f['t']
    if palavra:
        k=f['txt'].lower().find(palavra.lower())
        if k>=0: x+=f['d']*k/(len(f['txt'])+1)
    return x
def ini(c): return B[c]['ini']
def soma(i0,x):
    if i0<0 or i0>=n: return
    k=min(len(x),n-i0); out[i0:i0+k]+=x[:k]
# trilha: acordes graves que mudam a cada bloco
prog=[(73.42,87.31,110.0),(58.27,73.42,87.31),(87.31,110.0,130.81),(65.41,82.41,98.0)]
for k,b in enumerate(T['blocos']):
    a,z=b['ini'],b['fim']; i0,i1=int(a*sr),min(n,int(z*sr)+int(sr*0.6))
    tt=np.arange(i1-i0)/sr; env=np.minimum(1,tt/1.2)*np.minimum(1,(i1-i0-np.arange(i1-i0))/sr/1.0)
    ch=prog[k%4]; seg=np.zeros(i1-i0)
    for j,f0 in enumerate(ch):
        seg+=(0.05-0.012*j)*np.sin(2*np.pi*f0*tt+0.6*np.sin(2*np.pi*0.25*tt+j))
        seg+=0.012*np.sin(2*np.pi*f0*2*tt)
    out[i0:i1]+=seg*env
# pulso suave a 90 bpm nos blocos calmos
CALMOS=['titulo','expansao','mito','legado']
beat=60/90
for k in range(int(dur/beat)):
    t0=k*beat
    if not any(B[c]['ini']<=t0<B[c]['fim'] for c in CALMOS) and t0<ts('final',1): continue
    m=int(0.4*sr); tt=np.arange(m)/sr
    soma(int(t0*sr),0.16*np.sin(2*np.pi*46*tt*(1-0.3*tt))*np.exp(-tt*10))
# vento: pátio (leve) e voo em altitude (mais forte)
w=lp(rng.standard_normal(n),0.03); w/=np.abs(w).max()
def vento(a,z,g):
    m=(t>=a)&(t<z+0.5); out[m]+=w[m]*g*np.minimum(1,(t[m]-a)/1.0)*np.minimum(1,(z+0.5-t[m])/1.0)
vento(ini('rampa'),ts('rampa',3),.07); vento(ts('rampa',4),ts('rampa',5,'And the reason'),.07)
vento(ts('rampa',5,'And the reason'),B['rampa']['fim'],.2)
for c in ['altitude','calor','selar']: vento(B[c]['ini'],B[c]['fim'],.16)
def whoosh(t0,d=.8,g=.35):
    m=int(d*sr); x=lp(rng.standard_normal(m),0.12); e=np.sin(np.pi*np.linspace(0,1,m))**3
    soma(int(t0*sr),x*e/np.abs(x).max()*g)
def hit(t0,g=.6,f=55,ru=.3):
    m=int(.9*sr); tt=np.arange(m)/sr
    soma(int(t0*sr),(np.sin(2*np.pi*f*tt*(1-0.35*tt))*np.exp(-tt*5)+ru*lp(rng.standard_normal(m),0.4)*np.exp(-tt*22))*g)
def chiado(t0,d=.6,g=.3):
    m=int(d*sr); tt=np.arange(m)/sr; x=rng.standard_normal(m); x=x-lp(x,0.3); soma(int(t0*sr),x*np.exp(-tt*5)*g*0.6)
def tick(t0,g=.12,f=2600):
    m=int(.03*sr); tt=np.arange(m)/sr; soma(int(t0*sr),np.sin(2*np.pi*f*tt)*np.exp(-tt*220)*g)
def pingo(t0,g=.16):
    m=int(.16*sr); tt=np.arange(m)/sr; f=880+rng.uniform(-90,160)
    soma(int(t0*sr),np.sin(2*np.pi*f*tt*(1+1.6*tt))*np.exp(-tt*34)*g)
def ronco(a,z,g=.2,f=52):
    i0=int(a*sr); m=int((z-a)*sr); tt=np.arange(m)/sr
    x=np.sin(2*np.pi*f*tt)+0.5*np.sin(2*np.pi*f*2.02*tt)+0.8*lp(rng.standard_normal(m),0.02)*6
    soma(i0,x*g*np.minimum(1,tt/0.8)*np.minimum(1,(m/sr-tt)/0.6)*0.5)
def pingos(a,z,dens=2.6):
    x=a
    while x<z: pingo(x,.10+rng.uniform(0,.08)); x+=rng.exponential(1/dens)
for b in T['blocos'][1:]: whoosh(b['ini']-0.45)
# --- rampa (gancho) ---
hit(ts('rampa',0,'The fastest')+.1,.45,80,.2)
whoosh(ts('rampa',1)-.35,.7,.3); pingos(ts('rampa',1)+.5,ts('rampa',3)-.2)
whoosh(ts('rampa',3)-.35,.7,.3); pingos(ts('rampa',3)+.3,ts('rampa',3)+2.0,2)
hit(ts('rampa',3,'ground it'),.75,70,.5)                       # GROUNDED
hit(ts('rampa',3,'A fuel leak'),.4,95,.3)
whoosh(ts('rampa',4)-.35,.7,.3); pingos(ts('rampa',4),ts('rampa',5,'And the reason')-.3,2)
chiado(ts('rampa',4,'starts the')+.4,.5,.4); ronco(ts('rampa',4,'starts the')+.5,ts('rampa',5,'And the reason'),.22)
hit(ts('rampa',5)+.2,.5,75,.4)                                   # NOTHING IS BROKEN
hit(ts('rampa',5,'built to leak'),.7,60,.5)                      # BUILT TO LEAK
whoosh(ts('rampa',5,'And the reason')-.3,1.0,.45); ronco(ts('rampa',5,'And the reason'),B['rampa']['fim'],.3,44)
hit(ts('rampa',5,'three times'),.8,46,.5)
hit(ini('titulo')+0.1,.5,80,.2)
# --- demais cenas ---
def vz(c,i,p=None,g=.5,f=75,ru=.4): hit(ts(c,i,p),g,f,ru)
def conta(a,z,n=24,g=.06):
    for k in range(n): tick(a+(z-a)*k/n,g)
conta(ini('altitude')+.2,ini('altitude')+2.0); vz('altitude',1,None,.5,70); vz('altitude',1,'Over two',.35,95,.2)
whoosh(ts('altitude',2,'Faster')-.2,1.0,.4); vz('altitude',3,None,.4,110,.2); vz('altitude',4,None,.6,50,.5); conta(ts('altitude',4)+.2,ts('altitude',4)+1.5)
whoosh(ts('calor',1)-.2,.9,.3); vz('calor',1,'And when',.45,60); conta(ts('calor',2),ts('calor',2)+1.5); vz('calor',2,None,.45,70)
vz('calor',3,None,.35,95,.2); vz('calor',3,'Near the',.35,85,.2); whoosh(ts('calor',4)-.3); vz('calor',4,'would go',.6,46,.5); vz('calor',5,None,.4,90,.2); conta(ts('calor',5,'More than'),ts('calor',5,'More than')+1.0)
vz('titanio',0,'America',.6,55,.5); whoosh(ts('titanio',1)-.3); vz('titanio',1,None,.5,60,.4); vz('titanio',1,'The very',.35,95,.2)
whoosh(ts('titanio',2)-.2,.6,.25); [tick(ts('titanio',2)+.3+k*.33,.1,1800) for k in range(8)]
whoosh(ts('titanio',3)-.3); vz('titanio',3,'ordinary',.4,120,.6); chiado(ts('titanio',3,'brittle')-.25,.5,.5); vz('titanio',3,'brittle',.6,50,.6); vz('titanio',3,'Lockheed',.4,95,.2)
whoosh(ts('titanio',4)-.3); [tick(ts('titanio',4)+.47+k*.2,.14,900) for k in range(10)]; vz('titanio',4,'eighty',.6,55,.4)
whoosh(ts('titanio',5)-.3); vz('titanio',5,None,.35,95,.2); vz('titanio',5,'But it',.6,48,.4)
ronco(ini('expansao')+.3,ts('expansao',2),.1,70); vz('expansao',0,'and it grows',.45,70); whoosh(ts('expansao',2)-.3); vz('expansao',2,None,.3,95,.2)
whoosh(ts('expansao',3)-.3); vz('expansao',3,None,.4,80,.2); ronco(ts('expansao',3,'And in flight'),ts('expansao',5),.12,60); vz('expansao',4,'three to four',.55,60); vz('expansao',4,'And one',.45,70); vz('expansao',5,None,.5,50,.4)
whoosh(ts('dilema',1)-.3); vz('dilema',1,None,.35,95,.2); ronco(ts('dilema',1,'then at'),ts('dilema',3),.16,48); conta(ts('dilema',1,'then at'),ts('dilema',1,'then at')+2.0)
chiado(ts('dilema',2,'The skin')-.3,.8,.6); vz('dilema',2,'The skin',.9,42,.7); whoosh(ts('dilema',3)-.3); vz('dilema',3,None,.4,80,.2); vz('dilema',3,'made a',.5,60,.3)
whoosh(ts('dilema',4)-.3); vz('dilema',4,None,.5,70,.3); conta(ts('dilema',4,'Not at'),ts('dilema',4,'Not at')+1.3); vz('dilema',4,'Not at',.5,55,.4)
vz('folgas',0,None,.4,80,.2); vz('folgas',0,'On purpose',.6,60,.4); whoosh(ts('folgas',1)-.3); vz('folgas',1,None,.35,95,.2); vz('folgas',1,'with ridges',.3,110,.2)
whoosh(ts('folgas',2)-.3); vz('folgas',2,'Ford',.4,90,.3); whoosh(ts('folgas',3)-.3); ronco(ts('folgas',3)+.3,ts('folgas',4),.1,66); vz('folgas',3,'and the wing',.4,95,.2)
whoosh(ts('folgas',4)-.3); vz('folgas',4,'real problem',.7,46,.5)
vz('tanques',0,None,.6,55,.4); vz('tanques',1,'The skin',.5,70,.3); [tick(ts('tanques',1,'Six main')+k*.12,.14,1500) for k in range(6)]
whoosh(ts('tanques',2)-.3); conta(ts('tanques',2)+.3,ts('tanques',2)+1.7); vz('tanques',2,'Eighty',.5,60,.3); vz('tanques',2,'about twelve',.35,95,.2); vz('tanques',2,'More than',.5,55,.4)
whoosh(ts('tanques',3)-.3); vz('tanques',3,'A rubber',.4,110,.5); vz('tanques',3,'And no',.4,110,.5); ronco(ts('tanques',3,'And no'),ts('tanques',4),.1,58)
whoosh(ts('tanques',4)-.3); pingos(ts('tanques',4)+.4,ts('tanques',5),1.3); vz('tanques',4,'Drip by',.4,90,.2); whoosh(ts('tanques',5)-.3); pingos(ts('tanques',5),B['tanques']['fim'],2.5); vz('tanques',5,None,.6,55,.4)
ronco(ini('selar'),ts('selar',3),.28,44); conta(ini('selar')+.4,ts('selar',2)); vz('selar',1,None,.35,100,.2); vz('selar',1,'The metal',.35,90,.2); vz('selar',1,'The gaps',.35,80,.2)
vz('selar',2,'and the tanks',.8,50,.5); whoosh(ts('selar',3)-.3); vz('selar',3,None,.6,60,.4); vz('selar',3,"It's what",.4,85,.2)
pingos(ini('fosforo'),ts('fosforo',1),2.2); vz('fosforo',0,'How is',.6,60,.5); whoosh(ts('fosforo',1)-.3); vz('fosforo',1,None,.5,65,.3); vz('fosforo',1,'and it was',.35,95,.2)
whoosh(ts('fosforo',2)-.3); chiado(ts('fosforo',2,'drop a lit')-.1,.25,.5); whoosh(ts('fosforo',2,'drop a lit')+.3,.8,.25); chiado(ts('fosforo',2,'drop a lit')+1.2,.9,.7); vz('fosforo',2,'and the match',.5,60,.3)
vz('fosforo',3,None,.4,80,.2); whoosh(ts('fosforo',3)+.7); [vz('fosforo',3,p,.3,110,.15) for p in ['the cockpit','the sensors','and the hydraulics']]; ronco(ts('fosforo',3,'before it'),ts('fosforo',4),.18,48); vz('fosforo',3,'The engines even',.4,85,.2)
whoosh(ts('fosforo',4)-.3); [chiado(ts('fosforo',4)+.6+k*.7,.15,.35) for k in range(5)]; vz('fosforo',4,'How do',.6,50,.4)
vz('teb',0,None,.4,85,.2); vz('teb',0,'T E B',.7,55,.4); whoosh(ts('teb',1)+.5,.5,.3); vz('teb',1,None,.1,60,.1); hit(ts('teb',1)+.95,.9,60,.8); chiado(ts('teb',1)+.95,1.0,.6)
whoosh(ts('teb',2)-.3); hit(ts('teb',2,'to start'),.9,70,.8); chiado(ts('teb',2,'to start'),.7,.6); ronco(ts('teb',2,'to start')+.2,ts('teb',2,'and another')+.6,.2,52)
hit(ts('teb',2,'and another')+.55,1.0,50,.9); chiado(ts('teb',2,'and another')+.55,1.0,.7); ronco(ts('teb',2,'and another')+.7,ts('teb',3),.38,40); vz('teb',2,"That's the",.4,95,.2)
whoosh(ts('teb',3)-.3); [tick(ts('teb',3)+.55+k*(ts('teb',3,'Use them')+1.3-ts('teb',3)-.55)/16,.16,1200) for k in range(16)]; hit(ts('teb',3,'Use them')+1.5,.8,48,.5)
vz('mito',0,None,.4,80,.2); whoosh(ts('mito',1)-.3); pingos(ts('mito',1),ts('mito',2),5); vz('mito',1,'take off',.35,95,.2); vz('mito',1,'and refuel',.35,85,.2)
whoosh(ts('mito',2)-.3); vento(ts('mito',2),ts('mito',3),.14); vz('mito',2,None,.45,70,.3); vz('mito',2,'It did take',.3,105,.2); vz('mito',2,'And it did',.3,105,.2)
whoosh(ts('mito',3)-.3); hit(ts('mito',3,'say the leaks')+.55,.9,55,.6); vz('mito',3,'It simply',.4,85,.2); whoosh(ts('mito',4)-.3); vz('mito',4,'heat',.8,46,.5); vz('mito',4,'Again',.6,60,.4)
ronco(ini('nitrogenio'),ts('nitrogenio',1),.16,50); conta(ini('nitrogenio')+.2,ini('nitrogenio')+2.3,16); vz('nitrogenio',0,'could ignite',.7,50,.7); chiado(ts('nitrogenio',0,'could ignite'),.4,.5)
whoosh(ts('nitrogenio',1)+.2,1.0,.3); vz('nitrogenio',1,'A gas',.4,95,.2); whoosh(ts('nitrogenio',2)-.3); ronco(ts('nitrogenio',2,'fill the tanks'),ts('nitrogenio',2,'and let'),.14,80); whoosh(ts('nitrogenio',2,'pushing'),1.2,.3); vz('nitrogenio',2,'and let',.4,90,.2)
whoosh(ts('nitrogenio',3)-.3); vz('nitrogenio',3,None,.4,80,.2); vz('nitrogenio',3,'and safer',.4,85,.2); whoosh(ts('nitrogenio',4)-.3); [tick(ts('nitrogenio',4)+.2+k*.053,.07,1700) for k in range(56)]; vz('nitrogenio',4,'Fifty six',.55,60,.3); vz('nitrogenio',4,'for thirty',.5,65,.3)
vz('preto',0,'Even its',.5,60,.3); whoosh(ts('preto',1,'A dark'),1.2,.25); conta(ts('preto',1,'and it took'),ts('preto',1,'and it took')+1.0); vz('preto',1,'and it took',.45,75,.2)
whoosh(ts('preto',2)-.3); vz('preto',2,'It was quartz',.5,65,.3); whoosh(ts('preto',3)-.3); ronco(ts('preto',3),B['preto']['fim'],.2,46); vz('preto',3,'It was set by',.5,60,.3); hit(ts('preto',4,'got too hot'),.9,48,.6)
vz('legado',0,None,.3,95,.2); whoosh(ts('legado',1)-.3); vz('legado',1,None,.45,70,.3); [tick(ts('legado',1,'Thirty two')+k/30,.07,1700) for k in range(32)]
whoosh(ts('legado',2)-.3); conta(ts('legado',2,'Two thousand'),ts('legado',2,'Two thousand')+2.3,40); hit(ts('legado',2,'Two thousand')+2.35,.7,50,.4); vz('legado',2,'For a crewed',.4,90,.2)
whoosh(ts('legado',3)-.3,1.4,.4); vz('legado',3,'under',.45,70,.3); whoosh(ts('legado',4)-.3); vento(ts('legado',4),ts('legado',5),.14); vz('legado',4,'not one',.6,55,.4); hit(ts('legado',4,'Accelerate'),.9,48,.6); whoosh(ts('legado',4,'Accelerate'),1.4,.5); ronco(ts('legado',4,'Accelerate'),ts('legado',5),.3,42)
whoosh(ts('legado',5)-.3); vz('legado',5,None,.4,80,.2); vz('legado',5,'NASA',.5,60,.3)
pingos(ini('final'),ts('final',1),.5); whoosh(ts('final',1)-.3); pingos(ts('final',1),ts('final',3),2.2); vz('final',1,"it's not",.4,80,.2); vz('final',2,None,.7,50,.4)
whoosh(ts('final',3)-.3,.8,.3); vz('final',3,None,.5,65,.3); vz('final',3,'The A three',.5,60,.3); vz('final',3,'Why',.7,48,.4)
out=np.tanh(out*1.1)*0.7
wv=wave.open(os.path.join(AQUI,'sfx.wav'),'wb');wv.setnchannels(1);wv.setsampwidth(2);wv.setframerate(sr);wv.writeframes((out*32767).astype(np.int16).tobytes());wv.close()
print('ok',round(dur,1))
