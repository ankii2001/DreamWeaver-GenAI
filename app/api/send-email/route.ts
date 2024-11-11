import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { story, pages, email } = await req.json();

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");

  if (!user || !pass) {
    console.error("Missing email environment variables");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: user,
    to: email,
    subject: "New Story Submission!!",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DreamWeaver AI - Story Submission</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  background-color: #f2f2f2;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .container {
                  max-width: 600px;
                  position: relative;
                  padding: 20px;
              }
              .header {
                  margin-bottom: 20px;
                  border: 2px solid #f2f2f2;
                  border-radius: 8px;
              }
              .header img {
                  max-width: 100%;
                  border-radius: 8px;
                  height: auto;
              }
              .content-background {
                  position: relative;
                  top: 120px;
                  left: 50%;
                  margin-left: -30%; /* Used margin instead of transform */
                  height: 300px;
                  background-image: url('https://dream-weaver-gen-ai.vercel.app/images/logo.png');
                  background-size: contain;
                  background-repeat: no-repeat;
                  background-position: center;
                  z-index: 100;
                  background-color: #f2f2f2; /* Fallback background color */
              }
              .content {
                  position: absolute;
                  padding: 20px;
                  border-radius: 8px;
                  background-color: rgba(255, 255, 255, 0.8);
                  border: 2px solid #f2f2f2;
                  z-index: 2;
              }
              .content h2 {
                  color: #5F6368;
                  margin: 0 0 10px;
              }
              .content p {
                  font-size: 16px;
                  margin: 0 0 10px;
              }
              .content ul {
                  list-style-type: none;
                  padding: 0;
                  font-size: 16px;
                  margin: 0 0 20px;
              }
              .content ul li {
                  margin: 5px 0;
              }
          </style>
      </head>
      <body>

      <div class="container">
          <!-- Header -->
          <div class="header">
              <img src="https://dream-weaver-gen-ai.vercel.app/images/header.png" alt="DreamWeaver AI Header">
          </div>

          <!-- Background Image -->
          <div class="content-background">
            <!-- Content Block -->
            <div class="content">
                <p>Dear User,</p>
                <p>
                    Your story is currently in the queue, and processing will begin shortly. Due to the costs associated with the API, there may be a slight delay. Below are the details of your submission:
                </p>
                <ul>
                    <li><strong>Story:</strong> ${story}</li>
                    <li><strong>Pages:</strong> ${pages}</li>
                </ul>
                <p>
                    We appreciate your patience and understanding. If you have any questions or need further assistance, feel free to reach out.
                </p>
                <p>
                    Best regards,<br>
                    <strong>The DreamWeaver Team</strong>
                </p>
            </div>
          </div>
      </div>

      </body>
      </html>
    `,

    // attachments: [
    //   {
    //     filename: "logo.png",
    //     path: "https://dream-weaver-gen-ai.vercel.app/images/logo.png", // Background image
    //     cid: "background_image", // CID for backdrop image
    //   },
    //   {
    //     filename: "header.png",
    //     path: "https://dream-weaver-gen-ai.vercel.app/images/header.png", // Header image
    //     cid: "header_image", // CID for header image
    //   },
    // ],
  };


  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
