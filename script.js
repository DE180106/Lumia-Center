/* Lumia Hub - WP8-ish (no libs)
   - Tabs + Search + Card/List + Dark mode
   - Story reader + AI story (Gemini) + AI TTS (Gemini)
*/

/* =========================
   IMPORTANT (API KEY)
   =========================
   Nếu bạn dán key vào đây và deploy GitHub Pages => key sẽ lộ.
*/
var GEMINI_API_KEY = "AIzaSyAefx6asVgNSEBN2YK06ZqbKoiJuEfWitw"; // <<< DÁN KEY Ở ĐÂY (nếu muốn)

/* Models (REST) */
var MODEL_TEXT = "gemini-2.5-flash";
var MODEL_TTS  = "gemini-2.5-flash-preview-tts";

/* DOM */
var body = document.body;

var toggleThemeBtn = document.getElementById("toggleTheme");
var openSettingsBtn = document.getElementById("openSettings");

var searchInput = document.getElementById("searchInput");
var clearSearchBtn = document.getElementById("clearSearch_toggle") || document.getElementById("clearSearch");

var tabs = document.querySelectorAll(".tab");
var toggleViewBtn = document.getElementById("toggleView");
var viewLabel = document.getElementById("viewLabel");

var itemsRoot = document.getElementById("itemsRoot");
var emptyState = document.getElementById("emptyState");
var resultHint = document.getElementById("resultHint");
var statusText = document.getElementById("statusText");

/* Story Overlay */
var storyOverlay = document.getElementById("storyOverlay");
var storyClose = document.getElementById("storyClose");
var storySave = document.getElementById("storySave");

var storyTile = document.getElementById("storyTile");
var storyTitleEl = document.getElementById("storyTitle");
var storyMetaEl = document.getElementById("storyMeta");
var storyBadgesEl = document.getElementById("storyBadges");
var storyTextEl = document.getElementById("storyText");

var modeReadBtn = document.getElementById("modeRead");
var modeAIBtn = document.getElementById("modeAI");
var modeVoiceBtn = document.getElementById("modeVoice");

var panelRead = document.getElementById("panelRead");
var panelAI = document.getElementById("panelAI");
var panelVoice = document.getElementById("panelVoice");

var fontSizeSel = document.getElementById("fontSize");
var lineHeightSel = document.getElementById("lineHeight");

/* AI Story */
var aiTopic = document.getElementById("aiTopic");
var aiGenre = document.getElementById("aiGenre");
var aiLenPreset = document.getElementById("aiLenPreset");
var aiLenCustomWrap = document.getElementById("aiLenCustomWrap");
var aiLenWords = document.getElementById("aiLenWords");
var aiStyle = document.getElementById("aiStyle");
var aiGenerate = document.getElementById("aiGenerate");
var aiUseToRead = document.getElementById("aiUseToRead");
var aiStatus = document.getElementById("aiStatus");

/* TTS */
var ttsVoice = document.getElementById("ttsVoice");
var ttsLimit = document.getElementById("ttsLimit");
var ttsSpeak = document.getElementById("ttsSpeak");
var ttsStop = document.getElementById("ttsStop");
var ttsPlayer = document.getElementById("ttsPlayer");
var ttsStatus = document.getElementById("ttsStatus");

/* Settings Overlay */
var settingsOverlay = document.getElementById("settingsOverlay");
var settingsClose = document.getElementById("settingsClose");
var apiKeyInput = document.getElementById("apiKeyInput");
var saveApiKey = document.getElementById("saveApiKey");
var clearApiKey = document.getElementById("clearApiKey");
var settingsStatus = document.getElementById("settingsStatus");

var LS = {
  theme: "lumia_theme",
  view: "lumia_view",
  tab: "lumia_tab",
  stories: "lumia_stories",
  apiKey: "lumia_gemini_api_key"
};

var state = {
  tab: "game",
  view: "card",
  query: "",
  storyOpen: null,   // current story item
  storyIsGenerated: false
};

/* =========================
   DATA
   ========================= */
