import json,re,time,urllib.request,os,sys
UA='QuantoVoceDura-research/1.0 (https://tavindigital.online; history video research)'
pasta=sys.argv[1]
inf=json.load(open(pasta+'/info.json'))
for i in inf:
    nome=i.get('arq')
    if not nome or os.path.exists(pasta+'/'+nome): continue
    url=i['url'].replace('thumb.wikimedia.org','upload.wikimedia.org')
    for t in range(5):
        try:
            data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=60).read()
            open(pasta+'/'+nome,'wb').write(data); print('ok',nome,flush=True); break
        except Exception as e:
            print('erro',nome,str(e)[:40],flush=True); time.sleep(60*(t+1))
    time.sleep(15)
print('FIM')
