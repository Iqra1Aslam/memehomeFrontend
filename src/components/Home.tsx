// import React from 'react'
// import { motion, AnimatePresence } from "framer-motion";
// import HeroSection from "../components/HeroSection";
// import ListingCoin from "../components/ListingCoin";
// import Navbar from "../components/Navbar";
// import { useNavigate } from 'react-router-dom';


// function Home(props:any) {
//     const navigate = useNavigate();
//     // const handleTradeClick = (token: Coin) => {
//     //   setSelectedToken(token);
//     //   setIsTradePageOpen(true);
//     // };
  
//   return (
//     <div> <motion.div
//     key="home"
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//   >
//     <Navbar onLaunchClick={() =>{navigate('/create-token');  setIsCreateTokenOpen(true);} } />
//     <HeroSection
//       onCreateClick={() => setIsCreateTokenOpen(true)}
//       topCoin={props.topCoin}
//       price={props.price}
//       onTradeClick={props.handleTradeClick}
//       onSearch={props.handleSearch}
//       highMarketCapCoins={props.highMarketCapCoins}
//       CoinCardComponent={props.CoinCard} // Pass CoinCard from ListingCoin
//     />
//     <ListingCoin
//       onTradeClick={props.handleTradeClick}
//       coins={props.filteredCoins}
//       price={props.price}
//     />
//   </motion.div></div>
//   )
// }

// export default Home


import React from "react";
import { motion } from "framer-motion";
import HeroSection from "../components/HeroSection";
import ListingCoin from "../components/ListingCoin";
import Navbar from "../components/Navbar";

function Home(props: any) {
  return (
    <div>
      <motion.div
        key="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Navbar onLaunchClick={props.onLaunchClick} /> {/* Use prop */}
        <HeroSection
          onCreateClick={props.onLaunchClick} // Align with Navbar's Launch
          topCoin={props.topCoin}
          price={props.price}
          onTradeClick={props.handleTradeClick}
          onSearch={props.handleSearch}
          highMarketCapCoins={props.highMarketCapCoins}
          CoinCardComponent={props.CoinCard}
        />
        <ListingCoin
          onTradeClick={props.handleTradeClick}
          coins={props.filteredCoins}
          price={props.price}
        />
      </motion.div>
    </div>
  );
}

export default Home;