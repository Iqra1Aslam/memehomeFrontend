export async function getSolPrice(): Promise<number | null> {
  try {
    const response: Response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    const data: { solana: { usd: number } } = await response.json();
    return data.solana.usd; // Return the price
  } catch (error) {
    console.error("Error fetching SOL price:", error);
    return null;
  }
}
