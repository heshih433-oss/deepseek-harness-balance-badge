# 账户余额栏（@heshih433-oss/dsh-balance-badge）

在 DeepSeek Harness Web 界面底部增加一条常驻的账户余额栏，显示当前登录账号的可用余额、赠送额度、最近刷新时间，并每 15 秒自动刷新一次。

仓库名：`deepseek-harness-balance-badge`

> **安装时注意**：本插件的包名是 `@heshih433-oss/dsh-balance-badge`。npm 上已有一个同名旧包 `dsh-balance-badge`（作者 eatone），它是在右下角显示余额的另一个插件；不要在插件页按 `dsh-balance-badge` 安装，否则装到的是那个旧包。

## 效果

```text
● 余额  ¥12.34  · 赠送 ¥1.00                              更新于 13:04:28  ↻
```

- 页面可见时每 15 秒刷新；页面隐藏时暂停，切回页面或窗口重新获得焦点会立即刷新。
- 右下角 `↻` 可手动刷新，刷新期间图标旋转。
- 未登录时显示“未登录”；余额读取失败时显示“余额读取失败”和“重试”。
- 金额格式与“设置 → 账户”一致：两位小数、千分位、正数向下取到分、不足 ¥0.01 显示 `<¥0.01`。
- 使用 Harness 现有账户登录态，不读取、不保存任何 token。

## 安装

### 方式一：插件页安装（推荐）

1. 打开侧边栏 **插件（Plugins）**。
2. 如果之前装过 npm 上的 `dsh-balance-badge`，先卸载它，避免出现两条余额栏。
3. 点击 **添加插件（Add plugin）**。
4. 填入 GitHub 仓库地址：

   ```text
   https://github.com/heshih433-oss/deepseek-harness-balance-badge
   ```

   也可以填 `github:heshih433-oss/deepseek-harness-balance-badge`，或本仓库目录的绝对路径（本地开发时）。
5. 安装完成后点击 **立即启用（Enable now）**。

> 不要填 `dsh-balance-badge` 或 `@heshih433-oss/dsh-balance-badge`：前者会装到 npm 上别人的旧包；后者目前没有发布到 npm，按名字安装会失败。

### 方式二：写入 desktop profile

把本目录复制到 profile 的 `node_modules/@heshih433-oss/dsh-balance-badge`，并在 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 中追加 `@heshih433-oss/dsh-balance-badge`，然后让配置热重载（或重启应用）。

## 配置

刷新间隔写在 `lib/client.js` 的 `REFRESH_INTERVAL_MS`，默认 `15000` 毫秒。修改后需要让插件重新加载（在插件页关闭再开启，或重启应用）。

## 实现说明

- 纯客户端插件：`lib/index.js` 只是 Host 侧的占位入口。
- 界面注册在 `shell.bottom` 槽位，因此出现在整个窗口底部、三栏之下。
- 余额通过客户端 Remote 命名空间 `account.getBalance` 读取，参数带上当前 UI 语言、时区和构建版本。
- 账户接口返回 `null` 表示未登录；返回 `{ status: "ready", value, bonusWallets }` 时渲染余额；`{ status: "failed" }` 或请求异常时显示失败状态。
- 不新增 Host 服务、工具或模型提示词，不影响模型请求。

## 目录结构

```text
dsh-balance-badge/
├── package.json          # 插件清单与 dsh.bundle / dsh.client 声明
├── cordis.patch.yml      # 把插件挂到 Loader
├── lib/
│   ├── index.js          # Host 侧占位入口
│   └── client.js         # 余额栏界面与轮询逻辑
└── README.md
```

## 兼容性

- 目标版本：DeepSeek Harness 0.2.2-rc.1。
- 依赖的客户端服务：`slots`、`locale`、`remote`、`remote.account`。
- 如果后续版本改了账户 Remote 的返回值或 `shell.bottom` 槽位，需要相应调整。

## License

MIT
