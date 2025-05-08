import {
  createContext,
  useContext,
  useState,
  useEffect,
  FC,
  ReactNode,
} from "react";
import { Connection, clusterApiUrl } from "@solana/web3.js";

//define the context shape
interface SolanaContextType {
  connection: any;
  setConnection: (connection: any) => void;
}

//create context with a default value
const SolanaContext = createContext<SolanaContextType>({
  connection: null,
  setConnection: () => {},
});
// const SolanaContext = createContext();

export const SolanaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<any>(null);

  useEffect(() => {
    const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
    setConnection(conn);
    console.log("Connected to solana Devnet");
  }, []);

  return (
    <SolanaContext.Provider value={{ connection, setConnection }}>
      {children}
    </SolanaContext.Provider>
  );
};

export const useSolana = () => useContext(SolanaContext);
