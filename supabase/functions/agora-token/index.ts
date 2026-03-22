import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
}

async function generateRtcToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  expirationTimeInSeconds: number
): Promise<string> {
  const encoder = new TextEncoder()
  
  const currentTime = Math.floor(Date.now() / 1000)
  const expiredTs = currentTime + expirationTimeInSeconds

  // Agora token format: appId:channelName:uid:expiredTs:signature
  const messageToSign = `${appId}${channelName}${uid}${expiredTs}`
  
  const key = encoder.encode(appCertificate)
  const data = encoder.encode(messageToSign)

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data)
  const signatureArray = Array.from(new Uint8Array(signature))
  const signatureHex = signatureArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")

  // Build token: appId:uid:expiredTs:signature (IMPORTANT: NO channelName here)
  const token = `${appId}:${uid}:${expiredTs}:${signatureHex}`
  
  // Base64 encode
  const encodedToken = btoa(token)
  
  console.log(`Token generated: ${encodedToken.substring(0, 20)}...`)
  
  return encodedToken
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { channelName, userId } = await req.json()

    const appId = Deno.env.get("AGORA_APP_ID")
    const appCertificate = Deno.env.get("AGORA_APP_CERTIFICATE")

    if (!appId || !appCertificate) {
      console.error("❌ Missing Agora credentials")
      return new Response(
        JSON.stringify({ error: "Missing Agora credentials" }),
        { status: 400, headers: corsHeaders }
      )
    }

    if (!channelName || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing channelName or userId" }),
        { status: 400, headers: corsHeaders }
      )
    }

    const expirationTimeInSeconds = 24 * 3600
    const uid = parseInt(userId) || Math.floor(Math.random() * 100000)

    console.log(`📝 Generating token for: ${channelName} (uid: ${uid})`)

    const token = await generateRtcToken(
      appId,
      appCertificate,
      channelName,
      uid,
      expirationTimeInSeconds
    )

    return new Response(
      JSON.stringify({ 
        token, 
        expirationTimeInSeconds,
        uid
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("❌ Error generating token:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})