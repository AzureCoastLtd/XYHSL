export type TimelineTone = "memory" | "milestone";

export type PhotoEntry = {
  src: string;
  alt: string;
  caption: string;
};

export type TimelineMedia =
  | { type: "date"; id?: string; date: string; caption: string }
  | { type: "photos"; id?: string; items?: PhotoEntry[] }
  | { type: "sticker"; id?: string; label: string; caption: string; memory?: string }
  | { type: "audio"; id?: string; title: string; note: string; src?: string }
  | { type: "video"; id?: string; title: string; note: string; src?: string; poster?: string }
  | { type: "letter"; id?: string };

export type TimelineEntry = {
  id: string;
  date: string;
  navLabel?: string;
  label: string;
  title: string;
  titleLines?: string[];
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
    navLabel: "相识",
    label: "初次相识",
    title: "故事的第一页，从你开始。",
    titleLines: ["故事的第一页，", "从你开始。"],
    description: "2023 年 12 月 24 日，我们在网络上认识。隔着屏幕的相遇，后来成了我最想珍藏的开头。",
    tone: "memory",
    media: [{ type: "date", date: "2023.12.24", caption: "这一天，我的故事里有了你。" }],
  },
  {
    id: "become-us",
    date: "2024.02.23",
    navLabel: "在一起",
    label: "正式成为我们",
    title: "从那天起，是我们。",
    titleLines: ["从那天起，", "是我们。"],
    description: "2024 年 2 月 23 日，我们正式在一起。这是我们的第一天。照片里留下的每一刻，我都想好好收藏。",
    tone: "memory",
    media: [{ type: "photos" }],
  },
  {
    id: "tea",
    date: "一直记得",
    navLabel: "一杯奶茶",
    label: "一杯奶茶的记忆",
    title: "那杯奶茶，我一直记得。",
    titleLines: ["那杯奶茶，", "我一直记得。"],
    description: "你给我买的那杯霸王茶姬，是故事开始时的一份甜。有些小事，因为是你，就变得很特别。",
    tone: "memory",
    media: [
      {
        type: "sticker",
        label: "霸王茶姬",
        caption: "一杯奶茶，一份被惦记的甜。",
        memory: "你给我买的那杯霸王茶姬，我一直记得。",
      },
    ],
  },
  {
    id: "letter",
    date: "写给你",
    label: "还想慢慢告诉你",
    navLabel: "信里的声音",
    title: "有些喜欢，想慢慢说。",
    titleLines: ["有些喜欢，", "想慢慢说。"],
    description: "把照片留在这里，把想说的话写下来。不是为了数清一起走过多久，只是想让你知道：这些关于你的事，我都放在心上。",
    tone: "memory",
    media: [
      {
        type: "audio",
        title: "有些话，想亲口说给你听。",
        note: "有些话写进了信里，有些话，我想留到见到你的时候再说。",
      },
      {
        type: "video",
        title: "还想和你，留下更多画面。",
        note: "照片把这一刻留下了。故事还在继续，我也还想继续和你同框。",
      },
    ],
  },
  {
    id: "thousand",
    date: "2026.11.18",
    label: "我们的第 1000 天",
    title: "1000 天只是我们的一小部分",
    navLabel: "第1000天",
    titleLines: ["1000 天只是", "我们的一小部分"],
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
    description: "想和你去还没一起看过的地方，把风景也变成我们的回忆。",
  },
  {
    id: "our-place",
    index: "02",
    title: "一起拥有一个家",
    description: "想有一盏为彼此留着的灯，把平常的日子也过成喜欢的样子。",
  },
  {
    id: "proposal",
    index: "03",
    title: "认真向你求婚",
    description: "想在未来的某一天，把那句重要的话，郑重地说给你听。",
  },
  {
    id: "someday",
    index: "04",
    title: "属于我们的婚礼",
    description: "想牵着你的手，把往后的日子交给彼此。不急着写日期，先好好期待。",
  },
];

export const photoEntries: PhotoEntry[] = [
  { src: "/images/1.webp", alt: "花束与粉色气球旁，我们依偎着的合照", caption: "把这一刻收藏" },
  { src: "/images/2.webp", alt: "红灯笼下，我们亲吻的合照", caption: "眼里都是你" },
  { src: "/images/3.webp", alt: "蓝天白云与城市前，我们并肩的合照", caption: "和你站在一起" },
  { src: "/images/4.webp", alt: "夜晚的灯光前，我们靠近彼此的合照", caption: "靠近一点，再近一点" },
  { src: "/images/5.webp", alt: "点点灯光前，我们微笑着的合照", caption: "喜欢这样的我们" },
  { src: "/images/6.webp", alt: "抱着花束，我们相视而笑的合照", caption: "这一刻，刚刚好" },
];

export const letterContent = {
  greeting: "宝宝，",
  paragraphs: [
    "2023 年 12 月 24 日，我们在网络上认识。回头看，我很庆幸，屏幕的另一端是你。",
    "2024 年 2 月 23 日，我们正式在一起。我一直记得这个开始，也认真珍惜着后来的每一天。",
    "你给我买的那杯霸王茶姬，我一直记得。让我舍不得忘掉的，不只是一杯奶茶，还有你的心意。",
    "到了第 1000 天，我想好好告诉你：我很珍惜你。照片里的我们，和这些关于你的小事，我都想慢慢收藏。",
    "1000 天只是我们的一小部分，我们还有无数个 1000 天。以后的故事，我还想和你一起写。",
  ],
  sign: "爱你的我",
  date: "2026.11.18",
};
