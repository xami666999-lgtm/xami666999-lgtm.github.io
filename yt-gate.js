(function () {
  var KEY = "mxsify-login";
  var AD = ["doubleclick.net", "googlesyndication.com", "googleadservices.com", "ads.youtube.com", "adservice.google.com", "pagead2.googlesyndication.com", "youtube.com/pagead", "youtube.com/api/stats/ads", "youtube.com/ptracking"];
  function blocked(url) {
    var u = String(url || "").toLowerCase();
    return AD.some(function (host) { return u.indexOf(host) >= 0; });
  }
  if (window.fetch) {
    var origFetch = window.fetch;
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      if (blocked(url)) return Promise.reject(new Error("ad blocked"));
      return origFetch.apply(this, arguments);
    };
  }
  var desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "src");
  if (desc && desc.set) {
    Object.defineProperty(HTMLMediaElement.prototype, "src", {
      get: desc.get,
      set: function (value) {
        if (blocked(value)) return;
        desc.set.call(this, value);
      }
    });
  }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save(name) {
    var row = { name: name || "YouTube", email: "youtube", signedIn: true, at: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(row));
    localStorage.setItem("mxsify-yt", JSON.stringify({ name: row.name, signedIn: true, at: row.at }));
    return row;
  }
  function enter(gate, popup) {
    save("YouTube");
    if (popup && !popup.closed) popup.close();
    if (gate) gate.remove();
    if (location.pathname.indexOf("yt-return") >= 0) location.replace("/");
  }
  if (location.hash.indexOf("yt=ok") >= 0 || location.search.indexOf("yt=ok") >= 0) {
    save("YouTube");
    history.replaceState(null, "", location.pathname);
  }
  function show() {
    if (read() && read().signedIn) return;
    var gate = document.createElement("div");
    gate.style.cssText = "position:fixed;inset:0;z-index:90;background:#121212;color:#fff;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif";
    gate.innerHTML = '<div style="width:min(420px,92vw);background:#1b1b1b;border:1px solid #2a2a2a;padding:24px"><p style="color:#e8b07a;font-size:12px;font-weight:700">MXSIFY</p><h1 style="margin:8px 0 0;font-size:32px">Sign in</h1><p id="yt-status" style="color:#aaa;font-size:14px">Google opens in a window. This page stays here and comes back in when YouTube is signed in.</p><button type="button" id="yt-google" style="margin-top:16px;width:100%;height:44px;border:0;border-radius:999px;background:#fff;color:#111;font-weight:700">Continue with Google</button></div>';
    document.body.appendChild(gate);
    var status = gate.querySelector("#yt-status");
    gate.querySelector("#yt-google").onclick = function () {
      var popup = window.open("https://accounts.google.com/ServiceLogin?service=youtube&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2F", "mxsify-google", "width=480,height=720");
      if (!popup) {
        status.textContent = "The window was blocked. Allow popups, then try again.";
        return;
      }
      status.textContent = "Signing in on YouTube. Mxsify will open as soon as that finishes.";
      var started = Date.now();
      var timer = setInterval(function () {
        if (popup.closed) {
          clearInterval(timer);
          enter(gate, popup);
          return;
        }
        try {
          var href = popup.location.href || "";
          if (href.indexOf("youtube.com") >= 0 || href.indexOf("github.io") >= 0) {
            clearInterval(timer);
            enter(gate, popup);
          }
        } catch (e) {
          if (Date.now() - started > 2500) {
            clearInterval(timer);
            enter(gate, popup);
          }
        }
      }, 400);
    };
  }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
