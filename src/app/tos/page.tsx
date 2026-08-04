import Image from "next/image";
import Link from "next/link";

export default function TOSPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "48px 24px" }}>
      {/* Header nav */}
      <div style={{
        maxWidth: 760, margin: "0 auto 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={26} height={26} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>SyncAuth</span>
        </Link>
        <Link href="/login" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
          Back to login
        </Link>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Title */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Terms of Service
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 13.5 }}>
            Last updated: August 2026 · Scroll down for the Privacy Policy.
          </p>
          <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 8 }}>
            By using this website, you accept these terms of use. Please read them carefully.
          </p>
        </div>

        <Section title="Your Acceptance of this Agreement">
          <p>The following terms and conditions constitute a legal agreement entered into by and between you and SyncAuth.</p>
          <p>BY USING OUR SERVICE, YOU:</p>
          <ul>
            <li>Accept and agree to be bound and comply with this Agreement;</li>
            <li>Agree that if you access the service from a jurisdiction where it is not permitted, you do so at your own risk.</li>
          </ul>
        </Section>

        <Section title="Updates to this Agreement">
          <p>We may revise this Agreement and the service at any time without notice. All revisions are effective immediately upon posting and apply to all continued use of the service.</p>
        </Section>

        <Section title="Your Responsibilities">
          <p>You are required to ensure that all persons who access the service are aware of and comply with this Agreement. All information you provide must be correct, current, and complete.</p>
          <p>Any username, password, or other credential must be treated as confidential. You must not disclose it to any other person. Notify us immediately of any unauthorized access to your account. You are responsible for any password misuse or unauthorized access.</p>
        </Section>

        <Section title="Prohibited Activities">
          <p>You are prohibited from attempting to circumvent or violate the security of our services, including but not limited to:</p>
          <ul>
            <li>Flooding or spamming API endpoints;</li>
            <li>Interfering with the operation of the service or servers;</li>
            <li>Performing security scans of the service or any connected network or server;</li>
            <li>Attempting to reverse engineer, decompile, disassemble, pirate, modify, or otherwise reduce the functionality of scripts protected by SyncAuth;</li>
            <li>Sharing accounts, credentials, or license keys with unauthorized parties;</li>
            <li>Helping or encouraging others to perform any of the above;</li>
            <li>Trying to gain unauthorized access to the service or any connected network;</li>
            <li>Sending malicious packets or engaging in any form of attack.</li>
          </ul>
          <p>If you perform or help others perform any prohibited activity, we reserve the right to, in our sole discretion:</p>
          <ul>
            <li>Suspend or terminate your access to this service;</li>
            <li>Delete or disable any script, key, or resource you have created;</li>
            <li>Blacklist your IP address or HWID from our network;</li>
            <li>Pursue any other remedies we deem appropriate.</li>
          </ul>
        </Section>

        <Section title="No Account Sharing">
          <p>Each SyncAuth account is for the sole use of the individual who registered it. Sharing access to your account, dashboard, or any license keys with other individuals is strictly prohibited. Accounts found to be shared may be suspended without warning or refund.</p>
        </Section>

        {/* Divider */}
        <div style={{ margin: "40px 0", height: 1, background: "var(--border)" }} />

        {/* Privacy Policy */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>
            Privacy Policy
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 13.5 }}>
            At SyncAuth we value your privacy and the importance of safeguarding your data.
          </p>
        </div>

        <Section title="Introduction">
          <p>This Privacy Policy describes our privacy practices for the activities set out below. &ldquo;Personal Data&rdquo; refers to any information that, on its own or in combination with other available information, can distinguish an individual.</p>
          <p>This Policy applies to the SyncAuth website, API, and protected scripts. It does not apply to third-party applications or services linked from our platform.</p>
          <p>This policy applies when you:</p>
          <ul>
            <li>Use our application and services as an authorized user;</li>
            <li>Visit any SyncAuth website;</li>
            <li>Run a script protected by SyncAuth.</li>
          </ul>
        </Section>

        <Section title="Data We Collect">
          <p><strong style={{ color: "var(--text-1)" }}>For script users:</strong></p>
          <ul>
            <li><strong>IP addresses</strong> — Required as part of access control. Not shared with script owners unless you trigger an anti-tamper measure or the owner has implemented their own logger.</li>
            <li><strong>Timestamps</strong> — The time when you executed the script. Delivered to the script owner if they set up webhook log delivery.</li>
            <li><strong>HWID</strong> — A hash of device properties containing no sensitive information. Used for access control as it is mostly unique per device.</li>
            <li><strong>Display name / username</strong> — Used to identify authenticated users within the dashboard.</li>
          </ul>
          <p>❌ Roblox usernames, account IDs, in-game stats, and device details are <strong>not</strong> collected.</p>

          <p style={{ marginTop: 14 }}><strong style={{ color: "var(--text-1)" }}>For developers:</strong></p>
          <ul>
            <li>IP addresses, timestamps, and data provided when adding users;</li>
            <li>Email address used for registration;</li>
            <li>Any data you provide via the dashboard (e.g. script names, webhooks, user notes).</li>
          </ul>
        </Section>

        <Section title="Service Providers and Third Parties">
          <p>We use third-party service providers for webhook log delivery. We share your data with these parties only as needed:</p>
          <ul>
            <li>IP address and HWID of your users (for webhook log delivery — IP only if an anti-tamper measure is triggered);</li>
            <li>Webhook delivery is optional and can be disabled by the script owner.</li>
          </ul>
          <p>This information may be sent to third-party webhook endpoints configured by you.</p>
        </Section>

        <Section title="Cookie Policy">
          <p>Like most websites, we use cookies to collect information. Cookies are small files stored on your computer or mobile device to make websites work correctly.</p>
          <p>By visiting our website, you consent to the use of cookies. These may include session tokens and user preferences. You can delete cookies in your browser settings or by logging out of your account.</p>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>© 2026 SyncAuth. All rights reserved.</span>
          <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-brands fa-discord" style={{ color: "#5865f2" }} />
            Discord Community
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 12, letterSpacing: "-0.01em" }}>
        {title}
      </h3>
      <div style={{
        color: "var(--text-2)",
        fontSize: 13.5,
        lineHeight: 1.7,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        {children}
      </div>
      <style>{`
        ul { padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
        li { color: var(--text-2); font-size: 13.5px; line-height: 1.6; }
      `}</style>
    </div>
  );
}
