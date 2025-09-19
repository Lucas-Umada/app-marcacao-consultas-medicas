import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export const useProfile = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    user,
    signOut,
    handleEditProfile,
    handleGoBack,
  };
};