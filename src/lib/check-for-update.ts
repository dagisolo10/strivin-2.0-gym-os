import * as Updates from "expo-updates";

export default async function checkForUpdates() {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
    }
}
