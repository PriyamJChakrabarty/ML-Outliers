import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * CLERK WEBHOOK HANDLER
 *
 * Syncs user data from Clerk to our database
 * Handles: user.created, user.updated, user.deleted events
 *
 * SECURITY: Verifies webhook signatures using CLERK_WEBHOOK_SECRET
 * SCALABILITY: Handles user sync without manual intervention
 * MODULARITY: Isolated user management endpoint
 */

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return new Response(
      'Webhook secret not configured. Please add CLERK_WEBHOOK_SECRET to environment variables.',
      { status: 500 }
    );
  }
  // Get Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get request body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(webhookSecret);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;
  console.log(`📥 Webhook received: ${eventType}`);

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

      console.log('🔔 NEW USER SIGN UP DETECTED!');
      console.log(`📧 Email: ${email_addresses[0]?.email_address}`);
      console.log(`👤 Username: ${username || 'None'}`);
      console.log(`🆔 Clerk ID: ${id}`);

      await db.insert(users).values({
        clerkId: id,
        email: email_addresses[0]?.email_address || '',
        username: username || null,
        fullName: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatarUrl: image_url || null,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
      });

      console.log(`✅ ✅ ✅ AUTOMATIC REGISTRATION SUCCESSFUL! User ${username || email_addresses[0]?.email_address} added to database!`);
      console.log(`🎯 User can now complete problems and appear on leaderboard!\n`);
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

      await db
        .update(users)
        .set({
          email: email_addresses[0]?.email_address || '',
          username: username || null,
          fullName: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatarUrl: image_url || null,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));

      console.log(`✅ User updated in DB: ${id}`);
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      await db.delete(users).where(eq(users.clerkId, id));

      console.log(`✅ User deleted from DB: ${id}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
