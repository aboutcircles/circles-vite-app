import React, { createContext, useState, useEffect } from "react";
import { BrowserProviderContractRunner } from "@circles-sdk/adapter-ethers";
import { Sdk } from "@circles-sdk/sdk";

const CirclesSDKContext = createContext(null);

export const CirclesSDKProvider = ({ children }) => {
    const [sdk, setSdk] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [circlesAddress, setCirclesAddress] = useState("");
    const [adapter, setAdapter] = useState(null);

    const chainConfig = {
        circlesRpcUrl: 'https://rpc.helsinki.aboutcircles.com',
        pathfinderUrl: 'https://pathfinder.aboutcircles.com',
        v1HubAddress: "0x29b9a7fBb8995b2423a71cC17cf9810798F6C543",
        v2HubAddress: "0x",
        migrationAddress: "0x",
    };

    adapter = new BrowserProviderContractRunner();

    useEffect(() => {
        const initSdk = async () => {
            try {
                await adapter.init();
                setAdapter(adapter);
                const sdk = new Sdk(chainConfig, adapter);
            
                const circlesAddress = await adapter.getAddress(); 

                setSdk(sdk);
                setCirclesAddress(circlesAddress);
                setIsConnected(true);
            } catch (error) {
                console.error("Error initializing SDK:", error);
            }
        };

        initSdk();
    }, []);

    return (
        <CirclesSDKContext.Provider value={{ sdk, isConnected, circlesAddress, adapter }}>
            {children} 
        </CirclesSDKContext.Provider>
    );
};

export default CirclesSDKContext;
