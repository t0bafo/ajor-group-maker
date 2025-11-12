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
} from "https://esm.sh/@react-email/components@0.0.22";
import * as React from "https://esm.sh/react@18.3.1";

interface MemberInvitedEmailProps {
  recipientName: string;
  recipientEmail: string;
  groupName: string;
  hostName: string;
  contributionAmount: number;
  frequency: string;
  inviteLink: string;
  inviteCode: string;
}

export const MemberInvitedEmail = ({
  recipientName,
  recipientEmail,
  groupName,
  hostName,
  contributionAmount,
  frequency,
  inviteLink,
  inviteCode,
}: MemberInvitedEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to join {groupName} on Ajor</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're Invited to Join {groupName}</Heading>
        
        <Text style={text}>
          Hi {recipientName},
        </Text>
        
        <Text style={text}>
          <strong>{hostName}</strong> has invited you to join <strong>{groupName}</strong>, 
          a trusted savings circle on Ajor.
        </Text>

        <Section style={detailsBox}>
          <Text style={detailsTitle}>Group Details</Text>
          <Text style={detailsText}>
            <strong>Contribution Amount:</strong> ${contributionAmount.toFixed(2)}
          </Text>
          <Text style={detailsText}>
            <strong>Frequency:</strong> {frequency}
          </Text>
          <Text style={detailsText}>
            <strong>Invited Email:</strong> {recipientEmail}
          </Text>
        </Section>

        <Section style={ctaSection}>
          <Link
            href={inviteLink}
            style={button}
          >
            Join {groupName}
          </Link>
        </Section>

        <Section style={codeSection}>
          <Text style={text}>Or use this join code:</Text>
          <Text style={code}>{inviteCode}</Text>
        </Section>

        <Text style={text}>
          Ajor is a modern take on rotating savings and credit associations (ROSCAs), 
          rooted in African tradition. Each member contributes regularly, and the total 
          payout rotates to a different member each cycle.
        </Text>

        <Text style={footer}>
          If you didn't expect this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MemberInvitedEmail;

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 20px 48px",
  marginBottom: "64px",
  borderRadius: "8px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "40px 0",
  padding: "0",
  lineHeight: "1.3",
};

const text = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const detailsBox = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e5e5e5",
};

const detailsTitle = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const detailsText = {
  color: "#525252",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "8px 0",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#D4AF37",
  borderRadius: "6px",
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const codeSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const code = {
  backgroundColor: "#f4f4f4",
  borderRadius: "6px",
  border: "1px solid #D4AF37",
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "700",
  letterSpacing: "4px",
  padding: "16px",
  display: "inline-block",
  fontFamily: "monospace",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid #e5e5e5",
};
