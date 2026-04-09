import React, { useRef, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

interface HlsPlayerProps {
  url: string;
  autoPlay?: boolean;
  /** true = modo ao vivo (sem seekbar, com badge AO VIVO). false = modo gravacao (com seekbar, sem badge) */
  live?: boolean;
}

function buildPlayerHtml(url: string, autoPlay: boolean, live: boolean): string {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#000;overflow:hidden;-webkit-tap-highlight-color:transparent}
#container{position:relative;width:100%;height:100%;background:#000}
video{width:100%;height:100%;object-fit:contain}
#loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000;z-index:10}
#loading .spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#loading span{color:#fff;font:13px -apple-system,sans-serif;margin-top:10px}
#error{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000;z-index:10;flex-direction:column}
#error p{color:#f87171;font:13px -apple-system,sans-serif;margin-bottom:12px}
#error button{padding:8px 16px;background:#fff;color:#000;border:none;border-radius:6px;font:13px -apple-system,sans-serif}
#controls{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.8));padding:6px 10px;z-index:5;transition:opacity .3s;display:flex;flex-direction:column;gap:4px}
#controls.hidden{opacity:0;pointer-events:none}
#controls-row{display:flex;align-items:center;justify-content:space-between}
.left,.right{display:flex;align-items:center;gap:8px}
#seekbar-row{display:none;align-items:center;gap:4px}
#seekbar-row span{color:#fff;font:10px -apple-system,sans-serif;min-width:32px}
#seekbar-row span:last-child{text-align:right}
#seekbar{flex:1;height:3px;-webkit-appearance:none;appearance:none;background:rgba(255,255,255,.3);border-radius:2px;outline:none}
#seekbar::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:#fff;border-radius:50%}
button.ctrl{background:none;border:none;color:#fff;padding:4px;cursor:pointer;display:flex;align-items:center}
#live-badge{display:flex;align-items:center;gap:5px;background:#dc2626;color:#fff;font:bold 11px -apple-system,sans-serif;padding:4px 8px;border-radius:4px;border:none;cursor:pointer}
#live-badge .dot{width:7px;height:7px;background:#fff;border-radius:50%;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
#quality-btn{color:#fff;font:bold 11px -apple-system,sans-serif;padding:3px 6px;border:1px solid rgba(255,255,255,.4);border-radius:4px;background:none;cursor:pointer}
#quality-menu{position:absolute;bottom:100%;right:0;margin-bottom:8px;background:rgba(0,0,0,.92);border-radius:8px;overflow:hidden;min-width:90px;display:none}
#quality-menu button{display:block;width:100%;text-align:left;padding:8px 12px;color:#fff;font:12px -apple-system,sans-serif;border:none;background:none;cursor:pointer}
#quality-menu button:active,#quality-menu button.active{background:rgba(255,255,255,.15);font-weight:bold}
#big-play{position:absolute;inset:0;display:none;align-items:center;justify-content:center;pointer-events:none;z-index:3}
#big-play div{width:56px;height:56px;background:rgba(0,0,0,.5);border-radius:50%;display:flex;align-items:center;justify-content:center}
#seekbar-row{display:${live ? "none" : "flex"};align-items:center;gap:6px;margin-bottom:6px}
#seekbar-row span{color:#fff;font:11px -apple-system,sans-serif;min-width:36px}
#seekbar-row span:last-child{text-align:right}
#seekbar{flex:1;height:4px;-webkit-appearance:none;appearance:none;background:rgba(255,255,255,.3);border-radius:2px;outline:none}
#seekbar::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:#fff;border-radius:50%;cursor:pointer}
</style>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>
</head><body>
<div id="container">
  <div id="loading"><div style="display:flex;flex-direction:column;align-items:center"><div class="spinner"></div><span>Carregando...</span></div></div>
  <div id="error"><p id="error-msg"></p><button onclick="initHls()">Tentar novamente</button></div>
  <video id="video" playsinline></video>
  <div id="big-play"><div><svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div></div>
  <div id="controls">
    <div id="seekbar-row"><span id="time-current">0:00</span><input type="range" id="seekbar" min="0" max="100" step="0.1" value="0" oninput="onSeek(this.value)"><span id="time-duration">0:00</span></div>
    <div id="controls-row">
      <div class="left">
        <button class="ctrl" id="play-btn" onclick="togglePlay()"><svg id="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
        <button class="ctrl" id="mute-btn" onclick="toggleMute()"><svg id="mute-icon" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button>
        ${live ? `<button id="live-badge" onclick="seekToLive()"><span class="dot"></span>AO VIVO</button>` : ``}
      </div>
      <div class="right">
        <div style="position:relative">
          <button id="quality-btn" onclick="event.stopPropagation();toggleQualityMenu()">Auto</button>
          <div id="quality-menu"></div>
        </div>
        <button class="ctrl" onclick="toggleFullscreen()"><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg></button>
      </div>
    </div>
  </div>
</div>
<script>
var video=document.getElementById('video'),hls=null,hideTimer=null,qualities=[];
var currentQuality=-1,qualityMenuOpen=false;

function initHls(){
  document.getElementById('loading').style.display='flex';
  document.getElementById('error').style.display='none';
  if(hls){hls.destroy();hls=null}
  if(!Hls.isSupported()){
    video.src='${url}';
    video.addEventListener('loadedmetadata',function(){
      document.getElementById('loading').style.display='none';
      ${autoPlay ? "video.play().catch(function(){video.muted=true;video.play().catch(function(){})})" : ""}
    });
    return;
  }
  hls=new Hls(${live ? `{enableWorker:true,lowLatencyMode:true,liveSyncDurationCount:3,liveMaxLatencyDurationCount:5,liveDurationInfinity:true,maxBufferLength:10,maxMaxBufferLength:20,maxBufferHole:.5,backBufferLength:0,startFragPrefetch:true,manifestLoadingMaxRetry:6,manifestLoadingRetryDelay:500,levelLoadingMaxRetry:6,levelLoadingRetryDelay:500,fragLoadingMaxRetry:6,fragLoadingRetryDelay:500}` : `{enableWorker:true,maxBufferLength:30,maxMaxBufferLength:60,startFragPrefetch:true,manifestLoadingMaxRetry:5,levelLoadingMaxRetry:5,fragLoadingMaxRetry:5}`});
  hls.loadSource('${url}');
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED,function(){
    document.getElementById('loading').style.display='none';
    qualities=hls.levels.map(function(l,i){return{h:l.height,i:i}}).filter(function(l){return l.h>0});
    var seen={};qualities=qualities.filter(function(l){if(seen[l.h])return false;seen[l.h]=true;return true});
    qualities.sort(function(a,b){return b.h-a.h});
    currentQuality=-1;
    buildQualityMenu();
    ${autoPlay ? "video.play().catch(function(){video.muted=true;updateMuteIcon();video.play().catch(function(){})})" : ""}
  });
  hls.on(Hls.Events.ERROR,function(_,data){
    if(data.fatal){
      if(data.type===Hls.ErrorTypes.NETWORK_ERROR){setTimeout(function(){if(hls)hls.startLoad()},2000)}
      else if(data.type===Hls.ErrorTypes.MEDIA_ERROR){hls.recoverMediaError()}
      else{document.getElementById('loading').style.display='none';document.getElementById('error-msg').textContent='Erro ao carregar a transmissao.';document.getElementById('error').style.display='flex';hls.destroy();hls=null}
    }
  });
}

function seekToLive(){
  if(hls&&hls.liveSyncPosition){video.currentTime=hls.liveSyncPosition}
  else if(video.buffered.length>0){video.currentTime=video.buffered.end(video.buffered.length-1)}
  if(video.paused)video.play().catch(function(){});
}

function togglePlay(){
  if(video.paused){${live ? "seekToLive();" : ""}video.play().catch(function(){video.muted=true;updateMuteIcon();video.play().catch(function(){})})}
  else{video.pause()}
}

function formatTime(sec){
  var h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60);
  if(h>0)return h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  return m+':'+String(s).padStart(2,'0');
}

function onSeek(val){video.currentTime=parseFloat(val)}

function skip(delta){video.currentTime=Math.max(0,Math.min(video.currentTime+delta,video.duration||0))}

if(${!live}){document.getElementById('seekbar-row').style.display='flex'}
video.addEventListener('timeupdate',function(){
  if(${!live}&&isFinite(video.duration)){
    document.getElementById('time-current').textContent=formatTime(video.currentTime);
    document.getElementById('time-duration').textContent=formatTime(video.duration);
    document.getElementById('seekbar').max=video.duration;
    document.getElementById('seekbar').value=video.currentTime;
  }
});

function toggleMute(){video.muted=!video.muted;updateMuteIcon()}
function toggleFullscreen(){
  var el=document.getElementById('container');
  if(document.fullscreenElement){document.exitFullscreen()}
  else if(el.requestFullscreen){el.requestFullscreen()}
  else if(el.webkitRequestFullscreen){el.webkitRequestFullscreen()}
  else if(video.webkitEnterFullscreen){video.webkitEnterFullscreen()}
}
function updateMuteIcon(){
  document.getElementById('mute-icon').innerHTML=video.muted
    ?'<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
    :'<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
}

function updatePlayIcon(){
  document.getElementById('play-icon').innerHTML=video.paused
    ?'<path d="M8 5v14l11-7z"/>'
    :'<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  document.getElementById('big-play').style.display=video.paused?'flex':'none';
}

video.addEventListener('play',updatePlayIcon);
video.addEventListener('pause',updatePlayIcon);

function resetHideTimer(){
  document.getElementById('controls').classList.remove('hidden');
  clearTimeout(hideTimer);
  hideTimer=setTimeout(function(){if(!video.paused&&!qualityMenuOpen)document.getElementById('controls').classList.add('hidden')},3000);
}

var lastTap={time:0,x:0};
document.getElementById('container').addEventListener('touchstart',function(e){
  if(e.target.closest('#controls'))return;
  var now=Date.now();
  var touch=e.touches[0];
  var rect=e.currentTarget.getBoundingClientRect();
  var x=touch.clientX-rect.left;
  var isDouble=now-lastTap.time<300&&Math.abs(x-lastTap.x)<50;
  if(isDouble&&${!live}){
    e.preventDefault();
    var side=x<rect.width/2?'left':'right';
    if(side==='left'){video.currentTime=Math.max(video.currentTime-5,0)}
    else{video.currentTime=Math.min(video.currentTime+5,video.duration||0)}
    lastTap={time:0,x:0};
    resetHideTimer();
    return;
  }
  lastTap={time:now,x:x};
  setTimeout(function(){
    if(Date.now()-lastTap.time>=280){
      var ctrl=document.getElementById('controls');
      if(ctrl.classList.contains('hidden')){resetHideTimer()}
      else{togglePlay();resetHideTimer()}
    }
  },300);
});

function buildQualityMenu(){
  var menu=document.getElementById('quality-menu');
  var btn=document.getElementById('quality-btn');
  if(qualities.length<=1){btn.style.display='none';return}
  btn.style.display='';
  var html='<button onclick="setQuality(-1)" class="'+(currentQuality===-1?'active':'')+'">Auto</button>';
  qualities.forEach(function(q){html+='<button onclick="setQuality('+q.i+')" class="'+(currentQuality===q.i?'active':'')+'">'+q.h+'p</button>'});
  menu.innerHTML=html;
}

function setQuality(idx){
  if(!hls)return;
  hls.currentLevel=idx;
  currentQuality=idx;
  document.getElementById('quality-btn').textContent=idx===-1?'Auto':qualities.find(function(q){return q.i===idx}).h+'p';
  buildQualityMenu();
  toggleQualityMenu();
}

function toggleQualityMenu(){
  var menu=document.getElementById('quality-menu');
  qualityMenuOpen=menu.style.display!=='block';
  menu.style.display=qualityMenuOpen?'block':'none';
  if(qualityMenuOpen)resetHideTimer();
}

document.addEventListener('click',function(e){if(!e.target.closest('#quality-menu')&&!e.target.closest('#quality-btn')){document.getElementById('quality-menu').style.display='none';qualityMenuOpen=false}});

initHls();
</script>
</body></html>`;
}

export default function HlsPlayer({ url, autoPlay = true, live = true }: HlsPlayerProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = React.useState(true);

  const html = React.useMemo(() => buildPlayerHtml(url, autoPlay, live), [url, autoPlay, live]);

  const onLoadEnd = useCallback(() => setLoading(false), []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onLoadEnd={onLoadEnd}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        setSupportMultipleWindows={false}
        overScrollMode="never"
        scrollEnabled={false}
        bounces={false}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    zIndex: 10,
  },
});
