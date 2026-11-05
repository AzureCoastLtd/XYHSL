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

时间线、未来愿望和照片列表集中在 `components/anniversary/data.ts`。
每个时间节点支持：

- `date` / `label` / `title` / `description`
- `tone`：`memory`（普通回忆）或 `milestone`（里程碑）
- `sticker`：可选贴纸文案

新增节点只需在 `timelineEntries` 里追加一项，页面会自动渲染并加入进度条。

## 媒体替换

- 照片：把文件放进 `public/images/`，在 `photoEntries` 中登记，并补充真实 `alt`。
- 《青花瓷》音频：`components/anniversary/AnniversaryExperience.tsx` 的 `AudioSlot` 目前是待替换状态；拿到音频文件后放进 `public/`，把该模块换成 `<audio>` 控件。
- 视频：`VideoSlot` 同样是占位，替换方式与音频一致。
- 背景轻音乐：目前由 `AmbientMusic` 用 Web Audio 现场合成，点击后才播放；如需换成真实曲目，替换该组件内的振荡器逻辑即可。

## 时间线日期

以 `2024-02-23` 为第 1 天，第 1000 天是 `2026-11-18`。
