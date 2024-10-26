var token, userId, globalChannelId;

const twitch = window.Twitch.ext;

twitch.onContext((context) => {
  console.log(context);
});

BASE_URL = "http://localhost:3000/";
BACKEND_URL = "http://localhost:8000/";

async function setName(auth) {
  const endpointUrl = "https://api.twitch.tv/helix/users";
  const url = `${endpointUrl}?id=${window.Twitch.ext.viewer.id}`;
  const response = await fetch(url, {
    headers: {
      "client-id": auth.clientId,
      Authorization: `Extension ${auth.helixToken}`,
    },
  });
  const body = await response.json();
  const username = body.data.at(0)?.display_name;
  document.querySelector(".name-input").value = username;
}

async function updateSession(channelId) {
  const sessionData = {
    channel_id: channelId,
    friend_code: document.querySelector(".costreamer-input").value,
    name: document.querySelector(".name-input").value,
    health: 50,
    enemy_name: document.querySelector(".enemy-input").value,
  };
  const response = await fetch(`${BACKEND_URL}sessions/${channelId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sessionData),
  });

  if (response.ok) {
    console.log("Session updated successfully!");
  } else {
    console.error("Failed to update session.");
  }
}

twitch.onAuthorized(async (auth) => {
  token = auth.token;
  userId = auth.userId;
  const channelId = auth.channelId;
  globalChannelId = channelId;

  // Set the URL in the input field
  const fullUrl = `${BASE_URL}${channelId}`;
  document.querySelector(".url-input").value = fullUrl;

  fetch(`http://localhost:8000/sessions/${channelId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(async (data) => {
      console.log("Session data:", data);
      // Hide spinner and show input elements
      document.getElementById("urlSpinner").style.display = "none";
      document.querySelector(".config-container").style.display = "block";

      if (data.name === null) {
        await setName(auth);
      } else {
        document.querySelector(".name-input").value = data.name;
      }

      // set friend code based on data
      document.querySelector(".costreamer-input").value = data.friend_code;
      document.querySelector(".enemy-input").value = data.enemy_name;
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

document.querySelector(".save-button").addEventListener("click", async () => {
  const code = document.querySelector(".costreamer-input").value;
  console.log("Saving co-streamer code:", code);

  try {
    await updateSession(globalChannelId);

    // Show notification
    const notification = document.querySelector(".save-notification");
    notification.classList.add("show");

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);

    // Add button animation
    const saveButton = document.querySelector(".save-button");
    saveButton.style.backgroundColor = "#4CAF50";
    setTimeout(() => {
      saveButton.style.backgroundColor = "#0066ff";
    }, 1000);
  } catch (error) {
    console.error("Error saving settings:", error);
  }
});

// tab navigation for second step
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    button.classList.add("active");

    // Hide all content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.style.display = "none";
    });

    // Show selected content
    const tabId = button.getAttribute("data-tab");
    document.getElementById(`${tabId}-content`).style.display = "block";

    // Clear costreamer input when switching to singleplayer
    if (tabId === "singleplayer") {
      document.querySelector(".costreamer-input").value = "";
    }
  });
});