var GAMES = [
  {
    id: "mini-chess",
    title: "Mini Chess",
    sub: "Cờ vua mini • offline",
    tags: ["board", "logic"],
    tile: "♟",
    url: "games/mini-chess/index.html"
  },
  {
    id: "sky-jump",
    title: "Sky Jump",
    sub: "Nhảy là né • arcade",
    tags: ["jump", "arcade"],
    tile: "☁",
    url: "games/sky-jump/index.html"
  },
  {
    id: "zombie-rush",
    title: "Zombie Rush",
    sub: "Chạy và bắn • action",
    tags: ["zombie", "rush"],
    tile: "Z",
    url: "games/zombie-rush/index.html"
  }
];

var MUSIC = [
  {
    id: "music-1",
    title: "Lumia Playlist",
    sub: "Danh sách nhạc demo (placeholder)",
    tags: ["music"],
    tile: "♪",
    url: "#"
  },
  {
    id: "music-2",
    title: "Chill Mix",
    sub: "Lo-fi • study",
    tags: ["chill", "lofi"],
    tile: "♫",
    url: "#"
  }
];

var BUILTIN_STORIES = [
  {
    id: "s1",
    title: "Cậu bé và chiếc đèn pin",
    sub: "Truyện ngắn • 3 phút",
    tags: ["cổ tích", "bài học"],
    tile: "S",
    kind: "story",
    content:
      "Cậu bé Nam có một chiếc đèn pin cũ.\n\n" +
      "Một tối mất điện, Nam soi đèn giúp bà tìm thuốc, giúp em làm bài, rồi chạy ra cổng soi đường cho chú shipper.\n\n" +
      "Đèn pin yếu dần, nhưng ai cũng cười. Nam hiểu: ánh sáng quý nhất là ánh sáng mình đem tới cho người khác.\n\n" +
      "Từ hôm đó, Nam luôn mang theo chiếc đèn pin—và một trái tim ấm."
  },
  {
    id: "s2",
    title: "Mèo con đi lạc",
    sub: "Truyện ngắn • 4 phút",
    tags: ["phiêu lưu", "ấm áp"],
    tile: "🐾",
    kind: "story",
    content:
      "Mèo con Mít lạc khỏi nhà giữa phố đông.\n\n" +
      "Mít hỏi chim sẻ, hỏi chú chó canh cửa, rồi theo mùi bánh mì nóng dẫn tới một cô bán hàng.\n\n" +
      "Cô đưa Mít lên vai, đi quanh khu phố, hỏi từng nhà.\n\n" +
      "Cuối cùng, Mít thấy chiếc khăn đỏ của bé chủ. Mít kêu “meo!” thật to. Ai cũng thở phào.\n\n" +
      "Đi lạc đôi khi đáng sợ, nhưng lòng tốt thì luôn tìm thấy đường."
  }
];

/* =========================
   UTIL
   ========================= */
function $(id){ return document.getElementById(id); }

function safeText(s){
  return (s == null) ? "" : String(s);
}

function normalize(s){
  s = safeText(s).toLowerCase();
  // remove Vietnamese accents basic
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  s = s.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  s = s.replace(/đ/g, "d");
  return s;
}

function lsGet(key, fallback){
  try{
    var v = localStorage.getItem(key);
    if(v == null) return fallback;
    return v;
  }catch(e){
    return fallback;
  }
}

function lsSet(key, value){
  try{ localStorage.setItem(key, value); }catch(e){}
}

function lsJsonGet(key, fallback){
  try{
    var v = localStorage.getItem(key);
    if(!v) return fallback;
    return JSON.parse(v);
  }catch(e){
    return fallback;
  }
}

function lsJsonSet(key, obj){
  try{ localStorage.setItem(key, JSON.stringify(obj)); }catch(e){}
}

function getApiKey(){
  if(GEMINI_API_KEY && GEMINI_API_KEY.length > 10) return GEMINI_API_KEY;
  var k = lsGet(LS.apiKey, "");
  return k || "";
}

