'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
  /** 毫秒；传 0 表示不自动关闭（需要用户确认的错误提示用） */
  duration?: number
}

interface ToastItem extends Required<Omit<ToastInput, 'description'>> {
  id: string
  description?: string
}

interface ToastContextValue {
  toast: (input: ToastInput) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => '',
  dismiss: () => {},
})

/** 在任意客户端组件里取用：const { toast } = useToast() */
export function useToast() {
  return useContext(ToastContext)
}

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

/** 同时可见的吐司上限：超过就顶掉最旧的，避免堆满屏幕 */
const MAX_VISIBLE = 3

/**
 * 全站唯一的操作反馈出口。
 *
 * 改造前站内 0 处提示机制：复制链接、切换筛选、保存进度等操作全部静默，
 * 用户无法确认"到底成没成"。
 *
 * 可访问性要点：
 *  - viewport 是 aria-live="polite" 区域，新增吐司会被屏幕阅读器播报；
 *  - 错误类用 role="alert"（assertive）以打断当前朗读；
 *  - 播报内容与视觉内容一致，不依赖颜色单独传达状态（图标 + 文案双编码）；
 *  - 自动关闭时长 ≥ 5s，满足 WCAG 2.2.1（且提供手动关闭按钮）。
 */
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    setItems(list => list.filter(item => item.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'info', duration = 5000 }: ToastInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setItems(list => [...list, { id, title, description, variant, duration }].slice(-MAX_VISIBLE))
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        )
      }
      return id
    },
    [dismiss]
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-viewport" aria-live="polite" aria-relevant="additions">
        <AnimatePresence initial={false}>
          {items.map(item => {
            const Icon = ICONS[item.variant]
            return (
              <motion.div
                key={item.id}
                className={`ui-toast ui-toast--${item.variant}`}
                role={item.variant === 'error' ? 'alert' : 'status'}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icon size={17} className="ui-toast__icon" aria-hidden="true" />
                <div className="ui-toast__content">
                  <p className="ui-toast__title">{item.title}</p>
                  {item.description && <p className="ui-toast__desc">{item.description}</p>}
                </div>
                <button
                  type="button"
                  className="ui-toast__close"
                  onClick={() => dismiss(item.id)}
                  aria-label="关闭提示"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
