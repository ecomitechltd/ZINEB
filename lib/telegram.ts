// Telegram Bot Notifications for VIP eSim
// Sends real-time alerts for signups, logins, purchases, and wallet top-ups

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8385822293:AAGT2aOEzHz39N7mmxfS7n7C9hdvjR_lV9w'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003217651658'

interface TelegramMessage {
  chat_id: string
  text: string
  parse_mode: 'HTML' | 'Markdown'
  disable_web_page_preview?: boolean
}

async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const message: TelegramMessage = {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Telegram API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
    return false
  }
}

// Notification for new user signup
export async function notifySignup(data: {
  email: string
  name?: string | null
  source?: string
}): Promise<void> {
  const message = `
<b>New User Signup</b>

<b>Email:</b> ${escapeHtml(data.email)}
${data.name ? `<b>Name:</b> ${escapeHtml(data.name)}` : ''}
<b>Source:</b> ${data.source || 'Direct'}
<b>Time:</b> ${formatTime()}
`
  await sendTelegramMessage(message.trim())
}

// Notification for user login
export async function notifySignin(data: {
  email: string
  name?: string | null
  method?: string
}): Promise<void> {
  const message = `
<b>User Login</b>

<b>Email:</b> ${escapeHtml(data.email)}
${data.name ? `<b>Name:</b> ${escapeHtml(data.name)}` : ''}
<b>Method:</b> ${data.method || 'Credentials'}
<b>Time:</b> ${formatTime()}
`
  await sendTelegramMessage(message.trim())
}

// Notification for new purchase/order
export async function notifyPurchase(data: {
  orderId: string
  email: string
  country: string
  planName: string
  dataAmount: string
  validity: number
  total: number
  status?: string
}): Promise<void> {
  const message = `
<b>New Purchase</b>

<b>Order:</b> #${data.orderId.slice(-8).toUpperCase()}
<b>Customer:</b> ${escapeHtml(data.email)}
<b>Destination:</b> ${escapeHtml(data.country)}
<b>Plan:</b> ${escapeHtml(data.planName)}
<b>Data:</b> ${data.dataAmount}
<b>Validity:</b> ${data.validity} days
<b>Amount:</b> $${(data.total / 100).toFixed(2)}
<b>Status:</b> ${data.status || 'PENDING'}
<b>Time:</b> ${formatTime()}
`
  await sendTelegramMessage(message.trim())
}

// Notification for wallet top-up
export async function notifyWalletTopup(data: {
  email: string
  amount: number
  newBalance: number
  method?: string
  status?: string
}): Promise<void> {
  const message = `
<b>Wallet Top-Up</b>

<b>Customer:</b> ${escapeHtml(data.email)}
<b>Amount:</b> $${(data.amount / 100).toFixed(2)}
<b>New Balance:</b> $${(data.newBalance / 100).toFixed(2)}
<b>Method:</b> ${data.method || 'Card'}
<b>Status:</b> ${data.status || 'Completed'}
<b>Time:</b> ${formatTime()}
`
  await sendTelegramMessage(message.trim())
}

// Notification for payment status change
export async function notifyPaymentStatus(data: {
  orderId: string
  email: string
  status: string
  amount: number
  country?: string
}): Promise<void> {
  const statusEmoji = {
    COMPLETED: '✅',
    PAID: '✅',
    PENDING: '⏳',
    FAILED: '❌',
    REFUNDED: '↩️',
  }[data.status] || '📋'

  const message = `
<b>${statusEmoji} Payment ${data.status}</b>

<b>Order:</b> #${data.orderId.slice(-8).toUpperCase()}
<b>Customer:</b> ${escapeHtml(data.email)}
${data.country ? `<b>Destination:</b> ${escapeHtml(data.country)}` : ''}
<b>Amount:</b> $${(data.amount / 100).toFixed(2)}
<b>Time:</b> ${formatTime()}
`
  await sendTelegramMessage(message.trim())
}

// Helper to escape HTML special characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Format current time in a readable format
function formatTime(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + ' UTC'
}