function setStatus(el, msg){
  if(!el) return;
  el.innerHTML = safeText(msg);
}

function show(el){ if(el) el.style.display = ""; }
function hide(el){ if(el) el.style.display = "none"; }

function setOverlayVisible(overlayEl, visible){
  if(!overlayEl) return;
  if(visible){
    overlayEl.className = overlayEl.className.indexOf("show") >= 0 ? overlayEl.className : (overlayEl.className + " show");
    overlayEl.setAttribute("aria-hidden","false");
  }else{
    overlayEl.className = overlayEl.className.replace(/\bshow\b/g, "").replace(/\s{2,}/g," ").replace(/^\s+|\s+$/g,"");
    overlayEl.setAttribute("aria-hidden","true");
  }
}

/* =========================
   STORY STORAGE
   ========================= */
function loadSavedStories(){
  var arr = lsJsonGet(LS.stories, []);
  if(!arr || !arr.length) return [];
  // Normalize
  var out = [];
  for(var i=0;i<arr.length;i++){
    var it = arr[i];
    if(it && it.id && it.title && it.content){
      out.push(it);
    }
  }
  return out;
}

function saveStoryItem(item){
  var arr = loadSavedStories();
  // upsert by id
  var found = false;
  for(var i=0;i<arr.length;i++){
    if(arr[i].id === item.id){ arr[i] = item; found = true; break; }
  }
  if(!found) arr.unshift(item);
  // cap
  if(arr.length > 20) arr.length = 20;
  lsJsonSet(LS.stories, arr);
}

function makeStoryList(){
  var saved = loadSavedStories();

  var list = [];
  list.push({
    id: "ai-story",
    title: "✨ AI Kể truyện",
    sub: "Tạo truyện mới bằng Gemini",
    tags: ["AI", "new"],
    tile: "✨",
    kind: "ai"
  });

  for(var i=0;i<saved.length;i++){
    list.push(saved[i]);
  }
  for(var j=0;j<BUILTIN_STORIES.length;j++){
    list.push(BUILTIN_STORIES[j]);
  }
  return list;
}

/* =========================
   RENDER
   ========================= */
function setTab(tab){
  state.tab = tab;
  lsSet(LS.tab, tab);
  for(var i=0;i<tabs.length;i++){
    var t = tabs[i];
    var tTab = t.getAttribute("data-tab");
    if(tTab === tab){
      t.className = "tab active";
      t.setAttribute("aria-selected","true");
    }else{
      t.className = "tab";
      t.setAttribute("aria-selected","false");
    }
  }
  render();
}

function setView(view){
  state.view = view;
  lsSet(LS.view, view);
  itemsRoot.className = "grid " + (view === "list" ? "view-list" : "view-card");
  viewLabel.innerHTML = (view === "list") ? "List" : "Card";
  render();
}

function getItemsForTab(tab){
  if(tab === "game") return GAMES;
  if(tab === "music") return MUSIC;
  if(tab === "story") return makeStoryList();
  return [];
}

function matchesQuery(item, q){
  if(!q) return true;
  var hay = normalize(item.title + " " + (item.sub||"") + " " + (item.tags||[]).join(" "));
  return hay.indexOf(q) >= 0;
}

function render(){
  var q = normalize(state.query);
  var data = getItemsForTab(state.tab);

  // filter
  var filtered = [];
  for(var i=0;i<data.length;i++){
    if(matchesQuery(data[i], q)) filtered.push(data[i]);
  }

  // hint + status
  resultHint.innerHTML = q ? ("Kết quả cho: <b>" + safeText(state.query) + "</b>") : "Gõ để tìm kiếm trong tab hiện tại.";
  statusText.innerHTML = cap(state.tab) + " • " + filtered.length + " kết quả";

  // empty
  if(filtered.length === 0){
    hide(itemsRoot);
    show(emptyState);
    return;
  }
  show(itemsRoot);
  hide(emptyState);

  // render items
  itemsRoot.innerHTML = "";
  for(var k=0;k<filtered.length;k++){
    itemsRoot.appendChild(renderItem(filtered[k]));
  }
}

