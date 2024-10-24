window.Twitch.ext.onAuthorized((auth) => {
  // This is the JWT token provided by Twitch for each viewer
  const token = auth.helixToken;
  const channelId = auth.channelId;

  console.log("User Token: ", token);
  console.log("Channel ID: ", channelId);
  console.log("Is bits enabled?", window.Twitch.ext.features.isBitsEnabled);
});

Twitch.ext.bits.getProducts().then(function (products) {
  console.log(products);

  // Set up click handler for purchase button
  document.getElementById("buyButton").addEventListener("click", () => {
    // Initiate bits transaction
    Twitch.ext.bits
      .useBits("1")
      .then((transaction) => {
        // Transaction successful, make GET request
        fetch("http://localhost:8000/test")
          .then((response) => response.json())
          .then((data) => {
            console.log("Purchase successful!", data);
          })
          .catch((error) => {
            console.log("Error making GET request:", error);
          });
      })
      .catch((error) => {
        console.log("Error processing bits transaction:", error);
      });
  });
});
