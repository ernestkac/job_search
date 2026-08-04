export interface EmailAttachment {
  filename: string;
  mimeType: string;
  dataUrl?: string; // e.g. "data:application/pdf;base64,..."
  arrayBuffer?: ArrayBuffer;
}

export interface SendGmailOptions {
  accessToken: string;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  attachments?: EmailAttachment[];
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts Standard Base64 to Base64URL (RFC 4648)
 */
function base64ToBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Builds an RFC 2822 MIME formatted message string
 */
export function buildMimeMessage(
  recipientEmail: string,
  subject: string,
  bodyText: string,
  attachments: EmailAttachment[] = []
): string {
  const boundary = `====_Boundary_${Date.now()}_====`;
  
  // Headers
  let mime = `To: ${recipientEmail}\r\n`;
  mime += `Subject: ${subject}\r\n`;
  mime += `MIME-Version: 1.0\r\n`;

  if (attachments.length === 0) {
    mime += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
    mime += `${bodyText}\r\n`;
  } else {
    mime += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
    
    // Body part
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: text/plain; charset="UTF-8"\r\n`;
    mime += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    mime += `${bodyText}\r\n\r\n`;

    // Attachment parts
    for (const att of attachments) {
      let b64Data = '';
      if (att.arrayBuffer) {
        b64Data = arrayBufferToBase64(att.arrayBuffer);
      } else if (att.dataUrl) {
        b64Data = att.dataUrl.split(',')[1] || att.dataUrl;
      }

      mime += `--${boundary}\r\n`;
      mime += `Content-Type: ${att.mimeType || 'application/pdf'}; name="${att.filename}"\r\n`;
      mime += `Content-Disposition: attachment; filename="${att.filename}"\r\n`;
      mime += `Content-Transfer-Encoding: base64\r\n\r\n`;
      mime += `${b64Data}\r\n\r\n`;
    }

    mime += `--${boundary}--\r\n`;
  }

  return mime;
}

/**
 * Sends an email using the Gmail API messages.send endpoint
 */
export async function sendGmailMessage(
  options: SendGmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { accessToken, recipientEmail, subject, bodyText, attachments = [] } = options;

  if (!accessToken) {
    return {
      success: false,
      error: 'Missing Google Auth token. Please re-authenticate with Google.',
    };
  }

  if (!recipientEmail || !recipientEmail.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address.',
    };
  }

  try {
    const mimeString = buildMimeMessage(recipientEmail, subject, bodyText, attachments);
    // Convert UTF-8 string to base64, then base64url
    // btoa on unescaped unicode can throw; encodeURIComponent handles UTF-8 safely
    const utf8Bytes = new TextEncoder().encode(mimeString);
    let binaryStr = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binaryStr += String.fromCharCode(utf8Bytes[i]);
    }
    const rawBase64 = btoa(binaryStr);
    const rawBase64Url = base64ToBase64Url(rawBase64);

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawBase64Url }),
    });

    const responseData = await res.json();

    if (res.ok && responseData.id) {
      return {
        success: true,
        messageId: responseData.id,
      };
    } else {
      const errorMsg = responseData.error?.message || responseData.error_description || 'Gmail API error';
      console.error('Gmail API error:', responseData);
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (err: any) {
    console.error('Failed to send email via Gmail API:', err);
    return {
      success: false,
      error: err?.message || 'Network error sending email via Gmail API.',
    };
  }
}
