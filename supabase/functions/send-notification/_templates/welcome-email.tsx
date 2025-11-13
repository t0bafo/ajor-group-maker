import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from "https://esm.sh/@react-email/components@0.0.15?deps=react@18.2.0";
import * as React from "https://esm.sh/react@18.2.0";

interface WelcomeEmailProps {
  recipientName: string;
}

export const WelcomeEmail = ({ recipientName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Ajor - Let's get started!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Ajor! 🎉</Heading>
        <Text style={text}>Hi {recipientName},</Text>
        <Text style={text}>
          Thank you for signing up with Google! We're excited to have you join our community-based savings platform.
        </Text>
        <Text style={text}>
          With Ajor, you can:
        </Text>
        <ul style={list}>
          <li style={listItem}>Create or join rotating savings groups</li>
          <li style={listItem}>Track contributions and payouts seamlessly</li>
          <li style={listItem}>Build financial discipline with your community</li>
          <li style={listItem}>Stay organized with automated reminders</li>
        </ul>
        <Text style={text}>
          Ready to get started? Head over to your dashboard to create your first Ajor group or join an existing one.
        </Text>
        <Link
          href="https://ajor-group-maker.lovable.app/dashboard"
          style={button}
        >
          Go to Dashboard
        </Link>
        <Hr style={hr} />
        <Text style={footer}>
          If you have any questions or need help getting started, feel free to reach out to our support team.
        </Text>
        <Text style={footer}>
          Best regards,
          <br />
          The Ajor Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const list = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
  margin: "20px 0",
};

const listItem = {
  marginBottom: "10px",
};

const button = {
  backgroundColor: "#8B5CF6",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 20px",
  margin: "24px 40px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "40px 40px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  padding: "0 40px",
  marginTop: "12px",
};
