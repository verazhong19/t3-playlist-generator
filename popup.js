document.addEventListener('DOMContentLoaded', () => {
    const displayDiv = document.getElementById("textDisplay");
    const promptButton = document.getElementById("promptButton");
    const responseDiv = document.getElementById("gptResponse");
  
    // Retrieve and display the highlighted text on popup load
    chrome.storage.local.get("highlightedText", (result) => {
      displayDiv.textContent = result.highlightedText || "No text selected yet.";
    });
  
    // When the button is clicked, send the highlighted text to the GPT API
    promptButton.addEventListener("click", () => {
      chrome.storage.local.get("highlightedText", (result) => {
        const prompt = result.highlightedText;
        if (prompt) {
          callGPTAPI(prompt);
        } else {
          responseDiv.textContent = "No highlighted text to send.";
        }
      });
    });
  });
  
  // Function to call the GPT API with the given prompt
  async function callGPTAPI(prompt) {
    const responseDiv = document.getElementById("gptResponse");
  
    // NOTE: For security, do not hardcode your API key in production code.
    // Consider using a secure backend to make the API call.
    const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your API key
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // or another available model
          messages: [{ role: "user", content: prompt }],
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
  