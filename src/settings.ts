export interface Switch2VSCodeSettings {
    vscodeExecutablePath: string;
    openInNewWindow: boolean;
}

export const DEFAULT_SETTINGS: Switch2VSCodeSettings = {
    vscodeExecutablePath: 'code',
    openInNewWindow: false
};