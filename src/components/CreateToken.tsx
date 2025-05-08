import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { program } from "../utils/anchorClient";
import {
  uploadImagePinata,
  uploadMetadata,
  Token,
  configPda,
  getBondingCurve,
  getCurveAdddressFunc,
  getMetadataFunc,
} from "../utils/programFunction";
import * as anchor from "@project-serum/anchor";
import axios from "axios";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Header from "../components/token/Header";
import TokenForm from "../components/token/TokenForm";
import NotificationPopup from "../components/token/NotificationPopup";
// import Swal from "sweetalert2";
import Loader from "./Loader"; // Import the Loader component
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
// const URL = import.meta.env.VITE_API_URL;
const URL = import.meta.env.VITE_API_URL;

interface CreateTokenProps {
  onClose: () => void;
}

const CreateToken: React.FC<CreateTokenProps> = ({ onClose }) => {
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenMintAddress, setTokenMintAddress] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showLoader, setShowLoader] = useState(false); 
  const { connection } = useConnection();
  const wallet = useWallet();
  const publicKey = wallet.publicKey;
  const {  signMessage } = useWallet();
  const sendTransaction = wallet.sendTransaction;

  const [formData, setFormData] = useState<Token>({
    name: "",
    symbol: "",
    image: "",
    description: "",
  });

  // useEffect(() => {
  //   if (publicKey) {
  //     setIsWalletConnected(true);
  //     const alreadySigned = localStorage.getItem(`hasSignedIn-${publicKey.toBase58()}`);
  //     if (!alreadySigned) {
  //     const message = 'Memehome';
  //     const encodedMessage = new TextEncoder().encode(message);
  
  //     const signature = signMessage(encodedMessage);
  //     const signatureBase58 = bs58.encode(signature);
  
  //     console.log('Wallet Address:', publicKey.toBase58());
  //     console.log('Signature:', signatureBase58);
  
  //     // Save sign-in status specific to wallet address
  //     localStorage.setItem(`hasSignedIn-${publicKey.toBase58()}`, 'true');
  //     console.log('Sign-in status stored:', localStorage.getItem(`hasSignedIn-${publicKey.toBase58()}`));
   
  //   } } else {
  //     setIsWalletConnected(false);
  //     Object.keys(localStorage).forEach((key) => {
  //       if (key.startsWith('hasSignedIn-')) {
  //         localStorage.removeItem(key);
  //       }
  //     })
  //   }
  // }, [publicKey]);
  useEffect(() => {
    if (publicKey) {
      setIsWalletConnected(true);
     
  
    } else {
      setIsWalletConnected(false);
  
     
    }
  }, [publicKey]);
  
  const handleFormFieldChange = (
    fieldName: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [fieldName]: e.target.value });
  };
  const createToken = useCallback(
    async (token: Token) => {
      if (!publicKey) {
        console.error("Publickey is null");
        return;
      }
      if (!token.name || !token.symbol || !token.description || !token.image) {
        console.error("Missing required fields");
        return;
      }

      const tokenMintkp = Keypair.generate();
      // console.log("Token Keypair:", tokenMintkp.publicKey.toBase58());
      const tokenPrivateKey = bs58.encode(tokenMintkp.secretKey);
      // console.log("Token Private Key:", tokenPrivateKey);

      const metadataProgram = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
      );

      try {
        setShowLoader(true);

        const metadataUrl = (await uploadMetadata(token)) as string;
        // console.log("Metadata URL:", metadataUrl);

        const bondingCurvePda = getBondingCurve(
          tokenMintkp.publicKey.toBase58()
        );
        // console.log("Bonding Curve PDA:", bondingCurvePda.toBase58());

        const curveTokenAccount = await getCurveAdddressFunc(
          tokenMintkp.publicKey.toBase58()
        );
        // console.log("Curve Token Account:", curveTokenAccount.toBase58());

        const tokenMetadata = await getMetadataFunc(tokenMintkp);
        // console.log("Token Metadata Account:", tokenMetadata.toBase58());

        const instruction = await program.methods
          .launch(token.name, token.symbol, metadataUrl)
          .accounts({
            creator: publicKey,
            globalConfig: configPda,
            tokenMint: tokenMintkp.publicKey,
            bondingCurve: bondingCurvePda,
            curveTokenAccount: curveTokenAccount,
            tokenMetadataAccount: tokenMetadata,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
            metadataProgram: metadataProgram,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .instruction();

        const transaction = new Transaction().add(instruction);
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
        transaction.partialSign(tokenMintkp);

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );
        // console.log("Transaction Signature:", signature);

        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );
        // console.log("Transaction Confirmation:", confirmation);

        const formData = {
          wallet: publicKey.toBase58(),
          name: token.name,
          bondingCurve: bondingCurvePda.toBase58(),
          ticker: token.symbol,
          description: token.description,
          token: tokenMintkp.publicKey.toBase58(),
          url: metadataUrl,
          imgUrl: token.image,
        };

        if (confirmation) {
          axios
            .post(`${URL}coin/create-coin`, formData)
            .then((response) => {
              // console.log("Coin created successfully:", response.data);
            })
            .catch((error) => {
              console.error("Error creating coin in database:", error);
            });
        }

        setTokenMintAddress(tokenMintkp.publicKey.toBase58());
        setShowNotification(true);
      } catch (error) {
        console.error("Error in program:", error);
      } finally {
        setShowLoader(false);
      }
    },
    [publicKey, connection, sendTransaction]
  );

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImageUploading(true);
      const imgUrl = (await uploadImagePinata(file)) as string;
      if (imgUrl) {
        setFormData({ ...formData, image: imgUrl });
      }
      setIsImageUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createToken(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 overflow-y-auto">
      <div className="min-h-full w-full py-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-purple-900/50 to-black rounded-2xl border border-purple-500/20 p-6 w-full max-w-lg relative my-auto"
        >
          <Header onClose={onClose} />

          {!isWalletConnected ? (
            <WalletModalProvider>
              <div className="flex items-center justify-center h-full">
                <WalletMultiButton
                  className="wallet-multi-button"
                  style={{
                    background:
                      "linear-gradient(to right, #8b5cf6, #ec4899, #6366f1)",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "9999px",
                    padding: "0.5rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow:
                      "0 4px 6px -1px rgba(139, 92, 246, 0.2), 0 2px 4px -1px rgba(139, 92, 246, 0.12)",
                    transition: "all 0.2s ease-in-out",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Connect Wallet
                </WalletMultiButton>
              </div>
            </WalletModalProvider>
          ) : (
            <TokenForm
              formData={formData}
              isImageUploading={isImageUploading}
              isLoading={isLoading}
              handleFormFieldChange={handleFormFieldChange}
              handleImageChange={handleImageChange}
              
              handleSubmit={handleSubmit}
            />
          )}
        </motion.div>
       

      </div>

      {/* Loader */}
      {showLoader && <Loader />}

      {/* Notification Popup */}
      {showNotification && (
        <NotificationPopup
          title="Token Created Successfully!"
          message="Your token has been created successfully."
          transactionUrl={`https://explorer.solana.com/address/${tokenMintAddress}?cluster=devnet`}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default CreateToken;
