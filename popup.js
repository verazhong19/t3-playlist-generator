document.addEventListener('DOMContentLoaded', () => {
    const displayDiv = document.getElementById("textDisplay");
    const promptButton = document.getElementById("promptButton");
    const responseDiv = document.getElementById("gptResponse");
  
    // Retrieve and display the highlighted text on popup load
    chrome.storage.local.get("highlightedText", (result) => {
      displayDiv.textContent = result.highlightedText || "No text selected yet.";
    });
  
    // When the button is clicked, send the highlighted text to the GPT
    promptButton.addEventListener("click", () => {
      chrome.storage.local.get("highlightedText", (result) => {
        const prompt = result.highlightedText;
        if (prompt) {
          callGPT(prompt);
        } else {
          responseDiv.textContent = "No highlighted text to send.";
        }
      });
    });
  });
  

  async function callGPT(prompt) {
    const responseDiv = document.getElementById("gptResponse");
  
    const apiKey = ''; // Replace with your API key
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{role: "developer", content: "You are a music curator that likes to craft narrative playlists based on lyrics."},{ role: "user", content: "generate a playlist in csv based on this text, and include songs that reference the text" + prompt }],
          max_tokens: 150
        })
      });
  
      const data = await response.json();
  
      if (data.choices && data.choices.length > 0) {
        responseDiv.textContent = data.choices[0].message.content;
      } else {
        responseDiv.textContent = "No response received.";
      }
    } catch (error) {
      console.error("Error calling GPT API:", error);
      responseDiv.textContent = "Error calling GPT API.";
    }
  }
  