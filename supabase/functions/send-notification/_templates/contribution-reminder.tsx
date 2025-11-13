import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "https://esm.sh/@react-email/components@0.0.15?deps=react@18.2.0";
import * as React from "https://esm.sh/react@18.2.0";

interface ContributionReminderEmailProps {
  recipientName: string;
  groupName: string;
  amount: number;
  cycleLabel: string;
  dueDate: string;
}

export const ContributionReminderEmail = ({
  recipientName,
  groupName,
  amount,
  cycleLabel,
  dueDate,
}: ContributionReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Reminder: Your contribution for {groupName} is due</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Contribution Reminder</Heading>
        <Text style={text}>Hi {recipientName},</Text>
        <Text style={text}>
          This is a friendly reminder that your contribution for <strong>{groupName}</strong> is coming up.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailsText}>
            <strong>Cycle:</strong> {cycleLabel}
          </Text>
          <Text style={detailsText}>
            <strong>Amount:</strong> ${amount.toFixed(2)}
          </Text>
          <Text style={detailsText}>
            <strong>Due Date:</strong> {dueDate}
          </Text>
        </Section>
        <Text style={text}>
          Please make sure to submit your contribution on time to keep the Ajor running smoothly for everyone.
        </Text>
        <Text style={footer}>
          Thank you for being part of {groupName}!
          <br />
          — The Ajor Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ContributionReminderEmail;

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

const detailsBox = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "24px",
};

const detailsText = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0",
  padding: "0 48px",
};
