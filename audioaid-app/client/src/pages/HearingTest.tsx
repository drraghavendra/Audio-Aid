import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useCreateHearingTest } from "@/hooks/use-hearing-tests";
import { PureToneAudiometry, FREQUENCIES_HZ } from "@/lib/audiometry";
import { thresholdsToCompensationGains } from "@/lib/compensation";

export default function HearingTest() {
  const { toast } = useToast();
  const createTest = useCreateHearingTest();
  const engineRef = useRef<PureToneAudiometry | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [thresholds, setThresholds] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);

  const freq = FREQUENCIES_HZ[stepIndex];
  const progress = (stepIndex / FREQUENCIES_HZ.length) * 100;

  const compensation = useMemo(() => {
    if (thresholds.length !== FREQUENCIES_HZ.length) return null;
    return thresholdsToCompensationGains(thresholds);
  }, [thresholds]);

  useEffect(() => {
    engineRef.current = new PureToneAudiometry();
    return () => {
      void engineRef.current?.dispose();
    };
  }, []);

  const startTone = async () => {
    setPlaying(true);
    await engineRef.current?.playTone(freq);
  };

  const recordHeard = async () => {
    await engineRef.current?.stop();
    setPlaying(false);
    const est = engineRef.current?.currentGainDbEstimate() ?? -20;
    const next = [...thresholds, Math.round(est)];
    setThresholds(next);
    if (stepIndex < FREQUENCIES_HZ.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setStepIndex(FREQUENCIES_HZ.length);
    }
  };

  const saveResults = async () => {
    if (!compensation) return;
    try {
      const row = await createTest.mutateAsync({
        display_name: displayName || undefined,
        thresholds,
        compensation_gains: compensation,
      });
      setSavedProfileId(row.id);
      sessionStorage.setItem("audioaid_compensation_gains", JSON.stringify(compensation));
      toast({
        title: "Profile saved",
        description: "Open Music EQ to apply compensation to a track.",
      });
    } catch (e: unknown) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const done = stepIndex >= FREQUENCIES_HZ.length && thresholds.length === FREQUENCIES_HZ.length;

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">AudioAid hearing check</h1>
        <p className="text-muted-foreground mt-2">
          Educational browser test — not a clinical audiogram. Use headphones in a quiet room.
        </p>
      </header>

      {!done ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Tone {stepIndex + 1} of {FREQUENCIES_HZ.length} — {freq} Hz
            </CardTitle>
            <CardDescription>
              Press Play, then tap &quot;I hear it&quot; at the softest level you notice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="h-2" />
            <div className="flex flex-wrap gap-3">
              <Button onClick={startTone} disabled={playing}>
                {playing ? "Playing…" : "Play tone"}
              </Button>
              <Button variant="secondary" onClick={recordHeard} disabled={!playing && stepIndex === thresholds.length}>
                I hear it
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your compensation curve (dB)</CardTitle>
            <CardDescription>Based on relative thresholds — boosts where you needed more level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm font-mono">
              {FREQUENCIES_HZ.map((f, i) => (
                <div key={f} className="p-2 rounded bg-secondary text-center">
                  <div className="text-muted-foreground text-xs">{f} Hz</div>
                  <div>+{compensation?.[i] ?? 0} dB</div>
                </div>
              ))}
            </div>
            <Input
              placeholder="Profile name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveResults} disabled={createTest.isPending}>
                Save profile
              </Button>
              <Link href="/">
                <Button variant="outline">Apply on Music EQ →</Button>
              </Link>
            </div>
            {savedProfileId && (
              <p className="text-sm text-muted-foreground">Saved id: {savedProfileId}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Link href="/">
        <Button variant="ghost">← Back to Music EQ</Button>
      </Link>
    </div>
  );
}