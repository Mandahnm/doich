export const metadata = {
  title: 'Privacy Policy — Дойч',
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'sans-serif', color: '#1b1c1c', lineHeight: 1.7 }}>
      <a href="/" style={{ fontSize: 14, color: '#0062a1', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← Back to Дойч</a>

      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Privacy Policy</h1>
      <p style={{ color: '#80765f', fontSize: 14, marginBottom: 40 }}>Last updated: June 2026</p>

      <p>Дойч ("we", "our", "the app") is a German language learning app for Mongolian speakers. This policy explains what data we collect, why, and how it is used.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>1. Data We Collect</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Email address</strong> — collected when you create an account, used only for login and account recovery.</li>
        <li><strong>Password</strong> — stored as a secure hash by Supabase. We never see your plain-text password.</li>
        <li><strong>Learning progress</strong> — XP points, learned words, streaks, achievements, and game statistics. Stored so your progress is available across devices.</li>
        <li><strong>Chat messages</strong> — messages you send to the AI tutor are forwarded to OpenAI's API to generate responses. We do not permanently store chat history on our servers.</li>
        <li><strong>Voice input</strong> — when you use the pronunciation practice feature, your microphone audio is processed entirely by your browser's built-in speech recognition (Chrome uses Google's Speech Recognition service). We do not receive or store any audio.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>2. Third-Party Services</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Supabase</strong> — stores your account and progress data. <a href="https://supabase.com/privacy" style={{ color: '#0062a1' }}>Supabase Privacy Policy</a></li>
        <li><strong>OpenAI</strong> — processes AI chat messages. <a href="https://openai.com/privacy" style={{ color: '#0062a1' }}>OpenAI Privacy Policy</a></li>
        <li><strong>Google Speech Recognition</strong> — used by Chrome/Edge to process voice input locally. <a href="https://policies.google.com/privacy" style={{ color: '#0062a1' }}>Google Privacy Policy</a></li>
        <li><strong>Vercel</strong> — hosts the app and may log standard request metadata (IP address, browser type). <a href="https://vercel.com/legal/privacy-policy" style={{ color: '#0062a1' }}>Vercel Privacy Policy</a></li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>3. How We Use Your Data</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>To provide and sync your learning progress across sessions and devices.</li>
        <li>To authenticate you and keep your account secure.</li>
        <li>To send account recovery emails when requested.</li>
        <li>We do <strong>not</strong> sell your data to third parties.</li>
        <li>We do <strong>not</strong> use your data for advertising.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>4. Cookies</h2>
      <p>We use session cookies set by Supabase to keep you logged in. These are strictly necessary for the app to function and do not track you across other websites.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>5. Your Rights</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Delete your account</strong> — you can request full deletion of your account and all associated data by emailing us.</li>
        <li><strong>Access your data</strong> — you can request a copy of your stored data.</li>
        <li><strong>Correction</strong> — you can update your email via account settings.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>6. Data Retention</h2>
      <p>Your data is kept for as long as your account is active. Deleting your account removes all associated data from our systems within 30 days.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>7. Children</h2>
      <p>Дойч is not directed at children under 13. We do not knowingly collect data from children under 13.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>8. Contact</h2>
      <p>For any privacy questions or data requests: <a href="mailto:doichapp@gmail.com" style={{ color: '#0062a1' }}>doichapp@gmail.com</a></p>
    </div>
  );
}
