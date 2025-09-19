import React from "react";
import { FlatList, TouchableOpacity, Image, View, Text } from "react-native";
import { Doctor } from "../models/doctor";

interface DoctorListProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDoctorId?: string;
}

const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  onSelectDoctor,
  selectedDoctorId,
}) => {
  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity onPress={() => onSelectDoctor(item)}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 15,
          margin: 5,
          backgroundColor: item.id === selectedDoctorId ? "#e3f2fd" : "white",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: item.id === selectedDoctorId ? "#007AFF" : "#C6C6C8",
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 15 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000000" }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 14, color: "#FF9500" }}>{item.specialty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={doctors}
      renderItem={renderDoctorItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default DoctorList;