import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ImportArticle() {
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const importArticle = async () => {
    setIsImporting(true);
    
    try {
      const articleContent = `
<style>
  .article-content { font-family: Georgia, serif; line-height: 1.8; }
  .article-content p { font-size: 1.1rem; color: #4A3728; margin-bottom: 20px; }
  .article-content strong { color: #6B4226; }
  .article-content em { font-style: italic; }
  .article-content h2 { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #6B4226; margin: 50px 0 25px; font-weight: bold; }
  .article-content h3 { font-size: 1.5rem; color: #6B4226; margin: 35px 0 15px; }
  .quote-block { border-left: 4px solid #C9963A; padding: 20px 30px; margin: 40px 0; background: rgba(201,150,58,0.08); border-radius: 0 8px 8px 0; }
  .quote-block blockquote { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-style: italic; color: #6B4226; line-height: 1.6; margin: 0; }
  .quote-block cite { display: block; margin-top: 12px; font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; color: #4E7553; font-style: normal; }
  .hope-tag { display: inline-block; margin-top: 12px; padding: 5px 14px; border-radius: 20px; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(201,150,58,0.15); color: #6B4226; font-weight: 500; }
  .heart-list { list-style: none; margin: 30px 0; padding-left: 0; }
  .heart-list li { padding: 12px 0 12px 40px; position: relative; font-size: 1rem; line-height: 1.6; color: #4A3728; border-bottom: 1px solid rgba(201,150,58,0.15); }
  .heart-list li::before { content: '♡'; position: absolute; left: 0; color: #C9963A; font-size: 1.2rem; }
</style>

<div class="article-content">
<p>To every beautiful soul living with Alzheimer's, and to every devoted carer who walks beside them — <strong>this message is for you.</strong> You are seen. You are not alone. And the world's greatest scientific minds are working every single day, with their whole hearts, to change the story.</p>

<p>What follows is not false hope. It is <strong>real, verified, peer-reviewed, and happening now.</strong> The science of 2025 looks nothing like the science of ten years ago. We have turned a corner. And the view ahead is brightening.</p>

<div class="quote-block">
<blockquote>"The key takeaway is a message of hope — the effects of Alzheimer's disease may not be inevitably permanent."</blockquote>
<cite>— Dr. Andrew Pieper, Case Western Reserve University, December 2025</cite>
</div>

<p>Read on. Let the facts fill you with warmth. Let the progress lift you. And know that science, love, and human ingenuity are a formidable team.</p>

<h2>The Miracles Happening Right Now</h2>

<h3>🧬 The Brain Can Be Reversed — Not Just Slowed</h3>
<p>In a landmark December 2025 study from Case Western Reserve University, scientists achieved something once thought impossible: they <strong>reversed advanced Alzheimer's in animal models</strong> — achieving full neurological recovery. For over a century, the disease was considered one-way. This discovery shatters that belief. The secret? Restoring NAD+, a critical energy molecule in the brain. Two completely different mouse models both showed recovery, making the result even more powerful.</p>
<span class="hope-tag">✨ Paradigm Shift</span>

<h3>💉 FDA-Approved Drugs That Clear Brain Plaques</h3>
<p>Two groundbreaking new drugs — <strong>Lecanemab (Leqembi)</strong> and <strong>Donanemab (Kisunla)</strong> — have been FDA-approved and are already being given to patients. These "immune army" drugs are laboratory-made antibodies that attach to harmful amyloid plaques in the brain and literally <em>clear them away</em>. Patients in early stages who receive these alongside existing treatments can now maintain good cognitive function for <strong>five to ten years or more.</strong> That's years of memories, love, and life.</p>
<span class="hope-tag">✅ FDA Approved — Available Now</span>

<h3>🩸 A Simple Blood Test Can Now Detect Alzheimer's Early</h3>
<p>In 2025, the FDA approved a revolutionary blood test that can identify Alzheimer's <strong>before severe symptoms appear</strong>, with over 91% accuracy. Previously, diagnosis required expensive brain scans or a painful spinal procedure. Now, a simple blood draw can detect the presence of amyloid plaques — allowing treatment to begin <em>far earlier</em>, when it is most powerful. Early treatment is the key that unlocks the best outcomes.</p>
<span class="hope-tag">🔬 Game Changer for Early Detection</span>

<h3>⚡ Brain Stimulation Therapy Showing Real Promise</h3>
<p>Researchers at MUSC are using <strong>Transcranial Magnetic Stimulation (TMS)</strong> — a non-invasive, painless treatment that sends gentle magnetic pulses into the brain — to improve cognitive function in people with early-stage Alzheimer's. Initial trials showed patients performing better on cognitive tests and showing enhanced brain connectivity on MRI scans.</p>

<h3>🧪 Gene Therapy — Rewriting the Risk</h3>
<p>The NIH is funding trials of <strong>gene therapy</strong> that changes the very DNA instructions linked to Alzheimer's risk. Scientists are introducing a protective gene (APOE ε2) that reduces amyloid build-up and calms dangerous brain inflammation. A human trial is already underway as of 2025.</p>
<span class="hope-tag">🧫 Human Trials Underway</span>

<h3>🤖 A Graphene Brain Implant That Listens & Heals</h3>
<p>A World Economic Forum 2025 Technology Pioneer has developed an <strong>ultra-thin graphene implant</strong>, thinner than a human hair, that can listen to the brain's electrical signals and send back corrective pulses to restore healthy function. Currently proven in Parkinson's, it is being developed specifically for Alzheimer's next.</p>

<h3>🔭 Over 120 Drugs in Clinical Trials Right Now</h3>
<p>As of 2025, <strong>more than 120 drug candidates</strong> are being tested in Alzheimer's clinical trials worldwide, targeting amyloid plaques, tau tangles, brain inflammation, and energy metabolism. Researchers worldwide are connected through the Davos Alzheimer's Collaborative, racing together toward the finish line.</p>

<h2>Daily Habits That Protect the Brain</h2>
<p>The US POINTER study — one of the largest trials of its kind — proved in 2025 that a structured programme of lifestyle changes significantly protects brain health and slows cognitive decline. These aren't suggestions. They are medicine:</p>

<ul class="heart-list">
<li><strong>🚶 Move Joyfully:</strong> Regular gentle movement — walking, dancing, swimming — feeds the brain oxygen and growth factors.</li>
<li><strong>🎶 Stimulate & Create:</strong> Music, puzzles, reading, learning new things — cognitive stimulation builds neural resilience.</li>
<li><strong>🥗 Nourish Your Brain:</strong> Mediterranean-style eating — olive oil, fish, berries, nuts, leafy greens — is powerfully protective.</li>
<li><strong>🌙 Sleep & Rest:</strong> During sleep, the brain cleans itself, flushing out amyloid and tau proteins.</li>
<li><strong>🤝 Stay Connected:</strong> Human connection, love, laughter, and belonging are among the most powerful protective forces.</li>
</ul>

<h2>The Extraordinary Mystery of the Untouched 95%</h2>
<p>The human brain contains approximately <strong>86 billion neurons</strong>, forming trillions of connections — more than the number of stars in the Milky Way. The brain's capacity for healing, adaptation, and rewiring itself is extraordinary and largely untapped. Scientists call this neuroplasticity — the brain's lifelong ability to form new connections and pathways, even after damage.</p>

<p><strong>Love, purpose, creativity, hope, and joy</strong> — the very things that make us most human — are neurologically active forces. They trigger real chemical changes. They build real neural pathways. They genuinely protect and repair brain tissue.</p>

<h2>A Love Letter to Every Carer</h2>
<p>You are among the most extraordinary human beings on this earth. What you do — day in, day out — is not just caregiving. It is an act of profound love, and it matters more than any medical breakthrough ever could on its own.</p>

<p>Science is increasingly recognising that the <strong>quality of love and connection</strong> surrounding a person with Alzheimer's has a measurable impact on their wellbeing, their calm, and even the pace of their decline. <em>You are medicine.</em></p>

<ul class="heart-list">
<li>Your presence reduces stress hormones and calms the nervous system of the person in your care.</li>
<li>Familiar music, touch, and laughter activate deep memory centres that disease affects last.</li>
<li>Moments of joy — however brief — have real neurological value. They are healing.</li>
<li>Your wellbeing matters too. Caring for yourself is caring for them.</li>
<li>You are not doing this alone. 50 million families worldwide share this road.</li>
</ul>

<div class="quote-block">
<blockquote>"Normal cognitive aging does not need to be treated — after all, that's where wisdom lives."</blockquote>
<cite>— Dr. Yamile Benitez, MUSC Alzheimer's Research</cite>
</div>

<h2 style="text-align: center; font-size: 2.5rem; margin-top: 60px;">Your Light Still Shines</h2>
<p style="text-align: center;">Alzheimer's may touch the brain — but it cannot reach the soul. The love you have given, the laughs you have shared, the person you are at your core — these are held in the hearts of everyone around you, safe and whole and bright.</p>

<p style="text-align: center;">And science — stubborn, relentless, magnificent science — is coming. The researchers are running. The breakthroughs are real. The dawn is not just coming. <strong>It is already here.</strong></p>

<p style="text-align: center; font-size: 2.5rem; margin: 30px 0;">💛</p>

<div class="quote-block" style="text-align: center; background: rgba(201,150,58,0.12); border: none;">
<blockquote style="font-size: 1.4rem;">"The effects of Alzheimer's disease may not be inevitably permanent."</blockquote>
<p style="font-size: 0.9rem; color: #7A5C3E; margin-top: 15px; letter-spacing: normal; text-transform: none;">Hold onto that. Share it. Believe it. It is science — and it is true.</p>
</div>

<p style="font-size: 0.85rem; color: #7A5C3E; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(201,150,58,0.2);">
<strong>Sources:</strong> Information compiled from peer-reviewed research and FDA announcements, 2025. Includes Case Western Reserve University, UCSF, NIH National Institute on Aging, World Economic Forum, Nature, Yale University, and MUSC.
</p>
</div>
      `;

      await offlineEntities.create('NewsArticle', {
        title: "A New Dawn is Breaking: Hope for Alzheimer's 2025",
        subtitle: "The most extraordinary breakthroughs in the history of Alzheimer's research are happening right now — in 2025. Science is catching up to hope. And hope is powerful medicine.",
        content: articleContent,
        category: "breakthrough",
        author: "Memory Mirror Team",
        publish_date: "2025-01-15",
        is_published: true,
        view_count: 0,
        tags: ["alzheimers", "research", "hope", "2025", "breakthrough", "caregiving", "FDA", "treatment", "gene-therapy", "lifestyle"]
      });

      toast.success('Article imported successfully!');
      setImported(true);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import article');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Import News Article
        </h1>
        <p className="text-slate-600 mb-6">
          Click below to import "A New Dawn is Breaking: Hope for Alzheimer's 2025" into your app database.
        </p>
        
        {!imported ? (
          <Button
            onClick={importArticle}
            disabled={isImporting}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Article'
            )}
          </Button>
        ) : (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-900 font-semibold">Article imported successfully!</p>
            <p className="text-sm text-green-700 mt-2">
              Visit the NewsArticle page to view it
            </p>
          </div>
        )}
      </div>
    </div>
  );
}