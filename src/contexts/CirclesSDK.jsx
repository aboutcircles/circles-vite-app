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
        circlesRpcUrl: 'https://rpc.helsinki.aboutcircles.com',
        pathfinderUrl: 'https://pathfinder.aboutcircles.com',
        v1HubAddress: "0x29b9a7fBb8995b2423a71cC17cf9810798F6C543",
        v2HubAddress: "0x",
        migrationAddress: "0x",
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
        initSdk(); // Initialize SDK on component mount
    }, [initSdk]);

    return (
        <CirclesSDKContext.Provider value={{ sdk, isConnected, adapter, circlesProvider, circlesAddress, initSdk }}>
            {children}
        </CirclesSDKContext.Provider>
    );
};

export default CirclesSDKContext;
