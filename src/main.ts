import { App, Plugin, PluginSettingTab, Setting, FileSystemAdapter, Notice } from 'obsidian';
import { exec } from 'child_process';
import { platform } from 'os';

interface Switch2VSCodeSettings {
    vscodeExecutablePath: string;
    openInNewWindow: boolean;
}

const DEFAULT_SETTINGS: Switch2VSCodeSettings = {
    vscodeExecutablePath: platform() === 'win32' ? 'code.cmd' : 'code',
    openInNewWindow: false
};

export default class Switch2VSCodePlugin extends Plugin {
    settings: Switch2VSCodeSettings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();

        // 添加命令到命令面板
        this.addCommand({
            id: 'open-in-vscode',
            name: '在VSCode中打开当前文件',
            callback: () => this.openInVSCode(),
            hotkeys: [
                {
                    modifiers: ['Mod', 'Alt'],
                    key: 'B'
                }
            ]
        });

        // 添加设置选项卡
        this.addSettingTab(new Switch2VSCodeSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async openInVSCode() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('未找到活动文件');
            return;
        }

        // 获取当前光标位置
        const cursor = this.app.workspace.activeLeaf?.view?.getViewType() === 'markdown' 
            ? (this.app.workspace.activeLeaf.view as any).editor?.getCursor()
            : null;
        const line = cursor ? cursor.line + 1 : 1;
        const column = cursor ? cursor.ch + 1 : 1;

        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof FileSystemAdapter)) {
            new Notice('无法获取 Vault 路径');
            console.error('Adapter 不是 FileSystemAdapter');
            return;
        }

        const vaultPath = adapter.getBasePath();
        const filePath = activeFile.path;
        // 处理路径中的特殊字符（如空格）
        const absolutePath = `${vaultPath}/${filePath}`.replace(/"/g, '\\"').replace(/ /g, '\\ ');

        // 根据平台构建命令
        let command: string;
        if (platform() === 'win32') {
            command = `"${this.settings.vscodeExecutablePath}" ${this.settings.openInNewWindow ? '--new-window' : ''} "${absolutePath}" --goto ${line}:${column}`;
        } else {
            // macOS 优先使用应用程序路径方式打开
            const defaultVSCodePath = '/Applications/Visual Studio Code.app';
            if (this.settings.vscodeExecutablePath === 'code') {
                // 如果设置为默认的'code'命令，先尝试使用应用程序路径
                command = `open -a "${defaultVSCodePath}" ${this.settings.openInNewWindow ? '-n' : ''} "${absolutePath}"`;
            } else {
                // 使用用户自定义的路径
                command = this.settings.vscodeExecutablePath.endsWith('.app')
                    ? `open -a "${this.settings.vscodeExecutablePath}" ${this.settings.openInNewWindow ? '-n' : ''} "${absolutePath}"`
                    : `"${this.settings.vscodeExecutablePath}" ${this.settings.openInNewWindow ? '-n' : ''} "${absolutePath}" --goto ${line}:${column}`;
            }
        }

        // 执行命令并提供用户反馈
        exec(command, (error) => {
            if (error) {
                let errorMessage = '无法打开 VSCode，';
                if (platform() !== 'win32' && this.settings.vscodeExecutablePath === 'code') {
                    errorMessage += '请在设置中指定VSCode应用程序路径（例如：/Applications/Visual Studio Code.app）';
                } else {
                    errorMessage += '请检查VSCode路径设置是否正确';
                }
                new Notice(errorMessage);
                console.error('打开 VSCode 失败:', error);
            } else {
                new Notice('已在 VSCode 中打开文件');
            }
        });
    }
}

class Switch2VSCodeSettingTab extends PluginSettingTab {
    plugin: Switch2VSCodePlugin;

    constructor(app: App, plugin: Switch2VSCodePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('VSCode 可执行文件路径')
            .setDesc('输入 VSCode 可执行文件的路径或命令（Windows 默认: code.cmd; macOS/Linux 默认: code）')
            .addText(text => text
                .setPlaceholder('例如: code 或 /Applications/Visual Studio Code.app')
                .setValue(this.plugin.settings.vscodeExecutablePath)
                .onChange(async (value) => {
                    this.plugin.settings.vscodeExecutablePath = value.trim();
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('在新窗口中打开')
            .setDesc('启用后，文件将在新的 VSCode 窗口中打开')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openInNewWindow)
                .onChange(async (value) => {
                    this.plugin.settings.openInNewWindow = value;
                    await this.plugin.saveSettings();
                }));
    }
}