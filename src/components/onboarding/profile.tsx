import { Button } from "../ui/button";
import { Badge, Card, Div, P } from "../ui/view";

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
        <Card className="bg-muted/50 items-center gap-5 rounded-[28px] border-0 px-5 py-6">
            <Badge variant="outline">Avatar</Badge>
            <Controller
                name="profile"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Div className="items-center gap-4">
                        <Button onPress={() => pickImage(onChange)} className="border-border bg-background size-36 overflow-hidden rounded-full border-2 border-dashed p-0">
                            {value ? <Image source={{ uri: value }} className="size-full rounded-full" /> : <Ionicons name="camera-outline" size={32} color="#527bda" />}
                        </Button>
                        <P>Tap to upload a profile photo</P>
                        <P className="text-muted-foreground text-center text-sm">Optional, but it makes the app feel like yours right away.</P>
                    </Div>
                )}
            />
        </Card>
    );
}
