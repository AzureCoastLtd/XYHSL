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

这是一道共享暗号入口，不是账号系统。纪念日容易被猜到；它不会加密 Git 仓库、客户端静态代码或已下载的素材。若需保护高度敏感资料，应使用更强密码与部署平台的访问控制。

会话边界回归检查：`node --test scripts/letter-access.test.mjs`（Node.js 22.18+）；覆盖错误密码、签名篡改、到期、凭据轮换和缺配置时拒绝开放。

## 内容维护

日期、时间线、未来愿望、照片列表和信件正文集中在 `components/anniversary/data.ts`，该模块标记为 `server-only`。仅由通过会话校验的页面传入交互组件；客户端只能 `import type`，不可直接值导入正文，避免内容进入公开 JavaScript 包。
普通时间节点使用 `tone: "memory"`；`tone: "milestone"` 的节点由第 1000 天专属章节呈现。节点的 `navLabel` 用于进度导航，`titleLines` 可控制中文标题断行，`media` 可配置日期卡、照片、贴纸、音频或视频。

以 `2024-02-23` 为第 1 天，第 1000 天是 `2026-11-18`。

## 媒体替换

- 照片：把原图放进 `public/images/`，在 `photoEntries` 登记 `src`、真实 `alt` 和图注。可另填 `previewSrc` 指向保持比例的轻量预览；当前 9 张使用 `public/images/previews/` 下的 640px 宽 WebP（质量 82）。相册与缩略图使用预览，放大链接仍指向原图；列表和计数共用同份数据。私密图片设为 `unoptimized`，避免不带会话 Cookie 的 Next.js 优化器取源图失败，也避免公开优化缓存。
- 音频和视频：在 `timelineEntries` 的对应 `media` 项中填写 `src`，例如 `src: "/media/recording.mp3"`；视频还可设置 `poster`。文件放在 `public/` 后，页面会显示原生播放控件；未配置时只显示文字，不显示播放按钮。
- 《青花瓷》：仅在拥有合适的音频文件及使用权限时，将其路径填入独立的音频项；仓库不包含该歌曲。
- 背景轻音乐：页头控制的是浏览器现场合成的旋律，不是《青花瓷》；点击后才播放，与音视频播放互斥。

## 字体与动效

页面使用本地的 Noto Serif SC 子集，字体许可见 `public/fonts/OFL.txt`。`components/reactbits/` 包含 React Bits 的 `BlurText`、`LightRays`、`Particles` 和 `CircularGallery`；其许可为 MIT + Commons Clause，见同目录的 `LICENSE.md`。`BlurText` 的外层元素由上游的 `p` 调整为 `span`，以便放入标题。
本地适配还包括画廊的就绪/失败回调，以及画廊和粒子组件的 Strict Mode 上下文清理；初始化失败或上下文丢失时保留原生照片。

WebGL 动效仅在合适的桌面视口、支持 WebGL2、对应章节可见且未启用减少动态效果时加载；手机和不支持的环境使用可阅读的 DOM 内容与静态背景。

时间线正文复用 `effects.tsx` 的 `Reveal`：DOM 默认可见，进入视口时只做一次轻微显现；启用减少动态会取消正在进行的动画。开信结束后焦点进入第一章标题，键盘阅读接着正文继续。

奶茶记忆保留原生 `<details>`；支持 `::details-content`、`interpolate-size` 和离散过渡的浏览器使用 CSS 平滑开合，不支持时保留原生阅读。无需 JavaScript，也不会叠加两套展开动画。
