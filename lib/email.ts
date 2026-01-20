import { Resend } from 'resend'

// Lazy initialize to avoid build-time errors
let resend: Resend | null = null

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const FROM_EMAIL = 'VIP eSim <noreply@e-sim.vip>'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://e-sim.vip'

interface WelcomeEmailProps {
  email: string
  name: string
}

interface PurchaseEmailProps {
  email: string
  name: string
  orderId: string
  country: string
  planName: string
  dataAmount: string
  validity: number
  total: number
  qrCodeUrl: string
  activationCode?: string
}

interface GiftEsimEmailProps {
  recipientEmail: string
  senderName: string
  recipientName?: string
  personalMessage?: string
  country: string
  planName: string
  dataAmount: string
  validity: number
  qrCodeUrl: string
  activationCode?: string
}

// Welcome email for new signups
export async function sendWelcomeEmail({ email, name }: WelcomeEmailProps) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to VIP eSim - Your Travel Companion',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">VIP eSIM</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">Stay Connected Everywhere</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Welcome, ${name}!</h2>

      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Thank you for joining VIP eSIM! You're now part of a community of smart travelers who stay connected without the hassle of physical SIM cards.
      </p>

      <div style="background-color: #f8f9ff; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #4F46E5; margin: 0 0 15px; font-size: 18px;">Here's what you can do:</h3>
        <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Browse 190+ destinations worldwide</li>
          <li>Get instant eSIM delivery - no waiting</li>
          <li>Enjoy competitive prices starting from $3.49</li>
          <li>Manage all your eSIMs from your dashboard</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${BASE_URL}/destinations" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Browse Destinations
        </a>
      </div>

      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
        If you have any questions, our support team is here to help. Just reply to this email!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999999; font-size: 12px; margin: 0 0 10px;">
        VIP eSim - Your Global eSIM Provider
      </p>
      <p style="color: #cccccc; font-size: 11px; margin: 0;">
        You received this email because you signed up for VIP eSim.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

