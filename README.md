# Obsidian to VSCode Plugin

这是一个Obsidian插件，允许用户直接从Obsidian跳转到VSCode中编辑当前文件。

## 功能

- 通过命令面板或快捷键在VSCode中打开当前Obsidian文件
- 支持自定义VSCode可执行文件路径
- 支持在新窗口中打开文件
- 支持Windows、macOS和Linux系统

## 安装

### 从Obsidian插件市场安装

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

1. 在Obsidian中打开一个文件
2. 使用命令面板（Ctrl+P或Cmd+P）
3. 搜索「在VSCode中打开当前文件」并执行

## 设置

- **VSCode可执行文件路径**：默认为`code`（Windows下为`code.cmd`），如果VSCode不在系统PATH中，需要设置为完整路径
- **在新窗口中打开**：启用后，将在VSCode的新窗口中打开文件

## 快捷键设置

1. 打开Obsidian设置
2. 进入「快捷键」
3. 搜索「在VSCode中打开当前文件」
4. 设置你喜欢的快捷键组合（推荐：`Ctrl+Alt+V`或`Cmd+Alt+V`）
