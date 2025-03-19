import { App, Plugin, PluginSettingTab, Setting, FileSystemAdapter, Notice } from 'obsidian';
import { exec } from 'child_process';
import { platform } from 'os';

interface Switch2VSCodeSettings {
    vscodeExecutablePath: string;
    openVaultFolder: boolean;
}

const DEFAULT_SETTINGS: Switch2VSCodeSettings = {
    vscodeExecutablePath: platform() === 'win32' ? 'code.cmd' : '/usr/local/bin/code',
    openVaultFolder: false
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
        // 处理仓库路径，用于同时打开仓库文件夹
        const vaultPathFormatted = vaultPath.replace(/"/g, '\"').replace(/ /g, '\ ');
        
        if (platform() === 'win32') {
            // Windows平台命令构建
            if (this.settings.openVaultFolder) {
                // 同时打开文件和仓库文件夹
                command = `"${this.settings.vscodeExecutablePath}" "${vaultPathFormatted}" "${absolutePath}" --goto ${line}:${column}`;
            } else {
                // 只打开文件
                command = `"${this.settings.vscodeExecutablePath}" "${absolutePath}" --goto ${line}:${column}`;
            }
        } else {
            // macOS 优先使用应用程序路径方式打开
            const defaultVSCodePath = '/Applications/Visual Studio Code.app';
            if (this.settings.vscodeExecutablePath === '/usr/local/bin/code') {
                // 如果设置为默认的'/usr/local/bin/code'命令，先尝试使用命令行方式以支持同时打开文件夹
                if (this.settings.openVaultFolder) {
                    // 同时打开文件和仓库文件夹
                    command = `"${this.settings.vscodeExecutablePath}" "${vaultPathFormatted}" --goto "${absolutePath}:${line}:${column}"`;
                } else {
                    // 只打开文件
                    command = `"${this.settings.vscodeExecutablePath}" --goto "${absolutePath}:${line}:${column}"`
                }
            } else {
                // 使用用户自定义的路径
                if (this.settings.vscodeExecutablePath.endsWith('.app')) {
                    // 使用open -a命令打开应用程序
                    if (this.settings.openVaultFolder) {
                        // 注意：使用open -a命令时，无法同时打开多个文件，所以这里只打开仓库文件夹
                        command = `open -a "${this.settings.vscodeExecutablePath}" "${vaultPathFormatted}"`;
                        // 提示用户使用命令行方式可以同时打开文件和文件夹
                        new Notice('使用应用程序路径方式只能打开仓库文件夹，如需同时打开文件，请使用命令行方式（如：code）');
                    } else {
                        // 只打开文件
                        command = `open -a "${this.settings.vscodeExecutablePath}" "${absolutePath}"`;
                    }
                } else {
                    // 使用命令行方式
                    if (this.settings.openVaultFolder) {
                        // 同时打开文件和仓库文件夹
                        command = `"${this.settings.vscodeExecutablePath}"  "${vaultPathFormatted}" --goto "${absolutePath}:${line}:${column}"`;
                    } else {
                        // 只打开文件
                        command = `"${this.settings.vscodeExecutablePath}"  --goto "${absolutePath}:${line}:${column}"`
                    }
                }
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
            .setName('同时打开仓库文件夹')
            .setDesc('启用后，除了打开当前文件外，还会在VSCode中同时打开整个Obsidian仓库文件夹')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openVaultFolder)
                .onChange(async (value) => {
                    this.plugin.settings.openVaultFolder = value;
                    await this.plugin.saveSettings();
                }));
    }
}