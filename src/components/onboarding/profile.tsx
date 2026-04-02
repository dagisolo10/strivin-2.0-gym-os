import { Div, P } from "../ui/view";
import { Button } from "../ui/button";

import { Image } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Controller, useFormContext } from "react-hook-form";

export default function Identity() {
    const { control } = useFormContext();

    const pickImage = async (onChange: (uri: string) => void) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5
        });

        if (!result.canceled) {
            onChange(result.assets[0].uri);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };
    return (
        <Div className="items-center gap-6">
            <Controller
                name="profile"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <Div className="items-center gap-4">
                        <Button onPress={() => pickImage(onChange)} className="size-32 overflow-hidden rounded-full border-2 border-dashed border-zinc-800 bg-zinc-900/50 p-0">
                            {value ? <Image source={{ uri: value }} className="size-full rounded-full" /> : <Ionicons name="camera-outline" size={32} color="#52525b" />}
                        </Button>
                        <P className="text-sm font-medium text-zinc-500">Tap to upload avatar</P>
                    </Div>
                )}
            />

            <P className="text-muted-foreground text-sm">This is how you&apos;ll appear in your stats.</P>
        </Div>
    );
}
