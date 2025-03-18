import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"
import io from "socket.io-client"
import type { RouteProp } from "@react-navigation/native"
import type RootStackParamList from "~/types/types"
import { useLocalSearchParams } from "expo-router"
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"
import { MaterialCommunityIcons } from '@expo/vector-icons';

const socket = io(`${process.env.EXPO_PUBLIC_APP_API_URL}`)

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">

interface Props {
  route: ChatScreenRouteProp
}

const ChatScreen: React.FC<Props> = () => {
  const { id: receiverId } = useLocalSearchParams<{ id: string }>()
  const [messages, setMessages] = useState<{ sender: string; receiverId: string; text: string }[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      const token = await authService.getToken()
      if (!token) throw new Error("No token found")

      const decodedToken: any = jwtDecode(token)
      setLoggedUserId(decodedToken.id)
      const loggedUser = decodedToken.id

      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/conversations/${loggedUser}/${receiverId}`)
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`)
        }

        const textResponse = await response.text()
        if (textResponse.trim() === "") {
          console.log("No messages found")
          setMessages([])
          return
        }

        const data = JSON.parse(textResponse)
        setMessages(data.messages || [])
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()

    socket.emit("joinRoom", { senderId: loggedUserId, receiverId })

    const handleMessage = (newMessage: { senderId: string; receiverId: string; text: string }) => {
      if (
        (newMessage.senderId === loggedUserId && newMessage.receiverId === receiverId) ||
        (newMessage.senderId === receiverId && newMessage.receiverId === loggedUserId)
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: newMessage.senderId, receiverId: newMessage.receiverId, text: newMessage.text },
        ])
      }
    }

    socket.on("receiveMessage", handleMessage)

    return () => {
      socket.off("receiveMessage", handleMessage)
      socket.emit("leaveRoom", { senderId: loggedUserId, receiverId })
    }
  }, [receiverId, loggedUserId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      console.log("Message is empty, not sending.")
      return
    }

    const token = await authService.getToken()
    if (!token) throw new Error("No token found")

    const decodedToken: any = jwtDecode(token)
    const loggedUser = decodedToken.id

    const messageData = {
      senderId: loggedUser,
      receiverId,
      text: newMessage,
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/conversations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) throw new Error("Failed to send message")

      setMessages((prevMessages) => [...prevMessages, { sender: loggedUser, receiverId, text: newMessage }])

      socket.emit("sendMessage", messageData)

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <ScrollView className="flex-1 mb-4" contentContainerStyle={{ paddingVertical: 8 }}>
        {messages.map((msg, index) => (
          <View
            key={index}
            className={`mb-3 max-w-[80%] p-3 rounded-2xl shadow-sm ${
              msg.sender === loggedUserId
                ? "bg-orange-500 self-end rounded-br-sm"
                : "bg-gray-100 self-start rounded-bl-sm"
            }`}
          >
            <Text className={`text-base ${msg.sender === loggedUserId ? "text-white" : "text-gray-800"}`}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
        <TextInput
          className="flex-1 px-3 py-2 text-base text-gray-800"
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Write a message"
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          className="bg-orange-500 px-4 py-2 rounded-full justify-center items-center flex-row"
          onPress={handleSendMessage}
        >
          <MaterialCommunityIcons name="send" size={18} color="white" />
          <Text className="text-white font-medium ml-1">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ChatScreen

