import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "https://esm.sh/@react-email/components@0.0.15?deps=react@18.2.0";
import * as React from "https://esm.sh/react@18.2.0";

interface MemberActivityEmailProps {
  recipientName: string;
  groupName: string;
  memberName: string;
  activityType: "joined" | "left";
}

export const MemberActivityEmail = ({
  recipientName,
  groupName,
  memberName,
  activityType,
}: MemberActivityEmailProps) => {
  const isJoined = activityType === "joined";
  
  return (
    <Html>
      <Head />
      <Preview>
        {memberName} {isJoined ? "joined" : "left"} {groupName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isJoined ? "👋 New Member" : "Member Left"}
          </Heading>
          <Text style={text}>Hi {recipientName},</Text>
          {isJoined ? (
            <Text style={text}>
              <strong>{memberName}</strong> has joined <strong>{groupName}</strong>! Welcome them to the group.
            </Text>
          ) : (
            <Text style={text}>
              <strong>{memberName}</strong> has left <strong>{groupName}</strong>.
            </Text>
          )}
          <Text style={text}>
            {isJoined 
              ? "The rotation order and contribution schedule may be updated to include the new member."
              : "The rotation order will be adjusted accordingly."
            }
          </Text>
          <Text style={footer}>
            — The Ajor Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default MemberActivityEmail;

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

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0",
  padding: "0 48px",
};
