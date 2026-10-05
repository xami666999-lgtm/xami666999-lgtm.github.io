(function () {
  var KEY = "mxsify-login";
  var AD = ["doubleclick.net", "googlesyndication.com", "googleadservices.com", "ads.youtube.com", "adservice.google.com", "pagead2.googlesyndication.com", "youtube.com/pagead", "youtube.com/api/stats/ads", "youtube.com/ptracking"];
  function blocked(url) {
    var u = String(url || "").toLowerCase();
    return AD.some(function (host) { return u.indexOf(host) >= 0; });
  }
  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (blocked(url)) return Promise.reject(new Error("ad blocked"));
    return origFetch.apply(this, arguments);
  };
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
  function show() {
    var row = read();
    if (row && row.email) return;
    var gate = document.createElement("div");
    gate.style.cssText = "position:fixed;inset:0;z-index:90;background:#121212;color:#fff;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif";
    gate.innerHTML = '<form style="width:min(420px,92vw);background:#1b1b1b;border:1px solid #2a2a2a;padding:24px"><p style="color:#e8b07a;font-size:12px;font-weight:700">MXSIFY</p><h1 style="margin:8px 0 0;font-size:32px">Sign in</h1><p style="color:#aaa;font-size:14px">Continue with Google. The catalog stays. Ads are blocked.</p><button type="button" id="yt-google" style="margin-top:16px;width:100%;height:44px;border:0;border-radius:999px;background:#fff;color:#111;font-weight:700">Continue with Google</button><input id="yt-name" placeholder="Name" style="margin-top:14px;width:100%;box-sizing:border-box;background:#262626;color:#fff;border:0;padding:12px" /><input id="yt-email" type="email" required placeholder="Google email" style="margin-top:8px;width:100%;box-sizing:border-box;background:#262626;color:#fff;border:0;padding:12px" /><button type="submit" style="margin-top:12px;width:100%;height:44px;border:0;border-radius:999px;background:#c4845a;color:#111;font-weight:700">Save login</button></form>';
    document.body.appendChild(gate);
    gate.querySelector("#yt-google").onclick = function () {
      window.open("https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2F", "mxsify-google", "width=480,height=720");
    };
    gate.querySelector("form").onsubmit = function (e) {
      e.preventDefault();
      var email = gate.querySelector("#yt-email").value.trim().toLowerCase();
      var name = gate.querySelector("#yt-name").value.trim() || email.split("@")[0];
      if (email.indexOf("@") < 1) return;
      localStorage.setItem(KEY, JSON.stringify({ email: email, name: name, at: Date.now() }));
      gate.remove();
    };
  }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
