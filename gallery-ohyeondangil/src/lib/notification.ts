/**
 * Sends a real-time notification to Discord or Slack.
 * It automatically adapts the request payload based on the webhook URL type.
 */
export async function sendNotification(text: string): Promise<boolean> {
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes("your_webhook_url")) {
    console.warn("NOTIFICATION_WEBHOOK_URL is not configured properly in env variables.");
    return false;
  }

  try {
    const isSlack = webhookUrl.includes("hooks.slack.com");
    // Discord accepts 'content', Slack accepts 'text'
    const payload = isSlack ? { text } : { content: text };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to send notification via webhook: ${response.statusText}`);
      return false;
    }

    console.log("Real-time notification sent successfully.");
    return true;
  } catch (error) {
    console.error("Error occurred while sending webhook notification:", error);
    return false;
  }
}