function cap(s){
  s = safeText(s);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderItem(item){
  var el = document.createElement("div");
  el.className = "item";
  el.setAttribute("data-id", item.id);

  var tile = document.createElement("div");
  tile.className = "tile";
  tile.innerHTML = safeText(item.tile || item.title.charAt(0).toUpperCase());

  var text = document.createElement("div");
  text.className = "item-text";

  var title = document.createElement("div");
  title.className = "item-title";
  title.innerHTML = safeText(item.title);

  var sub = document.createElement("div");
  sub.className = "item-sub";
  sub.innerHTML = safeText(item.sub || "");

  var tags = document.createElement("div");
  tags.className = "item-tags";
  var tagArr = item.tags || [];
  for(var i=0;i<tagArr.length;i++){
    var b = document.createElement("span");
    b.className = "badge";
    b.innerHTML = safeText(tagArr[i]);
    tags.appendChild(b);
  }

  text.appendChild(title);
  text.appendChild(sub);
  if(tagArr.length) text.appendChild(tags);

  var right = document.createElement("div");
  right.className = "item-right";
  right.innerHTML = "›";

  el.appendChild(tile);
  el.appendChild(text);
  el.appendChild(right);

  el.onclick = function(){
    onItemClick(item);
  };
  return el;
}

function onItemClick(item){
  if(state.tab === "game"){
    if(item.url && item.url !== "#") window.location.href = item.url;
    return;
  }
  if(state.tab === "music"){
    // placeholder: you can link to a music page later
    alert("Music item: " + item.title + "\nBạn có thể gắn link sau nhé.");
    return;
  }
  if(state.tab === "story"){
    if(item.kind === "ai"){
      openStoryOverlay(null, true); // open AI mode
    }else{
      openStoryOverlay(item, false);
    }
  }
}

/* =========================
   STORY OVERLAY
   ========================= */
function setStoryMode(mode){
  // mode: read|ai|voice
  modeReadBtn.className = "mini-tab" + (mode === "read" ? " active" : "");
  modeAIBtn.className = "mini-tab" + (mode === "ai" ? " active" : "");
  modeVoiceBtn.className = "mini-tab" + (mode === "voice" ? " active" : "");

  panelRead.style.display = (mode === "read") ? "" : "none";
  panelAI.style.display = (mode === "ai") ? "" : "none";
  panelVoice.style.display = (mode === "voice") ? "" : "none";

  storyMetaEl.innerHTML = "Story • " + (mode === "ai" ? "AI" : (mode === "voice" ? "AI Đọc" : "Reader"));
}

function openStoryOverlay(item, openAI){
  state.storyOpen = item;
  state.storyIsGenerated = false;

  // reset save button
  storySave.style.display = "none";

  // badges
  storyBadgesEl.innerHTML = "";

  if(openAI){
    storyTile.innerHTML = "✨";
    storyTitleEl.innerHTML = "AI Kể truyện";
    storyTextEl.innerHTML = "Tạo truyện trong tab AI Kể, rồi bấm 'Đưa sang tab Đọc'.";
    setOverlayVisible(storyOverlay, true);
    setStoryMode("ai");
    setStatus(aiStatus, "");
    return;
  }

  // normal story
  storyTile.innerHTML = safeText(item.tile || "S");
  storyTitleEl.innerHTML = safeText(item.title);
  storyTextEl.innerHTML = safeText(item.content || "");

  // badges
  var tags = item.tags || [];
  for(var i=0;i<tags.length;i++){
    var b = document.createElement("span");
    b.className = "badge";
    b.innerHTML = safeText(tags[i]);
    storyBadgesEl.appendChild(b);
  }

  setOverlayVisible(storyOverlay, true);
  setStoryMode("read");

  // apply display settings
  applyReaderStyle();
}

function closeStoryOverlay(){
  setOverlayVisible(storyOverlay, false);
  // stop audio
  try{ ttsPlayer.pause(); }catch(e){}
  try{ ttsPlayer.src = ""; }catch(e){}
  setStatus(ttsStatus, "");
}

function applyReaderStyle(){
  var fs = parseInt(fontSizeSel.value, 10) || 18;
  var lh = parseFloat(lineHeightSel.value) || 1.5;
  storyTextEl.style.fontSize = fs + "px";
  storyTextEl.style.lineHeight = String(lh);
}

/* =========================
   GEMINI CLIENT (REST)
   ========================= */
function xhrPost(url, bodyText, onOk, onErr){
  try{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    // Keep as text/plain to reduce preflight issues in browsers
    try{ xhr.setRequestHeader("Content-Type", "text/plain; charset=utf-8"); }catch(e){}
    xhr.onreadystatechange = function(){
      if(xhr.readyState !== 4) return;
      if(xhr.status >= 200 && xhr.status < 300){
        onOk(xhr.responseText);
      }else{
        onErr("HTTP " + xhr.status + ": " + (xhr.responseText || ""));
      }
    };
    xhr.onerror = function(){
      onErr("Network error");
    };
    xhr.send(bodyText);
  }catch(e){
    onErr("XHR error: " + e.message);
  }
}

function geminiGenerateContent(model, reqObj, onOk, onErr){
  var key = getApiKey();
  if(!key){
    onErr("Chưa có API key. Vào ⚙ Cài đặt hoặc dán vào GEMINI_API_KEY trong script.js.");
    return;
  }

  // Use query param for best compatibility (old browsers).
  // Docs recommend x-goog-api-key header in general. (See Gemini API reference)
  var url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);

  var bodyText;
  try{
    bodyText = JSON.stringify(reqObj);
  }catch(e){
    onErr("JSON error");
    return;
  }

  xhrPost(url, bodyText, function(raw){
    var data;
    try{
      data = JSON.parse(raw);
    }catch(e){
      onErr("Parse response failed");
      return;
    }
    onOk(data);
  }, onErr);
}

