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

interface GroupCreatedEmailProps {
  recipientName: string;
  groupName: string;
  contributionAmount: number;
  frequency: string;
  numberOfMembers: number;
  inviteCode: string;
}

export const GroupCreatedEmail = ({
  recipientName,
  groupName,
  contributionAmount,
  frequency,
  numberOfMembers,
  inviteCode,
}: GroupCreatedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Ajor group "{groupName}" has been created!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Ajor is Ready!</Heading>
        <Text style={text}>Hi {recipientName},</Text>
        <Text style={text}>
          Congratulations! Your Ajor group <strong>{groupName}</strong> has been successfully created.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailsText}>
            <strong>Group Name:</strong> {groupName}
          </Text>
          <Text style={detailsText}>
            <strong>Contribution Amount:</strong> ${contributionAmount.toFixed(2)}
          </Text>
          <Text style={detailsText}>
            <strong>Frequency:</strong> {frequency}
          </Text>
          <Text style={detailsText}>
            <strong>Number of Members:</strong> {numberOfMembers}
          </Text>
          <Text style={codeText}>
            <strong>Invite Code:</strong> {inviteCode}
          </Text>
        </Section>
        <Text style={text}>
          <strong>Next Steps:</strong>
        </Text>
        <Text style={text}>
          1. Share the invite code with your trusted circle
        </Text>
        <Text style={text}>
          2. Once all members join, start the Ajor to begin contributions
        </Text>
        <Text style={text}>
          3. Manage contributions and payouts from your dashboard
        </Text>
        <Text style={footer}>
          Thank you for choosing Ajor to manage your savings circle!
        </Text>
        <Text style={footer}>
          — The Ajor Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default GroupCreatedEmail;

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

const codeText = {
  ...detailsText,
  backgroundColor: "#e0e7ff",
  padding: "12px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "16px",
  fontWeight: "bold",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0",
  padding: "0 48px",
};
