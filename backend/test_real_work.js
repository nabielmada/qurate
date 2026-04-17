async function test() {
  const address = "0xE7AA73E33a8C99E6842562B4A876534b2503c57C"; // Sample address
  
  console.log("--- Testing Merchants ---");
  const resM = await fetch(`http://127.0.0.1:3001/api/merchants/m_nabiel_001`);
  const dataM = await resM.json();
  console.log("Merchant Result:", JSON.stringify(dataM, null, 2));

  console.log("\n--- Testing Gas Prices ---");
  const resG = await fetch(`http://127.0.0.1:3001/api/gas-prices`);
  const dataG = await resG.json();
  console.log("Gas Prices Result:", JSON.stringify(dataG, null, 2));

  console.log("\n--- Testing Routing (Dynamic amountToken) ---");
  const resS = await fetch(`http://127.0.0.1:3001/api/scan/${address}`);
  const tokens = await resS.json();
  
  const resR = await fetch(`http://127.0.0.1:3001/api/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokens, amount: 2500, currency: 'IDR' })
  });
  const dataR = await resR.json();
  console.log("Route Result:", JSON.stringify(dataR, null, 2));
}

test();