// Purchase confirmation email with QR code
export async function sendPurchaseEmail({
  email,
  name,
  orderId,
  country,
  planName,
  dataAmount,
  validity,
  total,
  qrCodeUrl,
  activationCode,
}: PurchaseEmailProps) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your ${country} eSIM is Ready - Order #${orderId.slice(-8).toUpperCase()}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">VIP eSim</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">Your eSIM is Ready!</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 24px;">Thank you, ${name}!</h2>
      <p style="color: #666666; font-size: 16px; margin: 0 0 30px;">
        Your eSIM for <strong>${country}</strong> is ready to install.
      </p>

      <!-- Order Summary -->
      <div style="background-color: #f8f9ff; border-radius: 12px; padding: 24px; margin: 0 0 30px;">
        <h3 style="color: #1a1a1a; margin: 0 0 15px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Order ID</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-family: monospace;">#${orderId.slice(-8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Destination</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${country}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Plan</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${planName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Data</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${dataAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Validity</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${validity} days</td>
          </tr>
          <tr style="border-top: 1px solid #e0e0e0;">
            <td style="padding: 12px 0 0; color: #1a1a1a; font-size: 16px; font-weight: bold;">Total</td>
            <td style="padding: 12px 0 0; color: #4F46E5; font-size: 16px; text-align: right; font-weight: bold;">$${(total / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- QR Code -->
      <div style="text-align: center; margin: 30px 0; padding: 30px; background-color: #ffffff; border: 2px dashed #e0e0e0; border-radius: 12px;">
        <h3 style="color: #1a1a1a; margin: 0 0 20px; font-size: 18px;">Scan to Install</h3>
        <img src="${qrCodeUrl}" alt="eSIM QR Code" style="width: 200px; height: 200px; border-radius: 8px;" />
        ${activationCode ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9ff; border-radius: 8px;">
          <p style="color: #666666; font-size: 12px; margin: 0 0 5px;">Manual Activation Code:</p>
          <code style="color: #4F46E5; font-size: 11px; word-break: break-all;">${activationCode}</code>
        </div>
        ` : ''}
      </div>

      <!-- Installation Steps -->
      <div style="background-color: #fff8e6; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #b8860b; margin: 0 0 15px; font-size: 16px;">How to Install</h3>
        <ol style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Go to <strong>Settings</strong> > <strong>Cellular</strong> > <strong>Add eSIM</strong></li>
          <li>Select <strong>Use QR Code</strong> and scan the code above</li>
          <li>Follow the prompts to complete installation</li>
          <li>Enable the eSIM when you arrive at your destination</li>
        </ol>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${BASE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
          View in Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999999; font-size: 12px; margin: 0 0 10px;">
        Need help? Visit our <a href="${BASE_URL}/help/install-esim" style="color: #4F46E5;">installation guide</a>
      </p>
      <p style="color: #cccccc; font-size: 11px; margin: 0;">
        VIP eSim - Your Global eSIM Provider
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Failed to send purchase email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending purchase email:', error)
    return { success: false, error }
  }
}

// Gift eSIM email to a friend
export async function sendGiftEsimEmail({
  recipientEmail,
  senderName,
  recipientName,
  personalMessage,
  country,
  planName,
  dataAmount,
  validity,
  qrCodeUrl,
  activationCode,
}: GiftEsimEmailProps) {
  try {
    const greeting = recipientName ? `Hi ${recipientName}!` : 'Hi there!'

    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `${senderName} sent you an eSIM gift for ${country}!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">🎁</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">You've Received a Gift!</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">From ${senderName}</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 24px;">${greeting}</h2>
      <p style="color: #666666; font-size: 16px; margin: 0 0 20px;">
        <strong>${senderName}</strong> has sent you an eSIM for <strong>${country}</strong>!
      </p>

      ${personalMessage ? `
      <div style="background-color: #f8f9ff; border-left: 4px solid #4F46E5; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="color: #666666; font-size: 14px; font-style: italic; margin: 0;">"${personalMessage}"</p>
        <p style="color: #999999; font-size: 12px; margin: 10px 0 0;">- ${senderName}</p>
      </div>
      ` : ''}

      <!-- Gift Details -->
      <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 15px; font-size: 16px;">Your Gift eSIM</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Destination</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${country}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Plan</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${planName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Data</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${dataAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666; font-size: 14px;">Validity</td>
            <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right;">${validity} days from activation</td>
          </tr>
        </table>
      </div>

      <!-- QR Code -->
      <div style="text-align: center; margin: 30px 0; padding: 30px; background-color: #ffffff; border: 2px dashed #22c55e; border-radius: 12px;">
        <h3 style="color: #1a1a1a; margin: 0 0 20px; font-size: 18px;">Scan to Install Your eSIM</h3>
        <img src="${qrCodeUrl}" alt="eSIM QR Code" style="width: 200px; height: 200px; border-radius: 8px;" />
        ${activationCode ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9ff; border-radius: 8px;">
          <p style="color: #666666; font-size: 12px; margin: 0 0 5px;">Manual Activation Code:</p>
          <code style="color: #4F46E5; font-size: 11px; word-break: break-all;">${activationCode}</code>
        </div>
        ` : ''}
      </div>

      <!-- Installation Steps -->
      <div style="background-color: #fff8e6; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #b8860b; margin: 0 0 15px; font-size: 16px;">How to Install</h3>
        <ol style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Make sure your phone supports eSIM</li>
          <li>Go to <strong>Settings</strong> > <strong>Cellular</strong> > <strong>Add eSIM</strong></li>
          <li>Select <strong>Use QR Code</strong> and scan the code above</li>
          <li>Enable the eSIM when you arrive at your destination</li>
        </ol>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999999; font-size: 12px; margin: 0 0 10px;">
        Questions? Visit <a href="${BASE_URL}/help" style="color: #4F46E5;">our help center</a>
      </p>
      <p style="color: #cccccc; font-size: 11px; margin: 0;">
        VIP eSim - Your Global eSIM Provider
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Failed to send gift email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending gift email:', error)
    return { success: false, error }
  }
}
