import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PayoutNotificationEmailProps {
  recipientName: string;
  groupName: string;
  amount: number;
  cycleLabel: string;
}

export const PayoutNotificationEmail = ({
  recipientName,
  groupName,
  amount,
  cycleLabel,
}: PayoutNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your payout for {cycleLabel} is ready!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Your Payout is Ready!</Heading>
        <Text style={text}>Hi {recipientName},</Text>
        <Text style={text}>
          Congratulations! It's your turn to receive the payout from <strong>{groupName}</strong>.
        </Text>
        <Section style={amountBox}>
          <Text style={amountLabel}>Payout Amount</Text>
          <Text style={amountValue}>${amount.toFixed(2)}</Text>
          <Text style={cycleText}>{cycleLabel}</Text>
        </Section>
        <Text style={text}>
          The host will be coordinating with you to complete the payout. Thank you for participating in this Ajor!
        </Text>
        <Text style={footer}>
          Best regards,
          <br />
          — The Ajor Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PayoutNotificationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 48px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  padding: "0 48px",
};

const amountBox = {
  backgroundColor: "#f0f7ff",
  borderRadius: "12px",
  margin: "32px 48px",
  padding: "32px",
  textAlign: "center" as const,
};

const amountLabel = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const amountValue = {
  color: "#10b981",
  fontSize: "48px",
  fontWeight: "bold",
  margin: "8px 0",
  lineHeight: "1",
};

const cycleText = {
  color: "#666",
  fontSize: "16px",
  margin: "8px 0 0 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0",
  padding: "0 48px",
};
