/**
 * 轻量级日志工具：统一时间戳、级别与作用域前缀，附带结构化上下文。
 * 服务端（构建期/SSR）输出到终端日志，客户端组件输出到浏览器控制台。
 *
 * 日志级别控制（L-01 降噪）：
 * - 默认：生产构建/生产运行只输出 warn / error；开发环境输出 info。
 * - 可通过环境变量 NEXT_PUBLIC_LOG_LEVEL 或 LOG_LEVEL 覆盖：
 *   debug | info | warn | error | silent
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'
type LogContext = Record<string, unknown>

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

function resolveLogLevel(): LogLevel {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL
  if (envLevel && envLevel in LOG_LEVEL_ORDER) {
    return envLevel as LogLevel
  }
  // 生产构建/运行默认只输出 warn/error，避免 7132 个静态页面刷屏
  if (process.env.NODE_ENV === 'production') return 'warn'
  return 'info'
}

const currentLevel: LogLevel = resolveLogLevel()

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[currentLevel]
}

function buildMessage(
  level: 'info' | 'warn' | 'error',
  scope: string,
  message: string,
  context?: LogContext,
): string {
  const ts = new Date().toISOString().slice(11, 23)
  const ctx = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : ''
  return `[${ts}] [${level}] [${scope}] ${message}${ctx}`
}

export const logger = {
  info(scope: string, message: string, context?: LogContext): void {
    if (!shouldLog('info')) return
    console.info(buildMessage('info', scope, message, context))
  },
  warn(scope: string, message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return
    console.warn(buildMessage('warn', scope, message, context))
  },
  error(scope: string, message: string, context?: LogContext): void {
    if (!shouldLog('error')) return
    console.error(buildMessage('error', scope, message, context))
  },
  /** 当前生效的日志级别（供汇总性提示或调试使用） */
  getLevel(): LogLevel {
    return currentLevel
  },
}
