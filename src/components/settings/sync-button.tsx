import React from "react";
import { ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/interactive";
import { Div, Row, P, H3, Card } from "@/components/ui/display";
import { CloudSync, CheckCircle2, AlertCircle } from "lucide-react-native";

interface SyncProp {
    forceSync: () => Promise<void>;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    lastError: Error | null;
}

export default function ManualSyncButton({ forceSync, isSyncing, lastSyncTime, lastError }: SyncProp) {
    return (
        <Card className="gap-4">
            <Row className="items-center justify-between">
                <Div>
                    <H3 className="text-lg">Data Synchronization</H3>
                    <P className="text-muted-foreground text-sm">Keep your workouts backed up to the cloud.</P>
                </Div>
                <CloudSync size={24} color="#6366f1" />
            </Row>

            <Button onPress={forceSync} disabled={isSyncing} variant={lastError ? "destructive" : "secondary"} component>
                <Row className="gap-2">
                    {isSyncing ? <ActivityIndicator size="small" color="#fff" /> : <CloudSync size={18} color="#fff9e3" />}
                    <P className="text-background font-semibold">{isSyncing ? "Syncing..." : "Sync Now"}</P>
                </Row>
            </Button>

            <Div>
                {lastError ? (
                    <Row className="items-center gap-2">
                        <AlertCircle size={14} color="#ef4444" />
                        <P className="text-destructive text-sm">Failed: {lastError.message}</P>
                    </Row>
                ) : (
                    <Row className="items-center gap-2">
                        <CheckCircle2 size={14} color="#10b981" />
                        <P className="text-muted-foreground text-sm">{lastSyncTime ? `Last synced at ${lastSyncTime.toLocaleTimeString()}` : "Not synced yet"}</P>
                    </Row>
                )}
            </Div>
        </Card>
    );
}
