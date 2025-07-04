# askAI — Chrome Extension

**askAI** is a simple and powerful Chrome extension that explains selected text using your favorite AI models.  
With a right-click, you can instantly get concise AI-powered explanations from OpenAI (ChatGPT), Gemini (Google), Mistral AI, Cohere, OpenRouter, or Hugging Face — all in one extension.

---

## Features

- 🔍 **Select and Explain:** Highlight any text on a webpage, right-click, and choose “Ask AI” to get an instant explanation.
- 🤖 **Choose Your AI:** Supports OpenAI, Gemini, Mistral, Cohere, OpenRouter, and Hugging Face.
- 🗝️ **Private API Keys:** Your API keys are saved only in your browser (never sent to anyone else).
- 🗨️ **Conversational Chat:** Ask follow-up questions directly in a mini-chat popup.
- 🎨 **Modern UI:** Customizable, attractive popup interface.
- 🖥️ **Works on Most Websites:** (Some restrictions apply for sites like Google Docs — see below.)

---

## Installation

1. **Download or Clone This Repo:**
*(Or download as ZIP and extract.)*

2. **Go to** `chrome://extensions` **in Chrome**

3. **Enable Developer Mode** (top-right toggle)

4. **Click “Load unpacked”** and select your extracted `askai-extension` folder

---

## Usage

1. **Get Your API Keys:**
- [OpenAI (ChatGPT)](https://platform.openai.com/api-keys)
- [Gemini (Google)](https://aistudio.google.com/u/1/apikey)
- [Mistral AI](https://console.mistral.ai/api-keys)
- [Cohere](https://dashboard.cohere.com/api-keys)
- [OpenRouter](https://openrouter.ai/settings/keys)
- [Hugging Face](https://huggingface.co/settings/tokens)

2. **Set API Keys:**
- Click the askAI extension icon.
- Go to “Settings”.
- Paste your API keys in the relevant fields.
- Select your preferred provider and save.

3. **Use It:**
- Select text on any webpage.
- Right-click and choose **“Ask AI”**.
- See the explanation in a fancy popup. You can ask follow-up questions in the popup chat!

---

## Permissions & Privacy

- **Permissions Used:**  
`"contextMenus"`, `"activeTab"`, `"storage"`, `"scripting"`, `"host_permissions": ["https://*/*", "http://*/*"]`
- **Your API keys and queries never leave your browser.** All requests go directly to your chosen AI provider.

---

## Troubleshooting

- **Not working on Google Docs or some sites?**  
This is a Chrome/Google Docs limitation (Docs uses a custom editor that blocks script access).
- **Error: Cannot access contents of the page.**  
Make sure you enabled “host_permissions” in `manifest.json` and reloaded the extension.
- **Gemini not working?**  
Use the **X-goog-api-key** header for Gemini requests, and make sure your API key is unrestricted.

---

## Contributing

Pull requests and suggestions welcome! Open an issue or submit a PR.

---

## License

MIT License

---

**Made with ❤️ by [Ekrem O.](https://www.linkedin.com/in/ekremozdemir19/)**
