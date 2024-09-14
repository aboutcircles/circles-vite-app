"use client"
import React,{ useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import CirclesSDKContext from "../contexts/CirclesSDK";
import ManageTrustAndUntrust from "./ManageTrustUntrust";
import { ethers } from "ethers";


export default function CirclesOnboarding() {

  const { sdk, setIsConnected, isConnected, adapter, circlesProvider, circlesAddress, initSdk } = useContext(CirclesSDKContext);
  const [avatarInfo, setAvatar] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [mintableAmount, setMintableAmount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [valueString, setValueString] = useState("");
  const [recipientIsValid, setRecipientIsValid] = useState(false);
  const [trustedCircles, setTrustedCircles] = useState([]);
  const [untrustedCircles, setUntrustedCircles] = useState([]);
  const [mappedRelations, setTrustRelations] = useState([]);
  const navigate = useNavigate();

// Connect Wallet Function
const connectWallet = async () => {
  try {
    await initSdk();
    await fetchUserBalance();
    setIsConnected(true);

    // Perform avatar check only after connection is established
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
};

// Use Effect Hook
useEffect(() => {
  if (isConnected && sdk && circlesAddress) {
    handleAvatarCheck(); // Check avatar when connection status, SDK, or address changes
    fetchUserBalance(); // Fetch the user balance when connected
  }
}, [isConnected, sdk, circlesAddress]);

  

  const disconnectWallet = () => {
    setIsConnected(false);
    setUserAddress("");
    setUserBalance(0);
    setAvatar(null);
  };

  const fetchUserBalance = async () => {
    if (circlesAddress && circlesProvider) {
      try {
        // Fetch the balance for the circlesAddress
        const userBalance = await circlesProvider.getBalance(circlesAddress);
        setUserBalance(ethers.formatEther(userBalance));
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    }
  };


  const handleAvatarCheck = async () => {
    try {
      if (!sdk) {
        throw new Error("SDK is not available");
      }
  
      if (!circlesAddress) {
        throw new Error("Circles address is not available");
      }
  
      // Check if the avatar exists for the current address
      const avatarInfo = await sdk.getAvatar(circlesAddress);
  
      if (avatarInfo) {
        setAvatar(avatarInfo);
  
        const trustRelations = await avatarInfo.getTrustRelations("");
        console.log("Trust Relations:", trustRelations);
  
        // Update trusted circles state
        setTrustedCircles(trustRelations.map(rel => rel.objectAvatar));
  
        const mappedRelations = trustRelations.map(rel => ({
          timestamp: rel.timestamp,
          objectAvatar: rel.objectAvatar,
          relations: rel.relation
        }));
  
        setTrustRelations(mappedRelations);
        console.log(mappedRelations, "got mapped data");
  
        // Fetch additional avatar details
        const mintableAmount = await avatarInfo.getMintableAmount(circlesAddress);
        const totalBalance = await avatarInfo.getTotalBalance(circlesAddress);
        setMintableAmount(mintableAmount);
        setTotalBalance(totalBalance);
      } else {
        // No existing avatar, register a new one
        console.log("Avatar not found, registering as human...");
        await handleRegisterAvatar(); // Call the registration function
      }
    } catch (error) {
      console.error("Error in handleAvatarCheck:", error);
    }
  };
  
  
  const handleRegisterAvatar = async () => {
    try {
      const newAvatar = await sdk.registerHuman();
      console.log("Registered as V1 Human:", newAvatar);
      setAvatar(newAvatar);
    } catch (registerError) {
      console.error("Error registering avatar:", registerError);
    }
  };
  

  const handleNavigateToDashboard = () => {
    navigate('/dashboard', { state: { trustRelations: mappedRelations } });
  };

  const personalMint = async () => {
    try {
      if (!avatarInfo) {
        throw new Error("Avatar not found");
      }
  
      await avatarInfo.personalMint();
  
      // Update total balance after minting
      const totalBalance = await avatarInfo.getTotalBalance(circlesAddress);
      setTotalBalance(totalBalance);
  
      return { success: true, message: "Personal minting successful" };
    } catch (error) {
      throw new Error(`Error minting Circles: ${error.message}`);
    }
  };

  async function updateBalance() {
    const totalBalance = await avatarInfo.getTotalBalance(circlesAddress);
    setTotalBalance(totalBalance);
  }

  const send = async () => {
    try {
      if (!avatarInfo) {
        throw new Error("Avatar not found");
      }

      const value = parseFloat(valueString);
      if (isNaN(value) || value <= 0) {
        throw new Error("Invalid value");
      }

      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address");
      }

      await avatarInfo.transfer(recipient, value);
      console.log(`Successfully sent ${value} CRC tokens to ${recipient}`);
      // Optionally, redirect to dashboard or show a success message
    } catch (error) {
      console.error("Error sending CRC tokens:", error);
    }
    updateBalance();
  };

  const validateRecipient = () => {
    // Assuming a simple check for a valid Ethereum address format
    const isValid = ethers.isAddress(recipient);
    setRecipientIsValid(isValid);
  };


  return (
    
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <header className="bg-gray-950 text-white px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Welcome to Circles Dev Playground</h1>
            {isConnected && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-sm font-medium">User Balance : {Number(userBalance).toFixed(4)} XDAI</div>
                  <Button onClick={disconnectWallet} className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-2 rounded">
                    Disconnect Wallet
                  </Button>
                  <Button onClick ={handleNavigateToDashboard}className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-4 px-2 rounded">
                    Dashboard</Button>
                </div>
              </div>
            )}
          </header>
          <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isConnected ? (
              <div className="flex items-center justify-center md:col-span-2">
                <Button onClick={connectWallet} className="bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Send Circles CRC Token</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        type="text"
                        placeholder="Enter recipient address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        onBlur={validateRecipient}
                      />
                       {!recipientIsValid && <p className="text-red-500">Please enter a valid recipient address</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount to Send</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount to send"
                        value={valueString}
                        onChange={(e) => setValueString(e.target.value)}
                      />
                    </div>
                    <Button onClick={send} disabled={!recipientIsValid} className="w-full bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
                      Send CRC
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-6">Circles Avatar Info</h2>
                  <div className="flex items-center gap-4">
                    {avatarInfo?.image ? (
                      <img src={avatarInfo.image} alt="Avatar" className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Label className="block text-sm font-medium">Address: {avatarInfo?.address}</Label>
                      <Label className="block text-sm font-medium">Total Balance: {totalBalance}</Label>
                      {avatarInfo ? (
                        <Button onClick={personalMint} className="mt-2 bg-green-800 hover:bg-green-600 text-white font-bold py-2 px-6 rounded">
                          Mint Circles
                        </Button>
                      ) : (
                        <Button onClick={handleAvatarCheck} className="mt-2 bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
                          Get your Circles Avatar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg h-full md:col-span-2">
                  <h2 className="text-xl font-bold mb-4">Trust new circles avatar</h2>
                    <ManageTrustAndUntrust
                      avatarInfo={avatarInfo}
                      trustedCircles={trustedCircles}
                      setTrustedCircles={setTrustedCircles}
                      untrustedCircles={untrustedCircles}
                      setUntrustedCircles={setUntrustedCircles}
                      />
                        </div>
                        </>
                    )}
                </main>
            </div>
      </div>             
  );
}


function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
