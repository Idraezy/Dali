import { Image, View, type StyleProp, type ImageStyle, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

interface ProductImageProps {
  uri: string | null;
  style?: StyleProp<ImageStyle>;
}

export default function ProductImage({ uri, style }: ProductImageProps) {
  if (!uri) {
    return (
      <View
        style={[
          { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
          style as StyleProp<ViewStyle>,
        ]}
      >
        <Ionicons name="image-outline" size={28} color="#4B5563" />
      </View>
    );
  }

  return <Image source={{ uri }} style={style} resizeMode="cover" />;
}
