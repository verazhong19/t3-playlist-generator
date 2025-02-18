document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      chrome.storage.local.set({ highlightedText: selectedText }, () => {
        console.log("Highlighted text saved:", selectedText);
      });
    }
  });
  