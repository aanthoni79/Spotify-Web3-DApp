import { ethers } from 'ethers';
import './App.css';
import spotify from "./utils/spotify.json";
import React, { useEffect, useState } from "react";

function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x8dCd8C094874fa4F013Ad4eCEbf10358CdFcc221";
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);

  const getAllWaves = async () => {
    try{
      if(window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const spotifyContract = new ethers.Contract(contractAddress, spotify.abi, signer);
    
        const waves = await spotifyContract.getAllWaves();
        console.log("These are the waves",waves);
        let wavesCleaned=[]
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        console.log("wavescleaned", wavesCleaned);
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")

      }
    
    }
    catch(error){
      console.log(error);
    }
  }

  const checkIfwalletisconnected = async() => {
    try { 
      const{ ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return; 
      } else {
        console.log("We have the ethereum object", ethereum); 
      }
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0]; 
        console.log("Found an authorized account:", account);
        setCurrentAccount (account) 
      } else {
        console.log("No authorized account found")
      }  
    } catch (error) {
      console.log(error);
    }
  }  

  const connectWallet = async () => {
    try{
      const { ethereum } = window

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      }

      const accounts = await ethereum.request({method : "eth_requestAccounts"});
    
      setCurrentAccount(accounts[0]);

    }
    catch(error){
      console.log(error);
    }

  }

  const wave = async() => {
    try{
      if(window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const spotifyContract = new ethers.Contract(contractAddress, spotify.abi, signer);

      let count = await spotifyContract.getTotalWaves();

      console.log("Retrieved wave count", count.toNumber());

      const waveTxn =  await spotifyContract.wave(message);
      console.log("Mining ....", waveTxn.hash);

      await waveTxn.wait();
      getAllWaves();
      console.log("Mined ....", waveTxn.hash);

      count = spotifyContract.getTotalWaves();

      

    }}
    catch(error){
      console.log(error);
    }
  }

  useEffect(()=>{
    checkIfwalletisconnected();
  },[])

  return (
    <div className="App">
      <div className='Data'>
        <div className='header'>
        🎵 Spotify Web3 DApp 🎵
        </div>
        <div className='bio'>
          Hi! I am Aanthoni DSouza.                                                             
        </div>
        <div className='bio'>
          Feel free to type in your Spotify Playlist Link and store it forever on the Blockchain.                                                           
        </div>
        
        <input type="text" placeholder='enter spotify link' className='box' onChange={(e)=> setMessage(e.target.value)}/>
        
    
        {!currentAccount && (
          <button className='waveButton' onClick={connectWallet}>
            CONNECT WALLET
          </button>
        )}

        <button className='waveButton' onClick={wave}>
          UPLOAD URL
        </button>  

        <h2>🎶 Spotify Playlist Links</h2>

        {console.log("all waves", allWaves)}
        { allWaves.map((wave, index) => {
          return (
            <div key={index} style={{backgroundColor:"#AAD79A", marginTop: "16px", padding:"20px"}}>
              <div> ADDRESS : {wave.address} </div>
              <div> TIME : {wave.timestamp.toString()} </div>
              <div> MESSAGE : {wave.message} </div>
            </div>)
          })}
        </div>
    </div>
  );
}

export default App;