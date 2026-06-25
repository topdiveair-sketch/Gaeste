import subprocess, time, json, urllib.request, websocket, itertools, os, signal
server=subprocess.Popen(['python3','-m','http.server','8017','--directory','/mnt/data/checkv48'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
chrome=subprocess.Popen(['chromium','--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9224','--remote-allow-origins=*','--user-data-dir=/tmp/chrome-prof-zab2','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try:
            tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9224/json',timeout=1)); break
        except Exception: time.sleep(.1)
    ws=websocket.create_connection(tabs[0]['webSocketDebuggerUrl'],timeout=5)
    counter=itertools.count(1)
    events=[]
    def call(method, params=None):
        i=next(counter); ws.send(json.dumps({'id':i,'method':method,'params':params or {}}))
        while True:
            msg=json.loads(ws.recv())
            if msg.get('method') in ('Runtime.exceptionThrown','Log.entryAdded','Runtime.consoleAPICalled'):
                events.append(msg)
            if msg.get('id')==i: return msg
    call('Runtime.enable'); call('Page.enable'); call('Log.enable')
    call('Page.navigate', {'url':'http://127.0.0.1:8017/index.html'})
    time.sleep(6)
    expr='''(() => {
      const errors=[];
      const btns=[...document.querySelectorAll('button[onclick]')];
      for(const b of btns){try{ new Function(b.getAttribute('onclick')); }catch(e){errors.push('bad onclick '+b.textContent+': '+e.message)}}
      const goTargets=[...document.querySelectorAll('button[onclick^="go("]')].map(b=>b.getAttribute('onclick').match(/go\\('([^']+)'\\)/)?.[1]);
      const missingGo=goTargets.filter(id=>!document.getElementById(id));
      const anchors=[...document.querySelectorAll('a')].map(a=>({text:a.textContent.trim(), href:a.getAttribute('href'), ok:!!a.getAttribute('href')}));
      const badAnchors=anchors.filter(a=>!a.ok);
      const weather=document.getElementById('weatherUpdated')?.textContent||'';
      const chart=!!window.zabWeatherChart;
      const appcheck=typeof runAppCheck==='function';
      return {title:document.title, bodyStart:document.body.innerHTML.slice(0,250), buttons:btns.length, anchors:anchors.length, missingGo, badAnchors, weather, chart, appcheck, errors, htmlLen:document.body.innerHTML.length};
    })()'''
    res=call('Runtime.evaluate', {'expression': expr, 'returnByValue': True})
    print(json.dumps(res.get('result',{}).get('result',{}).get('value'),ensure_ascii=False,indent=2))
    print('EVENTS',json.dumps(events[:5],ensure_ascii=False)[:1000])
finally:
    chrome.terminate(); server.terminate()
    try: chrome.wait(timeout=2)
    except: chrome.kill()
    try: server.wait(timeout=2)
    except: server.kill()
