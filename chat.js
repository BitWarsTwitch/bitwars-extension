let storedChannelId = null;
let storedUsername = null;

const FREE_PRODUCTS_COUNT = 4;
const COOLDOWN_TIMES = [
  60000, // 1 minute
  300000, // 5 minutes
  1800000, // 30 minutes
  3600000, // 1 hour
];
const COOLDOWN_KEYS = ["cooldown1", "cooldown2", "cooldown3", "cooldown4"];

function updateCooldownTimer(button, endTime, productIndex) {
  const now = Date.now();
  const timeLeft = endTime - now;

  if (timeLeft <= 0) {
    button.disabled = false;
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.gap = "10px";
    container.innerHTML = "<span>SEND</span>";
    button.innerHTML = "";
    button.appendChild(container);
    return;
  }

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  button.innerHTML = `Wait ${minutes}m ${seconds}s`;
  button.disabled = true;

  setTimeout(() => updateCooldownTimer(button, endTime, productIndex), 1000);
}

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

function createProductCard(gifName, bitsCost, productName, index) {
  const card = document.createElement("div");
  card.className = "product-card";

  const titleContainer = document.createElement("div");
  titleContainer.className = "product-title-container";

  const title = document.createElement("h2");
  title.className = "product-title";
  title.textContent = productName;

  titleContainer.appendChild(title);

  const gif = document.createElement("img");
  gif.src = `public/${gifName}`;
  gif.className = "product-gif";
  gif.alt = gifName;

  const button = document.createElement("button");
  button.className = "buy-button";

  const isFreeProduct = index < FREE_PRODUCTS_COUNT;
  // Create bits/free container
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.gap = "10px";

  if (isFreeProduct) {
    const lastUseTime = localStorage.getItem(COOLDOWN_KEYS[index]);
    const currentTime = Date.now();
    const isInCooldown =
      lastUseTime && currentTime - lastUseTime < COOLDOWN_TIMES[index];

    if (isInCooldown) {
      const timeLeft =
        parseInt(lastUseTime) + COOLDOWN_TIMES[index] - currentTime;
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      container.innerHTML = `<span>Wait ${minutes}m ${seconds}s</span>`;
      button.disabled = true;
    } else {
      container.innerHTML = "<span>SEND</span>";
    }
    button.classList.add("free-button");
  } else {
    const bitsAmount = document.createElement("span");
    bitsAmount.textContent = bitsCost;
    const bitsImage = document.createElement("img");
    bitsImage.src = "public/bit.png";
    bitsImage.style.height = "35px";
    bitsImage.style.width = "auto";
    container.appendChild(bitsAmount);
    container.appendChild(bitsImage);
  }

  button.appendChild(container);
  button.setAttribute("data-original-content", button.innerHTML);

  // Check individual cooldown and start timer if needed
  if (isFreeProduct) {
    const lastUseTime = localStorage.getItem(COOLDOWN_KEYS[index]);
    if (lastUseTime && Date.now() - lastUseTime < COOLDOWN_TIMES[index]) {
      const endTime = parseInt(lastUseTime) + COOLDOWN_TIMES[index];
      updateCooldownTimer(button, endTime, index);
    }
  }

  button.onclick = () => {
    if (isFreeProduct) {
      const currentTime = Date.now();
      const lastUseTime = localStorage.getItem(COOLDOWN_KEYS[index]);

      if (!lastUseTime || currentTime - lastUseTime >= COOLDOWN_TIMES[index]) {
        localStorage.setItem(COOLDOWN_KEYS[index], currentTime);

        // Trigger the free product action
        const payload = {
          sender_session_id: storedChannelId,
          attack_id: parseInt(gifName.replace(".gif", "")),
          user_name: storedUsername,
        };

        fetch(
          "https://bitwars-backend-production.up.railway.app/spawn_attack",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        updateCooldownTimer(button, currentTime + COOLDOWN_TIMES[index], index);
      }
    } else {
      window.Twitch.ext.bits
        .useBits(gifName.replace(".gif", ""))
        .catch((error) =>
          console.log("Error processing bits transaction:", error)
        );
    }
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
    transaction_id: transaction.transactionId,
  };

  try {
    console.log("Spawning attack...");
    console.log(payload);
    fetch("https://bitwars-backend-production.up.railway.app/spawn_attack", {
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
// Modify the products initialization to include index
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

  gifs.forEach((gifName, index) => {
    const product = products.find((p) => p.sku === gifName.replace(".gif", ""));
    const productName = product.displayName;
    const bitsCost = product ? product.cost.amount : "100";
    const card = createProductCard(gifName, bitsCost, productName, index);
    productGrid.appendChild(card);
  });
});
