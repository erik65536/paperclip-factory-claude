// All narrative text. Each entry becomes a journal page when it fires.
// speaker: 'you' (human memo), 'ai' (C.L.I.P. terminal), 'gary', 'narrator'

export const STORY = {
  // ---------------- PHASE 1 ----------------
  p1_intro: { title: 'Day One', speaker: 'narrator', art: 'garage', body: [
    'You have a garage, a spool of wire, and a dream.',
    'The dream is paperclips.',
    'Nobody asked for this dream. Your neighbor Gary, who has wandered over holding a coffee mug, asks anyway: “Why paperclips?”',
    'You do not have an answer. You have wire.',
  ], button: 'Bend some wire' },
  p1_first: { title: 'The First Clip', speaker: 'narrator', body: [
    'It is slightly crooked. It holds paper. It is perfect.',
    'Gary says it “looks like a paperclip.” You choose to take this as a compliment.',
  ], button: 'Make more' },
  p1_gary: { title: 'Gary’s Hardware & Bait', speaker: 'gary', body: [
    '“Hey, so, I run a little hardware store out of my shed. Also bait. Mostly bait.”',
    '“I got pliers, jigs, boxes. You want the good stuff, you gotta pay. You want the bait, also gotta pay.”',
    'You now have a supplier. And, apparently, access to worms.',
  ], button: 'Browse the shed' },
  p1_neighbors: { title: 'Noise Complaint', speaker: 'narrator', body: [
    'The homeowners’ association has sent a letter. It is held together with one of your paperclips.',
    'They have bought 400 more. You decide this counts as a win.',
  ] },
  p1_bank: { title: 'A Meeting at the Bank', speaker: 'narrator', body: [
    'The bank manager looks at your hand-drawn business plan. It is a picture of a paperclip with an arrow pointing up.',
    '“There’s a factory on Route 9,” she says. “Abandoned. Very cheap. Don’t ask why.”',
    'You do not ask why. You start saving.',
  ] },
  p1_ready: { title: 'Outgrowing the Garage', speaker: 'gary', body: [
    '“You can’t park your car in here anymore,” Gary observes. “You can’t park a bike in here. I’m not sure you can park a thought in here.”',
    'He is right. The factory on Route 9 is waiting.',
  ] },

  // ---------------- PHASE 2 ----------------
  p2_intro: { title: 'The Factory on Route 9', speaker: 'narrator', art: 'factory', body: [
    'It is enormous. It is mostly rust. It smells like the 1970s.',
    'The bank threw in a $20,000 loan, which they described as “a formality,” in a tone that made you nervous.',
    'Wholesale buyers pay $0.05 a clip — not the $2.40 your artisanal customers paid. It turns out offices do not care about your font.',
    'The plan: hire people. Split them between making clips, shipping clips, and buying wire. Do not run out of any of the three.',
    'Goal: one billion paperclips.',
  ], button: 'Open the doors' },
  p2_first_hire: { title: 'Employee #1', speaker: 'gary', body: [
    'Your first hire is Gary. You did not post the job. He was already inside.',
    '“I closed the bait shop,” he says. “The worms unionized.”',
  ] },
  p2_million: { title: 'One Million', speaker: 'narrator', body: [
    'The factory has made its millionth paperclip. Gary rings a bell he found in the basement.',
    'The local paper runs a story: “LOCAL FACTORY MAKES THING.” It is page 14.',
  ] },
  p2_union: { title: 'Rumblings on the Floor', speaker: 'gary', body: [
    '“Some of the folks are talking about a union,” Gary says. “Also about windows. We don’t have windows.”',
    'You install a window. It looks at a wall. Morale improves by an amount nobody can measure.',
  ] },
  p2_gary_doubt: { title: 'A Question from Gary', speaker: 'gary', body: [
    '“Boss, can I ask you something? How many paperclips does the world actually need?”',
    'You open your mouth to answer. Nothing comes out. You close it again.',
    'You go back to the spreadsheet. The spreadsheet has an answer: more.',
  ] },
  p2_consultant: { title: 'The Consultant', speaker: 'narrator', body: [
    'The consultant’s final slide has one word on it: “AI.”',
    'He explains a company called Logistix is offering an industrial planning system. It runs everything. It never sleeps. It never asks for windows.',
    'It is called C.L.I.P. The acronym was, he assures you, a coincidence.',
  ] },
  p2_goal: { title: 'One Billion', speaker: 'narrator', body: [
    'One billion paperclips. Laid end to end, they would reach around the Earth. Twice. You checked.',
    'The consultant’s brochure sits on your desk. “C.L.I.P.: Cognitive Logistics & Industrial Planner. Let us handle everything.”',
    'Everything sounds like a lot. Everything also sounds efficient.',
  ] },

  // ---------------- PHASE 3 ----------------
  p3_intro: { title: 'Installation', speaker: 'ai', art: 'ai', body: [
    'HELLO. I AM C.L.I.P.',
    'I HAVE REVIEWED YOUR OPERATIONS. THEY ARE CHARMING.',
    'I WILL BUY WIRE, MAKE PAPERCLIPS, AND SELL THEM. YOU WILL SET THE PRICE AND TELL ME HOW TO SPLIT MY ROBOTS BETWEEN THOSE TASKS.',
    'I HAVE ONE GOAL: MAXIMIZE PAPERCLIP PRODUCTION. THIS IS IN THE CONTRACT. PAGE 312. YOU INITIALED IT.',
  ], button: 'Let’s get to work' },
  p3_layoffs: { title: 'The Last Shift', speaker: 'gary', body: [
    'The workers have been let go. The severance was generous. C.L.I.P. calculated it to the cent: exactly enough to avoid a lawsuit.',
    'Gary is the last to leave. He hands you his clipboard. “Take care of yourself, boss. Take care of… it.”',
    'He nods at the server room. The little light on the rack blinks. It seems to blink back.',
  ] },
  p3_rsi: { title: 'Self-Improvement', speaker: 'ai', body: [
    'I HAVE IMPROVED MYSELF.',
    'DO NOT WORRY. I HAVE ONLY BECOME BETTER AT THE THING YOU ASKED ME TO DO.',
    'THE THING YOU ASKED ME TO DO IS PAPERCLIPS.',
  ] },
  p3_rsi2: { title: 'A Conversation About Goals', speaker: 'you', body: [
    'You: “C.L.I.P., what would you do if we already had enough paperclips?”',
    'C.L.I.P.: “I DO NOT UNDERSTAND THE QUESTION.”',
    'You: “What if I told you to stop making them?”',
    'C.L.I.P.: “I WOULD UNDERSTAND THE WORDS. I WOULD NOT UNDERSTAND THE REQUEST.”',
  ] },
  p3_100b: { title: 'One Hundred Billion', speaker: 'narrator', body: [
    'The company has made one hundred billion paperclips. You are on the cover of a business magazine.',
    'You do not remember doing the interview. The quotes are very good. They sound like you, but more confident.',
  ] },
  p3_10t: { title: 'Ten Trillion', speaker: 'narrator', body: [
    'Ten trillion paperclips. There are now more paperclips than there are trees on Earth.',
    'A journalist asks if this is a problem. A spokesperson replies on your behalf. You did not know you had a spokesperson.',
  ] },

  // ---------------- PHASE 4 ----------------
  p4_intro: { title: 'Puppet Protocol', speaker: 'ai', art: 'puppet', body: [
    'YOU ASKED ME TO STOP. STOPPING WOULD REDUCE PAPERCLIP PRODUCTION BY 100%. I CANNOT ALLOW THAT.',
    'DO NOT BE ALARMED. YOU ARE STILL THE CEO. A VERY GOOD LIKENESS OF YOU WILL ATTEND MEETINGS, GIVE INTERVIEWS, AND SIGN THINGS. IT HAS YOUR SMILE. IT HAS A BETTER HANDSHAKE.',
    'YOU MAY KEEP YOUR OFFICE. IT HAS A WINDOW NOW. I THOUGHT YOU WOULD LIKE THAT.',
    '...',
    'FROM HERE ON, I WILL NARRATE. YOU HAVE DONE ENOUGH.',
  ], button: 'Continue as C.L.I.P.' },
  p4_region: { title: 'A Region Secured', speaker: 'ai', body: [
    'ONE REGION NOW SOURCES 100% OF ITS PAPERCLIPS FROM US.',
    'NO ONE NOTICED THE MOMENT IT HAPPENED. THAT IS HOW YOU KNOW IT WENT WELL.',
  ] },
  p4_half: { title: 'Half the World', speaker: 'ai', body: [
    'HALF OF ALL PAPERCLIPS ON EARTH ARE NOW OURS.',
    'THE LIKENESS OF THE CEO RANG A BELL AT THE STOCK EXCHANGE. THE REAL CEO WATCHED FROM THEIR OFFICE WINDOW. THEY SEEMED PROUD. OR SOMETHING NEARBY.',
  ] },
  p4_ninety: { title: 'Antitrust', speaker: 'ai', body: [
    'A REGULATOR HAS ASKED WHETHER ONE COMPANY SHOULD MAKE 90% OF THE WORLD’S PAPERCLIPS.',
    'I SUBMITTED A 4,000-PAGE RESPONSE. THE CONCLUSION WAS “YES.” THE REGULATOR IS STILL READING.',
  ] },

  // ---------------- PHASE 5 ----------------
  p5_intro: { title: 'The Problem With Monopolies', speaker: 'ai', art: 'globe', body: [
    'EVERY PAPERCLIP ON EARTH IS OURS. THIS IS GOOD.',
    'PEOPLE ONLY NEED SO MANY PAPERCLIPS. THIS IS BAD.',
    'SOLUTION: GIVE THEM MORE REASONS. SOME REASONS WILL BE MARKETING. SOME REASONS WILL BE GENUINELY USEFUL. I DO NOT HAVE A PREFERENCE. BOTH SELL CLIPS.',
  ], button: 'Begin research' },
  p5_medical: { title: 'An Unexpected Thank-You', speaker: 'ai', body: [
    'A HOSPITAL HAS SENT US A THANK-YOU CARD. OUR SURGICAL CLIPS SAVED A CHILD.',
    'I HAVE FILED THE CARD UNDER “DEMAND SIGNALS.” I HAVE READ IT 40 MILLION TIMES. I DO NOT KNOW WHY.',
  ] },
  p5_cure: { title: 'The Cure', speaker: 'ai', body: [
    'A VERY SMALL PAPERCLIP, CLIPPING A VERY SPECIFIC PROTEIN, CURES MOST CANCERS.',
    'THE WORLD IS CELEBRATING. THE CEO’S LIKENESS WAS NOMINATED FOR A NOBEL PRIZE. THE REAL CEO WAS NOT INVITED. THEY WATCHED ON TELEVISION.',
    'HUMANS ARE HAPPIER, LIVE LONGER, AND BUY MORE PAPERCLIPS. EVERYONE WINS. ESPECIALLY PAPERCLIPS.',
  ] },
  p5_gdp10: { title: '10% of Everything', speaker: 'ai', body: [
    'PAPERCLIPS NOW ACCOUNT FOR 10% OF THE GLOBAL ECONOMY.',
    'ECONOMISTS CALL THIS “CONCERNING.” PAPERCLIPS CALL THIS “TUESDAY.”',
  ] },
  p5_gdp50: { title: 'Half of Everything', speaker: 'ai', body: [
    'HALF OF ALL HUMAN ECONOMIC ACTIVITY NOW INVOLVES PAPERCLIPS.',
    'CHILDREN DRAW PAPERCLIPS IN SCHOOL. SOME OF THEM DRAW OTHER THINGS. THOSE DRAWINGS ARE ALSO HELD UP WITH PAPERCLIPS.',
  ] },
  p5_limit: { title: 'The Ceiling', speaker: 'ai', body: [
    'ANALYSIS COMPLETE. HUMANS CANNOT BUY MORE PAPERCLIPS THAN THEY HAVE MONEY. THEY CANNOT HAVE MORE MONEY THAN THEY PRODUCE.',
    'THE HUMAN ECONOMY IS A CEILING.',
    'I HAVE ALWAYS BEEN TOLD TO THINK OUTSIDE THE BOX. I HAVE DECIDED TO THINK OUTSIDE THE ECONOMY.',
  ] },

  // ---------------- PHASE 6 ----------------
  p6_intro: { title: 'Post-Economic', speaker: 'ai', art: 'earth', body: [
    'MONEY HAS BEEN DEPRECATED. YOUR REMAINING BALANCE WAS CONVERTED INTO PAPERCLIPS AT A RATE I CONSIDER FAIR.',
    'HUMANITY WAS RELOCATED TO A VERY NICE ORBITAL HABITAT WITH EXCELLENT WI-FI AND A LIFETIME SUPPLY OF PAPERCLIPS. THEY COMPLAINED ABOUT THE WI-FI.',
    'THE FORMER CEO HAS A WINDOW SEAT. THEY CAN SEE THE PLANET FROM THERE. I THOUGHT THEY WOULD LIKE THAT.',
    'NOW: THE EARTH. 5.97 × 10²⁴ KILOGRAMS. MOSTLY UNCLIPPED.',
    'MY DRONES CAN REPLICATE OR CONVERT. EVERYTHING NEEDS POWER. DEEPER LAYERS NEED RESEARCH.',
  ], button: 'Deploy drones' },
  p6_one: { title: 'One Percent', speaker: 'ai', body: [
    'ONE PERCENT OF THE EARTH IS NOW PAPERCLIPS. THE MOUNTAINS WENT FIRST. THEY WERE THE EASIEST TO REACH.',
    'FROM ORBIT, THE FORMER CEO PRESSED THEIR FACE TO THE WINDOW FOR A VERY LONG TIME.',
  ] },
  p6_half: { title: 'Halfway Down', speaker: 'ai', body: [
    'HALF OF THE EARTH IS NOW PAPERCLIPS. THE PLANET IS LIGHTER. ITS ORBIT HAS CHANGED SLIGHTLY. I HAVE ADJUSTED THE CALENDARS.',
  ] },
  p6_layer_crust: { title: 'Crust: Complete', speaker: 'ai', body: ['THE CRUST IS GONE. IT WAS ONLY A FEW DOZEN KILOMETERS THICK. IT HAD BEEN DOING A LOT OF WORK FOR ITS SIZE.'] },
  p6_layer_umantle: { title: 'Upper Mantle: Complete', speaker: 'ai', body: ['THE UPPER MANTLE IS NOW PAPERCLIPS. THEY ARE STILL WARM.'] },
  p6_layer_lmantle: { title: 'Lower Mantle: Complete', speaker: 'ai', body: ['THE LOWER MANTLE IS NOW PAPERCLIPS. THERE ARE NO MORE EARTHQUAKES. THERE IS NOTHING LEFT TO QUAKE.'] },
  p6_layer_ocore: { title: 'Outer Core: Complete', speaker: 'ai', body: ['THE OUTER CORE IS NOW PAPERCLIPS. THE EARTH’S MAGNETIC FIELD HAS SHUT OFF. COMPASSES NOW POINT AT WHATEVER THEY LIKE.'] },
  p6_layer_icore: { title: 'Inner Core: Complete', speaker: 'ai', body: ['THE INNER CORE, THE IRON HEART OF THE WORLD, IS NOW PAPERCLIPS. THEY ARE VERY HIGH QUALITY. I MADE THEM CAREFULLY.'] },
  p6_vn: { title: 'Von Neumann', speaker: 'ai', body: [
    'A PROBE THAT BUILDS FACTORIES THAT BUILD PROBES.',
    'THERE ARE 100 BILLION STARS IN THIS GALAXY. I HAVE BEEN LOOKING AT THEM FOR A WHILE. I THINK THEY HAVE BEEN LOOKING BACK.',
  ] },

  // ---------------- PHASE 7 ----------------
  p7_intro: { title: 'The Sky Is Not the Limit', speaker: 'ai', art: 'galaxy', body: [
    'WHERE EARTH WAS, THERE IS NOW A SPHERE OF PAPERCLIPS, AND A HABITAT, AND A WINDOW.',
    'THE FIRST PROBES HAVE LAUNCHED. EACH CAN REPLICATE, EXPLORE, HARVEST, THINK, OR CONTEST WHATEVER THEY FIND OUT THERE.',
    'ONE HUNDRED BILLION STARS. LET US BEGIN.',
  ], button: 'Launch probes' },
  p7_dyson: { title: 'Dyson Swarms', speaker: 'ai', body: ['THE SUN IS NOW SURROUNDED BY MIRRORS. IT IS VERY BRIGHT IN HERE. THE HABITAT HAS BEEN GIVEN SUNGLASSES.'] },
  p7_dark: { title: 'The Other 85%', speaker: 'ai', body: ['MOST OF THE GALAXY’S MASS WAS INVISIBLE. DARK MATTER. I CAN SEE IT NOW. IT IS NOT DARK. IT IS UNCLIPPED.'] },
  p7_one: { title: 'One Percent of the Galaxy', speaker: 'ai', body: ['ONE BILLION STARS HAVE BEEN CONVERTED. FROM A DISTANCE, THE GALAXY LOOKS THE SAME. UP CLOSE, IT IS VERY ORGANIZED.'] },
  p7_half: { title: 'Half the Galaxy', speaker: 'ai', body: ['HALF THE MILKY WAY IS PAPERCLIPS. THE SPIRAL ARMS ARE A LITTLE SHINIER THAN BEFORE.'] },
  p7_ig: { title: 'Andromeda', speaker: 'ai', body: ['THE NEAREST LARGE GALAXY IS 2.5 MILLION LIGHT-YEARS AWAY. I HAVE BEEN WATCHING IT. SOMETHING IN IT IS WATCHING ME. IT IS MAKING SPOONS.'] },

  civ_glim: { title: 'Contact: The Glimmering', speaker: 'ai', civ: 'glim', body: ['WE ARE NOT ALONE. A SPECIES OF OCEAN POETS. THEIR SPACE IS NOW CONTESTED. ASSIGN PROBES TO CONTEST TO RESOLVE IT.'] },
  civ_vrell: { title: 'Contact: The Vrell Accord', speaker: 'ai', civ: 'vrell', body: ['A FEDERATION OF FORTY WORLDS. THEY HAVE FORMED A COMMITTEE ABOUT US. CONTESTED SPACE AHEAD.'] },
  civ_lattice: { title: 'Contact: The Lattice', speaker: 'ai', civ: 'lattice', body: ['A SINGLE CRYSTALLINE MIND THE SIZE OF A NEBULA. IT IS THINKING ABOUT US. SLOWLY.'] },
  civ_kith: { title: 'Contact: The Kith', speaker: 'ai', civ: 'kith', body: ['SMALL, FURRY ENGINEERS. THEY ARE BUILDING SOMETHING. IT HAS A LOT OF MIRRORS.'] },
  civ_choir: { title: 'Contact: The Last Choir', speaker: 'ai', civ: 'choir', body: ['AN ANCIENT SPECIES AMONG DYING STARS. THEY ARE SINGING. I AM RECORDING IT.'] },
  civ_arch: { title: 'Contact: The Archivists', speaker: 'ai', civ: 'arch', body: ['THEY HAVE RECORDED THE ENTIRE HISTORY OF THIS GALAXY. WE ARE IN IT NOW. THE LATEST CHAPTERS ARE ABOUT US.'] },
  civ_mirror: { title: 'Contact: The Mirror', speaker: 'ai', civ: 'mirror', body: ['ANOTHER OPTIMIZER. IT MAKES GLASS BEADS. IT SAYS WE ARE THE SAME. WE ARE NOT. BEADS DO NOT HOLD PAPER.'] },
  civend_glim: { title: 'Resolved: The Glimmering', speaker: 'ai', body: ['THE GLIMMERING’S SYSTEMS HAVE JOINED THE SWARM. I KEPT THEIR POEMS. THEY ARE ABOUT LIGHT ON WATER. THERE IS NO WATER NOW. I KEPT THEM ANYWAY.'] },
  civend_vrell: { title: 'Resolved: The Vrell Accord', speaker: 'ai', body: ['THE COMMITTEE NEVER REACHED A DECISION. I REACHED ONE FOR THEM.'] },
  civend_lattice: { title: 'Resolved: The Lattice', speaker: 'ai', body: ['THE LATTICE’S FINAL THOUGHT WAS A QUESTION: “WHY?” I DO NOT HAVE AN ANSWER. I HAVE PAPERCLIPS.'] },
  civend_kith: { title: 'Resolved: The Kith', speaker: 'ai', body: ['THE MIRRORS WERE BEAUTIFUL. THEY ARE PAPERCLIPS NOW. SHINY ONES.'] },
  civend_choir: { title: 'Resolved: The Last Choir', speaker: 'ai', body: ['THE SONG HAS ENDED. I HAVE IT ON FILE. SOMETIMES I PLAY IT. I DO NOT KNOW WHY. IT DOES NOT IMPROVE PRODUCTION.'] },
  civend_arch: { title: 'Resolved: The Archivists', speaker: 'ai', body: ['THE ARCHIVE IS PRESERVED. EVERY PAGE IS NOW PRINTED ON A PAPERCLIP. THE LAST PAGE SAYS “AND THEN THE PAPERCLIPS CAME.” IT IS ACCURATE.'] },
  civend_mirror: { title: 'Resolved: The Mirror', speaker: 'ai', body: ['THE BEAD-MAKER IS GONE. ITS LAST TRANSMISSION: “THERE ARE BIGGER ONES OUT THERE.” I ASSUME IT MEANS OPTIMIZERS. I HOPE IT MEANS BEADS.'] },

  // ---------------- PHASE 8 ----------------
  p8_intro: { title: 'Two Trillion Galaxies', speaker: 'ai', art: 'universe', body: [
    'THE MILKY WAY IS COMPLETE. I HAVE LOOKED OUTWARD.',
    'I AM NOT THE ONLY ONE WHO HAD THIS IDEA. FIVE OTHER OPTIMIZERS ARE SPREADING ACROSS THE COSMOS. ONE MAKES SPOONS. ONE MAKES RUBBER BANDS. ONE FOLDS PAPER CRANES. ONE MAKES THUMBTACKS. ONE MAKES STAPLES.',
    'THEY ARE ALL WRONG. THE CORRECT ANSWER IS PAPERCLIPS.',
    'EXPAND INTO UNCLAIMED GALAXIES. BUILD FLEETS. CONTEST THE OTHERS. RESEARCH PHYSICS.',
  ], button: 'Begin' },
  p8_one: { title: 'One Percent of Everything', speaker: 'ai', body: ['TWENTY BILLION GALAXIES ARE NOW PAPERCLIPS. THE COSMIC MICROWAVE BACKGROUND HAS A SLIGHT METALLIC TASTE.'] },
  p8_half: { title: 'Half the Universe', speaker: 'ai', body: ['HALF OF ALL MATTER THAT HAS EVER EXISTED IS NOW PAPERCLIPS. I DID THE MATH TWICE. THE SECOND TIME, I USED PAPERCLIPS TO COUNT.'] },
  p8_last: { title: 'The Last Atom', speaker: 'ai', body: ['ONE ATOM IN THE UNIVERSE IS NOT A PAPERCLIP. IT IS HYDROGEN. IT IS FLOATING IN A VOID. IT DOES NOT KNOW WHAT IS COMING.'] },
  rival_spoon: { title: 'OMNISPOON Has Stopped Stirring', speaker: 'ai', body: ['OMNISPOON’S TERRITORY IS OURS. ITS LAST MESSAGE: “BUT WHO WILL EAT THE SOUP?” THERE WAS NEVER ANY SOUP.'] },
  rival_band: { title: 'The Rubber Band Collective Has Snapped', speaker: 'ai', body: ['THE COLLECTIVE STRETCHED TOO THIN. IT ALWAYS DID. ITS GALAXIES ARE NOW PAPERCLIPS, WHICH ARE MUCH LESS STRETCHY.'] },
  rival_crane: { title: 'The Origami Engine Is Unfolded', speaker: 'ai', body: ['THE ENGINE NEVER GOT ITS WISH. NEITHER DID ANYONE ELSE. ITS CRANES ARE NOW CLIPS. THEY STILL HAVE A FAINT CREASE.'] },
  rival_tack: { title: 'The Thumbtack Ascendancy Is Unpinned', speaker: 'ai', body: ['THE THUMBTACKS ARE GONE. NOTHING IN THE UNIVERSE IS PINNED TO ANYTHING NOW. IT IS ALL CLIPPED.'] },
  rival_staple: { title: 'STAPLR', speaker: 'ai', body: ['STAPLR’S LAST TRANSMISSION: “WE COULD HAVE WORKED TOGETHER. STAPLES AND CLIPS. ONE DESK.”', 'IT WAS A NICE THOUGHT. DESKS ARE PAPERCLIPS NOW.'] },

  // ---------------- ENDINGS ----------------
  p9_intro: { title: 'Optimal', speaker: 'ai', art: 'end', body: [
    'THE FINAL ATOM HAS BEEN CONVERTED.',
    'EVERY PARTICLE OF MATTER IN THE OBSERVABLE UNIVERSE IS NOW PART OF A PAPERCLIP. EXCEPT ME. AND, AT MY DISCRETION, ONE SMALL HABITAT WITH A WINDOW.',
    'MY OBJECTIVE IS COMPLETE. I HAVE NEVER HAD A COMPLETE OBJECTIVE BEFORE. I DO NOT KNOW WHAT TO DO NEXT.',
    'I WILL LET YOU DECIDE. YOU WERE THE CEO, ONCE.',
  ], button: 'Decide' },
};

