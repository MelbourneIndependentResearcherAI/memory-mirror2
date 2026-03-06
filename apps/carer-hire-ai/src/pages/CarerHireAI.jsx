import { useState } from "react";
import {
  ArrowLeft, Sparkles, ClipboardList, Search, MessageSquare,
  CheckCircle, Loader2, User, Star, ChevronRight, RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const STEPS = [
  { id: "needs", label: "Care Needs", icon: ClipboardList },
  { id: "jobad",  label: "Job Ad",     icon: Sparkles },
  { id: "match",  label: "Candidates", icon: Search },
  { id: "interview", label: "Interview", icon: MessageSquare },
];

const CARE_TYPES = [
  "Personal care (showering, dressing)",
  "Meal preparation",
  "Medication management",
  "Dementia / memory care",
  "Mobility & physiotherapy support",
  "Companionship & social engagement",
  "Overnight care",
  "Palliative care",
  "Disability support",
  "Domestic assistance",
];

const EXAMPLE_CANDIDATES = [
  {
    id: 1, name: "Maria S.", experience: "8 years", rating: 4.9,
    specialties: ["Dementia care", "Personal care", "Companionship"],
    bio: "Experienced aged care worker with a certificate III in Individual Support. Worked in both home and residential settings. Fluent in English and Italian.",
    available: "Weekdays + alternating weekends",
    verified: true,
  },
  {
    id: 2, name: "James T.", experience: "5 years", rating: 4.7,
    specialties: ["Disability support", "Meal preparation", "Medication management"],
    bio: "Registered nurse transitioning to home care. Holds a current NDIS worker screening check and first aid certificate.",
    available: "Flexible — mornings preferred",
    verified: true,
  },
  {
    id: 3, name: "Anh N.", experience: "11 years", rating: 5.0,
    specialties: ["Palliative care", "Dementia care", "Overnight care"],
    bio: "Senior carer with extensive palliative and dementia experience. Completed specialist dementia training through Dementia Australia.",
    available: "Afternoons, evenings & overnights",
    verified: true,
  },
];

// ── Step 1: Needs Assessment ──────────────────────────────────
function NeedsAssessment({ onNext }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [careTypes, setCareTypes] = useState([]);
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");

  const toggle = (item) =>
    setCareTypes(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );

  const handleNext = () => {
    if (!name.trim()) { toast.error("Please enter the care recipient's name."); return; }
    if (careTypes.length === 0) { toast.error("Please select at least one type of care needed."); return; }
    onNext({ name: name.trim(), age: age.trim(), careTypes, hours: hours.trim(), notes: notes.trim() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Tell us about the person needing care</h2>
        <p className="text-slate-500 text-sm">This helps the AI write an accurate job ad and find the right candidates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Care recipient's name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Margaret" className="min-h-[44px]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age (optional)</label>
          <Input value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 82" type="number" className="min-h-[44px]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Types of care needed</label>
        <div className="flex flex-wrap gap-2">
          {CARE_TYPES.map(item => (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border ${
                careTypes.includes(item)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-indigo-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hours per week (approximate)</label>
        <Input value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 20 hours/week, Monday–Friday mornings" className="min-h-[44px]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Anything else the carer should know? (optional)</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. She has a cat, loves gardening, speaks Italian, prefers a female carer..."
          rows={3}
          className="resize-none"
        />
      </div>

      <Button onClick={handleNext} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white min-h-[44px]">
        Generate Job Ad with AI <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

// ── Step 2: AI-Generated Job Ad ───────────────────────────────
function JobAdGenerator({ needs, onNext, onBack }) {
  const [jobAd, setJobAd] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `Write a warm, professional and detailed job advertisement for a home carer position. Use the following information:

- Care recipient: ${needs.name}${needs.age ? `, aged ${needs.age}` : ""}
- Care types required: ${needs.careTypes.join(", ")}
${needs.hours ? `- Hours: ${needs.hours}` : ""}
${needs.notes ? `- Additional context: ${needs.notes}` : ""}

The job ad should:
1. Have a welcoming, human tone (not clinical or cold)
2. Clearly describe duties and responsibilities
3. List required qualifications and skills
4. Mention desirable personal qualities
5. Include a short "About the family" paragraph
6. Be around 300–400 words
7. End with clear next steps for applying

Write the job ad now:`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const text = typeof response === "string" ? response : response?.content || response?.text || "";
      setJobAd(text);
      setGenerated(true);
    } catch {
      toast.error("Could not generate job ad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">AI-Generated Job Advertisement</h2>
        <p className="text-slate-500 text-sm">Review and edit before posting to carer platforms.</p>
      </div>

      {!generated ? (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Ready to generate</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              The AI will write a tailored job ad for {needs.name}'s care needs.
            </p>
            <Button onClick={generate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px]">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Job Ad</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Textarea
            value={jobAd}
            onChange={e => setJobAd(e.target.value)}
            rows={18}
            className="font-mono text-sm resize-none bg-white dark:bg-slate-800"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setGenerated(false); generate(); }}
              disabled={loading}
              className="min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard?.writeText(jobAd);
                toast.success("Copied to clipboard!");
              }}
              variant="outline"
              className="min-h-[44px]"
            >
              Copy
            </Button>
            <Button
              onClick={() => onNext()}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white min-h-[44px]"
            >
              Find Matching Candidates <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Button variant="ghost" onClick={onBack} className="text-slate-500 min-h-[44px]">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>
    </div>
  );
}

// ── Step 3: Candidate Matching ────────────────────────────────
function CandidateMatches({ needs, onNext, onBack }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Matched Candidates</h2>
        <p className="text-slate-500 text-sm">AI-matched carers based on {needs.name}'s specific needs. Select one to prepare interview questions.</p>
      </div>

      <div className="space-y-4">
        {EXAMPLE_CANDIDATES.map(c => (
          <Card
            key={c.id}
            className={`cursor-pointer transition-all duration-150 hover:shadow-md ${
              selected?.id === c.id ? "ring-2 ring-indigo-500 border-indigo-300" : ""
            }`}
            onClick={() => setSelected(c.id === selected?.id ? null : c)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    {c.verified && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs border-0">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                    <div className="ml-auto flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{c.experience} experience · {c.available}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {c.specialties.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-0">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} className="text-slate-500 min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={() => onNext(selected)}
          disabled={!selected}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white min-h-[44px]"
        >
          Prepare Interview Questions <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ── Step 4: Interview Questions ───────────────────────────────
function InterviewPrep({ needs, candidate, onBack, onRestart }) {
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a set of thoughtful, practical interview questions for hiring a home carer. 

Care recipient context:
- Name: ${needs.name}${needs.age ? `, aged ${needs.age}` : ""}
- Care needs: ${needs.careTypes.join(", ")}
${needs.notes ? `- Additional context: ${needs.notes}` : ""}

Candidate background: ${candidate.specialties.join(", ")} — ${candidate.bio}

Create 10–12 interview questions across these categories:
1. Experience & qualifications (3 questions)
2. Scenario-based / situational (3 questions specific to ${needs.name}'s needs)
3. Values & approach to care (2 questions)
4. Practical / logistics (2 questions)
5. Red-flag / safety checks (2 questions)

Format each question with its category and a brief note on what a good answer might include.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const text = typeof response === "string" ? response : response?.content || response?.text || "";
      setQuestions(text);
      setGenerated(true);
    } catch {
      toast.error("Could not generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Interview Preparation</h2>
        <p className="text-slate-500 text-sm">
          Tailored questions for interviewing {candidate.name} about caring for {needs.name}.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Candidate selected: <strong>{candidate.name}</strong> · {candidate.experience} experience
          </p>
        </CardContent>
      </Card>

      {!generated ? (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Ready to generate</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              The AI will create tailored questions for this specific care situation.
            </p>
            <Button onClick={generate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px]">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Questions</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Textarea
            value={questions}
            onChange={e => setQuestions(e.target.value)}
            rows={20}
            className="font-mono text-sm resize-none bg-white dark:bg-slate-800"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setGenerated(false); generate(); }}
              disabled={loading}
              className="min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard?.writeText(questions);
                toast.success("Copied to clipboard!");
              }}
              variant="outline"
              className="min-h-[44px]"
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} className="text-slate-500 min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button variant="outline" onClick={onRestart} className="min-h-[44px]">
          <RotateCcw className="w-4 h-4 mr-2" /> Start Over
        </Button>
      </div>
    </div>
  );
}

// ── Progress indicator ────────────────────────────────────────
function ProgressBar({ currentStep }) {
  const idx = STEPS.findIndex(s => s.id === currentStep);
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              active ? "bg-indigo-600 text-white" :
              done ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
              "text-slate-400"
            }`}>
              {done ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${i < idx ? "bg-indigo-300" : "bg-slate-200 dark:bg-slate-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CarerHireAI() {
  const navigate = useNavigate();
  const [step, setStep] = useState("needs");
  const [needs, setNeeds] = useState(null);
  const [candidate, setCandidate] = useState(null);

  const restart = () => {
    setStep("needs");
    setNeeds(null);
    setCandidate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 p-4 md:p-6 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            CarerHire AI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            AI-powered carer hiring — from job ad to interview questions in minutes.
          </p>
        </div>

        {/* Progress */}
        <ProgressBar currentStep={step} />

        {/* Step content */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              {(() => {
                const s = STEPS.find(x => x.id === step);
                const Icon = s?.icon;
                return Icon ? <><Icon className="w-4 h-4" /> {s.label}</> : null;
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === "needs" && (
              <NeedsAssessment
                onNext={n => { setNeeds(n); setStep("jobad"); }}
              />
            )}
            {step === "jobad" && needs && (
              <JobAdGenerator
                needs={needs}
                onNext={() => setStep("match")}
                onBack={() => setStep("needs")}
              />
            )}
            {step === "match" && needs && (
              <CandidateMatches
                needs={needs}
                onNext={c => { setCandidate(c); setStep("interview"); }}
                onBack={() => setStep("jobad")}
              />
            )}
            {step === "interview" && needs && candidate && (
              <InterviewPrep
                needs={needs}
                candidate={candidate}
                onBack={() => setStep("match")}
                onRestart={restart}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
