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
  Hr,
} from "https://esm.sh/@react-email/components@0.0.15?deps=react@18.2.0";
import * as React from "https://esm.sh/react@18.2.0";

interface WeeklyDigestEmailProps {
  recipientName: string;
  groupName: string;
  lastWeekStats: {
    totalPaid: number;
    totalMembers: number;
    totalAmount: number;
    avgPaymentTime: string;
  };
  personalStats: {
    contributedSoFar: number;
    payoutWeek: number;
    daysUntilPayout: number;
    paymentStreak: number;
  };
  leaderboard: Array<{
    name: string;
    rank: number;
    paymentTime: string;
  }>;
  thisWeek: {
    payoutRecipient: string;
    cycleNumber: number;
    dueDate: string;
  };
  dashboardLink: string;
}

export const WeeklyDigestEmail = ({
  recipientName,
  groupName,
  lastWeekStats,
  personalStats,
  leaderboard,
  thisWeek,
  dashboardLink,
}: WeeklyDigestEmailProps) => (
  <Html>
    <Head />
    <Preview>Your weekly {groupName} Ajor update</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hey {recipientName}!</Heading>
        <Text style={text}>Here's your weekly update for {groupName}</Text>

        <Section style={section}>
          <Heading style={h2}>Last Week Results</Heading>
          <Text style={text}>
            • {lastWeekStats.totalPaid}/{lastWeekStats.totalMembers} members paid on time
          </Text>
          <Text style={text}>• ${lastWeekStats.totalAmount} collected</Text>
          <Text style={text}>• Average payment time: {lastWeekStats.avgPaymentTime}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>Your Personal Stats</Heading>
          <Text style={text}>Total contributed: ${personalStats.contributedSoFar}</Text>
          <Text style={text}>
            Your payout: Week {personalStats.payoutWeek} ({personalStats.daysUntilPayout} days away)
          </Text>
          <Text style={text}>Payment streak: {personalStats.paymentStreak} weeks</Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>Group Leaderboard</Heading>
          {leaderboard.map((member, i) => (
            <Text key={i} style={text}>
              {member.rank}. {member.name} - {member.paymentTime}
            </Text>
          ))}
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>This Week</Heading>
          <Text style={text}>
            {thisWeek.payoutRecipient} receives ${lastWeekStats.totalAmount} payout
          </Text>
          <Text style={text}>Cycle {thisWeek.cycleNumber} - Payment due: {thisWeek.dueDate}</Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href={dashboardLink} style={button}>
            View Full Dashboard
          </Link>
        </Section>

        <Text style={footer}>Keep up the great work!</Text>
      </Container>
    </Body>
  </Html>
);

export default WeeklyDigestEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const section = {
  margin: '24px 0',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '24px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};
