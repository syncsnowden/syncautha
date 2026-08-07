import Image from "next/image";
import Link from "next/link";

export default function TOSPage() {
  const updated = "August 4, 2026";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "48px 24px" }}>
      {/* Nav */}
      <div style={{ maxWidth: 740, margin: "0 auto 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/syncauthlogo.png" alt="SyncAuth" width={26} height={26} style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>SyncAuth</span>
        </Link>
        <Link href="/login" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
          Back
        </Link>
      </div>

      <article style={{ maxWidth: 740, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, background: "var(--bg-2)", border: "1px solid var(--border-2)", fontSize: 11.5, color: "var(--text-3)", marginBottom: 20 }}>
            <i className="fa-solid fa-file-shield" style={{ fontSize: 10 }} />
            Legal · Updated {updated}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.2 }}>
            Terms of Service &amp; Privacy Policy
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7, maxWidth: 580 }}>
            These terms govern your access to and use of SyncAuth. By creating an account or using our service in any way, you agree to everything written here. If you don&apos;t agree, don&apos;t use SyncAuth.
          </p>
        </div>

        {/* ToS sections */}
        <Block icon="fa-handshake" label="Agreement">
          <p>
            These Terms form a binding legal agreement between you (&ldquo;User&rdquo;) and SyncAuth (&ldquo;we&rdquo;, &ldquo;us&rdquo;). Accessing our platform from a region where such services are restricted means you do so entirely at your own risk and responsibility.
          </p>
          <p>
            We may update these Terms at any point. Changes go into effect as soon as they&apos;re posted — no prior notice required. Continued use of SyncAuth after changes means you accept them.
          </p>
        </Block>

        <Block icon="fa-circle-user" label="Your Account">
          <p>
            You are fully responsible for your account, including everything done through it. Keep your credentials private — we will never ask for your password. If you believe your account has been compromised, contact us immediately through our Discord.
          </p>
          <p>
            All information you register with must be accurate. We reserve the right to terminate accounts created with false information.
          </p>
        </Block>

        <Block icon="fa-ban" label="What You Cannot Do">
          <p>Using SyncAuth implies agreement not to:</p>
          <ul>
            <li>Attempt to reverse engineer, decompile, or tamper with any script protected by SyncAuth</li>
            <li>Share your account, dashboard access, or license keys with anyone else</li>
            <li>Probe, scan, or test the security of our infrastructure or API</li>
            <li>Flood or abuse our API endpoints in any way</li>
            <li>Interfere with other users&apos; access to the service</li>
            <li>Use SyncAuth to distribute malicious code of any kind</li>
            <li>Assist or encourage anyone else to do any of the above</li>
          </ul>
          <p>
            Violations may result in immediate account suspension, HWID/IP bans, key revocation, and further action at our discretion — no warning required.
          </p>
        </Block>

        <Block icon="fa-shield-halved" label="No Warranties">
          <p>
            SyncAuth is provided &ldquo;as is&rdquo;. We make no guarantees about uptime, accuracy, or fitness for a specific purpose. We are not liable for any losses resulting from use or inability to use the service.
          </p>
        </Block>

        {/* Divider into Privacy */}
        <div style={{ margin: "48px 0 40px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Privacy Policy</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <Block icon="fa-lock" label="What We Collect &amp; Why">
          <p>We collect the minimum data needed to operate the service:</p>

          <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginTop: 4 }}>
            {[
              { field: "IP Address",    why: "Access control and abuse prevention. Not exposed to script owners unless an anti-tamper event is triggered." },
              { field: "HWID",          why: "A non-sensitive hash of device properties used to bind keys to specific machines." },
              { field: "Display Name",  why: "Identifies you within the dashboard and in auth logs." },
              { field: "Email Address", why: "Account registration and password recovery only." },
              { field: "Timestamps",    why: "Logs of when scripts were executed. Sent to script owners only if they configure webhook delivery." },
            ].map((row, i, arr) => (
              <div key={row.field} style={{
                display: "grid", gridTemplateColumns: "140px 1fr",
                padding: "12px 16px", gap: 16,
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-1)", fontFamily: "JetBrains Mono, monospace" }}>{row.field}</span>
                <span style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>{row.why}</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--text-3)" }}>
            ❌ We do not collect Roblox usernames, account IDs, in-game data, or any sensitive device information.
          </p>
        </Block>

        <Block icon="fa-arrow-right-arrow-left" label="Data Sharing">
          <p>
            We do not sell your data. The only circumstances under which data is shared:
          </p>
          <ul>
            <li>With webhook delivery services configured by a script owner (IP and HWID only, and IP only on anti-tamper events)</li>
            <li>With law enforcement if legally compelled to do so</li>
          </ul>
          <p>
            Script owners never see your raw IP address under normal authentication conditions.
          </p>
        </Block>

        <Block icon="fa-cookie-bite" label="Cookies">
          <p>
            We use cookies to maintain your session and remember preferences. No third-party tracking cookies are used. You can clear cookies through your browser settings or by logging out — this will end your session.
          </p>
        </Block>

        <Block icon="fa-envelope" label="Contact">
          <p>
            Questions about these terms or your data? Reach us on Discord —{" "}
            <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer"
              style={{ color: "var(--text-1)", textDecoration: "underline" }}>
              discord.gg/sM8ukpuzVE
            </a>
          </p>
        </Block>

        {/* Footer */}
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>© 2026 SyncAuth. All rights reserved.</span>
          <a href="https://discord.gg/sM8ukpuzVE" target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "var(--text-3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-brands fa-discord" style={{ color: "#5865f2" }} />
            Discord Community
          </a>
        </div>

      </article>
    </div>
  );
}

function Block({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "var(--bg-2)", border: "1px solid var(--border-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className={`fa-solid ${icon}`} style={{ fontSize: 12, color: "var(--text-2)" }} />
        </div>
        <h2 style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-1)", letterSpacing: "-0.01em" }}>{label}</h2>
      </div>
      <div style={{ paddingLeft: 37, display: "flex", flexDirection: "column", gap: 10, color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.7 }}>
        {children}
      </div>
      <style>{`article ul { padding-left: 18px; display: flex; flex-direction: column; gap: 5px; } article li { font-size: 13.5px; color: var(--text-2); line-height: 1.6; }`}</style>
    </div>
  );
}
