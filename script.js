let highlightedText = "";

document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    highlightedText = selectedText;
    console.log("Highlighted text:", highlightedText);
    document.getElementById("highlightedText").textContent = highlightedText;
  }
});

function test() {
    window.alert("ok what");
}