// app/admin/auth-actions.ts
'use server';

import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import { brand } from '@/lib/data/brand';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-fallback-key-change-me'
);

// --- ZERO-DEPENDENCY NATIVE CRYPTO UTILS (Worker & Edge Safe) ---
function buf2hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hex2buf(hexString: string) {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, saltHex?: string) {
  const encoder = new TextEncoder();
  const salt = saltHex ? hex2buf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedKey = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  
  return `${buf2hex(salt.buffer)}:${buf2hex(derivedKey)}`;
}

async function verifyPassword(password: string, storedHash: string) {
  // Gracefully handle old bcrypt hashes by failing the auth check cleanly
  if (!storedHash || !storedHash.includes(':')) return false; 
  
  const [saltStr, originalHash] = storedHash.split(':');
  if (!saltStr || !originalHash) return false;

  const computed = await hashPassword(password, saltStr);
  return computed.split(':')[1] === originalHash;
}
// ----------------------------------------------------------------

export async function loginAdmin(formData: FormData) {
  try {
    const db = await getDb();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const allUsers = await db.select().from(users);

    // ONE-TIME SETUP: If no users exist, the first login creates the admin account
    if (allUsers.length === 0) {
      const hash = await hashPassword(password);
      
      await db.insert(users).values({
        id: `u-${Date.now()}`,
        email,
        passwordHash: hash,
      });

      const token = await new SignJWT({ email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
      
      const cookieStore = await cookies();
      cookieStore.set('admin_session', token, { httpOnly: true, secure: true, path: '/' });
      return { success: true };
    }

    // Normal Login Flow
    const user = allUsers.find(u => u.email === email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new Error('Invalid email or password');
    }

    const token = await new SignJWT({ email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, { httpOnly: true, secure: true, path: '/' });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

export async function requestPasswordReset(formData: FormData) {
  try {
    const db = await getDb();
    const email = formData.get('email') as string;
    
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = existingUsers[0];

    if (user) {
      const token = crypto.randomUUID(); // Secure random string
      const expiry = Date.now() + 3600000; // 1 hour from now

      await db.update(users)
        .set({ resetToken: token, resetTokenExpiry: expiry })
        .where(eq(users.id, user.id));

      const resetLink = `${brand.url}/admin/reset-password?token=${token}`;
      
      // Setup Nodemailer Transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true, // true for port 465, false for port 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Send the email
      await transporter.sendMail({
        from: `"Kickverse KE Admin" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Kickverse - Admin Password Reset",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #111;">Password Reset Request</h2>
            <p style="color: #444; line-height: 1.6;">You recently requested to reset the password for your Kickverse Admin account. Click the button below to set a new password.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #C6FF00; color: #000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link is only valid for 1 hour.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
        `,
      });
    }

    return { success: true, message: 'If that email exists, a reset link has been sent.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const db = await getDb();
    const token = formData.get('token') as string;
    const newPassword = formData.get('password') as string;

    const existingUsers = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
    const user = existingUsers[0];

    if (!user || !user.resetTokenExpiry || Date.now() > user.resetTokenExpiry) {
      throw new Error('Invalid or expired reset token');
    }

    const hash = await hashPassword(newPassword);

    await db.update(users)
      .set({ passwordHash: hash, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, user.id));

    return { success: true, message: 'Password updated successfully. You can now log in.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}