window.addEventListener('DOMContentLoaded', function() {
  const keys = [
    "openaiKey", "geminiKey", "mistralKey", "cohereKey", "openrouterKey", "huggingfaceKey", "preferredProvider"
  ];
  chrome.storage.sync.get(keys, (data) => {
    keys.forEach(k => {
      if (k === "preferredProvider") {
        document.getElementById(k).value = data[k] || "openai";
      } else {
        document.getElementById(k).value = data[k] || "";
      }
    });
  });

  document.getElementById("optionsForm").onsubmit = function(e) {
    e.preventDefault();
    let data = {};
    keys.forEach(k => data[k] = document.getElementById(k).value.trim());
    chrome.storage.sync.set(data, () => {
      const st = document.getElementById("status");
      st.innerHTML =
        "<span style='color:#219e60;font-weight:bold;'>✅ Settings saved!</span><br>" +
        "<span style='color:#167252;'>API keys are stored only in chrome.storage.sync.</span>";
      setTimeout(() => { st.innerHTML = ""; }, 9000);
      chrome.storage.sync.get(keys, data => console.log("Current keys:", data));
    });
  };
});
