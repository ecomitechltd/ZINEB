import crypto from 'crypto'

const API_BASE_URL = 'https://api.esimaccess.com/api/v1/open'
const ACCESS_CODE = process.env.ESIM_ACCESS_CODE!
const SECRET_KEY = process.env.ESIM_SECRET_KEY!

// Types based on eSIM Access API documentation
export interface Package {
  packageCode: string
  slug: string
  name: string
  price: number // value * 10,000 (10000 = $1.00)
  currencyCode: string
  volume: number // bytes
  smsStatus: number
  dataType: number // 1=Total, 2=Daily Limit (Speed Reduced), 3=Daily Limit (Service Cut-off), 4=Daily Unlimited
  unusedValidTime: number
  duration: number
  durationUnit: string
  location: string // Alpha-2 ISO codes
  description: string
  activeType: number // 1=First installation, 2=First network connection
  favorite: boolean
  retailPrice: number
  speed: string
  locationNetworkList: {
    locationName: string
    locationLogo: string
    operatorList: { operatorName: string; networkType: string }[]
  }[]
  ipExport?: string
  supportTopUpType?: number
  fupPolicy?: string
}

export interface OrderResponse {
  orderNo: string
  transactionId: string
}

export interface ESimProfile {
  esimTranNo: string
  orderNo: string
  transactionId: string
  imsi: string
  iccid: string
  smsStatus: number
  msisdn: string
  ac: string // Activation code (LPA format)
  qrCodeUrl: string
  shortUrl: string
  smdpStatus: 'RELEASED' | 'DOWNLOAD' | 'INSTALLATION' | 'ENABLED' | 'DISABLED' | 'DELETED'
  eid: string
  activeType: number
  dataType: number
  activateTime: string | null
  expiredTime: string
  totalVolume: number // bytes
  totalDuration: number
  durationUnit: string
  orderUsage: number // bytes used
  esimStatus: string
  pin: string
  puk: string
  apn: string
  packageList: {
    packageName: string
    packageCode: string
    slug: string
    duration: number
    volume: number
    locationCode: string
    createTime: string
  }[]
}

export interface BalanceResponse {
  balance: number // in cents (value * 10,000)
  currency: string
}

interface ApiResponse<T> {
  success: boolean
  errorCode: string | null
  errorMsg: string | null
  obj: T
}

// Generate HMAC-SHA256 signature
function generateSignature(timestamp: string, requestId: string, body: string): string {
  const signData = timestamp + requestId + ACCESS_CODE + body
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(signData)
    .digest('hex')
    .toLowerCase()
}

// Generate UUID v4
function generateUUID(): string {
  return crypto.randomUUID()
}

// Make API request with proper authentication
async function apiRequest<T>(endpoint: string, body: object = {}): Promise<T> {
  const timestamp = Date.now().toString()
  const requestId = generateUUID()
  const bodyString = JSON.stringify(body)
  const signature = generateSignature(timestamp, requestId, bodyString)

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'RT-AccessCode': ACCESS_CODE,
      'RT-RequestID': requestId,
      'RT-Signature': signature,
      'RT-Timestamp': timestamp,
    },
    body: bodyString,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data: ApiResponse<T> = await response.json()

  if (!data.success) {
    throw new Error(`API error: ${data.errorCode} - ${data.errorMsg}`)
  }

  return data.obj
}

// Get all available data packages
export async function getPackages(options?: {
  locationCode?: string
  type?: 'BASE' | 'TOPUP'
  packageCode?: string
  slug?: string
  iccid?: string
  dataType?: number
}): Promise<{ packageList: Package[] }> {
  return apiRequest('/package/list', {
    locationCode: options?.locationCode || '',
    type: options?.type || '',
    packageCode: options?.packageCode || '',
    slug: options?.slug || '',
    iccid: options?.iccid || '',
    dataType: options?.dataType || '',
  })
}

// Order eSIM profiles
export async function orderProfiles(params: {
  transactionId: string
  amount?: number
  packageInfoList: {
    packageCode?: string
    slug?: string
    count: number
    price?: number
    periodNum?: number
  }[]
}): Promise<OrderResponse> {
  return apiRequest('/esim/order', params)
}

// Query allocated profiles
export async function queryProfiles(params: {
  orderNo?: string
  iccid?: string
  esimTranNo?: string
  startTime?: string
  endTime?: string
  pager: {
    pageNum: number
    pageSize: number
  }
}): Promise<{ esimList: ESimProfile[]; pager: { pageSize: number; pageNum: number; total: number } }> {
  return apiRequest('/esim/query', params)
}

