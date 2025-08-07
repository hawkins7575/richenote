import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { invitationToken, recipientEmail, inviterName, teamName, role, message } = await req.json()

    // 초대 링크 생성
    const inviteUrl = `${Deno.env.get('SITE_URL')}/team/invite?token=${invitationToken}`

    // 역할 라벨 매핑
    const roleLabels = {
      'admin': '관리자',
      'member': '멤버', 
      'viewer': '뷰어'
    }

    const roleLabel = roleLabels[role as keyof typeof roleLabels] || role

    // HTML 이메일 템플릿
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>팀 초대</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .invitation-card { background: #f8fafc; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
    .team-name { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 10px; }
    .role-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-weight: 500; margin: 10px 0; }
    .inviter { color: #64748b; margin: 10px 0; }
    .message { background: #fef7cd; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 30px 0; }
    .cta-button:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
    .security-note { background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .security-note strong { color: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 팀 초대</h1>
    </div>
    
    <div class="content">
      <div class="invitation-card">
        <div class="team-name">${teamName}</div>
        <div class="role-badge">${roleLabel}</div>
        <div class="inviter">${inviterName}님이 초대했습니다</div>
      </div>

      <p>안녕하세요!</p>
      <p><strong>${inviterName}</strong>님이 <strong>${teamName}</strong> 팀에 <strong>${roleLabel}</strong> 역할로 초대했습니다.</p>

      ${message ? `<div class="message"><strong>초대 메시지:</strong><br>${message.replace(/\n/g, '<br>')}</div>` : ''}

      <div style="text-align: center;">
        <a href="${inviteUrl}" class="cta-button">초대 수락하기</a>
      </div>

      <div class="security-note">
        <strong>🔒 보안 안내:</strong>
        <ul style="text-align: left; margin: 10px 0;">
          <li>이 초대 링크는 7일 후 만료됩니다</li>
          <li>초대받은 이메일 계정으로만 수락 가능합니다</li>
          <li>의심스러운 초대라면 발신자에게 직접 확인해주세요</li>
        </ul>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        초대를 수락하지 않으려면 이 이메일을 무시하시면 됩니다.<br>
        링크를 클릭할 수 없다면 아래 URL을 복사해서 브라우저에 붙여넣으세요:<br>
        <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; word-break: break-all;">${inviteUrl}</code>
      </p>
    </div>

    <div class="footer">
      <p><strong>리체 매물장</strong> | 팀 관리 시스템</p>
      <p>본 이메일은 팀 초대를 위해 발송되었습니다.</p>
    </div>
  </div>
</body>
</html>
    `

    // 텍스트 버전 이메일
    const emailText = `
${teamName} 팀 초대

안녕하세요!

${inviterName}님이 ${teamName} 팀에 ${roleLabel} 역할로 초대했습니다.

${message ? `초대 메시지: ${message}\n` : ''}

아래 링크를 클릭하여 초대를 수락하세요:
${inviteUrl}

보안 안내:
- 이 초대 링크는 7일 후 만료됩니다
- 초대받은 이메일 계정으로만 수락 가능합니다
- 의심스러운 초대라면 발신자에게 직접 확인해주세요

초대를 수락하지 않으려면 이 이메일을 무시하시면 됩니다.

---
리체 매물장 | 팀 관리 시스템
본 이메일은 팀 초대를 위해 발송되었습니다.
    `

    // Resend API를 사용한 이메일 전송
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY가 설정되지 않았습니다')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@richey.site',
        to: [recipientEmail],
        subject: `[${teamName}] 팀 초대 - ${roleLabel} 역할`,
        html: emailHtml,
        text: emailText,
        headers: {
          'X-Entity-Ref-ID': invitationToken,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API 오류:', error)
      throw new Error(`이메일 전송 실패: ${error}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.id,
        message: '초대 이메일이 성공적으로 전송되었습니다' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('이메일 전송 오류:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || '이메일 전송 중 오류가 발생했습니다' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})