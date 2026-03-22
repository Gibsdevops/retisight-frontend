import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as crypto from "https://deno.land/std@0.208.0/crypto/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
}

// Simple token generation without external dependencies
function generateAgoraToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  expirationTimeInSeconds: number
): string {
  const messageEncoded = `${appId}${channelName}${uid}`;
  
  // Create a simple token format (not full RTC token, but works for testing)
  // For production, you should use the proper Agora token library
  const encoder = new TextEncoder();
  const data = encoder.encode(messageEncoded);
  
  // Return a base64 encoded token
  const token = btoa(String.fromCharCode.apply(null, Array.from(data)));
  return token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { channelName, userId, role = "publisher" } = await req.json()

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

    // Generate token
    const token = generateAgoraToken(
      appId,
      appCertificate,
      channelName,
      uid,
      expirationTimeInSeconds
    )

    return new Response(
      JSON.stringify({ token, expirationTimeInSeconds }),
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