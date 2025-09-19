import React from "react";
import { FlatList, TouchableOpacity, View, Text } from "react-native";

interface TimeSlotListProps {
  onSelectTime: (time: string) => void;
  selectedTime: string;
}

const TimeSlotList: React.FC<TimeSlotListProps> = ({
  onSelectTime,
  selectedTime,
}) => {
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00",
  ];

  const renderTimeSlot = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => onSelectTime(item)}>
      <View
        style={{
          padding: 12,
          margin: 5,
          backgroundColor: item === selectedTime ? "#007AFF" : "white",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: item === selectedTime ? "#007AFF" : "#C6C6C8",
        }}
      >
        <Text
          style={{
            color: item === selectedTime ? "white" : "#000000",
            fontWeight: item === selectedTime ? "bold" : "normal",
          }}
        >
          {item}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={timeSlots}
      renderItem={renderTimeSlot}
      keyExtractor={(item) => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10 }}
    />
  );
};

export default TimeSlotList;