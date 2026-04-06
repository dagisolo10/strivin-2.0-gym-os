import { Button } from "../ui/interactive";
import { Badge, Card, Div, H3, P } from "../ui/display";

import { Image } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Controller, useFormContext } from "react-hook-form";

export default function Profile() {
    const { control } = useFormContext();

    const pickImage = async (onChange: (uri: string) => void) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                onChange(result.assets[0].uri);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        } catch (error) {
            console.error("Failed to pick image:", error);
        }
    };

    return (
        <Card className="items-center gap-4 rounded-4xl p-8">
            <Badge variant="outline">Avatar</Badge>
            <Controller
                name="profile"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Div className="items-center gap-4">
                        <Button onPress={() => pickImage(onChange)} className="border-border bg-background size-36 overflow-hidden rounded-full border-2 border-dashed p-0">
                            {value ? <Image source={{ uri: value }} className="size-full rounded-full" /> : <Ionicons name="camera-outline" size={32} color="#527bda" />}
                        </Button>
                        <H3>Tap to upload a profile photo</H3>
                        <P className="text-muted-foreground text-center">Optional, but it makes the app feel like yours right away.</P>
                    </Div>
                )}
            />
        </Card>
    );
}
