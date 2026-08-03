// app/admin/auth-actions.ts
'use server';

import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import { genSalt, hash, compare } from 'bcrypt-ts';
import { brand } from '@/lib/data/brand';

export async function loginAdmin(formData: FormData) {
  try {
    const db = await getDb();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const anyUserExists = await db.select().from(users).limit(1);

    // ONE-TIME SETUP: If no users exist, the first login creates the admin account
    if (anyUserExists.length === 0) {
      // 3. Use async hashing
      const salt = await genSalt(10);
      const passwordHash = await hash(password, salt);
      
      await db.insert(users).values({
        id: `u-${Date.now()}`,
        email,
        passwordHash, // Use the async hash
      });
      
      const cookieStore = await cookies();
      cookieStore.set('admin_session', email, { httpOnly: true, secure: true, path: '/' });
      return { success: true };
    }

    // Normal Login Flow
    // 4. Query ONLY the specific user by email
    const targetedUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = targetedUsers[0];

    // 5. Use async compare to prevent blocking the Node.js thread
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new Error('Invalid email or password');
    }

    const cookieStore = await cookies();
    cookieStore.set('admin_session', user.email, { httpOnly: true, secure: true, path: '/' });
    
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

    // Always return success even if email isn't found to prevent email enumeration attacks
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

    // 1. Swapped to asynchronous salt and hashing to prevent event loop blocking
    const salt = await genSalt(10);
    const passwordHash = await hash(newPassword, salt);

    await db.update(users)
      .set({ passwordHash: passwordHash, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, user.id));

    return { success: true, message: 'Password updated successfully. You can now log in.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}