var token, userId;

const twitch = window.Twitch.ext;

twitch.onContext((context) => {
  console.log(context);
});

BASE_URL = "http://localhost:3000/";

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
  const channelId = auth.channelId;

  // Set the URL in the input field
  const fullUrl = `${BASE_URL}${channelId}`;
  document.querySelector(".url-input").value = fullUrl;

  fetch(`http://localhost:8000/sessions/${channelId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Session data:", data);
      // Hide spinner and show input elements
      document.getElementById("urlSpinner").style.display = "none";
      document.querySelector(".config-container").style.display = "block";
    })
    .catch((error) => {
      console.log("Error fetching session:", error);
    });
});

document.querySelector(".toggle-visibility").addEventListener("click", () => {
  const urlInput = document.querySelector(".url-input");
  urlInput.type = urlInput.type === "password" ? "text" : "password";
});

// Add handler for co-streamer input
document.querySelector(".costreamer-input").addEventListener("input", (e) => {
  console.log("Co-streamer code:", e.target.value);
});

document.querySelector(".save-button").addEventListener("click", () => {
  const code = document.querySelector(".costreamer-input").value;
  console.log("Saving co-streamer code:", code);
});
