import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
}

async function generateTokenWithHmac(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  expirationTime: number
): Promise<string> {
  const encoder = new TextEncoder()
  
  // Create signature
  const message = `${appId}${channelName}${uid}${expirationTime}`
  const key = encoder.encode(appCertificate)
  const data = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data)
  const signatureArray = Array.from(new Uint8Array(signature))
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("")

  // Build token: appId:channelName:uid:expirationTime:signature
  const token = `${appId}:${channelName}:${uid}:${expirationTime}:${signatureHex}`
  
  return btoa(token)
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
    const expirationTime = Math.floor(Date.now() / 1000) + expirationTimeInSeconds

    const token = await generateTokenWithHmac(
      appId,
      appCertificate,
      channelName,
      uid,
      expirationTime
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
    console.error("Error generating token:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})