function pickText(resp){
  try{
    var parts = resp.candidates[0].content.parts;
    var out = "";
    for(var i=0;i<parts.length;i++){
      if(parts[i].text) out += parts[i].text;
    }
    return out;
  }catch(e){
    return "";
  }
}

/* WAV helper (PCM 16-bit little-endian @ 24000Hz mono) */
function base64ToUint8Array(base64){
  var binary = atob(base64);
  var len = binary.length;
  var bytes = new Uint8Array(len);
  for(var i=0;i<len;i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function writeString(view, offset, str){
  for(var i=0;i<str.length;i++){
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function pcmToWavBlob(pcmBytes, sampleRate){
  sampleRate = sampleRate || 24000;
  var numChannels = 1;
  var bitsPerSample = 16;
  var blockAlign = numChannels * (bitsPerSample / 8);
  var byteRate = sampleRate * blockAlign;

  var dataSize = pcmBytes.length;
  var buffer = new ArrayBuffer(44 + dataSize);
  var view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  var outBytes = new Uint8Array(buffer);
  outBytes.set(pcmBytes, 44);

  return new Blob([outBytes], { type: "audio/wav" });
}

function ttsFromText(text, voiceName, onOk, onErr){
  var prompt = safeText(text);
  if(!prompt){
    onErr("Không có nội dung để đọc.");
    return;
  }

  var req = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName || "Kore" }
        }
      }
    },
    model: MODEL_TTS
  };

  geminiGenerateContent(MODEL_TTS, req, function(resp){
    try{
      var part = resp.candidates[0].content.parts[0];
      var b64 = part.inlineData.data;
      var pcm = base64ToUint8Array(b64);
      var wavBlob = pcmToWavBlob(pcm, 24000);
      onOk(wavBlob);
    }catch(e){
      onErr("TTS parse failed");
    }
  }, onErr);
}

/* =========================
   EVENTS
   ========================= */
