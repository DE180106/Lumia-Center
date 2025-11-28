/* ===== Lumia Hub - NO DETAIL (click Game opens game directly) ===== */
(function () {
  // ===================== DATA =====================
  // Game có field url -> click card là đi thẳng vào url
  var DATA = {
    game: [
      {
        id: "game-1",
        title: "Zombie Rush",
        badge: "Offline",
        meta: "Arcade • 45MB",
        desc: "Chạy vô tận, né zombie, nhặt coin và nâng cấp tốc độ.",
        info: ["Chế độ: Offline", "Thể loại: Arcade", "Dung lượng: 45MB"],
        url: "games/zombie-rush/index.html"
      },
      {
        id: "game-2",
        title: "Mini Chess (Knight Jump)",
        badge: "Puzzle",
        meta: "Board • nhẹ",
        desc: "Nhảy theo luật Knight (2+1). Mục tiêu: chạm ô Goal.",
        info: ["Luật: Knight", "Mục tiêu: tới Goal", "Best lưu localStorage"],
        url: "games/mini-chess/index.html"
      },
      {
        id: "game-3",
        title: "Sky Jump",
        badge: "Casual",
        meta: "Doodle jump style",
        desc: "Nhảy platform, điều hướng trái/phải, đừng rơi xuống.",
        info: ["Điều hướng: trái/phải", "Tap để đổi hướng", "Best lưu localStorage"],
        url: "games/sky-jump/index.html"
      }
    ],
    music: [
      {
        id: "music-1",
        title: "Lo-fi Chill",
        badge: "Playlist",
        meta: "2h 15m",
        desc: "Lo-fi nhẹ nhàng để học / ngủ.",
        info: ["Mood: Chill", "Gợi ý: nghe tai nghe"]
      },
      {
        id: "music-2",
        title: "Piano Focus",
        badge: "Instrument",
        meta: "1h 05m",
        desc: "Piano tối giản, hợp tập trung.",
        info: ["Không lời: Có", "Thể loại: Piano"]
      },
      {
        id: "music-3",
        title: "EDM Quick",
        badge: "Energy",
        meta: "45m",
        desc: "Nhạc nhanh, gọn.",
        info: ["Mood: Energy", "Gợi ý: bật khi tập thể dục"]
      }
    ],
    story: [
      {
        id: "story-1",
        title: "Cổ tích: Cây khế",
        badge: "VN",
        meta: "8 phút",
        desc: "Câu chuyện về lòng tham và sự trả giá.",
        info: ["Cổ tích VN", "Độ tuổi: 6+"]
      },
      {
        id: "story-2",
        title: "Truyện ngắn: Đêm mưa",
        badge: "Drama",
        meta: "12 phút",
        desc: "Một đêm mưa và cuộc gặp thay đổi mọi thứ.",
        info: ["Mood: Drama"]
      },
      {
        id: "story-3",
        title: "Bedtime: Fox & Moon",
        badge: "Kids",
        meta: "6 phút",
        desc: "Cáo con và mặt trăng học cách nói lời cảm ơn.",
        info: ["Độ tuổi: 4+"]
      }
    ]
  };

  // ===================== UTIL =====================
  function safeGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
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

  function readTabFromHash() {
    var h = (location.hash || "");
    if (h.indexOf("#tab=") === 0) return h.substring("#tab=".length);
    return null;
  }
  function setHashTab(tab) { location.hash = "#tab=" + encodeURIComponent(tab); }

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

  // ===================== INDEX ONLY =====================
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

  // overlay/detail vẫn tồn tại trong HTML nhưng ta không dùng => ẩn luôn cho chắc
  var overlay = document.getElementById("detailOverlay");
  if (overlay) overlay.style.display = "none";

  var state = {
    tab: "game",
    query: "",
    view: "card"
  };

  // init from storage + hash
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
      setHashTab(name);
      render();
    };
  }

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

      // thêm data-url nếu là game
      var dataUrl = (state.tab === "game" && it.url) ? (' data-url="' + escapeHtml(it.url) + '"') : "";

      html += (
        '<article class="item" data-id="' + escapeHtml(it.id) + '"' + dataUrl + ">" +
          '<div class="item-top">' +
            '<div class="item-left">' +
              '<div class="item-left-row">' +
                renderTile(state.tab, it.title) +
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

    // click handler: nếu tab Game => đi thẳng vào url
    itemsRoot.onclick = function (e) {
      e = e || window.event;
      var target = e.target || e.srcElement;

      while (target && target !== itemsRoot && (!target.getAttribute || !target.getAttribute("data-id"))) {
        target = target.parentNode;
      }
      if (!target || target === itemsRoot) return;

      if (state.tab === "game") {
        var url = target.getAttribute("data-url");
        if (url) {
          location.href = url; // ✅ mở game trực tiếp
          return;
        }
      }

      // Music/Story: hiện tại không cần detail => có thể alert nhẹ
      try {
        alert("Chưa cần detail. Bạn đang ở tab: " + tabName);
      } catch (err) {}
    };
  }
})();
