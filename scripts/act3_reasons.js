export function initScriptViewer(opts={}) {
  const viewer = document.getElementById('script-viewer');
  if(!viewer) return;
  
  // Load the full script from ynLetter.txt
  fetch('./ynLetter.txt')
    .then(resp => {
      if(!resp.ok) throw new Error('Failed to load script');
      return resp.text();
    })
    .catch(() => {
      // Fallback to embedded content if file not found
      return `[Lights up.]

[Pochi]
(standing still, voice steady but sincere)
There are words that wait patiently,
words I kept choosing to silence,
afraid of speaking them too soon,
or too late.

(takes a breath)
Today, I choose to speak them.

[Pause.]

I have something to say, something to ask.
But this is not with expectation,
nor with demand,
but with honesty, and patience.

(softly)
You know, when we first started talking,
and I got to know even just a small snippet of you,
I started to admire you. I started to look forward to my night shifts,
hoping you'd be online at the same time.
Then, we went on our first few dates,
and that's when I started to feel something deeper.
I started liking you.
It was during those moments I found myself wanting to extend my trip,
to spend more time with you, to form something more.

(slightly hesitant, but genuine)
I have a minor confession, which I hope you don't find strange:
There wasn't actually a pickup from my dad's friend.
I just really wanted to spend time with you, knowing you'd be free that day.
But I wasn't sure if I should say it.

(pauses, a little reflective)
Then I had to go back, and honestly,
I thought these feelings would fade—
with time, with distance,
with the conflict of our schedules.
But you continued to show interest, to put in effort.
And that made me think, wow, we both care.

We spent months learning each other's schedules and routines,
and around this time, we became more vocal about how we felt.
I started getting to know you on a deeper level,
memorizing your habits, your sleep style, your favorite foods.
I care for you more than I first intended.
Somewhere between our dates, deep talks, and FaceTime moments,
my heart learned your name.

(soft smile)
Such a simple feeling, yet it carries so much weight.
But I don't regret it—not for a second.

(gently)
Whatever your response may be,
I will respect it,
because this is what I feel,
and I'm proud of it.

[Lights fade.]`;
    })
    .then(scriptText => {
      viewer.textContent = scriptText;
      
      // Add continue button functionality
      const continueBtn = document.getElementById('act3-continue');
      if(continueBtn && opts.onFinish) {
        continueBtn.addEventListener('click', () => {
          opts.onFinish();
        });
      }
    });
}
