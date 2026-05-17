import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)

EMAIL_SUBJECT_RESET = os.getenv("EMAIL_SUBJECT_RESET", "Reset Your Password")
EMAIL_SUBJECT_VERIFY = os.getenv("EMAIL_SUBJECT_VERIFY", "Verify Your Email")


# ================= COMMON MAIL SENDER =================
def send_email(to_email: str, subject: str, text_content: str, html_content: str):
    try:
        message = MIMEMultipart("alternative")
        message["From"] = EMAIL_FROM
        message["To"] = to_email
        message["Subject"] = subject

        message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_FROM, to_email, message.as_string())

    except Exception as e:
        raise Exception(f"Email sending failed: {str(e)}")


# ================= RESET PASSWORD EMAIL =================
def send_reset_email(email: str, reset_link: str):

    text_content = f"""
You requested a password reset.

Click the link below:
{reset_link}

This link will expire in 15 minutes.
If you did not request this, ignore this email.
"""

    html_content = f"""
<html>
    <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>
            <a href="{reset_link}" 
               style="background-color:#4CAF50;color:white;padding:10px 15px;text-decoration:none;">
               Reset Password
            </a>
        </p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
    </body>
</html>
"""

    send_email(email, EMAIL_SUBJECT_RESET, text_content, html_content)


# ================= EMAIL VERIFICATION =================
def send_verification_email(email: str, verify_link: str):

    text_content = f"""
Welcome!

Please verify your email using the link below:
{verify_link}

If you did not create this account, ignore this email.
"""

    html_content = f"""
<html>
    <body>
        <h2>Welcome to Our Platform 🚀</h2>
        <p>Thanks for registering!</p>
        <p>
            <a href="{verify_link}" 
               style="background-color:#2196F3;color:white;padding:10px 15px;text-decoration:none;">
               Verify Email
            </a>
        </p>
        <p>If you did not create this account, ignore this email.</p>
    </body>
</html>
"""

    send_email(email, EMAIL_SUBJECT_VERIFY, text_content, html_content)