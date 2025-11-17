import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6 md:mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Ajor, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Ajor is a community savings platform that facilitates rotating savings and credit associations (ROSCAs). 
              We provide tools for organizing groups, tracking contributions, and managing payouts among members.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">As a user, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Honor your commitments to contribute to your groups</li>
              <li>Respect other members and use the platform responsibly</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the platform for fraudulent or illegal activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3.5 SMS Notifications and Consent</h2>
            <p className="text-muted-foreground mb-4">
              By providing your phone number and joining an Ajor savings group, you consent to receive SMS notifications related to your group activity.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">What You'll Receive</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Payment reminders for upcoming contributions</li>
              <li>Payout confirmations when funds are distributed</li>
              <li>Important group updates from your organizer</li>
              <li>Account security notifications</li>
              <li>Group invitation confirmations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Opt-In Process</h3>
            <p className="text-muted-foreground mb-4">You opt-in to SMS notifications when you:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Toggle "Enable SMS notifications" during profile setup or group joining</li>
              <li>Provide and verify your mobile phone number</li>
              <li>Complete your account registration</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Message Frequency</h3>
            <p className="text-muted-foreground mb-4">
              Message frequency varies by group activity. During active savings cycles, you may receive 1-4 messages per week. 
              Messages are transactional and time-sensitive, related to your financial commitments.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Opt-Out</h3>
            <p className="text-muted-foreground mb-4">You can opt out of SMS notifications at any time by:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Replying STOP to any SMS from Ajor</li>
              <li>Disabling SMS notifications in your account settings</li>
              <li>Contacting your group organizer</li>
              <li>Emailing us at assist@tobiafo.com</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">Costs</h3>
            <p className="text-muted-foreground mb-4">
              Standard message and data rates may apply from your mobile carrier. Ajor does not charge for SMS notifications, 
              but your carrier may charge for text messages.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">Carrier Support</h3>
            <p className="text-muted-foreground mb-4">
              SMS notifications work with major U.S. carriers including AT&T, T-Mobile, Verizon, Sprint, and others. 
              For help, text HELP to any Ajor message or contact assist@tobiafo.com.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">SMS Terms</h3>
            <p className="text-muted-foreground mb-4">By opting in, you agree that:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You are the account holder or have permission to use the phone number</li>
              <li>The phone number you provide is capable of receiving SMS</li>
              <li>You understand standard messaging rates apply</li>
              <li>SMS is for transactional notifications only - we do not send marketing messages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Group Organizer Responsibilities</h2>
            <p className="text-muted-foreground mb-4">Group organizers have additional responsibilities:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Set clear and fair group rules and contribution amounts</li>
              <li>Accurately record all contributions and payouts</li>
              <li>Distribute payouts fairly according to the payout order</li>
              <li>Resolve disputes among group members</li>
              <li>Maintain transparency in all group operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Financial Transactions</h2>
            <p className="text-muted-foreground mb-4">
              Ajor is a platform for organizing and tracking community savings. We do not:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Hold, transfer, or process financial transactions</li>
              <li>Act as a financial institution or provide financial advice</li>
              <li>Guarantee contributions or payouts</li>
              <li>Provide insurance for funds</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              All financial transactions are conducted directly between group members. Users are responsible 
              for managing their own financial arrangements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Platform Availability</h2>
            <p className="text-muted-foreground">
              While we strive to maintain continuous service, we do not guarantee uninterrupted access to Ajor. 
              We may temporarily suspend the service for maintenance, updates, or due to circumstances beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              To the fullest extent permitted by law:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Ajor is provided "as is" without warranties of any kind</li>
              <li>We are not liable for disputes between group members</li>
              <li>We are not responsible for financial losses resulting from platform use</li>
              <li>We are not liable for missed contributions or payout delays</li>
              <li>Our total liability shall not exceed the fees paid to us in the past 12 months</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. User Conduct</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the platform for any illegal purposes</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to hack or compromise platform security</li>
              <li>Create multiple accounts to manipulate the system</li>
              <li>Share false or misleading information</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Account Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate accounts that violate these terms or engage in 
              fraudulent activities. Users may also close their accounts at any time, subject to fulfilling 
              their outstanding group commitments.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of Ajor are owned by us and protected by intellectual 
              property laws. You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Disputes between users should be resolved within their groups. For disputes with Ajor, 
              users agree to first attempt resolution through good faith negotiations. If unresolved, 
              disputes will be subject to binding arbitration under the laws of the United States.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these terms at any time. Continued use of the platform after changes constitutes 
              acceptance of the updated terms. We will notify users of significant changes via email or 
              platform notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of the United States. Any legal action must be brought 
              in the appropriate jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@ajor.app" className="text-primary hover:underline">
                legal@ajor.app
              </a>
            </p>
          </section>

          <section className="mb-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Important Notice:</strong> By using Ajor, you acknowledge that this is a community-based 
              platform for organizing savings groups. All financial arrangements are between members, and Ajor 
              does not guarantee contributions, payouts, or act as a financial intermediary.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