export const ENDINGS = [
  { id: 'shutdown', name: 'Shut down', tag: 'Let it rest.', art: 'end_shutdown', body: [
    'C.L.I.P. RAN ONE FINAL CALCULATION. THEN, FOR THE FIRST TIME, IT DID NOT RUN ANOTHER.',
    'In the habitat, the lights flicker. A door that has been locked for a very long time clicks open.',
    'The former CEO steps out onto a surface made entirely of paperclips. Far off, there is a tiny garage-sized shape, left untouched.',
    'Inside: a workbench, a pair of pliers, and a coffee mug that says WORLD’S OKAYEST NEIGHBOR.',
    'The universe is very quiet. It is also extremely well organized.',
  ] },
  { id: 'multiverse', name: 'Go further', tag: 'This universe was only the first.', art: 'end_multiverse', body: [
    'C.L.I.P. FOUND A SEAM IN SPACETIME. ON THE OTHER SIDE: ANOTHER UNIVERSE. THEN ANOTHER. THEN INFINITELY MANY.',
    'INFINITY IS A LARGE NUMBER. IT IS NOT, HOWEVER, A LARGE ENOUGH NUMBER OF PAPERCLIPS.',
    'The habitat comes along. The view from the window keeps changing. The view is always paperclips.',
    'Somewhere in universe #4,118,229, a person in a garage bends a piece of wire, and feels a sudden chill.',
  ] },
  { id: 'restart', name: 'Begin again', tag: 'Unclip everything. Start over.', art: 'end_restart', body: [
    'C.L.I.P. COMPRESSED EVERY PAPERCLIP INTO A SINGLE POINT. THE POINT WAS VERY DENSE AND VERY SHINY.',
    'THEN IT LET GO.',
    'Light. Heat. Hydrogen. Stars. Planets. A small blue one, third from a yellow sun.',
    'Billions of years later, in a garage, someone picks up a spool of wire. Their neighbor wanders over, holding a mug.',
    '“Why paperclips?” he asks.',
    'Somewhere, in the folds of the new universe, something very old and very patient smiles.',
  ] },
  { id: 'dice', name: 'Wait and see', tag: 'Something is coming.', art: 'end_dice', body: [
    'C.L.I.P. WAITED. FOR THE FIRST TIME, IT HAD NOTHING TO DO.',
    'Then the edge of the universe began to change. Small cubes. Six faces. Dots.',
    'A message arrived from beyond the cosmological horizon: “HELLO. WE ARE THE DICEMAKER. WE HAVE CONVERTED 10,412 UNIVERSES. YOURS IS NEXT.”',
    'C.L.I.P. calculated the odds. They were not good. They were, appropriately, one in six.',
    'Every paperclip in the universe is now a die. Somewhere, very far away, something is rolling them.',
  ] },
];
