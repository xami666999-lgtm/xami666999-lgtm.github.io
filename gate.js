(function () {
  var KEY = "mxsify-login";
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  if (read() && read().email) return;
  var gate = document.createElement("div");
  gate.id = "mxsify-gate";
  gate.style.cssText = "position:fixed;inset:0;z-index:90;background:#121212;color:#fff;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif";
  gate.innerHTML = '<form id="mxsify-form" style="width:min(420px,92vw);background:#1b1b1b;border:1px solid #2a2a2a;padding:24px"><p style="color:#e8b07a;font-size:12px;font-weight:700;letter-spacing:.04em">MXSIFY</p><h1 style="margin:8px 0 0;font-size:32px">Sign in</h1><p style="color:#aaa;font-size:14px">Continue with Google, then save the login. Next open skips this screen.</p><button type="button" id="mxsify-google" style="margin-top:16px;width:100%;height:44px;border:0;border-radius:999px;background:#fff;color:#111;font-weight:700">Continue with Google</button><input id="mxsify-name" placeholder="Name" style="margin-top:14px;width:100%;box-sizing:border-box;background:#262626;color:#fff;border:0;padding:12px" /><input id="mxsify-email" type="email" required placeholder="Google email" style="margin-top:8px;width:100%;box-sizing:border-box;background:#262626;color:#fff;border:0;padding:12px" /><button type="submit" style="margin-top:12px;width:100%;height:44px;border:0;border-radius:999px;background:#c4845a;color:#111;font-weight:700">Save login</button></form>';
  document.body.appendChild(gate);
  document.getElementById("mxsify-google").onclick = function () {
    window.open("https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2F", "mxsify-google", "width=480,height=720");
  };
  document.getElementById("mxsify-form").onsubmit = function (e) {
    e.preventDefault();
    var email = document.getElementById("mxsify-email").value.trim().toLowerCase();
    var name = document.getElementById("mxsify-name").value.trim() || email.split("@")[0];
    if (email.indexOf("@") < 1) return;
    localStorage.setItem(KEY, JSON.stringify({ email: email, name: name, at: Date.now() }));
    localStorage.setItem("mxsify-yt", JSON.stringify({ name: name, signedIn: true }));
    gate.remove();
  };
})();
