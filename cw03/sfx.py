# Trilha e efeitos do Crosswind #03 (A380 x 747). Modelo: cw01/sfx.py. Uso: python3 cw03/sfx.py  -> cw03/sfx.wav
import numpy as np, wave, json, os
from scipy.signal import lfilter
AQUI=os.path.dirname(os.path.abspath(__file__))
T=json.load(open(os.path.join(AQUI,'..','atlas-motion','public','a380','tempos.json')))
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
CALMOS=['titulo','nascimento','virada','ironia']
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
for c in ['supersonico','hoje']: vento(B[c]['ini'],B[c]['fim'],.16)
for c in ['quatro','gemeos']: vento(B[c]['ini'],B[c]['fim'],.08)
vento(ini('gigante'),ts('gigante',6),.06)
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
def vz(c,i,p=None,g=.5,f=75,ru=.4): hit(ts(c,i,p),g,f,ru)
def conta(a,z,n=24,g=.06):
    for k in range(n): tick(a+(z-a)*k/n,g)
# batida leve no começo de cada fala (menos a primeira do bloco)
for b in T['blocos']:
    for i,f in enumerate(b['falas'][1:]): hit(f['t'],.28,[95,85,105,80][i%4],.15)
hit(ini('titulo')+0.1,.5,80,.2)
# carimbos e momentos fortes
for c,i,p,g_ in [('gigante',0,'The biggest',.5),('gigante',2,None,.5),('gigante',3,'Airbus stopped',.9),('gigante',6,'The hump',.8),('nascimento',4,'almost nobody',.6),('supersonico',3,None,.7),
  ('corcunda',1,"And you can't",.8),('corcunda',3,None,.7),('corcunda',4,None,.8),('quatro',3,None,.6),('quatro',4,'Then it',.7),('aposta',0,'The biggest',.7),('aposta',4,'It was',.6),
  ('aeroportos',0,'The airplane',.9),('fios',0,None,.7),('fios',3,'In places',.7),('fios',4,'The first',.8),('fios',5,None,.8),('motores',0,'But what',.6),('motores',4,'out of date',.9),
  ('gemeos',0,'It was gone',.9),('rede',3,'They want',.6),('cheio',1,'On most',.7),('cheio',4,None,.7),('cheio',4,'The program',.8),('virada',1,None,.8),('virada',4,None,.6),
  ('carga',0,None,.8),('carga',4,'never built',.9),('ironia',0,None,.6),('ironia',1,'When that',.7),('ironia',3,'kept it alive',.7),('hoje',0,'Number one',.6),('final',1,None,.7),('final',2,None,.7),('final',3,'The U two',.6)]:
    hit(ts(c,i,p)+(.2 if p is None and i in (2,) else 0),g_,52,.5)
# contadores
for c,i,p,d in [('gigante',1,'Room for',1.0),('gigante',3,'after only',1.0),('gigante',5,None,2.3),('quatro',4,None,1.5),('aposta',4,None,1.8),('aeroportos',2,'more than',1.3),('fios',1,None,2.0),
  ('motores',2,'fifteen',1.0),('gemeos',2,'More than',1.3),('rede',2,'forty five',.9),('cheio',2,'Emirates took',1.7),('cheio',4,'The program',1.3),('virada',2,None,1.2),('carga',2,'More than',1.3),('ironia',3,'kept it alive',1.3),('hoje',0,'Number one',1.7)]:
    conta(ts(c,i,p),ts(c,i,p)+d,int(d*14))
# motores e portas
ronco(ts('corcunda',0,'So the nose'),ts('corcunda',1),.12,70); ronco(ts('carga',1,'Lift the'),ts('carga',2),.12,70); ronco(ini('supersonico'),ts('supersonico',2),.28,44)
ronco(ts('motores',1),ts('motores',2),.14,90); ronco(ts('gemeos',3),B['gemeos']['fim'],.12,90); ronco(ini('hoje'),B['hoje']['fim'],.18,50)
chiado(ts('fios',3)+.6,.5,.4); chiado(ts('aeroportos',1,'with boarding'),.6,.3); whoosh(ts('gemeos',2)+1.0,1.6,.35); whoosh(ts('nascimento',3)+.3,1.6,.3)
[tick(ts('carga',3)+k*.03,.05,1500) for k in range(60)]; [tick(ts('cheio',2)+k*.04,.05,1700) for k in range(60)]
out=np.tanh(out*1.1)*0.7
wv=wave.open(os.path.join(AQUI,'sfx.wav'),'wb');wv.setnchannels(1);wv.setsampwidth(2);wv.setframerate(sr);wv.writeframes((out*32767).astype(np.int16).tobytes());wv.close()
print('ok',round(dur,1))
