/* ===== Lumia Hub - vanilla JS, WP8-ish ===== */
(function () {
  // ---------- Data (demo) ----------
  var DATA = {
    game: [
      { title: "Zombie Rush", badge: "Offline", meta: "Arcade • 45MB", desc: "Chạy vô tận, né zombie, nhặt coin và nâng cấp tốc độ." },
      { title: "Mini Chess", badge: "2P", meta: "Board • 12MB", desc: "Cờ vua mini, gọn nhẹ, chơi nhanh. Có chế độ 2 người." },
      { title: "Sky Jump", badge: "New", meta: "Casual • 18MB", desc: "Nhảy qua các nền, combo điểm, càng lên cao càng khó." }
    ],
    music: [
      { title: "Lo-fi Chill", badge: "Playlist", meta: "2h 15m", desc: "Lo-fi nhẹ nhàng để học tập/đi ngủ. Beat êm, không quá dày." },
      { title: "Piano Focus", badge: "Instrument", meta: "1h 05m", desc: "Piano tối giản, hợp làm nhạc nền tập trung." },
      { title: "EDM Quick", badge: "Energy", meta: "45m", desc: "Nhạc nhanh, gọn, bật cái là muốn chạy deadline liền." }
    ],
    story: [
      { title: "Cổ tích: Cây khế", badge: "VN", meta: "8 phút", desc: "Câu chuyện quen thuộc về lòng tham và sự trả giá." },
      { title: "Truyện ngắn: Đêm mưa", badge: "Drama", meta: "12 phút", desc: "Một đêm mưa và một cuộc gặp thay đổi mọi thứ." },
      { title: "Bedtime: Fox & Moon", badge: "Kids", meta: "6 phút", desc: "Cáo con và mặt trăng học cách nói lời cảm ơn." }
    ]
  };

  // ---------- State ----------
  var state = {
    tab: "game",
    query: "",
    view: "card", // card | list
    dark: false
  };

  // ---------- DOM ----------
  var body = document.body;
  var tabs = document.querySelectorAll(".tab");
  var itemsRoot = document.getElementById("itemsRoot");
  var searchInput = document.getElementById("searchInput");
  var clearBtn = document.getElementById("clearSearch");
  var toggleViewBtn = document.getElementById("toggleView");
  var viewLabel = document.getElementById("viewLabel");
  var emptyState = document.getElementById("emptyState");
  var statusText = document.getElementById("statusText");
  var hint = document.getElementById("resultHint");
  var themeBtn = document.getElementById("toggleTheme");

  // ---------- Storage helpers ----------
  function safeGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // ---------- Init from storage ----------
  (function init() {
    var savedDark = safeGet("lh_dark", "0");
    var savedView = safeGet("lh_view", "card");
    var savedTab = safeGet("lh_tab", "game");

    state.dark = (savedDark === "1");
    state.view = (savedView === "list" ? "list" : "card");
    state.tab = (savedTab === "music" || savedTab === "story" || savedTab === "game") ? savedTab : "game";

    applyTheme();
    applyView();
    setActiveTab(state.tab);
    render();
  })();

  // ---------- Theme ----------
  function applyTheme() {
    if (state.dark) body.className = "dark";
    else body.className = "";
    safeSet("lh_dark", state.dark ? "1" : "0");
  }

  themeBtn.onclick = function () {
    state.dark = !state.dark;
    applyTheme();
  };

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
      render();
    };
  }

  // ---------- View toggle ----------
  function applyView() {
    // Toggle class on itemsRoot
    if (state.view === "list") {
      itemsRoot.className = "grid view-list";
      viewLabel.innerHTML = "List";
    } else {
      itemsRoot.className = "grid view-card";
      viewLabel.innerHTML = "Card";
    }
    safeSet("lh_view", state.view);
  }

  toggleViewBtn.onclick = function () {
    state.view = (state.view === "card") ? "list" : "card";
    applyView();
  };

  // ---------- Search ----------
  function normalize(s) {
    return (s || "")
      .toLowerCase()
      // very basic Vietnamese folding for common chars (good enough for demo)
      .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, "a")
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, "e")
      .replace(/í|ì|ỉ|ĩ|ị/g, "i")
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, "o")
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, "u")
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, "y")
      .replace(/đ/g, "d");
  }

  function onSearchChange() {
    state.query = searchInput.value || "";
    render();
  }

  // IE mobile sometimes weird with 'input' event -> keep both
  searchInput.oninput = onSearchChange;
  searchInput.onkeyup = onSearchChange;

  clearBtn.onclick = function () {
    searchInput.value = "";
    state.query = "";
    render();
    try { searchInput.focus(); } catch (e) {}
  };

  // ---------- Render ----------
  function escapeHtml(text) {
    // tiny escape for safety
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

  function render() {
    var items = DATA[state.tab] || [];
    var filtered = filterItems(items, state.query);

    // hint + status
    var tabName = state.tab.charAt(0).toUpperCase() + state.tab.slice(1);
    hint.innerHTML = state.query ? ("Đang lọc trong <b>" + tabName + "</b>…") : ("Gõ để tìm kiếm trong tab <b>" + tabName + "</b>.");
    statusText.innerHTML = tabName + " • " + filtered.length + " kết quả";

    // empty state
    if (filtered.length === 0) {
      itemsRoot.innerHTML = "";
      emptyState.style.display = "block";
      return;
    } else {
      emptyState.style.display = "none";
    }

    // build HTML (fast enough for WP8)
    var html = "";
    for (var i = 0; i < filtered.length; i++) {
      var it = filtered[i];
      html += (
        '<article class="item">' +
          '<div class="item-top">' +
            '<div class="item-left">' +
              '<h3 class="item-title">' + escapeHtml(it.title) + '</h3>' +
              '<div class="item-meta">' + escapeHtml(it.meta) + '</div>' +
            '</div>' +
            '<div class="item-badge">' + escapeHtml(it.badge) + '</div>' +
          '</div>' +
          '<div class="item-desc">' + escapeHtml(it.desc) + '</div>' +
        '</article>'
      );
    }
    itemsRoot.innerHTML = html;
  }
})();
