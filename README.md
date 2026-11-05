# XYHSL

两个人的纪念日站点。

## 路由

| 路径 | 内容 |
|---|---|
| `/` | 1000 天互动情书：信封开场、时间线、记忆模块、未来愿望区 |
| `/christmas` | 原来的几何圣诞树页面，保留手势识别与祝福留言 |

两个页面都设置了 `noindex`，不进入搜索引擎索引。

## 开发

```bash
pnpm install
pnpm dev
```

打开 <http://localhost:3000>。

## 内容维护

时间线、未来愿望、照片列表和信件正文集中在 `components/anniversary/data.ts`。
普通时间节点使用 `tone: "memory"`；`tone: "milestone"` 的节点由第 1000 天专属章节呈现。节点的 `navLabel` 用于进度导航，`titleLines` 可控制中文标题断行，`media` 可配置日期卡、照片、贴纸、音频或视频。

以 `2024-02-23` 为第 1 天，第 1000 天是 `2026-11-18`。

## 媒体替换

- 照片：把文件放进 `public/images/`，在 `photoEntries` 中登记路径、真实 `alt` 和图注。
- 音频和视频：在 `timelineEntries` 的对应 `media` 项中填写 `src`，例如 `src: "/media/recording.mp3"`；视频还可设置 `poster`。文件放在 `public/` 后，页面会显示原生播放控件；未配置时只显示文字，不显示播放按钮。
- 《青花瓷》：仅在拥有合适的音频文件及使用权限时，将其路径填入独立的音频项；仓库不包含该歌曲。
- 背景轻音乐：页头控制的是浏览器现场合成的旋律，不是《青花瓷》；点击后才播放，与音视频播放互斥。

## 字体与动效

页面使用本地的 Noto Serif SC 子集，字体许可见 `public/fonts/OFL.txt`。`components/reactbits/` 包含 React Bits 的 `BlurText`、`LightRays`、`Particles` 和 `CircularGallery`；其许可为 MIT + Commons Clause，见同目录的 `LICENSE.md`。`BlurText` 的外层元素由上游的 `p` 调整为 `span`，以便放入标题。
本地适配还包括画廊的就绪/失败回调，以及画廊和粒子组件的 Strict Mode 上下文清理；初始化失败或上下文丢失时保留原生照片。

WebGL 动效仅在合适的桌面视口、支持 WebGL2、对应章节可见且未启用减少动态效果时加载；手机和不支持的环境使用可阅读的 DOM 内容与静态背景。
