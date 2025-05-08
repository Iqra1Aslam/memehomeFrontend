import Ably from "ably";

const KEY = import.meta.env.VITE_API_ABLY;



if (!KEY || typeof KEY !== "string") {
  throw new Error("Ably API key is missing or invalid. Please set VITE_API_ABLY in your .env file.");
}

const ably = new Ably.Realtime({ key: KEY });
const channel = ably.channels.get("coins");

ably.connection.on("connected", () => {
  // console.log("Successfully connected to Ably!");
});

ably.connection.on("failed", (error) => {
  console.error("Ably connection failed:", error);
});

export { ably, channel };