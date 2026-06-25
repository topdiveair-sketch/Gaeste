import subprocess, time, json, urllib.request, websocket, itertools, os, signal
profile='/tmp/chrome-prof-zab'
cmd=['chromium','--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9223','--remote-allow-origins=*',f'--user-data-dir={profile}','about:blank']
p=subprocess.Popen(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    # wait
    for _ in range(50):
        try:
            tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9223/json',timeout=1)); break
        except Exception: time.sleep(.1)
    wsurl=tabs[0]['webSocketDebuggerUrl']
    ws=websocket.create_connection(wsurl,timeout=5)
    counter=itertools.count(1)
    def call(method, params=None):
        i=next(counter); ws.send(json.dumps({'id':i,'method':method,'params':params or {}}))
        while True:
            msg=json.loads(ws.recv())
            if msg.get('id')==i: return msg
    call('Runtime.enable'); call('Page.enable'); call('Log.enable')
    url='file:///mnt/data/checkv48/index.html'
    call('Page.navigate', {'url':url})
    time.sleep(5)
    res=call('Runtime.evaluate', {'expression': '''(() => {
      const errors=[];
      const btns=[...document.querySelectorAll('button[onclick]')];
      for(const b of btns){try{ new Function(b.getAttribute('onclick')); }catch(e){errors.push('bad onclick '+b.textContent+': '+e.message)}}
      const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
      const goTargets=[...document.querySelectorAll('button[onclick^="go("]')].map(b=>b.getAttribute('onclick').match(/go\\('([^']+)'\\)/)?.[1]);
      const missingGo=goTargets.filter(id=>!document.getElementById(id));
      const anchors=[...document.querySelectorAll('a')].map(a=>({text:a.textContent.trim(), href:a.href, ok:!!a.getAttribute('href')}));
      const weather=document.getElementById('weatherUpdated')?.textContent||'';
      const chart=!!window.zabWeatherChart;
      return {title:document.title, bodyStart:document.body.innerHTML.slice(0,300), buttons:btns.length, anchors:anchors.length, missingGo, weather, chart, errors, htmlLen:document.body.innerHTML.length};
    })()''', 'returnByValue': True})
    print(json.dumps(res.get('result',{}).get('result',{}).get('value'),ensure_ascii=False,indent=2))
    ws.close()
finally:
    p.terminate()
    try:p.wait(timeout=3)
    except: p.kill()
