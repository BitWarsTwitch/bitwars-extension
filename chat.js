let storedChannelId = null;
let storedUsername = null;

window.Twitch.ext.onAuthorized(async (auth) => {
  if (!window.Twitch.ext.viewer.isLinked) {
    return;
  }

  storedChannelId = auth.channelId;
  console.log("Channel ID:", storedChannelId);

  const endpointUrl = "https://api.twitch.tv/helix/users";
  const url = `${endpointUrl}?id=${window.Twitch.ext.viewer.id}`;
  const response = await fetch(url, {
    headers: {
      "client-id": auth.clientId,
      Authorization: `Extension ${auth.helixToken}`,
    },
  });
  const body = await response.json();
  storedUsername = body.data.at(0)?.display_name;
  console.log("Username:", storedUsername);
});

function createProductCard(gifName, bitsCost, productName) {
  const card = document.createElement("div");
  card.className = "product-card";

  const titleContainer = document.createElement("div");
  titleContainer.className = "product-title-container";

  const title = document.createElement("h3");
  title.className = "product-title";
  title.textContent = productName;

  titleContainer.appendChild(title);

  const gif = document.createElement("img");
  gif.src = `/public/${gifName}`;
  gif.className = "product-gif";
  gif.alt = gifName;

  const button = document.createElement("button");
  button.className = "buy-button";
  button.textContent = `Buy for ${bitsCost} Bits`;

  button.onclick = () => {
    window.Twitch.ext.bits
      .useBits(gifName.replace(".gif", ""))
      .catch((error) =>
        console.log("Error processing bits transaction:", error)
      );
  };

  card.appendChild(titleContainer);
  card.appendChild(gif);
  card.appendChild(button);

  return card;
}

window.Twitch.ext.bits.onTransactionComplete((transaction) => {
  console.log("Transaction completed!", transaction);

  const attackId = parseInt(transaction.product.sku);
  const payload = {
    sender_session_id: storedChannelId,
    attack_id: attackId,
    user_name: storedUsername,
  };

  try {
    console.log("Spawning attack...");
    console.log(payload);
    fetch("http://localhost:8000/spawn_attack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => console.log("Attack spawn response:", data))
      .catch((error) => console.log("Error spawning attack:", error));
  } catch (error) {
    console.log("Error spawning attack:", error);
  }
});

// Initialize products
Twitch.ext.bits.getProducts().then((products) => {
  const productGrid = document.getElementById("productGrid");
  const gifs = [
    "1.gif",
    "2.gif",
    "3.gif",
    "4.gif",
    "5.gif",
    "6.gif",
    "7.gif",
    "8.gif",
  ];

  console.log("products:", products);

  gifs.forEach((gifName) => {
    const product = products.find((p) => p.sku === gifName.replace(".gif", ""));
    const productName = product.displayName;
    const bitsCost = product ? product.cost.amount : "100";
    const card = createProductCard(gifName, bitsCost, productName);
    productGrid.appendChild(card);
  });
});
