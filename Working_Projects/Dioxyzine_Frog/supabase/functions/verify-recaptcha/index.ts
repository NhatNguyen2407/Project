import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed." }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        message: "Không nhận được reCAPTCHA token. Vui lòng tải lại trang và thử lại.",
      }), { status: 400, headers: corsHeaders });
    }

    const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY")?.trim();
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY is not configured");
      return new Response(JSON.stringify({
        success: false,
        message: "Cấu hình bảo mật chưa hoàn tất. Vui lòng liên hệ quản trị viên.",
      }), { status: 500, headers: corsHeaders });
    }

    // Google's siteverify endpoint expects URL-encoded POST form data.
    const params = new URLSearchParams({ secret: secretKey, response: token });
    const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!verifyResponse.ok) {
      console.error("Google reCAPTCHA siteverify HTTP failure", verifyResponse.status);
      return new Response(JSON.stringify({
        success: false,
        message: "Không thể xác minh reCAPTCHA lúc này. Vui lòng thử lại.",
      }), { status: 502, headers: corsHeaders });
    }

    const result = await verifyResponse.json();

    if (!result.success) {
      const errorCodes = Array.isArray(result["error-codes"]) ? result["error-codes"] : [];
      // Keep diagnostic detail in server logs; never return secret or token to the browser.
      console.error("Google reCAPTCHA verification failed", errorCodes);
      return new Response(JSON.stringify({
        success: false,
        message: "Xác thực bảo mật thất bại. Vui lòng tải lại trang và thử lại.",
        code: errorCodes.includes("timeout-or-duplicate")
          ? "token-expired"
          : errorCodes.includes("browser-error")
            ? "recaptcha-browser-error"
            : "verification-failed",
      }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      success: true,
      score: typeof result.score === "number" ? result.score : null,
    }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("verify-recaptcha unexpected error", error instanceof Error ? error.message : "Unknown error");
    return new Response(JSON.stringify({
      success: false,
      message: "Không thể xác minh bảo mật lúc này. Vui lòng thử lại.",
    }), { status: 500, headers: corsHeaders });
  }
});
