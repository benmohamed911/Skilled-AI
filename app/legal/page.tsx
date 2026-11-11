import { Disclaimer, Logo } from "@/components/ui";

export const metadata = { title: "Terms & Privacy — Skilld AI" };

export default function Legal() {
  return (
    <main className="legal-page">
      <Logo dark />
      <p className="notice" style={{ marginTop: 24 }}>
        <b>Draft.</b> These pages are placeholders. Final terms of service and a privacy policy must be added
        before Skilld AI accepts real customers or payments.
      </p>
      <h1 id="terms">Terms of service</h1>
      <p>To be completed before launch.</p>
      <h1 id="privacy">Privacy policy</h1>
      <p>To be completed before launch. In preview mode, your name, email and results are stored only in your own browser and are not sent to or kept on our servers.</p>
      <h2>Independence</h2>
      <p><Disclaimer /></p>
    </main>
  );
}
