"use client";

import { X, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../ThemeContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearFavorites: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onClearFavorites,
}: SettingsModalProps) {
  const { settings, updateSettings } = useTheme();

  const fontStyleObj = {
    fontFamily: settings.fontStyle === "serif"
      ? "var(--font-noto-serif-tc), var(--font-noto-serif-sc), serif"
      : "var(--font-noto-sans-tc), var(--font-noto-sans-sc), sans-serif",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 style={fontStyleObj} className="text-xl font-bold text-[var(--text-main)]">
            {settings.lang === "sc" ? "设置" : "設置"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X className="w-6 h-6 text-[var(--text-sub)]" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Appearance */}
          <div className="space-y-3">
            <label style={fontStyleObj} className="text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider">
              {settings.lang === "sc" ? "外观" : "外觀"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", icon: Sun, label: settings.lang === "sc" ? "浅色" : "淺色" },
                { id: "dark", icon: Moon, label: settings.lang === "sc" ? "深色" : "深色" },
                { id: "system", icon: Monitor, label: settings.lang === "sc" ? "跟随系统" : "跟隨系統" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateSettings({ theme: opt.id as any })}
                  style={fontStyleObj}
                  className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${settings.theme === opt.id
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                      : "bg-[var(--background)] text-[var(--text-sub)] border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                >
                  <opt.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Language */}
          <div className="space-y-3">
            <label style={fontStyleObj} className="text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider">
              {settings.lang === "sc" ? "语言" : "語言"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ lang: "sc" })}
                style={{ fontFamily: "var(--font-noto-sans-sc)" }}
                className={`py-3 rounded-xl border transition-all ${settings.lang === "sc"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "bg-[var(--background)] text-[var(--text-sub)] border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                <span className="text-sm font-bold">简体中文</span>
              </button>
              <button
                onClick={() => updateSettings({ lang: "tc" })}
                style={{ fontFamily: "var(--font-noto-serif-tc)" }}
                className={`py-3 rounded-xl border transition-all ${settings.lang === "tc"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "bg-[var(--background)] text-[var(--text-sub)] border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                <span className="text-sm font-bold">繁體中文</span>
              </button>
            </div>
          </div>

          {/* 3. Font Style */}
          <div className="space-y-3">
            <label style={fontStyleObj} className="text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider">
              {settings.lang === "sc" ? "字体" : "字體"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ fontStyle: "serif" })}
                className={`py-3 rounded-xl border transition-all ${settings.fontStyle === "serif"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "bg-[var(--background)] text-[var(--text-sub)] border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                <span className="font-serif text-sm font-bold">
                  {settings.lang === "sc" ? "宋体 (Serif)" : "宋體 (Serif)"}
                </span>
              </button>
              <button
                onClick={() => updateSettings({ fontStyle: "sans" })}
                className={`py-3 rounded-xl border transition-all ${settings.fontStyle === "sans"
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md"
                    : "bg-[var(--background)] text-[var(--text-sub)] border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
              >
                <span className="font-sans text-sm font-bold">
                  {settings.lang === "sc" ? "黑体 (Sans)" : "黑體 (Sans)"}
                </span>
              </button>
            </div>
          </div>

          {/* 4. Font Size (Continuous Slider) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label style={fontStyleObj} className="text-xs font-bold text-[var(--text-sub)] uppercase tracking-wider">
                {settings.lang === "sc" ? "字号" : "字號"}
              </label>
              <span className="text-xs font-medium text-[var(--text-main)] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-sub)]">A</span>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
              <span className="text-lg text-[var(--text-main)]">A</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <p
              style={fontStyleObj}
              className="text-[10px] text-center text-gray-400 leading-relaxed"
            >
              {settings.lang === "sc"
                ? "本网站仅用于新闻聚合展示，所有内容均来源于公开渠道，不代表本站立场。如有侵权请联系删除。"
                : "本網站僅用於新聞聚合展示，所有內容均來源於公開渠道，不代表本站立場。如有侵權請聯繫刪除。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}