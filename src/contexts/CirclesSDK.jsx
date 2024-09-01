import React, { createContext, useState, useEffect, useCallback } from "react";
import { BrowserProviderContractRunner } from "@circles-sdk/adapter-ethers";
import { Sdk } from "@circles-sdk/sdk";

const CirclesSDKContext = createContext(null);

export const CirclesSDK = ({ children }) => {
    const [sdk, setSdk] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [adapter, setAdapter] = useState(null);
    const [circlesProvider, setCirclesProvider] = useState(null);
    const [circlesAddress, setCirclesAddress] = useState(null);

    const chainConfig = {
        pathfinderUrl: 'https://pathfinder.aboutcircles.com',
        circlesRpcUrl: 'https://rpc.helsinki.aboutcircles.com',
        v1HubAddress: '0x29b9a7fbb8995b2423a71cc17cf9810798f6c543',
        v2HubAddress: '0x7bC1F123089Bc1f384b6379d0587968d1CD5830a',
        migrationAddress: '0xEaBa6046103C3A2f5A681fD4323f78C647Fb4292',
        profileServiceUrl: 'https://chiado-pathfinder.aboutcircles.com/profiles/',
        nameRegistryAddress: "0xb95ef3f3e693531d9588815bca954dc8dce30937",
    };

    const initSdk = useCallback(async () => {
        try {
            const adapter = new BrowserProviderContractRunner();
            await adapter.init(); // Initialize the adapter before using it
            setAdapter(adapter); // Set the adapter in the state after initialization

            const circlesProvider = adapter.provider;
            setCirclesProvider(circlesProvider);

            const circlesAddress = await adapter.address;
            setCirclesAddress(circlesAddress);

            const sdk = new Sdk(chainConfig, adapter); // Pass the initialized adapter to the SDK
            setSdk(sdk); // Set the SDK in the state
            setIsConnected(true);
        } catch (error) {
            console.error("Error initializing SDK:", error);
        }
    }, []);

    useEffect(() => {
    }, [initSdk]);

    return (
        <CirclesSDKContext.Provider value={{ sdk, isConnected, adapter, circlesProvider, circlesAddress, initSdk }}>
            {children}
        </CirclesSDKContext.Provider>
    );
};

export default CirclesSDKContext;
