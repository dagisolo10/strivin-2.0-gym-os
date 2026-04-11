import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";

type ConfettiEvent = "perfectDay" | "newStreak" | "newLongestStreak";

const COLORS = ["#FDE047", "#34D399", "#60A5FA", "#F472B6", "#F97316", "#A78BFA"];

function getPieceCount(event: ConfettiEvent) {
    switch (event) {
        case "newLongestStreak":
            return 26;
        case "perfectDay":
            return 22;
        default:
            return 16;
    }
}

function getPieceSize() {
    return 8 + Math.round(Math.random() * 10);
}

function getPieceOffset(width: number) {
    return Math.random() * width * 0.45 * (Math.random() > 0.5 ? 1 : -1);
}

function createPieces(event: ConfettiEvent, width: number) {
    return Array.from({ length: getPieceCount(event) }, (_, index) => {
        const left = Math.random() * width;
        const size = getPieceSize();
        const direction = Math.random() > 0.5 ? 1 : -1;
        return {
            id: `${event}-${index}-${Math.random().toString(36).slice(2)}`,
            left,
            size,
            color: COLORS[index % COLORS.length],
            xOffset: getPieceOffset(width),
            spin: `${direction * (240 + Math.round(Math.random() * 220))}deg`,
            delay: index * 35,
            animatedValue: new Animated.Value(0),
        };
    });
}

interface ConfettiOverlayProps {
    event: ConfettiEvent | null;
    onFinished: () => void;
}

export default function ConfettiOverlay({ event, onFinished }: ConfettiOverlayProps) {
    const { width, height } = useWindowDimensions();
    const pieces = useMemo(() => (event ? createPieces(event, width) : []), [event, width]);
    const onFinishedRef = useRef(onFinished);

    useEffect(() => {
        onFinishedRef.current = onFinished;
    }, [onFinished]);

    useEffect(() => {
        if (!event || pieces.length === 0) return;

        const animations = pieces.map((piece) =>
            Animated.timing(piece.animatedValue, {
                toValue: 1,
                duration: 1400,
                delay: piece.delay,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        );

        Animated.stagger(25, animations).start();
        const timeout = setTimeout(() => onFinishedRef.current(), 1800);

        return () => {
            clearTimeout(timeout);
            pieces.forEach((piece) => piece.animatedValue.stopAnimation());
        };
    }, [event, pieces]);

    if (!event) return null;

    return (
        <View style={styles.overlay} pointerEvents="none">
            {pieces.map((piece) => {
                const translateY = piece.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height * 0.95],
                });
                const translateX = piece.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, piece.xOffset],
                });
                const opacity = piece.animatedValue.interpolate({
                    inputRange: [0, 0.1, 0.9, 1],
                    outputRange: [0, 1, 1, 0],
                });
                const rotate = piece.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", piece.spin],
                });

                return (
                    <Animated.View
                        key={piece.id}
                        style={[
                            styles.piece,
                            {
                                width: piece.size,
                                height: piece.size * 0.35,
                                left: piece.left,
                                backgroundColor: piece.color,
                                opacity,
                                transform: [{ translateY }, { translateX }, { rotate }],
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    piece: {
        position: "absolute",
        borderRadius: 2,
    },
});
