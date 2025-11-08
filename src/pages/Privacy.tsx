import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Ajor. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              community savings platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (name, email address, phone number)</li>
              <li>Group membership and contribution data</li>
              <li>Payment and payout records</li>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process contributions and payouts</li>
              <li>Send notifications about your groups and contributions</li>
              <li>Improve our platform and user experience</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Other members in your Ajor groups (as necessary for group operations)</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as necessary to provide our services and comply 
              with legal obligations. Group financial records may be retained for accounting and legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, 
              and improve our services. You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not intended for individuals under 18 years of age. We do not knowingly 
              collect personal information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of significant changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or our data practices, please contact us at{" "}
              <a href="mailto:privacy@ajor.app" className="text-primary hover:underline">
                privacy@ajor.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
