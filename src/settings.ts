export interface Switch2VSCodeSettings {
    vscodeExecutablePath: string;
    openVaultFolder: boolean;
}

export const DEFAULT_SETTINGS: Switch2VSCodeSettings = {
    vscodeExecutablePath: '/usr/local/bin/code',
    openVaultFolder: false
};