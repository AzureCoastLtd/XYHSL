# XYHSL

两个人的纪念日站点。

## 路由

| 路径 | 内容 |
|---|---|
| `/unlock` | 与信纸主题一致的暗号入口，支持原生表单与无 JavaScript 提交 |
| `/` | 1000 天互动情书：信封开场、时间线、记忆模块、未来愿望区 |
| `/christmas` | 原来的几何圣诞树页面，保留手势识别与祝福留言 |

所有页面都设置了 `noindex`。访问情书或圣诞树前必须先通过服务端暗号验证。

## 开发

先在未跟踪的 `.env.local` 中设置 `LETTER_PASSWORD`（8 位数字）和 `LETTER_SESSION_SECRET`（至少 32 字节的随机密钥）。可用 `node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))'` 生成密钥。不要加 `NEXT_PUBLIC_` 前缀，也不要提交这两个值。部署时在平台的服务端环境变量中设置同名配置；缺失时入口保持关闭。

```bash
pnpm install
pnpm dev
```

打开 <http://localhost:3000>。

## 暗号与访问保护

`app/api/unlock/route.ts` 验证原生表单并设置 HttpOnly、SameSite=Lax 浏览器会话 Cookie；HTTPS 请求使用 Secure。会话签名最长有效 12 小时，刷新页面无需重复输入；改动密码或密钥会使旧会话失效。密码不会写入 URL、客户端代码或 localStorage。

`proxy.ts` 拦截未授权的页面与媒体请求；情书页面和圣诞树布局在渲染前再次验证。照片原图、轻量预览和图片优化路径也受保护，响应不进入公开缓存。字体与框架静态资源仍可正常加载。

来源校验与跳转地址由请求的 HTTP `Host`（含端口）和协议构造，不使用 `0.0.0.0` 等内部监听地址，也不盲信 `X-Forwarded-Host`。反向代理应保留浏览器访问的 `Host`。

这是一道共享暗号入口，不是账号系统。纪念日容易被猜到；它不会加密 Git 仓库、客户端静态代码或已下载的素材。若需保护高度敏感资料，应使用更强密码与部署平台的访问控制。

会话边界回归检查：`node --test scripts/letter-access.test.mjs`（Node.js 22.18+）；覆盖错误密码、签名篡改、到期、凭据轮换和缺配置时拒绝开放。

提交链路回归必须覆盖正式监听方式：先构建并运行 `pnpm start --hostname 0.0.0.0 --port 3124`，再在另一终端运行 `node --env-file=.env.local --test scripts/letter-access-http.test.mjs`。用 `LETTER_TEST_URL` 指定其他实际访问地址（如 `http://127.0.0.1:3124` 或本机局域网地址），检查来源校验、错误暗号、正确跳转和跨站拒绝；不要只在绑定回环地址的临时服务上验收。

## 内容维护

完整内容保存在未跟踪的 `.private/content.json`，类型和服务端读取入口位于 `components/anniversary/data.ts`。该模块保持 `server-only`；首页先验证会话，再读取 JSON 并传入交互组件。客户端只能 `import type`，不可值导入正文或把私有 JSON 导入构建，避免内容进入公开 JavaScript 或 Git 历史。

`timelineEntries` 的顶层节点代表章节，`moments` 代表章节内的短日期回忆；进度导航只生成顶层章节和未来愿望入口。`tone: "milestone"` 的节点由第 1000 天专属章节呈现；`navLabel` 控制导航文字，`titleLines` 控制标题断行。照片日期与事件日期分开处理，没有明确拍摄日的日常相册不补写年月。

纪念日期由私有 `anniversaryDates` 配置；本次按约定在 `2026-11-19` 庆祝第 1000 天，信件落款和里程碑条目保持同一日期，不用日期推算覆盖双方确认的展示日期。

## 媒体替换

- 精选处理后的照片放在未跟踪的 `.private/media/`，不放入 `public/` 或公开仓库。`.private` 使用工作区内的真实目录，避免 Turbopack 拒绝指向构建根目录之外的符号链接；原始素材另行保留，不由站点直接提供。部署前必须单独提供私有 JSON 和媒体目录，仅拉取源码不能恢复私人内容。
- 照片的 `src` 与 `previewSrc` 使用 `/api/memories/<名称>.webp`；短歌曲选段使用同一路由下的 `<名称>.mp3`。路由再次验证会话，只接受小写字母、数字和连字符构成的 WebP/MP3 文件名，分别返回 `image/webp`、`audio/mpeg`，缓存策略均为 `private, no-store`。照片按素材授权选择清晰版或脱敏版，并去掉 EXIF/GPS；如需隐藏信息，必须处理实际图片副本，不能只用 CSS 遮挡。私人照片、正文和歌曲文件均不提交公开仓库。
- `photos` 使用原生横滑相册；仅显式设置 `gallery: true` 的一处精选相册启用弧形 WebGL 增强。`print` 保留原图比例，可通过 `expandable: true` 使用原生纸页展开。所有私有图片使用 `unoptimized`，避免无会话的优化器取图失败或公开优化缓存。
- 情书图片和含图链接禁止原生选中、图片拖拽和 iOS 长按呼出；规则只作用于图片交互，正文仍可选择。不要阻止 `touchstart` / `touchmove`，以保留相册横滑、页面滚动和正常点击放大。
- 奶茶贴纸的 `image` 使用真实杯装图片；可选 `audio` 仅在已有音频时提供 `{ src, title }`，只使用实际存在且获准使用的完整选段，不用合成旋律冒充原曲。配置选段后，点击贴纸展开并播放，收起时暂停；选段播放或暂停可使用纸签上的独立按钮。未提供音频时只展开回忆，不显示无效的播放入口。音频使用 `preload="none"`，打开页面不会自行播放或预先加载歌曲。
- 页头轻音乐仍是点击后现场合成的独立旋律。带 `data-resume-ambient` 的选段播放时，只有原先启用的轻音乐会暂时挂起；选段结束、停止或失败后恢复。原先关闭则保持关闭；播放期间手动关闭轻音乐会取消自动恢复。其他音视频仍维持原有互斥播放规则。

## 字体与动效

页面使用本地的 Noto Serif SC 子集，字体许可见 `public/fonts/OFL.txt`。`components/reactbits/` 包含 React Bits 的 `BlurText`、`LightRays`、`Particles` 和 `CircularGallery`；其许可为 MIT + Commons Clause，见同目录的 `LICENSE.md`。`BlurText` 的外层元素由上游的 `p` 调整为 `span`，以便放入标题。
本地适配还包括画廊的就绪/失败回调，以及画廊和粒子组件的 Strict Mode 上下文清理；初始化失败或上下文丢失时保留原生照片。

WebGL 动效仅在合适的桌面视口、支持 WebGL2、对应章节可见且未启用减少动态效果时加载；手机和不支持的环境使用可阅读的 DOM 内容与静态背景。

时间线正文复用 `effects.tsx` 的 `Reveal`：DOM 默认可见，进入视口时只做一次轻微显现；启用减少动态会取消正在进行的动画。开信结束后焦点进入第一章标题，键盘阅读接着正文继续。

奶茶记忆保留原生 `<details>`；支持 `::details-content`、`interpolate-size` 和离散过渡的浏览器使用 CSS 平滑开合，不支持时保留原生阅读。展开阅读无需 JavaScript；点击点歌与播放状态协调需要 JavaScript，不会叠加两套展开动画。
