import React from "https://esm.sh/react@18.3.1";

interface JoinRequestEmailProps {
  recipientName: string;
  groupName: string;
  memberName: string;
  memberEmail: string;
  joinMessage?: string;
  requestedAt: string;
}

export const JoinRequestEmail = ({
  recipientName,
  groupName,
  memberName,
  memberEmail,
  joinMessage,
  requestedAt,
}: JoinRequestEmailProps) => {
  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: #1a1a1a;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1a1a1a;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #D4AF37;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-box strong {
            display: block;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          .info-box p {
            margin: 5px 0;
            color: #666666;
          }
          .message-box {
            background-color: #fff9e6;
            border: 1px solid #D4AF37;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .message-box strong {
            display: block;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%);
            color: #1a1a1a;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666666;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #D4AF37, transparent);
            margin: 30px 0;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🔔 New Join Request</h1>
          </div>
          
          <div className="content">
            <p className="greeting">Hi {recipientName},</p>
            
            <p>
              You have a new join request for your Ajor group <strong>{groupName}</strong>.
            </p>

            <div className="info-box">
              <strong>Member Details:</strong>
              <p><strong>Name:</strong> {memberName}</p>
              <p><strong>Email:</strong> {memberEmail}</p>
              <p><strong>Requested:</strong> {requestedAt}</p>
            </div>

            {joinMessage && (
              <div className="message-box">
                <strong>Message from {memberName}:</strong>
                <p>{joinMessage}</p>
              </div>
            )}

            <div className="divider"></div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="https://your-app-url.com/dashboard" className="cta-button">
                Review Request
              </a>
            </p>

            <p style="color: #666666; font-size: 14px;">
              <strong>What's next?</strong>
            </p>
            <ul style="color: #666666; font-size: 14px; margin-left: 20px;">
              <li>Review the member's details and message</li>
              <li>Approve to add them to your group</li>
              <li>Or reject if they're not a good fit</li>
            </ul>
          </div>

          <div className="footer">
            <p>
              This email was sent because you're the host of {groupName} on Ajor.
            </p>
            <p style="margin-top: 10px;">
              © 2025 Ajor. Building wealth through community savings.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};
