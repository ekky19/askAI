chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString();
    chrome.runtime.sendMessage({ action: "explainText", text: selectedText });
  }
});