toggleThemeBtn.onclick = function(){
  var isDark = body.className.indexOf("dark") >= 0;
  if(isDark){
    body.className = body.className.replace(/\bdark\b/g,"").replace(/\s{2,}/g," ").replace(/^\s+|\s+$/g,"");
    lsSet(LS.theme, "light");
  }else{
    body.className = (body.className + " dark").replace(/\s{2,}/g," ").replace(/^\s+|\s+$/g,"");
    lsSet(LS.theme, "dark");
  }
};

openSettingsBtn.onclick = function(){
  setOverlayVisible(settingsOverlay, true);
  apiKeyInput.value = lsGet(LS.apiKey, "");
  setStatus(settingsStatus, "");
};

settingsClose.onclick = function(){
  setOverlayVisible(settingsOverlay, false);
};

saveApiKey.onclick = function(){
  var k = safeText(apiKeyInput.value).trim();
  if(k.length < 10){
    setStatus(settingsStatus, "Key có vẻ chưa đúng (quá ngắn).");
    return;
  }
  lsSet(LS.apiKey, k);
  setStatus(settingsStatus, "Đã lưu key vào máy (localStorage).");
};

clearApiKey.onclick = function(){
  lsSet(LS.apiKey, "");
  apiKeyInput.value = "";
  setStatus(settingsStatus, "Đã xoá key.");
};

for(var i=0;i<tabs.length;i++){
  (function(btn){
    btn.onclick = function(){
      setTab(btn.getAttribute("data-tab"));
    };
  })(tabs[i]);
}

toggleViewBtn.onclick = function(){
  setView(state.view === "card" ? "list" : "card");
};

searchInput.oninput = function(){
  state.query = searchInput.value || "";
  render();
};

if(clearSearchBtn){
  clearSearchBtn.onclick = function(){
    searchInput.value = "";
    state.query = "";
    render();
  };
}

storyClose.onclick = closeStoryOverlay;

modeReadBtn.onclick = function(){ setStoryMode("read"); };
modeAIBtn.onclick = function(){ setStoryMode("ai"); };
modeVoiceBtn.onclick = function(){ setStoryMode("voice"); };

fontSizeSel.onchange = applyReaderStyle;
lineHeightSel.onchange = applyReaderStyle;

aiLenPreset.onchange = function(){
  if(aiLenPreset.value === "custom") show(aiLenCustomWrap);
  else hide(aiLenCustomWrap);
};

aiGenerate.onclick = function(){
  var topic = safeText(aiTopic.value).trim() || "Một cuộc phiêu lưu nhỏ trong thành phố";
  var genre = safeText(aiGenre.value).trim() || "cổ tích";
  var style = safeText(aiStyle.value).trim();

  var targetWords = 0;
  if(aiLenPreset.value === "custom"){
    targetWords = parseInt(aiLenWords.value, 10) || 800;
  }else if(aiLenPreset.value === "short"){
    targetWords = 400;
  }else if(aiLenPreset.value === "medium"){
    targetWords = 900;
  }else{
    targetWords = 1600;
  }
  if(targetWords < 200) targetWords = 200;
  if(targetWords > 4000) targetWords = 4000;

  var maxTokens = targetWords <= 500 ? 1200 : (targetWords <= 1200 ? 2400 : 4096);

  var prompt =
    "Bạn là người kể chuyện. Hãy viết 1 truyện " + genre + " bằng tiếng Việt.\n" +
    "Chủ đề: " + topic + "\n" +
    (style ? ("Phong cách: " + style + "\n") : "") +
    "Yêu cầu:\n" +
    "- Độ dài khoảng " + targetWords + " từ.\n" +
    "- Dòng đầu là TIÊU ĐỀ.\n" +
    "- Chia đoạn ngắn, dễ đọc trên điện thoại.\n" +
    "- Tiếng Việt tự nhiên, kết thúc rõ ràng.\n";

  setStatus(aiStatus, "Đang tạo truyện...");
  aiGenerate.disabled = true;

  var req = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: maxTokens
    },
    model: MODEL_TEXT
  };

  geminiGenerateContent(MODEL_TEXT, req, function(resp){
    var out = pickText(resp);
    if(!out){
      setStatus(aiStatus, "Không nhận được nội dung (rỗng).");
      aiGenerate.disabled = false;
      return;
    }
    // keep in memory
    state.storyOpen = {
      id: "ai-" + String(+new Date()),
      title: extractTitle(out) || "Truyện AI",
      sub: "AI • " + targetWords + " từ",
      tags: ["AI", genre],
      tile: "✨",
      kind: "story",
      content: out,
      createdAt: +new Date()
    };
    state.storyIsGenerated = true;

    storySave.style.display = "";
    setStatus(aiStatus, "Xong! Bấm 'Đưa sang tab Đọc' để xem, hoặc Save để lưu.");
    aiGenerate.disabled = false;
  }, function(err){
    setStatus(aiStatus, "Lỗi: " + safeText(err));
    aiGenerate.disabled = false;
  });
};

