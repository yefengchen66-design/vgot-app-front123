import { uploadSuperIpAudio } from "./lib/superIpAudioUpload";
import React, { useState, useEffect, useRef, useMemo, useContext } from "react";

// Stable <img> that won’t remount when SuperIpView rerenders.
// Defining this at module scope avoids recreating the memo component each render,
// which can otherwise still cause image flicker.
const StableImage = React.memo(
  ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} draggable={false} />
  ),
);

// Compact bidirectional "switch" icon (matches the two-opposed-arrows style from the reference image).
const SwitchIcon = ({ size = 14, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M3 7h14l-3-3M21 17H7l3 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
import { api } from "./lib/api";
import {
  Check,
  ChevronDown,
  Trash2,
  LayoutGrid,
  History,
  User,
  Video,
  Menu,
  Zap,
  Image as ImageIcon,
  Wand2,
  Upload,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  X,
  Clock,
  Filter,
  CheckCircle2,
  Users,
  CreditCard,
  BarChart3,
  HelpCircle,
  TrendingUp,
  Download,
  ChevronLeft,
  Settings,
  MessageSquare,
  Bot,
  Link,
  FileText,
  Film,
  PenTool,
  Send,
  ArrowLeftRight,
  RefreshCcw,
  RefreshCw,
  Lock,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { hypersellQueue } from "./lib/concurrencyQueue";

// --- Internationalization ---
export type LangKey = "en" | "zh" | "zh-TW" | "ja" | "es";

export const translations: Record<LangKey, Record<string, string>> = {
  en: {
    "nav.workspace": "Workspace",
    "nav.scripts": "Scripts",
    "nav.hypersell": "HyperSell",
    "nav.superip": "Super IP",
    "nav.history": "History",
    "history.loading": "Loading...",
    "history.empty": "No history",
    "video_insights.input.script": "ORIGINAL SCRIPT",
    "video_insights.input.visual": "REFERENCE VISUAL (OPTIONAL)",
    "video_insights.placeholder.script": "Input product information...",
    "video_insights.upload.image_btn": "Upload Image",
    "video_insights.upload.drag_drop": "Drag & drop or click to upload",
    "video_insights.upload.or_paste": "OR PASTE LINK",
    "video_insights.status.processing": "Processing...",
    "video_insights.btn.rewrite": "Rewrite Script",
    "video_insights.btn.analyze": "Analyze Video",
    "video_insights.limit_reached": "You have reached today's free limit for this mode. Upgrade to continue.",
    "hypersell.status.waiting": "WAITING",
    "hypersell.status.masterpiece": "YOUR MASTERPIECE WILL APPEAR HERE",
    "hypersell.btn.generate": "Generate",
    "hypersell.btn.at_capacity": "At capacity",
    "hypersell.btn.login_required": "Login required",
    "hypersell.btn.credits": "credits",
    "hypersell.btn.free": "Free",
    "hypersell.btn.unsupported": "Not supported",
    "hypersell.btn.insufficient": "Insufficient credits",
    "workspace.title": "Workspace",
    "workspace.welcome": "Welcome back, ",
    "workspace.welcome_guest": "Welcome to VGOT, log in to start creation.",
    "workspace.projects": "Projects",
    "workspace.quick_actions": "Quick Actions",
    "workspace.action.analyze": "Analyze Video",
    "workspace.action.analyze_desc": "Get script inspiration quickly, chat to explore more creativity",
    "workspace.action.generate": "Generate Video",
    "workspace.action.generate_desc": "Generate video, create amazing works",
    "workspace.action.superip": "Super IP",
    "workspace.action.superip_desc": "Create your exclusive digital character",
    "superip.panel.upload_char": "Upload Character",
    "superip.panel.upload_audio": "Upload Audio",
    "superip.panel.video_gen": "Video Gen",
    "superip.panel.open_gallery": "Open Gallery",
    "superip.panel.uploading": "Uploading...",
    "nav.profile": "Profile",
    "profile.title": "Profile",
    "profile.membership": "User Credits",
    "profile.credits_left": "credits left",
    "profile.upgrade": "Upgrade Plan",
    "profile.menu.partner": "Partner Program",
    "profile.menu.billing": "Billing & Plans",
    "profile.menu.usage": "Credits Usage",
    "profile.login_desc": "Not logged in, log in to view profile and settings",
    "profile.top_up": "TOP UP",
    "profile.settings_header": "SETTINGS",
    "profile.settings.language": "Language",
    "profile.settings.theme": "Theme",
    "profile.logout": "Log Out",
    "profile.version": "Version",
    "modal.language.title": "Select Language",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.login": "Log In",
    "common.clear": "Clear",
    "common.copy": "Copy",
    "common.result": "RESULT",
    "common.back": "BACK",
    "common.next_step": "NEXT STEP",
    "common.start_new": "START NEW",
    "history.title": "HISTORY",
    "history.filter.all": "ALL",
    "history.filter.video": "VIDEO",
    "history.filter.image": "IMAGE",
    "history.filter.audio": "AUDIO",
    "history.no_prompt": "No prompt",
    "history.download": "Download",
    "superip.title": "CREATE SUPER IP",
    "superip.desc": "Create your exclusive digital character",
    "superip.step.char": "CHAR",
    "superip.step.voice": "VOICE",
    "superip.step.gen": "GEN",
    "superip.prompt.title": "ENTER PROMPT",
    "superip.prompt.placeholder": "Describe the character you want...",
    "superip.prompt.clear": "Clear",
    "superip.prompt.generate": "GENERATE",
    "superip.generated_placeholder": "Generated image will appear here",
    "superip.audio.title": "GENERATED AUDIO",
    "superip.audio.no_audio": "No audio selected",
    "superip.audio.placeholder": "Generated audio will appear here",
    "superip.voice.waveform": "VOICE WAVEFORM",
    "superip.voice.no_trial": "No trial generated",
    "superip.voice.match": "Match",
    "superip.voice.select": "SELECT VOICE",
    "superip.voice.select_model": "Select Voice Model",
    "superip.voice.cloning": "VOICE CLONING",
    "superip.voice.select_file": "Select File (mp3/wav/m4a)",
    "superip.voice.uploading": "Uploading...",
    "superip.voice.ready": "Ready",
    "superip.voice.uploaded": "Uploaded",
    "superip.voice.file_limit": "10s~300s, ≤20MB",
    "superip.voice.input_text": "INPUT TEXT",
    "superip.voice.input_placeholder": "Enter text to convert to speech...",
    "superip.result.title": "RESULT",
    "superip.result.placeholder": "Generated video will appear here",
    "superip.result.generating": "Generating...",
    "superip.result.audio_placeholder": "Generated audio will appear here",
    "superip.gen.clear": "Clear",
    "superip.gen.generate": "GENERATE",
    "video_insights.title": "VIDEO INSIGHTS",
    "video_insights.desc": "Choose a goal to get actionable insights fast.",
    "video_insights.mode.extract": "Extract Audio Script",
    "video_insights.mode.scene": "Reverse Prompt",
    "video_insights.mode.rewrite": "Viral Copy",
    "video_insights.upload.placeholder": "Drag & drop or click to upload",
    "video_insights.upload.paste_link": "OR PASTE LINK",
    "video_insights.upload.link_placeholder": "Paste video link (TikTok supported)",
    "video_insights.analyze_btn": "ANALYZE VIDEO",
    "video_insights.results": "RESULTS",
    "video_insights.results_placeholder": "Results will appear here",
    "hypersell.title": "HYPER SELL",
    "hypersell.desc": "Generate high-converting videos in seconds.",
    "hypersell.tab.text_to_video": "TEXT TO VIDEO",
    "hypersell.tab.img_to_video": "IMG TO VIDEO",
    "hypersell.tab.enhance": "ENHANCE",
    "hypersell.prompt.title": "PROMPT INPUT",
    "hypersell.source_material": "SOURCE MATERIAL",
    "hypersell.prompt.placeholder": "Describe the video you want to generate in detail...",
    "hypersell.ratio.title": "ASPECT RATIO",
    "hypersell.duration.title": "DURATION",
    "hypersell.generate_btn": "GENERATE (150 CREDITS)",
    "hypersell.result.title": "LATEST RESULT",
    "settings.title": "SETTINGS",
    "settings.partner": "Partner Program",
    "settings.language": "Language",
    "settings.billing": "Billing & Plans",
    "settings.usage": "Credits Usage",
    "settings.support": "Help & Support",
  },
  zh: {
    "nav.workspace": "工作台",
    "nav.scripts": "脚本",
    "nav.hypersell": "HyperSell",
    "nav.superip": "超级IP",
    "nav.history": "历史记录",
    "history.loading": "加载中...",
    "history.empty": "暂无记录",
    "video_insights.input.script": "产品信息",
    "video_insights.input.visual": "参考画面 (可选)",
    "video_insights.placeholder.script": "输入产品信息",
    "video_insights.upload.image_btn": "上传图片",
    "video_insights.upload.drag_drop": "拖放或点击上传",
    "video_insights.upload.or_paste": "或粘贴链接",
    "video_insights.status.processing": "处理中...",
    "video_insights.btn.rewrite": "重写脚本",
    "video_insights.btn.analyze": "分析视频",
    "video_insights.limit_reached": "您已达到今天的免费限制。升级以继续。",
    "hypersell.status.waiting": "等待中",
    "hypersell.status.masterpiece": "您的杰作将显示在这里",
    "hypersell.btn.generate": "生成",
    "hypersell.btn.at_capacity": "已满载",
    "hypersell.btn.login_required": "请先登录",
    "hypersell.btn.credits": "积分",
    "hypersell.btn.free": "免费",
    "hypersell.btn.unsupported": "不支持",
    "hypersell.btn.insufficient": "积分不足",
    "workspace.title": "工作台",
    "workspace.welcome": "欢迎回来, ",
    "workspace.welcome_guest": "欢迎来到VGOT，登录后即可开启你的创作之旅。",
    "workspace.projects": "项目",
    "workspace.quick_actions": "快捷操作",
    "workspace.action.analyze": "分析视频",
    "workspace.action.analyze_desc": "快速获取视频的脚本灵感，聊天探索更多创意",
    "workspace.action.generate": "生成视频",
    "workspace.action.generate_desc": "生成视频，创造令人惊艳的作品",
    "workspace.action.superip": "Super IP",
    "workspace.action.superip_desc": "创建您的专属数字角色",
    "superip.panel.upload_char": "上传角色",
    "superip.panel.upload_audio": "上传音频",
    "superip.panel.video_gen": "视频生成",
    "superip.panel.open_gallery": "打开图库",
    "superip.panel.uploading": "上传中...",
    "nav.profile": "我的",
    "profile.title": "个人中心",
    "profile.membership": "用户积分",
    "profile.credits_left": "剩余积分",
    "profile.upgrade": "升级套餐",
    "profile.menu.partner": "合伙人计划",
    "profile.menu.billing": "账单与套餐",
    "profile.menu.usage": "积分使用记录",
    "profile.login_desc": "未登录，登录后可查看个人资料与设置",
    "profile.top_up": "充值",
    "profile.settings_header": "设置",
    "profile.settings.language": "语言设置",
    "profile.settings.theme": "主题设置",
    "profile.logout": "退出登录",
    "profile.version": "版本",
    "modal.language.title": "选择语言",
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.login": "登录",
    "common.clear": "清空",
    "common.clear_gen": "清除",
    "common.copy": "复制",
    "common.result": "结果",
    "common.back": "返回",
    "common.next_step": "下一步",
    "common.start_new": "重新开始",
    "history.title": "历史记录",
    "history.filter.all": "全部",
    "history.filter.video": "视频",
    "history.filter.image": "图片",
    "history.filter.audio": "音频",
    "history.no_prompt": "无提示词",
    "history.download": "下载",
    "superip.title": "创建超级IP",
    "superip.desc": "创建您的专属数字角色",
    "superip.step.char": "角色",
    "superip.step.voice": "声音",
    "superip.step.gen": "生成",
    "superip.prompt.title": "输入提示词",
    "superip.prompt.placeholder": "描述您想要的角色...",
    "superip.prompt.clear": "清空",
    "superip.prompt.generate": "生成",
    "superip.generated_placeholder": "生成的图片将显示在这里",
    "superip.audio.title": "生成的音频",
    "superip.audio.no_audio": "未选择音频",
    "superip.audio.placeholder": "生成的音频将显示在这里",
    "superip.voice.waveform": "语音波形",
    "superip.voice.no_trial": "未生成试听",
    "superip.voice.match": "匹配",
    "superip.voice.select": "选择声音",
    "superip.voice.select_model": "选择声音模型",
    "superip.voice.cloning": "声音克隆",
    "superip.voice.select_file": "选择文件 (mp3/wav/m4a)",
    "superip.voice.uploading": "上传中...",
    "superip.voice.ready": "就绪",
    "superip.voice.uploaded": "已上传",
    "superip.voice.file_limit": "10s~300s, ≤20MB",
    "superip.voice.input_text": "输入文本",
    "superip.voice.input_placeholder": "输入要转换为语音的文本...",
    "superip.result.title": "结果",
    "superip.result.placeholder": "生成的视频将显示在这里",
    "superip.result.generating": "生成中...",
    "superip.result.audio_placeholder": "生成的音频将显示在这里",
    "superip.gen.clear": "清除",
    "superip.gen.generate": "生成",
    "video_insights.title": "视频洞察",
    "video_insights.desc": "选择一个目标以快速获取可操作的洞察。",
    "video_insights.mode.extract": "提取音频文案",
    "video_insights.mode.scene": "反推提示词",
    "video_insights.mode.rewrite": "爆款文案",
    "video_insights.upload.placeholder": "拖放或点击上传",
    "video_insights.upload.paste_link": "或粘贴链接",
    "video_insights.upload.link_placeholder": "粘贴视频链接（支持TikTok）",
    "video_insights.analyze_btn": "分析视频",
    "video_insights.results": "结果",
    "video_insights.results_placeholder": "结果将显示在这里",
    "hypersell.title": "HyperSell",
    "hypersell.desc": "几秒钟内生成高转化率视频。",
    "hypersell.tab.text_to_video": "文生视频",
    "hypersell.tab.img_to_video": "图生视频",
    "hypersell.tab.enhance": "视频增强",
    "hypersell.prompt.title": "输入提示词",
    "hypersell.source_material": "素材上传",
    "hypersell.prompt.placeholder": "详细描述您想要生成的视频...",
    "hypersell.ratio.title": "画面比例",
    "hypersell.duration.title": "视频时长",
    "hypersell.generate_btn": "生成视频 (150 积分)",
    "hypersell.result.title": "最新生成结果",
    "settings.title": "设置",
    "settings.partner": "合伙人计划",
    "settings.language": "语言设置",
    "settings.billing": "账单与套餐",
    "settings.usage": "积分使用记录",
    "settings.support": "帮助与支持",
  },
  "zh-TW": {
    "nav.workspace": "工作台",
    "nav.scripts": "腳本",
    "nav.hypersell": "HyperSell",
    "nav.superip": "超級IP",
    "nav.history": "歷史記錄",
    "history.loading": "載入中...",
    "history.empty": "暫無記錄",
    "video_insights.input.script": "產品信息",
    "video_insights.input.visual": "參考畫面 (可選)",
    "video_insights.placeholder.script": "輸入產品信息",
    "video_insights.upload.image_btn": "上傳圖片",
    "video_insights.upload.drag_drop": "拖放或點擊上傳",
    "video_insights.upload.or_paste": "或粘貼鏈接",
    "video_insights.status.processing": "處理中...",
    "video_insights.btn.rewrite": "重寫腳本",
    "video_insights.btn.analyze": "分析視頻",
    "video_insights.limit_reached": "您已達到今天的免費限制。升級以繼續。",
    "hypersell.status.waiting": "等待中",
    "hypersell.status.masterpiece": "您的傑作將顯示在這裡",
    "hypersell.btn.generate": "生成",
    "hypersell.btn.at_capacity": "已滿載",
    "hypersell.btn.login_required": "請先登入",
    "hypersell.btn.credits": "積分",
    "hypersell.btn.free": "免費",
    "hypersell.btn.unsupported": "不支持",
    "hypersell.btn.insufficient": "積分不足",
    "workspace.title": "工作台",
    "workspace.welcome": "歡迎回來, ",
    "workspace.welcome_guest": "歡迎來到VGOT，登入後即可開啟你的創作之旅。",
    "workspace.projects": "項目",
    "workspace.quick_actions": "快捷操作",
    "workspace.action.analyze": "分析視頻",
    "workspace.action.analyze_desc": "快速獲取視頻的腳本靈感，聊天探索更多創意",
    "workspace.action.generate": "生成視頻",
    "workspace.action.generate_desc": "生成視頻，創造令人驚艷的作品",
    "workspace.action.superip": "Super IP",
    "workspace.action.superip_desc": "創建您的專屬數字角色",
    "superip.panel.upload_char": "上傳角色",
    "superip.panel.upload_audio": "上傳音頻",
    "superip.panel.video_gen": "視頻生成",
    "superip.panel.open_gallery": "打開圖庫",
    "superip.panel.uploading": "上傳中...",
    "nav.profile": "我的",
    "profile.title": "個人中心",
    "profile.membership": "用戶積分",
    "profile.credits_left": "剩餘積分",
    "profile.upgrade": "升級套餐",
    "profile.menu.partner": "合作夥伴計劃",
    "profile.menu.billing": "賬單與套餐",
    "profile.menu.usage": "積分使用記錄",
    "profile.login_desc": "未登入，登入後可查看個人資料與設置",
    "profile.top_up": "充值",
    "profile.settings_header": "設置",
    "profile.settings.language": "語言設置",
    "profile.settings.theme": "主題設置",
    "profile.logout": "登出",
    "profile.version": "版本",
    "modal.language.title": "選擇語言",
    "common.cancel": "取消",
    "common.confirm": "確認",
    "common.login": "登入",
    "common.clear": "清空",
    "common.clear_gen": "清除",
    "common.copy": "複製",
    "common.result": "結果",
    "common.back": "返回",
    "common.next_step": "下一步",
    "common.start_new": "重新開始",
    "history.title": "歷史記錄",
    "history.filter.all": "全部",
    "history.filter.video": "視頻",
    "history.filter.image": "圖片",
    "history.filter.audio": "音頻",
    "history.no_prompt": "無提示詞",
    "history.download": "下載",
    "superip.title": "創建超級IP",
    "superip.desc": "創建您的專屬數字角色",
    "superip.step.char": "角色",
    "superip.step.voice": "聲音",
    "superip.step.gen": "生成",
    "superip.prompt.title": "輸入提示詞",
    "superip.prompt.placeholder": "描述您想要的角色...",
    "superip.prompt.clear": "清空",
    "superip.prompt.generate": "生成",
    "superip.generated_placeholder": "生成的圖片將顯示在這裡",
    "superip.audio.title": "生成的音頻",
    "superip.audio.no_audio": "未選擇音頻",
    "superip.audio.placeholder": "生成的音頻將顯示在這裡",
    "superip.voice.waveform": "語音波形",
    "superip.voice.no_trial": "未生成試聽",
    "superip.voice.match": "匹配",
    "superip.voice.select": "選擇聲音",
    "superip.voice.select_model": "選擇聲音模型",
    "superip.voice.cloning": "聲音克隆",
    "superip.voice.select_file": "選擇文件 (mp3/wav/m4a)",
    "superip.voice.uploading": "上傳中...",
    "superip.voice.ready": "就緒",
    "superip.voice.uploaded": "已上傳",
    "superip.voice.file_limit": "10s~300s, ≤20MB",
    "superip.voice.input_text": "輸入文本",
    "superip.voice.input_placeholder": "輸入要轉換為語音的文本...",
    "superip.result.title": "結果",
    "superip.result.placeholder": "生成的視頻將顯示在這裡",
    "superip.result.generating": "生成中...",
    "superip.result.audio_placeholder": "生成的音頻將顯示在這裡",
    "superip.gen.clear": "清除",
    "superip.gen.generate": "生成",
    "video_insights.title": "視頻洞察",
    "video_insights.desc": "選擇一個目標以快速獲取可操作的洞察。",
    "video_insights.mode.extract": "提取音頻文案",
    "video_insights.mode.scene": "反推提示詞",
    "video_insights.mode.rewrite": "爆款文案",
    "video_insights.upload.placeholder": "拖放或點擊上傳",
    "video_insights.upload.paste_link": "或粘貼鏈接",
    "video_insights.upload.link_placeholder": "粘貼視頻鏈接（支持TikTok）",
    "video_insights.analyze_btn": "分析視頻",
    "video_insights.results": "結果",
    "video_insights.results_placeholder": "結果將顯示在這裡",
    "hypersell.title": "HyperSell",
    "hypersell.desc": "幾秒鐘內生成高轉化率視頻。",
    "hypersell.tab.text_to_video": "文生視頻",
    "hypersell.tab.img_to_video": "圖生視頻",
    "hypersell.tab.enhance": "視頻增強",
    "hypersell.prompt.title": "輸入提示詞",
    "hypersell.source_material": "素材上傳",
    "hypersell.prompt.placeholder": "詳細描述您想要生成的視頻...",
    "hypersell.ratio.title": "畫面比例",
    "hypersell.duration.title": "視頻時長",
    "hypersell.generate_btn": "生成視頻 (150 積分)",
    "hypersell.result.title": "最新生成結果",
    "settings.title": "設置",
    "settings.partner": "合作夥伴計劃",
    "settings.language": "語言設置",
    "settings.billing": "賬單與套餐",
    "settings.usage": "積分使用記錄",
    "settings.support": "幫助與支持",
  },
  ja: {
    "nav.workspace": "ワークスペース",
    "nav.scripts": "スクリプト",
    "nav.hypersell": "ハイパーセル",
    "nav.superip": "スーパーIP",
    "nav.history": "履歴",
    "workspace.title": "ワークスペース",
    "workspace.welcome": "おかえりなさい, ",
    "workspace.welcome_guest": "VGOTへようこそ。ログインして創作を始めましょう。",
    "workspace.projects": "プロジェクト",
    "workspace.quick_actions": "クイックアクション",
    "workspace.action.analyze": "動画分析",
    "workspace.action.analyze_desc": "動画のスクリプトインスピレーションを素早く取得",
    "workspace.action.generate": "動画生成",
    "workspace.action.generate_desc": "動画を生成し、素晴らしい作品を作成",
    "workspace.action.superip": "Super IP",
    "workspace.action.superip_desc": "専用のデジタルキャラクターを作成",
    "superip.panel.upload_char": "キャラアップロード",
    "superip.panel.upload_audio": "音声アップロード",
    "superip.panel.video_gen": "動画生成",
    "superip.panel.open_gallery": "ギャラリーを開く",
    "superip.panel.uploading": "アップロード中...",
    "nav.profile": "プロフィール",
    "profile.title": "プロフィール",
    "profile.membership": "ユーザークレジット",
    "profile.credits_left": "残りクレジット",
    "profile.upgrade": "プランをアップグレード",
    "profile.menu.partner": "パートナープログラム",
    "profile.menu.billing": "請求とプラン",
    "profile.menu.usage": "クレジット使用履歴",
    "profile.settings.language": "言語設定",
    "profile.settings.theme": "テーマ設定",
    "profile.logout": "ログアウト",
    "profile.version": "バージョン",
    "modal.language.title": "言語を選択",
    "common.cancel": "キャンセル",
    "common.confirm": "確認",
    "common.login": "ログイン",
    "common.clear": "クリア",
    "common.clear_gen": "クリア",
    "common.copy": "コピー",
    "common.result": "結果",
    "common.back": "戻る",
    "common.next_step": "次のステップ",
    "common.start_new": "新規作成",
    "history.title": "履歴",
    "history.filter.all": "すべて",
    "history.filter.video": "動画",
    "history.filter.image": "画像",
    "history.filter.audio": "音声",
    "history.no_prompt": "プロンプトなし",
    "history.download": "ダウンロード",
    "superip.title": "スーパーIP作成",
    "superip.desc": "専用のデジタルキャラクターを作成",
    "superip.step.char": "キャラ",
    "superip.step.voice": "音声",
    "superip.step.gen": "生成",
    "superip.prompt.title": "プロンプト入力",
    "superip.prompt.placeholder": "希望するキャラクターを説明してください...",
    "superip.prompt.clear": "クリア",
    "superip.prompt.generate": "生成",
    "superip.generated_placeholder": "生成された画像がここに表示されます",
    "superip.audio.title": "生成された音声",
    "superip.audio.no_audio": "音声が選択されていません",
    "superip.audio.placeholder": "生成された音声がここに表示されます",
    "superip.voice.waveform": "音声波形",
    "superip.voice.no_trial": "試聴が生成されていません",
    "superip.voice.match": "マッチ",
    "superip.voice.select": "音声を選択",
    "superip.voice.select_model": "音声モデルを選択",
    "superip.voice.cloning": "音声クローニング",
    "superip.voice.select_file": "ファイルを選択 (mp3/wav/m4a)",
    "superip.voice.uploading": "アップロード中...",
    "superip.voice.ready": "準備完了",
    "superip.voice.uploaded": "アップロード済み",
    "superip.voice.file_limit": "10s~300s, ≤20MB",
    "superip.voice.input_text": "テキスト入力",
    "superip.voice.input_placeholder": "音声に変換するテキストを入力してください...",
    "superip.result.title": "結果",
    "superip.result.placeholder": "生成された動画がここに表示されます",
    "superip.result.generating": "生成中...",
    "superip.result.audio_placeholder": "生成された音声がここに表示されます",
    "superip.gen.clear": "クリア",
    "superip.gen.generate": "生成",
    "video_insights.title": "動画インサイト",
    "video_insights.desc": "目標を選択して、実行可能なインサイトを素早く取得します。",
    "video_insights.input.script": "製品情報",
    "video_insights.input.visual": "参考画像 (任意)",
    "video_insights.placeholder.script": "製品情報を入力してください...",
    "video_insights.mode.extract": "音声スクリプト抽出",
    "video_insights.mode.scene": "プロンプト逆生成",
    "video_insights.mode.rewrite": "バズるコピー",
    "video_insights.upload.placeholder": "ドラッグ＆ドロップまたはクリックしてアップロード",
    "video_insights.upload.paste_link": "またはリンクを貼り付け",
    "video_insights.upload.link_placeholder": "動画リンクを貼り付け（TikTok対応）",
    "video_insights.analyze_btn": "動画を分析",
    "video_insights.results": "結果",
    "video_insights.results_placeholder": "結果がここに表示されます",
    "hypersell.title": "ハイパーセル",
    "hypersell.desc": "高コンバージョン動画を数秒で生成。",
    "hypersell.tab.text_to_video": "テキスト動画",
    "hypersell.tab.img_to_video": "画像動画",
    "hypersell.tab.enhance": "動画強化",
    "hypersell.prompt.title": "プロンプト入力",
    "hypersell.prompt.placeholder": "生成したい動画を詳細に説明してください...",
    "hypersell.ratio.title": "アスペクト比",
    "hypersell.duration.title": "動画時間",
    "hypersell.generate_btn": "生成する (150 クレジット)",
    "hypersell.result.title": "最新の結果",
    "settings.title": "設定",
    "settings.partner": "パートナープログラム",
    "settings.language": "言語設定",
    "settings.billing": "請求とプラン",
    "settings.usage": "クレジット使用履歴",
    "settings.support": "ヘルプとサポート",
  },
  es: {
    "nav.workspace": "Espacio de trabajo",
    "nav.scripts": "Guiones",
    "nav.hypersell": "Venta Rápida",
    "nav.superip": "Super IP",
    "nav.history": "Historial",
    "workspace.title": "Espacio de trabajo",
    "workspace.welcome": "Bienvenido de nuevo, ",
    "workspace.welcome_guest": "Bienvenido a VGOT, inicia sesión para comenzar.",
    "workspace.projects": "Proyectos",
    "workspace.quick_actions": "Acciones Rápidas",
    "workspace.action.analyze": "Analizar Video",
    "workspace.action.analyze_desc": "Obtén inspiración para guiones rápidamente",
    "workspace.action.generate": "Generar Video",
    "workspace.action.generate_desc": "Genera videos, crea obras increíbles",
    "workspace.action.superip": "Super IP",
    "workspace.action.superip_desc": "Crea tu personaje digital exclusivo",
    "superip.panel.upload_char": "Subir Personaje",
    "superip.panel.upload_audio": "Subir Audio",
    "superip.panel.video_gen": "Generación de Video",
    "superip.panel.open_gallery": "Abrir Galería",
    "superip.panel.uploading": "Subiendo...",
    "nav.profile": "Perfil",
    "profile.title": "Perfil",
    "profile.membership": "Créditos de Usuario",
    "profile.credits_left": "créditos restantes",
    "profile.upgrade": "Mejorar Plan",
    "profile.menu.partner": "Programa de Socios",
    "profile.menu.billing": "Facturación y Planes",
    "profile.menu.usage": "Uso de Créditos",
    "profile.settings.language": "Idioma",
    "profile.settings.theme": "Tema",
    "profile.logout": "Cerrar Sesión",
    "profile.version": "Versión",
    "modal.language.title": "Seleccionar Idioma",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.login": "Iniciar Sesión",
    "common.clear": "Limpiar",
    "common.clear_gen": "Limpiar",
    "common.copy": "Copiar",
    "common.result": "RESULTADO",
    "common.back": "VOLVER",
    "common.next_step": "SIGUIENTE PASO",
    "common.start_new": "EMPEZAR DE NUEVO",
    "history.title": "HISTORIAL",
    "history.filter.all": "TODO",
    "history.filter.video": "VIDEO",
    "history.filter.image": "IMAGEN",
    "history.filter.audio": "AUDIO",
    "history.no_prompt": "Sin indicación",
    "history.download": "Descargar",
    "superip.title": "CREAR SUPER IP",
    "superip.desc": "Crea tu personaje digital exclusivo",
    "superip.step.char": "PERSONAJE",
    "superip.step.voice": "VOZ",
    "superip.step.gen": "GENERAR",
    "superip.prompt.title": "INGRESAR PROMPT",
    "superip.prompt.placeholder": "Describe el personaje que deseas...",
    "superip.prompt.clear": "Borrar",
    "superip.prompt.generate": "GENERAR",
    "superip.generated_placeholder": "La imagen generada aparecerá aquí",
    "superip.audio.title": "AUDIO GENERADO",
    "superip.audio.no_audio": "No se seleccionó audio",
    "superip.audio.placeholder": "El audio generado aparecerá aquí",
    "superip.voice.waveform": "FORMA DE ONDA DE VOZ",
    "superip.voice.no_trial": "No se generó prueba",
    "superip.voice.match": "Coincidir",
    "superip.voice.select": "SELECCIONAR VOZ",
    "superip.voice.select_model": "Seleccionar Modelo de Voz",
    "superip.voice.cloning": "CLONACIÓN DE VOZ",
    "superip.voice.select_file": "Seleccionar Archivo (mp3/wav/m4a)",
    "superip.voice.uploading": "Subiendo...",
    "superip.voice.ready": "Listo",
    "superip.voice.uploaded": "Subido",
    "superip.voice.file_limit": "10s~300s, ≤20MB",
    "superip.voice.input_text": "TEXTO DE ENTRADA",
    "superip.voice.input_placeholder": "Ingrese el texto para convertir a voz...",
    "superip.result.title": "RESULTADO",
    "superip.result.placeholder": "El video generado aparecerá aquí",
    "superip.result.generating": "Generando...",
    "superip.result.audio_placeholder": "El audio generado aparecerá aquí",
    "superip.gen.clear": "Limpiar",
    "superip.gen.generate": "GENERAR",
    "video_insights.title": "INFORMACIÓN DE VIDEO",
    "video_insights.desc": "Elige un objetivo para obtener información procesable rápidamente.",
    "video_insights.input.script": "Información del producto",
    "video_insights.input.visual": "Referencia visual (opcional)",
    "video_insights.placeholder.script": "Introducir información del producto...",
    "video_insights.mode.extract": "Extraer Guión de Audio",
    "video_insights.mode.scene": "Prompt Inverso",
    "video_insights.mode.rewrite": "Copy Viral",
    "video_insights.upload.placeholder": "Arrastra y suelta o haz clic para subir",
    "video_insights.upload.paste_link": "O PEGA EL ENLACE",
    "video_insights.upload.link_placeholder": "Pega el enlace del video (compatible con TikTok)",
    "video_insights.analyze_btn": "ANALIZAR VIDEO",
    "video_insights.results": "RESULTADOS",
    "video_insights.results_placeholder": "Los resultados aparecerán aquí",
    "hypersell.title": "VENTA RÁPIDA",
    "hypersell.desc": "Genera videos de alta conversión en segundos.",
    "hypersell.tab.text_to_video": "TEXTO A VIDEO",
    "hypersell.tab.img_to_video": "IMAGEN A VIDEO",
    "hypersell.tab.enhance": "MEJORAR",
    "hypersell.prompt.title": "ENTRADA DE PROMPT",
    "hypersell.prompt.placeholder": "Describe el video que deseas generar en detalle...",
    "hypersell.ratio.title": "RELACIÓN DE ASPECTO",
    "hypersell.duration.title": "DURACIÓN",
    "hypersell.generate_btn": "GENERAR (150 CRÉDITOS)",
    "hypersell.result.title": "ÚLTIMO RESULTADO",
    "settings.title": "CONFIGURACIÓN",
    "settings.partner": "Programa de Socios",
    "settings.language": "Idioma",
    "settings.billing": "Facturación y Planes",
    "settings.usage": "Uso de Créditos",
    "settings.support": "Ayuda y Soporte",
  }
};

export const LanguageContext = React.createContext<{
  lang: LangKey;
  setLang: (l: LangKey) => void;
  t: (key: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const useTranslation = () => React.useContext(LanguageContext);

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Theme Components ---

const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg",
      "relative overflow-hidden group",
      className,
    )}
  >
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {children}
  </div>
);

const NeonButton = ({
  children,
  onClick,
  className,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "purple";
  disabled?: boolean;
}) => {
  const isPrimary = variant === "primary";
  const isPurple = variant === "purple";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full py-4 rounded-lg font-bold tracking-wider uppercase transition-all duration-300 relative overflow-hidden",
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]",
        isPurple
          ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:shadow-[0_0_30px_rgba(192,38,211,0.6)] border border-fuchsia-500/50"
          : isPrimary
            ? "bg-slate-950/90 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-500/50 hover:border-cyan-400 hover:text-cyan-300 backdrop-blur-sm"
            : "bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
        className,
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {(isPrimary || isPurple) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      )}
    </button>
  );
};

