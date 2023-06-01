function listenFunction() {
  alert("Function listening");
}

function offlineFunction() {
  alert("Function offline");
}

// Check if the browser supports the SpeechRecognition API
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  // Create an instance of SpeechRecognition
  var recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();

  // Set the language for speech recognition (optional)
  recognition.lang = "en-US";

  // Speech recognition event handlers
  recognition.onresult = function (event) {
    var transcript = event.results[0][0].transcript;
    console.log("Transcript:", transcript);
    if ("speechSynthesis" in window) {
      var msg = new SpeechSynthesisUtterance();
      msg.text = "Did you say?" + transcript +"Or would you like to repeat it?";
      msg.rate = 1.0;
      msg.pitch = 1.0;
      window.speechSynthesis.speak(msg);
    }
    location.replace('../../welcome.html');
    localStorage.setItem('spokenText', transcript);
  };
  recognition.onend = function () {
    console.log("Speech recognition ended.");
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
  };

  // Start speech recognition when button is clicked
  document
    .getElementById("speechToTextBtn")
    .addEventListener("click", function () {
      recognition.start();
    });
}