# Obsidian to VSCode Plugin

这是一个Obsidian插件，让你能够在Obsidian和VSCode之间无缝切换。当你需要使用VSCode的强大功能（如Git集成、代码补全、调试等）来编辑Markdown文件时，只需一个快捷键即可实现编辑器之间的快速切换。

## 主要功能

- 支持两种打开方式：
  - 仅打开当前文件（Cmd+Alt+B）
  - 同时打开文件和仓库文件夹（Cmd+Alt+F），方便使用Git等功能
- 保留光标位置：切换到VSCode时自动定位到Obsidian中的光标位置
- 支持自定义VSCode可执行文件路径，兼容各种安装方式
- 跨平台支持：完美支持Windows、macOS和Linux系统

## 使用场景

- 需要使用VSCode的Git功能进行版本控制
- 想要使用VSCode的扩展功能（如代码补全、格式化等）
- 需要在终端中执行命令或运行脚本
- 进行多文件批量编辑或搜索

## 安装方法

### 从Obsidian插件市场安装（推荐）

1. 打开Obsidian设置
2. 进入「第三方插件」
3. 关闭「安全模式」
4. 点击「浏览」
5. 搜索「Switch to VSCode」并安装

### 手动安装

1. 下载最新版本的发布包
2. 解压到你的Obsidian库的`.obsidian/plugins/`目录下
3. 重启Obsidian
4. 在设置中启用插件

## 使用方法

### 方式一：使用快捷键（推荐）

- `Cmd+Alt+B`（macOS）或`Ctrl+Alt+B`（Windows/Linux）：仅在VSCode中打开当前文件
- `Cmd+Alt+F`（macOS）或`Ctrl+Alt+F`（Windows/Linux）：在VSCode中同时打开当前文件和仓库文件夹

### 方式二：使用命令面板

1. 打开命令面板（`Cmd+P`或`Ctrl+P`）
2. 输入「VSCode」
3. 选择相应的命令执行

## 插件设置

- **VSCode可执行文件路径**：
  - Windows默认值：`code.cmd`
  - macOS/Linux默认值：`code`
  - 如果VSCode不在系统PATH中，需要设置为完整路径（如：`/Applications/Visual Studio Code.app`）

## 常见问题

- **VSCode打开失败**：请检查VSCode可执行文件路径是否正确设置
- **找不到文件**：确保Obsidian库路径不包含特殊字符
- **光标位置不正确**：仅支持Markdown文件的光标位置同步
