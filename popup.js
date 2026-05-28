const dot    = document.getElementById("status-dot");
const label  = document.getElementById("backend-status");
 
fetch("https://simplify-backend-k55o.onrender.com")
  .then(r => r.json())
  .then(() => {
    dot.className   = "status online";
    label.textContent = "Backend connected";
    label.className   = "ok";
  })
  .catch(() => {
    dot.className   = "status offline";
    label.textContent = "Backend offline";
    label.className   = "err";
  });
 