aiUseToRead.onclick = function(){
  if(!state.storyOpen || !state.storyOpen.content){
    setStatus(aiStatus, "Chưa có truyện. Hãy bấm '✨ Tạo truyện' trước.");
    return;
  }
  // show as reader
  openStoryOverlay(state.storyOpen, false);
};

storySave.onclick = function(){
  if(!state.storyOpen || !state.storyOpen.content){
    alert("Chưa có truyện để lưu.");
    return;
  }
  saveStoryItem(state.storyOpen);
  // badge + refresh list later
  setStatus(aiStatus, "Đã lưu. Vào tab Story để thấy trong danh sách.");
  // mark not too spammy
  storySave.style.display = "none";
};

ttsSpeak.onclick = function(){
  var voice = safeText(ttsVoice.value).trim() || "Kore";
  var limit = parseInt(ttsLimit.value, 10) || 1400;

  var text = "";
  if(state.storyOpen && state.storyOpen.content){
    text = safeText(state.storyOpen.content);
  }else{
    text = safeText(storyTextEl.innerHTML);
  }
  if(!text){
    setStatus(ttsStatus, "Không có truyện để đọc.");
    return;
  }

  text = text.replace(/\s+/g, " ").slice(0, limit);

  setStatus(ttsStatus, "Đang tạo audio...");
  ttsSpeak.disabled = true;

  ttsFromText(text, voice, function(wavBlob){
    try{
      var url = (window.URL || window.webkitURL).createObjectURL(wavBlob);
      ttsPlayer.src = url;
      ttsPlayer.play();
      setStatus(ttsStatus, "OK. Nếu không nghe được, thử đổi giọng (Kore/Puck...) hoặc thử trình duyệt khác.");
    }catch(e){
      setStatus(ttsStatus, "Không play được audio.");
    }
    ttsSpeak.disabled = false;
  }, function(err){
    setStatus(ttsStatus, "Lỗi TTS: " + safeText(err));
    ttsSpeak.disabled = false;
  });
};

ttsStop.onclick = function(){
  try{ ttsPlayer.pause(); }catch(e){}
  try{ ttsPlayer.currentTime = 0; }catch(e){}
  setStatus(ttsStatus, "Đã dừng.");
};

function extractTitle(text){
  text = safeText(text).replace(/\r/g, "");
  var firstLine = text.split("\n")[0] || "";
  firstLine = firstLine.replace(/^\s+|\s+$/g,"");
  // remove markdown heading
  firstLine = firstLine.replace(/^#+\s*/, "");
  // if too long, cut
  if(firstLine.length > 60) firstLine = firstLine.slice(0, 60) + "...";
  return firstLine;
}

/* =========================
   INIT
   ========================= */
(function init(){
  // theme
  var th = lsGet(LS.theme, "light");
  if(th === "dark") body.className = (body.className + " dark").replace(/\s{2,}/g," ").replace(/^\s+|\s+$/g,"");

  // view
  var v = lsGet(LS.view, "card");
  setView(v === "list" ? "list" : "card");

  // tab
  var t = lsGet(LS.tab, "game");
  setTab(t);

  // AI custom length toggle
  if(aiLenPreset.value === "custom") show(aiLenCustomWrap); else hide(aiLenCustomWrap);
})();
