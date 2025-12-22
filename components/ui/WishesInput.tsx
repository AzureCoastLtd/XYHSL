"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useSceneStore, Wish } from "../../stores/sceneStore";
import dayjs from "dayjs";
import {
  X,
  Send,
  Sparkles,
  MessageSquare,
  User,
  PenLine,
  Clock,
} from "lucide-react";

export default function WishesInput() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { addWish, wishes } = useSceneStore();
  const [visibleWishes, setVisibleWishes] = useState<Wish[]>([]);

  // 监听 wishes 变化，更新显示的列表
  useEffect(() => {
    if (wishes.length > 0) {
      const sortedWishes = [...wishes].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setVisibleWishes(sortedWishes.slice(0, 20)); // 显示最近20条
    }
  }, [wishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("wishes")
        .insert([{ name, message }])
        .select();

      if (error) {
        console.error("Error submitting wish:", error);
        const mockWish = {
          id: Date.now(),
          name,
          message,
          created_at: new Date().toISOString(),
        };
        addWish(mockWish);
      } else if (data) {
        addWish(data[0]);
      }

      setName("");
      setMessage("");
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 触发按钮 - 极简悬浮胶囊 */}
      {!isOpen && (
        <div className="absolute bottom-8 right-8 z-50 animate-in fade-in duration-700">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform duration-500" />
            <span className="text-sm font-medium tracking-widest uppercase">
              写下祝福
            </span>
          </button>
        </div>
      )}
      {/* 全屏模态框 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-500">
          <div
            className="w-full max-w-6xl h-[90vh] md:h-[85vh] rounded-3xl backdrop-blur-2xl bg-[#111]/95 border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-30 p-2 rounded-full bg-black/20 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 左侧：展示列表 (Gallery) - 移动端在上 (order-1)，桌面端在左 (order-1) */}
            <div className="flex-1 flex flex-col bg-[#050505]/50 order-1 min-h-0 relative border-b md:border-b-0 md:border-r border-white/10">
              {/* 顶部标题栏 */}
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-end sticky top-0 bg-[#111]/95 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-white font-light text-xl tracking-wide">
                    祝福星河
                  </h3>
                  <p className="text-white/50 text-xs mt-1 font-light">
                    {wishes.length} 颗星辰正在环绕
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-amber-200/50" />
              </div>

              {/* 列表内容 */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar overscroll-contain">
                {visibleWishes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/30">
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4 bg-white/5">
                      <Sparkles className="w-6 h-6 opacity-50" />
                    </div>
                    <p className="text-sm font-light tracking-wide">
                      成为第一个点亮星空的人
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 pb-20 md:pb-0">
                    {visibleWishes.map((wish, idx) => (
                      <div
                        key={wish.id}
                        className="group relative bg-white/3 hover:bg-white/6 border border-white/10 rounded-lg p-3 transition-all duration-300 hover:border-white/20"
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-linear-to-br from-amber-200/10 to-transparent border border-amber-200/20 flex items-center justify-center text-amber-100 text-[10px] font-medium shrink-0">
                              {wish.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white/90 text-xs font-medium tracking-wide truncate max-w-25 md:max-w-37.5">
                              {wish.name}
                            </span>
                          </div>
                          <div className="text-white/30 text-[10px] font-mono shrink-0">
                            {dayjs(wish.created_at).format("MM-DD HH:mm")}
                          </div>
                        </div>

                        <p className="text-white/70 text-xs font-light leading-relaxed pl-8 group-hover:text-white/90 transition-colors duration-300 wrap-break-word">
                          {wish.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：输入区域 (Premium Form) - 移动端在下 (order-2)，桌面端在右 (order-2) */}
            <div className="w-full md:w-100 lg:w-112.5 flex flex-col bg-linear-to-b from-[#1a1a1a] to-[#111] order-2 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none z-20">
              <div className="p-6 md:p-12 flex flex-col h-full justify-center">
                <div className="mb-6 md:mb-10 hidden md:block">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-200/20 to-transparent border border-amber-200/10 flex items-center justify-center mb-6">
                    <PenLine className="w-5 h-5 text-amber-100" />
                  </div>
                  <h2 className="text-3xl font-light text-white mb-2 tracking-tight">
                    送上祝福
                  </h2>
                  <p className="text-white/50 text-sm font-light leading-relaxed">
                    你的祝福将化作星辰，点亮这片数字银河。
                  </p>
                </div>

                {/* 移动端简易标题 */}
                <div className="md:hidden mb-4 flex items-center gap-2 text-amber-100/80">
                  <PenLine className="w-4 h-4" />
                  <span className="text-sm font-medium">写下你的祝福</span>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 md:space-y-8"
                >
                  <div className="group">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 group-focus-within:text-amber-200/70 transition-colors">
                      <User className="w-3 h-3" /> 你的名字
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-white/30 focus:outline-none focus:border-amber-200/50 transition-all font-light text-base md:text-lg"
                      placeholder="请输入名字"
                      maxLength={20}
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 group-focus-within:text-amber-200/70 transition-colors">
                      <MessageSquare className="w-3 h-3" /> 祝福语
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-transparent border-b border-white/20 py-2 text-white placeholder-white/30 focus:outline-none focus:border-amber-200/50 transition-all font-light text-base md:text-lg resize-none min-h-15 md:min-h-25"
                      placeholder="写下美好的祝愿..."
                      maxLength={100}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !message.trim()}
                    className="w-full py-3 md:py-4 mt-2 rounded-xl bg-white text-black font-medium text-sm tracking-wide hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-white/5"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">发送中...</span>
                    ) : (
                      <>
                        <span>发送祝福</span>
                        <Send className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>{" "}
    </>
  );
}
