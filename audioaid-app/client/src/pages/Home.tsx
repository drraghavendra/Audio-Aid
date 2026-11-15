import { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, UploadCloud, Settings2, Ear, 
  EarOff, Plus, Trash2, Volume2, Save, Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfiles, useCreateProfile, useDeleteProfile } from "@/hooks/use-profiles";

const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000];

// Preset configurations
const PRESETS = {
  normal: [0, 0, 0, 0, 0, 0],
  loss: [0, 0, -5, -15, -30, -40],
  compensated: [0, 0, 5, 15, 20, 20],
};

export default function Home() {
  const { toast } = useToast();
  
  // Audio state
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // EQ State
  const [mode, setMode] = useState<string>("normal");
  const [gains, setGains] = useState<number[]>(() => {
    try {
      const raw = sessionStorage.getItem("audioaid_compensation_gains");
      if (raw) return JSON.parse(raw) as number[];
    } catch {
      /* ignore */
    }
    return [...PRESETS.normal];
  });
  
  // Profile saving state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  // Refs for Web Audio API
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Queries & Mutations
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();

  // Initialize Web Audio API
  const initAudio = () => {
    if (!audioRef.current) return;
    
    if (!contextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      contextRef.current = context;

      sourceRef.current = context.createMediaElementSource(audioRef.current);

      const filters = FREQUENCIES.map((freq) => {
        const filter = context.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = 0;
        return filter;
      });

      const compressor = context.createDynamicsCompressor();

      // Connect the processing chain
      sourceRef.current.connect(filters[0]);
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      filters[filters.length - 1].connect(compressor);
      compressor.connect(context.destination);

      filtersRef.current = filters;
    }

    if (contextRef.current.state === "suspended") {
      contextRef.current.resume();
    }
  };

  // Sync React state gains to Web Audio filters smoothly
  useEffect(() => {
    if (filtersRef.current.length > 0 && contextRef.current) {
      const now = contextRef.current.currentTime;
      filtersRef.current.forEach((filter, i) => {
        // Use setTargetAtTime for a smooth, pop-free transition
        filter.gain.setTargetAtTime(gains[i], now, 0.05);
      });
    }
  }, [gains]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioURL) URL.revokeObjectURL(audioURL);
      setAudioURL(URL.createObjectURL(file));
      setFileName(file.name);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioURL) {
      toast({
        title: "No audio selected",
        description: "Please upload an audio file first.",
        variant: "destructive",
      });
      return;
    }
    
    initAudio();
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGainChange = (index: number, val: number) => {
    const newGains = [...gains];
    newGains[index] = val;
    setGains(newGains);
    setMode("custom");
  };

  const applyPreset = (presetName: keyof typeof PRESETS) => {
    setGains([...PRESETS[presetName]]);
    setMode(presetName);
  };

  const handleSaveProfile = async () => {
    if (!newProfileName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    try {
      await createProfile.mutateAsync({
        name: newProfileName,
        gains: gains as [number, number, number, number, number, number]
      });
      setIsSaveDialogOpen(false);
      setNewProfileName("");
      toast({ title: "Profile saved successfully" });
    } catch (error: any) {
      toast({ 
        title: "Failed to save profile", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleDeleteProfile = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProfile.mutateAsync(id);
      toast({ title: "Profile deleted" });
      if (mode === `profile-${id}`) {
        applyPreset("normal");
      }
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 pb-24">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={audioURL || undefined}
        onEnded={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      />

      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
              AudioAid
            </h1>
            <p className="text-muted-foreground text-lg">
              Hearing check, music EQ & adaptive compensation
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <a href="/test" className="text-sm text-primary underline-offset-4 hover:underline">Take hearing test →</a>
              <a href="/voice" className="text-sm text-primary underline-offset-4 hover:underline">Bolna voice guide →</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/50">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                min={0} max={1} step={0.01} value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                className="w-24"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Player & Presets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload & Player Card */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6 relative z-10 flex flex-col items-center justify-center min-h-[220px] text-center gap-6">
                
                {fileName ? (
                  <div className="w-full space-y-6">
                    <div className="flex items-center justify-center gap-3 text-primary">
                      <Music className="w-6 h-6" />
                      <span className="font-medium truncate max-w-[200px]">{fileName}</span>
                    </div>
                    
                    <Button 
                      size="lg" 
                      onClick={togglePlay}
                      className="w-20 h-20 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </Button>
                    
                    <label className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors block">
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      Choose different track
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl p-8 transition-all">
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                    <span className="font-medium mb-1">Upload Audio</span>
                    <span className="text-sm text-muted-foreground">MP3, WAV, FLAC</span>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                )}

              </CardContent>
            </Card>

            {/* Presets Card */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Standard Presets
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button 
                  variant={mode === "normal" ? "default" : "outline"}
                  onClick={() => applyPreset("normal")}
                  className="w-full justify-start border-border/50"
                >
                  <Ear className="w-4 h-4 mr-2" /> Normal Hearing
                </Button>
                <Button 
                  variant={mode === "loss" ? "default" : "outline"}
                  onClick={() => applyPreset("loss")}
                  className="w-full justify-start border-border/50"
                >
                  <EarOff className="w-4 h-4 mr-2" /> High-Freq Loss Sim
                </Button>
                <Button 
                  variant={mode === "compensated" ? "default" : "outline"}
                  onClick={() => applyPreset("compensated")}
                  className="w-full justify-start border-border/50"
                >
                  <Settings2 className="w-4 h-4 mr-2" /> Compensated
                </Button>
              </CardContent>
            </Card>

            {/* Custom Profiles */}
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Saved Profiles</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-2">
                {profilesLoading ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Loading profiles...</p>
                ) : profiles?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No saved profiles yet.</p>
                ) : (
                  profiles?.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 group">
                      <Button
                        variant={mode === `profile-${p.id}` ? "default" : "secondary"}
                        onClick={() => {
                          setGains([...p.gains]);
                          setMode(`profile-${p.id}`);
                        }}
                        className="flex-1 justify-start text-sm truncate"
                      >
                        {p.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteProfile(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Equalizer */}
          <div className="lg:col-span-8">
            <Card className="h-full bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                  <CardTitle className="text-2xl font-bold">Graphic Equalizer</CardTitle>
                  <CardDescription className="mt-1">
                    Fine-tune frequency bands to simulate or compensate
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsSaveDialogOpen(true)}
                  disabled={mode === "normal" || mode === "loss" || mode === "compensated" || mode.startsWith("profile-")}
                  className="shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Profile
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {FREQUENCIES.map((freq, i) => (
                    <div key={freq} className="flex flex-col gap-4 group">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Band {i + 1}
                          </span>
                          <span className="font-mono text-lg font-bold text-foreground">
                            {freq >= 1000 ? `${freq / 1000}k` : freq} Hz
                          </span>
                        </div>
                        <span className={`font-mono font-medium px-2 py-1 rounded text-sm transition-colors ${
                          gains[i] > 0 ? "bg-primary/10 text-primary" : 
                          gains[i] < 0 ? "bg-destructive/10 text-destructive" : 
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {gains[i] > 0 ? "+" : ""}{gains[i]} dB
                        </span>
                      </div>
                      
                      <div className="relative py-2">
                        {/* Center detent line */}
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border/80 -translate-y-1/2 pointer-events-none" />
                        
                        <Slider
                          min={-40}
                          max={40}
                          step={1}
                          value={[gains[i]]}
                          onValueChange={(val) => handleGainChange(i, val[0])}
                          className="relative z-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Save Profile Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Save Custom Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Profile Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Hearing Setup"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                autoFocus
                className="bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={createProfile.isPending}>
              {createProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
