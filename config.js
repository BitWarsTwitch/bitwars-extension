var token, userId;

const twitch = window.Twitch.ext;

twitch.onContext((context) => {
  console.log(context);
});

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
});

document.querySelector(".url-button").addEventListener("click", () => {
  console.log("URL button clicked");
});

// Add handler for co-streamer input
document.querySelector(".costreamer-input").addEventListener("input", (e) => {
  console.log("Co-streamer code:", e.target.value);
});

document.querySelector(".save-button").addEventListener("click", () => {
  const code = document.querySelector(".costreamer-input").value;
  console.log("Saving co-streamer code:", code);
});
