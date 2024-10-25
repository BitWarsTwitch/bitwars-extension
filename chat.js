window.Twitch.ext.onAuthorized((auth) => {
  const token = auth.helixToken;
  const channelId = auth.channelId;
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
    Twitch.ext.bits
      .useBits(gifName.replace(".gif", ""))
      .then((transaction) => {
        console.log("Purchase successful!", transaction);
      })
      .catch((error) =>
        console.log("Error processing bits transaction:", error)
      );
  };

  card.appendChild(titleContainer);
  card.appendChild(gif);
  card.appendChild(button);

  return card;
}

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
