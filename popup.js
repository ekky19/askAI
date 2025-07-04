document.getElementById('explainBtn').onclick = async () => {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: () => window.getSelection().toString()
  }, ([res]) => {
    const selectedText = res.result;
    if (!selectedText) {
      document.getElementById('error').innerText = "No text selected. Please select some text.";
      return;
    }

    const aiProvider = document.getElementById('aiProvider').value;
    document.getElementById('explanation').innerText = "Thinking...";
    document.getElementById('error').innerText = "";
    chrome.runtime.sendMessage({action: 'explain', aiProvider, selectedText}, (response) => {
      if (response?.explanation) {
        document.getElementById('explanation').innerText = response.explanation;
      } else {
        document.getElementById('error').innerText = "Error: " + (response?.error || "Unknown error.");
        document.getElementById('explanation').innerText = "";
      }
    });
  });
};
