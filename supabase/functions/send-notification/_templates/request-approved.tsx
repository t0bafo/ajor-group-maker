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
    <Html>
      <Head />
      <Preview>Your request to join {groupName} was approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>🎉 Request Approved!</Heading>
          </Section>
          
          <Section style={content}>
            <Text style={greeting}>Hi {recipientName},</Text>
            
            <Text style={paragraph}>
              Great news! {hostName} has approved your request to join <strong>{groupName}</strong>.
            </Text>

            {welcomeMessage && (
              <Section style={welcomeBox}>
                <Text style={welcomeTitle}>Message from {hostName}:</Text>
                <Text style={welcomeMessageStyle}>"{welcomeMessage}"</Text>
              </Section>
            )}

            <Section style={divider}></Section>

            <Heading as="h3" style={subheading}>Group Details</Heading>
            <Section style={infoGrid}>
              <Section style={infoCard}>
                <Text style={infoLabel}>Contribution</Text>
                <Text style={infoValue}>${contributionAmount}</Text>
              </Section>
              <Section style={infoCard}>
                <Text style={infoLabel}>Frequency</Text>
                <Text style={infoValueSmall}>{frequency}</Text>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Link href="https://ajor-group-maker.lovable.app/dashboard" style={button}>
                View Group Dashboard
              </Link>
            </Section>

            <Text style={subtext}>
              <strong>What's next?</strong>
            </Text>
            <Text style={subtext}>
              • Review the group dashboard and payout schedule<br />
              • Mark your calendar for contribution dates<br />
              • Connect with other group members<br />
              • Prepare for your first contribution
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Welcome to {groupName}! Let's build wealth together.
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
  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
  padding: "40px 30px",
  textAlign: "center" as const,
};

const heading = {
  color: "#ffffff",
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

const welcomeBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #10b981",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "8px",
};

const welcomeTitle = {
  fontWeight: "bold",
  color: "#1a1a1a",
  marginBottom: "8px",
};

const welcomeMessageStyle = {
  color: "#1a1a1a",
  fontStyle: "italic",
  margin: "5px 0",
};

const divider = {
  height: "1px",
  background: "linear-gradient(to right, transparent, #10b981, transparent)",
  margin: "30px 0",
};

const subheading = {
  color: "#1a1a1a",
  fontSize: "20px",
  marginTop: "30px",
  marginBottom: "15px",
};

const infoGrid = {
  display: "flex",
  gap: "15px",
  margin: "25px 0",
};

const infoCard = {
  backgroundColor: "#f8f9fa",
  padding: "15px",
  borderRadius: "8px",
  textAlign: "center" as const,
  flex: "1",
};

const infoLabel = {
  color: "#666666",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  fontWeight: "bold",
  marginBottom: "5px",
};

const infoValue = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "bold",
};

const infoValueSmall = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "bold",
  textTransform: "capitalize" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#10b981",
  color: "#ffffff",
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
