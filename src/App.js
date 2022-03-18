import './styles/App.css';
import { ethers } from 'ethers'
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import myEpicNft from './utils/MyEpicNFT.json'

// Constants
const TWITTER_HANDLE = 'h1HiveOrg';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/1hive-onboard-v3';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x513C9A10ffAD25b35f61c89E7C5d813dA11DbC28";

const App = () => {

  /*
    * Just a state variable we use to store our user's public wallet.
    */
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [nftMinted, setNFTMinted] = useState(false);

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts"});

    /*
      * User can have multiple authorized accounts, we grab the first one if its there!
      */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      /*
        // This will essentially "capture" our event when our contract throws it.
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });*/

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
          console.log("Going to pop wallet now to pay gas...")
          let nftTxn = await connectedContract.mintToken(1);

          setLoading(true);
          setNFTMinted(false);
  
          console.log("Mining...please wait.")
          await nftTxn.wait();
          
          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
          setLoading(false);
          setNFTMinted(true);
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
      }
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={ connectWallet } className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  /*
  * We want the "Connect to Wallet" button to dissapear if they've already connected their wallet!
  */
  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  );


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">1Hive Mint Shop</p>
          <p className="sub-text">
            Proof of completion for onboarding.  Mint yours now.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        {loading && (
        <>
          <p className="sub-text">
            Your tokens are minting. Please wait a few minutes. This message
            will be replaced with your transaction once minted.
          </p>
        <br />
        </>
      )}

      {nftMinted && (
        <div>
          <p className="sub-text">
          <a
      
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >{`🌊 View Collection on OpenSea`}</a></p>
        </div>
      )}


        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by the 1Hive Community`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
