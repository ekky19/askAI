chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "askAI",
    title: "Ask AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.storage.sync.get([
    "openaiKey", "geminiKey", "mistralKey", "cohereKey", "openrouterKey", "huggingfaceKey", "preferredProvider"
  ], async (keys) => {
    const provider = keys.preferredProvider || "openai";
    const prompt = `Explain this shortly:\n\n${info.selectionText}`;
    let explanation = "No response.";
    let apiKey = keys[provider + "Key"];
    let endpoint, headers, body;

    const providerNames = {
      openai: "OpenAI (ChatGPT)",
      gemini: "Gemini (Google)",
      mistral: "Mistral AI",
      cohere: "Cohere",
      openrouter: "OpenRouter",
      huggingface: "Hugging Face"
    };

    if (!apiKey) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const oldWarn = document.getElementById('askai-warning-box');
          if (oldWarn) oldWarn.remove();
          const box = document.createElement('div');
          box.id = 'askai-warning-box';
          box.style.position = 'fixed';
          box.style.right = '30px';
          box.style.bottom = '30px';
          box.style.maxWidth = '360px';
          box.style.background = 'linear-gradient(100deg, #fffbe6 70%, #ffe7e7 100%)';
          box.style.color = '#7d1b1b';
          box.style.fontFamily = 'Segoe UI, Arial, sans-serif';
          box.style.fontSize = '15px';
          box.style.boxShadow = '0 6px 32px rgba(0,0,0,0.11)';
          box.style.borderRadius = '16px';
          box.style.padding = '20px 22px 20px 20px';
          box.style.zIndex = '2147483647';
          box.textContent = "Please set your API key in the askAI extension options.";
          document.body.appendChild(box);
          setTimeout(() => { box.style.opacity = 0; setTimeout(() => box && box.remove(), 400); }, 8000);
        }
      });
      return;
    }

    try {
      if (provider === "openai") {
        endpoint = "https://api.openai.com/v1/chat/completions";
        headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
        body = JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 256,
          temperature: 0.7
        });
      } else if (provider === "gemini") {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        });
      } else if (provider === "mistral") {
        endpoint = "https://api.mistral.ai/v1/chat/completions";
        headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
        body = JSON.stringify({
          model: "mistral-small",
          messages: [{ role: "user", content: prompt }]
        });
      } else if (provider === "cohere") {
        endpoint = "https://api.cohere.ai/v1/chat";
        headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
        body = JSON.stringify({
          message: prompt,
          model: "command-r-plus"
        });
      } else if (provider === "openrouter") {
        endpoint = "https://openrouter.ai/api/v1/chat/completions";
        headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
        body = JSON.stringify({
          model: "mistralai/mistral-small",
          messages: [{ role: "user", content: prompt }]
        });
      } else if (provider === "huggingface") {
        endpoint = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";
        headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
        body = JSON.stringify({ inputs: prompt });
      }

      if (endpoint && headers && body) {
        const res = await fetch(endpoint, { method: "POST", headers, body });
        const data = await res.json();
        if (provider === "openai" || provider === "mistral" || provider === "openrouter") {
          explanation = data.choices?.[0]?.message?.content?.trim() || "No response.";
        } else if (provider === "gemini") {
          explanation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response from Gemini.";
        } else if (provider === "cohere") {
          explanation = data.text || data.reply || "No response from Cohere.";
        } else if (provider === "huggingface") {
          explanation = (typeof data === "string") ? data : (data?.generated_text || "No response from HuggingFace.");
        }
      }
    } catch (e) {
      explanation = "Error: " + (e.message || e.toString());
    }

    // --- INJECT POPUP WITH MINI CHAT AND MEMORY ---
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (providerName, provider, apiKey, initialPrompt, initialResponse) => {
        const oldBox = document.getElementById('askai-answer-box');
        if (oldBox) oldBox.remove();

        const box = document.createElement('div');
        box.id = 'askai-answer-box';
        box.style.position = 'fixed';
        box.style.right = '30px';
        box.style.bottom = '30px';
        box.style.maxWidth = '370px';
        box.style.background = 'rgba(30,40,60,0.97)';
        box.style.color = '#fff';
        box.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        box.style.fontSize = '15px';
        box.style.boxShadow = '0 6px 32px rgba(0,0,0,0.25)';
        box.style.borderRadius = '16px';
        box.style.padding = '18px 20px 16px 20px';
        box.style.zIndex = '2147483647';
        box.style.lineHeight = '1.6';
        box.style.whiteSpace = 'pre-wrap';
        box.style.boxSizing = 'border-box';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.minHeight = '120px';

        const header = document.createElement('div');
        header.style.fontWeight = 'bold';
        header.style.fontSize = '15px';
        header.style.marginBottom = '7px';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.textContent = providerName;
        box.appendChild(header);

        const close = document.createElement('span');
        close.innerHTML = '&times;';
        close.style.position = 'absolute';
        close.style.right = '15px';
        close.style.top = '7px';
        close.style.fontSize = '22px';
        close.style.cursor = 'pointer';
        close.title = "Close";
        close.onclick = () => box.remove();
        box.appendChild(close);

        const chat = document.createElement('div');
        chat.style.flex = "1";
        chat.style.overflowY = "auto";
        chat.style.marginBottom = "10px";
        chat.style.maxHeight = "250px";
        box.appendChild(chat);

        // --- Conversation history for context ---
        let chatHistory = [
          { role: "user", content: initialPrompt },
          { role: "assistant", content: initialResponse }
        ];

        // Utility: Add message to chat log
        function addMsg(who, msg) {
          const el = document.createElement('div');
          el.innerHTML = `<b>${who}:</b> ${msg}`;
          el.style.marginBottom = "10px";
          chat.appendChild(el);
          chat.scrollTop = chat.scrollHeight;
        }

        // Show initial conversation
        addMsg("You", initialPrompt);
        addMsg(providerName, initialResponse);

        const inputRow = document.createElement('div');
        inputRow.style.display = "flex";
        inputRow.style.gap = "6px";
        inputRow.style.marginTop = "4px";
        inputRow.style.alignItems = "center";

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your question...';
        input.style.flex = "1";
        input.style.padding = "7px 10px";
        input.style.borderRadius = "8px";
        input.style.border = "none";
        input.style.fontSize = "15px";
        input.style.background = "#fff";
        input.style.color = "#222";
        input.style.outline = "none";

        const send = document.createElement('button');
        send.textContent = "Send";
        send.style.background = "linear-gradient(90deg, #3579f6 0%, #42e3b9 100%)";
        send.style.color = "#fff";
        send.style.border = "none";
        send.style.borderRadius = "8px";
        send.style.padding = "7px 18px";
        send.style.cursor = "pointer";
        send.style.fontWeight = "bold";
        send.style.fontSize = "15px";
        send.style.boxShadow = "0 1px 6px rgba(53,121,246,0.07)";

        async function handleUserMessage() {
          const userMsg = input.value.trim();
          if (!userMsg) return;
          addMsg("You", userMsg);
          input.value = "";
          send.disabled = true;
          send.textContent = "…";
          chatHistory.push({ role: "user", content: userMsg });

          let response = "No response.";
          try {
            let endpoint, headers, body;
            if (provider === "openai" || provider === "mistral" || provider === "openrouter") {
              endpoint =
                provider === "openai"
                  ? "https://api.openai.com/v1/chat/completions"
                  : provider === "mistral"
                  ? "https://api.mistral.ai/v1/chat/completions"
                  : "https://openrouter.ai/api/v1/chat/completions";
              headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
              body = JSON.stringify({
                model: provider === "openai" ? "gpt-4o" : "mistral-small",
                messages: chatHistory,
                max_tokens: 256,
                temperature: 0.7
              });
            } else if (provider === "gemini") {
              endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
              headers = { "Content-Type": "application/json" };
              // Simulate conversation by concatenating all turns
              const textHistory = chatHistory
                .map(m =>
                  (m.role === "user" ? "You: " : providerName + ": ") + m.content
                )
                .join("\n");
              body = JSON.stringify({
                contents: [{ parts: [{ text: textHistory }] }]
              });
            } else if (provider === "cohere") {
              endpoint = "https://api.cohere.ai/v1/chat";
              headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
              body = JSON.stringify({
                message: userMsg,
                model: "command-r-plus"
              });
            } else if (provider === "huggingface") {
              endpoint = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";
              headers = { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
              body = JSON.stringify({ inputs: userMsg });
            }

            if (endpoint && headers && body) {
              const res = await fetch(endpoint, { method: "POST", headers, body });
              const data = await res.json();
              if (provider === "openai" || provider === "mistral" || provider === "openrouter") {
                response = data.choices?.[0]?.message?.content?.trim() || "No response.";
              } else if (provider === "gemini") {
                response = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response from Gemini.";
              } else if (provider === "cohere") {
                response = data.text || data.reply || "No response from Cohere.";
              } else if (provider === "huggingface") {
                response = (typeof data === "string") ? data : (data?.generated_text || "No response from HuggingFace.");
              }
            }
          } catch (e) {
            response = "Error: " + (e.message || e.toString());
          }
          chatHistory.push({ role: "assistant", content: response });
          addMsg(providerName, response);
          send.disabled = false;
          send.textContent = "Send";
        }

        send.onclick = handleUserMessage;
        input.addEventListener("keydown", e => {
          if (e.key === "Enter") handleUserMessage();
        });

        inputRow.appendChild(input);
        inputRow.appendChild(send);
        box.appendChild(inputRow);

        document.body.appendChild(box);
        chat.scrollTop = chat.scrollHeight;
        input.focus();
      },
      args: [providerNames[provider], provider, apiKey, info.selectionText, explanation]
    });
    // --- end popup inject ---
  });
});
