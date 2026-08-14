/**
 * 轻量级日志工具：统一时间戳、级别与作用域前缀，附带结构化上下文。
 * 服务端（构建期/SSR）输出到终端日志，客户端组件输出到浏览器控制台，
 * 便于定位"跳转错位、关联缺失、回退分支"等历史性修复路径上的问题。
 */
type LogContext = Record<string, unknown>

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
    console.info(buildMessage('info', scope, message, context))
  },
  warn(scope: string, message: string, context?: LogContext): void {
    console.warn(buildMessage('warn', scope, message, context))
  },
  error(scope: string, message: string, context?: LogContext): void {
    console.error(buildMessage('error', scope, message, context))
  },
}
