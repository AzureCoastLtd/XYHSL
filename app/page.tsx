import dayjs from "dayjs";

export default function Home() {
  const firstDate = dayjs("2023-12-24");
  const certainDate = dayjs("2024-02-23");

  return (
    <main className="flex min-h-screen flex-col items-center p-24 text-center">
      <h1 className="mb-10 font-bold text-2xl">{`许永恒 & 何苏霖`}</h1>
      <ul className="space-y-2">
        <li>
          第一次认识: <b>2023 年 12 月 24 日</b> ( 距今
          <b>{dayjs().diff(firstDate, "day")}</b> 天)
        </li>
        <li>
          确定关系: <b>2024 年 2 月 23 日</b> ( 距今
          <b>{dayjs().diff(certainDate, "day")}</b> 天)
        </li>
      </ul>
    </main>
  );
}
