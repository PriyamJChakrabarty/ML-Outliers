import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase-admin';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return new Response('Server configuration error', { status: 500 });
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle the event
  const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;
  const eventType = evt.type;

  console.log(`Received webhook: ${eventType} for user: ${id}`);

  if (eventType === 'user.created') {
    try {
      // Insert user into Supabase
      const { error } = await supabase.from('users').insert({
        clerk_id: id,
        email: email_addresses[0].email_address,
        username: username || null,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatar_url: image_url || null,
      });

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Error creating user', { status: 500 });
      }

      console.log(`✅ User created in Supabase: ${id}`);
    } catch (err) {
      console.error('Exception creating user:', err);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    try {
      // Update user in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          email: email_addresses[0].email_address,
          username: username || null,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatar_url: image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response('Error updating user', { status: 500 });
      }

      console.log(`✅ User updated in Supabase: ${id}`);
    } catch (err) {
      console.error('Exception updating user:', err);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      // Delete user from Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error deleting user', { status: 500 });
      }

      console.log(`✅ User deleted from Supabase: ${id}`);
    } catch (err) {
      console.error('Exception deleting user:', err);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
