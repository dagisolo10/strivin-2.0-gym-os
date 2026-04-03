import React from "react";
import { toast } from "react-native-sonner";
import Toast from "react-native-toast-message";
import { Button } from "@/components/ui/button";
import { ScrollView } from "react-native-gesture-handler";
import { Div, Row, H2, P, Screen } from "@/components/ui/view";

// --- Logic Layer ---
const ToastActions = {
    showStandard: () =>
        Toast.show({
            type: "success",
            text1: "Hello Dagmawi",
            text2: "This is the standard success message 👋",
        }),

    // Sonner Basics
    showDefault: () => toast("Hello World!"),
    showSuccess: () => toast.success("Task Completed!"),
    showWithDescription: () =>
        toast("Exercise Logged", {
            description: "Bench Press added to Friday routine",
        }),

    // Sonner States
    showError: () => toast.error("System Failure"),
    showWarning: () => toast.warning("Check Input"),

    showPromise: () => {
        const promise = new Promise((res) => setTimeout(res, 2000));
        toast.promise(promise, {
            loading: "Syncing with SQLite...",
            success: "Database Updated",
            error: "Sync Failed",
        });
    },

    // Controls
    showSticky: () => toast("Sticky", { duration: Infinity }),
    showLong: () => toast("10 Second Toast", { duration: 10000 }),
    dismissAll: () => toast.dismiss(),
};

// --- UI Layer ---
export default function ToastTestingScreen() {
    return (
        <Screen className="px-6 pt-10">
            <H2 className="mb-4 text-2xl font-bold">Toast Playground</H2>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Div className="gap-6 pb-20">
                    <Div className="gap-3">
                        <P className="text-muted-foreground text-xs font-semibold uppercase">Standard Library</P>

                        <Button onPress={ToastActions.showStandard} variant="outline">
                            Standard Success
                        </Button>
                    </Div>

                    <Div className="gap-3">
                        <P className="text-muted-foreground text-xs font-semibold uppercase">Sonner Basics</P>
                        <Row className="gap-2">
                            <Button className="flex-1" onPress={ToastActions.showDefault}>
                                Default
                            </Button>

                            <Button className="flex-1" variant="primary" onPress={ToastActions.showSuccess}>
                                Success
                            </Button>
                        </Row>

                        <Button variant="outline" onPress={ToastActions.showWithDescription}>
                            With Description
                        </Button>
                    </Div>

                    <Div className="gap-3">
                        <P className="text-muted-foreground text-xs font-semibold uppercase">States & Feedback</P>
                        <Row className="gap-2">
                            <Button className="flex-1" variant="secondary" onPress={ToastActions.showError}>
                                Error
                            </Button>

                            <Button className="flex-1" variant="secondary" onPress={ToastActions.showWarning}>
                                Warning
                            </Button>
                        </Row>

                        <Button variant="outline" onPress={ToastActions.showPromise}>
                            Test Promise (Loading {"->"} Success)
                        </Button>
                    </Div>

                    <Div className="gap-3">
                        <P className="text-muted-foreground text-xs font-semibold uppercase">Duration & Control</P>
                        <Row className="gap-2">
                            <Button className="flex-1" onPress={ToastActions.showSticky}>
                                Sticky
                            </Button>

                            <Button className="flex-1" variant="outline" onPress={ToastActions.dismissAll}>
                                Dismiss All
                            </Button>
                        </Row>

                        <Button onPress={ToastActions.showLong}>Long Duration (10s)</Button>
                    </Div>
                </Div>
            </ScrollView>
        </Screen>
    );
}