// Cancel an unused eSIM profile (refunds to balance)
export async function cancelProfile(params: {
  iccid?: string
  esimTranNo?: string
}): Promise<object> {
  return apiRequest('/esim/cancel', params)
}

// Check account balance
export async function getBalance(): Promise<BalanceResponse> {
  return apiRequest('/balance/query', {})
}

// Get usage for an eSIM
export async function checkUsage(params: {
  iccid?: string
  esimTranNo?: string
}): Promise<{ orderUsage: number; totalVolume: number }> {
  return apiRequest('/esim/usage', params)
}

// Helper: Convert API price (value * 10,000) to dollars
export function priceToUSD(price: number): number {
  return price / 10000
}

// Helper: Convert bytes to GB
export function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 100) / 100
}

// Helper: Get country name from ISO code
export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    JP: 'Japan',
    US: 'United States',
    TH: 'Thailand',
    GB: 'United Kingdom',
    FR: 'France',
    DE: 'Germany',
    KR: 'South Korea',
    SG: 'Singapore',
    AU: 'Australia',
    CA: 'Canada',
    IT: 'Italy',
    ES: 'Spain',
    NL: 'Netherlands',
    PT: 'Portugal',
    CH: 'Switzerland',
    AT: 'Austria',
    BE: 'Belgium',
    GR: 'Greece',
    PL: 'Poland',
    CZ: 'Czech Republic',
    SE: 'Sweden',
    NO: 'Norway',
    DK: 'Denmark',
    FI: 'Finland',
    IE: 'Ireland',
    MY: 'Malaysia',
    ID: 'Indonesia',
    VN: 'Vietnam',
    PH: 'Philippines',
    TW: 'Taiwan',
    HK: 'Hong Kong',
    IN: 'India',
    CN: 'China',
    MO: 'Macau',
    LK: 'Sri Lanka',
    NP: 'Nepal',
    MX: 'Mexico',
    BR: 'Brazil',
    AR: 'Argentina',
    CL: 'Chile',
    CO: 'Colombia',
    PE: 'Peru',
    CR: 'Costa Rica',
    PA: 'Panama',
    PR: 'Puerto Rico',
    NZ: 'New Zealand',
    FJ: 'Fiji',
    GU: 'Guam',
    AE: 'UAE',
    TR: 'Turkey',
    IL: 'Israel',
    SA: 'Saudi Arabia',
    QA: 'Qatar',
    OM: 'Oman',
    JO: 'Jordan',
    EG: 'Egypt',
    ZA: 'South Africa',
    MA: 'Morocco',
    KE: 'Kenya',
    TZ: 'Tanzania',
    GH: 'Ghana',
    NG: 'Nigeria',
  }
  return countries[code] || code
}

// Helper: Get country flag emoji from ISO code
export function getCountryFlag(code: string): string {
  // Convert country code to regional indicator symbols
  const codePoints = [...code.toUpperCase()].map(
    char => 0x1F1E6 - 65 + char.charCodeAt(0)
  )
  return String.fromCodePoint(...codePoints)
}

// Helper: Get region from country code
export function getRegion(code: string): string {
  const regions: Record<string, string> = {
    // Europe
    GB: 'Europe', FR: 'Europe', DE: 'Europe', IT: 'Europe', ES: 'Europe',
    NL: 'Europe', PT: 'Europe', CH: 'Europe', AT: 'Europe', BE: 'Europe',
    GR: 'Europe', PL: 'Europe', CZ: 'Europe', SE: 'Europe', NO: 'Europe',
    DK: 'Europe', FI: 'Europe', IE: 'Europe',
    // Asia
    JP: 'Asia', KR: 'Asia', SG: 'Asia', TH: 'Asia', MY: 'Asia',
    ID: 'Asia', VN: 'Asia', PH: 'Asia', TW: 'Asia', HK: 'Asia',
    IN: 'Asia', CN: 'Asia', MO: 'Asia', LK: 'Asia', NP: 'Asia',
    // Americas
    US: 'Americas', CA: 'Americas', MX: 'Americas', BR: 'Americas',
    AR: 'Americas', CL: 'Americas', CO: 'Americas', PE: 'Americas',
    CR: 'Americas', PA: 'Americas', PR: 'Americas',
    // Oceania
    AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania', GU: 'Oceania',
    // Middle East
    AE: 'Middle East', TR: 'Middle East', IL: 'Middle East',
    SA: 'Middle East', QA: 'Middle East', OM: 'Middle East',
    JO: 'Middle East', EG: 'Middle East',
    // Africa
    ZA: 'Africa', MA: 'Africa', KE: 'Africa', TZ: 'Africa',
    GH: 'Africa', NG: 'Africa',
  }
  return regions[code] || 'Other'
}
