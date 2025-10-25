import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Supabaseクライアントを初期化
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 明日の日付を取得
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD形式

    console.log(`📅 リマインダー送信開始: ${tomorrowDate}の予約を検索中...`);

    // 翌日の予約を取得（LINE User IDが設定されているもののみ）
    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("reservation_date", tomorrowDate)
      .eq("status", "confirmed")
      .not("line_user_id", "is", null);

    if (error) {
      console.error("予約取得エラー:", error);
      throw error;
    }

    if (!reservations || reservations.length === 0) {
      console.log("✅ 翌日の予約はありません（またはLINE User IDが設定されていません）");
      return new Response(
        JSON.stringify({ success: true, message: "No reservations found for tomorrow", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 ${reservations.length}件の予約にリマインダーを送信します`);

    // 各予約にリマインダーを送信
    const results = [];
    for (const reservation of reservations) {
      try {
        console.log(`  → 予約番号: ${reservation.reservation_number} (${reservation.customer_name}様)`);

        // send-line-notification Edge Functionを呼び出し
        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-line-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              lineUserId: reservation.line_user_id,
              notificationType: "reminder",
              data: {
                reservation_number: reservation.reservation_number,
                reservation_date: reservation.reservation_date,
                start_time: reservation.start_time,
                end_time: reservation.end_time,
                studio_id: reservation.studio_id,
                area: reservation.area,
                customer_name: reservation.customer_name,
                price: reservation.price,
              },
            }),
          }
        );

        if (notificationResponse.ok) {
          console.log(`    ✅ 送信成功`);
          results.push({ reservation_number: reservation.reservation_number, success: true });
        } else {
          const errorData = await notificationResponse.json();
          console.error(`    ❌ 送信失敗:`, errorData);
          results.push({ reservation_number: reservation.reservation_number, success: false, error: errorData });
        }
      } catch (error) {
        console.error(`    ❌ エラー:`, error);
        results.push({ reservation_number: reservation.reservation_number, success: false, error: String(error) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`\n📊 リマインダー送信完了: 成功 ${successCount}件 / 失敗 ${failureCount}件`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily reminders sent",
        date: tomorrowDate,
        total: reservations.length,
        successCount,
        failureCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ エラー:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
