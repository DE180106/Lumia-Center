/* ===== Lumia Hub - vanilla JS, WP8-ish + Tile icons + Detail page ===== */
(function () {
  // ---------- Data (demo) ----------
  var DATA = {
    game: [
      {
        id: "game-1",
        title: "Zombie Rush",
        badge: "Offline",
        meta: "Arcade • 45MB",
        desc: "Chạy vô tận, né zombie, nhặt coin và nâng cấp tốc độ.",
        info: ["Chế độ: Offline", "Thể loại: Arcade", "Dung lượng: 45MB", "Đề xuất: Lumia 520 chạy mượt nếu tắt app nền"],
        actionText: "Install"
      },
      {
        id: "game-2",
        title: "Mini Chess",
        badge: "2P",
        meta: "Board • 12MB",
        desc: "Cờ vua mini, gọn nhẹ, chơi nhanh. Có chế độ 2 người.",
        info: ["Chế độ: 2 người / 1 người", "Thể loại: Board", "Dung lượng: 12MB"],
        actionText: "Open"
      },
      {
        id: "game-3",
        title: "Sky Jump",
        badge: "New",
        meta: "Casual • 18MB",
        desc: "Nhảy qua các nền, combo điểm, càng lên cao càng khó.",
        info: ["Thể loại: Casual", "Mẹo: chạm nhanh để giữ nhịp", "Dung lượng: 18MB"],
        actionText: "Open"
      }
    ],
    music: [
      {
        id: "music-1",
        title: "Lo-fi Chill",
        badge: "Playlist",
        meta: "2h 15m",
        desc: "Lo-fi nhẹ nhàng để học tập/đi ngủ. Beat êm, không quá dày.",
        info: ["Thời lượng: 2h 15m", "Mood: Chill", "Gợi ý: nghe tai nghe để bass đã hơn"],
        actionText: "Play"
      },
      {
        id: "music-2",
        title: "Piano Focus",
        badge: "Instrument",
        meta: "1h 05m",
        desc: "Piano tối giản, hợp làm nhạc nền tập trung.",
        info: ["Thời lượng: 1h 05m", "Thể loại: Piano", "Không lời: Có"],
        actionText: "Play"
      },
      {
        id: "music-3",
        title: "EDM Quick",
        badge: "Energy",
        meta: "45m",
        desc: "Nhạc nhanh, gọn, bật cái là muốn chạy deadline liền.",
        info: ["Thời lượng: 45m", "Mood: Energy", "Gợi ý: bật khi tập thể dục"],
        actionText: "Play"
      }
    ],
    story: [
      {
        id: "story-1",
        title: "Cổ tích: Cây khế",
        badge: "VN",
        meta: "8 phút",
        desc: "Câu chuyện quen thuộc về lòng tham và sự trả giá.",
        info: ["Thể loại: Cổ tích Việt Nam", "Thời lượng đọc: 8 phút", "Độ tuổi: 6+"],
        actionText: "Read"
      },
      {
        id: "story-2",
        title: "Truyện ngắn: Đêm mưa",
        badge: "Drama",
        meta: "12 phút",
        desc: "Một đêm mưa và một cuộc gặp thay đổi mọi thứ.",
        info: ["Thể loại: Truyện ngắn", "Mood: Drama", "Thời lượng đọc: 12 phút"],
        actionText: "Read"
      },
      {
        id: "story-3",
        title: "Bedtime: Fox & Moon",
        badge: "Kids",
        meta: "6 phút",
        desc: "Cáo con và mặt trăng học cách nói lời cảm ơn.",
        info: ["Thể loại: Bedtime", "Độ tuổi: 4+", "Thời lượng đọc: 6 phút"],
        actionText: "Read"
      }
    ]
  };

  // ---------- Utilities ----------
  function safeGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

  function tabLabel(tab) {
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  }

  function tileLetter(title) {
    var t = (title || "").trim();
    if (!t) return "?";
    return t.charAt(0).toUpperCase();
  }

  function renderTile(tab, title, sizeClass) {
    var cls = "tile " + tab + (sizeClass ? (" " + sizeClass) : "");
    return '<div class="' + cls + '">' + escapeHtml(tileLetter(title)) + "</div>";
  }

  function findItemById(idRaw) {
    if (!idRaw) return null;
    var raw = idRaw;
    try { raw = decodeURIComponent(idRaw); } catch (e) { raw = idRaw; }

    for (var k in DATA) {
      if (!DATA.hasOwnProperty(k)) continue;
      var arr = DATA[k];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === raw) return { tab: k, item: arr[i] };
      }
    }
    return null;
  }

  // query parser for old browsers (no URLSearchParams)
  function getQueryParam(name) {
    var q = (location.search || "");
    if (!q || q.length < 2) return null;
    q = q.substring(1); // remove '?'
    var parts = q.split("&");
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split("=");
      var k = kv[0] ? decodeURIComponent(kv[0]) : "";
      if (k === name) return kv[1] ? decodeURIComponent(kv[1]) : "";
    }
    return null;
  }

  // ---------- Theme (common for both pages) ----------
  function applyTheme(isDark) {
    document.body.className = isDark ? "dark" : "";
  }

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

  // ---------- Page detect ----------
  var itemsRoot = document.getElementById("itemsRoot");     // exists on index
  var detailPage = document.getElementById("detailPage");   // exists on detail.html

  initThemeToggle();

  // =========================================================
  // ===============  DETAIL PAGE (detail.html) ==============
  // =========================================================
  if (detailPage) {
    var id = getQueryParam("id");
    var tab = getQueryParam("tab"); // optional, for back
    var found = findItemById(id);

    var dpCard = document.getElementById("dpCard");
    var dpEmpty = document.getElementById("dpEmpty");

    var dpTile = document.getElementById("dpTile");
    var dpTitle = document.getElementById("dpTitle");
    var dpMeta = document.getElementById("dpMeta");
    var dpBadges = document.getElementById("dpBadges");
    var dpDesc = document.getElementById("dpDesc");
    var dpInfo = document.getElementById("dpInfo");
    var dpPrimaryBtn = document.getElementById("dpPrimaryBtn");
    var dpBack = document.getElementById("dpBack");
    var dpHeaderTitle = document.getElementById("dpHeaderTitle");
    var dpHeaderSub = document.getElementById("dpHeaderSub");
    var dpStatus = document.getElementById("dpStatus");

    // Back link: ưu tiên tab từ query, nếu không thì tab của item
    function buildBackHref(tabName) {
      // về đúng tab bằng hash
      if (tabName) return "index.html#tab=" + encodeURIComponent(tabName);
      return "index.html";
    }

    if (!found) {
      if (dpCard) dpCard.style.display = "none";
      if (dpEmpty) dpEmpty.style.display = "block";
      if (dpBack) dpBack.href = buildBackHref(tab);
      if (dpStatus) dpStatus.innerHTML = "Not found";
      if (dpHeaderTitle) dpHeaderTitle.innerHTML = "Not Found";
      if (dpHeaderSub) dpHeaderSub.innerHTML = "Lumia Hub";
      return;
    }

    var t = found.tab;
    var it = found.item;

    if (dpEmpty) dpEmpty.style.display = "none";
    if (dpCard) dpCard.style.display = "block";

    if (dpBack) dpBack.href = buildBackHref(tab || t);

    if (dpHeaderTitle) dpHeaderTitle.innerHTML = escapeHtml(tabLabel(t));
    if (dpHeaderSub) dpHeaderSub.innerHTML = escapeHtml(it.title);

    // Fill UI
    dpTile.className = "tile big " + t;
    dpTile.innerHTML = escapeHtml(tileLetter(it.title));

    dpTitle.innerHTML = escapeHtml(it.title);
    dpMeta.innerHTML = escapeHtml(it.meta);

    var badgesHtml = "";
    badgesHtml += '<span class="badge">' + escapeHtml(tabLabel(t)) + "</span>";
    if (it.badge) badgesHtml += '<span class="badge">' + escapeHtml(it.badge) + "</span>";
    dpBadges.innerHTML = badgesHtml;

    dpDesc.innerHTML = escapeHtml(it.desc || "");

    var info = it.info || [];
    var infoHtml = "";
    for (var ii = 0; ii < info.length; ii++) infoHtml += "<li>" + escapeHtml(info[ii]) + "</li>";
    dpInfo.innerHTML = infoHtml || "<li>(Không có thêm thông tin)</li>";

    var actionText = it.actionText || "Open";
    dpPrimaryBtn.innerHTML = escapeHtml(actionText);
    dpPrimaryBtn.onclick = function () {
      // bạn có thể thay bằng mở file mp3/story/game thật sau
      try { alert(actionText + ": " + it.title); } catch (e) {}
    };

    if (dpStatus) dpStatus.innerHTML = escapeHtml(it.id);
    document.title = it.title + " • Lumia Hub";
    return;
  }

  // =========================================================
  // ===================  INDEX PAGE (index) =================
  // =========================================================
  if (!itemsRoot) return;

  // ---------- State ----------
  var state = {
    tab: "game",
    query: "",
    view: "card",
    detailOpen: false,
    currentDetailId: null
  };

  // ---------- DOM ----------
  var tabs = document.querySelectorAll(".tab");
  var searchInput = document.getElementById("searchInput");
  var clearBtn = document.getElementById("clearSearch");
  var toggleViewBtn = document.getElementById("toggleView");
  var viewLabel = document.getElementById("viewLabel");
  var emptyState = document.getElementById("emptyState");
  var statusText = document.getElementById("statusText");
  var hint = document.getElementById("resultHint");

  // overlay
  var overlay = document.getElementById("detailOverlay");
  var detailClose = document.getElementById("detailClose");
  var detailTile = document.getElementById("detailTile");
  var detailTitle = document.getElementById("detailTitle");
  var detailMeta = document.getElementById("detailMeta");
  var detailBadges = document.getElementById("detailBadges");
  var detailDesc = document.getElementById("detailDesc");
  var detailInfo = document.getElementById("detailInfo");
  var detailAction = document.getElementById("detailAction");

  // ---------- Hash helpers ----------
  function readDetailIdFromHash() {
    var h = (location.hash || "");
    if (h.indexOf("#detail=") === 0) return h.substring("#detail=".length);
    return null;
  }
  function readTabFromHash() {
    var h = (location.hash || "");
    if (h.indexOf("#tab=") === 0) return h.substring("#tab=".length);
    return null;
  }
  function setHashDetail(id) {
    location.hash = "#detail=" + encodeURIComponent(id);
  }
  function setHashTab(tab) {
    location.hash = "#tab=" + encodeURIComponent(tab);
  }

  // ---------- Init from storage + optional hash(tab) ----------
  (function initIndex() {
    var savedView = safeGet("lh_view", "card");
    var savedTab = safeGet("lh_tab", "game");

    state.view = (savedView === "list" ? "list" : "card");
    state.tab = (savedTab === "music" || savedTab === "story" || savedTab === "game") ? savedTab : "game";

    // hash tab override
    var tabHash = readTabFromHash();
    if (tabHash) {
      try { tabHash = decodeURIComponent(tabHash); } catch (e) {}
      if (tabHash === "game" || tabHash === "music" || tabHash === "story") state.tab = tabHash;
    }

    applyView();
    setActiveTab(state.tab);
    render();

    // landing with #detail=...
    var idFromHash = readDetailIdFromHash();
    if (idFromHash) {
      var found = findItemById(idFromHash);
      if (found) openDetail(found, false);
    }
  })();

  // ---------- Tabs ----------
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
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].onclick = function () {
      var name = this.getAttribute("data-tab");
      setActiveTab(name);
      // update hash for linkable tab
      setHashTab(name);
      render();
    };
  }

  // ---------- View ----------
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
  if (toggleViewBtn) {
    toggleViewBtn.onclick = function () {
      state.view = (state.view === "card") ? "list" : "card";
      applyView();
    };
  }

  // ---------- Search ----------
  function onSearchChange() {
    state.query = searchInput.value || "";
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

  function filterItems(items, query) {
    if (!query) return items;
    var q = normalize(query);
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var hay = normalize(it.title + " " + it.badge + " " + it.meta + " " + it.desc);
      if (hay.indexOf(q) !== -1) out.push(it);
    }
    return out;
  }

  // ---------- Detail overlay open/close ----------
  function openDetail(found, pushHash) {
    var tab = found.tab;
    var it = found.item;

    if (state.tab !== tab) {
      setActiveTab(tab);
      render();
    }

    state.detailOpen = true;
    state.currentDetailId = it.id;

    detailTile.className = "tile big " + tab;
    detailTile.innerHTML = escapeHtml(tileLetter(it.title));
    detailTitle.innerHTML = escapeHtml(it.title);
    detailMeta.innerHTML = escapeHtml(it.meta);

    var badgesHtml = '';
    badgesHtml += '<span class="badge">' + escapeHtml(tabLabel(tab)) + "</span>";
    if (it.badge) badgesHtml += '<span class="badge">' + escapeHtml(it.badge) + "</span>";
    detailBadges.innerHTML = badgesHtml;

    detailDesc.innerHTML = escapeHtml(it.desc || "");

    var info = it.info || [];
    var infoHtml = "";
    for (var i = 0; i < info.length; i++) infoHtml += "<li>" + escapeHtml(info[i]) + "</li>";
    detailInfo.innerHTML = infoHtml || "<li>(Không có thêm thông tin)</li>";

    // ✅ OPEN -> detail.html thật
    var actionText = it.actionText || "Open";
    detailAction.innerHTML = escapeHtml(actionText);
    detailAction.onclick = function () {
      location.href = "detail.html?id=" + encodeURIComponent(it.id) + "&tab=" + encodeURIComponent(tab);
    };

    overlay.className = "overlay show";
    overlay.setAttribute("aria-hidden", "false");

    if (pushHash !== false) setHashDetail(it.id);
  }

  function closeDetail(fromPopState) {
    state.detailOpen = false;
    state.currentDetailId = null;

    overlay.className = "overlay";
    overlay.setAttribute("aria-hidden", "true");

    if (!fromPopState) {
      // go back to remove #detail
      if ((location.hash || "").indexOf("#detail=") === 0) {
        try { history.back(); } catch (e) { setHashTab(state.tab); }
      }
    }
  }

  if (detailClose) detailClose.onclick = function () { closeDetail(false); };
  if (overlay) {
    overlay.onclick = function (e) {
      if (e && e.target === overlay) closeDetail(false);
    };
  }

  document.onkeyup = function (e) {
    e = e || window.event;
    var code = e.keyCode || 0;
    if (code === 27 && state.detailOpen) closeDetail(false);
  };

  window.onhashchange = function () {
    var id = readDetailIdFromHash();
    var tabHash = readTabFromHash();

    if (id) {
      var found = findItemById(id);
      if (found) openDetail(found, false);
      return;
    }

    if (state.detailOpen) closeDetail(true);

    if (tabHash) {
      try { tabHash = decodeURIComponent(tabHash); } catch (e) {}
      if (tabHash === "game" || tabHash === "music" || tabHash === "story") {
        setActiveTab(tabHash);
        render();
      }
    }
  };

  // ---------- Render ----------
  function render() {
    var items = DATA[state.tab] || [];
    var filtered = filterItems(items, state.query);

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
      html += (
        '<article class="item" data-id="' + escapeHtml(it.id) + '">' +
          '<div class="item-top">' +
            '<div class="item-left">' +
              '<div class="item-left-row">' +
                renderTile(state.tab, it.title, "") +
                '<div class="item-text">' +
                  '<h3 class="item-title">' + escapeHtml(it.title) + "</h3>" +
                  '<div class="item-meta">' + escapeHtml(it.meta) + "</div>" +
                "</div>" +
              "</div>" +
            "</div>" +
            '<div class="item-badge">' + escapeHtml(it.badge) + "</div>" +
          "</div>" +
          '<div class="item-desc">' + escapeHtml(it.desc) + "</div>" +
        "</article>"
      );
    }
    itemsRoot.innerHTML = html;

    // delegation
    itemsRoot.onclick = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;

      while (target && target !== itemsRoot && (!target.getAttribute || !target.getAttribute("data-id"))) {
        target = target.parentNode;
      }
      if (!target || target === itemsRoot) return;

      var id = target.getAttribute("data-id");
      var found = findItemById(id);
      if (found) openDetail(found, true);
    };
  }
})();
