import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
// import './styles/App.css'
import { BrowserRouter } from "react-router-dom";
import { clusterApiUrl } from "@solana/web3.js";
const network = clusterApiUrl("devnet");
const wallets = [];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>
);
