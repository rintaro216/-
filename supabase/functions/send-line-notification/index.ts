import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LINE_API_ENDPOINT = "https://api.line.me/v2/bot/message/push";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  lineUserId: string;
  notificationType: "reservation" | "cancellation" | "reminder" | "announcement";
  data: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
    }

    const { lineUserId, notificationType, data }: NotificationRequest = await req.json();

    if (!lineUserId) {
      return new Response(
        JSON.stringify({ error: "lineUserId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = generateMessage(notificationType, data);

    const response = await fetch(LINE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [message],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("LINE API Error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send LINE notification", details: error }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("LINE notification sent to " + lineUserId);
    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateMessage(type: string, data: Record<string, any>) {
  const { reservation_number, reservation_date, start_time, end_time, studio_id, area, customer_name, price, title, content } = data;
  const areaName = area === "onpukan" ? "おんぷ館" : "みどり楽器";

  switch (type) {
    case "reservation":
      return {
        type: "text",
        text: "【予約完了】\n\n" + customer_name + " 様\n\nご予約ありがとうございます！\n\n■ 予約番号\n" + reservation_number + "\n\n■ 予約詳細\n日時: " + formatDate(reservation_date) + "\n時間: " + start_time?.slice(0, 5) + "〜" + end_time?.slice(0, 5) + "\n場所: " + areaName + "\nスタジオ: " + studio_id + "\n料金: ¥" + price?.toLocaleString() + "\n\n■ キャンセルについて\n予約のキャンセルは予約確認ページから行えます。\n\nご来店をお待ちしております♪",
      };
    case "cancellation":
      return {
        type: "text",
        text: "【予約キャンセル完了】\n\n" + customer_name + " 様\n\n以下の予約をキャンセルいたしました。\n\n■ キャンセルした予約\n予約番号: " + reservation_number + "\n日時: " + formatDate(reservation_date) + " " + start_time?.slice(0, 5) + "〜\n\nまたのご利用をお待ちしております。",
      };
    case "reminder":
      return {
        type: "text",
        text: "【予約リマインダー】\n\n" + customer_name + " 様\n\n明日のご予約のお知らせです。\n\n■ 予約詳細\n予約番号: " + reservation_number + "\n日時: " + formatDate(reservation_date) + "\n時間: " + start_time?.slice(0, 5) + "〜" + end_time?.slice(0, 5) + "\n場所: " + areaName + "\nスタジオ: " + studio_id + "\n\nお気をつけてお越しください♪\n\n※キャンセルの場合は早めのご連絡をお願いします",
      };
    case "announcement":
      return {
        type: "text",
        text: "【新しいお知らせ】\n\n" + title + "\n\n" + content,
      };
    default:
      return { type: "text", text: "おんぷタイムからのお知らせです。" };
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  };
  return date.toLocaleDateString("ja-JP", options);
}
