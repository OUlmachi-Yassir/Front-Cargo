"use client"

import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from "react-native"
import { getUserConversations } from "~/services/conversation/conversation"
import { getAllUsers } from "~/services/user/profileService"
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"
import { useRouter } from "expo-router"
import { replaceIp } from "~/services/helpers/helpers"

type User = {
  _id: string
  name: string
  images?: string[]
}

type Message = {
  text: string
}

type Conversation = {
  _id: string
  senderId: string
  receiverId: string
  messages?: Message[]
  otherUser?: User
}

type DecodedToken = {
  id: string
}

export default function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [mappedConversations, setMappedConversations] = useState<Conversation[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    setIsRefreshing(true)
    try {
      const userConversations = await getUserConversations()
      const allUsers = await getAllUsers()
      const token = await authService.getToken()

      if (!token) {
        console.error("No token found")
        return
      }

      const decodedToken = jwtDecode(token) as DecodedToken
      const loggedUserId = decodedToken.id

      if (userConversations?.conversations && allUsers) {
        setConversations(userConversations.conversations)
        setUsers(allUsers)

        const mappedData = userConversations.conversations.map((conv: Conversation) => {
          const otherUserId = conv.senderId === loggedUserId ? conv.receiverId : conv.senderId
          const otherUser = allUsers.find((user: User) => user._id === otherUserId)

          return { ...conv, otherUser }
        })

        setMappedConversations(mappedData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const startChat = (receiverId: string) => {
    try {
      router.push({ pathname: "/chats/CampanyChat", params: { id: receiverId } })
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const handleRefresh = () => {
    fetchData()
  }

  if (!mappedConversations.length && !isRefreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text className="text-center text-lg text-gray-500 mt-4">Loading conversations...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-gray-800">Conversations</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isRefreshing}
          className="bg-orange-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-medium">{isRefreshing ? "Refreshing..." : "Refresh"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mappedConversations}
        keyExtractor={(item) => item._id}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          if (!item.otherUser) return null

          const lastMessage = item.messages?.[item.messages.length - 1]?.text || "No messages yet"

          return (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: "#fff",
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                borderLeftWidth: 4,
                borderLeftColor: "#FF8C00",
              }}
              onPress={() => startChat(item.otherUser!._id)}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  marginRight: 16,
                  borderWidth: 2,
                  borderColor: "#FF8C00",
                  padding: 2,
                  backgroundColor: "white",
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{
                    uri: item.otherUser.images?.[0]
                      ? replaceIp(item.otherUser.images[0], process.env.EXPO_PUBLIC_URL)
                      : "https://placeholder.com/50",
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 26,
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-gray-800">{item.otherUser.name}</Text>
                <Text className="text-sm text-gray-500 mt-1" numberOfLines={1} ellipsizeMode="tail">
                  {lastMessage}
                </Text>
              </View>
              <View className="ml-2">
                <View className="bg-orange-100 w-8 h-8 rounded-full items-center justify-center">
                  <Text className="text-orange-600 font-medium">→</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          !isRefreshing ? (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 text-lg">No conversations yet</Text>
              <TouchableOpacity className="mt-4 bg-orange-500 px-6 py-3 rounded-full" onPress={handleRefresh}>
                <Text className="text-white font-medium">Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  )
}

