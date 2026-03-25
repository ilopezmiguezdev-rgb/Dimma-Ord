import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') ?? 'onboarding@resend.dev';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required env vars:', {
      RESEND_API_KEY: !!RESEND_API_KEY,
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
    });
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration — missing environment variables' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let order: Record<string, unknown>;
  try {
    ({ order } = await req.json());
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!order || typeof order !== 'object') {
    return new Response(
      JSON.stringify({ error: 'No order provided' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!order.id) {
    return new Response(
      JSON.stringify({ error: 'Order missing required field: id' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!order.client_id && !order.sub_client_id) {
    console.log(`Order ${order.id} has no client_id or sub_client_id — skipping notification.`);
    return new Response(
      JSON.stringify({ skipped: true, reason: 'no_client_id' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: existing } = await supabase
    .from('service_orders')
    .select('notification_sent_at')
    .eq('id', order.id)
    .single();

  if (existing?.notification_sent_at) {
    console.log(`Notification already sent for order ${order.id} at ${existing.notification_sent_at} — skipping.`);
    return new Response(
      JSON.stringify({ skipped: true, reason: 'already_sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let recipientEmail: string | null = null;

  if (order.sub_client_id) {
    const { data } = await supabase
      .from('sub_clients')
      .select('contact_email')
      .eq('id', order.sub_client_id)
      .single();
    recipientEmail = data?.contact_email ?? null;
  }

  if (!recipientEmail && order.client_id) {
    const { data } = await supabase
      .from('clients')
      .select('contact_email')
      .eq('id', order.client_id)
      .single();
    recipientEmail = data?.contact_email ?? null;
  }

  if (!recipientEmail) {
    console.log(`No contact_email for order ${order.id} — skipping notification.`);
    return new Response(
      JSON.stringify({ skipped: true, reason: 'no_email' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const formatDate = (d: unknown) =>
    typeof d === 'string' ? new Date(d).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : 'N/A';

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <div style="background: #0ea5e9; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">
          Nueva Orden de Servicio — ${order.id}
        </h1>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 40%;">Cliente:</td>
            <td style="padding: 8px 0;">${order.client_name ?? 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Laboratorio:</td>
            <td style="padding: 8px 0;">${order.sub_client_name ?? 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Equipo:</td>
            <td style="padding: 8px 0;">${[order.equipment_brand, order.equipment_model, order.equipment_type].filter(Boolean).join(' / ')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Técnico:</td>
            <td style="padding: 8px 0;">${order.assigned_technician ?? 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Fecha Recepción:</td>
            <td style="padding: 8px 0;">${formatDate(order.date_received)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Problema:</td>
            <td style="padding: 8px 0;">${order.reported_issue ?? 'No especificado'}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          Este es un mensaje automático del sistema de Servicio Técnico Dimma.
        </p>
      </div>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: [recipientEmail],
      subject: `[Dimma] Nueva Orden de Servicio: ${order.id}`,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Resend error:', body);
    return new Response(
      JSON.stringify({ error: 'Email send failed', detail: body }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const resendData = await res.json();

  await supabase
    .from('service_orders')
    .update({ notification_sent_at: new Date().toISOString() })
    .eq('id', order.id);

  return new Response(
    JSON.stringify({ sent: true, resend_id: resendData.id }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
