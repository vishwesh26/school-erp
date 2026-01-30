import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (
    email: string,
    name: string,
    password: string,
    role: string,
    username: string,
    rollNumber?: string,
    className?: string,
) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"DCPEMS ERP" <${process.env.SMTP_USER}>`, // sender address
            to: email, // list of receivers
            subject: "Welcome to DCPEMS! Registration Successful", // Subject line
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4B5563; text-align: center;">Welcome to Dr Cyrus Poonawalla English Medium School! </h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We are excited to have you on board as a <strong>${role}</strong>! Your account has been successfully created.</p>
            
            ${role === 'student' ? `
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151; border-bottom: 1px solid #D1D5DB; padding-bottom: 10px;">Academic Details</h3>
                <p><strong>Class:</strong> ${className}</p>
                <p><strong>Roll Number:</strong> <span style="font-family: monospace; font-size: 1.1em; background-color: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${rollNumber}</span></p>
            </div>
            ` : ''}

            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FCD34D;">
                <h3 style="margin-top: 0; color: #92400E; border-bottom: 1px solid #FBBF24; padding-bottom: 10px;">Login Credentials</h3>
                <p>Use these credentials to sign in to the ERP portal:</p>
                <p><strong>Username:</strong> ${username} (or your email)</p>
                <p><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 1.1em;">${password}</span></p>
                <p style="color: #DC2626; margin-top: 15px; font-weight: bold; background-color: #FEE2E2; padding: 10px; border-radius: 5px; border-left: 4px solid #EF4444;">
                    ⚠️ IMPORTANT: This is a temporary password. Please change it in Settings after logging in.
                </p>
            </div>

            <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_URL || 'https://www.dcpems-erp.com'}/sign-in" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to ERP</a>
            </p>
            
            <p style="color: #6B7280; font-size: 0.8em; text-align: center; margin-top: 30px;">
                © ${new Date().getFullYear()} Dr Cyrus Poonawalla English Medium School. All rights reserved.
            </p>
        </div>
      `,
        });
        console.log("Welcome email sent to %s: %s", email, info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Error sending welcome email:", error);
        return { success: false, error };
    }
};
export const sendNotificationEmail = async (
    email: string,
    studentName: string,
    subject: string,
    message: string,
    link?: string,
    linkText?: string
) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"DCPEMS notifications" <${process.env.SMTP_USER}>`,
            to: email,
            subject: subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4B5563; text-align: center;">DCPEMS Notification</h2>
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>${message}</p>
            
            ${link ? `
            <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_URL || 'https://www.dcpems-erp.com'}${link}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">${linkText || 'View Details'}</a>
            </p>
            ` : ''}
            
            <p style="color: #6B7280; font-size: 0.8em; text-align: center; margin-top: 30px;">
                © ${new Date().getFullYear()} Dr Cyrus Poonawalla English Medium School, uruli kanchan. All rights reserved.
            </p>
        </div>
      `,
        });
        console.log("Notification sent to %s: %s", email, info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Error sending notification email:", error);
        return { success: false, error };
    }
};
