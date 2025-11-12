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
    <Html>
      <Head />
      <Preview>New join request for {groupName} from {memberName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>🔔 New Join Request</Heading>
          </Section>
          
          <Section style={content}>
            <Text style={greeting}>Hi {recipientName},</Text>
            
            <Text style={paragraph}>
              You have a new join request for your Ajor group <strong>{groupName}</strong>.
            </Text>

            <Section style={infoBox}>
              <Text style={infoTitle}>Member Details:</Text>
              <Text style={infoParagraph}><strong>Name:</strong> {memberName}</Text>
              <Text style={infoParagraph}><strong>Email:</strong> {memberEmail}</Text>
              <Text style={infoParagraph}><strong>Requested:</strong> {requestedAt}</Text>
            </Section>

            {joinMessage && (
              <Section style={messageBox}>
                <Text style={infoTitle}>Message from {memberName}:</Text>
                <Text style={paragraph}>{joinMessage}</Text>
              </Section>
            )}

            <Section style={divider}></Section>

            <Section style={buttonContainer}>
              <Link href="https://ajor-group-maker.lovable.app/dashboard" style={button}>
                Review Request
              </Link>
            </Section>

            <Text style={subtext}>
              <strong>What's next?</strong>
            </Text>
            <Text style={subtext}>
              • Review the member's details and message<br />
              • Approve to add them to your group<br />
              • Or reject if they're not a good fit
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent because you're the host of {groupName} on Ajor.
            </Text>
            <Text style={footerText}>
              © 2025 Ajor. Building wealth through community savings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "0",
  borderRadius: "12px",
  maxWidth: "600px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header = {
  background: "linear-gradient(135deg, #D4AF37 0%, #F4E5C3 100%)",
  padding: "40px 30px",
  textAlign: "center" as const,
};

const heading = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "40px 30px",
};

const greeting = {
  fontSize: "18px",
  marginBottom: "20px",
  color: "#1a1a1a",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#333333",
  margin: "10px 0",
};

const infoBox = {
  backgroundColor: "#f8f9fa",
  borderLeft: "4px solid #D4AF37",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "4px",
};

const infoTitle = {
  fontWeight: "bold",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const infoParagraph = {
  margin: "5px 0",
  color: "#666666",
  fontSize: "14px",
};

const messageBox = {
  backgroundColor: "#fff9e6",
  border: "1px solid #D4AF37",
  padding: "15px",
  margin: "20px 0",
  borderRadius: "8px",
};

const divider = {
  height: "1px",
  background: "linear-gradient(to right, transparent, #D4AF37, transparent)",
  margin: "30px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#D4AF37",
  color: "#1a1a1a",
  padding: "14px 32px",
  borderRadius: "8px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};

const subtext = {
  color: "#666666",
  fontSize: "14px",
  marginTop: "10px",
};

const footer = {
  backgroundColor: "#f8f9fa",
  padding: "30px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#666666",
  fontSize: "14px",
  margin: "5px 0",
};
