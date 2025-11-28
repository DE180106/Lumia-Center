/* ===== Lumia Hub + Story Reader (WP8 friendly) ===== */
(function () {
  // ---------- storage helpers ----------
  function safeGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // ---------- util ----------
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, "a")
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, "e")
      .replace(/í|ì|ỉ|ĩ|ị/g, "i")
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, "o")
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, "u")
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, "y")
      .replace(/đ/g, "d");
  }
  function tabLabel(tab) { return tab.charAt(0).toUpperCase() + tab.slice(1); }
  function tileLetter(title) { var t = (title || "").trim(); return t ? t.charAt(0).toUpperCase() : "?"; }
  function renderTile(tab, title) {
    return '<div class="tile ' + tab + '">' + escapeHtml(tileLetter(title)) + "</div>";
  }

  function filterItems(items, query, tab) {
    if (!query) return items;
    var q = normalize(query);
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var hay = it.title + " " + (it.badge || "") + " " + (it.meta || "") + " " + (it.desc || "");
      // search inside story content too
      if (tab === "story" && it.content) hay += " " + it.content;
      if (normalize(hay).indexOf(q) !== -1) out.push(it);
    }
    return out;
  }

  function readTabFromHash() {
    var h = (location.hash || "");
    if (h.indexOf("#tab=") === 0) return h.substring("#tab=".length);
    return null;
  }
  function setHashTab(tab) { location.hash = "#tab=" + encodeURIComponent(tab); }

  // ===================== DATA =====================
  var DATA = {
    game: [
      { id: "game-1", title: "Zombie Rush", badge: "Offline", meta: "Arcade • nhẹ", desc: "Chạy vô tận, nhảy né chướng ngại.", url: "games/zombie-rush/index.html" },
      { id: "game-2", title: "Mini Chess (Knight Jump)", badge: "Puzzle", meta: "Board • nhẹ", desc: "Nhảy theo luật Knight (2+1).", url: "games/mini-chess/index.html" },
      { id: "game-3", title: "Sky Jump", badge: "Casual", meta: "Platform • nhẹ", desc: "Nhảy platform, đừng rơi xuống.", url: "games/sky-jump/index.html" },
      { id: "game-4", title: "Gold Run", badge: "Endless", meta: "3 lanes • coins", desc: "Đổi lane, nhảy, trượt, ăn coin.", url: "games/gold-run/index.html" },
      { id: "game-5", title: "Orbit Switch", badge: "Arcade", meta: "2 orbits • tap switch", desc: "Đổi inner/outer để né gate và ăn coin.", url: "games/orbit-switch/index.html" }
    ],
    music: [
      { id: "music-1", title: "Lo-fi Chill", badge: "Playlist", meta: "2h 15m", desc: "Lo-fi nhẹ cho học bài / ngủ." },
      { id: "music-2", title: "Piano Focus", badge: "Instrument", meta: "1h 05m", desc: "Piano tối giản, hợp tập trung." },
      { id: "music-3", title: "EDM Quick", badge: "Energy", meta: "45m", desc: "Nhạc nhanh, gọn." }
    ],
    story: [
      {
        id: "story-1",
        title: "Fox & Moon",
        badge: "Kids",
        meta: "6–8 phút",
        desc: "Cáo con và mặt trăng học cách biết ơn.",
        content:
          "Cáo con sống ở rìa rừng, nơi mỗi tối đều nhìn thấy mặt trăng treo lơ lửng như một chiếc đèn.\n\n" +
          "Một đêm, trời lạnh tới mức lá cây cũng co lại, cáo con ôm bụng kêu ục ục. Nó nhìn lên và than: “Trăng ơi, sao lúc nào cũng sáng vậy? Cậu không thấy lạnh à?”\n\n" +
          "Mặt trăng không trả lời, chỉ sáng thêm một chút. Cáo con bực mình, đá hòn đá kecil lăn lóc. Nhưng nó vẫn… cứ nhìn.\n\n" +
          "Rồi nó phát hiện điều lạ: con đường về nhà bỗng rõ ràng hơn, những bụi gai cũng hiện ra để nó tránh. Nó đi thẳng một mạch, không vấp nữa.\n\n" +
          "Tối hôm sau, cáo con mang theo một chiếc lá to, tự chế thành “mũ trăng”. Nó đội lên đầu, chạy khắp nơi khoe: “Tớ cũng có trăng của riêng mình!”\n\n" +
          "Nhưng chiếc lá che mắt nó. Nó suýt rơi xuống mương, suýt đâm vào cây. Nó kéo mũ xuống, thở hổn hển, rồi ngẩng lên nhìn trăng thật.\n\n" +
          "Đêm đó, nó không than nữa. Nó chỉ nói rất nhỏ: “Cảm ơn nhé.”\n\n" +
          "Gió thổi qua, lá cây xào xạc. Mặt trăng vẫn không nói, nhưng ánh sáng như mềm hơn. Và cáo con, lần đầu tiên, về nhà bằng một con đường đầy bình yên."
      },
      {
        id: "story-2",
        title: "The Last Tram",
        badge: "Chill",
        meta: "7–10 phút",
        desc: "Chuyến tàu muộn và một lời hứa nhỏ.",
        content:
          "Thành phố về đêm giống như một màn hình khóa: sáng vừa đủ để biết mình đang ở đâu, nhưng tối đủ để mọi thứ trở nên nhẹ.\n\n" +
          "Tôi đứng ở trạm chờ chuyến tàu điện cuối. Người ta hay nói: “Chuyến cuối là của những người chưa kịp.” Tôi cười thầm vì đúng thật.\n\n" +
          "Tàu tới, cửa mở ra như một cái thở dài. Trong toa chỉ có vài người: một cô bé ôm balo, một chú bảo vệ mệt mỏi, và một bà cụ cầm túi vải.\n\n" +
          "Bà cụ nhìn tôi, hỏi: “Cháu về đâu?”\n\n" +
          "Tôi đáp: “Cháu… về nhà ạ. Nhưng giờ nhà không còn giống nhà lắm.”\n\n" +
          "Bà cụ gật gù như thể đã nghe câu đó nhiều lần. Rồi bà đưa tôi một viên kẹo bạc hà. “Thử xem. Đêm sẽ bớt dài.”\n\n" +
          "Viên kẹo lạnh nơi đầu lưỡi. Tôi bỗng nhớ những thứ mình bỏ quên: bữa cơm hứa sẽ về đúng giờ, tin nhắn chưa trả lời, cuộc gọi bị bấm tắt.\n\n" +
          "Tàu đi qua những ô cửa sổ phản chiếu đèn đường. Mỗi ánh đèn như một câu hỏi: ‘Mình có thể làm lại không?’\n\n" +
          "Khi tàu dừng, bà cụ đứng lên. Trước khi xuống, bà quay lại: “Cháu về nhà không giống nhà, thì thử làm một việc nhỏ cho nó giống lại.”\n\n" +
          "Tôi cầm viên kẹo, rồi cầm điện thoại. Tôi nhắn: “Con về muộn. Nhưng con về.”\n\n" +
          "Ngoài kia, thành phố vẫn tối. Nhưng toa tàu bỗng ấm hơn một chút."
      },
      {
        id: "story-3",
        title: "Cà phê & Mưa",
        badge: "VN",
        meta: "5–7 phút",
        desc: "Một buổi tối mưa và ly cà phê nguội dần.",
        content:
          "Mưa đến như một bản nhạc nền quen thuộc của tháng mười. Quán cà phê bật đèn vàng. Tôi ngồi ở góc, nhìn những giọt nước chạy đua trên kính.\n\n" +
          "Ly cà phê đặt trước mặt. Anh bảo: “Người ta hay nói, cà phê nguội là vì mình mãi nghĩ chuyện xa.”\n\n" +
          "Tôi hỏi: “Thế còn chuyện gần?”\n\n" +
          "Anh cười: “Chuyện gần thì… mình hay quên mất.”\n\n" +
          "Chúng tôi im lặng. Im lặng không phải vì hết chuyện, mà vì có quá nhiều chuyện không biết bắt đầu từ đâu.\n\n" +
          "Mưa đập lên mái hiên. Tôi chợt nhớ những lời hứa: sẽ gọi, sẽ ghé, sẽ ‘khi nào rảnh’. Những lời hứa như ô dù ai đó bỏ quên.\n\n" +
          "Anh đẩy ly cà phê về phía tôi: “Uống đi. Nguội rồi thì thêm đường.”\n\n" +
          "Tôi khuấy nhẹ. Đường tan, mưa vẫn rơi, nhưng lòng bỗng đỡ nặng.\n\n" +
          "Tôi nói: “Mai mình… làm chuyện gần trước nhé.”\n\n" +
          "Anh gật: “Ừ. Mai.”\n\n" +
          "Ngoài cửa kính, một chiếc xe đi qua, để lại vệt nước dài. Tôi nhận ra: đôi khi, bắt đầu lại chỉ cần một câu ‘mai mình làm’ — và lần này, mình thật sự làm."
      }
    ]
  };

  // ===================== THEME =====================
  function applyTheme(isDark) { document.body.className = isDark ? "dark" : ""; }
  function initThemeToggle() {
    var savedDark = safeGet("lh_dark", "0");
    var dark = (savedDark === "1");
    applyTheme(dark);

    var btn = document.getElementById("toggleTheme");
    if (btn) {
      btn.onclick = function () {
        dark = !dark;
        safeSet("lh_dark", dark ? "1" : "0");
        applyTheme(dark);
      };
    }
  }
  initThemeToggle();

  // ===================== HUB =====================
  var itemsRoot = document.getElementById("itemsRoot");
  if (!itemsRoot) return;

  var tabs = document.querySelectorAll(".tab");
  var searchInput = document.getElementById("searchInput");
  var clearBtn = document.getElementById("clearSearch");
  var toggleViewBtn = document.getElementById("toggleView");
  var viewLabel = document.getElementById("viewLabel");
  var emptyState = document.getElementById("emptyState");
  var statusText = document.getElementById("statusText");
  var hint = document.getElementById("resultHint");

  var state = {
    tab: "game",
    query: "",
    view: "card"
  };

  // ---- Story Reader elements ----
  var readerOverlay = document.getElementById("readerOverlay");
  var readerClose = document.getElementById("readerClose");
  var readerTitle = document.getElementById("readerTitle");
  var readerMeta = document.getElementById("readerMeta");
  var readerTile = document.getElementById("readerTile");
  var readerBody = document.getElementById("readerBody");
  var readerContent = document.getElementById("readerContent");
  var readerProgress = document.getElementById("readerProgress");
  var prevStoryBtn = document.getElementById("prevStory");
  var nextStoryBtn = document.getElementById("nextStory");
  var fontMinus = document.getElementById("fontMinus");
  var fontPlus = document.getElementById("fontPlus");
  var autoScrollBtn = document.getElementById("autoScrollBtn");

  var reader = {
    open: false,
    storyId: null,
    storyIndex: 0,
    fontSize: parseInt(safeGet("lh_story_font", "16"), 10) || 16,
    auto: false,
    autoTimer: null
  };

  function applyView() {
    if (state.view === "list") {
      itemsRoot.className = "grid view-list";
      if (viewLabel) viewLabel.innerHTML = "List";
    } else {
      itemsRoot.className = "grid view-card";
      if (viewLabel) viewLabel.innerHTML = "Card";
    }
    safeSet("lh_view", state.view);
  }

  function setActiveTab(name) {
    state.tab = name;
    safeSet("lh_tab", name);

    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      var active = (t.getAttribute("data-tab") === name);
      t.className = active ? "tab active" : "tab";
      t.setAttribute("aria-selected", active ? "true" : "false");
    }
  }

  // init
  (function init() {
    var savedView = safeGet("lh_view", "card");
    var savedTab = safeGet("lh_tab", "game");

    state.view = (savedView === "list" ? "list" : "card");
    state.tab = (savedTab === "music" || savedTab === "story" || savedTab === "game") ? savedTab : "game";

    var tabHash = readTabFromHash();
    if (tabHash) {
      try { tabHash = decodeURIComponent(tabHash); } catch (e) {}
      if (tabHash === "game" || tabHash === "music" || tabHash === "story") state.tab = tabHash;
    }

    applyView();
    setActiveTab(state.tab);
    render();
  })();

  for (var i = 0; i < tabs.length; i++) {
    tabs[i].onclick = function () {
      var name = this.getAttribute("data-tab");
      setActiveTab(name);
      setHashTab(name);
      render();
    };
  }

  if (toggleViewBtn) {
    toggleViewBtn.onclick = function () {
      state.view = (state.view === "card") ? "list" : "card";
      applyView();
    };
  }

  function onSearchChange() {
    state.query = (searchInput && searchInput.value) ? searchInput.value : "";
    render();
  }

  if (searchInput) {
    searchInput.oninput = onSearchChange;
    searchInput.onkeyup = onSearchChange;
  }

  if (clearBtn) {
    clearBtn.onclick = function () {
      if (searchInput) searchInput.value = "";
      state.query = "";
      render();
      try { searchInput.focus(); } catch (e) {}
    };
  }

  // ===================== STORY READER =====================
  function setReaderFont() {
    reader.fontSize = Math.max(14, Math.min(22, reader.fontSize));
    safeSet("lh_story_font", String(reader.fontSize));
    if (readerContent) {
      readerContent.style.fontSize = reader.fontSize + "px";
    }
  }

  function storyById(id) {
    var arr = DATA.story;
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return { item: arr[i], index: i };
    return null;
  }

  function renderStoryContent(text) {
    // split by blank lines -> paragraphs
    var parts = String(text || "").split(/\n\s*\n/g);
    var html = "";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      if (!p) continue;
      html += "<p>" + escapeHtml(p) + "</p>";
    }
    return html || "<p>(Truyện trống)</p>";
  }

  function openReader(storyId) {
    var found = storyById(storyId);
    if (!found) return;

    reader.open = true;
    reader.storyId = storyId;
    reader.storyIndex = found.index;

    if (readerTitle) readerTitle.textContent = found.item.title;
    if (readerMeta) readerMeta.textContent = (found.item.badge || "") + " • " + (found.item.meta || "");
    if (readerTile) readerTile.textContent = tileLetter(found.item.title);
    if (readerContent) readerContent.innerHTML = renderStoryContent(found.item.content);

    setReaderFont();

    // show overlay
    if (readerOverlay) {
      readerOverlay.className = "overlay open";
      readerOverlay.setAttribute("aria-hidden", "false");
    }

    // restore scroll position
    var posKey = "lh_story_pos_" + storyId;
    var savedPos = parseInt(safeGet(posKey, "0"), 10) || 0;
    if (readerBody) {
      readerBody.scrollTop = 0;
      // small delay for layout (WP8 safe)
      setTimeout(function () {
        readerBody.scrollTop = savedPos;
        updateReaderProgress();
      }, 10);
    }

    // remember last story
    safeSet("lh_story_last", storyId);

    // stop auto on open (fresh)
    setAutoScroll(false);
  }

  function closeReader() {
    if (!reader.open) return;

    // save position
    if (readerBody && reader.storyId) {
      safeSet("lh_story_pos_" + reader.storyId, String(readerBody.scrollTop || 0));
    }

    setAutoScroll(false);
    reader.open = false;

    if (readerOverlay) {
      readerOverlay.className = "overlay";
      readerOverlay.setAttribute("aria-hidden", "true");
    }
  }

  function updateReaderProgress() {
    if (!readerBody || !readerProgress) return;
    var max = (readerBody.scrollHeight - readerBody.clientHeight);
    var pct = (max <= 0) ? 100 : Math.round((readerBody.scrollTop / max) * 100);
    pct = Math.max(0, Math.min(100, pct));
    readerProgress.textContent = pct + "%";
  }

  function openPrevNext(dir) {
    var list = DATA.story;
    if (!list.length) return;
    var idx = reader.storyIndex + dir;
    if (idx < 0) idx = 0;
    if (idx >= list.length) idx = list.length - 1;
    openReader(list[idx].id);
  }

  function setAutoScroll(on) {
    reader.auto = !!on;
    if (autoScrollBtn) autoScrollBtn.textContent = reader.auto ? "Auto ✓" : "Auto";

    if (reader.autoTimer) {
      clearInterval(reader.autoTimer);
      reader.autoTimer = null;
    }

    if (reader.auto && readerBody) {
      reader.autoTimer = setInterval(function () {
        if (!reader.open || !readerBody) return;
        // speed: ~18px/s (nhẹ cho WP8)
        readerBody.scrollTop += 1;
        updateReaderProgress();

        // stop when end reached
        var max = (readerBody.scrollHeight - readerBody.clientHeight);
        if (max > 0 && readerBody.scrollTop >= max) {
          setAutoScroll(false);
        }
      }, 55);
    }
  }

  if (readerClose) readerClose.onclick = closeReader;
  if (readerOverlay) {
    // tap outside to close
    readerOverlay.onclick = function (e) {
      e = e || window.event;
      var t = e.target || e.srcElement;
      if (t === readerOverlay) closeReader();
    };
  }
  if (readerBody) readerBody.onscroll = function () {
    updateReaderProgress();
    if (reader.storyId) safeSet("lh_story_pos_" + reader.storyId, String(readerBody.scrollTop || 0));
  };

  if (prevStoryBtn) prevStoryBtn.onclick = function () { openPrevNext(-1); };
  if (nextStoryBtn) nextStoryBtn.onclick = function () { openPrevNext(1); };
  if (fontMinus) fontMinus.onclick = function () { reader.fontSize -= 1; setReaderFont(); };
  if (fontPlus) fontPlus.onclick = function () { reader.fontSize += 1; setReaderFont(); };
  if (autoScrollBtn) autoScrollBtn.onclick = function () { setAutoScroll(!reader.auto); };

  document.addEventListener("keydown", function (e) {
    e = e || window.event;
    var code = e.keyCode || 0;
    if (!reader.open) return;

    // ESC
    if (code === 27) closeReader();
    // Left/Right: prev/next
    if (code === 37) openPrevNext(-1);
    if (code === 39) openPrevNext(1);
    // +/- font
    if (code === 187 || code === 107) { reader.fontSize += 1; setReaderFont(); } // +
    if (code === 189 || code === 109) { reader.fontSize -= 1; setReaderFont(); } // -
    // Space: auto
    if (code === 32) { if (e.preventDefault) e.preventDefault(); setAutoScroll(!reader.auto); }
  });

  // ===================== RENDER LIST =====================
  function render() {
    var items = DATA[state.tab] || [];
    var filtered = filterItems(items, state.query, state.tab);

    var tabName = tabLabel(state.tab);
    if (hint) {
      hint.innerHTML = state.query
        ? ("Đang lọc trong <b>" + tabName + "</b>…")
        : ("Gõ để tìm kiếm trong tab <b>" + tabName + "</b>.");
    }
    if (statusText) statusText.innerHTML = tabName + " • " + filtered.length + " kết quả";

    if (filtered.length === 0) {
      itemsRoot.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    } else {
      if (emptyState) emptyState.style.display = "none";
    }

    var html = "";
    for (var i = 0; i < filtered.length; i++) {
      var it = filtered[i];
      var dataUrl = (state.tab === "game" && it.url) ? (' data-url="' + escapeHtml(it.url) + '"') : "";
      html += (
        '<article class="item" data-id="' + escapeHtml(it.id) + '"' + dataUrl + ">" +
          '<div class="item-top">' +
            '<div class="item-left">' +
              '<div class="item-left-row">' +
                renderTile(state.tab, it.title) +
                '<div class="item-text">' +
                  '<h3 class="item-title">' + escapeHtml(it.title) + "</h3>" +
                  '<div class="item-meta">' + escapeHtml(it.meta || "") + "</div>" +
                "</div>" +
              "</div>" +
            "</div>" +
            '<div class="item-badge">' + escapeHtml(it.badge || "") + "</div>" +
          "</div>" +
          '<div class="item-desc">' + escapeHtml(it.desc || "") + "</div>" +
        "</article>"
      );
    }
    itemsRoot.innerHTML = html;

    itemsRoot.onclick = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;

      while (target && target !== itemsRoot && (!target.getAttribute || !target.getAttribute("data-id"))) {
        target = target.parentNode;
      }
      if (!target || target === itemsRoot) return;

      var id = target.getAttribute("data-id");

      // Game: open directly
      if (state.tab === "game") {
        var url = target.getAttribute("data-url");
        if (url) { location.href = url; return; }
      }

      // Story: open reader
      if (state.tab === "story") {
        openReader(id);
        return;
      }

      // Music: hiện tại chỉ thông báo
      try { alert("Music: chưa làm player. (Bạn có thể yêu cầu mình làm tiếp)"); } catch (err) {}
    };
  }

  // auto open last story if you want (optional)
  // var lastStory = safeGet("lh_story_last", "");
  // if (state.tab === "story" && lastStory) openReader(lastStory);

})();
