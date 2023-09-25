import fs from "fs/promises";

const new_holdings = [];
let count = 50;

while (count) {
  const portfolio_id = Math.floor(Math.random() * 10) + 1;
  const share_id = Math.floor(Math.random() * 10) + 1;
  const quantity = Math.floor(Math.random() * 10000);
  const match = new_holdings.find(
    (record) =>
      record.portfolio_id === portfolio_id && record.share_id === share_id
  );
  if (match) continue;
  new_holdings.push({ portfolio_id, share_id, quantity });
  count--;
}

fs.writeFile(
  "./db/data/test-data/portfolio-holdings.js",
  "export default " + JSON.stringify(new_holdings),
  "utf-8"
);
