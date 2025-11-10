import React from "https://esm.sh/react@18.3.1";

interface RequestApprovedEmailProps {
  recipientName: string;
  groupName: string;
  hostName: string;
  welcomeMessage?: string;
  contributionAmount: number;
  frequency: string;
}

export const RequestApprovedEmail = ({
  recipientName,
  groupName,
  hostName,
  welcomeMessage,
  contributionAmount,
  frequency,
}: RequestApprovedEmailProps) => {
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
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
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
          .welcome-box {
            background-color: #f0fdf4;
            border: 2px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .welcome-box p {
            margin: 5px 0;
            color: #1a1a1a;
            font-style: italic;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 25px 0;
          }
          .info-card {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .info-card strong {
            display: block;
            color: #666666;
            font-size: 12px;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .info-card .value {
            color: #1a1a1a;
            font-size: 24px;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            color: #ffffff;
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
            background: linear-gradient(to right, transparent, #10b981, transparent);
            margin: 30px 0;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🎉 Request Approved!</h1>
          </div>
          
          <div className="content">
            <p className="greeting">Hi {recipientName},</p>
            
            <p>
              Great news! {hostName} has approved your request to join <strong>{groupName}</strong>.
            </p>

            {welcomeMessage && (
              <div className="welcome-box">
                <strong>Message from {hostName}:</strong>
                <p>"{welcomeMessage}"</p>
              </div>
            )}

            <div className="divider"></div>

            <h3 style={{ color: "#1a1a1a", marginTop: "30px" }}>Group Details</h3>
            <div className="info-grid">
              <div className="info-card">
                <strong>Contribution</strong>
                <div className="value">${contributionAmount}</div>
              </div>
              <div className="info-card">
                <strong>Frequency</strong>
                <div className="value" style={{ fontSize: "18px", textTransform: "capitalize" }}>{frequency}</div>
              </div>
            </div>

            <p style={{ textAlign: "center", margin: "30px 0" }}>
              <a href="https://your-app-url.com/dashboard" className="cta-button">
                View Group Dashboard
              </a>
            </p>

            <p style={{ color: "#666666", fontSize: "14px" }}>
              <strong>What's next?</strong>
            </p>
            <ul style={{ color: "#666666", fontSize: "14px", marginLeft: "20px" }}>
              <li>Review the group dashboard and payout schedule</li>
              <li>Mark your calendar for contribution dates</li>
              <li>Connect with other group members</li>
              <li>Prepare for your first contribution</li>
            </ul>
          </div>

          <div className="footer">
            <p>
              Welcome to {groupName}! Let's build wealth together.
            </p>
            <p style={{ marginTop: "10px" }}>
              © 2025 Ajor. Building wealth through community savings.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};
