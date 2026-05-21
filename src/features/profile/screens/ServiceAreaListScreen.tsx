import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAllServiceAreas } from "../hooks/useProfile";

export const ServiceAreaListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const { data, isLoading, error, refetch, isRefetching } = useAllServiceAreas(page, size);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const assignSelected = () => {
    if (selected.length === 0) {
      Alert.alert("No selection", "Please select at least one service area to assign.");
      return;
    }
    // No assign API provided in spec. Show confirmation for now.
    Alert.alert("Assign Areas", `Assign ${selected.length} area(s) to delivery boy?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => Alert.alert("Assigned", "Selected areas marked as assigned (local only).") },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading service areas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Service Areas</Text>
      </View>

      <FlatList
        data={data?.content || []}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View className="items-center mt-8">
            <Ionicons name="location-outline" size={48} color="#d1d5db" />
            <Text className="mt-4 text-gray-600">No service areas available</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleSelect(item.id)}
            className={`mb-4 bg-white rounded-lg p-4 shadow ${selected.includes(item.id) ? 'border-2 border-blue-500' : 'border border-gray-100'}`}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{item.serviceArea.city.name}</Text>
                <Text className="text-sm text-gray-500">{item.serviceArea.city.state.name} • PIN: {item.serviceArea.pinCode}</Text>
              </View>
              {item.active ? (
                <View className="bg-green-50 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-semibold">Active</Text>
                </View>
              ) : (
                <View className="bg-gray-50 px-3 py-1 rounded-full">
                  <Text className="text-gray-700 text-xs">Inactive</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <View className="p-4 bg-white border-t border-gray-100 flex-row items-center justify-between">
        <View className="flex-row space-x-2">
          <TouchableOpacity disabled={page <= 0} onPress={() => setPage((p) => Math.max(0, p - 1))} className={`px-4 py-2 rounded-lg ${page <= 0 ? 'bg-gray-200' : 'bg-blue-50'}`}>
            <Text className={`${page <= 0 ? 'text-gray-400' : 'text-blue-600'}`}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg bg-blue-50">
            <Text className="text-blue-600">Next</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={assignSelected} className="bg-blue-600 px-4 py-2 rounded-lg">
          <Text className="text-white font-semibold">Assign Selected</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ServiceAreaListScreen;
