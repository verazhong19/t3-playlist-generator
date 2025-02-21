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
    responseDiv.textContent = "Awaiting response...";
  
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
          messages: [
            {
              role: "developer", 
              content: "You are a music curator that likes to craft narrative playlists based on lyrics. Your playlists are formatted as CSVs. The CSV headers should be TITLE, ARTIST. Before the title, put 'T: '. Before the artist, put 'A:'. Put a comma after all elements and put a space after all commas."
            },
            { 
              role: "user", 
              content: "Give me 10 song reccommendations based on this text. Only use songs that have been on a Top 100 chart. Give me the title and artist." + prompt 
            }
            ],
          max_tokens: 150
        })
      });
  
      const data = await response.json();
  
      if (data.choices && data.choices.length > 0) {
        responseDiv.textContent = "Here is your playlist:";
        generatePlaylist(data.choices[0].message.content);
      } else {
        responseDiv.textContent = "No response received.";
      }
    } catch (error) {
      console.error("Error calling GPT API:", error);
      responseDiv.textContent = "Error calling GPT API.";
    }
  }
  
  async function generatePlaylist(message) {
    const playlistDiv = document.getElementById("playlist"); 
    const messageDiv = document.getElementById("message");  
	
   while (message.indexOf("T:") != -1 && message.indexOf("A:") != -1) {
       
      const song = document.createElement("li");
      
      var titleStart = message.indexOf("T:") + 3;
      var titleEnd = message.indexOf("A:") - 2;
      var title = message.substring(titleStart, titleEnd);
      message = message.substring(titleEnd);
      
      if (message.indexOf("T:") != -1) {
      	var artistStart = message.indexOf("A:") + 3;
        var artistEnd = message.indexOf("T:") - 2;
        var artist = message.substring(artistStart, artistEnd);
        message = message.substring(message.indexOf("T:"));
      	const songText = document.createTextNode(title + " by " + artist);
      
        song.appendChild(songText);

        playlistDiv.appendChild(song);
      }
    } 
  }