const TechInput = ({
  placeholder,
  label,
  type = "text",
}: {
  placeholder?: string;
  label?: string;
  type?: string;
}) => (
  <div className="space-y-2 w-full">
    {label && (
      <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">
        {label}
      </label>
    )}
    <div className="relative group">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 focus:shadow-[0_4px_12px_-4px_rgba(6,182,212,0.3)] placeholder:text-slate-600"
      />
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 transition-all duration-300 group-focus-within:w-full box-shadow-[0_0_10px_#22d3ee]" />
    </div>
  </div>
);

// --- Sub-Pages ---

// 1. Workspace (Dashboard)
const WorkspaceView = ({
  onNavigate,
}: {
  onNavigate: (tab: "workspace" | "scripts" | "hypersell" | "superip" | "history" | "profile" | "partner_program" | "credits_usage") => void;
}) => {
  const { t } = useTranslation();
  // Local-only state for showing user display name and credits
  const [wsName, setWsName] = useState<string | null>(null);
  const [wsCredits, setWsCredits] = useState<number | null>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  useEffect(() => {
    // Read token from localStorage (set after successful login)
    const token = localStorage.getItem("access_token");
    if (!token) {
      setWsName(null);
      setWsCredits(null);
      setTotalRecords(0);
      return;
    }
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
    
    // Fetch user info
    fetch(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          setWsName(null);
          setWsCredits(null);
          return;
        }
        const display = (data?.username || data?.email) ?? null;
        setWsName(display ? String(display) : null);
        setWsCredits(
          typeof data?.credits === "number" ? data.credits : 0,
        );
      })
      .catch(() => {
        setWsName(null);
        setWsCredits(null);
      });

    // Fetch total history records count
    fetch(`${API_BASE}/api/history/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.total_records === "number") {
          setTotalRecords(data.total_records);
        }
      })
      .catch(() => {
        setTotalRecords(0);
      });
  }, []);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          {t("workspace.title")}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {wsName ? (
            <>{t("workspace.welcome")}{wsName}.</>
          ) : (
            <>{t("workspace.welcome_guest")}</>
          )}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center justify-center py-6 border-cyan-500/20 bg-slate-800/40">
          <div className="text-cyan-400 mb-2">
            <Video size={28} />
          </div>
          <span className="text-2xl font-bold text-white">
            {totalRecords}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            {t("workspace.projects")}
          </span>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-6 border-fuchsia-500/20 bg-slate-800/40">
          <div className="text-fuchsia-400 mb-2">
            <Zap size={28} />
          </div>
          <span className="text-2xl font-bold text-white">
            {wsCredits !== null ? wsCredits : "—"}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            {t("profile.membership") || "Credits"}
          </span>
        </GlassCard>
      </div>

      <h2 className="text-sm font-bold text-cyan-400/80 uppercase tracking-wider mt-8 mb-4">
        {t("workspace.quick_actions")}
      </h2>
      <div className="space-y-3">
        {/* Analyze Video - Uses Blue/Message style (moved above Generate) */}
        <button
          onClick={() => onNavigate("scripts")}
          className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg group cursor-pointer active:scale-95 transition-all hover:border-blue-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-400 group-hover:text-blue-300 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all">
              <MessageSquare size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">
                {t("workspace.action.analyze")}
              </div>
              <div className="text-slate-500 text-xs">
                {t("workspace.action.analyze_desc")}
              </div>
            </div>
          </div>
          <ChevronRight className="text-slate-600" size={16} />
        </button>

        {/* Generate Video - Uses Cyan/Wand style */}
        <button
          onClick={() => onNavigate("hypersell")}
          className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg group cursor-pointer active:scale-95 transition-all hover:border-cyan-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-400 group-hover:text-cyan-300 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all">
              <Wand2 size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">
                {t("workspace.action.generate")}
              </div>
              <div className="text-slate-500 text-xs">
                {t("workspace.action.generate_desc")}
              </div>
            </div>
          </div>
          <ChevronRight className="text-slate-600" size={16} />
        </button>

        {/* Super IP - Uses Purple/User style */}
        <button
          onClick={() => onNavigate("superip")}
          className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg group cursor-pointer active:scale-95 transition-all hover:border-purple-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-500/10 rounded-full text-purple-400 group-hover:text-purple-300 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all">
              <User size={20} />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">
                {t("workspace.action.superip")}
              </div>
              <div className="text-slate-500 text-xs">
                {t("workspace.action.superip_desc")}
              </div>
            </div>
          </div>
          <ChevronRight className="text-slate-600" size={16} />
        </button>
      </div>

    </div>
  );
};

interface Task {
  id: string;
  apiTaskId?: string;
  type: "text" | "image" | "enhance";
  prompt: string;
  status: "queued" | "running" | "success" | "failed" | "canceled";
  progress: number;
  resultUrl?: string;
  supabaseUrl?: string;
  historySaved?: boolean;
  error?: string;
  createdAt: number;
  startedAt?: number;
  // For queued (or later-started) tasks we need to retain the file until execution.
  // Note: persisted tasks from localStorage won't retain these File objects.
  imageFile?: File;
  videoFile?: File;
  aspectRatio?: string;
  duration?: string;
  params?: any; // Store original generation params
}

const TaskCard = ({ task, setTasks }: { task: Task, setTasks: React.Dispatch<React.SetStateAction<Task[]>> }) => {
  const isRunning = task.status === "running";
  const isFailed = task.status === "failed";
  const isSuccess = task.status === "success";
  const isPersisting = isSuccess && !task.supabaseUrl;
  const mediaUrl = task.supabaseUrl || task.resultUrl;

  // Force 16:9 aspect ratio for all cards as requested
  const aspectClass = "aspect-video";

  return (
    <div className={cn(
      "relative group rounded-xl overflow-hidden border transition-all duration-300",
      isFailed ? "border-red-500/30 bg-red-500/5" : "border-slate-800 bg-slate-900/40",
      isRunning && "border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
    )}>
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setTasks(prev => prev.filter(t => t.id !== task.id));
        }}
        className="absolute top-2 right-2 z-50 p-2 bg-black/60 rounded-full text-white/70 hover:text-white transition-colors hover:bg-red-500"
      >
        <X size={16} />
      </button>
      <div
        className={cn(aspectClass, "relative bg-black flex items-center justify-center")}
        style={{ aspectRatio: "16/9" }}
      >
        {mediaUrl ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-contain"
            controls={isSuccess}
            autoPlay={isSuccess}
            loop
            muted
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            {isRunning || isPersisting ? (
              <>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse text-center">
                  {isPersisting ? "Persisting..." : task.type === "enhance" ? "Generating..." : `Generating ${task.progress}%`}
                </p>
              </>
            ) : isFailed ? (
              <p className="text-xs text-red-500 font-medium px-4 text-center">{task.error || "Failed"}</p>
            ) : null}
          </div>
        )}

      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {task.type === "text" ? "Text to Video" : task.type === "image" ? "Img to Video" : "Enhance"}
          </span>
          <span className="text-[10px] text-slate-600">
            {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {task.type !== 'enhance' && (
          <p className="text-xs text-slate-300 line-clamp-2 font-medium">
            {task.prompt || "No prompt provided"}
          </p>
        )}
      </div>

    </div>
  );
};

const HyperSellView = ({
  user,
  isLoggedIn,
  onUnauthorized,
  onNavigate,
  onRefreshUser,
}: {
  user: UserProfile | null;
  isLoggedIn: boolean;
  onUnauthorized: () => void;
  onNavigate: (tab: string) => void;
  onRefreshUser?: () => void;
}) => {
  // Use translation
  const { t } = useTranslation();

  // Use string keys for tabs for translation
  const [activeTab, setActiveTab] = useState<"text" | "image" | "enhance">("text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("vgot:hypersell:tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep prompts isolated by mode so Enhance doesn't accidentally reuse Text/Image prompt.
  const [promptByTab, setPromptByTab] = useState<Record<"text" | "image" | "enhance", string>>({
    text: "",
    image: "",
    enhance: "", // enhance has no prompt UI
  });
  const prompt = promptByTab[activeTab];
  const setPrompt = (val: string) => setPromptByTab(prev => ({ ...prev, [activeTab]: val }));
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [duration, setDuration] = useState("10");
  const [quality, setQuality] = useState("small");
  // NOTE: loading/polling should be per-tab; otherwise switching tabs makes other tabs look "generating"
  const [loadingByTab, setLoadingByTab] = useState<Record<"text" | "image" | "enhance", boolean>>({
    text: false,
    image: false,
    enhance: false,
  });
  // Track short-lived submit/upload operations per tab so parallel submissions don't
  // accidentally leave the UI stuck in "UPLOADING...".
  const inflightRef = useRef<Record<"text" | "image" | "enhance", number>>({
    text: 0,
    image: 0,
    enhance: 0,
  });

  const bumpInflight = (type: "text" | "image" | "enhance", delta: number) => {
    inflightRef.current[type] = Math.max(0, (inflightRef.current[type] || 0) + delta);
    const isLoading = inflightRef.current[type] > 0;
    setLoadingByTab(prev => (prev[type] === isLoading ? prev : { ...prev, [type]: isLoading }));
  };
  const [pollingByTab, setPollingByTab] = useState<Record<"text" | "image" | "enhance", boolean>>({
    text: false,
    image: false,
    enhance: false,
  });
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef(new Map<string, { intervalId: any; startAt: number }>());

  // Daily midnight cleanup for "Latest Result" cards
  useEffect(() => {
    let dispose: (() => void) | null = null;
    // Lazy import to avoid impacting initial bundle for non-HyperSell users
    import('./lib/dailyCleanup').then(({ setupDailyMidnightCleanup }) => {
      const h = setupDailyMidnightCleanup({
        storageKey: 'vgot:hypersell:tasks',
        onClear: () => setTasks([]),
      });
      dispose = h.dispose;
    }).catch(() => {
      // ignore
    });

    return () => {
      try { dispose?.(); } catch { /* ignore */ }
    };
  }, []);

  const checkVideoDuration = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(null);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const PAGE_LIMITS = { text: 5, image: 5, enhance: 3 };

  // Mirror desktop credit display logic (VideoGeneration.js)
  const getCreditCost = (type: "text" | "image" | "enhance") => {
    const tier = String(user?.tier || "");
    const costs: Record<string, any> = {
      text: { Free: 150, Creator: 150, Business: 150, Enterprise: 0 },
      image: { Free: 150, Creator: 150, Business: 150, Enterprise: 0 },
      // Enhance: Free not supported; Creator/Business priced; Enterprise free
      enhance: { Free: -1, Creator: 800, Business: 500, Enterprise: 0 },
    };
    const c = costs[type]?.[tier];
    return typeof c === "number" ? c : undefined;
  };

  const creditCost = getCreditCost(activeTab);
  const creditsBalance = typeof user?.credits === "number" ? user.credits : 0;
  const isEnhanceUnsupported = activeTab === "enhance" && creditCost === -1;
  const isInsufficientCredits =
    typeof creditCost === "number" && creditCost > 0 && creditsBalance < creditCost;

  const requireAuthOrRedirect = () => {
    if (isLoggedIn) return true;
    onNavigate("login");
    return false;
  };

  // Configure per-mode parallelism.
  useEffect(() => {
    hypersellQueue.setLimit("text", PAGE_LIMITS.text);
    hypersellQueue.setLimit("image", PAGE_LIMITS.image);
    hypersellQueue.setLimit("enhance", PAGE_LIMITS.enhance);
  }, []);

  const canStartTask = (type: "text" | "image" | "enhance") => {
    const activeCount = tasks.filter(t => t.type === type && t.status === "running").length;
    return activeCount < PAGE_LIMITS[type];
  };

  const runningCountByType = useMemo(() => {
    return {
      text: tasks.filter(t => t.type === "text" && t.status === "running").length,
      image: tasks.filter(t => t.type === "image" && t.status === "running").length,
      enhance: tasks.filter(t => t.type === "enhance" && t.status === "running").length,
    };
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("vgot:hypersell:tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Rehydrate polling for running tasks.
  // IMPORTANT: HyperSellView can be unmounted when navigating to other tabs.
  // We re-run this whenever `tasks` changes so returning to HyperSell will resume polling.
  useEffect(() => {
    tasks.forEach((t) => {
      if (t.status === "running" && t.apiTaskId) {
        startPolling(t.apiTaskId, t.type, t.id, {
          prompt: t.prompt,
          params: t.params,
          aspectRatio: t.aspectRatio || "9:16",
          duration: t.duration || "10",
        });
      }
    });
  }, [tasks]);

  // Cleanup intervals when leaving HyperSell so re-entering can restart polling cleanly.
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearInterval(timer.intervalId));
      timersRef.current.clear();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startPolling = async (apiId: string, type: "text" | "image" | "enhance", localId: string, metadata: { prompt: string; params: any; aspectRatio: string; duration: string }) => {
    if (timersRef.current.has(localId)) return;

    setPollingByTab(prev => ({ ...prev, [type]: true }));
    const pollUrl = type === "enhance" ? `/api/enhance/outputs/${apiId}` : (type === "text" ? `/api/sora/poll/${apiId}` : `/api/sora/watermark-free/${apiId}`);
    const startAt = Date.now();
    const MAX_POLL_MS = 2 * 60 * 60 * 1000; // 2 hours

    const poll = async () => {
      try {
        if (!requireAuthOrRedirect()) {
          stopPolling();
          return;
        }
        const res = await api.get(pollUrl);
        const data = res;
        const status = (data.status || data.state || data.data?.status || data.data?.state || "").toLowerCase();
  const supabaseUrl = data.stored_url || data.supabase_url || data.data?.stored_url || data.data?.supabase_url;
  const externalUrl = data.result_url || data.url || data.output || data.data?.url || data.data?.output || (data.results && data.results[0]?.url) || (data.data?.results && data.data?.results[0]?.url);
  const finalUrl = supabaseUrl || externalUrl;
  const providerUrl = data.provider_url || data.file_url || data.result_url || data.data?.provider_url || data.data?.file_url || externalUrl;

        // Update progress if available
        const progressRaw = data.progress ?? data.data?.progress ?? data.result?.progress;
        if (progressRaw !== undefined) {
          const progressNum = typeof progressRaw === "string" ? parseFloat(progressRaw) : Number(progressRaw);
          if (!isNaN(progressNum)) {
            setTasks(prev => prev.map(t => t.id === localId ? { ...t, progress: progressNum } : t));
          }
        }

        // Early failure: check for similarity violations or other error messages
        const msg = data.error || data.message || data.detail || data.fail_reason || data.data?.error || data.data?.message || data.data?.fail_reason || '';
        const msgStr = typeof msg === 'string' ? msg : String(msg || '');

        const isSimilarityViolation =
          msgStr.includes('相似性') ||
          msgStr.toLowerCase().includes('similarity') ||
          (msgStr.includes('违反') && msgStr.includes('相似性'));

        if (isSimilarityViolation) {
          setTasks(prev => prev.map(t => t.id === localId ? { ...t, status: 'failed', error: msgStr || '内容相似性校验未通过' } : t));
          stopPolling();
          return;
        }

        if (status === "success" || status === "succeeded" || status === "completed" || status === "finished" || status === "done" || finalUrl) {
          // Update task with final URLs
          setTasks(prev => prev.map(t => t.id === localId ? {
            ...t,
            status: "success",
            resultUrl: externalUrl,
            supabaseUrl: supabaseUrl,
            progress: 100
          } : t));

          // Persist history (only for text/image, backend handles enhance)
          if (type !== "enhance") {
            // Ensure idempotency: polling can hit success multiple times.
            // IMPORTANT: don't mark historySaved=true until the request actually succeeds.
            let shouldSave = false;
            setTasks(prev => {
              const t = prev.find(x => x.id === localId);
              if (t && !t.historySaved) shouldSave = true;
              return prev;
            });

            if (shouldSave) {
              try {
                // Use explicit fetch so we can reliably attach token and surface HTTP status.
                // (api.post throws on non-2xx, which can bypass chained .catch in some cases.)
                const token = localStorage.getItem("access_token");
                const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
                
                // Debug logging for token and API base
                console.log("🔍 HyperSell history save debug:", {
                  hasToken: !!token,
                  tokenLength: token?.length || 0,
                  apiBase: API_BASE,
                  taskType: type,
                  localTaskId: localId
                });
                
                const payload = {
                  content_type: "video",
                  // Backend expects snake_case subtypes (see Vgot_front VideoGeneration.js)
                  content_subtype: type === "text" ? "text_to_video" : "image_to_video",
                  // Keep this value stable; HistoryView badges and filters rely on exact match.
                  source_page: "HyperSell",
                  // backend list reads file_url OR file_data; we send file_data and accept file_url back.
                  file_data: supabaseUrl || providerUrl || finalUrl,
                  prompt: metadata.prompt || "",
                  generation_params: { ...(metadata.params || {}), provider_url: providerUrl || null },
                  api_endpoint: type === "text" ? "/api/sora/text-to-video" : "/api/sora/watermark-free",
                  api_response_data: data,
                  duration: Number(metadata.duration) || null,
                  dimensions: metadata.aspectRatio || null,
                };

                console.log("📤 发送保存请求:", {
                  url: `${API_BASE}/api/history/save`,
                  payload: payload,
                  hasAuthHeader: !!token
                });

                fetch(`${API_BASE}/api/history/save`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify(payload),
                })
                  .then(async (r) => {
                    console.log("📥 保存响应:", {
                      ok: r.ok,
                      status: r.status,
                      statusText: r.statusText
                    });
                    
                    if (!r.ok) {
                      const errText = await r.text().catch(() => "");
                      const msg = errText || `HTTP ${r.status}`;
                      console.error("❌ 保存失败详情:", { status: r.status, errText });
                      // Surface on mobile instead of silent console.warn.
                      alert(`保存到 History 失败：${msg}`);
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === localId ? { ...t, error: `History save failed: ${msg}` } : t,
                        ),
                      );
                      return null;
                    }
                    const json = await r.json().catch(() => null);
                    console.log("✅ 保存成功:", json);
                    // Mark saved only after success
                    setTasks((prev) => prev.map((t) => (t.id === localId ? { ...t, historySaved: true } : t)));
                    // Refresh History list for immediate UX parity with enhance auto-save.
                    console.log("🔄 触发历史记录刷新");
                    try {
                      (window as any).__vgot_refresh_history__?.();
                    } catch {
                      // ignore
                    }
                    return json;
                  })
                  .then((saved) => {
                    if (saved?.file_url) {
                      setTasks((prev) =>
                        prev.map((t) =>
                          t.id === localId
                            ? {
                                ...t,
                                supabaseUrl: saved.file_url,
                                resultUrl: saved.file_url,
                              }
                            : t,
                        ),
                      );
                    }
                  })
                  .catch((e) => {
                    const msg = e?.message || String(e || "Unknown error");
                    alert(`保存到 History 失败：${msg}`);
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === localId ? { ...t, error: `History save failed: ${msg}` } : t,
                      ),
                    );
                  });
              } catch (e) {
                const msg = (e as any)?.message || String(e || "Unknown error");
                alert(`保存到 History 失败：${msg}`);
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === localId ? { ...t, error: `History save failed: ${msg}` } : t,
                  ),
                );
              }
            }
          }

          // Post-success short refresh: if still no media URL, try re-poll a few times
          if (!finalUrl) {
            let attempts = 0;
            const MAX_RETRY = 5;
            const retryOnce = async () => {
              attempts++;
              try {
                const r = await api.get(pollUrl);
                const d = r;
                const newUrl = d.stored_url || d.supabase_url || d.result_url || d.url || (d.results && d.results[0]?.url);
                if (newUrl) {
                  setTasks(prev => prev.map(t => t.id === localId ? { ...t, supabaseUrl: newUrl, resultUrl: newUrl } : t));
                  return;
                }
              } catch { }
              if (attempts < MAX_RETRY) setTimeout(retryOnce, 3000);
            };
            setTimeout(retryOnce, 3000);
          }

          stopPolling();
          // Refresh user credits after success
          onRefreshUser?.();
        } else if (status === "failed" || status === "error" || status === "timeout" || status === "failure" || status === "canceled") {
          const errorMsg = data.error || data.message || data.fail_reason || data.data?.error || data.data?.message || data.data?.fail_reason || "Generation failed";
          setTasks(prev => prev.map(t => t.id === localId ? { ...t, status: "failed", error: errorMsg } : t));
          setError(errorMsg);
          stopPolling();
        } else {
          // Keep polling but check for timeout
          if (Date.now() - startAt > MAX_POLL_MS) {
            setTasks(prev => prev.map(t => t.id === localId ? { ...t, status: "failed", error: "Timeout" } : t));
            stopPolling();
          }
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        const msg = String(err?.message || "");
        if (msg.includes("401")) {
          onUnauthorized();
          stopPolling();
          return;
        }
        if (Date.now() - startAt > MAX_POLL_MS) {
          setTasks(prev => prev.map(t => t.id === localId ? { ...t, status: "failed", error: "Polling failed" } : t));
          stopPolling();
        }
      }
    };

    const stopPolling = () => {
      const timer = timersRef.current.get(localId);
      if (timer) {
        clearInterval(timer.intervalId);
        timersRef.current.delete(localId);
      }
      // only stop spinner for the task's own tab when its polling is done
      setPollingByTab(prev => ({ ...prev, [type]: false }));
    };

    const intervalId = setInterval(poll, 5000);
    timersRef.current.set(localId, { intervalId, startAt });
    poll(); // Initial kick
  };

  const startTaskFromQueue = async (localId: string) => {
    const t = tasks.find(x => x.id === localId);
    if (!t) return;
    if (t.status !== "queued") return;

    if (!requireAuthOrRedirect()) {
      setTasks(prev => prev.map(x => x.id === localId ? { ...x, status: "failed", error: "Please login" } : x));
      return;
    }

    // Credits gating for queued tasks too
    const queuedCost = getCreditCost(t.type);
    const curCredits = typeof user?.credits === "number" ? user.credits : 0;
    if (t.type === "enhance" && queuedCost === -1) {
      setTasks(prev => prev.map(x => x.id === localId ? { ...x, status: "failed", error: "Not supported" } : x));
      return;
    }
    if (typeof queuedCost === "number" && queuedCost > 0 && curCredits < queuedCost) {
      setTasks(prev => prev.map(x => x.id === localId ? { ...x, status: "failed", error: "Insufficient credits" } : x));
      return;
    }

    // Flip to running immediately for UI.
  setTasks(prev => prev.map(x => x.id === localId ? ({ ...x, status: "running", startedAt: Date.now() } as any) : x));
  bumpInflight(t.type, +1);

    try {
      let res: any;

      if (t.type === "text") {
        res = await api.post("/api/sora/text-to-video", t.params);
      } else if (t.type === "image") {
        if (!t.imageFile) throw new Error("Missing image file");
        // Step 1: Upload image to Supabase via proxy
        const formData = new FormData();
        formData.append("file", t.imageFile);
        formData.append("folder", "images");
        const uploadRes = await api.post("/api/supabase/upload", formData);
        if (!uploadRes.success) throw new Error(uploadRes.error || "Upload failed");
        const finalUrl = uploadRes.url;

        // Step 2: Start image-to-video task
        res = await api.post("/api/sora/watermark-free", {
          ...t.params,
          url: finalUrl,
        });
      } else {
        if (!t.videoFile) throw new Error("Missing video file");
        // Step 0: Check duration
        const durationSec = await checkVideoDuration(t.videoFile);
        if (durationSec === null || durationSec > 15.25) {
          throw new Error("Video duration must be 15 seconds or less");
        }

        // Step 1: Upload file to RunningHub
        const formData = new FormData();
        formData.append("file", t.videoFile);
        const upRes = await api.post("/api/enhance/upload", formData);
        const fileName = upRes?.data?.file_name || upRes?.data?.fileName || upRes?.file_name;
        if (!fileName) throw new Error("Upload failed: No file name returned");

        // Step 2: Start enhance task
        res = await api.post("/api/enhance/start", { file_name: fileName });
      }

      const apiId = res?.task_id || res?.id || res?.data?.task_id || res?.data?.id || res?.data?.taskId;
      if (!apiId) throw new Error("Failed to get task ID");

      setTasks(prev => prev.map(x => x.id === localId ? { ...x, apiTaskId: apiId } : x));
      // Once we have an api task id, polling will take over; release uploading lock.
      bumpInflight(t.type, -1);
      await startPolling(apiId, t.type, localId, {
        prompt: t.type === "enhance" ? "" : (t.prompt || ""),
        params: t.params,
        aspectRatio: t.aspectRatio || "9:16",
        duration: t.duration || "10",
      });
    } catch (err: any) {
      const errorMsg = err?.message || "An error occurred";
      if (String(errorMsg).includes("401")) {
        onUnauthorized();
      }
      setError(errorMsg);
      setTasks(prev => prev.map(x => x.id === localId ? { ...x, status: "failed", error: errorMsg } : x));
      bumpInflight(t.type, -1);
    }
  };

  const tryStartQueuedTasks = (type: "text" | "image" | "enhance") => {
    const limit = PAGE_LIMITS[type];
    const running = runningCountByType[type];
    const slots = Math.max(0, limit - running);
    if (!slots) return;

    // Start up to available slots, FIFO by createdAt.
    const queued = tasks
      .filter(t => t.type === type && t.status === "queued")
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .slice(0, slots);

    queued.forEach(t => {
      startTaskFromQueue(t.id).catch(() => {
        // handled in startTaskFromQueue
      });
    });
  };

  // Whenever tasks change, try to drain queues.
  useEffect(() => {
    tryStartQueuedTasks("text");
    tryStartQueuedTasks("image");
    tryStartQueuedTasks("enhance");
  }, [tasks]);

  const handleGenerate = async () => {
    if (!requireAuthOrRedirect()) return;

    if (isEnhanceUnsupported) {
      alert("Enhance is not supported on Free plan");
      return;
    }
    if (isInsufficientCredits) {
      alert("Insufficient credits");
      return;
    }

    if (activeTab === "text" && !prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }
    if ((activeTab === "image" || activeTab === "enhance") && !uploadedFile) {
      alert("Please upload a file");
      return;
    }

    const shouldQueue = !canStartTask(activeTab);

    // For image/enhance: queued tasks can only run while this tab is open
    // because File objects can't be restored from localStorage.
    if (shouldQueue && (activeTab === "image" || activeTab === "enhance")) {
      alert(`该模式最多并行 ${PAGE_LIMITS[activeTab]} 个任务。已达到上限时会排队，但请保持当前页面不刷新，否则排队中的文件会丢失。`);
    }

    // Only show "UPLOADING..." for the short submit/upload window, not while polling.
    if (!shouldQueue) bumpInflight(activeTab, +1);
    setError(null);

    const localId = `${activeTab}-${Date.now()}`;
    const params = activeTab === "text" ? {
      prompt,
      aspect_ratio: aspectRatio,
      duration: Number(duration),
      model: "sora-2",
    } : (activeTab === "image" ? {
      prompt,
      aspect_ratio: aspectRatio,
      duration: Number(duration),
      size: quality
    } : {});

    const taskPrompt = activeTab === 'enhance' ? '' : prompt;

    const newTask: Task = {
      id: localId,
      type: activeTab,
      prompt: taskPrompt,
      status: shouldQueue ? "queued" : "running",
      progress: 0,
      createdAt: Date.now(),
      startedAt: shouldQueue ? undefined : Date.now(),
      aspectRatio,
      duration,
      params,
      imageFile: activeTab === "image" ? uploadedFile! : undefined,
      videoFile: activeTab === "enhance" ? uploadedFile! : undefined,
    };
    setTasks(prev => [newTask, ...prev]);

    // If queued, stop here — scheduler will start it when a slot is free.
    if (shouldQueue) return;

    try {
      // Use queue to ensure we never exceed per-mode parallelism.
      // Note: our own scheduler moves tasks from queued->running; this queue protects
      // us from double-starts under rapid clicking.
      const { promise } = hypersellQueue.enqueue(activeTab, async () => {
        let res: any;
        if (activeTab === "text") {
          res = await api.post("/api/sora/text-to-video", params);
        } else if (activeTab === "image") {
          // Step 1: Upload image to Supabase via proxy
          const formData = new FormData();
          formData.append("file", uploadedFile!);
          formData.append("folder", "images");
          const uploadRes = await api.post("/api/supabase/upload", formData);
          if (!uploadRes.success) throw new Error(uploadRes.error || "Upload failed");
          const finalUrl = uploadRes.url;

          // Step 2: Start image-to-video task
          res = await api.post("/api/sora/watermark-free", {
            ...params,
            url: finalUrl,
          });
        } else {
          // Enhance
          // Step 0: Check duration
          const durationSec = await checkVideoDuration(uploadedFile!);
          if (durationSec === null || durationSec > 15.25) {
            throw new Error("Video duration must be 15 seconds or less");
          }

          // Step 1: Upload file to RunningHub
          const formData = new FormData();
          formData.append("file", uploadedFile!);
          const upRes = await api.post("/api/enhance/upload", formData);
          const fileName = upRes?.data?.file_name || upRes?.data?.fileName || upRes?.file_name;

          if (!fileName) throw new Error("Upload failed: No file name returned");

          // Step 2: Start enhance task
          res = await api.post("/api/enhance/start", {
            file_name: fileName
          });
        }

        const apiId = res?.task_id || res?.id || res?.data?.task_id || res?.data?.id || res?.data?.taskId;
        if (!apiId) throw new Error("Failed to get task ID");
        return apiId;
      });

      const apiId = await promise;
      setTasks(prev => prev.map(t => t.id === localId ? { ...t, apiTaskId: apiId } : t));
      // Got taskId: release uploading lock so user can start another task.
      bumpInflight(activeTab, -1);
      startPolling(apiId, activeTab, localId, {
        prompt,
        params,
        aspectRatio,
        duration
      });
          // Refresh credits after submit to keep UI consistent.
          onRefreshUser?.();
    } catch (err: any) {
      const errorMsg = err?.message || "An error occurred";
          if (String(errorMsg).includes("401")) {
            onUnauthorized();
          }
      setError(errorMsg);
      setTasks(prev => prev.map(t => t.id === localId ? { ...t, status: "failed", error: errorMsg } : t));
      bumpInflight(activeTab, -1);
    }
  };



  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-xl font-black text-white tracking-tight uppercase">
          {t("hypersell.title")}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t("hypersell.desc")}
        </p>
      </header>

      {/* Top Tabs */}
      <div className="flex p-1 bg-slate-900/80 rounded-lg mb-6 sticky top-0 z-20 backdrop-blur-xl border border-white/5">
        {[
          { id: "text", label: t("hypersell.tab.text_to_video") },
          { id: "image", label: t("hypersell.tab.img_to_video") },
          { id: "enhance", label: t("hypersell.tab.enhance") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300",
              activeTab === tab.id
                ? "bg-slate-800 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] border border-cyan-500/30"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-6">
        {/* Input Area */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">
            {activeTab === "text"
              ? t("hypersell.prompt.title")
              : t("hypersell.source_material")}
          </label>

          {activeTab === "image" || activeTab === "enhance" ? (
            <>
              <div
                onClick={() => !uploadedFile && fileInputRef.current?.click()}
                className={cn(
                  "h-48 w-full border-2 border-dashed border-cyan-500/30 bg-slate-900/50 rounded-lg flex flex-col items-center justify-center group transition-all relative overflow-hidden",
                  !uploadedFile ? "cursor-pointer hover:border-cyan-400 hover:bg-slate-800/50" : ""
                )}
              >
                {previewUrl ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                      {uploadedFile?.type.startsWith("video/") ? (
                        <video src={previewUrl} className="h-full w-full object-contain" autoPlay loop muted />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="h-full w-auto max-w-none object-contain" />
                      )}
                    </div>
                    <button
                      onClick={handleClearUpload}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 z-30 shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.1)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Upload
                      className="text-cyan-400 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.5)] rounded-full p-1"
                      size={32}
                    />
                    <span className="text-slate-400 text-sm font-medium">
                      Tap to Upload
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                />
              </div>
              {activeTab === "image" && (
                <div className="space-y-2 mt-4">
                  <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                    {t("hypersell.prompt.title")}
                  </label>
                  <textarea
                    className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-white resize-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none transition-all placeholder:text-slate-600"
                    placeholder={t("hypersell.prompt.placeholder")}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              )}
            </>
          ) : (
            <textarea
              className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-white resize-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none transition-all placeholder:text-slate-600"
              placeholder={t("hypersell.prompt.placeholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          )}
        </div>

        {/* Parameters */}
        {activeTab !== "enhance" && (
          <>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  {t("hypersell.ratio.title")}
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-md p-2.5 outline-none focus:border-cyan-500/50"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                >
                  <option value="9:16">9:16 (Mobile)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  {t("hypersell.duration.title")}
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-md p-2.5 outline-none focus:border-cyan-500/50"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="10">10 Seconds</option>
                  <option value="15">15 Seconds</option>
                </select>
              </div>
            </div>
            {activeTab === "image" && (
              <div className="space-y-2 mt-4">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Resolution (SIZE)
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-md p-2.5 outline-none focus:border-cyan-500/50"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="small">标清 (small)</option>
                  <option value="large">高清 (large)</option>
                </select>
              </div>
            )}


          </>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-4">
        {(() => {
          const runningCountForTab = tasks.filter(
            (t) => t.type === activeTab && t.status === "running",
          ).length;
          const queuedCountForTab = tasks.filter(
            (t) => t.type === activeTab && t.status === "queued",
          ).length;
          const limitForTab = PAGE_LIMITS[activeTab];
          const isAtCapacity = runningCountForTab >= limitForTab;
          // "loading" is the short window where we are creating/uploading and haven't
          // transitioned to polling yet. Polling should NOT block starting more tasks.
          const isBusyStarting = loadingByTab[activeTab];
          const isDisabled =
            isBusyStarting ||
            isAtCapacity ||
            !isLoggedIn ||
            isEnhanceUnsupported ||
            isInsufficientCredits;

          const costText = (() => {
            if (!isLoggedIn) return t("hypersell.btn.login_required");
            if (isEnhanceUnsupported) return t("hypersell.btn.unsupported");
            if (typeof creditCost === "number") {
              if (creditCost <= 0) return t("hypersell.btn.free");
              return `${creditCost} ${t("hypersell.btn.credits")}`;
            }
            return "—";
          })();

          const mainLabel = (() => {
            if (isAtCapacity) return t("hypersell.btn.at_capacity");
            if (!isLoggedIn) return t("hypersell.btn.login_required");
            if (isEnhanceUnsupported) return t("hypersell.btn.unsupported");
            if (isInsufficientCredits) return t("hypersell.btn.insufficient");
            return `${t("hypersell.btn.generate")} (${costText})`;
          })();

          // Only show the (running/limit) badge when this mode is queuing (at capacity)
          // or there are queued tasks waiting for a slot.
          const showQueueBadge = isAtCapacity || queuedCountForTab > 0;

          return (
        <NeonButton
          onClick={handleGenerate}
          disabled={isDisabled}
          className="py-2.5 text-xs"
        >
          {isBusyStarting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("superip.panel.uploading")}
            </div>
          ) : (
            <div className="relative w-full flex items-center justify-center">
              <div className="flex items-center justify-center gap-2">
                <Zap size={18} fill="currentColor" />
                <span>{mainLabel}</span>
              </div>

              {showQueueBadge ? (
                <div className="absolute right-3 bottom-2 leading-none">
                  <span className="px-2 py-[2px] rounded-md bg-black/30 border border-white/10 text-[10px] font-bold text-white/75">
                    {runningCountForTab}/{limitForTab}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </NeonButton>
          );
        })()}
      </div>

      {/* Recent Result */}
      <div className="flex items-center justify-between mb-2 mt-8">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
          Latest Result
        </h2>
        {tasks.length > 0 && (
          <button
            onClick={() => setTasks([])}
            className="text-[10px] text-slate-600 hover:text-red-400 font-bold uppercase tracking-wider transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div
        className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 overflow-y-auto shadow-inner relative no-scrollbar"
        style={{ height: '530px' }}
      >
        {tasks.length > 0 ? (
          <div className="flex flex-col space-y-4">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} setTasks={setTasks} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-2">
            <div className="w-full aspect-[3/4] border-2 border-dashed border-slate-800/50 rounded-2xl bg-slate-950/30 flex flex-col items-center justify-center gap-6 group transition-all duration-500 hover:border-cyan-500/30 hover:bg-slate-900/40">
              <div className="w-20 h-20 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Bot size={40} className="text-slate-600 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <span className="text-slate-400 text-base font-black uppercase tracking-[0.3em]">{t("hypersell.status.waiting")}</span>
                <span className="text-slate-600 text-xs uppercase tracking-widest font-medium">{t("hypersell.status.masterpiece")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

// 3. Super IP (Digital Human)
const SuperIpView = () => {
  const { t } = useContext(LanguageContext);
  const [step, setStep] = useState(1);
  const [isSendIconPink, setIsSendIconPink] = useState(false);
  const [isAudioSelected, setIsAudioSelected] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const audioUploadInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingSuperIpAudio, setIsUploadingSuperIpAudio] = useState(false);
  const [localUploadedAudioName, setLocalUploadedAudioName] = useState<string | null>(null);

  // Dual-track upload state (mirrors desktop SuperIP): keep both remote URL (supabase) and local base64
  // so downstream APIs can use either form depending on backend requirements.
  const [characterImageBase64, setCharacterImageBase64] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [selectedAudioHistoryId, setSelectedAudioHistoryId] = useState<number | string | null>(null);
  // For GEN billing: always prefer the user's audio duration (seconds)
  const [selectedAudioDurationSec, setSelectedAudioDurationSec] = useState<number | null>(null);

  // SuperIP Gen (Step 3)
  // NOTE: Do not fall back to a default duration. If we can't resolve audio duration,
  // we must block billed actions because backend bills by req.duration (seconds).

  interface SuperIpTask {
    internalId: string;
    taskId?: string;
    status: 'queued' | 'processing' | 'success' | 'failed';
    type: 'com' | 'pro';
    resultUrl?: string;
    prompt?: string;
    timestamp: number;
    error?: string;
  }

  const [superIpGenPrompt, setSuperIpGenPrompt] = useState<string>("");
  const [superIpTasks, setSuperIpTasks] = useState<SuperIpTask[]>([]);
  // superIpGenResultUrl is used for the "Displayed" video (e.g. clicked history item)
  const [superIpGenResultUrl, setSuperIpGenResultUrl] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [superIpGenError, setSuperIpGenError] = useState<string | null>(null);
  const [superIpVideoHistory, setSuperIpVideoHistory] = useState<any[]>([]);

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (superIpGenError) {
      const timer = setTimeout(() => {
        setSuperIpGenError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [superIpGenError]);

  // Wavespeed Pro generation state (shares Result player with existing SuperIP Gen)
  // const [isStartingWavespeedPro, setIsStartingWavespeedPro] = useState(false); // Removed in favor of superIpTasks

  const WAVESPEED_DEFAULT_PROMPT = `Ultra-realistic live-action style. A professional  doctor in his late 50s, speaking confidently into a microphone. Medium close-up shot at eye level, with a softly blurred clean background. Lighting is natural and balanced, highlighting facial details.

Performance: His expressions  and naturally, synchronized with his speech. He maintains steady eye contact with the camera most of the time, occasionally glancing slightly to the side as if recalling information, then returning focus. Natural blinking at irregular intervals. Eyebrows lift gently when emphasizing key points, narrow slightly when showing concern, and relax into a calm, reassuring look when offering solutions. Mouth movements are precise and clear, sometimes pressing lips briefly between phrases.

Micro-expressions appear: faint smiles when delivering positive outcomes, slight head tilts showing thoughtfulness, and subtle nods reinforcing confidence. His torso shifts subtly to avoid stiffness, with a slight forward lean when stressing key insights, then returning to a relaxed upright position.

Overall mood: calm, professional, trustworthy, and educational — like a medical expert giving a clear, approachable health lecture. All transitions between expressions, and movements are smooth and realistic, with no abrupt or robotic changes.`;

  const looksLikeHttpUrl = (s: string) => /^https?:\/\//i.test(s);

  const startWavespeedPro = async (opts: { source: 'send-icon' | 'gen-pro' }) => {
    // Check concurrency limit (max 3 active tasks)
    const activeCount = superIpTasks.filter(t => t.status === 'processing' || t.status === 'queued').length;
    if (activeCount >= 3) {
      alert("最多允许同时运行 3 个任务");
      return;
    }

    setSuperIpGenError(null);

    const imageUrl = (selectedCharacterImage && looksLikeHttpUrl(selectedCharacterImage)) ? selectedCharacterImage : null;
    const audioUrl = (selectedAudioUrl && looksLikeHttpUrl(selectedAudioUrl)) ? selectedAudioUrl : null;

    if (!imageUrl) {
      alert('请先上传图片并拿到 URL');
      return;
    }
    if (!audioUrl) {
      alert('请先上传音频并拿到 URL');
      return;
    }

    const promptValue = opts.source === 'send-icon'
      ? WAVESPEED_DEFAULT_PROMPT
      : (superIpGenPrompt || '').trim();

    const internalId = `pro-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newTask: SuperIpTask = {
      internalId,
      status: 'processing',
      type: 'pro',
      prompt: promptValue,
      timestamp: Date.now(),
    };

    setSuperIpTasks(prev => [newTask, ...prev]);

    try {
      const durationSec = Math.max(1, Math.round(await getAudioDurationSeconds(audioUrl)));

      const res = await api.post('/api/avatar/wavespeed-infinitetalk', {
        audio: audioUrl,
        image: imageUrl,
        prompt: promptValue,
        resolution: '480p',
        seed: -1,
        duration: durationSec,
      });

      const videoUrl = String(res?.video || '').trim();
      if (!videoUrl) {
        throw new Error('Wavespeed 未返回 video URL');
      }

      setSuperIpTasks(prev => prev.map(t => t.internalId === internalId ? { ...t, status: 'success', resultUrl: videoUrl } : t));
      // If this is the latest task, update the main display
      setSuperIpGenResultUrl(videoUrl);
      loadSuperIpVideoHistory();
    } catch (e: any) {
      const msg = e?.message || String(e);
      setSuperIpGenError(msg);
      console.warn('Wavespeed Pro failed:', e);
      alert(msg);
      setSuperIpTasks(prev => prev.map(t => t.internalId === internalId ? { ...t, status: 'failed', error: msg } : t));
    }
  };


  // --- VOICE workbench (backend wired, aligned with desktop SuperIP) ---
  type VoiceItem = {
    voice_id?: string;
    id?: string;
    name?: string;
    display_name?: string;
    source_type?: string;
    [k: string]: any;
  };
  type VoiceBuckets = {
    system?: VoiceItem[];
    custom?: VoiceItem[];
    clone?: VoiceItem[];
    other?: VoiceItem[];
  };

  const [showVoiceModelDialog, setShowVoiceModelDialog] = useState(false);
  const [voiceDialogTab, setVoiceDialogTab] = useState<"system" | "custom" | "clone">("system");
  const [loadingVoiceModels, setLoadingVoiceModels] = useState(false);
  const [voiceModelError, setVoiceModelError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceBuckets>({});
  const [selectedVoiceModel, setSelectedVoiceModel] = useState<VoiceItem | null>(null);
  const [overrideVoiceId, setOverrideVoiceId] = useState<string>("");

  const [analyzedPrompt, setAnalyzedPrompt] = useState<string>("");
  const [trialText, setTrialText] = useState<string>("Hey! I'm in a great mood today. How about you?");
  const [trialAudio, setTrialAudio] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");

  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [isGeneratingTrial, setIsGeneratingTrial] = useState(false);
  const [isPlayingTrial, setIsPlayingTrial] = useState(false);
  const trialAudioRef = useRef<HTMLAudioElement | null>(null);
  const [trialAudioUrl, setTrialAudioUrl] = useState<string>("");

  // Clone preview player state (native <audio controls> looks bad on mobile)
  const clonePreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingClonePreview, setIsPlayingClonePreview] = useState(false);
  const [clonePreviewDuration, setClonePreviewDuration] = useState(0);
  const [clonePreviewCurrentTime, setClonePreviewCurrentTime] = useState(0);

  // Result audio player (custom UI)
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingResult, setIsPlayingResult] = useState(false);
  const [resultDuration, setResultDuration] = useState(0);
  const [resultCurrentTime, setResultCurrentTime] = useState(0);

  const cloneInputRef = useRef<HTMLInputElement>(null);
  const [cloneUploading, setCloneUploading] = useState(false);
  const [cloneFileId, setCloneFileId] = useState<string>("");
  const [cloneAudioUrl, setCloneAudioUrl] = useState<string>("");
  const [isCloningPreview, setIsCloningPreview] = useState(false);
  const [cloneDisplayName, setCloneDisplayName] = useState<string>("");
  const [showCloneRename, setShowCloneRename] = useState(false);
  const [cloneRenameDraft, setCloneRenameDraft] = useState<string>("");

  // 图库相关状态
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // 音频历史记录相关状态
  const [showAudioGallery, setShowAudioGallery] = useState(false);
  const [audioHistory, setAudioHistory] = useState<any[]>([]);
  const [loadingAudioHistory, setLoadingAudioHistory] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  // RunningHub fileName for SuperIP GEN (desktop parity)
  const [superIpAudioRhFileName, setSuperIpAudioRhFileName] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generatedAudios = [
    { id: 1, name: "speech_20251022.mp3", duration: "03:08:12", text: "在日本，如果你开通了TikTok账号，但是怎么发影片呢都没有任何收入，那就打开你的TikTok跟我一起操作，上个月呢，收入了5位数 现在我要把这个增加收入的方法..." },
    { id: 2, name: "speech_20251023.mp3", duration: "03:07:07", text: "你好呀" },
    { id: 3, name: "speech_20251024.mp3", duration: "03:06:56", text: "你好呀" },
    { id: 4, name: "speech_20251025.mp3", duration: "08:13:22", text: "能够变现的方案A信我给你一套搞钱逻辑，这也是我花了几个月的时间，我用心去研究出来的。我觉得只要是你们用心去干啊，都能拿到结果。希望所有关注我的人啊..." },
  ];
  const [prompt, setPrompt] = useState("");
  const [selectedBase, setSelectedBase] = useState<
    number | null
  >(null);
  // 上传框里显示的「选中角色」图片（与结果区解耦）
  const [selectedCharacterImage, setSelectedCharacterImage] = useState<string | null>(null);
  // RunningHub fileName for SuperIP GEN (desktop parity)
  const [superIpCharacterRhFileName, setSuperIpCharacterRhFileName] = useState<string | null>(null);
  const characterUploadInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCharacterImage, setIsUploadingCharacterImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<
    string | null
  >(null);
  const [voiceText, setVoiceText] = useState("");
  const [generatedAudio, setGeneratedAudio] =
    useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Credits check cache (mobile SuperIP) ---
  type CreditsCheckData = {
    allowed?: boolean;
    required_credits?: number;
    current_credits?: number;
    tier?: string;
    upgrade_required?: boolean;
    insufficient_credits?: boolean;
    daily_limit_reached?: boolean;
    [k: string]: any;
  };

  const [creditsCheckImage, setCreditsCheckImage] = useState<CreditsCheckData | null>(null);
  const [creditsCheckLoadingImage, setCreditsCheckLoadingImage] = useState(false);

  const [creditsCheckVoice, setCreditsCheckVoice] = useState<CreditsCheckData | null>(null);
  const [creditsCheckLoadingVoice, setCreditsCheckLoadingVoice] = useState(false);

  const [creditsCheckGenCom, setCreditsCheckGenCom] = useState<CreditsCheckData | null>(null);
  const [creditsCheckLoadingGenCom, setCreditsCheckLoadingGenCom] = useState(false);

  const [creditsCheckGenPro, setCreditsCheckGenPro] = useState<CreditsCheckData | null>(null);
  const [creditsCheckLoadingGenPro, setCreditsCheckLoadingGenPro] = useState(false);

  // System/library voice billing (match desktop Vgot_front):
  // - within 400 chars => 20 credits
  // - each additional 400 chars => +20 credits
  // We express this as "units" so quantity can be passed to /api/credits/check.
  const systemVoiceUnitsForText = (textLen: number) => {
    const n = Math.max(0, Number(textLen) || 0);
    if (n <= 0) return 0;
    return Math.ceil(n / 400);
  };

  const checkCredits = async (actionType: string, quantity: number) => {
    const token = localStorage.getItem("access_token");
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
    if (!token) throw new Error("401");

    const resp = await fetch(`${API_BASE}/api/credits/check`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action_type: actionType, quantity }),
    });

    if (resp.status === 401) throw new Error("401");
    const json = await resp.json().catch(() => null);
    const data = (json?.data || json) as CreditsCheckData | null;
    return data;
  };

  const refreshMeBestEffort = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
      if (!token) return;

      const r = await fetch(`${API_BASE}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const j = await r.json().catch(() => null);
      if (j && typeof j?.credits === "number") {
        localStorage.setItem("credits", String(j.credits));
      }
    } catch {
      // ignore
    }
  };

  // Prefetch credit costs for better UX (show on button before click)
  useEffect(() => {
    if (step !== 1) return;
    let cancelled = false;
    (async () => {
      try {
        setCreditsCheckLoadingImage(true);
        const d = await checkCredits("superip_image_gen", 1);
        if (!cancelled) setCreditsCheckImage(d);
      } catch {
        // If not logged in (or check fails), just don't show the badge.
        if (!cancelled) setCreditsCheckImage(null);
      } finally {
        if (!cancelled) setCreditsCheckLoadingImage(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, prompt]);

  useEffect(() => {
    if (step !== 2) return;
    if (!voiceText || !voiceText.trim()) {
      // When the input is empty, don't keep showing stale required_credits.
      setCreditsCheckVoice(null);
      setCreditsCheckLoadingVoice(false);
      return;
    }
    const source_type = overrideVoiceId ? "system" : cloneFileId ? "clone" : "waveform";
    const actionType = source_type === "system" ? "superip_voice_gen_system" : "superip_voice_gen_waveform";
    const qty = source_type === "system" ? systemVoiceUnitsForText(voiceText.trim().length) : 1;
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setCreditsCheckLoadingVoice(true);
          const d = await checkCredits(actionType, Math.max(1, qty));
          if (!cancelled) setCreditsCheckVoice(d);
        } catch {
          // ignore
        } finally {
          if (!cancelled) setCreditsCheckLoadingVoice(false);
        }
      })();
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, voiceText, overrideVoiceId, cloneFileId]);

  useEffect(() => {
    // if (step !== 3) return; // Allow credit check for all steps
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setCreditsCheckLoadingGenCom(true);
          const resolved =
            typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0
              ? Math.max(1, Math.round(selectedAudioDurationSec))
              : (selectedAudioUrl
                  ? Math.max(1, Math.round(await getAudioDurationSeconds(String(selectedAudioUrl))))
                  : 0);

          // If we cannot resolve duration, we also cannot compute required credits.
          // Clear the badge instead of guessing.
          if (!resolved || resolved <= 0) {
            if (!cancelled) setCreditsCheckGenCom(null);
            return;
          }
          // IMPORTANT: /api/credits/check expects quantity in *units* (seconds here),
          // and backend will compute required_credits = cost_per_unit * quantity.
          const d = await checkCredits("superip_video_gen", resolved);
          if (!cancelled) setCreditsCheckGenCom(d);
        } catch {
          // ignore
        } finally {
          if (!cancelled) setCreditsCheckLoadingGenCom(false);
        }
      })();
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedAudioUrl, selectedAudioDurationSec]);

  // Prefetch Pro credit costs (durationSec * 80) so we can show it on the PRO button
  useEffect(() => {
    // if (step !== 3) return; // Allow credit check for all steps
    let cancelled = false;
    const t = setTimeout(() => {
      (async () => {
        try {
          setCreditsCheckLoadingGenPro(true);
          const resolved =
            typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0
              ? Math.max(1, Math.round(selectedAudioDurationSec))
              : (selectedAudioUrl
                  ? Math.max(1, Math.round(await getAudioDurationSeconds(String(selectedAudioUrl))))
                  : 0);

          if (!resolved || resolved <= 0) {
            if (!cancelled) setCreditsCheckGenPro(null);
            return;
          }

          // Same rule: quantity is seconds.
          const d = await checkCredits("superip_video_gen_pro", resolved).catch(() =>
            checkCredits("superip_video_gen", resolved)
          );
          if (!cancelled) setCreditsCheckGenPro(d);
        } catch {
          // ignore
        } finally {
          if (!cancelled) setCreditsCheckLoadingGenPro(false);
        }
      })();
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedAudioUrl, selectedAudioDurationSec]);

  const loadSuperIpVideoHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const params = new URLSearchParams({
        source_page: 'SuperIP',
        content_type: 'video',
        limit: '30',
      });
      const response = await fetch(`${API_BASE}/api/history/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        setSuperIpVideoHistory([]);
        return;
      }
      const data = await response.json();
      setSuperIpVideoHistory(Array.isArray(data) ? data : []);
    } catch {
      setSuperIpVideoHistory([]);
    }
  };

  // Ensure GEN step shows history immediately (not only after a new generation)
  useEffect(() => {
    if (step === 3) {
      loadSuperIpVideoHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const getAudioDurationSeconds = (urlOrDataUrl: string): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const a = new Audio();
        a.preload = 'metadata';
        a.src = urlOrDataUrl;
        a.onloadedmetadata = () => {
          const d = Number.isFinite(a.duration) ? a.duration : 0;
          resolve(Math.max(1, Math.round(d || 0)));
        };
        a.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  };

  const getAudioDurationSecondsFromFile = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const objUrl = URL.createObjectURL(file);
        const a = new Audio();
        a.preload = 'metadata';
        a.src = objUrl;
        a.onloadedmetadata = () => {
          try {
            URL.revokeObjectURL(objUrl);
          } catch {
            // ignore
          }
          const d = Number.isFinite(a.duration) ? a.duration : 0;
          resolve(Math.max(1, Math.round(d || 0)));
        };
        a.onerror = () => {
          try {
            URL.revokeObjectURL(objUrl);
          } catch {
            // ignore
          }
          resolve(0);
        };
      } catch {
        resolve(0);
      }
    });
  };

  const resolveSelectedAudioDurationSeconds = async (opts: { file?: File; url?: string | null }) => {
    const dFromFile = opts.file ? await getAudioDurationSecondsFromFile(opts.file) : 0;
    if (dFromFile > 0) {
      setSelectedAudioDurationSec(dFromFile);
      return dFromFile;
    }
    const u = (opts.url || '').toString().trim();
    if (u) {
      const d = await getAudioDurationSeconds(u);
      if (d > 0) setSelectedAudioDurationSec(d);
      return d;
    }
    setSelectedAudioDurationSec(null);
    return 0;
  };

  const uploadDataUrlToSupabase = async (fileData: string, filename: string, folder: string) => {
    const res = await api.post('/api/files/upload', {
      file_data: fileData,
      filename,
      folder,
    });
    const url = res?.url || res?.file_url || res?.stored_url || res?.supabase_url;
    if (!url || typeof url !== 'string') {
      throw new Error('Upload failed');
    }
    return url;
  };

  const RH_UPLOAD_URL = 'https://www.runninghub.cn/task/openapi/upload';

  const uploadFileOrUrlToRunningHub = async (opts: {
    file?: File;
    dataUrl?: string;
    apiKey: string;
  }): Promise<string> => {
    // Goal: return RunningHub fileName for /api/superip/start.
    // Strategy (mirrors Vgot_front behavior):
    // 1) If we have a real File -> upload directly to RH.
    // 2) If we only have dataUrl -> decode to Blob and upload to RH.
    // Note: RH cannot fetch dataUrl by itself.
    const { file, dataUrl, apiKey } = opts;
    if (!apiKey) throw new Error('Missing RunningHub apiKey');

    const toFileFromDataUrl = async (du: string) => {
      const resp = await fetch(du);
      const blob = await resp.blob();
      const ext = (() => {
        const t = (blob.type || '').toLowerCase();
        if (t.includes('png')) return 'png';
        if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
        if (t.includes('webp')) return 'webp';
        if (t.includes('wav')) return 'wav';
        if (t.includes('mpeg') || t.includes('mp3')) return 'mp3';
        if (t.includes('mp4')) return 'mp4';
        return 'bin';
      })();
      const name = `superip_${Date.now()}.${ext}`;
      return new File([blob], name, { type: blob.type || 'application/octet-stream' });
    };

    const f = file || (dataUrl ? await toFileFromDataUrl(dataUrl) : null);
    if (!f) throw new Error('No file/dataUrl provided');

    const form = new FormData();
    form.append('apiKey', apiKey);
    form.append('file', f);
    form.append('fileType', 'input');

    const rhResp = await fetch(RH_UPLOAD_URL, { method: 'POST', body: form });
    const rhData = await rhResp.json().catch(() => null);
    if (!rhResp.ok || !rhData || rhData.code !== 0) {
      const msg = rhData?.msg || `HTTP ${rhResp.status}`;
      throw new Error(`RunningHub upload failed: ${msg}`);
    }
    const fileName = rhData?.data?.fileName;
    if (!fileName) throw new Error('RunningHub upload failed: missing fileName');
    return String(fileName);
  };

  const startSuperIpGen = async (mode: 'default' | 'custom' | 'pro') => {
    // Credits check: backend bills per second.
    // IMPORTANT: /api/credits/check expects quantity in seconds (units),
    // not pre-multiplied credits.
    try {
      setCreditsCheckLoadingGenCom(true);
      const durationSec =
        typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0
          ? Math.max(1, Math.round(selectedAudioDurationSec))
          : (selectedAudioUrl
              ? Math.max(1, Math.round(await getAudioDurationSeconds(String(selectedAudioUrl))))
              : 0);

      if (!durationSec || durationSec <= 0) {
        alert('无法获取音频时长，任务无法执行。请重新上传音频或选择可访问的音频链接。');
        return;
      }
      const actionType = mode === 'pro' ? "superip_video_gen_pro" : "superip_video_gen";
      const check = await checkCredits(actionType, durationSec);
      if (mode === 'pro') {
        setCreditsCheckGenPro(check);
      } else {
        setCreditsCheckGenCom(check);
      }
      if (check && check.allowed === false) {
        if (check.upgrade_required) {
          alert("需要升级套餐才能使用该功能");
        } else if (check.daily_limit_reached) {
          alert("今日次数已用完，请稍后再试或升级套餐");
        } else if (check.insufficient_credits) {
          alert("积分不足");
        } else {
          alert("暂不可用");
        }
        return;
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("401")) {
        alert("请先登录");
        return;
      }
      console.warn("Credits check (gen/com) failed:", e);
      // Fail-open
    } finally {
      setCreditsCheckLoadingGenCom(false);
    }

    // Check concurrency limit (max 3 active tasks)
    const activeCount = superIpTasks.filter(t => t.status === 'processing' || t.status === 'queued').length;
    if (activeCount >= 3) {
      alert("最多允许同时运行 3 个任务");
      return;
    }

    setSuperIpGenError(null);

    if (!selectedCharacterImage && !characterImageBase64) {
      alert('请先选择/生成角色图片');
      return;
    }
    if (!selectedAudioUrl && !audioBase64) {
      alert('请先选择/生成音频');
      return;
    }

    const internalId = `com-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newTask: SuperIpTask = {
      internalId,
      status: 'processing',
      type: 'com',
      prompt: (superIpGenPrompt || '').trim(),
      timestamp: Date.now(),
    };

    setSuperIpTasks(prev => [newTask, ...prev]);

    try {
      // Vgot_front behavior: SuperIP video gen ultimately wants RunningHub fileName.
      // - Image: prefer existing RunningHub fileName; fallback to uploading current selection (file/dataUrl) to RH.
      // - Audio: prefer existing RunningHub fileName; fallback to uploading current selection (file/dataUrl) to RH.
      // We DO NOT hard-require Supabase URL on GEN.

      const RH_IMAGE_API_KEY = (import.meta as any).env?.VITE_RH_IMAGE_API_KEY || (import.meta as any).env?.VITE_RUNNINGHUB_IMAGE_API_KEY || '';
      const RH_AUDIO_API_KEY = (import.meta as any).env?.VITE_RH_AUDIO_API_KEY || (import.meta as any).env?.VITE_RUNNINGHUB_AUDIO_API_KEY || '';

    // Heuristic: if the stored value already looks like a RH fileName (not an URL), keep it.
    const looksLikeHttpUrl = (s: string) => /^https?:\/\//i.test(s);
    const looksLikeDataUrl = (s: string) => /^data:/i.test(s);
    const looksLikeRhFileName = (s: string) => !!s && !looksLikeHttpUrl(s) && !looksLikeDataUrl(s);

      // 1) Resolve image_file_name
      let imageFileName: string | null = null;
      // Prefer RH filename produced during CHAR step
      if (superIpCharacterRhFileName && looksLikeRhFileName(superIpCharacterRhFileName)) {
        imageFileName = superIpCharacterRhFileName;
      } else if (selectedCharacterImage && looksLikeRhFileName(selectedCharacterImage)) {
        // Back-compat: if something already stored a RH-like value in selectedCharacterImage, accept it.
        imageFileName = selectedCharacterImage;
      }
      if (!imageFileName) {
        // Desktop parity: if we don't have a RH fileName, desktop falls back to using public URL.
        // Mobile: prefer Supabase URL when present; else try dataUrl; only then upload to RH.
        if (selectedCharacterImage && looksLikeHttpUrl(selectedCharacterImage)) {
          imageFileName = selectedCharacterImage;
        } else if (characterImageBase64) {
          imageFileName = characterImageBase64;
        } else if (selectedCharacterImage && looksLikeDataUrl(selectedCharacterImage)) {
          imageFileName = selectedCharacterImage;
        } else {
          // last resort
          imageFileName = await uploadFileOrUrlToRunningHub({
            apiKey: RH_IMAGE_API_KEY,
            dataUrl: characterImageBase64 || (selectedCharacterImage && looksLikeDataUrl(selectedCharacterImage) ? selectedCharacterImage : undefined),
          });
        }
      }

      // 2) Resolve audio_file_name
      let audioFileName: string | null = null;
      // Prefer RH filename produced during VOICE step
      if (superIpAudioRhFileName && looksLikeRhFileName(superIpAudioRhFileName)) {
        audioFileName = superIpAudioRhFileName;
      } else if (selectedAudioUrl && looksLikeRhFileName(selectedAudioUrl)) {
        // Back-compat: if something already stored a RH-like value in selectedAudioUrl, accept it.
        audioFileName = selectedAudioUrl;
      }
      if (!audioFileName) {
        // Desktop parity: if we don't have a RH fileName, allow passing through public URL.
        // Mobile: prefer Supabase URL when present; else try dataUrl; only then upload to RH.
        if (selectedAudioUrl && looksLikeHttpUrl(selectedAudioUrl)) {
          audioFileName = selectedAudioUrl;
        } else if (audioBase64) {
          audioFileName = audioBase64;
        } else if (selectedAudioUrl && looksLikeDataUrl(selectedAudioUrl)) {
          audioFileName = selectedAudioUrl;
        } else {
          // last resort
          audioFileName = await uploadFileOrUrlToRunningHub({
            apiKey: RH_AUDIO_API_KEY,
            dataUrl: audioBase64 || (selectedAudioUrl && looksLikeDataUrl(selectedAudioUrl) ? selectedAudioUrl : undefined),
          });
        }
      }

      // 3) Determine duration
      // Backend bills by req.duration (seconds). Desktop uses audio duration.
      const durationSec =
        typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0
          ? Math.max(1, Math.round(selectedAudioDurationSec))
          : (selectedAudioUrl
              ? Math.max(1, Math.round(await getAudioDurationSeconds(String(selectedAudioUrl))))
              : 0);

      if (!durationSec || durationSec <= 0) {
        throw new Error('无法获取音频时长，任务无法执行。请重新上传音频或选择可访问的音频链接。');
      }

      const startEndpoint = mode === 'pro' ? '/api/superip/start_pro' : '/api/superip/start';
      const res = await api.post(startEndpoint, {
        image_file_name: imageFileName,
        audio_file_name: audioFileName,
        prompt: (superIpGenPrompt || '').trim() || null,
        duration: durationSec,
      });

      const taskId = String(res?.task_id || res?.taskId || '').trim();
      if (!taskId) {
        throw new Error('后端未返回 task_id');
      }
      
      setSuperIpTasks(prev => prev.map(t => t.internalId === internalId ? { ...t, taskId } : t));

      // 4) Poll outputs
      const POLL_MS = 2500;
      const MAX_TRIES = 240; // ~10 minutes
      for (let i = 0; i < MAX_TRIES; i++) {
        const out = await api.get(`/api/superip/outputs/${encodeURIComponent(taskId)}`);
        if (out?.status === 'success') {
          const finalUrl = out?.stored_url || out?.file_url;
          if (finalUrl) {
            setSuperIpTasks(prev => prev.map(t => t.internalId === internalId ? { ...t, status: 'success', resultUrl: String(finalUrl) } : t));
            setSuperIpGenResultUrl(String(finalUrl));
          }
          // backend already saves history in outputs; refresh mini history
          loadSuperIpVideoHistory();
          // Sync credits
          refreshMeBestEffort();
          break;
        } else if (out?.status === 'failed') {
           throw new Error(out?.error || 'Generation failed');
        }
        // running
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      setSuperIpGenError(msg);
      console.warn('SuperIP Gen failed:', e);
      if (String(msg).includes('401')) {
        alert('请先登录');
      } else {
        alert(msg);
      }
      setSuperIpTasks(prev => prev.map(t => t.internalId === internalId ? { ...t, status: 'failed', error: msg } : t));
    }
  };

  const clearSuperIpGen = () => {
    setSuperIpGenPrompt('');
    // setSuperIpGenTaskId(''); // Removed
    setSuperIpGenResultUrl(null);
    setSuperIpGenError(null);
  };

  const steps = [
    { num: 1, name: "Char" },
    { num: 2, name: "Voice" },
    { num: 3, name: "Gen" },
  ];

  // 生成图片
  const handleGenerateImage = async () => {
    if (!prompt || !prompt.trim()) {
      alert('请输入提示词');
      return;
    }

    // Credits check: CHAR only charges for image generation.
    try {
      setCreditsCheckLoadingImage(true);
      const check = await checkCredits("superip_image_gen", 1);
      setCreditsCheckImage(check);
      if (check && check.allowed === false) {
        if (check.upgrade_required) {
          alert("需要升级套餐才能使用该功能");
        } else if (check.daily_limit_reached) {
          alert("今日次数已用完，请稍后再试或升级套餐");
        } else if (check.insufficient_credits) {
          alert("积分不足");
        } else {
          alert("暂不可用");
        }
        return;
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("401")) {
        alert("请先登录");
        return;
      }
      console.warn("Credits check failed:", e);
      // Fail-open: if check endpoint is down, let backend generation endpoint decide.
    } finally {
      setCreditsCheckLoadingImage(false);
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem('access_token');
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
      
      const response = await fetch(`${API_BASE}/api/superip/generate-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 SuperIP 后端响应:', data);
        
        // 兼容多种返回格式: data.url, data.data.url, data.image_url
        const generatedImageUrl = data?.url || data?.data?.url || data?.image_url || null;
        
        if (generatedImageUrl) {
          // 立即显示图片在结果区
          setGeneratedImage(generatedImageUrl);
          // 同步到上传框（方便用户继续下一步），但删除按钮只会清理上传框
          setSelectedCharacterImage(generatedImageUrl);
          console.log('✅ 图片生成成功:', generatedImageUrl);

          // 持久存储到图库（历史记录），确保下次打开「打开图库」也能看到
          try {
            const savePayload = {
              content_type: 'image',
              content_subtype: 'superip_character',
              source_page: 'SuperIP',
              file_data: generatedImageUrl,
              prompt: prompt.trim(),
              generation_params: {},
              api_endpoint: '/api/superip/generate-image',
              api_response_data: data,
            };

            // best-effort，不阻塞UI
            fetch(`${API_BASE}/api/history/save`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(savePayload),
            })
              .then(async (r) => {
                if (!r.ok) {
                  const errText = await r.text().catch(() => '');
                  console.warn('⚠️ 保存到图库失败:', r.status, errText);
                  return null;
                }
                return r.json().catch(() => null);
              })
              .then((saved) => {
                // 若后端转存到 Supabase 并返回 file_url，则用它更新结果 URL
                const savedUrl = saved?.file_url || saved?.stored_url || saved?.supabase_url;
                if (savedUrl && typeof savedUrl === 'string') {
                  setGeneratedImage(savedUrl);
                  setSelectedCharacterImage(savedUrl);
                }
              })
              .catch((e) => console.warn('⚠️ 保存到图库异常:', e));
          } catch (e) {
            console.warn('⚠️ 保存到图库异常:', e);
          }
          
          // 刷新图库（后台静默加载）
          loadGalleryImages();
          // Sync credits after successful deduction
          refreshMeBestEffort();
        } else {
          console.error('❌ 未找到图片URL，完整响应:', data);
          alert('生成失败：未返回图片URL');
        }
      } else {
        if (response.status === 401) {
          alert('请先登录');
          return;
        }
        const errorData = await response.json().catch(() => ({} as any));
        alert(`生成失败: ${errorData.detail || response.statusText}`);
      }
    } catch (error) {
      console.error('❌ 生成图片失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 加载图库图片
  const loadGalleryImages = async () => {
    setLoadingGallery(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
      
      const params = new URLSearchParams({
        source_page: 'SuperIP',
        content_type: 'image',
        limit: '50'
      });
      
      const response = await fetch(`${API_BASE}/api/history/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 图库加载成功:', data);
        setGalleryImages(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ 图库加载失败:', response.status, response.statusText);
        setGalleryImages([]);
      }
    } catch (error) {
      console.error('❌ 加载图库失败:', error);
      setGalleryImages([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  // 打开图库
  const handleOpenGallery = () => {
    setShowGallery(true);
    loadGalleryImages();
  };

  const handlePickCharacterImage = () => {
    if (isUploadingCharacterImage) return;
    if (characterUploadInputRef.current) {
      // allow selecting the same file again
      characterUploadInputRef.current.value = "";
      characterUploadInputRef.current.click();
    }
  };

  const handleCharacterImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Guard: only allow images
    if (!file.type?.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    setIsUploadingCharacterImage(true);
    try {
      // Clear previous RH fileName; we'll set a fresh one if RH upload succeeds
      setSuperIpCharacterRhFileName(null);

      // Track B: local base64 (data URL) for APIs that need inline upload
      try {
        const b64 = await fileToDataUrl(file);
        setCharacterImageBase64(b64);
      } catch {
        // ignore base64 failure; URL track still works
        setCharacterImageBase64(null);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "images");

      const uploadRes = await api.post("/api/supabase/upload", formData);
      if (!uploadRes?.success) {
        alert(uploadRes?.error || "上传失败");
        return;
      }
      const url = uploadRes?.url;
      if (!url) {
        alert("上传失败：未返回 url");
        return;
      }

      setSelectedCharacterImage(url);

      // Desktop parity: upload the same image file to RunningHub to get a fileName for GEN.
      // Note: this is NOT a Supabase URL requirement; it's the primary contract for GEN.
      try {
        const RH_IMAGE_API_KEY = (import.meta as any).env?.VITE_RH_IMAGE_API_KEY || (import.meta as any).env?.VITE_RUNNINGHUB_IMAGE_API_KEY || '';
        if (RH_IMAGE_API_KEY) {
          const rhName = await uploadFileOrUrlToRunningHub({ apiKey: RH_IMAGE_API_KEY, file });
          setSuperIpCharacterRhFileName(rhName);
        }
      } catch (rhErr) {
        console.warn('RunningHub image upload failed (non-blocking):', rhErr);
        // Non-blocking: user can still proceed; GEN will fallback-upload if needed.
      }
      // Note: per product requirement, local uploads should NOT be stored into the gallery.
      // Gallery is reserved for generated assets / history items.
    } catch (err: any) {
      alert(err?.message || "上传失败");
    } finally {
      setIsUploadingCharacterImage(false);
    }
  };

  // 选择图库中的图片
  const handleSelectGalleryImage = (imageUrl: string) => {
    // 选中图库图片：只填充「上传角色」框（不影响结果区）
    setSelectedCharacterImage(imageUrl);
    // Gallery items don't currently carry RH fileName in our history schema; clear so GEN can fallback-upload if needed.
    setSuperIpCharacterRhFileName(null);
    setShowGallery(false);
  };

  // 加载音频历史记录
  const loadAudioHistory = async () => {
    setLoadingAudioHistory(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
      
      const params = new URLSearchParams({
        source_page: 'SuperIP',
        content_type: 'audio',
        limit: '50'
      });
      
      const response = await fetch(`${API_BASE}/api/history/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 音频历史加载成功:', data);
        setAudioHistory(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ 音频历史加载失败:', response.status, response.statusText);
        setAudioHistory([]);
      }
    } catch (error) {
      console.error('❌ 加载音频历史失败:', error);
      setAudioHistory([]);
    } finally {
      setLoadingAudioHistory(false);
    }
  };

  // 打开音频历史
  const handleOpenAudioGallery = () => {
    setShowAudioGallery(true);
    loadAudioHistory();
  };

  // 选择音频
  const handleSelectAudio = (audioUrl: string) => {
    setSelectedAudioUrl(audioUrl);
    // Sync to UI that previously relied on selectedAudio (File) so the "Generated Audio" card updates.
    setSelectedAudio({ name: 'Audio selected', url: audioUrl });
    // URL/history selections generally don't have RH fileName; clear so GEN can fallback-upload if needed.
    setSuperIpAudioRhFileName(null);
  // Prefer duration from URL
  resolveSelectedAudioDurationSeconds({ url: audioUrl });
    // Keep the history modal open so the user can see the selected border highlight.
    // (They can close manually via the close button.)
    // setShowAudioGallery(false);
  };

  const handleSelectAudioHistoryItem = (audio: any) => {
    const url = (audio?.file_url || audio?.url || audio?.audio_url || '').toString();
    if (!url) return;
    setSelectedAudioHistoryId(audio?.id ?? null);
    handleSelectAudio(url);
  };

  const normalizeUrlForCompare = (url: string | null | undefined) => {
    const u = (url || '').trim();
    if (!u) return '';
    // normalize common differences: signed urls / cache-busters
    return u.split('#')[0].split('?')[0];
  };

  const handleClearSelectedAudio = () => {
    setSelectedAudioUrl(null);
    setSelectedAudio(null);
    setLocalUploadedAudioName(null);
    setAudioBase64(null);
    setSelectedAudioDurationSec(null);
    setSuperIpAudioRhFileName(null);
    setSelectedAudioHistoryId(null);
    // Clear GEN credit badges immediately when audio is cleared
    setCreditsCheckGenCom(null);
    setCreditsCheckGenPro(null);
    setCreditsCheckLoadingGenCom(false);
    setCreditsCheckLoadingGenPro(false);
    if (audioUploadInputRef.current) audioUploadInputRef.current.value = "";
  };

  // Clear only local-uploaded audio (keep history selection state intact)
  const handleClearLocalAudioUpload = () => {
    setSelectedAudioUrl(null);
    setLocalUploadedAudioName(null);
    setAudioBase64(null);
    setSuperIpAudioRhFileName(null);
    // Local upload cleared => duration is unknown again; clear credit badges
    setSelectedAudioDurationSec(null);
    setCreditsCheckGenCom(null);
    setCreditsCheckGenPro(null);
    setCreditsCheckLoadingGenCom(false);
    setCreditsCheckLoadingGenPro(false);
    if (audioUploadInputRef.current) audioUploadInputRef.current.value = "";
  };

  const handlePickAudioFile = () => {
    if (isUploadingSuperIpAudio) return;
    if (audioUploadInputRef.current) {
      // allow selecting the same file again
      audioUploadInputRef.current.value = "";
      audioUploadInputRef.current.click();
    }
  };

  const handleAudioFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSuperIpAudio(true);
    try {
      // Clear previous RH fileName; we'll set a fresh one if RH upload succeeds
      setSuperIpAudioRhFileName(null);

      // Track B: base64 (data URL) for APIs that may require inline audio
      try {
        const b64 = await fileToDataUrl(file);
        setAudioBase64(b64);
      } catch {
        setAudioBase64(null);
      }

      const result = await uploadSuperIpAudio(file, api.post);
      if ("error" in result) {
        alert(result.error);
        return;
      }
      // Local upload: set the source URL but don't overwrite the Generated Audio card state.
      setSelectedAudioUrl(result.url);
      setLocalUploadedAudioName(file.name);
  // Prefer duration from local file (no CORS issues)
  resolveSelectedAudioDurationSeconds({ file, url: result.url });

      // Desktop parity: upload the same audio file to RunningHub to get a fileName for GEN.
      try {
        const RH_AUDIO_API_KEY = (import.meta as any).env?.VITE_RH_AUDIO_API_KEY || (import.meta as any).env?.VITE_RUNNINGHUB_AUDIO_API_KEY || '';
        if (RH_AUDIO_API_KEY) {
          const rhName = await uploadFileOrUrlToRunningHub({ apiKey: RH_AUDIO_API_KEY, file });
          setSuperIpAudioRhFileName(rhName);
        }
      } catch (rhErr) {
        console.warn('RunningHub audio upload failed (non-blocking):', rhErr);
      }
    } catch (err: any) {
      alert(err?.message || "上传失败");
    } finally {
      setIsUploadingSuperIpAudio(false);
    }
  };

  const clearCharacterSelection = () => {
    setSelectedCharacterImage(null);
    setCharacterImageBase64(null);
    setSuperIpCharacterRhFileName(null);
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(blob);
    });

  // 播放/暂停音频
  const toggleAudioPlay = (audioUrl: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    if (playingAudio === audioUrl) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setPlayingAudio(audioUrl);
      
      audioRef.current.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  const CharacterUploadBox = ({
    selectedImage,
    allowOpenWhenSelected,
  }: {
    selectedImage: string | null;
    allowOpenWhenSelected: boolean;
  }) => {
    return (
      <button
        type="button"
        onClick={() => {
          if (!selectedImage || allowOpenWhenSelected) handlePickCharacterImage();
        }}
        className={cn(
          "w-16 h-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed rounded-lg bg-slate-950/30 transition-all cursor-pointer group relative overflow-hidden",
          selectedImage
            ? "border-slate-700"
            : "border-slate-700 hover:border-cyan-500/50",
        )}
        aria-label={selectedImage ? "Selected character" : "Upload character"}
      >
        <input
          type="file"
          ref={characterUploadInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleCharacterImageSelected}
        />
        {selectedImage ? (
          <>
            <StableImage
              src={selectedImage}
              alt="Selected character"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearCharacterSelection();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  clearCharacterSelection();
                }
              }}
              aria-label="Clear selected character"
              className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
              style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
            >
              ×
            </span>
          </>
        ) : (
          <>
            <ImageIcon
              size={18}
              className="text-slate-600 group-hover:text-cyan-400 transition-colors"
            />
            <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
              {isUploadingCharacterImage ? t("superip.panel.uploading") : t("superip.panel.upload_char")}
            </span>
          </>
        )}
      </button>
    );
  };

  const voiceItemLabel = (v: VoiceItem) =>
    (v?.display_name || v?.name || v?.voice_id || v?.id || "Voice").toString();

  const stopTrialPlayback = () => {
    try {
      if (trialAudioRef.current) {
        trialAudioRef.current.pause();
        trialAudioRef.current.currentTime = 0;
      }
    } catch {
      // ignore
    }
    setIsPlayingTrial(false);
  };

  const hexToObjectUrl = (hexString: string, mime = "audio/mpeg"): string => {
    const clean = (hexString || "").trim();
    if (!clean) return "";
    const bytes = new Uint8Array(Math.floor(clean.length / 2));
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  };

  const getTrialAudioPlayableUrl = (trial: string): string => {
    const t = (trial || "").trim();
    if (!t) return "";
    if (/^https?:\/\//i.test(t) || t.startsWith("/")) return t;
    // if it looks like hex (desktop uses hex)
    if (/^[0-9a-fA-F]+$/.test(t) && t.length > 100) {
      return hexToObjectUrl(t);
    }
    // last resort: treat as url-ish
    return t;
  };

  const playTrial = (trial: string) => {
    const nextUrl = getTrialAudioPlayableUrl(trial);
    if (!nextUrl) {
      alert("暂无试听音频");
      return;
    }

    // if it was a previous blob url, revoke it
    if (trialAudioUrl && trialAudioUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(trialAudioUrl);
      } catch {
        // ignore
      }
    }

    setTrialAudioUrl(nextUrl);
    if (!trialAudioRef.current) {
      trialAudioRef.current = new Audio();
    }
    const a = trialAudioRef.current;
    a.src = nextUrl;
    a.onended = () => {
      setIsPlayingTrial(false);
    };
    a.onerror = () => {
      setIsPlayingTrial(false);
    };

    a.play()
      .then(() => setIsPlayingTrial(true))
      .catch(() => {
        setIsPlayingTrial(false);
        alert("试听播放失败");
      });
  };

  const analyzeVoiceFromCharacter = async (): Promise<string> => {
    if (!selectedCharacterImage) {
      alert("请先选择角色图片");
      return "";
    }
    if (isAnalyzingVoice) return analyzedPrompt;
    setIsAnalyzingVoice(true);
    try {
      // Dual-track: prefer base64 if present (desktop uses a base64 track for some backends),
      // but keep image_url for backward compatibility.
      const payload: any = {
        image_url: selectedCharacterImage,
        ...(characterImageBase64 ? { image_base64: characterImageBase64 } : {}),
      };
      const res: any = await api.post("/api/voice/design", payload);

      // desktop returns choices[0].message.content or other structures
      let prompt = "";
      if (res?.choices?.[0]?.message?.content) prompt = String(res.choices[0].message.content);
      else if (res?.prompt) prompt = String(res.prompt);
      else if (res?.data?.prompt) prompt = String(res.data.prompt);

      if (!prompt) {
        alert("分析失败：未返回提示词");
        return "";
      }
      setAnalyzedPrompt(prompt);
      return prompt;
    } catch (e: any) {
      alert(e?.message || "分析失败");
      return "";
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const generateTrialAudio = async (): Promise<void> => {
    const startedAt = Date.now();
    const ensureMinLoading = async () => {
      const elapsed = Date.now() - startedAt;
      const minMs = 650; // ensure users can actually see the spinner
      if (elapsed < minMs) {
        await new Promise((r) => setTimeout(r, minMs - elapsed));
      }
    };

    // If preconditions block generation, don't enter loading state.
    // (Most "no spinner" reports are because we returned early here.)
    if (overrideVoiceId || selectedVoiceModel) {
      alert("已选择音色。请先清除/取消选择后再生成波形试听");
      return;
    }
    const prompt = analyzedPrompt || (await analyzeVoiceFromCharacter());
    if (!prompt) return;
    if (!trialText || !trialText.trim()) {
      alert("请输入试听文本");
      return;
    }
    if (isGeneratingTrial) return;
    setIsGeneratingTrial(true);
    console.log("[SuperIP][VOICE] Match start");
    try {
      const res: any = await api.post("/api/avatar/shiting", {
        prompt,
        text: trialText,
      });
      const extractedVoiceId =
        res?.voice_id || res?.voiceId || res?.data?.voice_id || res?.data?.voiceId || res?.voice?.id || "";
      const ta = res?.trial_audio || res?.data?.trial_audio || res?.trialAudio || "";
      if (ta) setTrialAudio(String(ta));
      if (extractedVoiceId) setVoiceId(String(extractedVoiceId));
      stopTrialPlayback();
    } catch (e: any) {
      alert(e?.message || "生成试听失败");
    } finally {
      await ensureMinLoading();
      console.log("[SuperIP][VOICE] Match end");
      setIsGeneratingTrial(false);
    }
  };

  const clearVoiceWorkbenchSource = () => {
    stopTrialPlayback();
    if (trialAudioUrl && trialAudioUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(trialAudioUrl);
      } catch {
        // ignore
      }
    }
    setTrialAudioUrl("");
    setTrialAudio("");
    setVoiceId("");
    // Don't clear analyzedPrompt here.
    // Clearing it forces re-analysis / rerender paths that can flicker the character tile.
  };

  const clearSelectedVoiceModel = () => {
    setSelectedVoiceModel(null);
    setOverrideVoiceId("");
  };

  const clearClone = () => {
    setCloneFileId("");
    setCloneAudioUrl("");
    setCloneDisplayName("");
    setShowCloneRename(false);
    setCloneRenameDraft("");
    // If using clone as voice source (no selection + no trial), also clear voiceId
    if (!overrideVoiceId && !trialAudio) {
      setVoiceId("");
    }
  };

  const openVoiceModelDialog = async () => {
    // Desktop parity (Vgot_front): when trial audio (waveform source) exists,
    // selecting a voice model should be blocked until the trial source is cleared.
    if (trialAudio || voiceId || isGeneratingTrial) {
      return;
    }
    setShowVoiceModelDialog(true);
    if (loadingVoiceModels) return;
    await fetchVoiceModels();
  };

  const fetchVoiceModels = async () => {
    setLoadingVoiceModels(true);
    setVoiceModelError(null);
    try {
      const [all, reg] = await Promise.all([
        api.get<any>("/api/all_audio"),
        api.get<any>("/api/voices/custom").catch(() => null),
      ]);

      const registry = reg && Array.isArray(reg?.voices) ? reg.voices : [];
      const myVoiceIds = new Set<string>(registry.map((v: any) => String(v.voice_id || v.id || "")).filter(Boolean));
      const myCloneIds = new Set<string>(
        registry
          .filter((v: any) => (v?.source_type === "clone" || v?.source_type === "cloning"))
          .map((v: any) => String(v.voice_id || v.id || ""))
          .filter(Boolean),
      );

      const allObj = all && typeof all === "object" ? all : {};
      const systemList: VoiceItem[] = Array.isArray((allObj as any).system_voice)
        ? (allObj as any).system_voice
        : [];
      const generationList: VoiceItem[] = Array.isArray((allObj as any).voice_generation)
        ? (allObj as any).voice_generation
        : [];
      const cloningList: VoiceItem[] = Array.isArray((allObj as any).voice_cloning)
        ? (allObj as any).voice_cloning
        : [];

      const custom: VoiceItem[] = generationList.filter((v: any) => myVoiceIds.has(String(v.voice_id || v.id || "")));
      const other: VoiceItem[] = generationList.filter((v: any) => !myVoiceIds.has(String(v.voice_id || v.id || "")));
      // Desktop logic: clone list uses voice_cloning directly
      const clone: VoiceItem[] = cloningList.length
        ? cloningList
        : generationList.filter((v: any) => myCloneIds.has(String(v.voice_id || v.id || "")));

      setAvailableVoices({
        system: systemList,
        custom,
        clone,
        other,
      });
    } catch (e: any) {
      setVoiceModelError(e?.message || "加载音色失败");
      setAvailableVoices({});
    } finally {
      setLoadingVoiceModels(false);
    }
  };

  const handleSelectVoiceModel = (v: VoiceItem) => {
    // mutual exclusion: if already has trial/clone, require clear first
    if (trialAudio || voiceId) {
      alert("已有试听/波形来源，请先清除后再选择音色");
      return;
    }
    if (cloneFileId || cloneAudioUrl) {
      alert("已有克隆音色来源，请先清除后再选择音色");
      return;
    }
    setSelectedVoiceModel(v);
    const vid = (v.voice_id || v.id || "").toString();
    setOverrideVoiceId(vid);
    setShowVoiceModelDialog(false);
  };

  const handleCloneFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const lower = (file.name || "").toLowerCase();
    const ok = lower.endsWith(".mp3") || lower.endsWith(".m4a") || lower.endsWith(".wav");
    if (!ok) {
      alert("Only mp3/m4a/wav are allowed");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("File too large (>20MB)");
      return;
    }

    // mutual exclusion: cannot clone if has selected voice or trial source
    if (overrideVoiceId || selectedVoiceModel) {
      alert("已选择音色，清除后才能使用克隆");
      return;
    }
    if (trialAudio || voiceId) {
      alert("已有波形/试听结果，清除后才能使用克隆");
      return;
    }

    setCloneUploading(true);
    try {
      // Dual-track (optional): keep local base64 for backends that require inline cloning audio.
      // We store it into audioBase64 as a best-effort helper; clone upload still uses the file.
      try {
        const b64 = await fileToDataUrl(file);
        setAudioBase64(b64);
      } catch {
        // ignore
      }

      const fd = new FormData();
      fd.append("file", file);
      const resp: any = await api.post("/api/voice/clone/upload", fd);
      const fid = resp?.file?.file_id || resp?.file_id || resp?.data?.file_id || "";
      if (!fid) throw new Error("Upload failed: no file_id");
      setCloneFileId(String(fid));
      setCloneAudioUrl("");
    } catch (err: any) {
      alert(err?.message || "Upload failed");
    } finally {
      setCloneUploading(false);
    }
  };


  const doClonePreview = async () => {
    if (!cloneFileId) {
      alert("Please upload an audio file for cloning first");
      return;
    }
    setIsCloningPreview(true);
    try {
      const payload: any = {
        file_id: cloneFileId,
        text: "This voice sounds natural and pleasant.",
        auto_name: true,
      };
      const resp: any = await api.post("/api/voice/clone/preview", payload);
      let audioUrl = resp?.data?.audio || resp?.audio || resp?.url || "";
      if (!audioUrl && resp?.output && Array.isArray(resp.output)) {
        const first = resp.output.find((x: any) => x?.audio || x?.url);
        audioUrl = first?.audio || first?.url || "";
      }
      const vid = resp?.voice_id || resp?.data?.voice_id || "";
      if (audioUrl) {
        const nextUrl = String(audioUrl);
        setCloneAudioUrl(nextUrl);
        if (vid) setVoiceId(String(vid));
      } else {
        alert(resp?.error || "Clone preview failed");
      }
    } catch (e: any) {
      alert(e?.message || "Clone preview failed");
    } finally {
      setIsCloningPreview(false);
    }
  };

  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec <= 0) return "0:00";
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor(sec / 60).toString();
    return `${m}:${s}`;
  };

  useEffect(() => {
    const el = clonePreviewAudioRef.current;
    if (!el) return;

    const onLoaded = () => {
      setClonePreviewDuration(Number.isFinite(el.duration) ? el.duration : 0);
    };
    const onTime = () => {
      setClonePreviewCurrentTime(el.currentTime || 0);
    };
    const onPlay = () => setIsPlayingClonePreview(true);
    const onPause = () => setIsPlayingClonePreview(false);
    const onEnded = () => setIsPlayingClonePreview(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [cloneAudioUrl]);

  useEffect(() => {
    const el = resultAudioRef.current;
    if (!el) return;

    const onLoaded = () => setResultDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onTime = () => setResultCurrentTime(el.currentTime || 0);
    const onPlay = () => setIsPlayingResult(true);
    const onPause = () => setIsPlayingResult(false);
    const onEnded = () => setIsPlayingResult(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [selectedAudioUrl]);

  const handleGenerateVoice = async () => {
    if (!voiceText || !voiceText.trim()) {
      alert("请输入文本");
      return;
    }
    const effectiveVoiceId = overrideVoiceId || voiceId || "";
    if (!effectiveVoiceId) {
      alert("请先选择音色/生成试听/克隆音色");
      return;
    }

    // Credits check (desktop parity):
    // - Custom/Clone (waveform) => superip_voice_gen_waveform (first free then 3000 via backend)
    // - System/library voice => superip_voice_gen_system (quantity = units based on text length)
    const source_type = overrideVoiceId ? "system" : cloneFileId ? "clone" : "waveform";
    try {
      setCreditsCheckLoadingVoice(true);
      const actionType = source_type === "system" ? "superip_voice_gen_system" : "superip_voice_gen_waveform";
      const qty = source_type === "system" ? systemVoiceUnitsForText(voiceText.trim().length) : 1;
      const check = await checkCredits(actionType, Math.max(1, qty));
      setCreditsCheckVoice(check);
      if (check && check.allowed === false) {
        if (check.upgrade_required) {
          alert("需要升级套餐才能使用该功能");
        } else if (check.daily_limit_reached) {
          alert("今日次数已用完，请稍后再试或升级套餐");
        } else if (check.insufficient_credits) {
          alert("积分不足");
        } else {
          alert("暂不可用");
        }
        return;
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("401")) {
        alert("请先登录");
        return;
      }
      console.warn("Credits check (voice) failed:", e);
      // Fail-open
    } finally {
      setCreditsCheckLoadingVoice(false);
    }

    setIsGenerating(true);
    try {
      const res: any = await api.post("/api/audio/synthesize", {
        text: voiceText,
        voice_id: effectiveVoiceId,
        source_type,
      });

      let audioUrl = res?.data?.audio || res?.audio || res?.url || "";
      if (!audioUrl && res?.data?.url) audioUrl = res.data.url;
      if (!audioUrl) {
        alert("合成失败：未返回音频");
        return;
      }

      // Reuse existing “selected audio url” box to show chosen/generated audio
      setSelectedAudioUrl(String(audioUrl));
      setSelectedAudio({ name: "generated_audio.mp3", url: String(audioUrl) });
      setGeneratedAudio(true);
  // Update duration from URL (best-effort)
  resolveSelectedAudioDurationSeconds({ url: String(audioUrl) });

  // Sync credits after successful deduction
  refreshMeBestEffort();

      // Dual-track: best-effort fetch -> base64 (data URL) so downstream APIs can use inline audio
      // Note: this may fail if the audio URL doesn't allow CORS; keep non-blocking.
      setAudioBase64(null);
      (async () => {
        try {
          const r = await fetch(String(audioUrl));
          if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
          const blob = await r.blob();
          const b64 = await blobToDataUrl(blob);
          if (b64 && typeof b64 === 'string') setAudioBase64(b64);
        } catch (e) {
          console.warn('Failed to build audio base64 track (CORS or fetch issue)', e);
        }
      })();

      // Persist generated audio into history (desktop parity: Vgot_front HistoryService.saveGeneratedContent)
      try {
        const payload = {
          content_type: "audio",
          content_subtype: "superip_voice_tts",
          source_page: "SuperIP",
          file_data: String(audioUrl),
          prompt: voiceText,
          generation_params: {
            voice_id: effectiveVoiceId,
            source_type,
          },
          api_endpoint: "/api/audio/synthesize",
          api_response_data: res,
        };

        // best-effort; don't block playback/selection UX
        api
          .post("/api/history/save", payload)
          .then((saved: any) => {
            // Prefer canonical url/id returned by backend so the history list can match reliably
            const savedId = saved?.id ?? saved?.data?.id ?? null;
            const savedUrl = saved?.file_url || saved?.data?.file_url || saved?.stored_url || saved?.data?.stored_url || saved?.supabase_url || saved?.data?.supabase_url;
            if (savedId !== null && savedId !== undefined) setSelectedAudioHistoryId(savedId);
            if (savedUrl && typeof savedUrl === 'string') {
              setSelectedAudioUrl(savedUrl);
              setSelectedAudio({ name: "generated_audio.mp3", url: savedUrl });
            }
            // Refresh audio history so the new record shows immediately in the modal
            loadAudioHistory();
          })
          .catch((err: any) => {
            console.warn("Failed to save synthesized audio to history", err);
            // Still try refresh in case backend saves history inside synth endpoint
            loadAudioHistory();
          });
      } catch (e) {
        console.warn("Failed to save synthesized audio to history", e);
      }
    } catch (e: any) {
      const msg = e?.message || "合成失败";
      if (String(msg).includes("401")) {
        alert("请先登录");
        return;
      }
      alert(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-xl font-black text-white tracking-tight uppercase">
          {t("superip.title")}
        </h1>
      </header>

      {/* Progress Circuit */}
      <div className="mb-2 relative">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-800 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-[2px] bg-cyan-500 -translate-y-1/2 transition-all duration-500 shadow-[0_0_10px_#22d3ee]"
          style={{
            width: `${((step - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
        <div className="flex justify-between relative z-10">
          {steps.map((s) => {
            const isActive = s.num <= step;
            const isCurrent = s.num === step;

            let iconSrc = "";
            if (s.num === 1) iconSrc = "/1.svg";
            else if (s.num === 2) iconSrc = "/2.svg";
            else iconSrc = "/3.svg";

            return (
              <div
                key={s.num}
                className="flex flex-col items-center gap-0"
              >
                <div
                  className={cn(
                    "w-16 h-16 flex items-center justify-center transition-all duration-300 bg-slate-950 p-2",
                    isActive
                      ? "opacity-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                      : "opacity-30 grayscale",
                    isCurrent && "scale-110"
                  )}
                >
                  <img src={iconSrc} alt={s.name} className="w-full h-full object-contain" />
                </div>
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider scale-75 origin-top",
                    isActive
                      ? "text-cyan-400"
                      : "text-slate-600",
                  )}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0 pr-1">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-2"
          >
            {/* Upload Bar (match Step 2 layout) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center gap-3">
                  <CharacterUploadBox
                    selectedImage={selectedCharacterImage}
                    allowOpenWhenSelected={true}
                  />

                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-10 bg-slate-500/70 rounded-full" />

                  <div
                    onClick={handlePickAudioFile}
                    className={cn(
                      "relative w-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed rounded-lg transition-all cursor-pointer group h-16",
                      selectedAudioUrl
                        ? "border-cyan-500/70 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.18)]"
                        : "border-slate-700 bg-slate-950/30 hover:border-cyan-500/50",
                    )}
                    aria-label={selectedAudioUrl ? "Selected audio" : "Upload audio"}
                    role="button"
                  >
                    <input
                      type="file"
                      ref={audioUploadInputRef}
                      style={{ display: "none" }}
                      accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/*"
                      onChange={handleAudioFileSelected}
                    />

                    {/* Clear selected audio (local upload or history selection) */}
                    {selectedAudioUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedAudio) {
                            handleClearSelectedAudio();
                          } else {
                            handleClearLocalAudioUpload();
                          }
                        }}
                        aria-label="清除已选择音频"
                        title="清除"
                        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
                        style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
                      >
                        ×
                      </button>
                    )}

                    <Volume2
                      size={18}
                      className={cn(
                        "transition-colors",
                        selectedAudioUrl
                          ? "text-cyan-300"
                          : "text-slate-600 group-hover:text-cyan-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[9px] transition-colors font-medium text-center leading-tight whitespace-nowrap",
                        selectedAudioUrl
                          ? "text-cyan-200"
                          : "text-slate-500 group-hover:text-cyan-400",
                      )}
                    >
                      {selectedAudioUrl ? (
                        "selected..."
                      ) : (
                        (isUploadingSuperIpAudio ? t("superip.panel.uploading") : t("superip.panel.upload_audio"))
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0" />

                {/* Upload Box 3 - Video */}
                <div 
                  className="w-16 flex flex-col items-center justify-center gap-1 p-1 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/30 hover:border-cyan-500/50 transition-all cursor-pointer group h-16 relative overflow-hidden"
                  onClick={() => {
                    if (superIpGenResultUrl) {
                      setPreviewVideoUrl(superIpGenResultUrl);
                    }
                  }}
                >
                  {(superIpTasks[0]?.status === 'processing') ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <div
                        className="shrink-0 rounded-full animate-spin"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: 'rgba(34, 211, 238, 0.3)',
                          borderTopColor: '#22d3ee',
                          borderRightColor: 'rgba(34, 211, 238, 0.8)',
                          filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))',
                          animation: 'spin 0.8s linear infinite',
                        }}
                        aria-label="Generating"
                      />
                      <span className="mt-1 text-[9px] text-cyan-300 font-semibold text-center leading-tight whitespace-nowrap scale-90 origin-top">
                        生成中
                      </span>
                    </div>
                  ) : superIpGenResultUrl ? (
                    <>
                      <video
                        src={superIpGenResultUrl}
                        className="w-full h-full object-cover rounded-md"
                        muted
                        playsInline
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuperIpGenResultUrl(null);
                        }}
                        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
                        style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
                        title="Clear video"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <Film size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
                        {t("superip.panel.video_gen")}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => startSuperIpGen(isSendIconPink ? 'pro' : 'default')}
                    disabled={superIpTasks[0]?.status === 'processing'}
                    className={cn(
                      "transition-all p-1",
                      !isSendIconPink && "text-cyan-400 hover:text-cyan-300",
                      (superIpTasks[0]?.status === 'processing') && "opacity-50 cursor-not-allowed",
                    )}
                    aria-label="Send(default)"
                    title="Send (default)"
                  >
                    <Send
                      size={24}
                      color={isSendIconPink ? "#A10B6A" : undefined}
                      className={cn(
                        "transition-colors",
                        isSendIconPink && "hover:text-[#C0127E]" 
                      )}
                    />
                  </button>

                  {(() => {
                    const d = isSendIconPink ? creditsCheckGenPro : creditsCheckGenCom;
                    if (!(typeof d?.required_credits === "number") || (d?.required_credits ?? 0) <= 0) return null;
                    const loading = isSendIconPink ? creditsCheckLoadingGenPro : creditsCheckLoadingGenCom;
                    const color = isSendIconPink ? "text-[#A10B6A]" : "text-cyan-300";
                    return (
                    <div className="mt-0.5 text-[9px] text-cyan-300 font-semibold tabular-nums flex items-center gap-1">
                      <span className={color}>{d!.required_credits} credits</span>
                      {loading ? (
                        <span className={cn("w-3 h-3 border-2 border-t-transparent rounded-full animate-spin", isSendIconPink ? "border-[#A10B6A]" : "border-cyan-300")} />
                      ) : null}
                    </div>
                    );
                  })()}

                  {/* Switch + Pro: directly under the Send (paper-plane) icon */}
                  <button
                    onClick={() => {
                      setIsSendIconPink((v) => !v);
                    }}
                    className="mt-1 h-6 px-1 flex flex-row items-center justify-center gap-1 whitespace-nowrap text-slate-400 hover:text-cyan-400 transition-colors"
                    type="button"
                    aria-label="Switch Step"
                    title="Switch Step"
                  >
                    <SwitchIcon size={12} className="shrink-0" />
                    <span className="text-[10px] leading-none font-semibold">
                      {isSendIconPink ? "Com" : "Pro"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Open Gallery Button */}
            <button 
              onClick={handleOpenGallery}
              className="w-full py-2 border border-slate-700 rounded-lg bg-slate-950/30 text-slate-400 text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer hover:text-cyan-400 hover:border-cyan-500/50 group"
            >
              <ImageIcon size={14} className="group-hover:text-cyan-400 transition-colors" />
              <span className="font-medium group-hover:text-cyan-400 transition-colors">{t("superip.panel.open_gallery")}</span>
            </button>

            {/* Workbench Input */}
            {/* Workbench Input */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                  {t("superip.prompt.title")}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-all"
                  placeholder={t("superip.prompt.placeholder")}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setPrompt("");
                    setGeneratedImage(null);
                    setIsGenerating(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-[10px] font-bold hover:bg-slate-800 transition-colors"
                >
                  {t("superip.prompt.clear")}
                </button>
                <button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 py-2 text-[10px] font-bold text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>
                        {t("superip.prompt.generate")}
                          {typeof creditsCheckImage?.required_credits === "number" && creditsCheckImage.required_credits > 0
                            ? ` (${creditsCheckImage.required_credits} credits)`
                            : ""}
                      </span>
                      {creditsCheckLoadingImage ? (
                        <span
                          className="ml-1 w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
                          aria-label="Checking credits"
                        />
                      ) : null}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Result Section */}
            {generatedImage ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl min-h-[240px] max-h-[400px] p-2 flex flex-col">
                <div className="flex justify-between items-center mb-2 px-2">
                  <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                    {t("common.result")}
                  </span>
                </div>
                <div className="flex-1 rounded-lg bg-black/50 overflow-hidden relative group border border-slate-800 flex items-center justify-center">
                  <img
                    src={generatedImage}
                    alt="Generated Character"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ) : isGenerating ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl min-h-[240px] flex items-center justify-center">
                <p className="text-[10px] text-slate-500 font-medium text-center">
                  Generating...
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl min-h-[240px] flex flex-col items-center justify-center p-6 text-center gap-2">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                  {t("common.result")}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {t("superip.generated_placeholder")}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Three Upload Boxes in a Row - Container */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                {/* Group: Character & Audio with Divider */}
                <div className="relative flex items-center gap-3">
                  {/* Upload Box 1 - Character */}
                  <CharacterUploadBox
                    selectedImage={selectedCharacterImage}
                    allowOpenWhenSelected={false}
                  />

                  {/* Vertical Divider (centered in the gap) */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-10 bg-slate-500/70 rounded-full" />

                  {/* Upload Box 2 - Audio */}
                  <div
                    onClick={handlePickAudioFile}
                    className={cn(
                      "relative w-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed rounded-lg transition-all cursor-pointer group h-16",
                      selectedAudioUrl
                        ? "border-cyan-500/70 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.18)]"
                        : "border-slate-700 bg-slate-950/30 hover:border-cyan-500/50",
                    )}
                    aria-label={selectedAudioUrl ? "Selected audio" : "Upload audio"}
                    role="button"
                  >
                    <input
                      type="file"
                      ref={audioUploadInputRef}
                      style={{ display: "none" }}
                      accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/*"
                      onChange={handleAudioFileSelected}
                    />

                    {/* Clear selected audio (local upload or history selection) */}
                    {selectedAudioUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedAudio) {
                            handleClearSelectedAudio();
                          } else {
                            handleClearLocalAudioUpload();
                          }
                        }}
                        aria-label="清除已选择音频"
                        title="清除"
                        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
                        style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
                      >
                        ×
                      </button>
                    )}

                    <Volume2
                      size={18}
                      className={cn(
                        "transition-colors",
                        selectedAudioUrl
                          ? "text-cyan-300"
                          : "text-slate-600 group-hover:text-cyan-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[9px] transition-colors font-medium text-center leading-tight whitespace-nowrap",
                        selectedAudioUrl
                          ? "text-cyan-200"
                          : "text-slate-500 group-hover:text-cyan-400",
                      )}
                    >
                      {selectedAudioUrl ? (
                        "selected..."
                      ) : (
                        (isUploadingSuperIpAudio ? t("superip.panel.uploading") : t("superip.panel.upload_audio"))
                      )}
                    </span>
                  </div>
                </div>

                {/* keep remaining items aligned without forcing huge empty space on small screens */}
                <div className="flex-1 min-w-0" />

                {/* Upload Box 3 - Video */}
                <div 
                  className="w-16 flex flex-col items-center justify-center gap-1 p-1 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/30 hover:border-cyan-500/50 transition-all cursor-pointer group h-16 relative overflow-hidden"
                  onClick={() => {
                    if (superIpGenResultUrl) {
                      setPreviewVideoUrl(superIpGenResultUrl);
                    }
                  }}
                >
                  {(superIpTasks[0]?.status === 'processing') ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <div
                        className="shrink-0 rounded-full animate-spin"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: 'rgba(34, 211, 238, 0.3)',
                          borderTopColor: '#22d3ee',
                          borderRightColor: 'rgba(34, 211, 238, 0.8)',
                          filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))',
                          animation: 'spin 0.8s linear infinite',
                        }}
                        aria-label="Generating"
                      />
                      <span className="mt-1 text-[9px] text-cyan-300 font-semibold text-center leading-tight whitespace-nowrap scale-90 origin-top">
                        生成中
                      </span>
                    </div>
                  ) : superIpGenResultUrl ? (
                    <>
                      <video
                        src={superIpGenResultUrl}
                        className="w-full h-full object-cover rounded-md"
                        muted
                        playsInline
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuperIpGenResultUrl(null);
                        }}
                        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
                        style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
                        title="Clear video"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <Film size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
                        {t("superip.panel.video_gen")}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  {/* Send Icon Button */}
                  <button
                    type="button"
                    onClick={() => startSuperIpGen(isSendIconPink ? 'pro' : 'default')}
                    disabled={superIpTasks[0]?.status === 'processing'}
                    className={cn(
                      "transition-all p-1",
                      !isSendIconPink && "text-cyan-400 hover:text-cyan-300",
                      (superIpTasks[0]?.status === 'processing') && "opacity-50 cursor-not-allowed",
                    )}
                    aria-label="Send(default)"
                    title="Send (default)"
                  >
                    <Send
                      size={24}
                      color={isSendIconPink ? "#A10B6A" : undefined}
                      className={cn(
                        "transition-colors",
                        isSendIconPink && "hover:text-[#C0127E]",
                      )}
                    />
                  </button>

                  {(() => {
                    const d = isSendIconPink ? creditsCheckGenPro : creditsCheckGenCom;
                    if (!(typeof d?.required_credits === "number") || (d?.required_credits ?? 0) <= 0) return null;
                    const loading = isSendIconPink ? creditsCheckLoadingGenPro : creditsCheckLoadingGenCom;
                    const color = isSendIconPink ? "text-[#A10B6A]" : "text-cyan-300";
                    return (
                    <div className="mt-0.5 text-[9px] text-cyan-300 font-semibold tabular-nums flex items-center gap-1">
                      <span className={color}>{d!.required_credits} credits</span>
                      {loading ? (
                        <span className={cn("w-3 h-3 border-2 border-t-transparent rounded-full animate-spin", isSendIconPink ? "border-[#A10B6A]" : "border-cyan-300")} />
                      ) : null}
                    </div>
                    );
                  })()}

                  {/* Switch + Pro/Com (match CHAR behavior) */}
                  <button
                    onClick={() => {
                      setIsSendIconPink((v) => !v);
                    }}
                    className="mt-1 h-6 px-1 flex flex-row items-center justify-center gap-1 whitespace-nowrap text-slate-400 hover:text-cyan-400 transition-colors"
                    type="button"
                    aria-label="Switch"
                    title="Switch"
                  >
                    <SwitchIcon size={12} className="shrink-0" />
                    <span className="text-[10px] leading-none font-semibold">
                      {isSendIconPink ? "Com" : "Pro"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Audio Selection */}
            <div 
              onClick={handleOpenAudioGallery}
              className="relative flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm cursor-pointer hover:bg-slate-800 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-400">
                <Volume2 size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="ui-tiny text-cyan-400 font-bold uppercase mb-0.5">
                  {t("superip.audio.title")}
                </div>
                <div className="text-[8px] font-bold text-white truncate">
                  {selectedAudio
                    ? (selectedAudio.name || t("superip.audio.no_audio"))
                    : t("superip.audio.no_audio")}
                </div>
              </div>
            </div>

            {/* Audio List Display Box (Floating Overlay) */}
            {/* 旧的悬浮音频列表（图二）已弃用：现在统一使用 Audio History 全屏库 */}

            {/* Workbench */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
              {/* Voice Waveform - 显示区域，不是输入框 */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-400 font-bold">
                  {t("superip.voice.waveform")}
                </label>
                <div className="flex gap-2 items-center">
                  {/* Waveform Display Area - matching时不收缩 */}
                  <div
                    className={cn(
                      "bg-slate-950/50 border border-slate-700 rounded-lg flex items-center h-9 overflow-hidden",
                      "flex-1",
                    )}
                  >
                    <div className="flex items-center justify-between w-full px-2">
                      {isGeneratingTrial ? (
                        <div className="flex items-center gap-0.5 h-5">
                          {[...Array(28)].map((_, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-cyan-200/80 rounded-full animate-pulse"
                              style={{
                                // deterministic-ish waveform: fixed pattern by index
                                height: `${18 + ((i * 17) % 60)}%`,
                                animationDelay: `${i * 0.03}s`,
                              }}
                            />
                          ))}
                        </div>
                      ) : trialAudio ? (
                        <div className="px-2 text-[10px] text-slate-300 truncate">Trial ready</div>
                      ) : (
                        <div className="px-2 text-[10px] text-slate-600 truncate">
                          {analyzedPrompt ? "Prompt ready" : t("superip.voice.no_trial")}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!trialAudio) {
                        generateTrialAudio();
                        return;
                      }
                      if (isPlayingTrial) {
                        stopTrialPlayback();
                        return;
                      }
                      playTrial(trialAudio);
                    }}
                    disabled={!!overrideVoiceId || !!selectedVoiceModel || !!cloneFileId || isGeneratingTrial}
                    className={cn(
                      "w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center transition-colors",
                      (overrideVoiceId || selectedVoiceModel || cloneFileId)
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-cyan-400 hover:bg-slate-700 hover:border-cyan-500/50",
                    )}
                    title={trialAudio ? "Play/Pause" : "Generate trial"}
                  >
                    {trialAudio && isPlayingTrial ? <Pause size={14} /> : <Play size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      clearVoiceWorkbenchSource();
                    }}
                    disabled={!trialAudio && !analyzedPrompt && !voiceId}
                    className={cn(
                      "w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center transition-colors",
                      (!trialAudio && !analyzedPrompt && !voiceId)
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white",
                    )}
                    title="Clear trial/prompt"
                  >
                    <X size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isGeneratingTrial) return;
                      generateTrialAudio();
                    }}
                    disabled={!!overrideVoiceId || !!selectedVoiceModel || !!cloneFileId}
                    className={cn(
                      "px-3 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center ui-tiny font-bold transition-colors relative",
                      (overrideVoiceId || selectedVoiceModel || cloneFileId)
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-cyan-400 hover:bg-slate-700 hover:border-cyan-500/50",
                    )}
                    title="Analyze + Trial (Match)"
                  >
                    {/* Keep a stable layout; we overlay the spinner so it's never clipped or collapsed. */}
                    <span className={cn("transition-opacity", isGeneratingTrial ? "opacity-0" : "opacity-100")}>
                      {t("superip.voice.match")}
                    </span>
                    {isGeneratingTrial && (
                      <span className="absolute inset-0 flex items-center justify-center opacity-100">
                        <span
                          className="w-5 h-5 border-[3px] border-cyan-300 border-t-transparent rounded-full animate-spin"
                          style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 1))" }}
                        />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Select Voice */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-400 font-bold">
                  {t("superip.voice.select")}
                </label>
                <button
                  onClick={openVoiceModelDialog}
                  disabled={!!trialAudio || !!voiceId || isGeneratingTrial}
                  className={cn(
                    "w-full py-3 bg-slate-950/50 border border-slate-700 rounded-lg flex items-center transition-colors group relative",
                    (trialAudio || voiceId || isGeneratingTrial)
                      ? "text-slate-600 cursor-not-allowed"
                      : "text-slate-300 hover:text-white hover:border-cyan-500/50",
                  )}
                >
                  <span className="flex-1 flex items-center justify-center gap-2">
                    <Volume2
                      size={16}
                      className="text-slate-500 group-hover:text-cyan-400 transition-colors"
                    />
                    <span className="ui-tiny font-bold">
                      {overrideVoiceId ? `Selected: ${overrideVoiceId}` : t("superip.voice.select_model")}
                    </span>
                  </span>

                  {(overrideVoiceId || selectedVoiceModel) && !(trialAudio || voiceId || isGeneratingTrial) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearSelectedVoiceModel();
                      }}
                      aria-label="Clear selected voice"
                      className="absolute top-1/2 right-2 -translate-y-1/2 w-6 h-6 text-slate-300 text-[14px] leading-none flex items-center justify-center hover:text-white"
                      style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
                    >
                      ×
                    </button>
                  )}
                </button>
              </div>

              {/* Voice Cloning */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-400 font-bold">
                  {t("superip.voice.cloning")}
                </label>
                <input
                  type="file"
                  ref={cloneInputRef}
                  style={{ display: "none" }}
                  accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/*"
                  onChange={handleCloneFileChange}
                />

                <div className="flex items-stretch gap-2">
                  <div
                    onClick={() => {
                      if (cloneUploading) return;
                      if (overrideVoiceId || selectedVoiceModel) return;
                      if (trialAudio || voiceId) return;
                      if (cloneFileId) return; // already has file
                      if (cloneInputRef.current) cloneInputRef.current.value = "";
                      cloneInputRef.current?.click();
                    }}
                    className={cn(
                      "flex-1 h-24 border border-dashed border-slate-700 rounded-lg flex items-center bg-slate-950/50 transition-colors cursor-pointer group relative overflow-hidden",
                      (overrideVoiceId || selectedVoiceModel || trialAudio || voiceId)
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-cyan-500/50",
                      cloneFileId ? "border-slate-600" : "",
                    )}
                  >
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 px-3 w-full">
                      <div className="w-10 h-10 rounded-lg bg-slate-900/60 border border-slate-700 flex items-center justify-center">
                        {cloneFileId ? (
                          <Volume2 size={16} className="text-slate-300" />
                        ) : (
                          <img src="/clone.svg" alt="Upload" className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-300 font-bold truncate">
                          {cloneFileId ? (cloneDisplayName || "clone.mp3") : t("superip.voice.select_file")}
                        </div>
                        <div className="micro-text text-slate-600 truncate">
                          {cloneUploading
                            ? t("superip.voice.uploading")
                            : cloneFileId
                              ? (cloneAudioUrl ? t("superip.voice.ready") : t("superip.voice.uploaded"))
                              : t("superip.voice.file_limit")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right-side actions (reserve a little space) */}
                  <div className="flex flex-col justify-center gap-2">
                    <button
                      type="button"
                      onClick={doClonePreview}
                      disabled={!cloneFileId || isCloningPreview}
                      title={cloneAudioUrl ? "Re-Preview" : "Preview"}
                      className={cn(
                        "w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center transition-colors",
                        (!cloneFileId)
                          ? "text-slate-600 cursor-not-allowed"
                          : isCloningPreview
                            ? "text-slate-600 cursor-not-allowed"
                            : "text-cyan-300 hover:bg-slate-700 hover:border-cyan-500/50",
                      )}
                    >
                      {isCloningPreview ? (
                        <span
                          className="w-3.5 h-3.5 border-[3px] border-cyan-300 border-t-transparent rounded-full animate-spin"
                          style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 1))" }}
                        />
                      ) : cloneAudioUrl ? (
                        <RefreshCw size={14} />
                      ) : (
                        <Play size={14} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!cloneFileId) return;
                        setShowCloneRename((v) => !v);
                        setCloneRenameDraft(cloneDisplayName || "clone.mp3");
                      }}
                      title="Rename"
                      className={cn(
                        "w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center transition-colors",
                        (!cloneFileId || cloneUploading)
                          ? "text-slate-600 cursor-not-allowed"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white",
                      )}
                      disabled={!cloneFileId || cloneUploading}
                    >
                      <Settings size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={clearClone}
                      disabled={!cloneFileId && !cloneAudioUrl}
                      title="Clear"
                      className={cn(
                        "w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center transition-colors",
                        (!cloneFileId && !cloneAudioUrl)
                          ? "text-slate-600 cursor-not-allowed"
                          : "text-slate-300 hover:bg-rose-500/10 hover:border-rose-400/40 hover:text-rose-200",
                      )}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Clone preview audio (separate from the main waveform UI) */}
                {cloneAudioUrl && (
                  <div className="mt-2 rounded-lg bg-slate-950/35 border border-slate-700 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const el = clonePreviewAudioRef.current;
                          if (!el) return;
                          if (el.paused) el.play().catch(() => {});
                          else el.pause();
                        }}
                        className="w-8 h-8 rounded-full bg-slate-900/60 border border-slate-700 flex items-center justify-center text-cyan-200 hover:border-cyan-500/40"
                        aria-label="Play clone preview"
                      >
                        {isPlayingClonePreview ? <Pause size={12} /> : <Play size={12} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-300 font-bold truncate">
                          {cloneDisplayName ? `${cloneDisplayName} · Preview` : "Clone Preview"}
                        </div>

                        <div className="mt-0.5 flex items-center gap-2">
                          <div className="text-[10px] text-slate-500 tabular-nums leading-none">
                            {formatTime(clonePreviewCurrentTime)} / {formatTime(clonePreviewDuration)}
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={clonePreviewDuration || 0}
                            step={0.01}
                            value={Math.min(clonePreviewCurrentTime, clonePreviewDuration || 0)}
                            onChange={(e) => {
                              const el = clonePreviewAudioRef.current;
                              if (!el) return;
                              el.currentTime = Number(e.target.value);
                            }}
                            className="flex-1 accent-cyan-400 clone-preview-range"
                            style={{ height: 2 }}
                          />
                        </div>
                      </div>

                      <audio
                        ref={clonePreviewAudioRef}
                        src={cloneAudioUrl}
                        preload="metadata"
                      />
                    </div>
                  </div>
                )}

                {showCloneRename && (
                  <div className="mt-2 rounded-lg bg-slate-950/40 border border-slate-700 p-2 flex items-center gap-2">
                    <input
                      value={cloneRenameDraft}
                      onChange={(e) => setCloneRenameDraft(e.target.value)}
                      className="flex-1 bg-slate-900/40 border border-slate-700 rounded-md px-2 py-1 text-[10px] text-white outline-none focus:border-cyan-500/50"
                      placeholder="Rename"
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-[10px] font-bold hover:bg-cyan-500/20"
                      onClick={() => {
                        const next = (cloneRenameDraft || "").trim();
                        if (!next) return;
                        setCloneDisplayName(next);
                        setShowCloneRename(false);
                      }}
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>

              {/* Input Text */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-400 font-bold">
                  {t("superip.voice.input_text")}
                </label>
                <div className="relative group">
                  <textarea
                    value={voiceText}
                    onChange={(e) =>
                      setVoiceText(e.target.value)
                    }
                    className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-all"
                    placeholder={t("superip.voice.input_placeholder")}
                    maxLength={3500}
                  />
                  <span className="absolute bottom-2 right-2 micro-text text-slate-600">
                    {voiceText.length}/3500
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    // Clear prompt + generated result UI
                    setVoiceText("");
                    setGeneratedAudio(false);
                    setSelectedAudioUrl(null);
                    setSelectedAudio(null);
                    setPlayingAudio(null);
                    try {
                      audioRef.current?.pause();
                    } catch {
                      // ignore
                    }
                    audioRef.current = null;
                    try {
                      resultAudioRef.current?.pause();
                    } catch {
                      // ignore
                    }
                    resultAudioRef.current = null;
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-[10px] font-bold hover:bg-slate-800 transition-colors"
                >
                  {t("common.clear")}
                </button>
                <NeonButton
                  className="flex-1 py-2 text-[10px]"
                  variant="primary"
                  onClick={handleGenerateVoice}
                  disabled={isGenerating}
                >
                  <Zap size={14} />
                  <span>
                    {t("superip.prompt.generate")}
                    {typeof creditsCheckVoice?.required_credits === "number" && creditsCheckVoice.required_credits > 0
                      ? ` (${creditsCheckVoice.required_credits} credits)`
                      : ""}
                  </span>
                  {creditsCheckLoadingVoice ? (
                    <span
                      className="ml-1 w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"
                      aria-label="Checking credits"
                    />
                  ) : null}
                </NeonButton>
              </div>
            </div>

            {/* Result */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl min-h-[200px] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
              {generatedAudio && selectedAudioUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2 animate-in fade-in zoom-in duration-300">
                  <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                    Audio Generated
                  </div>

                  <div className="w-full max-w-[340px]">
                    <div className="rounded-lg bg-slate-950/35 border border-slate-700 px-3 py-2 text-left">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const el = resultAudioRef.current;
                            if (!el) return;
                            if (el.paused) el.play().catch(() => {});
                            else el.pause();
                          }}
                          className="w-9 h-9 rounded-full bg-slate-900/60 border border-slate-700 flex items-center justify-center text-cyan-200 hover:border-cyan-500/40"
                          aria-label="Play generated audio"
                        >
                          {isPlayingResult ? <Pause size={12} /> : <Play size={12} />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-slate-300 font-bold truncate">{t("superip.audio.title")}</div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <div className="text-[10px] text-slate-500 tabular-nums leading-none">
                              {formatTime(resultCurrentTime)} / {formatTime(resultDuration)}
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={resultDuration || 0}
                              step={0.01}
                              value={Math.min(resultCurrentTime, resultDuration || 0)}
                              onChange={(e) => {
                                const el = resultAudioRef.current;
                                if (!el) return;
                                el.currentTime = Number(e.target.value);
                              }}
                              className="flex-1 accent-cyan-400 clone-preview-range"
                              style={{ height: 2 }}
                            />
                          </div>
                        </div>

                        <audio
                          ref={resultAudioRef}
                          src={selectedAudioUrl}
                          preload="metadata"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {t("superip.result.title")}
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {t("superip.result.audio_placeholder")}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col space-y-4"
          >
            {/* Three Upload Boxes in a Row - Container */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                {/* Group: Character & Audio with Divider */}
                <div className="relative flex items-center gap-3">
                  {/* Upload Box 1 - Character */}
                  <CharacterUploadBox
                    selectedImage={selectedCharacterImage}
                    allowOpenWhenSelected={false}
                  />

                  {/* Vertical Divider (centered in the gap) */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-10 bg-slate-500/70 rounded-full" />

                  {/* Upload Box 2 - Audio */}
                  <div
                    onClick={handlePickAudioFile}
                    className={cn(
                      "relative w-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed rounded-lg transition-all cursor-pointer group h-16",
                      selectedAudioUrl
                        ? "border-cyan-500/70 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.18)]"
                        : "border-slate-700 bg-slate-950/30 hover:border-cyan-500/50",
                    )}
                    aria-label={selectedAudioUrl ? "Selected audio" : "Upload audio"}
                    role="button"
                  >
                    <input
                      type="file"
                      ref={audioUploadInputRef}
                      style={{ display: "none" }}
                      accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/*"
                      onChange={handleAudioFileSelected}
                    />

                    {/* Clear selected audio (local upload or history selection) */}
                    {selectedAudioUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedAudio) {
                            handleClearSelectedAudio();
                          } else {
                            handleClearLocalAudioUpload();
                          }
                        }}
                        aria-label="清除已选择音频"
                        title="清除"
                        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
                        style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
                      >
                        ×
                      </button>
                    )}

                    <Volume2
                      size={18}
                      className={cn(
                        "transition-colors",
                        selectedAudioUrl
                          ? "text-cyan-300"
                          : "text-slate-600 group-hover:text-cyan-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[9px] transition-colors font-medium text-center leading-tight whitespace-nowrap",
                        selectedAudioUrl
                          ? "text-cyan-200"
                          : "text-slate-500 group-hover:text-cyan-400",
                      )}
                    >
                      {selectedAudioUrl ? (
                        "selected..."
                      ) : (
                        isUploadingSuperIpAudio ? t("superip.panel.uploading") : t("superip.panel.upload_audio")
                      )}
                    </span>
                  </div>
                </div>

                {/* keep remaining items aligned without forcing huge empty space on small screens */}
                <div className="flex-1 min-w-0" />

                {/* Upload Box 3 - Video */}
                <div 
                  className="w-16 flex flex-col items-center justify-center gap-1 p-1 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/30 hover:border-cyan-500/50 transition-all cursor-pointer group h-16 relative overflow-hidden"
                  onClick={() => {
                    if (superIpGenResultUrl) {
                      setPreviewVideoUrl(superIpGenResultUrl);
                    }
                  }}
                >
                  {(superIpTasks[0]?.status === 'processing') ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <div
                        className="shrink-0 rounded-full animate-spin"
                        style={{
                          width: '18px',
                          height: '18px',
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: 'rgba(34, 211, 238, 0.3)',
                          borderTopColor: '#22d3ee',
                          borderRightColor: 'rgba(34, 211, 238, 0.8)',
                          filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))',
                          animation: 'spin 0.8s linear infinite',
                        }}
                        aria-label="Generating"
                      />
                      <span className="mt-1 text-[9px] text-cyan-300 font-semibold text-center leading-tight whitespace-nowrap scale-90 origin-top">
                        生成中
                      </span>
                    </div>
                  ) : superIpGenResultUrl ? (
                    <>
                      <video
                        src={superIpGenResultUrl}
                        className="w-full h-full object-cover rounded-md"
                        muted
                        playsInline
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuperIpGenResultUrl(null);
                        }}
                        className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
                        style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
                        title="Clear video"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <Film size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
                        {t("superip.panel.video_gen")}
                      </span>
                    </>
                  )}
                </div>

                {/* Send Icon Button + Switch (match CHAR behavior) */}
                <div className="flex flex-col items-center">
                  <button
                    className={cn(
                      "transition-all p-1",
                      !isSendIconPink && "text-cyan-400 hover:text-cyan-300",
                      (!isSendIconPink &&
                        (creditsCheckGenCom?.allowed === false || !(typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0))) &&
                        "opacity-50 cursor-not-allowed",
                    )}
                    type="button"
                    aria-label="Send"
                    onClick={() => {
                      // Pink => Pro line (Wavespeed). Cyan => Com line (RunningHub).
                      if (!isSendIconPink && !(typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0)) {
                        alert('无法获取音频时长，任务无法执行。请重新上传音频或选择可访问的音频链接。');
                        return;
                      }
                      if (!isSendIconPink && creditsCheckGenCom?.allowed === false) {
                        alert("积分不足或需要升级套餐");
                        return;
                      }
                      if (isSendIconPink) startSuperIpGen('pro');
                      else startSuperIpGen('custom');
                    }}
                  >
                    <Send
                      size={24}
                      color={isSendIconPink ? "#A10B6A" : undefined}
                      className={cn(
                        "transition-colors",
                        isSendIconPink && "hover:text-[#C0127E]",
                      )}
                    />
                  </button>

                  {(() => {
                    const d = isSendIconPink ? creditsCheckGenPro : creditsCheckGenCom;
                    if (!(typeof d?.required_credits === "number") || (d?.required_credits ?? 0) <= 0) return null;
                    const loading = isSendIconPink ? creditsCheckLoadingGenPro : creditsCheckLoadingGenCom;
                    const color = isSendIconPink ? "text-[#A10B6A]" : "text-cyan-300";
                    return (
                    <div className="mt-0.5 text-[9px] text-cyan-300 font-semibold tabular-nums flex items-center gap-1">
                      <span className={color}>{d!.required_credits} credits</span>
                      {loading ? (
                        <span className={cn("w-3 h-3 border-2 border-t-transparent rounded-full animate-spin", isSendIconPink ? "border-[#A10B6A]" : "border-cyan-300")} />
                      ) : null}
                    </div>
                    );
                  })()}

                  <button
                    onClick={() => {
                      setIsSendIconPink((v) => !v);
                    }}
                    className="mt-1 h-6 px-1 flex flex-row items-center justify-center gap-1 whitespace-nowrap text-slate-400 hover:text-cyan-400 transition-colors"
                    type="button"
                    aria-label="Switch"
                    title="Switch"
                  >
                    <SwitchIcon size={12} className="shrink-0" />
                    <span className="text-[10px] leading-none font-semibold">
                      {isSendIconPink ? "Com" : "Pro"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 1. Input Section */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                  {t("superip.prompt.title")}
                </label>
                <textarea
                  className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-all"
                  placeholder={t("superip.prompt.placeholder")}
                  value={superIpGenPrompt}
                  onChange={(e) => setSuperIpGenPrompt(e.target.value)}
                />
              </div>


              {superIpGenError && (
                <div className="text-[10px] text-red-400">
                  {superIpGenError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={clearSuperIpGen}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-[10px] font-bold hover:bg-slate-800 transition-colors"
                >
                  {t("superip.gen.clear")}
                </button>
                {/* Diagonally split action button: Left=Generate (Main), Right=Pro (Option) */}
                <div className="flex-[2] flex h-10 relative bg-transparent">
                  {/* Left: Generate */}
                  <button
                    type="button"
                    disabled={
                      superIpTasks[0]?.status === 'processing' ||
                      creditsCheckGenCom?.allowed === false ||
                      !(typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0)
                    }
                    onClick={() => startSuperIpGen('custom')}
                    className={cn(
                      "flex-1 bg-slate-950/90 hover:bg-slate-800 transition-colors relative z-10",
                      "border border-cyan-500/50 border-r-0 rounded-l-lg", // Standard rounded corners
                      "text-cyan-400 text-[10px] font-bold uppercase tracking-wider",
                      "flex items-center justify-center pr-3",
                      ((superIpTasks[0]?.status === 'processing') ||
                        creditsCheckGenCom?.allowed === false ||
                        !(typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0)) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                    style={{ 
                      clipPath: "polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)",
                      borderTopLeftRadius: "0.5rem", // 8px
                      borderBottomLeftRadius: "0.5rem"
                    }}
                  >
                    <span>
                      {t("superip.gen.generate")}
                      {typeof creditsCheckGenCom?.required_credits === "number" && creditsCheckGenCom.required_credits > 0
                        ? ` (${creditsCheckGenCom.required_credits} credits)`
                        : ""}
                    </span>
                    {creditsCheckLoadingGenCom ? (
                      <span className="w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                    ) : null}
                  </button>

                  {/* Gap Borders (Blue Lines) - Single skewed div with side borders */}
                  <div 
                    className="absolute top-0 bottom-0 right-[84px] w-[12px] z-20 pointer-events-none border-x border-cyan-400 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)] origin-top"
                    style={{ transform: "skewX(-16.7deg)" }}
                  />

                  {/* Right: Pro */}
                  <button
                    type="button"
                    disabled={
                      superIpTasks[0]?.status === 'processing' ||
                      creditsCheckGenPro?.allowed === false ||
                      !(typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0)
                    }
                    onClick={() => startSuperIpGen('pro')}
                    className={cn(
                      "w-24 bg-slate-950/90 hover:bg-slate-800 transition-colors relative z-10 shrink-0",
                      "border border-cyan-500/50 border-l-0 rounded-r-lg", // Standard rounded corners
                      "text-[#A10B6A] text-[10px] font-bold uppercase tracking-wider",
                      "flex items-center justify-center pl-4",
                      ((superIpTasks[0]?.status === 'processing') ||
                        creditsCheckGenPro?.allowed === false ||
                        !(typeof selectedAudioDurationSec === 'number' && selectedAudioDurationSec > 0)) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                    style={{ 
                      clipPath: "polygon(12px 0, 100% 0, 100% 100%, 0 100%)",
                      borderTopRightRadius: "0.5rem", // 8px
                      borderBottomRightRadius: "0.5rem"
                    }}
                  >
                    <span>
                      Pro
                      {typeof creditsCheckGenPro?.required_credits === "number" && creditsCheckGenPro.required_credits > 0
                        ? ` (${creditsCheckGenPro.required_credits} credits)`
                        : ""}
                    </span>
                    {creditsCheckLoadingGenPro ? (
                      <span className="ml-2 w-3 h-3 border-2 border-[#A10B6A] border-t-transparent rounded-full animate-spin" />
                    ) : null}
                  </button>

                  {/* SVG Overlay for Perfect Borders - Z-50 ensures visibility */}
                  <svg 
                    className="absolute top-0 right-0 h-full w-[128px] pointer-events-none z-50 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]" 
                    viewBox="0 0 128 40" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* 
                      Geometry Calculation:
                      Pro Button Width: 96px (w-24)
                      SVG Width: 128px
                      Seam Start X (Right aligned): 128 - 96 = 32px
                      
                      Generate Button Right Edge (Left Line):
                      Top: At Seam (x=32)
                      Bottom: Seam - 12px (x=20)
                      
                      Pro Button Left Edge (Right Line):
                      Top: Seam + 12px (x=44)
                      Bottom: At Seam (x=32)
                    */}
                    <line x1="32" y1="0" x2="20" y2="40" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="44" y1="0" x2="32" y2="40" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. Result Section */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl min-h-[200px] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
              {superIpGenResultUrl ? (
                <div className="w-full h-full">
                  <video
                    src={superIpGenResultUrl}
                    controls
                    playsInline
                    className="w-full h-full rounded-lg object-cover border border-slate-800 bg-black/50"
                  />
                </div>
              ) : (superIpTasks[0]?.status === 'processing') ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-slate-900/80 backdrop-blur-sm">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{t("superip.result.generating")}</span>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    {t("superip.result.title")}
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {t("superip.result.placeholder")}
                  </p>
                </>
              )}
            </div>

            {/* 3. History (Mini) */}
            <div className="pb-4">
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-2 block">
                {t("history.title")}
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {/* Render active tasks (excluding the very first one which is in main view) */}
                {superIpTasks.slice(1).map((task) => (
                  <button
                    key={task.internalId}
                    type="button"
                    onClick={() => {
                      if (task.resultUrl) setSuperIpGenResultUrl(task.resultUrl);
                    }}
                    className="w-24 h-16 rounded-lg bg-slate-800 shrink-0 border border-slate-700 overflow-hidden relative group flex items-center justify-center"
                    title={task.status === 'processing' ? "Generating..." : "Open"}
                  >
                    {task.status === 'processing' ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-[8px] text-cyan-400">Generating</span>
                      </div>
                    ) : task.resultUrl ? (
                      <video
                        src={task.resultUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <div className="text-[9px] text-red-400">Failed</div>
                    )}
                  </button>
                ))}

                {(superIpVideoHistory?.length ? superIpVideoHistory : [])
                  .filter((h: any) => !superIpTasks.some(t => t.taskId && (t.taskId === h.task_id || t.taskId === h.taskId)))
                  .map((item: any, idx: number) => {
                  const thumb = item?.file_url || item?.stored_url || item?.file_data || item?.url;
                  return (
                    <button
                      key={item?.id || idx}
                      type="button"
                      onClick={() => {
                        if (thumb) setSuperIpGenResultUrl(String(thumb));
                      }}
                      className="w-24 h-16 rounded-lg bg-slate-800 shrink-0 border border-slate-700 overflow-hidden relative group"
                      title="打开"
                    >
                      {thumb ? (
                        <video
                          src={thumb}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          onMouseOver={(e) => e.currentTarget.play()}
                          onMouseOut={(e) => e.currentTarget.pause()}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                          video
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex gap-3">
        {step > 1 && (
          <NeonButton
            variant="secondary"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-2"
          >
            {t("common.back")}
          </NeonButton>
        )}
        <NeonButton
          variant="purple"
          onClick={() =>
            step < 3 ? setStep((s) => s + 1) : setStep(1)
          }
          className="flex-[2] py-2"
        >
          {step === 3 ? t("common.start_new") : t("common.next_step")}
        </NeonButton>
      </div>

      {/* Gallery Modal */}
      {showGallery && createPortal(
        <AnimatePresence>
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGallery(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              style={{ zIndex: 999999 }}
            />
            
            {/* Gallery Dialog - 全屏显示，从顶部开始 */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 bg-[#0f1419] flex flex-col overflow-hidden"
              style={{ zIndex: 1000000 }}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/50 bg-slate-950/60 flex-shrink-0">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ImageIcon size={16} className="text-cyan-400" />
                  Select Image - History
                </h3>
                <button 
                  onClick={() => setShowGallery(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  aria-label="关闭图库"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content - 全屏滚动，充分利用空间 */}
              <div 
                className="flex-1 overflow-y-auto px-4 pt-3 pb-4" 
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#475569 transparent'
                }}
              >
                {loadingGallery ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs text-slate-400 font-medium">加载中...</p>
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-28 pb-20">
                    <div className="w-16 h-16 rounded-full bg-slate-800/30 flex items-center justify-center">
                      <ImageIcon size={28} className="text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium -mt-1">暂无历史图片</p>
                    <p className="text-xs text-slate-600">生成图片后会显示在这里</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {galleryImages.map((img, index) => (
                      <motion.div
                        key={img.id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleSelectGalleryImage(img.file_url)}
                        className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer hover:border-cyan-500/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                      >
                        <img
                          src={img.file_url}
                          alt={img.prompt || `图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Hover overlay with prompt */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                          {img.prompt && (
                            <p className="text-[9px] text-white/90 line-clamp-2 font-medium leading-snug">{img.prompt}</p>
                          )}
                        </div>
                        {/* Selection indicator */}
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}

      {/* Audio Gallery Modal */}
      {showAudioGallery && createPortal(
        <AnimatePresence>
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAudioGallery(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              style={{ zIndex: 999999 }}
            />
            
            {/* Audio Gallery Dialog - 全屏显示 */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 bg-[#0f1419] flex flex-col overflow-hidden"
              style={{ zIndex: 1000000 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/50 bg-slate-950/60 flex-shrink-0">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Volume2 size={16} className="text-cyan-400" />
                  Select Audio - History
                </h3>
                <button 
                  onClick={() => setShowAudioGallery(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  aria-label="关闭音频库"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content - 音频列表 */}
              <div 
                className="flex-1 overflow-y-auto px-5 pt-4 pb-5" 
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#475569 transparent'
                }}
              >
                {loadingAudioHistory ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs text-slate-400 font-medium">加载中...</p>
                  </div>
                ) : audioHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full bg-slate-800/30 flex items-center justify-center mb-3">
                      <Volume2 size={28} className="text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium mb-1">暂无历史音频</p>
                    <p className="text-xs text-slate-600">生成音频后会显示在这里</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {audioHistory.map((audio, index) => (
                      (() => {
                        const isSelected =
                          (selectedAudioHistoryId !== null &&
                            selectedAudioHistoryId !== undefined &&
                            (audio as any)?.id !== undefined &&
                            (audio as any)?.id !== null &&
                            String((audio as any).id) === String(selectedAudioHistoryId)) ||
                          (!!selectedAudioUrl &&
                            normalizeUrlForCompare(selectedAudioUrl) ===
                              normalizeUrlForCompare((audio as any)?.file_url || (audio as any)?.url || (audio as any)?.audio_url));

                        return (
                      <motion.div
                        key={audio.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "bg-slate-900/60 border rounded-xl px-4 py-4 transition-all group",
                          isSelected
                            ? "border-2 border-cyan-400 shadow-[0_0_0_2px_rgba(34,211,238,0.25)]"
                            : "border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Audio Info */}
                          <div className="flex-1 min-w-0">
                            <div className="pl-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Volume2 size={12} className="text-white flex-shrink-0" />
                                <span className="text-xs font-semibold text-white truncate">
                                  {audio.generation_params?.voice_name || '音频文件'}
                                </span>
                              </div>
                              {(() => {
                                const promptText =
                                  audio?.prompt ||
                                  audio?.generation_params?.prompt ||
                                  audio?.generation_params?.text ||
                                  audio?.text ||
                                  audio?.input_text ||
                                  audio?.api_response_data?.text ||
                                  '';

                                return promptText ? (
                                  <div
                                    className="mt-2 rounded-lg bg-white/6 border border-white/12 px-2 py-1.5 overflow-hidden"
                                    title={promptText}
                                    style={{
                                      lineHeight: '1.35',
                                      maxHeight: '2.7em',
                                    }}
                                  >
                                    <p
                                      className="text-[10px] text-white break-words"
                                      style={{
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 2,
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {promptText}
                                    </p>
                                  </div>
                                ) : null;
                              })()}
                              {audio.created_at && (
                                <p className="text-[9px] text-white/80 mt-2">
                                  {new Date(audio.created_at).toLocaleString('zh-CN')}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Select Button */}
                          <button
                            onClick={() => handleSelectAudioHistoryItem(audio)}
                            disabled={isSelected}
                            className={cn(
                              "flex-shrink-0 px-3 py-1.5 rounded-lg border text-[9px] font-bold transition-all",
                              isSelected
                                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 cursor-default"
                                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]",
                            )}
                          >
                            {isSelected ? '已选择' : '选择'}
                          </button>

                        </div>
                      </motion.div>
                        );
                      })()
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}

      {/* Voice Model Dialog (system/custom/clone) */}
      {showVoiceModelDialog && createPortal(
        <AnimatePresence>
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoiceModelDialog(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              style={{ zIndex: 999999 }}
            />

            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 bg-[#0f1419] flex flex-col overflow-hidden"
              style={{ zIndex: 1000000 }}
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/50 bg-slate-950/60 flex-shrink-0">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Volume2 size={16} className="text-cyan-400" />
                  Select Voice Model
                </h3>
                <button
                  onClick={() => setShowVoiceModelDialog(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  aria-label="关闭音色选择"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/50 bg-slate-950/40">
                {([
                  { key: 'system', label: 'System' },
                  { key: 'custom', label: 'Custom' },
                  { key: 'clone', label: 'Clone' },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setVoiceDialogTab(t.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                      voiceDialogTab === t.key
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white",
                    )}
                  >
                    {t.label}
                  </button>
                ))}

                <div className="flex-1" />
                <button
                  onClick={fetchVoiceModels}
                  disabled={loadingVoiceModels}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                    loadingVoiceModels
                      ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white",
                  )}
                >
                  Refresh
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
                {loadingVoiceModels ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs text-slate-400 font-medium">加载中...</p>
                  </div>
                ) : voiceModelError ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-slate-300 font-medium mb-2">加载失败</p>
                    <p className="text-xs text-slate-600">{voiceModelError}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const list =
                        voiceDialogTab === 'system'
                          ? (availableVoices.system || [])
                          : voiceDialogTab === 'custom'
                            ? (availableVoices.custom || [])
                            : (availableVoices.clone || []);

                      if (!list.length) {
                        return (
                          <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full bg-slate-800/30 flex items-center justify-center mb-3">
                              <Volume2 size={28} className="text-slate-600" />
                            </div>
                            <p className="text-sm text-slate-400 font-medium mb-1">暂无音色</p>
                            <p className="text-xs text-slate-600">切换 Tab 或刷新试试</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {list.map((v, idx) => {
                            const vid = String(v.voice_id || v.id || "");
                            const isSelected = !!overrideVoiceId && overrideVoiceId === vid;
                            return (
                              <button
                                key={vid || idx}
                                onClick={() => handleSelectVoiceModel(v)}
                                className={cn(
                                  "w-full text-left bg-slate-900/60 border rounded-xl px-4 py-3 transition-all",
                                  isSelected
                                    ? "border-2 border-cyan-400 shadow-[0_0_0_2px_rgba(34,211,238,0.25)]"
                                    : "border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60",
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-white truncate">
                                      {voiceItemLabel(v)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {vid}
                                    </div>
                                  </div>
                                  <span
                                    className={cn(
                                      "px-3 py-1.5 rounded-lg border text-[9px] font-bold",
                                      isSelected
                                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                        : "bg-slate-800 border-slate-700 text-slate-300",
                                    )}
                                  >
                                    {isSelected ? "Selected" : "Select"}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

// 4. History Page
const HistoryView = () => {
    const { t } = useContext(LanguageContext);
  type HistoryContentType = "image" | "video" | "audio";

  type HistoryRecord = {
    id: number | string;
    content_type: HistoryContentType;
    content_subtype?: string | null;
    source_page?: string | null;
    prompt?: string | null;
    created_at?: string | null;
    duration?: number | null;
    dimensions?: string | null;
    file_url?: string | null;
  };

  const filters: Array<{ label: string; value: "all" | HistoryContentType }> = [
    { label: t("history.filter.all"), value: "all" },
    { label: t("history.filter.video"), value: "video" },
    { label: t("history.filter.image"), value: "image" },
    { label: t("history.filter.audio"), value: "audio" },
  ];

  const [activeFilter, setActiveFilter] = useState<
    "all" | HistoryContentType
  >("all");
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Expanded media player (full-screen modal)
  const [expandedVideo, setExpandedVideo] = useState<{
    id: string;
    url: string;
  } | null>(null);

  // Audio player state (custom UI)
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [pausedId, setPausedId] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDurationsById, setAudioDurationsById] = useState<Record<string, number>>({});

  const getRecordUrl = (record: any): string => {
    const candidates = [
      record?.file_url,
      record?.stored_url,
      record?.file_data,
      record?.url,
      record?.video_url,
      record?.audio_url,
      record?.image_url,
    ];
    const picked = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
    return (picked || "").toString();
  };

  const fmtTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const stopAudio = () => {
    try {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
      }
    } catch {
      // ignore
    }
    setPlayingId(null);
    setPausedId(null);
    setAudioCurrentTime(0);
  };

  const toggleAudio = (id: string, url: string) => {
    // Single shared <audio> element so we can build a custom player without styling native controls.
    try {
      if (!audioElRef.current) audioElRef.current = new Audio();
      const a = audioElRef.current;
      a.preload = "metadata";
      a.crossOrigin = "anonymous";

      // If this track is currently playing (and not already paused), pause it.
      if (playingId === id && pausedId !== id) {
        a.pause();
        // Keep cursor/time where it is; just mark this card as paused.
        setPausedId(id);
        return;
      }

      // Resume if this track is paused
      if (pausedId === id) {
        // Resume should NOT touch `src`, otherwise it can restart the audio from 0.
        // `src` is already set when we first started this track.
        a.play()
          .then(() => {
            setPlayingId(id);
            setPausedId(null);
          })
          .catch(() => {
            // ignore
          });
        return;
      }

      // switch track
      if (a.src !== url) {
        a.src = url;
        // reset UI cursor for the new track
        setAudioCurrentTime(0);
        setAudioDuration(0);
        setPausedId(null);
      }

      a.play().then(() => {
        setPlayingId(id);
        setPausedId(null);
      }).catch(() => {
        // autoplay restrictions or decode errors
        setPlayingId(null);
        setPausedId(null);
      });
    } catch {
      setPlayingId(null);
      setPausedId(null);
    }
  };

  // Keep audio progress in sync
  // NOTE: the Audio element is created lazily (inside toggleAudio), so we bind listeners on-demand.
  useEffect(() => {
    if (!audioElRef.current) return;
    const a = audioElRef.current;

    const onTime = () => setAudioCurrentTime(a.currentTime || 0);
    const onMeta = () => {
      const d = Number.isFinite(a.duration) ? a.duration : 0;
      setAudioDuration(d);
      if (playingId) setAudioDurationsById((prev) => ({ ...prev, [playingId]: d }));
    };
    const onEnded = () => {
      setPlayingId(null);
      setPausedId(null);
      setAudioCurrentTime(0);
    };
    const onError = () => {
      setPlayingId(null);
      setPausedId(null);
    };

    const onPause = () => {
      // When pausing (not ending), keep the knob where it stopped.
      if (playingId) setPausedId(playingId);
    };

    const onPlay = () => {
      // When playing, clear paused state
      setPausedId(null);
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
  a.addEventListener("pause", onPause);
  a.addEventListener("play", onPlay);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
    };
  }, [playingId]);

  // Preload audio durations so each card shows correct total time even when not playing
  useEffect(() => {
    const audios = historyRecords.filter((r) => r.content_type === "audio");
    if (audios.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const r of audios) {
        const id = String(r.id);
        if (audioDurationsById[id]) continue;
        const url = getRecordUrl(r);
        if (!url) continue;

        try {
          const a = new Audio();
          a.preload = "metadata";
          a.src = url;
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            a.onloadedmetadata = done;
            a.onerror = done;
          });
          const d = Number.isFinite(a.duration) ? a.duration : 0;
          if (!cancelled && d > 0) {
            setAudioDurationsById((prev) => ({ ...prev, [id]: d }));
          }
        } catch {
          // ignore
        }

        // avoid requesting too many at once on mobile
        await new Promise((r) => setTimeout(r, 80));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyRecords]);

  const audioSeekBarStyle = (progressPct: number): React.CSSProperties => ({
    WebkitAppearance: "none",
    appearance: "none",
    height: 4,
    borderRadius: 999,
    background: `linear-gradient(90deg, rgba(34,211,238,0.95) 0%, rgba(217,70,239,0.85) ${Math.max(
      0,
      Math.min(100, progressPct),
    )}%, rgba(148,163,184,0.25) ${Math.max(0, Math.min(100, progressPct))}%, rgba(148,163,184,0.25) 100%)`,
    outline: "none",
  });

  // If you expand a video, stop audio to avoid messy overlapping media.
  useEffect(() => {
    if (expandedVideo) stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedVideo]);

  const fetchHistory = async (filter: "all" | HistoryContentType) => {
    setLoadingHistory(true);
    try {
  const token = localStorage.getItem("access_token");
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

      console.log("🔍 History fetch debug:", {
        filter,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        apiBase: API_BASE
      });

      const params = new URLSearchParams({ limit: "100" });
      if (filter !== "all") params.append("content_type", filter);

      const url = `${API_BASE}/api/history/list?${params.toString()}`;
      console.log("📤 获取历史记录:", url);

      const resp = await fetch(url,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        },
      );

      console.log("📥 历史记录响应:", {
        ok: resp.ok,
        status: resp.status,
        statusText: resp.statusText
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        console.warn("❌ 加载历史失败:", resp.status, errText);
        setHistoryRecords([]);
        return;
      }

      const data = await resp.json();
      console.log("✅ 历史记录数据:", {
        total: Array.isArray(data) ? data.length : 0,
        hypersellCount: Array.isArray(data) ? data.filter(r => r.source_page === "HyperSell").length : 0,
        videoCount: Array.isArray(data) ? data.filter(r => r.content_type === "video").length : 0
      });
      setHistoryRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("❌ 加载历史失败:", e);
      setHistoryRecords([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  // Allow other views (e.g., HyperSell) to trigger a History refresh after saving.
  // This is a frontend-only way to mimic Enhance's "appears immediately" behavior.
  useEffect(() => {
    (window as any).__vgot_refresh_history__ = () => {
      try {
        fetchHistory(activeFilter);
      } catch {
        // ignore
      }
    };
    return () => {
      try {
        delete (window as any).__vgot_refresh_history__;
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const formatHistoryDate = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadFromUrl = async (url: string, record: HistoryRecord) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;

      const ts = Date.now();
      const ext =
        record.content_type === "image"
          ? "png"
          : record.content_type === "video"
            ? "mp4"
            : "mp3";
      link.download = `vgot_${record.content_type}_${ts}.${ext}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.warn("Download failed:", e);
    }
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-4">
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
          {t("history.title")}
        </h1>
      </header>

      {/* Horizontal Filter Chips */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-2 no-scrollbar mask-gradient-right">
        {filters.map((f, i) => (
          (() => {
            const isActive = activeFilter === f.value;
            return (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            style={isActive ? {
              backgroundColor: '#fcf2b9ff',
              borderColor: '#FFD700',
              color: '#000000',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
            } : undefined}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
              !isActive && "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400",
            )}
          >
            {f.label}
          </button>
            );
          })()
        ))}
      </div>

      {/* List */}
      <div className="space-y-4 overflow-y-auto">
        {loadingHistory ? (
          <div className="py-10 text-center text-slate-500 text-[10px] font-medium">
            {t("history.loading")}
          </div>
        ) : historyRecords.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-[10px] font-medium">
            {t("history.empty")}
          </div>
        ) : (
          historyRecords.map((record) => {
            const type = record.content_type;
            const dateText = formatHistoryDate(record.created_at);
            const mediaUrl = getRecordUrl(record);
            const idStr = String(record.id);
            const isExpanded = expandedVideo?.id === idStr;
            const badgeClass =
              record.source_page === "HyperSell"
                ? "border-purple-500/30 text-purple-400 bg-purple-500/10"
                : "border-cyan-500/30 text-cyan-400 bg-cyan-500/10";
            const badgeText = record.source_page === "HyperSell" ? "HYPERSELL" : "SUPER IP";

            return (
              <GlassCard
                key={String(record.id)}
                className="p-0 flex flex-col group border-slate-800 bg-slate-900/40"
              >
                <div className="px-4 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                          badgeClass,
                        )}
                      >
                        {badgeText}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-white/5 text-white/70 border-white/10">
                        {type}
                      </span>
                    </div>

                    {dateText && (
                      <div className="shrink-0 text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {dateText}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex p-4 gap-4 items-start">
                  {type !== "audio" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!mediaUrl) return;
                        if (type === "video") {
                          setExpandedVideo({ id: idStr, url: mediaUrl });
                          return;
                        }
                      }}
                      className={cn(
                        "w-24 h-24 shrink-0 rounded-xl overflow-hidden relative border",
                        mediaUrl ? "border-slate-700 bg-black" : "border-slate-800 bg-slate-950/80",
                      )}
                      aria-label="Open media"
                    >
                      {type === "image" && mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={record.prompt || "History image"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : type === "video" && mediaUrl ? (
                        <>
                          <video
                            src={mediaUrl}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shadow-[0_0_16px_rgba(0,0,0,0.5)]">
                              <Play size={16} className="text-white/90" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                          {type === "video" ? (
                            <Play size={16} className="text-slate-500" />
                          ) : (
                            <ImageIcon size={16} className="text-slate-500" />
                          )}
                        </div>
                      )}
                    </button>
                  )}

                  <div className={cn("flex-1 min-w-0", type === "audio" && "pl-0")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {record.prompt ? (
                          <div className="text-[11px] text-white/90 font-semibold line-clamp-2">
                            {record.prompt}
                          </div>
                        ) : (
                          <div className="text-[10px] leading-snug text-slate-500/90 font-normal">No prompt</div>
                        )}
                      </div>
                    </div>

                    {type === "audio" && mediaUrl && (
                      <div className="mt-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleAudio(idStr, mediaUrl)}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                              playingId === idStr || pausedId === idStr
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                                : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                            )}
                            aria-label={playingId === idStr && pausedId !== idStr ? "Pause audio" : "Play audio"}
                          >
                            {playingId === idStr && pausedId !== idStr ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <div className="flex-1">
                            {(() => {
                              const durationForThis =
                                playingId === idStr
                                  ? audioDuration
                                  : (audioDurationsById[idStr] || 0);
                              const isThisPlaying = playingId === idStr;
                              const isThisPaused = pausedId === idStr;
                              const currentForThis = isThisPlaying || isThisPaused ? audioCurrentTime : 0;
                              const remainingForThis = Math.max(
                                0,
                                (durationForThis || 0) - (currentForThis || 0),
                              );
                              const pct = durationForThis > 0 ? (currentForThis / durationForThis) * 100 : 0;
                              return (
                                <>
                            <input
                              type="range"
                              className="w-full cursor-pointer vgot-audio-seek"
                              min={0}
                              max={durationForThis || 0}
                              step={0.01}
                              value={currentForThis}
                              style={audioSeekBarStyle(pct)}
                              onChange={(e) => {
                                const t = Number(e.target.value || 0);
                                setAudioCurrentTime(t);
                                if (audioElRef.current && (playingId === idStr || pausedId === idStr)) {
                                  audioElRef.current.currentTime = t;
                                }
                              }}
                            />
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                              <span>{isThisPlaying ? "00:00" : fmtTime(currentForThis)}</span>
                              <span>
                                {isThisPlaying ? fmtTime(remainingForThis) : fmtTime(durationForThis)}
                              </span>
                            </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 p-3 flex justify-between items-center bg-white/[0.02]">
                  <span />
                  <button
                    type="button"
                    disabled={!mediaUrl}
                    onClick={() => mediaUrl && downloadFromUrl(mediaUrl, record)}
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      mediaUrl
                        ? "text-white hover:text-cyan-400"
                        : "text-slate-600 cursor-not-allowed",
                    )}
                  >
                    Download
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {expandedVideo &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setExpandedVideo(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-[720px] rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <div className="text-[10px] font-bold tracking-wider uppercase text-slate-300">
                  Video
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedVideo(null)}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-black">
                <video
                  src={expandedVideo.url}
                  controls
                  autoPlay
                  preload="metadata"
                  playsInline
                  className="w-full max-h-[70vh] object-contain"
                  controlsList="nodownload noplaybackrate"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

// --- Credits usage cache (mirrors desktop UsageContext behavior in a lightweight, local way)
type DailyUsageItem = { current: number; limit: number; remaining: number };
type DailyUsageMap = Record<
  "script_extraction" | "script_analysis" | "script_rewrite",
  DailyUsageItem
>;

const DEFAULT_DAILY_USAGE: DailyUsageMap = {
  script_extraction: { current: 0, limit: 50, remaining: 50 },
  script_analysis: { current: 0, limit: 50, remaining: 50 },
  script_rewrite: { current: 0, limit: 50, remaining: 50 },
};

const DAILY_USAGE_CACHE_KEY = "dailyUsageCache";

const isSameDay = (isoA: string, isoB: string) => {
  try {
    return new Date(isoA).toDateString() === new Date(isoB).toDateString();
  } catch {
    return false;
  }
};

// 5. Scripts Page
const ScriptsView = ({
  user,
  isLoggedIn,
  dailyUsage,
  dailyUsageInitialized,
  dailyUsageLoading,
  refreshDailyUsage,
  updateActionUsage,
  onUnauthorized,
  onNavigate,
}: {
  user: UserProfile | null;
  isLoggedIn: boolean;
  dailyUsage: DailyUsageMap;
  dailyUsageInitialized: boolean;
  dailyUsageLoading: boolean;
  refreshDailyUsage: (force?: boolean) => Promise<void>;
  updateActionUsage: (actionType: keyof DailyUsageMap) => void;
  onUnauthorized: () => void;
  onNavigate: (tab: string) => void;
}) => {
  const { t } = useContext(LanguageContext);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rewriteFileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [activeMode, setActiveMode] = useState<
    "extract" | "scene" | "rewrite"
  >("extract");

  const [videoUrl, setVideoUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [rewriteText, setRewriteText] = useState("");
  const [rewriteImageFile, setRewriteImageFile] = useState<File | null>(null);
  const [rewriteImageUrl, setRewriteImageUrl] = useState<string | null>(null);

  const actionType: keyof DailyUsageMap =
    activeMode === "extract"
      ? "script_extraction"
      : activeMode === "scene"
        ? "script_analysis"
        : "script_rewrite";

  const isFreeTier = String((user?.tier || "")).toLowerCase() === "free";
  const usageForAction = dailyUsage?.[actionType] || DEFAULT_DAILY_USAGE[actionType];
  const remaining = typeof usageForAction?.remaining === "number" ? usageForAction.remaining : 0;
  const limit = typeof usageForAction?.limit === "number" ? usageForAction.limit : 0;
  const isOutOfQuota = isFreeTier && dailyUsageInitialized && remaining <= 0;
  const canRun = isLoggedIn && !loading && !isOutOfQuota;

  useEffect(() => {
    if (!isLoggedIn) return;
    // Refresh usage when switching mode so the remaining count is up-to-date.
    refreshDailyUsage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, isLoggedIn]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      if (rewriteImageUrl) URL.revokeObjectURL(rewriteImageUrl);
    };
  }, [localPreviewUrl, rewriteImageUrl]);

  const modes = [
    {
      id: "extract",
      label: t("video_insights.mode.extract"),
      icon: Zap,
    },
    {
      id: "scene",
      label: t("video_insights.mode.scene"),
      icon: Film,
    },
    {
      id: "rewrite",
      label: t("video_insights.mode.rewrite"),
      icon: PenTool,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setUploadedFile(file);
      setLocalPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRewriteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (rewriteImageUrl) URL.revokeObjectURL(rewriteImageUrl);
      setRewriteImageFile(file);
      setRewriteImageUrl(URL.createObjectURL(file));
    }
  };

  const getResultText = (res: any) => {
    if (!res) return "";
    if (typeof res === "string") return res;
    if (res.text) return res.text;
    if (res.transcript) return res.transcript;
    if (Array.isArray(res.content)) {
      return res.content
        .map((it: any) => (it && it.text ? String(it.text).trim() : ""))
        .filter(Boolean)
        .join(" ");
    }
    // If it's an object with many fields, try to find a string field that looks like content
    const stringFields = Object.values(res).filter(v => typeof v === 'string' && v.length > 20);
    if (stringFields.length > 0) return stringFields[0] as string;

    return JSON.stringify(res, null, 2);
  };

  const handleAnalyze = async () => {
    if (!isLoggedIn) {
      onNavigate("login");
      return;
    }

    // Free tier daily usage gate (mirrors desktop behavior)
    if (isOutOfQuota) {
      setError("Daily limit reached. Please upgrade to continue.");
      return;
    }

    // 1. Pre-validation
    if (activeMode !== "rewrite") {
      if (!videoUrl && !uploadedFile) {
        setError("Please provide a video URL or upload a file");
        return;
      }
    } else {
      if (!rewriteText) {
        setError("Please enter the script content");
        return;
      }
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let finalVideoUrl = videoUrl;

      // 2. Handle File Upload if needed
      if (activeMode !== "rewrite" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const uploadRes = await api.post("/api/upload-video", formData);
        finalVideoUrl = uploadRes.url;
      }

      // 3. Call Analysis API
      if (activeMode === "extract") {
        const res = await api.post("/api/video/extract-script", { video_url: finalVideoUrl });
        setResult(getResultText(res));
        if (isFreeTier) updateActionUsage("script_extraction");
      } else if (activeMode === "scene") {
        // SSE for scene analysis
        const token = localStorage.getItem("access_token");
        const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "";
        const response = await fetch(`${baseUrl}/api/video/scene-analysis`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ video_url: finalVideoUrl })
        });

        if (!response.ok) {
          if (response.status === 401) {
            onUnauthorized();
            throw new Error("Session expired. Please login again.");
          }
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Scene analysis failed");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") {
                  setLoading(false);
                  if (isFreeTier) updateActionUsage("script_analysis");
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    accumulatedText += parsed.content;
                    setResult(accumulatedText);
                  } else if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (e) {
                  console.warn("JSON parse error", e);
                }
              }
            }
          }
        }
      } else if (activeMode === "rewrite") {
        let imageUrl = "";
        if (rewriteImageFile) {
          const formData = new FormData();
          formData.append("file", rewriteImageFile);
          const uploadRes = await api.post("/api/upload-video", formData);
          imageUrl = uploadRes.url;
        }

        const res = await api.post("/api/script/rewrite", {
          script_text: rewriteText,
          image_url: imageUrl || undefined
        });
        setResult(getResultText(res));
        if (isFreeTier) updateActionUsage("script_rewrite");
      }
    } catch (err: any) {
      const msg = err?.message || "An error occurred";
      // If our API wrapper surfaced a 401 through the message, treat it as unauth.
      if (String(msg).includes("401")) {
        onUnauthorized();
      }
      setError(msg);
      setLoading(false);
    } finally {
      if (activeMode !== "scene") setLoading(false);
    }
  };

  const handleClearResult = () => {
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-xl font-black text-white tracking-tight uppercase">
          {t("video_insights.title")}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {t("video_insights.desc")}
        </p>
      </header>

      {/* Mode Selector (Analysis Options) */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id as any);
                setResult(null);
                setError(null);
              }}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-slate-800 border-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.2)]"
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700",
              )}
            >
              <div
                className={cn(
                  "mb-2 p-1.5 rounded-full",
                  isActive
                    ? "bg-fuchsia-500/20 text-fuchsia-400"
                    : "bg-slate-800 text-slate-600",
                )}
              >
                <Icon size={16} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold text-center leading-tight mb-1",
                  isActive ? "text-white" : "text-slate-400",
                )}
              >
                {mode.label}
              </span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/10 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="flex-1 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 relative group">
          {/* Dynamic Inputs based on Mode */}
          {activeMode === "rewrite" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {t("video_insights.input.script")}
                </label>
                <textarea
                  value={rewriteText}
                  onChange={(e) => setRewriteText(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none focus:border-fuchsia-500 outline-none placeholder:text-slate-600 transition-all"
                  placeholder={t("video_insights.placeholder.script")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {t("video_insights.input.visual")}
                </label>
                <div
                  onClick={() => !rewriteImageFile && rewriteFileInputRef.current?.click()}
                  className={cn(
                    "h-40 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/50 hover:border-fuchsia-500/50 transition-colors relative overflow-hidden",
                    !rewriteImageFile && "cursor-pointer"
                  )}
                >
                  {rewriteImageFile && rewriteImageUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                      <img
                        src={rewriteImageUrl}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRewriteImageFile(null);
                          if (rewriteImageUrl) URL.revokeObjectURL(rewriteImageUrl);
                          setRewriteImageUrl(null);
                          if (rewriteFileInputRef.current) rewriteFileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/80 z-10"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Upload size={16} />
                      <span className="text-[10px]">
                        {t("video_insights.upload.image_btn")}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={rewriteFileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleRewriteImageUpload}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Upload */}
              <div
                onClick={() => !videoUrl && fileInputRef.current?.click()}
                className={cn(
                  "h-32 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center bg-slate-900/50 hover:border-fuchsia-500/50 hover:bg-slate-900/80 transition-all relative overflow-hidden",
                  !videoUrl && "cursor-pointer"
                )}
              >
                {(uploadedFile && localPreviewUrl) || (videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('supabase'))) ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                    <video
                      src={localPreviewUrl || videoUrl}
                      className="h-full w-full object-contain"
                      controls
                      playsInline
                      key={localPreviewUrl || videoUrl}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (uploadedFile) {
                          setUploadedFile(null);
                          if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
                          setLocalPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        } else {
                          setVideoUrl("");
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/80 z-20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover/upload:scale-110 transition-transform">
                      <Upload
                        className="text-slate-400 group-hover/upload:text-fuchsia-400"
                        size={24}
                      />
                    </div>
                    <p className="text-slate-400 text-[10px] font-medium">
                      {t("video_insights.upload.placeholder")}
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="video/*"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-slate-950 px-2 text-slate-500 font-bold tracking-wider">
                    {t("video_insights.upload.paste_link")}
                  </span>
                </div>
              </div>

              {/* Link Input */}
              <div className="space-y-2">
                <div className="relative group/input">
                  <Link
                    className="absolute left-3 top-3 text-slate-500 group-focus-within/input:text-fuchsia-400 transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      if (e.target.value) setUploadedFile(null);
                    }}
                    placeholder={t("video_insights.upload.link_placeholder")}
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg text-[10px] outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(192,38,211,0.2)] transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <NeonButton
            onClick={handleAnalyze}
            className={cn(
              "bg-gradient-to-r from-fuchsia-600 to-pink-600 border-fuchsia-500/50 shadow-[0_0_20px_rgba(192,38,211,0.3)] w-full py-3 text-xs",
              (!canRun || dailyUsageLoading) && "opacity-50 cursor-not-allowed"
            )}
            disabled={!canRun || dailyUsageLoading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("video_insights.status.processing")}</span>
              </div>
            ) : (
              <>
                {activeMode === "rewrite" ? (
                  <PenTool size={18} />
                ) : (
                  <Zap size={18} />
                )}
                <span>
                  {activeMode === "rewrite"
                    ? t("video_insights.btn.rewrite")
                    : t("video_insights.btn.analyze")}
                  {isFreeTier && dailyUsageInitialized ? (
                    <span className="ml-2 text-[10px] text-white/80 font-semibold">
                      ({remaining}/{limit})
                    </span>
                  ) : null}
                </span>
              </>
            )}
          </NeonButton>

          {isFreeTier && dailyUsageInitialized && isOutOfQuota ? (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
              {t("video_insights.limit_reached")}
            </div>
          ) : null}
        </div>

        {/* Results Area */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              {t("video_insights.results")}
            </h3>
            {result && (
              <button
                onClick={handleCopy}
                className="text-[10px] text-fuchsia-400 font-bold uppercase hover:text-fuchsia-300 flex items-center gap-1"
              >
                <Check size={12} />
                {t("common.copy")}
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <div
            className={cn(
              "min-h-40 rounded-xl bg-slate-900/30 border border-slate-800 flex flex-col p-4 transition-all relative",
              !result && "items-center justify-center gap-3"
            )}
            style={{ position: 'relative' }}
          >
            {result ? (
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500 pb-10">
                {result}
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                  <Bot size={24} className="text-slate-700" />
                </div>
                <span className="text-slate-500 text-sm">
                  {t("video_insights.results_placeholder")}
                </span>
              </>
            )}

            {result && (
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 20 }}>
                <button
                  onClick={handleClearResult}
                  className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[9px] font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-all uppercase tracking-wider shadow-lg"
                >
                  {t("common.clear")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 7. Partner Program
const PartnerProgramView = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<null | "general" | "partner">(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    socialPlatform: "",
    socialMedia: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Desktop (Vgot_front) writes applications directly into Supabase table `partner_applications`.
  // Mobile mirrors that behavior to avoid needing any backend change.
  const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_PUBLIC_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_PUBLIC_SUPABASE_ANON_KEY || "";

  const handleCopy = async (text: string, field: "general" | "partner") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Clipboard may be blocked on some browsers/contexts.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitError(null);
    setSubmitSuccess(null);

    const missing =
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.socialPlatform.trim() ||
      !form.socialMedia.trim();
    if (missing) {
      setSubmitError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setSubmitError("Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
        return;
      }

      let createClient: any;
      try {
        // Dynamic import so the app still builds even if supabase-js isn't installed.
        // @ts-ignore
        const mod: any = await import("@supabase/supabase-js");
        createClient = mod?.createClient;
      } catch {
        setSubmitError("Missing dependency: @supabase/supabase-js. Please add it to Vgot-app-font-main.");
        return;
      }

      if (!createClient) {
        setSubmitError("Supabase client is unavailable.");
        return;
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const email = form.email.trim().toLowerCase();
      const platform = form.socialPlatform.trim();

      // Dedup check (mirror desktop behavior).
      const { data: existing, error: existsErr } = await supabase
        .from("partner_applications")
        .select("id")
        .eq("email", email)
        .eq("social_platform", platform)
        .limit(1);

      if (existsErr) {
        throw existsErr;
      }
      if (existing && existing.length) {
        setSubmitError("You already applied with this platform.");
        return;
      }

      const insertPayload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email,
        phone: form.phone.trim(),
        social_platform: platform,
        social_account: form.socialMedia.trim(),
        status: "pending",
      };

      const { error: insertError } = await supabase
        .from("partner_applications")
        .insert(insertPayload);

      if (insertError) {
        throw insertError;
      }

      setSubmitSuccess("Application submitted successfully!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        socialPlatform: "",
        socialMedia: "",
      });
      setIsApplyOpen(false);
    } catch (err: any) {
      const msg = err?.message || "Submission failed, please retry.";
      setSubmitError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-white">Partner Program</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-1">
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Users size={32} />
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Join the VGOT Partner Program
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed px-4">
            Share VGOT with your community. Every paid subscription from your link earns you a{" "}
            <span className="text-cyan-400 font-bold">30% recurring commission</span>.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-white">High Recurring Commission</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Not just the first sale. Earn 30% every month as long as your user keeps their subscription.
            </p>
          </div>
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
              <CreditCard size={20} />
            </div>
            <h3 className="font-bold text-white">Stripe Automated Payouts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We handle Stripe Connect and send commissions directly to your bank account.
            </p>
          </div>
          <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
            <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-400">
              <Download size={20} />
            </div>
            <h3 className="font-bold text-white">Exclusive Marketing Resources</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get official demo videos, banners and copy templates to boost your promotion.
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4 mt-8">
          <h3 className="font-bold text-white">Ready to start earning?</h3>
          <p className="text-xs text-slate-400">
            Tell us briefly about your audience. After you apply, our team reviews within 24 hours.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSubmitError(null);
                setSubmitSuccess(null);
                setIsApplyOpen(true);
              }}
              className="w-full py-3 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Apply as Partner
            </button>
            <button
              onClick={() => setIsContactOpen(true)}
              className="w-full py-3 bg-transparent border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <style>{`
            /* Partner modal select dropdown theming (cross-browser best effort) */
            .partner-select { color-scheme: dark; }
            .partner-select option { background-color: #0b1220; color: #eef2ff; }
            .partner-select option:checked { background-color: #4f46e5; color: #ffffff; }
          `}</style>
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => !submitting && setIsApplyOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/80 shadow-[0_25px_80px_rgba(0,0,0,0.65)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10" />
            <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-pink-500/15 blur-3xl" />

            <div className="relative p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-white text-2xl font-black">Apply as Affiliate Partner</div>
                <div className="text-slate-400 text-sm leading-relaxed">Fill in your information to become an affiliate partner.</div>
              </div>
              <button
                className="h-10 w-10 mt-0.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 active:scale-[0.98] transition-all inline-flex items-center justify-center"
                onClick={() => !submitting && setIsApplyOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {submitError && (
              <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-bold mb-1">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/60 focus:bg-white/[0.07] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-bold mb-1">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/60 focus:bg-white/[0.07] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/60 focus:bg-white/[0.07] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/60 focus:bg-white/[0.07] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Social Media Platform</label>
                <select
                  value={form.socialPlatform}
                  onChange={(e) => setForm((p) => ({ ...p, socialPlatform: e.target.value }))}
                  className="partner-select w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-400/60 focus:bg-white/[0.07] hover:bg-white/[0.06] transition-colors"
                  required
                >
                  <option value="" disabled>
                    Select a platform
                  </option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="xiaohongshu">Xiaohongshu</option>
                  <option value="weibo">Weibo</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1">Social Media Account</label>
                <input
                  value={form.socialMedia}
                  onChange={(e) => setForm((p) => ({ ...p, socialMedia: e.target.value }))}
                  placeholder="@username"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/60 focus:bg-white/[0.07] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-1 py-4 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 disabled:opacity-60 shadow-lg shadow-pink-500/10"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsContactOpen(false)} />
          <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/80 shadow-[0_25px_80px_rgba(0,0,0,0.65)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
            <div className="relative p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-white text-2xl font-black">Contact Support</div>
                <div className="text-slate-400 text-sm leading-relaxed">We are here to help. Choose a channel below.</div>
              </div>
              <button
                className="h-10 w-10 mt-0.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 active:scale-[0.98] transition-all inline-flex items-center justify-center"
                onClick={() => setIsContactOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCopy("service@vgot.ai", "general")}
                className="w-full flex items-center justify-between gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-purple-500/30 transition-all"
              >
                <div className="text-left min-w-0">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">General Support</div>
                  <div className="text-white font-mono text-lg truncate">service@vgot.ai</div>
                </div>
                <div className="text-slate-300 text-sm font-bold">
                  {copiedField === "general" ? "Copied" : "Copy"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCopy("affiliate@vgot.ai", "partner")}
                className="w-full flex items-center justify-between gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-pink-500/30 transition-all"
              >
                <div className="text-left min-w-0">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Partner Program</div>
                  <div className="text-white font-mono text-lg truncate">affiliate@vgot.ai</div>
                </div>
                <div className="text-slate-300 text-sm font-bold">
                  {copiedField === "partner" ? "Copied" : "Copy"}
                </div>
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 8. Credits & Usage
const CreditsUsageView = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const [customCredits, setCustomCredits] = useState("");
  const [isCustomFocused, setIsCustomFocused] = useState(false);

  const token = localStorage.getItem("access_token");
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "";

  const [creditsData, setCreditsData] = useState<{
    credits: number;
    monthly_credits: number;
    tier: string;
  }>({ credits: 0, monthly_credits: 0, tier: "Free" });

  const [transactions, setTransactions] = useState<
    Array<{ action?: string; date?: string; change?: number; status?: string }>
  >([]);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);
  const [purchasingCustom, setPurchasingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 7;
  const [currentPage, setCurrentPage] = useState(1);

  const creditsNumber = customCredits ? parseInt(customCredits, 10) : 0;
  const customPrice = creditsNumber ? creditsNumber / 1000 : 0;
  const isStep10 = creditsNumber > 0 && creditsNumber % 10 === 0;
  const isValidCustom = creditsNumber >= 1000 && isStep10;

  // cents = credits / 10 (because 10 credits = 1 cent)
  const customPriceInCents = isStep10 ? creditsNumber / 10 : 0;

  const fetchCreditsData = async () => {
    if (!token) {
      setCreditsError("请先登录");
      setLoadingCredits(false);
      return;
    }
    try {
      setLoadingCredits(true);
      setCreditsError(null);
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // balance
      const balanceRes = await fetch(`${apiBase}/api/credits/balance`, {
        headers,
      });
      const balanceJson = await balanceRes.json().catch(() => ({}));
      if (!balanceRes.ok) {
        throw new Error(balanceJson?.detail || "获取积分余额失败");
      }
      if (balanceJson?.success) {
        setCreditsData(balanceJson.data);
      }

      // history
      // Backend enforces limit <= 100 (422 otherwise). Fetch enough pages and concat.
      const HISTORY_LIMIT = 100;
      const HISTORY_PAGES = 2; // 2 * 100 = 200 records max
      let allTx: any[] = [];
      for (let p = 0; p < HISTORY_PAGES; p++) {
        const offset = p * HISTORY_LIMIT;
        const historyRes = await fetch(
          `${apiBase}/api/credits/history?limit=${HISTORY_LIMIT}&offset=${offset}`,
          { headers },
        );
        const historyJson = await historyRes.json().catch(() => ({}));
        if (!historyRes.ok) {
          throw new Error(historyJson?.detail || "获取积分明细失败");
        }
        if (historyJson?.success) {
          const tx = historyJson?.data?.transactions;
          if (Array.isArray(tx)) {
            allTx = allTx.concat(tx);
            // if returned less than limit, no more pages
            if (tx.length < HISTORY_LIMIT) break;
          } else {
            break;
          }
        }
      }
      setTransactions(normalizeTransactions(allTx));
      setCurrentPage(1);
    } catch (e: any) {
      const msg =
        typeof e?.message === "string"
          ? e.message
          : typeof e === "string"
            ? e
            : e && typeof e === "object"
              ? (e.detail || e.error || JSON.stringify(e))
              : "加载失败";
      setCreditsError(msg || "加载失败");
    } finally {
      setLoadingCredits(false);
    }
  };

  useEffect(() => {
    fetchCreditsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const parseCreditsChange = (t: any): number => {
    // Backend (vgot-app-backend) returns: { id, action, date, cost: "+10"|"-50", status }
    // Other shapes might include change / credits_change. Normalize to number.
    const direct = t?.change ?? t?.credits_change;
    if (typeof direct === "number") return direct;
    if (typeof direct === "string") {
      const n = Number(direct);
      return Number.isNaN(n) ? 0 : n;
    }
    if (typeof t?.cost === "string") {
      const n = Number(t.cost.replace(/[^0-9+\-\.]/g, ""));
      return Number.isNaN(n) ? 0 : n;
    }
    if (typeof t?.cost === "number") return t.cost;
    return 0;
  };

  const normalizeTransactions = (
    tx: any[],
  ): Array<{ action?: string; date?: string; change?: number; status?: string }> => {
    return (tx || []).map((t: any) => ({
      action: t?.action ?? t?.action_type ?? "",
      date: t?.date ?? t?.created_at ?? "",
      change: parseCreditsChange(t),
      status: t?.status ?? "",
    }));
  };

  const formatChange = (n: any) => {
    const num = typeof n === "number" ? n : Number(n);
    if (Number.isNaN(num)) return "0";
    return `${num > 0 ? "+" : ""}${num}`;
  };

  const startCustomCheckout = async () => {
    if (!token) {
      setCustomError("请先登录");
      return;
    }
    if (creditsNumber < 1000) {
      setCustomError("最少购买 1,000 积分");
      return;
    }
    if (!isStep10) {
      setCustomError("输入需为 10 的倍数（每 1 美分 = 10 积分）");
      return;
    }

    try {
      setCustomError(null);
      setPurchasingCustom(true);
      const res = await fetch(`${apiBase}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: customPriceInCents, currency: "usd" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "创建支付会话失败");
      }
      const url = data?.url;
      if (!url) {
        throw new Error("未返回支付链接");
      }
      window.location.href = url;
    } catch (e: any) {
      setCustomError(e?.message || "网络错误");
    } finally {
      setPurchasingCustom(false);
    }
  };

  const startCreditTopup = async (pack: "10" | "50" | "100") => {
    if (!token) {
      setCreditsError("请先登录");
      return;
    }

    // Desktop implementation uses: amount in cents ($10/$50/$100) -> /api/payments/create-checkout-session
    const amountMap: Record<"10" | "50" | "100", number> = {
      "10": 10 * 100,
      "50": 50 * 100,
      "100": 100 * 100,
    };
    const amount = amountMap[pack];

    try {
      const res = await fetch(`${apiBase}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, currency: "usd" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "创建支付会话失败");
      }
      const url = data?.url;
      if (!url) {
        throw new Error("未返回支付链接");
      }
      window.location.href = url;
    } catch (e: any) {
      setCreditsError(
        typeof e?.message === "string"
          ? e.message
          : typeof e === "string"
            ? e
            : e && typeof e === "object"
              ? (e.detail || e.error || JSON.stringify(e))
              : "网络错误",
      );
    }
  };

  return (
  <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-right duration-300">
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
      >
        <ChevronLeft size={24} className="text-slate-400" />
      </button>
      <h1 className="text-xl font-bold text-white">
        Credits & Usage
      </h1>
    </div>

    <div className="flex-1 overflow-y-auto space-y-8 px-1">
      {/* Balance Card */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-fuchsia-500/70 via-purple-500/50 to-pink-500/60 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
        <div className="relative rounded-3xl !bg-[#32133a] bg-gradient-to-br from-fuchsia-600/45 via-purple-700/40 to-pink-600/35 border border-white/10 overflow-hidden">
          {/* subtle tint layer so the card isn't pure black */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(236,72,153,0.35)_0%,transparent_55%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.28)_0%,transparent_60%),linear-gradient(135deg,rgba(236,72,153,0.18),rgba(168,85,247,0.12))]" />
          <div className="absolute -top-10 -right-10 z-0 w-60 h-60 bg-fuchsia-500/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 z-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 p-6">
            <div className="absolute inset-0 rounded-3xl border border-white/10 !bg-fuchsia-500/12 pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                Current Available Credits
              </div>
              <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300">
                {creditsData.tier || ""}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-5xl font-black text-white tracking-tight drop-shadow-sm">
                {loadingCredits ? "…" : creditsData.credits.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-fuchsia-300">Credits</span>
            </div>

            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-2.5 border border-white/5">
              <div className="h-full w-[87%] bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
            </div>
            <div className="text-xs text-slate-300/80 font-medium">
              Monthly quota used 87%
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Packs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="p-1 bg-yellow-500/10 rounded-md">
            <Zap size={14} className="text-yellow-500" fill="currentColor" />
          </div>
          <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wide">
            Purchase Extra Credit Packs
          </h3>
        </div>
        {[
          { amount: "10,000", price: "$10", highlight: false },
          { amount: "55,000", price: "$50", highlight: true },
          { amount: "120,000", price: "$100", highlight: false },
        ].map((pack) => (
          <button
            key={pack.amount}
            type="button"
            onClick={() => {
              // Desktop-style flow: pick pack -> send amount in cents to /api/payments/create-checkout-session
              const packKey = pack.price === "$10" ? "10" : pack.price === "$50" ? "50" : "100";
              startCreditTopup(packKey as "10" | "50" | "100");
            }}
            className={cn(
              "relative w-full flex items-center justify-between p-5 rounded-2xl transition-all group active:scale-[0.99]",
              pack.highlight 
                ? "bg-fuchsia-500/10 border border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.1)]" 
                : "bg-[#131420] border border-slate-700 hover:border-slate-500"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <Zap size={22} fill="currentColor" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg tracking-tight">
                  {pack.amount} <span className="text-sm font-normal text-slate-400 ml-1">Credits</span>
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Instant delivery
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center h-full pl-4">
              <span className="bg-white text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-white/5 group-hover:bg-slate-200 transition-all min-w-[70px] text-center">
                {pack.price}
              </span>
            </div>
          </button>
        ))}

        {/* Custom Amount */}
        <div className={cn(
          "relative w-full p-5 rounded-2xl transition-all duration-300",
          isCustomFocused || customCredits 
            ? "bg-[#131420] border border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.1)]" 
            : "bg-[#0f111a] border border-dashed border-slate-800 opacity-80 hover:opacity-100"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isCustomFocused || customCredits
                  ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-500"
                  : "bg-slate-800/50 border border-slate-700/50 text-slate-500"
              )}>
                <Zap size={22} />
              </div>
              <div className="flex-1">
                <div className="relative flex items-baseline gap-2">
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={customCredits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCustomCredits(val);
                      if (customError) setCustomError(null);
                    }}
                    onFocus={() => setIsCustomFocused(true)}
                    onBlur={() => setIsCustomFocused(false)}
                    placeholder="Custom"
                    className={cn(
                      "bg-transparent p-0 pb-1 text-lg font-bold text-white placeholder:text-slate-500 focus:ring-0 w-32 outline-none border-b-2 transition-all duration-300",
                      isCustomFocused || customCredits ? "border-fuchsia-600" : "border-transparent"
                    )}
                  />
                  <span className="text-xs font-medium text-slate-500">Credits</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1.5">
                  {customError ? (
                    <span className="text-red-400">{customError}</span>
                  ) : (
                    <>1 USD = 1,000 Credits · 输入需为10的倍数 (每1美分=10积分)</>
                  )}
                </div>
              </div>
            </div>

            <button 
              disabled={!isValidCustom}
              onClick={startCustomCheckout}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold min-w-[90px] text-center transition-all ml-4",
                isValidCustom
                  ? "bg-white text-slate-950 shadow-lg shadow-white/10"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              )}
            >
              {purchasingCustom ? (
                <RefreshCw size={18} className="animate-spin opacity-60 mx-auto" />
              ) : (
                `$${customPrice.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Usage Details */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <BarChart3 size={16} /> Usage Details
          </h3>
        </div>

        {creditsError ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300 text-sm">
            <div className="mb-2 text-red-400 font-semibold">
              {typeof creditsError === "string" ? creditsError : "加载失败"}
            </div>
            <button
              onClick={fetchCreditsData}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Retry
            </button>
          </div>
        ) : loadingCredits ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
            Loading…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {currentTransactions.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                  No records
                </div>
              ) : (
                currentTransactions.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          (item.change ?? 0) < 0
                            ? "bg-fuchsia-500"
                            : "bg-emerald-500",
                        )}
                      />
                      <div>
                        <div className="text-slate-200 font-bold text-sm capitalize">
                          {(item.action || "").replace(/_/g, " ")}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {item.date || ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={cn(
                          "font-mono font-bold text-sm",
                          (item.change ?? 0) < 0
                            ? "text-white"
                            : "text-emerald-400",
                        )}
                      >
                        {formatChange(item.change)}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded inline-block mt-1 font-medium",
                          "bg-slate-800 text-slate-400",
                        )}
                      >
                        {item.status || "Completed"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination (7 per page) */}
            {transactions.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-bold border transition-colors",
                    page <= 1
                      ? "bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-900",
                  )}
                >
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    // show up to 5 pages, centered around current
                    const start = Math.max(1, Math.min(totalPages - 4, page - 2));
                    const pnum = start + idx;
                    return (
                      <button
                        key={pnum}
                        onClick={() => setCurrentPage(pnum)}
                        className={cn(
                          "w-9 h-9 rounded-lg text-xs font-bold border transition-colors",
                          pnum === page
                            ? "bg-fuchsia-600/30 border-fuchsia-500/60 text-white"
                            : "bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-900",
                        )}
                      >
                        {pnum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-bold border transition-colors",
                    page >= totalPages
                      ? "bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-900",
                  )}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
  );
};

// 9. Billing & Plans
const BillingPlansView = ({
  onBack,
  apiBase,
  token,
  onRefreshUser,
}: {
  onBack: () => void;
  apiBase: string;
  token: string | null;
  onRefreshUser: () => void;
}) => {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFeatures, setOpenFeatures] = useState<Record<string, boolean>>({
    free: true,
    creator: false,
    business: false,
    enterprise: false,
  });

  const startMembershipCheckout = async (tier: "creator" | "business") => {
    if (!token) {
      alert("请先登录后再订阅");
      return;
    }
    try {
      setLoadingPlan(`sub:${tier}`);
      const res = await fetch(`${apiBase}/api/membership/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, cycle, platform: "mobile" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.detail || "创建订阅会话失败");
        return;
      }
      const url = data?.checkout_url;
      if (!url) {
        alert("未返回 checkout_url");
        return;
      }
      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "网络错误");
    } finally {
      setLoadingPlan(null);
    }
  };
  type PlanId = "free" | "creator" | "business" | "enterprise";

  type FeatureKind = "ok" | "partial" | "locked";
  type FeatureItem = { label: string; value: string; kind: FeatureKind };

  const featureIcon = (kind: FeatureKind) => {
    if (kind === "locked") return <Lock size={14} className="text-slate-500" />;
    if (kind === "partial") return <Zap size={14} className="text-amber-400" />;
    return <Check size={14} className="text-emerald-400" />;
  };

  const plans: Array<{
    id: PlanId;
    name: string;
    tagline: string;
    priceMonthly: string;
    priceYearly: string;
    billedNote: string;
    credits: string;
    description: string;
    popular?: boolean;
    features: FeatureItem[];
    cta: string;
    onClick: () => void;
  }> = [
    {
      id: "free",
      name: "Free",
      tagline: "Experience",
      priceMonthly: "$0",
      priceYearly: "$0",
      billedNote: "",
      credits: "0 (200 signup bonus)",
      description: "Try the workflow with signup credits.",
      features: [
        { label: "Script Generation", value: "Free (50/day)", kind: "ok" },
        { label: "Character Image", value: "50 credits/generation", kind: "ok" },
        { label: "HyperSell Video", value: "150 credits/generation", kind: "ok" },
        { label: "SuperIP Video", value: "Locked", kind: "locked" },
        { label: "Max Duration", value: "N/A", kind: "locked" },
        { label: "HD Enhancement", value: "N/A", kind: "locked" },
        { label: "Voice Creation", value: "N/A", kind: "locked" },
        { label: "Watermark-free Export", value: "With watermark", kind: "partial" },
        { label: "Priority Queue", value: "Standard", kind: "partial" },
        { label: "API Access", value: "N/A", kind: "locked" },
      ],
      cta: "Get Started",
      onClick: () => alert("免费计划无需订阅，直接使用即可"),
    },
    {
      id: "creator",
      name: "Creator",
      tagline: "Pro",
      priceMonthly: "$29",
      priceYearly: "$290",
      billedNote: cycle === "monthly" ? "Billed monthly" : "Billed yearly",
      credits: "30,000",
      description: "Perfect for individual creators and small content teams.",
      features: [
        { label: "Script Generation", value: "Unlimited", kind: "ok" },
        { label: "Character Image", value: "50 credits/generation", kind: "ok" },
        { label: "HyperSell Video", value: "150 credits/generation", kind: "ok" },
        { label: "SuperIP Video", value: "70 credits/second", kind: "ok" },
        { label: "Max Duration", value: "2 minutes", kind: "ok" },
        { label: "HD Enhancement", value: "800 credits/time", kind: "partial" },
        { label: "Voice Creation", value: "3000 credits/voice", kind: "ok" },
        { label: "Watermark-free Export", value: "Yes", kind: "ok" },
        { label: "Priority Queue", value: "High-speed", kind: "ok" },
        { label: "API Access", value: "N/A", kind: "locked" },
      ],
      cta: "Subscribe",
      onClick: () => startMembershipCheckout("creator"),
    },
    {
      id: "business",
      name: "Business",
      tagline: "Commercial",
      priceMonthly: "$99",
      priceYearly: "$990",
      billedNote: cycle === "monthly" ? "Billed monthly" : "Billed yearly",
      credits: "120,000",
      description: "For agencies and growing e-commerce brands.",
      popular: true,
      features: [
        { label: "Script Generation", value: "Unlimited", kind: "ok" },
        { label: "Character Image", value: "Free Unlimited", kind: "ok" },
        { label: "HyperSell Video", value: "150 credits/generation", kind: "ok" },
        { label: "SuperIP Video", value: "70 credits/second", kind: "ok" },
        { label: "Max Duration", value: "10 minutes", kind: "ok" },
        { label: "HD Enhancement", value: "500 credits (40% off)", kind: "ok" },
        { label: "Voice Creation", value: "First free", kind: "ok" },
        { label: "Watermark-free Export", value: "Yes", kind: "ok" },
        { label: "Priority Queue", value: "High-speed", kind: "ok" },
        { label: "API Access", value: "N/A", kind: "locked" },
      ],
      cta: "Go Business",
      onClick: () => startMembershipCheckout("business"),
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Enterprise",
      priceMonthly: "Custom",
      priceYearly: "Custom",
      billedNote: "",
      credits: "Custom quota",
      description: "Custom solutions for large teams and platforms.",
      features: [
        { label: "Script Generation", value: "Unlimited", kind: "ok" },
        { label: "Character Image", value: "Free Unlimited", kind: "ok" },
        { label: "HyperSell Video", value: "150 credits/generation", kind: "ok" },
        { label: "SuperIP Video", value: "Custom rate", kind: "ok" },
        { label: "Max Duration", value: "Unlimited/Custom", kind: "ok" },
        { label: "HD Enhancement", value: "Custom discount", kind: "ok" },
        { label: "Voice Creation", value: "On-demand gift", kind: "ok" },
        { label: "Watermark-free Export", value: "Yes", kind: "ok" },
        { label: "Priority Queue", value: "Highest priority", kind: "ok" },
        { label: "API Access", value: "Full API", kind: "ok" },
      ],
      cta: "Contact Sales",
      onClick: () => alert("请联系 sales@vgot.ai 获取企业版方案"),
    },
  ];

  useEffect(() => {
    // Stripe return (best-effort): refresh user and clean query params
    try {
      const url = new URL(window.location.href);
      const p = url.searchParams;
      const stripeFlag = (p.get("stripe") || "").toLowerCase();
      const isStripeSuccess = stripeFlag === "success" || p.get("status") === "success" || p.get("paid") === "true";
      const isStripeCancel = stripeFlag === "cancel" || p.get("status") === "cancelled";
      const mightBeReturn =
        p.has("session_id") ||
        isStripeSuccess ||
        isStripeCancel;
      if (!mightBeReturn) return;
      (async () => {
        await new Promise((r) => setTimeout(r, 600));
        onRefreshUser();
        // Mobile app has no router routes; we land on the entry page and switch tabs.
        // Best-effort UX: jump to Billing and show a minimal hint.
        try {
          if (isStripeSuccess) {
            // @ts-ignore - setActiveTab exists in the enclosure scope of App.tsx
            setActiveTab?.("billing");
            alert("订阅成功，正在刷新账户…");
          } else if (isStripeCancel) {
            alert("已取消支付");
          }
        } catch {
          // ignore
        }
        url.search = "";
        window.history.replaceState({}, document.title, url.toString());
      })();
    } catch {
      // ignore
    }
  }, [onRefreshUser]);

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-white">Billing & Plans</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-1">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-300">
            Billing & Plans
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose the plan that suits you best and unlock more creative possibilities
          </p>

          {/* Segmented control (cleaner + mobile-friendly) */}
          <div className="mt-2 w-full max-w-sm mx-auto p-1 rounded-full bg-slate-900/60 border border-white/10 flex items-center gap-1">
            <button
              className={cn(
                "flex-1 py-2 rounded-full text-xs font-bold transition-all",
                cycle === "monthly"
                  ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow"
                  : "text-slate-400 hover:text-white",
              )}
              onClick={() => setCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={cn(
                "flex-1 py-2 rounded-full text-xs font-bold transition-all relative",
                cycle === "yearly"
                  ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow"
                  : "text-slate-400 hover:text-white",
              )}
              onClick={() => setCycle("yearly")}
            >
              Yearly
              <span className="ml-2 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => {
            const price = cycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const isLoading = loadingPlan?.startsWith(plan.id);
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border backdrop-blur-sm p-5",
                  plan.popular ? "border-fuchsia-500/50" : "border-white/10",
                )}
              >
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white text-xl font-black flex items-center gap-2">
                      {plan.name}
                      {plan.id === "business" && <span>👑</span>}
                      {plan.id === "enterprise" && <span>🏢</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{plan.tagline}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-3xl font-black text-white leading-none">
                      {price}
                    </div>
                    {plan.billedNote && (
                      <div className="text-[11px] text-slate-500 mt-1">
                        {plan.billedNote}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Monthly Credits
                  </div>
                  <div className="text-white font-bold">
                    {plan.credits}
                    {(plan.id === "creator" || plan.id === "business") && (
                      <span className="ml-2 text-xs text-slate-500 font-normal">
                        (expires monthly)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  {plan.description}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setOpenFeatures((p) => ({
                      ...p,
                      [plan.id]: !p[plan.id],
                    }))
                  }
                  className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Core Features
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "text-slate-500 transition-transform",
                      openFeatures[plan.id] && "rotate-180",
                    )}
                  />
                </button>

                {openFeatures[plan.id] && (
                  <div className="mt-3 rounded-xl bg-black/20 border border-white/5 p-4 space-y-2">
                    {plan.features.map((f) => (
                      <div
                        key={f.label}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {featureIcon(f.kind)}
                          <span className="text-slate-300 font-medium truncate">
                            {f.label}
                          </span>
                        </div>
                        <span className="text-slate-400 font-semibold text-right">
                          {f.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  disabled={!!loadingPlan}
                  onClick={plan.onClick}
                  className={cn(
                    "w-full mt-4 py-3 rounded-full font-bold text-sm transition-all active:scale-[0.99]",
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-lg shadow-fuchsia-500/10"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10",
                    !!loadingPlan && "opacity-60",
                  )}
                >
                  {isLoading ? "Processing..." : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

// 6. Profile Page
type UserProfile = {
  id: number;
  username: string;
  email?: string | null;
  credits?: number;
  tier?: string;
  invite_code?: string;
  invited_user_count?: number;
  withdrawable_balance?: number;
};

const ProfileView = ({
  onNavigate,
  isLoggedIn,
  onLogout,
  user,
}: {
  onNavigate: (tab: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  user: UserProfile | null;
}) => {
  const { t, lang, setLang } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const availableLanguages: { code: LangKey; label: string }[] = [
    { code: "en", label: "English" },
    { code: "zh", label: "Chinese" },
    { code: "zh-TW", label: "Traditional Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "es", label: "Spanish" },
  ];

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className={clsx("transition-all duration-300", showLanguageModal && "blur-sm brightness-50 pointer-events-none select-none")}>
      <header className="mb-8 flex flex-col items-center pt-4">
        {isLoggedIn && user ? (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] mb-4 shadow-[0_0_20px_rgba(192,38,211,0.3)]">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1585732436636-f786c52696d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjYwNDI5MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{user.username}</h1>
            {user.email ? (
              <p className="text-slate-400 text-sm">{user.email}</p>
            ) : null}
          </>
        ) : (
          <div className="w-full px-4 text-center">
            <h1 className="text-xl font-black text-white tracking-tight mb-2">{t("profile.title")}</h1>
            <p className="text-slate-400 text-sm">{t("profile.login_desc")}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => onNavigate("login")}
                className="px-4 py-2 rounded-md bg-cyan-600 text-white border border-cyan-400/50 hover:bg-cyan-500 text-sm"
              >
                {t("common.login")}
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-6 px-2">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-fuchsia-500/10 rounded-lg text-fuchsia-400 border border-fuchsia-500/20">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-white font-bold">{t("profile.membership") || "Credits"}</div>
              <div className="text-xs text-slate-500">
                {user?.tier ? user.tier : "—"}
              </div>
            </div>
          </div>
          <div className="text-right relative z-10">
            <span className="text-2xl font-black text-white block">
              {typeof user?.credits === "number"
                ? user.credits.toLocaleString()
                : "—"}
            </span>
            <button
              onClick={() => onNavigate("credits_usage")}
              className="text-[10px] text-fuchsia-400 font-bold uppercase hover:text-fuchsia-300"
            >
              {t("profile.top_up")}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
            {t("profile.settings_header")}
          </h3>
          {[
            {
              label: t("profile.menu.partner"),
              icon: Users,
              id: "partner_program",
            },
            {
              label: t("profile.settings.language"),
              icon: Globe,
              action: () => setShowLanguageModal(true),
              value: availableLanguages.find(l => l.code === lang)?.label,
            },
            {
              label: t("profile.menu.billing"),
              icon: CreditCard,
              id: "billing",
            },
            {
              label: t("profile.menu.usage"),
              icon: BarChart3,
              id: "credits_usage",
            },
            {
              label: t("settings.support") || "Help & Support",
              icon: HelpCircle,
              id: "support",
            },
          ].map((item: any) => (
            <button
              key={item.label}
              onClick={() => item.action ? item.action() : (item.id && onNavigate(item.id))}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={18}
                  className="text-slate-500 group-hover:text-cyan-400 transition-colors"
                />
                <span className="text-slate-300 group-hover:text-white font-medium">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-xs text-slate-500 font-medium">{item.value}</span>
                )}
                <ChevronRight
                  size={16}
                  className="text-slate-600 group-hover:text-slate-400"
                />
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4">
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-bold text-sm"
            >
              {t("profile.logout")}
            </button>
          )}
        </div>
      </div>
    </div>

      {showLanguageModal && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 safe-area-bottom"
          style={{ zIndex: 9999999 }}
        >
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2.5 text-lg">
                <Globe size={20} className="text-cyan-400" />
                {t("modal.language.title")}
              </h3>
              <button 
                onClick={() => setShowLanguageModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setShowLanguageModal(false);
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all font-medium",
                    lang === l.code 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                      : "hover:bg-white/5 text-slate-400 border border-transparent"
                  )}
                >
                  <span className="text-base">{l.label}</span>
                  {lang === l.code && <Check size={18} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

// --- Main Layout & App ---

const BottomNav = ({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (t: string) => void;
}) => {
  const { t } = useTranslation();
  const tabs = [
    { id: "workspace", icon: LayoutGrid, label: t("nav.workspace") },
    { id: "scripts", icon: Bot, label: t("nav.scripts") },
    { id: "hypersell", icon: Video, label: t("nav.hypersell") },
    { id: "superip", icon: User, label: t("nav.superip") },
    { id: "history", icon: History, label: t("nav.history") },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-2 z-50 safe-area-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-1.5 group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute -top-[1px] w-8 h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                />
              )}
              <div
                className={cn(
                  "transition-all duration-300 p-1.5 rounded-xl",
                  isActive
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-slate-500 group-hover:text-slate-300",
                )}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide transition-colors duration-300",
                  isActive
                    ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    : "text-slate-600",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer */}
      <div className="h-[80px]" />
    </>
  );
};

export default function App() {
  const [lang, setLang] = useState<LangKey>(() => {
    try {
      const saved = localStorage.getItem("app_lang");
      return (saved && saved in translations) ? (saved as LangKey) : "en";
    } catch { return "en"; }
  });

  const handleSetLang = (l: LangKey) => {
    setLang(l);
    localStorage.setItem("app_lang", l);
  };

  const t = (key: string) => translations[lang]?.[key] || translations["en"][key] || key;

  const [activeTab, setActiveTab] = useState("workspace");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const isLoggedIn = !!token;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsageMap>(DEFAULT_DAILY_USAGE);
  const [dailyUsageLoading, setDailyUsageLoading] = useState(false);
  const [dailyUsageInitialized, setDailyUsageInitialized] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [forgotStep, setForgotStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // For dev we proxy /api to 127.0.0.1:8000 via Vite; for prod use VITE_API_BASE_URL
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || ""; // empty => same-origin with dev proxy

  const fetchUser = async () => {
    const t = localStorage.getItem("access_token");
    if (!t) { setUser(null); return; }
    try {
      const resp = await fetch(`${API_BASE}/api/user/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!resp.ok) throw new Error("failed to fetch user");
      const data = await resp.json();
      setUser(data as UserProfile);
    } catch (e) {
      console.warn("fetch /api/user/me error", e);
    }
  };

  const onUnauthorized = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    setActiveTab("login");
  };

  const loadDailyUsageFromCache = () => {
    const cached = localStorage.getItem(DAILY_USAGE_CACHE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached);
      const ts = parsed?.timestamp;
      const data = parsed?.data;
      if (ts && data && isSameDay(String(ts), new Date().toISOString())) {
        setDailyUsage(data as DailyUsageMap);
        setDailyUsageInitialized(true);
      }
    } catch {
      // ignore
    }
  };

  const fetchDailyUsage = async (force = false) => {
    if (!token) return;
    if (dailyUsageLoading && !force) return;
    try {
      setDailyUsageLoading(true);
      const resp = await fetch(`${API_BASE}/api/credits/daily-usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.status === 401) {
        onUnauthorized();
        return;
      }
      const json = await resp.json().catch(() => null);
      const next = (json?.data || json) as DailyUsageMap | null;

      if (next && typeof next === "object") {
        setDailyUsage(prev => ({ ...prev, ...next }));
        setDailyUsageInitialized(true);
        localStorage.setItem(
          DAILY_USAGE_CACHE_KEY,
          JSON.stringify({ data: next, timestamp: new Date().toISOString() }),
        );
      } else {
        setDailyUsageInitialized(true);
      }
    } catch {
      setDailyUsageInitialized(true);
    } finally {
      setDailyUsageLoading(false);
    }
  };

  const updateActionUsage = (actionType: keyof DailyUsageMap) => {
    setDailyUsage(prev => {
      const cur = prev?.[actionType];
      if (!cur) return prev;
      const updated: DailyUsageMap = {
        ...prev,
        [actionType]: {
          ...cur,
          current: (cur.current || 0) + 1,
          remaining: Math.max(0, (cur.remaining || 0) - 1),
        },
      };
      localStorage.setItem(
        DAILY_USAGE_CACHE_KEY,
        JSON.stringify({ data: updated, timestamp: new Date().toISOString() }),
      );
      return updated;
    });

    // background reconcile
    setTimeout(() => {
      fetchDailyUsage(true);
    }, 800);
  };

  const navigate = (tab: string) => {
    const protectedTabs = ["scripts", "hypersell", "superip", "history"];
    if (!isLoggedIn && protectedTabs.includes(tab)) {
      setActiveTab("login");
      return;
    }
    setActiveTab(tab);
  };

  const handleGoogleLogin = () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert('Google登录需要配置Client ID');
      return;
    }
    if (!(window as any).google) {
      alert('Google服务加载中...');
      return;
    }
    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          const resp = await fetch(`${API_BASE}/api/auth/login-google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: response.credential })
          });
          const data = await resp.json();
          if (!resp.ok) {
            alert(data?.detail || "Google登录失败");
            return;
          }
          const t = data?.access_token;
          if (t) {
            localStorage.setItem("access_token", t);
            setToken(t);
            setActiveTab("workspace");
          } else {
            alert("未收到访问令牌");
          }
        } catch (error) {
          console.error(error);
          alert("Google登录失败");
        }
      },
    });
    (window as any).google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        try {
          const tempDiv = document.createElement('div');
          document.body.appendChild(tempDiv);
          (window as any).google.accounts.id.renderButton(tempDiv, { theme: 'outline', size: 'large' });
          setTimeout(() => {
            const button = tempDiv.querySelector('div[role="button"]');
            if (button) (button as HTMLElement).click();
            document.body.removeChild(tempDiv);
          }, 100);
        } catch (e) {
          alert('Google登录不可用');
        }
      }
    });
  };

  const handleSendEmailCode = async (email: string) => {
    if (!email) {
      alert("请输入邮箱");
      return;
    }
    if (countdown > 0) return;
    try {
      const resp = await fetch(`${API_BASE}/api/auth/send-email-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data?.detail || "发送失败");
        return;
      }
      alert("验证码已发送，请查收邮箱");
      setCountdown(60);
    } catch (error) {
      console.error(error);
      alert("发送失败");
    }
  };

  const handleSendForgotCode = async (email: string) => {
    if (!email) {
      alert("请输入邮箱");
      return;
    }
    if (countdown > 0) return;
    try {
      const resp = await fetch(`${API_BASE}/api/auth/forgot-password/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data?.detail || "发送失败");
        return;
      }
      alert("验证码已发送，请查收邮箱");
      setCountdown(60);
      setForgotStep(2);
    } catch (error) {
      console.error(error);
      alert("发送失败");
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Fetch current user when logged in
    if (token) {
      fetchUser();
      loadDailyUsageFromCache();
      fetchDailyUsage(true);
    } else {
      setUser(null);
      setDailyUsage(DEFAULT_DAILY_USAGE);
      setDailyUsageInitialized(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const tier = String(user?.tier || "").toLowerCase();
    // Mirror desktop behavior: refresh every 5 min on Free tier
    if (tier !== "free") return;
    const t = setInterval(() => {
      fetchDailyUsage(false);
    }, 5 * 60 * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.tier]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
    <div className="app-fullscreen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex justify-center">
      {/* Mobile Container Simulator (if on desktop) */}
      <div className="w-full max-w-[480px] min-h-screen bg-slate-950 relative shadow-2xl flex flex-col">
        {/* Top Bar / Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-end gap-2">
            <img 
              src="/favicon.png" 
              alt="VGOT Logo" 
              className="w-8 h-8 object-contain" 
            />
            <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter leading-none -mb-3">
              VGOT.AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("profile")}
              aria-label="个人中心"
              className={cn(
                "p-2 rounded-full transition-all border",
                activeTab === "profile"
                  ? "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.3)]"
                  : "bg-slate-900 text-slate-400 hover:text-white border-slate-800",
              )}
            >
              <User size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-5 relative">
          {activeTab === "workspace" && (
            <WorkspaceView onNavigate={navigate as any} />
          )}
          {activeTab === "scripts" && (
            <ScriptsView
              user={user}
              isLoggedIn={isLoggedIn}
              dailyUsage={dailyUsage}
              dailyUsageInitialized={dailyUsageInitialized}
              dailyUsageLoading={dailyUsageLoading}
              refreshDailyUsage={(force?: boolean) => fetchDailyUsage(!!force)}
              updateActionUsage={updateActionUsage}
              onUnauthorized={onUnauthorized}
              onNavigate={navigate}
            />
          )}
          {activeTab === "hypersell" && (
            <HyperSellView
              user={user}
              isLoggedIn={isLoggedIn}
              onUnauthorized={onUnauthorized}
              onNavigate={navigate}
              onRefreshUser={fetchUser}
            />
          )}
          <div style={{ display: activeTab === "superip" ? 'block' : 'none' }} className="h-full">
            <SuperIpView />
          </div>
          {activeTab === "history" && <HistoryView />}
          {activeTab === "login" && (
            <div className="space-y-6 pb-24">
              {authMode === "login" && (
                <>
                  <header className="mb-6">
                    <h1 className="text-2xl font-black text-white tracking-tight">
                      登录账号
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">登录后方可使用生成、分析、历史等功能</p>
                  </header>

                  {/* Google Login Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full bg-white hover:bg-gray-100 text-black py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md font-medium text-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>使用 Google 继续</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-3 items-center mb-4">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-widest">或使用邮箱</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                  </div>

                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget as HTMLFormElement;
                      const uname = (form.querySelector<HTMLInputElement>("#uname")?.value || "").trim();
                      const pwd = (form.querySelector<HTMLInputElement>("#pwd")?.value || "").trim();
                      if (!uname || !pwd) return alert("请输入用户名和密码");
                      try {
                        const resp = await fetch(`${API_BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: uname, password: pwd }) });
                        const data = await resp.json();
                        if (!resp.ok) return alert(data?.detail || "登录失败");
                        const t = data?.access_token;
                        if (t) {
                          localStorage.setItem("access_token", t);
                          setToken(t);
                          setActiveTab("workspace");
                        } else {
                          alert("未收到访问令牌");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("网络错误，稍后再试");
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">用户名</label>
                      <input id="uname" type="text" className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">密码</label>
                        <button type="button" onClick={() => { setAuthMode("forgot"); setForgotStep(1); }} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">忘记密码？</button>
                      </div>
                      <input id="pwd" type="password" className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                    </div>
                    <NeonButton variant="primary">登录</NeonButton>
                  </form>
                  <div className="text-center mt-6">
                    <p className="text-slate-400 text-sm">
                      没有账号？ <button onClick={() => setAuthMode("register")} className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">立即注册</button>
                    </p>
                  </div>
                </>
              )}

              {authMode === "register" && (
                <>
                  <header className="mb-6">
                    <h1 className="text-2xl font-black text-white tracking-tight">
                      注册账号
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">创建一个新账号以开始使用</p>
                  </header>
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget as HTMLFormElement;
                      const uname = (form.querySelector<HTMLInputElement>("#reg-uname")?.value || "").trim();
                      const email = (form.querySelector<HTMLInputElement>("#reg-email")?.value || "").trim();
                      const pwd = (form.querySelector<HTMLInputElement>("#reg-pwd")?.value || "").trim();
                      const code = (form.querySelector<HTMLInputElement>("#reg-code")?.value || "").trim();
                      const invite = (form.querySelector<HTMLInputElement>("#reg-invite")?.value || "").trim();

                      if (!uname || !pwd || !email || !code) return alert("请填写所有必填字段");
                      if (!agreedToTerms) return alert("请先同意服务条款和隐私政策");

                      try {
                        const resp = await fetch(`${API_BASE}/api/auth/register`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            username: uname,
                            password: pwd,
                            email: email,
                            verification_code: code,
                            invite_code: invite || undefined
                          })
                        });
                        const data = await resp.json();
                        if (!resp.ok) return alert(data?.detail || "注册失败");

                        // Auto login after registration
                        const loginResp = await fetch(`${API_BASE}/api/auth/login`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ username: uname, password: pwd })
                        });
                        const loginData = await loginResp.json();
                        if (loginResp.ok && loginData.access_token) {
                          localStorage.setItem("access_token", loginData.access_token);
                          setToken(loginData.access_token);
                          setActiveTab("workspace");
                          setAuthMode("login");
                        } else {
                          alert("注册成功，请登录");
                          setAuthMode("login");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("网络错误，稍后再试");
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">用户名</label>
                      <input id="reg-uname" type="text" required className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">邮箱</label>
                      <div className="flex gap-2">
                        <input id="reg-email" type="email" required className="flex-1 bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                        <button
                          type="button"
                          disabled={countdown > 0}
                          onClick={() => {
                            const email = (document.getElementById("reg-email") as HTMLInputElement)?.value;
                            handleSendEmailCode(email);
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                        >
                          {countdown > 0 ? `${countdown}s` : "发送验证码"}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">验证码</label>
                      <input id="reg-code" type="text" required className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">密码</label>
                      <input id="reg-pwd" type="password" required className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">邀请码 (可选)</label>
                      <input id="reg-invite" type="text" className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                    </div>

                    <div className="flex items-center gap-2 py-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <label htmlFor="terms" className="text-xs text-slate-400">
                        我已阅读并同意 <button type="button" className="text-cyan-400 hover:underline">服务条款</button> 和 <button type="button" className="text-cyan-400 hover:underline">隐私政策</button>
                      </label>
                    </div>

                    <NeonButton variant="primary">注册</NeonButton>
                  </form>
                  <div className="text-center mt-6">
                    <p className="text-slate-400 text-sm">
                      已有账号？ <button onClick={() => setAuthMode("login")} className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">返回登录</button>
                    </p>
                  </div>
                </>
              )}

              {authMode === "forgot" && (
                <>
                  <header className="mb-6">
                    <h1 className="text-2xl font-black text-white tracking-tight">
                      重置密码
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                      {forgotStep === 1 ? "输入您的注册邮箱以接收验证码" : "输入验证码和新密码"}
                    </p>
                  </header>
                  {forgotStep === 1 ? (
                    <form
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const email = (document.getElementById("forgot-email") as HTMLInputElement)?.value;
                        handleSendForgotCode(email);
                      }}
                    >
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">注册邮箱</label>
                        <div className="flex gap-2">
                          <input id="forgot-email" type="email" required className="flex-1 bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                          <button
                            type="button"
                            disabled={countdown > 0}
                            onClick={() => {
                              const email = (document.getElementById("forgot-email") as HTMLInputElement)?.value;
                              handleSendForgotCode(email);
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                          >
                            {countdown > 0 ? `${countdown}s` : "发送验证码"}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const email = (document.getElementById("forgot-email") as HTMLInputElement)?.value;
                        const code = (document.getElementById("forgot-code") as HTMLInputElement)?.value;
                        const pwd = (document.getElementById("forgot-pwd") as HTMLInputElement)?.value;

                        if (!code || !pwd) return alert("请填写所有字段");

                        try {
                          const resp = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, code, new_password: pwd })
                          });
                          const data = await resp.json();
                          if (!resp.ok) return alert(data?.detail || "重置失败");
                          alert("密码重置成功，请登录");
                          setAuthMode("login");
                        } catch (err) {
                          console.error(err);
                          alert("网络错误，稍后再试");
                        }
                      }}
                    >
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">邮箱</label>
                        <input id="forgot-email-readonly" type="email" readOnly value={(document.getElementById("forgot-email") as HTMLInputElement)?.value} className="w-full bg-slate-900/50 border-b-2 border-slate-800 text-slate-500 px-4 py-3 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">验证码</label>
                        <input id="forgot-code" type="text" required className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-semibold ml-1">新密码</label>
                        <input id="forgot-pwd" type="password" required className="w-full bg-slate-950/50 border-b-2 border-slate-700 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-cyan-400 placeholder:text-slate-600" />
                      </div>
                      <NeonButton variant="primary">重置密码</NeonButton>
                    </form>
                  )}
                  <div className="text-center mt-6">
                    <button onClick={() => setAuthMode("login")} className="text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-colors">返回登录</button>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === "profile" && (
            <ProfileView
              onNavigate={setActiveTab}
              isLoggedIn={isLoggedIn}
              onLogout={onUnauthorized}
              user={user}
            />
          )}
          {activeTab === "partner_program" && (
            <PartnerProgramView
              onBack={() => setActiveTab("profile")}
            />
          )}
          {activeTab === "credits_usage" && (
            <CreditsUsageView
              onBack={() => setActiveTab("profile")}
            />
          )}
          {activeTab === "billing" && (
            <BillingPlansView
              onBack={() => setActiveTab("profile")}
              apiBase={API_BASE}
              token={token}
              onRefreshUser={fetchUser}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChange={navigate as any}
        />
      </div>
    </div>
    </LanguageContext.Provider>
  );
}