'use client'

import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import CirclesSDKContext from "../contexts/CirclesSDK"
import { AvatarRegistration } from './avatarRegisteration'
import { InvitePeoplePopup } from './inviteHumanV2'
import ManageTrustAndUntrust from "./ManageTrustUntrust"
import SendCircles from "./transferCircles"
import PersonalMintComponent from "./personalMint"
import RecipientValidator from "./recipientValidator"
import TrustRelations from "./trustRelations"
import { ethers } from "ethers"

export default function CirclesOnboarding() {
  const {
    sdk,
    setIsConnected,
    isConnected,
    adapter,
    circlesProvider,
    circlesAddress,
    initializeSdk,
  } = useContext(CirclesSDKContext)

  const [avatarInfo, setAvatar] = useState(null)
  const [userBalance, setUserBalance] = useState(0)
  const [mintableAmount, setMintableAmount] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [recipient, setRecipient] = useState("")
  const [recipientIsValid, setRecipientIsValid] = useState(false)
  const [trustedCircles, setTrustedCircles] = useState([])
  const [untrustedCircles, setUntrustedCircles] = useState([])
  const [mappedRelations, setTrustRelations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInvitePopupOpen, setIsInvitePopupOpen] = useState(false)
  const navigate = useNavigate()

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      await initializeSdk()
      await fetchUserBalance()
      setIsConnected(true)
      await handleAvatarCheck()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleInitialization = async () => {
      if (isConnected && sdk && circlesAddress) {
        await handleAvatarCheck()
        await fetchUserBalance()
      }
    }

    handleInitialization()
  }, [isConnected, sdk, circlesAddress])

  const disconnectWallet = () => {
    setIsConnected(false)
    setUserBalance(0)
    setAvatar(null)
  }

  const fetchUserBalance = async () => {
    if (circlesAddress && circlesProvider) {
      try {
        const userBalance = await circlesProvider.getBalance(circlesAddress)
        setUserBalance(ethers.formatEther(userBalance))
      } catch (error) {
        console.error("Error fetching user balance:", error)
      }
    }
  }

  const handleAvatarCheck = async () => {
    try {
      if (!sdk) {
        throw new Error("SDK is not available")
      }

      if (!circlesAddress) {
        throw new Error("Circles address is not available")
      }

      const avatar = await sdk.getAvatar(circlesAddress)
      console.log("Avatar check result:", avatar)

      if (avatar) {
        setAvatar(avatar)
        const mintableAmount = await avatar.getMintableAmount(circlesAddress)
        setMintableAmount(mintableAmount)
        await updateBalance()
      } else {
        console.log("Avatar not found")
        setAvatar(null)
      }
    } catch (error) {
      console.error("Error in handleAvatarCheck:", error)
    }
  }

  const handleRegisterAvatar = async (inviterAddress, name) => {
    setIsLoading(true)
    try {
      const newAvatar = await sdk.acceptInvitation(inviterAddress, { name })
      console.log("Registered as V2 Human:", newAvatar)
      setAvatar(newAvatar)
      await updateBalance()
    } catch (registerError) {
      console.error("Error registering avatar:", registerError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigateToDashboard = () => {
    navigate("/dashboard", { state: { trustRelations: mappedRelations } })
  }

  const updateBalance = async () => {
    if (avatarInfo && circlesAddress) {
      const totalBalance = await avatarInfo.getTotalBalance(circlesAddress)
      setTotalBalance(totalBalance)
    }
  }

  const handleInvitePeople = async (inviteeAddress) => {
    try {
      await avatarInfo.inviteHuman(inviteeAddress)
      console.log(`Invitation sent to ${address}`)
    } catch (error) {
      console.error("Error inviting user:", error)
      throw error
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Welcome to Circles Dev Playground</CardTitle>
          <CardDescription>Connect your wallet to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <Button
              onClick={connectWallet}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">User Balance: {Number(userBalance).toFixed(4)} XDAI</p>
                <div className="space-x-2">
                  <Button
                    onClick={() => setIsInvitePopupOpen(true)}
                    variant="outline"
                  >
                    Invite People
                  </Button>
                  <Button
                    onClick={handleNavigateToDashboard}
                    variant="outline"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={disconnectWallet}
                    variant="destructive"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              </div>
              
              {avatarInfo ? (
                <>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Circles Avatar Info</h2>
                    <div className="flex items-center gap-4">
                      {avatarInfo.image ? (
                        <img
                          src={avatarInfo.image}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div>
                        <Label className="block text-sm font-medium">
                          Address: {avatarInfo.address}
                        </Label>
                        <Label className="block text-sm font-medium">
                          Total Balance: {totalBalance}
                        </Label>
                        <PersonalMintComponent />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Send Circles CRC Token</h2>
                    <div className="space-y-4">
                      <RecipientValidator
                        recipient={recipient}
                        setRecipientIsValid={setRecipientIsValid}
                        recipientIsValid={recipientIsValid}
                        setRecipient={setRecipient}
                      />
                      <SendCircles
                        avatarInfo={avatarInfo}
                        recipient={recipient}
                        updateBalance={updateBalance}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Trust Management</h2>
                    <ManageTrustAndUntrust
                      avatarInfo={avatarInfo}
                      trustedCircles={trustedCircles}
                      setTrustedCircles={setTrustedCircles}
                      untrustedCircles={untrustedCircles}
                      setUntrustedCircles={setUntrustedCircles}
                    />
                    <TrustRelations
                      avatarInfo={avatarInfo}
                      setTrustedCircles={setTrustedCircles}
                      setTrustRelations={setTrustRelations}
                    />
                  </div>
                </>
              ) : (
                <AvatarRegistration onRegisterV2={handleRegisterAvatar} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <InvitePeoplePopup
        isOpen={isInvitePopupOpen}
        onClose={() => setIsInvitePopupOpen(false)}
        onInvite={handleInvitePeople}
      />
    </div>
  )
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