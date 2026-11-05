export type TimelineTone = "memory" | "milestone";

export type TimelineMedia =
  | { type: "photos" }
  | { type: "sticker"; label: string; caption: string }
  | { type: "ambient" }
  | { type: "audio"; title: string; note: string }
  | { type: "video"; title: string; note: string }
  | { type: "letter" };

export type TimelineEntry = {
  id: string;
  date: string;
  label: string;
  title: string;
  description: string;
  tone: TimelineTone;
  media?: TimelineMedia[];
};

export type FutureEntry = {
  id: string;
  index: string;
  title: string;
  description: string;
};

export const timelineEntries: TimelineEntry[] = [
  {
    id: "first-page",
    date: "2023.12.24",
    label: "THE FIRST PAGE",
    title: "故事从屏幕的一端开始",
    description: "2023 年 12 月 24 日，我们在网络上认识。那时故事还没有名字，但已经悄悄翻开了第一页。",
    tone: "memory",
  },
  {
    id: "become-us",
    date: "2024.02.23",
    label: "BECOMING US",
    title: "从相识，到正式成为我们",
    description: "这一天是第一天。以后每一个值得记住的日子，都可以继续贴进这封信里。",
    tone: "memory",
    media: [{ type: "photos" }],
  },
  {
    id: "tea",
    date: "A SMALL MEMORY",
    label: "THE FIRST STICKER",
    title: "一杯霸王茶姬，也可以成为故事的开头",
    description: "有些回忆不需要很大。一杯奶茶，就足够让时间留下形状。",
    tone: "memory",
    media: [
      { type: "sticker", label: "霸王茶姬", caption: "我们故事的第一杯" },
      { type: "ambient" },
    ],
  },
  {
    id: "letter",
    date: "A LETTER IN MOTION",
    label: "FOR YOU",
    title: "这封信不只写在纸上",
    description: "图片、声音、视频和没有说完的话，会沿着时间线慢慢出现。",
    tone: "memory",
    media: [
      { type: "audio", title: "《青花瓷》", note: "音频文件准备好后，可以在这里点击播放。" },
      { type: "video", title: "视频回忆插槽", note: "等你把某一段动态回忆放进这封信。" },
    ],
  },
  {
    id: "thousand",
    date: "DAY 1000",
    label: "THE NEXT PAGE",
    title: "1000 天只是我们的一小部分",
    description: "我们还有无数个 1000 天。",
    tone: "milestone",
    media: [{ type: "letter" }],
  },
];

export const futureEntries: FutureEntry[] = [
  {
    id: "next-trip",
    index: "01",
    title: "下一次旅行",
    description: "去一个还没有一起看过的地方。",
  },
  {
    id: "our-place",
    index: "02",
    title: "一起拥有一个家",
    description: "把生活里细小的东西，也慢慢放在同一个空间里。",
  },
  {
    id: "someday",
    index: "03",
    title: "未来某一天的婚礼",
    description: "不写日期，只把期待留在这里。",
  },
  {
    id: "more-thousands",
    index: "∞",
    title: "还有无数个 1000 天",
    description: "这封信的下一页，等我们一起继续写。",
  },
];

export const photoEntries = [
  { src: "/images/1.webp", alt: "照片 1，待补充说明" },
  { src: "/images/2.webp", alt: "照片 2，待补充说明" },
  { src: "/images/3.webp", alt: "照片 3，待补充说明" },
  { src: "/images/4.webp", alt: "照片 4，待补充说明" },
  { src: "/images/5.webp", alt: "照片 5，待补充说明" },
  { src: "/images/6.webp", alt: "照片 6，待补充说明" },
];

export const letterContent = {
  greeting: "宝宝，",
  opening: "这封信写在纸上，而我们的故事藏在这里。",
  promise: "1000 天只是我们的一小部分，",
  promiseLine: "我们还有无数个 1000 天。",
  sign: "— 待你继续写下去",
};
