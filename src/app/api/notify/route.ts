import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Note: Email functionality requires server-side execution.
// This route will not work with static export (output: export).

export async function POST(req: Request) {
    try {
        const { to, subject, text } = await req.json();

        // Create a transporter using environment variables
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD // Use app-specific password for Gmail
            }
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
