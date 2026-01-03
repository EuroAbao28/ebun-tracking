const nodemailer = require('nodemailer')
const createError = require('http-errors')

const sendStatusEmail = async ({ user, status }) => {
  const { firstname, email } = user
  const LOGO_URL =
    'https://res.cloudinary.com/dc0xsuayr/image/upload/v1767423539/logo_banner_lybihy.png'
  const checkIcon =
    'https://res.cloudinary.com/dc0xsuayr/image/upload/v1767419385/check_f4qyum.png'
  const xIcon =
    'https://res.cloudinary.com/dc0xsuayr/image/upload/v1767419385/ex_y8r8ug.png'

  const supportEmail = 'chairlesadane.yza@gmail.com'

  // Status-specific content for your application
  const statusConfig = {
    active: {
      subject: 'Account Approved - Ebun Freight Inc.',
      title: 'Account Approved',
      greeting: `Congratulations ${firstname}! Your account has been approved.`,
      body: 'Your registration has been reviewed and approved by our administrators. You can now log in to your account and access all features of Ebun Freight Inc..',
      actionMessage: 'Please log in using your credentials to get started.',
      buttonText: 'Login to Your Account',
      buttonLink: 'https://ebun-tracking.vercel.app',
      icon: checkIcon,
      iconAlt: 'Check Mark Icon'
    },
    rejected: {
      subject: 'Account Registration Update - Ebun Freight Inc.',
      title: 'Registration Not Approved',
      greeting: `Dear ${firstname},`,
      body: 'After careful review, we are unable to approve your account registration at this time.',
      actionMessage:
        'If you believe this is a mistake or would like more information, please contact our support team.',
      buttonText: 'Contact Support',
      buttonLink: `mailto:${supportEmail}`,
      icon: xIcon,
      iconAlt: 'X Mark Icon'
    },
    inactive: {
      subject: 'Account Deactivated - Ebun Freight Inc.',
      title: 'Account Deactivated',
      greeting: `Dear ${firstname},`,
      body: 'Your account has been deactivated. This could be due to prolonged inactivity or administrative action.',
      actionMessage:
        'If you believe this was done in error, please contact our support team to reactivate your account.',
      buttonText: 'Contact Support',
      buttonLink: `mailto:${supportEmail}`,
      icon: xIcon,
      iconAlt: 'Pause Icon'
    },
    revoked: {
      subject: 'Account Access Revoked - Ebun Freight Inc.',
      title: 'Access Revoked',
      greeting: `Dear ${firstname},`,
      body: 'Your account access has been revoked by the administrators.',
      actionMessage:
        'For more information regarding this action, please contact our support team.',
      buttonText: 'Contact Support',
      buttonLink: `mailto:${supportEmail}`,
      icon: xIcon,
      iconAlt: 'Revoked Icon'
    }
  }

  const config = statusConfig[status]

  // Email template optimized for your agricultural services
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${config.title}</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <style>
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          padding: 10px !important;
        }
        .button {
          width: 100% !important;
        }
        .status-icon {
          width: 60px !important;
          height: 60px !important;
        }
        .logo-container {
          flex-direction: column !important;
          gap: 10px !important;
        }
        .logo-text {
          text-align: center !important;
        }
      }
    </style>
  </head>
  <body style="font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background-color: #f7fafc;">
    <div class="container" style="max-width: 600px; margin: auto; padding: 20px 0;">
      <div style="border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
     
       <!-- Header Banner -->
        <div style="background-color: #001e36; text-align: center;">
          <img 
            src="${LOGO_URL}" 
            alt="Ebun Freight Inc. Banner" 
            style="width: 100%; max-width: 600px; height: auto; display: block;"
            class="header-banner"
          />
        </div>
        
        <!-- Body Content -->
        <div style="padding: 32px;">
          <!-- Status Icon -->
          <div style="text-align: center; margin-bottom: 24px;">
            <img 
              src="${config.icon}" 
              alt="${config.iconAlt}"
              style="width: 50px; height: 50px; object-fit: contain; border-radius: 50%;"
              class="status-icon"
            />
            <h2 style="font-size: 28px; font-weight: 600; margin: 0 0 8px 0; color: #1f2937;">
              ${config.title}
            </h2>
            <p style="color: #6b7280; margin: 0;">
              ${
                status === 'active'
                  ? 'Your account is now ready!'
                  : 'Account Status Update'
              }
            </p>
          </div>

          <!-- Greeting -->
          <div style="margin-bottom: 24px;">
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0;">
              ${config.greeting}
            </p>
          </div>

          <!-- Main Message -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #001e36;">
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0;">
              ${config.body}
            </p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${config.buttonLink}" 
               style="background-color: #001e36; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; transition: background-color 0.3s;"
               onmouseover="this.style.backgroundColor='oklch(12.9% 0.042 264.695)'"
               onmouseout="this.style.backgroundColor='#001e36'">
              ${config.buttonText}
            </a>
          </div>

          <!-- Additional Instructions -->
          <div style="margin-bottom: 24px;">
            <p style="font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center; margin: 0;">
              ${config.actionMessage}
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">Best regards,</p>
            <p style="font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Ebun Freight Inc. Team</p>
            
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
              <a href="https://www.yzaagri.tech/" style="color: #001e36; text-decoration: none; font-size: 14px;">Website</a>
              <span style="color: #d1d5db;"> • </span>
              <a href="https://www.facebook.com/profile.php?id=61581659459017" style="color: #001e36; text-decoration: none; font-size: 14px;">Facebook</a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} Ebun Freight Inc.. All rights reserved.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Help Section -->
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">
          Need help? Contact our support team at 
          <a href="mailto: ${supportEmail}" style="color: #001e36; text-decoration: none;"> ${supportEmail}</a>
        </p>
      </div>
    </div>
  </body>
</html>
`

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: `"Ebun Freight Inc." <${process.env.EMAIL_USER}>`,
      to: email,
      subject: config.subject,
      html: htmlTemplate
    })

    console.log(
      `Status email sent successfully to ${email} for status: ${status}`
    )
  } catch (error) {
    console.error('Email sending error:', error)
    throw createError(500, 'Failed to send status email')
  }
}

module.exports = sendStatusEmail
