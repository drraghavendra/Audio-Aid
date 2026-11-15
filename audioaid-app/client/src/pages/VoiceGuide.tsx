import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Phone } from "lucide-react";

const BOLNA_DOCS = "https://www.bolna.ai/docs/quickstarts/api";

export default function VoiceGuide() {
  return (
    <div className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">AudioAid voice guide (Bolna)</h1>
      <p className="text-muted-foreground">
        The phone agent lives in the parent folder of this app (Bolna scripts at the repo root). It explains AudioAid,
        preps you for this browser test, and does not play clinical tones on the call.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Start a call
          </CardTitle>
          <CardDescription>
            From the repo: set <code>BOLNA_AGENT_ID</code> and <code>AUDIOAID_APP_URL</code> (this site URL), then{" "}
            <code>npm run call</code> from the parent folder (next to <code>audioaid-app</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href={BOLNA_DOCS} target="_blank" rel="noreferrer">
            <Button variant="outline">Bolna API docs</Button>
          </a>
          <Link href="/test">
            <Button>Browser hearing test</Button>
          </Link>
        </CardContent>
      </Card>

      <Link href="/">
        <Button variant="ghost">← Music EQ</Button>
      </Link>
    </div>
  );
}