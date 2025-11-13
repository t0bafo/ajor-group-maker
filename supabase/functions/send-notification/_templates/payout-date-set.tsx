import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "https://esm.sh/@react-email/components@0.0.15?deps=react@18.2.0";
import * as React from "https://esm.sh/react@18.2.0";

interface PayoutDateSetEmailProps {
  recipientName: string;
  groupName: string;
  cycleNumber: number;
  payoutDate: string;
  amount: number;
}

export const PayoutDateSetEmail = ({
  recipientName,
  groupName,
  cycleNumber,
  payoutDate,
  amount,
}: PayoutDateSetEmailProps) => (
  <Html>
    <Head />
    <Preview>Payout date set for Cycle {cycleNumber} in {groupName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Payout Date Scheduled</Heading>
        <Text style={text}>Hi {recipientName},</Text>
        <Text style={text}>
          Great news! The payout date for Cycle {cycleNumber} in <strong>{groupName}</strong> has been set.
        </Text>
        <Section style={dateBox}>
          <Text style={dateLabel}>Scheduled Payout Date</Text>
          <Text style={dateValue}>{payoutDate}</Text>
          <Text style={amountText}>Amount: ${amount.toFixed(2)}</Text>
        </Section>
        <Text style={text}>
          The host will coordinate with you closer to this date to complete the payout. Make sure all members have contributed by then!
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

export default PayoutDateSetEmail;

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

const dateBox = {
  backgroundColor: "#fff4ed",
  borderRadius: "12px",
  margin: "32px 48px",
  padding: "32px",
  textAlign: "center" as const,
};

const dateLabel = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const dateValue = {
  color: "#ea580c",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "8px 0",
  lineHeight: "1",
};

const amountText = {
  color: "#666",
  fontSize: "18px",
  fontWeight: "600",
  margin: "16px 0 0 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0",
  padding: "0 48px",
};
