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
          </head>
      <body style="align-items:center; background-color:#f2f2f2; color:#333; display:flex; font-family:Arial, sans-serif; height:100vh; justify-content:center; margin:0; padding:0" bgcolor="#f2f2f2" height="100vh">

      <div class="container" style="margin-bottom:30px; max-width:600px; padding:20px; position:relative">
          <!-- Header -->
          <div class="header" style="border:2px solid #f2f2f2; border-radius:8px; margin-bottom:20px">
              <img src="https://dream-weaver-gen-ai.vercel.app/images/header.png" alt="DreamWeaver AI Header" style="border-radius:8px; height:auto; max-width:100%" height="auto">
          </div>

          <!-- Background Image -->
          <div class="content-background" style="background-color:#f2f2f2; background-image:url(https://dream-weaver-gen-ai.vercel.app/images/OptimizedLogo.png); background-position:center; background-repeat:no-repeat; background-size:contain; border-radius:8px; height:350px; left:50%; margin-left:-30%; position:relative; top:120px; z-index:100" bgcolor="#f2f2f2" height="350">
            <!-- Content Block -->
            <div class="content" style="background-color:rgba(255, 255, 255, 0.8); border:2px solid #f2f2f2; border-radius:8px; padding:20px; position:absolute; z-index:2" bgcolor="rgba(255, 255, 255, 0.8)">
                <p style="font-size:16px; margin:0 0 10px">Dear User,</p>
                <p style="font-size:16px; margin:0 0 10px">
                    Your story is currently in the queue, and processing will begin shortly. Due to the costs associated with the API, there may be a slight delay. Below are the details of your submission:
                </p>
                <ul style="font-size:16px; list-style-type:none; margin:0 0 20px; padding:0">
                    <li style="margin:5px 0">
                    <strong>Story:</strong> ${story}</li>
                                        <li style="margin:5px 0">
                    <strong>Pages:</strong> ${pages}</li>
                </ul>
                <p style="font-size:16px; margin:0 0 10px">
                    We appreciate your patience and understanding. If you have any questions or need further assistance, feel free to reach out.
                </p>
                <p style="font-size:16px; margin:0 0 10px">
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
