import { uploadSuperIpAudio } from "./lib/superIpAudioUpload";
import React, { useState, useEffect, useRef } from "react";
import { api } from "./lib/api";
import {
  Check,
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  // Local-only state for showing user display name and credits
  const [wsName, setWsName] = useState<string | null>(null);
  const [wsCredits, setWsCredits] = useState<number | null>(null);

  useEffect(() => {
    // Read token from localStorage (set after successful login)
    const token = localStorage.getItem("access_token");
    if (!token) {
      setWsName(null);
      setWsCredits(null);
      return;
    }
    const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
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
  }, []);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          Workspace
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {wsName ? (
            <>Welcome back, {wsName}.</>
          ) : (
            <>欢迎来到VGOT，登录后即可开启你的创作之旅。</>
          )}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center justify-center py-6 border-cyan-500/20 bg-slate-800/40">
          <div className="text-cyan-400 mb-2">
            <Video size={28} />
          </div>
          <span className="text-2xl font-bold text-white">
            12
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            Projects
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
            Credits
          </span>
        </GlassCard>
      </div>

      <h2 className="text-sm font-bold text-cyan-400/80 uppercase tracking-wider mt-8 mb-4">
        Quick Actions
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
                分析视频
              </div>
              <div className="text-slate-500 text-xs">
                快速获取视频的脚本灵感，聊天探索更多创意
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
                生成视频
              </div>
              <div className="text-slate-500 text-xs">
                生成视频，创造令人惊艳的作品
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
                Super IP
              </div>
              <div className="text-slate-500 text-xs">
                创建您的专属数字角色
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
  error?: string;
  createdAt: number;
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
        <p className="text-xs text-slate-300 line-clamp-2 font-medium">
          {task.prompt || "No prompt provided"}
        </p>
      </div>
    </div>
  );
};

