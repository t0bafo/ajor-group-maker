import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import logoImage from "@/assets/ajor-logo.png";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImage} alt="Ajor Logo" className="w-10 h-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-cta to-accent bg-clip-text text-transparent">
                Ajor
              </h1>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary via-cta to-accent mb-4">
              <HelpCircle className="h-8 w-8 text-card" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Ajor and rotating savings groups
            </p>
          </div>

          {/* Getting Started */}
          <Card className="p-6 shadow-[var(--shadow-medium)]">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-ajor">
                <AccordionTrigger className="text-left">
                  What is Ajor?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Ajor is a digital platform for rotating savings groups, based on the cultural traditions of <span className="font-semibold text-foreground">ajo</span> (West African) and <span className="font-semibold text-foreground">susu</span> (Caribbean). Members pool money together regularly, and each person takes turns receiving the full pot. It's a community-driven way to save and access larger sums of money.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-it-works">
                <AccordionTrigger className="text-left">
                  How do rotating savings work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>A group of 4-20 people agree to contribute the same amount regularly (weekly, bi-weekly, or monthly)</li>
                    <li>Each cycle, one member receives the total pot collected from everyone</li>
                    <li>The rotation continues until every member has received their payout</li>
                    <li>Everyone pays for the <span className="font-semibold text-foreground">full duration</span>, even after receiving their payout</li>
                  </ol>
                  <p className="mt-3">
                    <span className="font-semibold text-foreground">Example:</span> 6 friends contribute $100 monthly. Each month, one person receives $600 (6 × $100). After 6 months, everyone has received $600 and paid $600.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="is-safe">
                <AccordionTrigger className="text-left">
                  Is Ajor safe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Ajor is a <span className="font-semibold text-foreground">coordination tool</span>, not a bank. We help you organize your group, but we don't hold or transfer money. Your safety depends on:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Inviting people you trust (friends, family, close colleagues)</li>
                    <li>Clear communication about terms and expectations</li>
                    <li>The host keeping accurate records of contributions and payouts</li>
                  </ul>
                  <p className="mt-3">
                    Think of it like a group chat for finances—we provide the tools, but the trust comes from your relationships.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="first-group">
                <AccordionTrigger className="text-left">
                  How do I create my first group?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Sign up or log in to Ajor</li>
                    <li>Click "Create New Ajor" from your dashboard</li>
                    <li>Set your group details: name, contribution amount, frequency, and number of members</li>
                    <li>Decide the payout rotation order</li>
                    <li>Invite members using the unique invite code</li>
                    <li>Once all members join and agree, start the cycle</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Managing Groups */}
          <Card className="p-6 shadow-[var(--shadow-medium)]">
            <h2 className="text-2xl font-bold mb-4">Managing Groups</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="invite-members">
                <AccordionTrigger className="text-left">
                  How do I invite members?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Each group has a unique 9-character invite code. Share this code with people you want to invite. They can:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Enter the code on the "Join Group" page</li>
                    <li>Use a direct invite link (click "Invite Members" on your group dashboard)</li>
                  </ul>
                  <p className="mt-3 font-semibold text-foreground">
                    Important: Only invite people you trust and who can commit to the full cycle.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="someone-doesnt-pay">
                <AccordionTrigger className="text-left">
                  What if someone doesn't pay?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  As the host, you can:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Use the "Mark Late Payment" feature to track who's behind</li>
                    <li>Send reminders through the notification system</li>
                    <li>Have a group conversation to understand the situation</li>
                  </ul>
                  <p className="mt-3">
                    This is why <span className="font-semibold text-foreground">trust is crucial</span>. Choose members who are reliable and communicate openly. Consider setting a grace period (e.g., 3 days) for late payments.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="change-payout-order">
                <AccordionTrigger className="text-left">
                  Can I change the payout order?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  The payout order can be customized <span className="font-semibold text-foreground">before starting the cycle</span>. Once the cycle begins, you cannot change it to maintain fairness and trust. If you need to make changes:
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Discuss with all members and get unanimous agreement</li>
                    <li>Archive the current group</li>
                    <li>Create a new group with the updated order</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="end-early">
                <AccordionTrigger className="text-left">
                  Can I end a cycle early?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes, but it requires <span className="font-semibold text-foreground">unanimous agreement</span> from all members. Early termination can be unfair to those who haven't received their payout yet. If you must end early:
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Discuss with all members openly</li>
                    <li>Calculate what each person has paid vs. received</li>
                    <li>Agree on how to settle remaining balances</li>
                    <li>Archive the group once settled</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Contributions & Payouts */}
          <Card className="p-6 shadow-[var(--shadow-medium)]">
            <h2 className="text-2xl font-bold mb-4">Contributions & Payouts</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="record-contribution">
                <AccordionTrigger className="text-left">
                  How do I record a contribution?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  As the host, you record contributions after receiving payment:
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Go to your group dashboard</li>
                    <li>Click "Record Contribution"</li>
                    <li>Select the member and confirm the amount</li>
                    <li>Add payment method and any notes (optional)</li>
                    <li>Click "Record Payment"</li>
                  </ol>
                  <p className="mt-3 font-semibold text-foreground">
                    Only record contributions after you've actually received the money!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="when-payouts">
                <AccordionTrigger className="text-left">
                  When do payouts happen?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Payouts occur according to the rotation order you set. As the host:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Monitor the cycle progress to see when 100% of contributions are collected</li>
                    <li>Send the full pot to the member whose turn it is</li>
                    <li>Record the payout in the system</li>
                  </ul>
                  <p className="mt-3">
                    <span className="font-semibold text-foreground">Tip:</span> Many groups set a specific payout date (e.g., "every 1st of the month") to maintain consistency.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="miss-payment">
                <AccordionTrigger className="text-left">
                  What if I miss a payment?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  If you miss a payment:
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Contact your host immediately to explain the situation</li>
                    <li>Arrange to pay as soon as possible (plus any agreed late fees)</li>
                    <li>Understand that repeated late payments may affect trust and future participation</li>
                  </ol>
                  <p className="mt-3">
                    Most groups set a grace period (e.g., 3-5 days). Communicate early if you're facing difficulties—your group may be willing to work with you.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pay-ahead">
                <AccordionTrigger className="text-left">
                  Can I pay ahead?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes! Paying ahead can be helpful for:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Members who travel frequently</li>
                    <li>Those who prefer to pay in bulk</li>
                    <li>Peace of mind knowing contributions are covered</li>
                  </ul>
                  <p className="mt-3">
                    The host can record multiple contributions for future cycles. Just note which cycles each payment covers.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Trust & Safety */}
          <Card className="p-6 shadow-[var(--shadow-medium)]">
            <h2 className="text-2xl font-bold mb-4">Trust & Safety</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dispute">
                <AccordionTrigger className="text-left">
                  What if there's a dispute?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Ajor provides records and transparency, but we cannot mediate disputes. If conflicts arise:
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Review the contribution and payout history in your dashboard</li>
                    <li>Have an open conversation with all group members</li>
                    <li>Refer to any written agreements made at the start</li>
                    <li>Consider involving a neutral third party if needed</li>
                  </ol>
                  <p className="mt-3 font-semibold text-foreground">
                    Prevention is key: Set clear expectations before starting and only invite people you trust.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hold-money">
                <AccordionTrigger className="text-left">
                  Does Ajor hold money?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">No.</span> Ajor does not hold, transfer, or manage money. We are a coordination and record-keeping tool. The host:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Collects contributions directly from members (cash, bank transfer, mobile payment, etc.)</li>
                    <li>Distributes payouts directly to members</li>
                    <li>Uses Ajor to track and record all transactions</li>
                  </ul>
                  <p className="mt-3">
                    This keeps the tradition authentic while adding digital transparency.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="host-responsibilities">
                <AccordionTrigger className="text-left">
                  What are my responsibilities as host?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  As host, you're the group's organizer and record-keeper:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><span className="font-semibold text-foreground">Collect contributions</span> from all members on time</li>
                    <li><span className="font-semibold text-foreground">Distribute payouts</span> to the correct member each cycle</li>
                    <li><span className="font-semibold text-foreground">Keep accurate records</span> of all transactions in Ajor</li>
                    <li><span className="font-semibold text-foreground">Communicate clearly</span> with members about due dates and status</li>
                    <li><span className="font-semibold text-foreground">Resolve issues</span> fairly and transparently</li>
                  </ul>
                  <p className="mt-3">
                    Being a host requires responsibility and trustworthiness—your group depends on you!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="leave-group">
                <AccordionTrigger className="text-left">
                  Can I leave a group mid-cycle?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Leaving mid-cycle is <span className="font-semibold text-foreground">strongly discouraged</span> as it disrupts the entire group. However, if you must leave:
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Discuss with the host and all members</li>
                    <li>If you've already received your payout, you're still obligated to complete all remaining payments</li>
                    <li>If you haven't received your payout, the group must decide how to handle your exit</li>
                    <li>Consider finding a replacement member to take your spot</li>
                  </ol>
                  <p className="mt-3">
                    <span className="font-semibold text-foreground">Remember:</span> When you join, you're making a commitment to the full cycle.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* CTA Section */}
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 via-cta/5 to-accent/5 border-primary/20 shadow-[var(--shadow-medium)]">
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Ready to start your savings journey? Create your first Ajor today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ajor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
