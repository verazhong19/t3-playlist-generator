document.addEventListener('DOMContentLoaded', () => {
    const displayDiv = document.getElementById("textDisplay");
    const promptButton = document.getElementById("promptButton");
    const responseDiv = document.getElementById("gptResponse");
  
    // Retrieve and display the highlighted text on popup load
    chrome.storage.local.get("highlightedText", (result) => {
      displayDiv.textContent = result.highlightedText || "No text selected yet.";
    });

    chrome.storage.local.get("lastPlaylist", (result) => {
      if (result.lastPlaylist) {
        responseDiv.textContent = "Here is your last generated playlist:";
        generatePlaylist(result.lastPlaylist);
      }
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
    responseDiv.textContent = "Generating playlist..."; 
    
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
              content: "You are a music curator that likes to craft narrative playlists based on lyrics. Your playlists are formatted as CSVs. Do not write anything before the CSV. The CSV headers should be TITLE, ARTIST. Before the title, put 'T: '. Before the artist, put 'A:'. Put a comma after all elements and put a space after all commas. At the very end of the message, write 'T:'."
            },
            { 
              role: "user", 
              content: "Give me 10 song reccommendations with lyrics or titles that are related to the main ideas of this text. Identify and match the time period and emotional themes of the text. Give me the title and artist. Do not repeat songs." + prompt 
            }
            ],
          max_tokens: 200
        })
      });
  
      const data = await response.json();
  
      if (data.choices && data.choices.length > 0) {
        const gptResponse = data.choices[0].message.content;

        chrome.storage.local.set({ lastPlaylist: gptResponse }, () => {
          console.log("Playlist stored in local storage.");
        });

        responseDiv.textContent = "Here is your playlist:";
        generatePlaylist(gptResponse);
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
    
    playlistDiv.innerHTML = "";
	
   while (message.indexOf("T:") != -1 && message.indexOf("A:") != -1) {
       
      const songli = document.createElement("li");
      
      var titleStart = message.indexOf("T:") + 3;
      var titleEnd = message.indexOf("A:") - 2;
      var title = message.substring(titleStart, titleEnd);
      message = message.substring(titleEnd);
      
      if (message.indexOf("T:") != -1) {
      	var artistStart = message.indexOf("A:") + 3;
        var artistEnd = message.indexOf("T:") - 2;
        var artist = message.substring(artistStart, artistEnd);
        if (artist.indexOf(',') != -1) {
          artist = artist.substring(0, artist.indexOf(','));
        }
        message = message.substring(message.indexOf("T:"));

        const songInfo = await callSpotify(title + " " + artist);

        const songText = document.createElement("a");
        songText.textContent = songInfo[0] + " by " + songInfo[1];
        songText.href = songInfo[2];
        songText.target = "_blank";
        // songText.rel = 'noopener noreferrer';

        songli.appendChild(songText);

        playlistDiv.appendChild(songli);
      }
    } 
  }

  async function callSpotify(lookup) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(lookup)}&type=track&limit=1`;

     // Replace with your Spotify client info
    const clientID = '';
    const clientSecret = '';

    const accessToken = await getAccessToken(clientID, clientSecret);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    if (data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        // console.log(`Found track: ${track.name} by ${track.artists.map(a => a.name).join(', ')}`);
        // console.log(`Spotify URL: ${track.external_urls.spotify}`);
        return [track.name, track.artists.map(a => a.name).join(', '), track.external_urls.spotify];
    } else {
        console.log('Track not found.');
        return "Track not found.";
    }
  }

  async function getAccessToken(clientID, clientSecret) {
    const url = `https://accounts.spotify.com/api/token`;

    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': `application/x-www-form-urlencoded`
        },
        body: `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`
      });

      const data = await response.json();
      if (data.access_token) {
        const accessToken = data.access_token;
        console.log(accessToken);
  
        return accessToken;
      } else {
        return "Could not fetch access token.";
      }
    } catch (error) {
      return "error";
    }    
  }