const HyperSellView = ({ onRefreshUser }: { onRefreshUser?: () => void }) => {
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

  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [duration, setDuration] = useState("10");
  const [quality, setQuality] = useState("small");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef(new Map<string, { intervalId: any; startAt: number }>());

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

  const canStartTask = (type: "text" | "image" | "enhance") => {
    const activeCount = tasks.filter(t => t.type === type && t.status === "running").length;
    return activeCount < PAGE_LIMITS[type];
  };

  useEffect(() => {
    localStorage.setItem("vgot:hypersell:tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Rehydrate polling for running tasks
  useEffect(() => {
    tasks.forEach(t => {
      if (t.status === "running" && t.apiTaskId) {
        startPolling(t.apiTaskId, t.type, t.id, {
          prompt: t.prompt,
          params: t.params,
          aspectRatio: t.aspectRatio || "9:16",
          duration: t.duration || "10"
        });
      }
    });

    return () => {
      // Cleanup all intervals on unmount
      timersRef.current.forEach(timer => clearInterval(timer.intervalId));
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

    setPolling(true);
    const pollUrl = type === "enhance" ? `/api/enhance/outputs/${apiId}` : (type === "text" ? `/api/sora/poll/${apiId}` : `/api/sora/watermark-free/${apiId}`);
    const startAt = Date.now();
    const MAX_POLL_MS = 2 * 60 * 60 * 1000; // 2 hours

    const poll = async () => {
      try {
        const res = await api.get(pollUrl);
        const data = res;
        const status = (data.status || data.state || data.data?.status || data.data?.state || "").toLowerCase();
        const supabaseUrl = data.stored_url || data.supabase_url || data.data?.stored_url || data.data?.supabase_url;
        const externalUrl = data.result_url || data.url || data.output || data.data?.url || data.data?.output || (data.results && data.results[0]?.url) || (data.data?.results && data.data?.results[0]?.url);
        const finalUrl = supabaseUrl || externalUrl;

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
            try {
              api.post("/api/history/save", {
                content_type: "video",
                content_subtype: type === "text" ? "text_to_video" : "image_to_video",
                source_page: type === "text" ? "VideoGeneration" : "HyperSell",
                file_data: finalUrl,
                prompt: metadata.prompt || "",
                generation_params: metadata.params || {},
                api_endpoint: type === "text" ? "/api/sora/text-to-video" : "/api/sora/watermark-free",
                api_response_data: data,
                duration: Number(metadata.duration) || null,
                dimensions: metadata.aspectRatio || null,
              }).then(saved => {
                if (saved?.file_url) {
                  setTasks(prev => prev.map(t => t.id === localId ? {
                    ...t,
                    supabaseUrl: saved.file_url,
                    resultUrl: saved.file_url
                  } : t));
                }
              }).catch(e => console.warn("Failed to save to history", e));
            } catch (e) {
              console.warn("Failed to save to history", e);
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
      if (timersRef.current.size === 0) {
        setPolling(false);
        setLoading(false);
      }
    };

    const intervalId = setInterval(poll, 5000);
    timersRef.current.set(localId, { intervalId, startAt });
    poll(); // Initial kick
  };

  const handleGenerate = async () => {
    if (activeTab === "text" && !prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }
    if ((activeTab === "image" || activeTab === "enhance") && !uploadedFile) {
      alert("Please upload a file");
      return;
    }

    if (!canStartTask(activeTab)) {
      alert(`最多同时运行 ${PAGE_LIMITS[activeTab]} 个任务`);
      return;
    }

    setLoading(true);
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

    const newTask: Task = {
      id: localId,
      type: activeTab,
      prompt: prompt,
      status: "running",
      progress: 0,
      createdAt: Date.now(),
      aspectRatio,
      duration,
      params,
    };
    setTasks(prev => [newTask, ...prev]);

    try {
      let res;
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
          alert("Video duration must be 15 seconds or less");
          setLoading(false);
          setTasks(prev => prev.filter(t => t.id !== localId));
          return;
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
      if (apiId) {
        setTasks(prev => prev.map(t => t.id === localId ? { ...t, apiTaskId: apiId } : t));
        startPolling(apiId, activeTab, localId, {
          prompt,
          params,
          aspectRatio,
          duration
        });
      } else {
        throw new Error("Failed to get task ID");
      }
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred";
      setError(errorMsg);
      setTasks(prev => prev.map(t => t.id === localId ? { ...t, status: "failed", error: errorMsg } : t));
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-xl font-black text-white tracking-tight uppercase">
          Hyper Sell
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Generate high-converting videos in seconds.
        </p>
      </header>

      {/* Top Tabs */}
      <div className="flex p-1 bg-slate-900/80 rounded-lg mb-6 sticky top-0 z-20 backdrop-blur-xl border border-white/5">
        {[
          { id: "text", label: "Text to Video" },
          { id: "image", label: "Img to Video" },
          { id: "enhance", label: "Enhance" },
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
              ? "Prompt Input"
              : "Source Material"}
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
                    Prompt Input
                  </label>
                  <textarea
                    className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-white resize-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none transition-all placeholder:text-slate-600"
                    placeholder="Describe the video you want to generate in detail..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              )}
            </>
          ) : (
            <textarea
              className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-white resize-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none transition-all placeholder:text-slate-600"
              placeholder="Describe the video you want to generate in detail..."
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
                  Aspect Ratio
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
                  Duration
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
        <NeonButton
          onClick={handleGenerate}
          disabled={loading || polling}
        >
          {loading || polling ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {polling ? "Generating..." : "Uploading..."}
            </div>
          ) : (
            <>
              <Zap size={18} fill="currentColor" />
              Generate Video
            </>
          )}
        </NeonButton>
      </div>

      {/* Recent Result */}
      <div className="flex items-center justify-between mb-4">
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
                <span className="text-slate-400 text-base font-black uppercase tracking-[0.3em]">Waiting</span>
                <span className="text-slate-600 text-xs uppercase tracking-widest font-medium">Your masterpiece will appear here</span>
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
  const [step, setStep] = useState(1);
  const [isAudioSelected, setIsAudioSelected] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const audioUploadInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingSuperIpAudio, setIsUploadingSuperIpAudio] = useState(false);
  const [localUploadedAudioName, setLocalUploadedAudioName] = useState<string | null>(null);

  // 图库相关状态
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // 音频历史记录相关状态
  const [showAudioGallery, setShowAudioGallery] = useState(false);
  const [audioHistory, setAudioHistory] = useState<any[]>([]);
  const [loadingAudioHistory, setLoadingAudioHistory] = useState(false);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
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
  const [generatedImage, setGeneratedImage] = useState<
    string | null
  >(null);
  const [voiceText, setVoiceText] = useState("");
  const [generatedAudio, setGeneratedAudio] =
    useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
        } else {
          console.error('❌ 未找到图片URL，完整响应:', data);
          alert('生成失败：未返回图片URL');
        }
      } else {
        const errorData = await response.json();
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

  // 选择图库中的图片
  const handleSelectGalleryImage = (imageUrl: string) => {
    // 选中图库图片：只填充「上传角色」框（不影响结果区）
    setSelectedCharacterImage(imageUrl);
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
    // Keep the history modal open so the user can see the selected border highlight.
    // (They can close manually via the close button.)
    // setShowAudioGallery(false);
  };

  const handleClearSelectedAudio = () => {
    setSelectedAudioUrl(null);
    setSelectedAudio(null);
    setLocalUploadedAudioName(null);
    if (audioUploadInputRef.current) audioUploadInputRef.current.value = "";
  };

  // Clear only local-uploaded audio (keep history selection state intact)
  const handleClearLocalAudioUpload = () => {
    setSelectedAudioUrl(null);
    setLocalUploadedAudioName(null);
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
      const result = await uploadSuperIpAudio(file, api.post);
      if ("error" in result) {
        alert(result.error);
        return;
      }
      // Local upload: set the source URL but don't overwrite the Generated Audio card state.
      setSelectedAudioUrl(result.url);
      setLocalUploadedAudioName(file.name);
    } catch (err: any) {
      alert(err?.message || "上传失败");
    } finally {
      setIsUploadingSuperIpAudio(false);
    }
  };

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
          if (!selectedImage || allowOpenWhenSelected) {
            handleOpenGallery();
          }
        }}
        className={cn(
          "w-16 h-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed rounded-lg bg-slate-950/30 transition-all cursor-pointer group relative overflow-hidden",
          selectedImage
            ? "border-slate-700"
            : "border-slate-700 hover:border-cyan-500/50",
        )}
        aria-label={selectedImage ? "Selected character" : "Upload character"}
      >
        {selectedImage ? (
          <>
            <img
              src={selectedImage}
              alt="Selected character"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedCharacterImage(null);
              }}
              aria-label="Clear selected character"
              className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 z-30 px-1 text-white text-sm leading-none hover:text-slate-200 transition"
              style={{ textShadow: "0 0 6px rgba(0,0,0,0.75)" }}
            >
              ×
            </button>
          </>
        ) : (
          <>
            <ImageIcon
              size={18}
              className="text-slate-600 group-hover:text-cyan-400 transition-colors"
            />
            <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
              上传角色
            </span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-xl font-black text-white tracking-tight uppercase">
          Create Super IP
        </h1>
      </header>

      {/* Progress Circuit */}
      <div className="mb-8 relative">
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
            return (
              <div
                key={s.num}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 bg-slate-950",
                    isActive
                      ? "border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "border-slate-700 text-slate-600",
                    isCurrent &&
                    "scale-110 ring-2 ring-cyan-500/30",
                  )}
                >
                  {isActive ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={cn(
                    "text-[8px] uppercase font-bold tracking-wider",
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

      {/* Progress Circuit removed */}

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
                        (isUploadingSuperIpAudio ? "上传中..." : "上传音频")
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0" />

                <div className="w-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/30 hover:border-cyan-500/50 transition-all cursor-pointer group h-16">
                  <Film
                    size={18}
                    className="text-slate-600 group-hover:text-cyan-400 transition-colors"
                  />
                  <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
                    视频生成
                  </span>
                </div>

                <button
                  className="text-cyan-400 hover:text-cyan-300 transition-all p-1"
                  type="button"
                  aria-label="Send"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>

            {/* Open Gallery Button */}
            <button 
              onClick={handleOpenGallery}
              className="w-full py-2 border border-slate-700 rounded-lg bg-slate-950/30 text-slate-400 text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer hover:text-cyan-400 hover:border-cyan-500/50 group"
            >
              <ImageIcon size={14} className="group-hover:text-cyan-400 transition-colors" />
              <span className="font-medium group-hover:text-cyan-400 transition-colors">打开图库</span>
            </button>

            {/* Workbench Input */}
            {/* Workbench Input */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                  Enter Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-all"
                  placeholder="Describe the character you want..."
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
                  Clear
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
                      <Zap size={14} /> Generate
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
                    Result
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
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl min-h-[240px] flex items-center justify-center p-6 text-center">
                <p className="text-[10px] text-slate-500 font-medium">
                  Generated image will appear here
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
                        (isUploadingSuperIpAudio ? "上传中..." : "上传音频")
                      )}
                    </span>
                  </div>
                </div>

                {/* keep remaining items aligned without forcing huge empty space on small screens */}
                <div className="flex-1 min-w-0" />

                {/* Upload Box 3 - Video */}
                <div className="w-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/30 hover:border-cyan-500/50 transition-all cursor-pointer group h-16">
                  <Film size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
                    视频生成
                  </span>
                </div>

                {/* Send Icon Button */}
                <button className="text-cyan-400 hover:text-cyan-300 transition-all p-1">
                  <Send size={24} />
                </button>
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
                  Generated Audio
                </div>
                <div className="text-[8px] font-bold text-white truncate">
                  {selectedAudio
                    ? (selectedAudio.name || "Audio selected")
                    : "No audio selected"}
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAudioGallery();
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg border ui-tiny font-bold uppercase flex items-center gap-1.5 transition-all",
                  selectedAudio
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                )}
              >
                {selectedAudio ? (
                  <>
                    <Check size={10} strokeWidth={3} /> Use
                  </>
                ) : (
                  "Select"
                )}
              </button>
            </div>

            {/* Audio List Display Box (Floating Overlay) */}
            {/* 旧的悬浮音频列表（图二）已弃用：现在统一使用 Audio History 全屏库 */}

            {/* Workbench */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
              {/* Voice Waveform - 显示区域，不是输入框 */}
              <div className="space-y-2">
                <label className="ui-tiny uppercase text-slate-400 font-bold">
                  Voice Waveform
                </label>
                <div className="flex gap-2">
                  {/* Waveform Display Area - Canvas 波形显示区域 */}
                  <div className="flex-1 bg-slate-950/50 border border-slate-700 rounded-lg flex items-center justify-center h-9 overflow-hidden">
                    {/* 波形动画显示区域（暂时为空，可以后续添加canvas动画） */}
                    <div className="flex items-center gap-0.5 h-full px-2">
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-slate-700 rounded-full transition-all"
                          style={{
                            height: `${Math.random() * 60 + 20}%`,
                            opacity: 0.3
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 hover:bg-slate-700 hover:border-cyan-500/50 transition-colors">
                    <Play size={14} />
                  </button>
                  <button className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                  <button className="px-3 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center ui-tiny font-bold text-cyan-400 hover:bg-slate-700 hover:border-cyan-500/50 transition-colors">
                    Match
                  </button>
                </div>
              </div>

              {/* Select Voice */}
              <div className="space-y-2">
                <label className="ui-tiny uppercase text-slate-400 font-bold">
                  Select Voice
                </label>
                <button
                  onClick={handleOpenAudioGallery}
                  className="w-full py-3 bg-slate-950/50 border border-slate-700 rounded-lg flex items-center justify-center gap-2 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors group"
                >
                  <Volume2
                    size={16}
                    className="text-slate-500 group-hover:text-cyan-400 transition-colors"
                  />
                  <span className="ui-tiny font-bold">
                    Select Voice Model
                  </span>
                </button>
              </div>

              {/* Voice Cloning */}
              <div className="space-y-2">
                <label className="ui-tiny uppercase text-slate-400 font-bold">
                  Voice Cloning
                </label>
                <div className="h-24 border border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-950/50 hover:border-cyan-500/50 transition-colors cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Upload
                    className="text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors"
                    size={16}
                  />
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">
                    Select File (mp3/wav/m4a)
                  </span>
                  <span className="text-[8px] text-slate-600 mt-1">
                    10s~300s, ≤20MB
                  </span>
                </div>
              </div>

              {/* Input Text */}
              <div className="space-y-2">
                <label className="ui-tiny uppercase text-slate-400 font-bold">
                  Input Text
                </label>
                <div className="relative group">
                  <textarea
                    value={voiceText}
                    onChange={(e) =>
                      setVoiceText(e.target.value)
                    }
                    className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-all"
                    placeholder="Enter text to convert to speech..."
                    maxLength={3500}
                  />
                  <span className="absolute bottom-2 right-2 text-[8px] text-slate-600">
                    {voiceText.length}/3500
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setVoiceText("")}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-[10px] font-bold hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
                <NeonButton
                  className="flex-1 py-2 text-[10px]"
                  variant="primary"
                  onClick={() => setGeneratedAudio(true)}
                >
                  <Zap size={14} /> Generate
                </NeonButton>
              </div>
            </div>

            {/* Result */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl min-h-[200px] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
              {generatedAudio ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Play
                      size={24}
                      className="text-cyan-400 ml-1"
                      fill="currentColor"
                    />
                  </div>
                  <div className="w-full h-8 flex gap-1 items-center justify-center">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-cyan-500/50 rounded-full animate-pulse"
                        style={{
                          height: Math.random() * 24 + 8,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                    Audio Generated
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    Result
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Generated audio will appear here
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
                  <div className="w-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/30 hover:border-cyan-500/50 transition-all cursor-pointer group h-16">
                    <Volume2 size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
                      上传音频
                    </span>
                  </div>
                </div>

                {/* keep remaining items aligned without forcing huge empty space on small screens */}
                <div className="flex-1 min-w-0" />

                {/* Upload Box 3 - Video */}
                <div className="w-16 flex flex-col items-center justify-center gap-1.5 p-2 border-2 border-dashed border-slate-700 rounded-lg bg-slate-950/30 hover:border-cyan-500/50 transition-all cursor-pointer group h-16">
                  <Film size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-[9px] text-slate-500 group-hover:text-cyan-400 transition-colors font-medium text-center leading-tight whitespace-nowrap">
                    视频生成
                  </span>
                </div>

                {/* Send Icon Button */}
                <button className="text-cyan-400 hover:text-cyan-300 transition-all p-1">
                  <Send size={24} />
                </button>
              </div>
            </div>

            {/* 1. Input Section */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                  Enter Prompt
                </label>
                <textarea
                  className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-all"
                  placeholder="Describe the character you want..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-[10px] font-bold hover:bg-slate-800 transition-colors">
                  Clear
                </button>
                <NeonButton
                  className="flex-1 py-2 text-[10px]"
                  variant="primary"
                >
                  <Zap size={14} /> Generate
                </NeonButton>
              </div>
            </div>

            {/* 2. Result Section */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col h-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">
                  Result
                </span>
              </div>
              <div className="flex-1 rounded-lg bg-black/50 overflow-hidden relative group border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1686543971025-15aa01b5f7c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG9mJTIwYXNpYW4lMjBtYW4lMjBjeWJlciUyMGZ1dHVyaXN0fGVufDF8fHx8MTc2NTk2MTM5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Generated Character"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[8px] text-white/80 line-clamp-1">
                    A man looking at camera...
                  </p>
                </div>
              </div>
            </div>

            {/* 3. History (Mini) */}
            <div className="pb-4">
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mb-2 block">
                History
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-24 h-16 rounded-lg bg-slate-800 shrink-0 border border-slate-700 overflow-hidden relative group"
                  >
                    <img
                      src={`https://images.unsplash.com/photo-${i === 1 ? "1506794778202-cad84cf45f1d" : i === 2 ? "1500648767791-00dcc994a43e" : "1534528741775-53994a69daeb"}?w=200&h=200&fit=crop`}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
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
            className="flex-1"
          >
            Back
          </NeonButton>
        )}
        <NeonButton
          variant="purple"
          onClick={() =>
            step < 3 ? setStep((s) => s + 1) : setStep(1)
          }
          className="flex-[2]"
        >
          {step === 3 ? "Start New" : "Next Step"}
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
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full bg-slate-800/30 flex items-center justify-center mb-3">
                      <ImageIcon size={28} className="text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium mb-1">暂无历史图片</p>
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
              
              {/* Bottom Close Button - 明显的退出按钮 */}
              <div className="flex-shrink-0 p-3 bg-slate-950/80 border-t border-slate-800/50">
                <button
                  onClick={() => setShowGallery(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  关闭图库
                </button>
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
                        const isSelected = !!selectedAudioUrl && selectedAudioUrl === audio.file_url;

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
                            onClick={() => handleSelectAudio(audio.file_url)}
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
              
              {/* Bottom Close Button */}
              <div className="flex-shrink-0 p-3 bg-slate-950/80 border-t border-slate-800/50">
                <button
                  onClick={() => setShowAudioGallery(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  关闭音频库
                </button>
              </div>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

// 4. History Page
const HistoryView = () => {
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
    { label: "All", value: "all" },
    { label: "Video", value: "video" },
    { label: "Image", value: "image" },
    { label: "Audio", value: "audio" },
  ];

  const [activeFilter, setActiveFilter] = useState<
    "all" | HistoryContentType
  >("all");
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async (filter: "all" | HistoryContentType) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

      const params = new URLSearchParams({ limit: "100" });
      if (filter !== "all") params.append("content_type", filter);

      const resp = await fetch(`${API_BASE}/api/history/list?${params.toString()}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        },
      );

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        console.warn("❌ 加载历史失败:", resp.status, errText);
        setHistoryRecords([]);
        return;
      }

      const data = await resp.json();
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
          History
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
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
              isActive
                ? "bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400 shadow-[0_0_10px_rgba(192,38,211,0.2)]"
                : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400",
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
            Loading...
          </div>
        ) : historyRecords.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-[10px] font-medium">
            No history
          </div>
        ) : (
          historyRecords.map((record) => {
            const type = record.content_type;
            const dateText = formatHistoryDate(record.created_at);
            const badgeClass =
              record.source_page === "HyperSell"
                ? "border-purple-500/30 text-purple-400 bg-purple-500/10"
                : "border-cyan-500/30 text-cyan-400 bg-cyan-500/10";
            const badgeText = record.source_page === "HyperSell" ? "HyperSell" : "Super IP";

            return (
              <GlassCard
                key={String(record.id)}
                className="p-0 flex flex-col group border-slate-800 bg-slate-900/40"
              >
                <div className="flex p-4 gap-4 items-start">
                  <div className="w-24 h-24 bg-black rounded-lg shrink-0 overflow-hidden relative">
                    {type === "image" && record.file_url ? (
                      <img
                        src={record.file_url}
                        alt={record.prompt || "History image"}
                        className="w-full h-full object-cover opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        {type === "video" ? (
                          <Video size={20} className="text-slate-700" />
                        ) : type === "audio" ? (
                          <Volume2 size={20} className="text-slate-700" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-700" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                          badgeClass,
                        )}
                      >
                        {badgeText}
                      </span>
                      {dateText && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {dateText}
                        </span>
                      )}
                    </div>

                    {record.prompt ? (
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {record.prompt}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-600">No prompt</p>
                    )}

                    {type === "audio" && record.file_url && (
                      <div className="mt-2">
                        <audio
                          controls
                          src={record.file_url}
                          controlsList="nodownload noplaybackrate"
                          className="w-full"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 p-3 flex justify-between items-center bg-white/[0.02]">
                  {/* id is still real data, but keep it subtle */}
                  <span className="text-[10px] text-slate-600 font-mono">
                    {record.id ? `ID: ${record.id}` : ""}
                  </span>
                  <button
                    type="button"
                    disabled={!record.file_url}
                    onClick={() => record.file_url && downloadFromUrl(record.file_url, record)}
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      record.file_url
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
    </div>
  );
};

// 5. Scripts Page
const ScriptsView = () => {
  const [activeMode, setActiveMode] = useState<
    "extract" | "scene" | "rewrite"
  >("extract");

  const [videoUrl, setVideoUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [rewriteText, setRewriteText] = useState("");
  const [rewriteImageFile, setRewriteImageFile] = useState<File | null>(null);
  const [rewriteImageUrl, setRewriteImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rewriteFileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      if (rewriteImageUrl) URL.revokeObjectURL(rewriteImageUrl);
    };
  }, [localPreviewUrl, rewriteImageUrl]);

  const modes = [
    {
      id: "extract",
      label: "Extract Audio Copy",
      icon: FileText,
      desc: "Extract the audio transcript from the video",
    },
    {
      id: "scene",
      label: "Reverse Prompt",
      icon: Film,
      desc: "Analyze the video and infer prompts in one click",
    },
    {
      id: "rewrite",
      label: "Viral Copy",
      icon: PenTool,
      desc: "Generate viral copy from product info and images in one click",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setUploadedFile(file);
      setLocalPreviewUrl(URL.createObjectURL(file));
      setVideoUrl("");
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
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
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
          Video Insights
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Choose a goal to get actionable insights fast.
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
                  Original Script
                </label>
                <textarea
                  value={rewriteText}
                  onChange={(e) => setRewriteText(e.target.value)}
                  className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-[10px] text-white resize-none focus:border-fuchsia-500 outline-none placeholder:text-slate-600 transition-all"
                  placeholder="Enter the script content you want to rewrite..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Reference Visual (Optional)
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
                        Upload Image
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
                      Drag & drop or click to upload
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
                    Or paste link
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
                    placeholder="Paste video link (TikTok supported)"
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
              "bg-gradient-to-r from-fuchsia-600 to-pink-600 border-fuchsia-500/50 shadow-[0_0_20px_rgba(192,38,211,0.3)] w-full",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
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
                    ? "Rewrite Script"
                    : "Analyze Video"}
                </span>
              </>
            )}
          </NeonButton>
        </div>

        {/* Results Area */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              Results
            </h3>
            {result && (
              <button
                onClick={handleCopy}
                className="text-[10px] text-fuchsia-400 font-bold uppercase hover:text-fuchsia-300 flex items-center gap-1"
              >
                <Check size={12} />
                Copy
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
                  Results will appear here
                </span>
              </>
            )}

            {result && (
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 20 }}>
                <button
                  onClick={handleClearResult}
                  className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[9px] font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-all uppercase tracking-wider shadow-lg"
                >
                  Clear
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
}) => (
  <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-right duration-300">
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
      >
        <ChevronLeft size={24} className="text-slate-400" />
      </button>
      <h1 className="text-xl font-bold text-white">
        Partner Program
      </h1>
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
          Share VGOT with your community. Every paid
          subscription from your link earns you a{" "}
          <span className="text-cyan-400 font-bold">
            30% recurring commission
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4">
        <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
            <TrendingUp size={20} />
          </div>
          <h3 className="font-bold text-white">
            High Recurring Commission
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Not just the first sale. Earn 30% every month as
            long as your user keeps their subscription.
          </p>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
            <CreditCard size={20} />
          </div>
          <h3 className="font-bold text-white">
            Stripe Automated Payouts
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We handle Stripe Connect and send commissions
            directly to your bank account.
          </p>
        </div>
        <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
          <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center text-pink-400">
            <Download size={20} />
          </div>
          <h3 className="font-bold text-white">
            Exclusive Marketing Resources
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Get official demo videos, banners and copy templates
            to boost your promotion.
          </p>
        </div>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4 mt-8">
        <h3 className="font-bold text-white">
          Ready to start earning?
        </h3>
        <p className="text-xs text-slate-400">
          Tell us briefly about your audience. After you apply,
          our team reviews within 24 hours.
        </p>
        <div className="flex flex-col gap-3">
          <button className="w-full py-3 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors">
            Apply as Partner
          </button>
          <button className="w-full py-3 bg-transparent border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  </div>
);

// 8. Credits & Usage
const CreditsUsageView = ({
  onBack,
}: {
  onBack: () => void;
}) => (
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
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Current Available Credits
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black text-white">
              33,040
            </span>
            <span className="text-sm font-bold text-fuchsia-400">
              Credits
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div className="h-full w-[80%] bg-gradient-to-r from-fuchsia-600 to-pink-500" />
          </div>
          <div className="text-xs text-slate-500">
            Monthly quota used 80%
          </div>
        </div>
      </div>

      {/* Purchase Packs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-yellow-500" />
          <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wide">
            Purchase Extra Credit Packs
          </h3>
        </div>
        {[
          { amount: "10,000", price: "$10", tag: null },
          { amount: "55,000", price: "$50", tag: "Best Value" },
          { amount: "120,000", price: "$100", tag: null },
        ].map((pack) => (
          <button
            key={pack.amount}
            className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-yellow-500/30 transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:shadow-[0_0_10px_rgba(234,179,8,0.3)] transition-all">
                <Zap size={20} fill="currentColor" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg">
                  {pack.amount}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    Credits
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Instant delivery
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="bg-white text-slate-950 font-bold px-3 py-1 rounded-lg text-sm group-hover:bg-yellow-400 transition-colors">
                {pack.price}
              </span>
              {pack.tag && (
                <span className="text-[10px] font-bold text-fuchsia-400 bg-fuchsia-500/10 px-1.5 py-0.5 rounded uppercase">
                  {pack.tag}
                </span>
              )}
            </div>
          </button>
        ))}

        {/* Custom Amount */}
        <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded-xl flex items-center justify-between opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-600">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-slate-400 font-bold">
                Custom
              </div>
              <div className="text-[10px] text-slate-600">
                1 USD = 1,000 Credits
              </div>
            </div>
          </div>
          <span className="text-slate-600 font-bold">
            $0.00
          </span>
        </div>
      </div>

      {/* Usage Details */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <BarChart3 size={16} /> Usage Details
          </h3>
          <button className="text-xs text-cyan-400 hover:text-cyan-300">
            View All
          </button>
        </div>

        <div className="space-y-2">
          {[
            {
              action: "superip_video_gen",
              date: "09:57",
              change: -1470,
            },
            {
              action: "voice_gen_waveform",
              date: "09:54",
              change: -3000,
            },
            {
              action: "script_extraction",
              date: "09:24",
              change: 0,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-white/5 text-sm"
            >
              <div>
                <div className="text-slate-300 font-medium">
                  {item.action}
                </div>
                <div className="text-xs text-slate-600">
                  {item.date}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "font-mono font-bold",
                    item.change < 0
                      ? "text-red-400"
                      : "text-green-400",
                  )}
                >
                  {item.change > 0 ? "+" : ""}
                  {item.change}
                </div>
                <div className="text-[10px] bg-green-500/10 text-green-500 px-1.5 rounded inline-block mt-0.5">
                  Completed
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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
}) => (
  <div className="flex flex-col h-full pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <h1 className="text-xl font-black text-white tracking-tight mb-2">个人中心</h1>
          <p className="text-slate-400 text-sm">未登录，登录后可查看个人资料与设置</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => onNavigate("login")}
              className="px-4 py-2 rounded-md bg-cyan-600 text-white border border-cyan-400/50 hover:bg-cyan-500 text-sm"
            >
              去登录
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
            <div className="text-white font-bold">Credits</div>
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
            Top Up
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
          Settings
        </h3>
        {[
          {
            label: "Partner Program",
            icon: Users,
            id: "partner_program",
          },
          {
            label: "Billing & Plans",
            icon: CreditCard,
            id: "billing",
          },
          {
            label: "Credits & Usage",
            icon: BarChart3,
            id: "credits_usage",
          },
          {
            label: "Help & Support",
            icon: HelpCircle,
            id: "support",
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => item.id && onNavigate(item.id)}
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
            <ChevronRight
              size={16}
              className="text-slate-600 group-hover:text-slate-400"
            />
          </button>
        ))}
      </div>

      <div className="pt-4">
        {isLoggedIn && (
          <button
            onClick={onLogout}
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-bold text-sm"
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  </div>
);

// --- Main Layout & App ---

const BottomNav = ({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (t: string) => void;
}) => {
  const tabs = [
    { id: "workspace", icon: LayoutGrid, label: "Workspace" },
    { id: "scripts", icon: Bot, label: "Scripts" },
    { id: "hypersell", icon: Video, label: "HyperSell" },
    { id: "superip", icon: User, label: "Super IP" },
    { id: "history", icon: History, label: "History" },
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
  const [activeTab, setActiveTab] = useState("workspace");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const isLoggedIn = !!token;
  const [user, setUser] = useState<UserProfile | null>(null);
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
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <div className="app-fullscreen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex justify-center">
      {/* Mobile Container Simulator (if on desktop) */}
      <div className="w-full max-w-[480px] min-h-screen bg-slate-950 relative shadow-2xl flex flex-col">
        {/* Top Bar / Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center font-black text-white italic text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              V
            </div>
            <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter">
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
          {activeTab === "scripts" && <ScriptsView />}
          {activeTab === "hypersell" && <HyperSellView onRefreshUser={fetchUser} />}
          {activeTab === "superip" && <SuperIpView />}
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
              onLogout={() => {
                localStorage.removeItem("access_token");
                setToken(null);
                setActiveTab("workspace");
              }}
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
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChange={navigate as any}
        />
      </div>
    </div>
  );
}