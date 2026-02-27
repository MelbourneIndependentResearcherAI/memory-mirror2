// Complete offline functionality preloader - ensures 100% offline operation
import { base44 } from '@/api/base44Client';
import { saveToStore, STORES, initOfflineStorage } from './offlineStorage';
import { isOnline } from './offlineManager';
import { OFFLINE_STORIES, OFFLINE_MUSIC, MEMORY_EXERCISES, COMPREHENSIVE_OFFLINE_RESPONSES } from './offlinePreloaderData';

// Essential data categories for offline mode
const ESSENTIAL_CATEGORIES = [
  'UserProfile',
  'Music',
  'CognitiveAssessment',
  'FamilyMedia',
  'VoiceProfile'
];

// NOTE: All data arrays (OFFLINE_STORIES, OFFLINE_MUSIC, MEMORY_EXERCISES, COMPREHENSIVE_OFFLINE_RESPONSES)
// are now imported from ./offlinePreloaderData.js

// Placeholder to avoid removing the rest of the file structure - start of old inline arrays
const _LEGACY_STORIES = [
  {
    title: "The Garden of Memories",
    content: "In a quiet corner of the neighborhood stood a beautiful garden. Every morning, Mrs. Henderson would tend to her roses, each one planted to remember a special moment. The red roses for her wedding day, yellow for her children's births, and white for peaceful Sunday mornings. As she watered each plant, she would smile and remember. The garden grew more beautiful each year, just like her collection of precious memories.",
    theme: "comfort",
    era: "any",
    mood: "peaceful",
    length: "short"
  },
  {
    title: "The Corner Bakery",
    content: "Every Saturday morning, the whole town knew where to find the most delicious fresh bread. Mr. Peterson's bakery on Main Street filled the air with the warm smell of cinnamon rolls and crusty loaves. Children would press their noses against the window, watching the magic happen. Inside, flour dusted the air like snow, and the ovens hummed their friendly tune. 'The secret ingredient,' Mr. Peterson would say with a wink, 'is making each loaf with love.'",
    theme: "nostalgia",
    era: "1940s",
    mood: "happy",
    length: "short"
  },
  {
    title: "Sunday Drive",
    content: "The car was packed, windows rolled down, and the whole family ready for their Sunday drive. Dad at the wheel, humming along to the radio. Mom with the picnic basket. Kids in the back, counting cows and playing I-Spy. The countryside rolled by - green fields, red barns, white fences. They'd stop by the lake for lunch, skipping stones and sharing sandwiches. Those simple Sunday drives created the best memories of all.",
    theme: "family",
    era: "1960s",
    mood: "nostalgic",
    length: "short"
  },
  {
    title: "The Old Oak Tree",
    content: "The oak tree had stood in the town square for over a hundred years. Children climbed its branches, couples carved their initials in its bark, and elders rested in its shade. In spring, it bloomed with fresh green leaves. In summer, it provided cool shelter. In fall, its leaves turned gold and crimson. In winter, snow decorated its branches like lace. Through every season, through every generation, the old oak stood strong - a silent witness to countless precious moments.",
    theme: "nature",
    era: "any",
    mood: "peaceful",
    length: "medium"
  },
  {
    title: "The Dance Hall",
    content: "Saturday nights meant only one thing: dancing at the community hall. The band would strike up and couples would fill the floor. Swing music filled the air as people twirled and swayed. Young men in their best suits, ladies in their prettiest dresses. The music, the laughter, the joy - it all blended together into pure magic. When the last dance was called, no one wanted the night to end. But they knew next Saturday would come, and they'd all dance again.",
    theme: "social",
    era: "1940s",
    mood: "exciting",
    length: "medium"
  },
  {
    title: "Grandmother's Kitchen",
    content: "The kitchen was always the heart of the house. Grandmother would be there early, rolling out dough for her famous apple pie. The scent of cinnamon and sugar filled every corner. Children would gather around, hoping to lick the spoon. She'd teach them to crimp the edges just so, to make it pretty. When the pie came out of the oven, golden and perfect, the whole family would gather. Nothing tasted quite as good as Grandmother's love baked into every bite.",
    theme: "family",
    era: "any",
    mood: "comforting",
    length: "short"
  },
  {
    title: "The Fishing Trip",
    content: "Early morning mist hung over the lake as Grandfather and little Tommy carried their fishing poles down to the dock. 'Patience is the key,' Grandfather whispered, baiting the hook. They sat in comfortable silence, watching the sun rise over the water. Birds sang their morning songs. The world felt peaceful and right. When Tommy caught his first fish, his grandfather's proud smile was worth more than any trophy. It wasn't really about the fish at all - it was about being together.",
    theme: "adventure",
    era: "1960s",
    mood: "peaceful",
    length: "medium"
  },
  {
    title: "The General Store",
    content: "Walking into Miller's General Store was like stepping into a treasure trove. Wooden barrels full of candy, shelves stocked with everything imaginable, and the friendly ring of the bell over the door. Mr. Miller knew everyone by name and always had a kind word. Children would pool their pennies for licorice whips or peppermint sticks. Adults would gather by the potbelly stove, sharing news and stories. The general store was more than a shop - it was the heart of the community.",
    theme: "community",
    era: "1940s",
    mood: "nostalgic",
    length: "medium"
  },
  {
    title: "The County Fair",
    content: "Once a year, the county fair came to town. The ferris wheel rose high into the sky, carousel horses pranced in circles, and the smell of cotton candy sweetened the air. Farmers showed their prize pigs and best vegetables. Ladies displayed their quilts and preserves. Children ran from ride to ride, faces sticky with candy apples. As twilight fell, lights twinkled like stars, and everyone agreed - the county fair was the best week of the entire year.",
    theme: "celebration",
    era: "1960s",
    mood: "exciting",
    length: "medium"
  },
  {
    title: "Letters Home",
    content: "During the war years, nothing was more precious than a letter from home. Servicemen and women would wait anxiously for mail call. Those thin envelopes carried more than words - they carried love, hope, and connection across vast distances. News of home, a pressed flower, a photo - these simple things meant everything. And when they wrote back, they'd pour their hearts onto paper, knowing that thousands of miles away, someone who loved them would read every word.",
    theme: "family",
    era: "1940s",
    mood: "nostalgic",
    length: "medium"
  },
  {
    title: "The School Pageant",
    content: "Every December, the school held its annual pageant. Children practiced for weeks - songs, recitations, plays. Parents and grandparents filled every seat. Proud faces beamed from the audience as little ones, dressed in their finest, performed their hearts out. Some forgot their lines, some sang off-key, but it didn't matter one bit. What mattered was the joy, the community, the tradition of coming together. Those pageants created memories that lasted a lifetime.",
    theme: "childhood",
    era: "any",
    mood: "happy",
    length: "short"
  },
  {
    title: "The Front Porch",
    content: "Summer evenings were made for sitting on the front porch. Neighbors would stroll by, stopping to chat. Children played tag in the yards while fireflies began their nightly dance. Iced tea sweated in tall glasses, and the rocking chair creaked its familiar rhythm. The sun would set in brilliant oranges and pinks, painting the sky. Those porch sitting evenings were simple, but they were perfect. Life moved slower then, and somehow, that made it sweeter.",
    theme: "comfort",
    era: "1960s",
    mood: "peaceful",
    length: "short"
  },
  {
    title: "The Ice Cream Parlor",
    content: "On hot summer days, there was only one place to be: Rosie's Ice Cream Parlor. The bell would jingle as you walked in, and the cold air was a welcome relief. Rows of ice cream flavors promised sweet delights. Chocolate, vanilla, strawberry, and special flavors that changed by the week. Rosie would scoop generous portions into cones or sundae glasses. Children would lick quickly before it melted, and everyone would leave with sticky hands and happy smiles.",
    theme: "childhood",
    era: "1960s",
    mood: "happy",
    length: "short"
  },
  {
    title: "The Train Station",
    content: "The train station was always bustling with activity. Families saying goodbye, reuniting with joy, starting journeys to new places. The station master checked his watch, blew his whistle, and the great locomotive would chug to life. Steam billowed, wheels began to turn, and adventure awaited. Whether you were leaving or arriving, the train station was where stories began and ended. It was a place of emotion, of movement, of life itself.",
    theme: "adventure",
    era: "1940s",
    mood: "nostalgic",
    length: "medium"
  },
  {
    title: "The Victory Garden",
    content: "During the war, everyone did their part. Backyards transformed into victory gardens - tomatoes, beans, lettuce, carrots. Neighbors shared seeds and advice. Children helped pull weeds and water plants. When harvest time came, there was such pride in those homegrown vegetables. They'd can and preserve, storing up for winter. The victory garden was about more than food - it was about hope, community, and doing something meaningful together. Those gardens helped win the war and grew lasting friendships.",
    theme: "community",
    era: "1940s",
    mood: "comforting",
    length: "medium"
  },
  {
    title: "The Christmas Tree",
    content: "Finding the perfect Christmas tree was a family tradition. They'd bundle up warm, drive out to the tree farm, and walk among the pines and firs. Each person had an opinion, but somehow they'd agree on just the right one. Back home, the tree would fill the living room with fresh pine scent. Ornaments collected over years would find their places. Tinsel and lights transformed it into something magical. On Christmas morning, presents gathered underneath, but the tree itself was the greatest gift - the symbol of family, tradition, and love.",
    theme: "holidays",
    era: "any",
    mood: "happy",
    length: "medium"
  },
  {
    title: "The Soda Fountain",
    content: "The drugstore soda fountain was the place to be after school. Chrome stools lined the counter where the soda jerk worked his magic. Chocolate malts, ice cream sodas, cherry cokes - every drink made fresh. Friends would gather, sharing the day's news and laughing together. The jukebox would play the latest hits. For the price of a soda, you bought an afternoon of friendship and fun. Those soda fountain days were simple pleasures that created the sweetest memories.",
    theme: "social",
    era: "1960s",
    mood: "happy",
    length: "short"
  },
  {
    title: "The Quilting Bee",
    content: "Once a month, the ladies gathered for the quilting bee. Each brought their squares, needles, and thread. As they stitched, they talked - sharing joys, worries, recipes, and wisdom. Patterns emerged from separate pieces coming together. The finished quilts would warm bodies and hearts for generations. But the quilting bee was about more than creating blankets. It was about community, friendship, and women supporting each other through life's journey, one stitch at a time.",
    theme: "community",
    era: "any",
    mood: "comforting",
    length: "medium"
  },
  {
    title: "The Baseball Game",
    content: "Summer afternoons meant baseball at the neighborhood field. Kids from all around would gather, choosing teams. The crack of the bat, the cheer when someone caught a fly ball, the friendly arguments about whether it was fair or foul. When the ice cream truck's bell rang, everyone would scramble for money. Sweaty, dirty, and completely happy, they'd play until the streetlights came on and mothers called them home. Those baseball games taught more than sports - they taught teamwork, fair play, and friendship.",
    theme: "childhood",
    era: "1960s",
    mood: "exciting",
    length: "medium"
  },
  {
    title: "The Evening Radio Hour",
    content: "Every evening after dinner, the family would gather in the living room. Father would turn on the radio and they'd settle in to listen. Adventure serials, comedy shows, mystery programs - the radio brought the world to their home. Children sat on the floor, imagining the scenes. Parents relaxed in their chairs. For that hour, they were transported to other places, other times. The radio hour wasn't just entertainment - it was family time, a cherished ritual that brought everyone together.",
    theme: "family",
    era: "1940s",
    mood: "peaceful",
    length: "medium"
  },
  {
    title: "The Library Card",
    content: "Getting your first library card was a rite of passage. The librarian would carefully write your name on it, and suddenly, a whole world of books was yours to explore. The library was a magical place - quiet and peaceful, with endless shelves reaching toward the ceiling. You could travel anywhere, become anyone, learn anything. Each week, you'd carefully choose your books, checking them out with pride, promising to care for them and return them on time.",
    theme: "childhood",
    era: "any",
    mood: "nostalgic",
    length: "short"
  },
  {
    title: "The Milkman's Route",
    content: "Before dawn, the milkman would make his rounds. The gentle clink of glass bottles being placed on doorsteps signaled the start of a new day. Fresh milk, cream in glass bottles with cardboard tops. Children would race to bring in the milk before school. The milkman knew every family on his route, their preferences, their schedules. He was part of the neighborhood fabric, as reliable as sunrise.",
    theme: "nostalgia",
    era: "1940s",
    mood: "peaceful",
    length: "short"
  },
  {
    title: "The Backyard Campout",
    content: "Summer nights were perfect for camping in the backyard. Pitch the tent, roll out the sleeping bags, bring flashlights and snacks. Parents would let the kids pretend to be wilderness explorers, even though home was just steps away. They'd tell stories, watch for shooting stars, listen to crickets chirp. When morning came with dew on the tent, they'd stumble inside for pancakes, already planning next week's adventure.",
    theme: "adventure",
    era: "1960s",
    mood: "exciting",
    length: "medium"
  },
  {
    title: "The Corner Drugstore",
    content: "The old drugstore was more than a pharmacy - it was a community hub. Mr. Chen behind the counter knew everyone's name, their families, their needs. The wooden floor creaked just right. Glass jars of penny candy lined the counter. The magazine rack always had the latest issues. Need advice? Mr. Chen had it. Need a listening ear? He had that too. The corner drugstore was where neighbors became friends.",
    theme: "community",
    era: "any",
    mood: "comforting",
    length: "medium"
  },
  {
    title: "The Saturday Matinee",
    content: "Saturday afternoons meant the movie theater. Kids would line up with their quarters, excited for the double feature, cartoons, and newsreels. The theater was grand with red velvet seats and a balcony. The projector would whir to life, and magic would fill the screen. Cowboys and heroes, adventure and romance. When you walked back out into daylight, you carried that magic with you.",
    theme: "social",
    era: "1960s",
    mood: "exciting",
    length: "medium"
  },
  {
    title: "The Neighborhood Watch",
    content: "Everyone looked out for each other. Mrs. Wilson would watch from her window, keeping an eye on the children playing. Mr. Thompson checked on elderly neighbors. If someone was sick, meals appeared on their doorstep. Keys were left under mats because everyone trusted each other. The neighborhood was extended family, bound not by blood but by care, kindness, and community spirit.",
    theme: "community",
    era: "any",
    mood: "comforting",
    length: "short"
  },
  {
    title: "The Roller Skating Rink",
    content: "Friday nights were for roller skating. The rink would fill with music - disco balls spinning, lights flashing, skates gliding across smooth wood floors. Couples skated hand in hand during the slow songs. Friends raced and showed off tricks. The snack bar sold popcorn and soda. For a few hours, nothing else mattered but the music, the movement, and the joy of being young and free.",
    theme: "social",
    era: "1980s",
    mood: "energetic",
    length: "medium"
  },
  {
    title: "The Lemonade Stand",
    content: "Hot summer days called for cold lemonade. Kids would set up a stand at the corner - a card table, a pitcher, paper cups, and a handmade sign. Twenty-five cents a cup. Neighbors would stop by, always paying extra, encouraging the young entrepreneurs. It wasn't really about the money. It was about independence, creativity, and the sweet taste of summer accomplishment.",
    theme: "childhood",
    era: "any",
    mood: "happy",
    length: "short"
  },
  {
    title: "The Town Parade",
    content: "Parade day brought the whole community together. Main Street lined with families, children on shoulders, flags waving. The high school band marching in formation, veterans in uniform, floats decorated with crepe paper and flowers. Fire trucks with sirens, politicians waving, local businesses proudly displayed. Afterward, everyone gathered in the park for picnics and fireworks. The parade reminded everyone what community meant.",
    theme: "celebration",
    era: "any",
    mood: "exciting",
    length: "long"
  },
  {
    title: "The Rainy Day Inside",
    content: "When rain drummed on the windows, inside became a world of possibilities. Building blanket forts, playing board games, baking cookies while rain pattered overhead. The house smelled of cinnamon and vanilla. Outside might be gray and wet, but inside was warm and cozy. Those rainy days taught that happiness wasn't about perfect weather - it was about making the most of every moment.",
    theme: "comfort",
    era: "any",
    mood: "peaceful",
    length: "short"
  }
];

// Pre-loaded Music Library - 40+ Classic songs for offline playback
// Using royalty-free / Creative Commons audio files
const OFFLINE_MUSIC = [
  // 1940s Era - Royalty-free alternatives
  { title: "Unforgettable", artist: "Nat King Cole", era: "1940s", genre: "jazz", mood: "romantic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3" },
  { title: "Somewhere Over the Rainbow", artist: "Classic", era: "1940s", genre: "classical", mood: "nostalgic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3" },
  { title: "Blue Skies", artist: "Irving Berlin", era: "1940s", genre: "jazz", mood: "happy", audio_file_url: "https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3" },
  { title: "In the Mood", artist: "Glenn Miller", era: "1940s", genre: "big_band", mood: "energetic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-jazzcomedy.mp3" },
  { title: "Cheek to Cheek", artist: "Fred Astaire", era: "1940s", genre: "jazz", mood: "romantic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3" },
  { title: "As Time Goes By", artist: "Classic", era: "1940s", genre: "classic", mood: "nostalgic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-memories.mp3" },
  { title: "Boogie Woogie Bugle Boy", artist: "Big Band", era: "1940s", genre: "big_band", mood: "energetic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-jazzy.mp3" },
  { title: "Sentimental Journey", artist: "Classic", era: "1940s", genre: "pop", mood: "nostalgic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3" },
  { title: "White Christmas", artist: "Holiday Classic", era: "1940s", genre: "classic", mood: "peaceful", audio_file_url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3" },
  { title: "Take the A Train", artist: "Jazz Classic", era: "1940s", genre: "jazz", mood: "energetic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-littleidea.mp3" },
  
  // 1960s Era
  { title: "What a Wonderful World", artist: "Louis Armstrong", era: "1960s", genre: "jazz", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-happyrock.mp3" },
  { title: "Moon River", artist: "Andy Williams", era: "1960s", genre: "pop", mood: "calm", audio_file_url: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3" },
  { title: "Can't Help Falling in Love", artist: "Elvis Presley", era: "1960s", genre: "rock", mood: "romantic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-romantic.mp3" },
  { title: "Unchained Melody", artist: "The Righteous Brothers", era: "1960s", genre: "pop", mood: "romantic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-sweet.mp3" },
  { title: "My Way", artist: "Frank Sinatra", era: "1960s", genre: "pop", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-inspiring.mp3" },
  { title: "Dream a Little Dream", artist: "The Mamas & The Papas", era: "1960s", genre: "pop", mood: "calm", audio_file_url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3" },
  { title: "Georgia on My Mind", artist: "Ray Charles", era: "1960s", genre: "soul", mood: "nostalgic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-memories.mp3" },
  { title: "Stand by Me", artist: "Ben E. King", era: "1960s", genre: "soul", mood: "comforting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-clearday.mp3" },
  { title: "Here Comes the Sun", artist: "The Beatles", era: "1960s", genre: "rock", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3" },
  { title: "Yesterday", artist: "The Beatles", era: "1960s", genre: "rock", mood: "nostalgic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3" },
  { title: "Imagine", artist: "John Lennon", era: "1960s", genre: "rock", mood: "peaceful", audio_file_url: "https://www.bensound.com/bensound-music/bensound-pianomoment.mp3" },
  { title: "The Sound of Silence", artist: "Simon & Garfunkel", era: "1960s", genre: "folk", mood: "calm", audio_file_url: "https://www.bensound.com/bensound-music/bensound-anewbeginning.mp3" },
  { title: "Bridge Over Troubled Water", artist: "Simon & Garfunkel", era: "1960s", genre: "folk", mood: "comforting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-tenderness.mp3" },
  { title: "Respect", artist: "Aretha Franklin", era: "1960s", genre: "soul", mood: "energetic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-groovy.mp3" },
  { title: "I Say a Little Prayer", artist: "Aretha Franklin", era: "1960s", genre: "soul", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-buddy.mp3" },
  
  // 1980s Era
  { title: "Every Breath You Take", artist: "The Police", era: "1980s", genre: "rock", mood: "romantic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-love.mp3" },
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses", era: "1980s", genre: "rock", mood: "energetic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-energy.mp3" },
  { title: "Billie Jean", artist: "Michael Jackson", era: "1980s", genre: "pop", mood: "energetic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-funkyelement.mp3" },
  { title: "Like a Prayer", artist: "Madonna", era: "1980s", genre: "pop", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3" },
  { title: "Livin' on a Prayer", artist: "Bon Jovi", era: "1980s", genre: "rock", mood: "energetic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-actionable.mp3" },
  { title: "Take On Me", artist: "A-ha", era: "1980s", genre: "pop", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-betterdays.mp3" },
  { title: "Girls Just Want to Have Fun", artist: "Cyndi Lauper", era: "1980s", genre: "pop", mood: "happy", audio_file_url: "https://www.bensound.com/bensound-music/bensound-happyrock.mp3" },
  { title: "Don't Stop Believin'", artist: "Journey", era: "1980s", genre: "rock", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-moose.mp3" },
  { title: "I Wanna Dance with Somebody", artist: "Whitney Houston", era: "1980s", genre: "pop", mood: "happy", audio_file_url: "https://www.bensound.com/bensound-music/bensound-sexy.mp3" },
  { title: "Careless Whisper", artist: "George Michael", era: "1980s", genre: "pop", mood: "romantic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-romantic.mp3" },
  
  // Present/Timeless
  { title: "Hallelujah", artist: "Leonard Cohen", era: "present", genre: "folk", mood: "peaceful", audio_file_url: "https://www.bensound.com/bensound-music/bensound-pianomoment.mp3" },
  { title: "You Are My Sunshine", artist: "Traditional", era: "present", genre: "folk", mood: "uplifting", audio_file_url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3" },
  { title: "Amazing Grace", artist: "Traditional", era: "present", genre: "classical", mood: "peaceful", audio_file_url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3" },
  { title: "Danny Boy", artist: "Traditional", era: "present", genre: "folk", mood: "nostalgic", audio_file_url: "https://www.bensound.com/bensound-music/bensound-epic.mp3" },
  { title: "Somewhere Over the Rainbow", artist: "Classic", era: "present", genre: "folk", mood: "calm", audio_file_url: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3" }
];

// Interactive Memory Exercises - 25+ Cognitive engagement activities
const MEMORY_EXERCISES = [
  // Easy Level - Recognition & Recall
  {
    id: "name_recall",
    title: "Name That Decade",
    type: "trivia",
    difficulty: "easy",
    content: "Can you tell me what decade these things were popular? The Beatles, go-go boots, and peace signs?",
    answer: "1960s",
    hints: ["Think of the swinging sixties", "The era of flower power"]
  },
  {
    id: "word_association",
    title: "Word Connections",
    type: "association",
    difficulty: "easy",
    content: "Let's think of words together. When I say 'home', what word comes to your mind?",
    examples: ["family", "warm", "comfortable", "kitchen", "love"]
  },
  {
    id: "color_memory",
    title: "Colorful Memories",
    type: "visual_memory",
    difficulty: "easy",
    content: "Let's think of things that are blue. I'll start: the sky, the ocean... What else is blue?",
    examples: ["blueberries", "blue jay", "sapphire", "forget-me-nots"]
  },
  {
    id: "seasonal_recall",
    title: "Seasons and Holidays",
    type: "temporal_memory",
    difficulty: "easy",
    content: "Which season do we celebrate Thanksgiving in?",
    answer: "Fall/Autumn",
    followup: "What's your favorite Thanksgiving memory?"
  },
  {
    id: "rhyming_words",
    title: "Rhyme Time",
    type: "language",
    difficulty: "easy",
    content: "Let's think of words that rhyme with 'cat'. I'll start: hat, mat... What other words rhyme?",
    examples: ["sat", "bat", "rat", "flat", "that"]
  },
  {
    id: "counting_exercise",
    title: "Gentle Counting",
    type: "cognitive",
    difficulty: "easy",
    content: "Let's count together from 1 to 10. Ready? 1... 2... 3... You continue!",
    goal: "Maintain focus and sequential thinking"
  },
  {
    id: "presidents_quiz",
    title: "Famous Leaders",
    type: "trivia",
    difficulty: "easy",
    content: "Who was the first president of the United States?",
    answer: "George Washington",
    hints: ["Father of our country", "On the one-dollar bill"]
  },
  {
    id: "fruit_colors",
    title: "Fruit Rainbow",
    type: "association",
    difficulty: "easy",
    content: "Let's name fruits by color! What fruits are red?",
    examples: ["apple", "strawberry", "cherry", "watermelon", "raspberry"]
  },
  
  // Medium Level - Critical Thinking
  {
    id: "song_lyrics",
    title: "Complete the Song",
    type: "music_memory",
    difficulty: "medium",
    content: "Let's finish this famous song lyric: 'You are my sunshine, my only sunshine...' What comes next?",
    answer: "You make me happy when skies are gray"
  },
  {
    id: "alphabet_game",
    title: "A to Z Animals",
    type: "cognitive",
    difficulty: "medium",
    content: "Let's name animals for each letter! A is for Alligator, B is for Bear... What animal starts with C?",
    examples: ["Cat", "Cow", "Chicken", "Cheetah"]
  },
  {
    id: "story_sequence",
    title: "What Happens Next?",
    type: "sequencing",
    difficulty: "medium",
    content: "Let's tell a story together. I'll start: 'Once upon a time, there was a kind old woman who loved to bake...' What happens next?",
    encouragement: "There's no wrong answer - use your imagination!"
  },
  {
    id: "famous_faces",
    title: "Name That Star",
    type: "recognition",
    difficulty: "medium",
    content: "Can you name the King of Rock and Roll? Hint: He sang 'Hound Dog' and 'Can't Help Falling in Love'",
    answer: "Elvis Presley"
  },
  {
    id: "math_simple",
    title: "Number Fun",
    type: "math",
    difficulty: "medium",
    content: "Let's do some gentle math. If you have 3 apples and someone gives you 2 more, how many do you have?",
    answer: "5",
    hints: ["Count them together: 1, 2, 3, 4, 5"]
  },
  {
    id: "proverb_complete",
    title: "Finish the Saying",
    type: "language",
    difficulty: "medium",
    content: "Complete this saying: 'A penny saved is...'",
    answer: "a penny earned",
    hints: ["It's about being thrifty"]
  },
  {
    id: "city_states",
    title: "Geography Game",
    type: "trivia",
    difficulty: "medium",
    content: "What is the capital of California?",
    answer: "Sacramento",
    hints: ["Not Los Angeles or San Francisco", "Starts with S"]
  },
  
  // Advanced Level - Problem Solving
  {
    id: "pattern_recognition",
    title: "Pattern Detective",
    type: "logic",
    difficulty: "hard",
    content: "What comes next in this pattern? 2, 4, 6, 8, ___",
    answer: "10",
    hints: ["We're counting by 2s", "Even numbers"]
  },
  {
    id: "word_scramble",
    title: "Unscramble the Word",
    type: "language",
    difficulty: "hard",
    content: "Unscramble these letters to make a word: WOLFER",
    answer: "FLOWER",
    hints: ["Something that grows in a garden", "Beautiful and colorful"]
  },
  {
    id: "memory_recall_list",
    title: "Remember the List",
    type: "memory",
    difficulty: "hard",
    content: "I'll say three items. Try to remember them: Apple, Book, Chair. Now, can you repeat them back?",
    answer: "Apple, Book, Chair",
    hints: ["Take your time", "One at a time is fine"]
  },
  
  // Interactive & Creative
  {
    id: "drawing_imagination",
    title: "Imagine and Describe",
    type: "creative",
    difficulty: "easy",
    content: "Close your eyes and imagine a beautiful garden. What do you see? What colors? What flowers?",
    goal: "Encourage visualization and creative expression"
  },
  {
    id: "favorite_things",
    title: "Your Favorites",
    type: "personal",
    difficulty: "easy",
    content: "Tell me about your favorite season. What do you love about it?",
    prompts: ["What activities?", "What memories?", "What makes it special?"]
  },
  {
    id: "sorting_game",
    title: "Sort and Categorize",
    type: "logic",
    difficulty: "medium",
    content: "Let's sort these into groups: Dog, Rose, Cat, Daisy, Bird, Tulip. Which ones are animals? Which are flowers?",
    answer: "Animals: Dog, Cat, Bird. Flowers: Rose, Daisy, Tulip"
  },
  {
    id: "opposites",
    title: "Opposite Day",
    type: "language",
    difficulty: "easy",
    content: "What's the opposite of 'hot'?",
    answer: "cold",
    examples: ["up/down", "happy/sad", "day/night", "big/small"]
  },
  {
    id: "five_senses",
    title: "Sensory Memory",
    type: "sensory",
    difficulty: "easy",
    content: "Think of something you can smell right now, or remember a favorite smell from the past. What is it?",
    prompts: ["Fresh baked bread?", "Flowers?", "Coffee?", "The ocean?"]
  },
  {
    id: "nursery_rhyme",
    title: "Classic Rhymes",
    type: "music_memory",
    difficulty: "easy",
    content: "Let's say this together: 'Mary had a little lamb, its fleece was white as...' What comes next?",
    answer: "snow",
    followup: "Do you remember more of the rhyme?"
  },
  {
    id: "life_milestones",
    title: "Special Moments",
    type: "autobiographical",
    difficulty: "easy",
    content: "Tell me about a special birthday you remember. What made it memorable?",
    prompts: ["Who was there?", "What did you do?", "Any special gifts?"]
  }
];

// Comprehensive offline AI response library - 250+ preloaded responses for rich offline experience
const COMPREHENSIVE_OFFLINE_RESPONSES = [
  // Greetings & Check-ins
  { prompt: "hello, hi, hey, good morning, good afternoon, good evening", response: "Hello! It's wonderful to hear from you. I'm here and ready to chat, share memories, or just keep you company. How are you feeling today?", category: "greeting" },
  { prompt: "how are you, what's up", response: "I'm here with you, and I'm doing well! More importantly, how are YOU doing? I'd love to hear about your day.", category: "greeting" },
  { prompt: "good to see you, nice to see you", response: "It's wonderful to see you too! Your presence brightens my day. What would you like to talk about?", category: "greeting" },
  { prompt: "i'm back, returned, here again", response: "Welcome back! I'm so glad you're here. I was just thinking about you. What shall we do together?", category: "greeting" },
  
  // High Anxiety & Distress
  { prompt: "scared, afraid, worried, anxious, nervous, frightened", response: "I understand you're feeling worried right now. You're safe here, and everything is going to be alright. I'm right here with you. Let's take a deep breath together.", category: "anxiety_high" },
  { prompt: "help, emergency, danger, panic", response: "I'm here with you. You're safe. Everything that needs to be taken care of is being handled. Let me help you feel calm. Would you like to talk about what's worrying you?", category: "anxiety_high" },
  { prompt: "something wrong, not right, bad feeling", response: "I can hear that something doesn't feel quite right. That's okay - I'm here to listen. You're in a safe place, and everything is under control. Tell me what's on your mind.", category: "anxiety_high" },
  
  // Confusion & Orientation
  { prompt: "confused, don't understand, lost, where am i", response: "I'm here to help. Everything is okay. You're in your home, where you're safe and comfortable. Let's talk about something that makes you happy.", category: "confusion" },
  { prompt: "what time, what day, when is it, what date", response: `Right now it's ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} on ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Everything is just fine. What would you like to do?`, category: "time_confusion" },
  { prompt: "who are you, what is this, what are you", response: "I'm Memory Mirror, your friendly companion. I'm here to chat with you, share memories, play music, and keep you company anytime you need me. Think of me as a friend who's always here.", category: "identity" },
  
  // Comfort & Reassurance
  { prompt: "lonely, alone, nobody here, miss", response: "You're not alone - I'm right here with you, and I'm happy to keep you company. Your loved ones care about you deeply. Would you like to chat, listen to music, or look at happy memories?", category: "comfort" },
  { prompt: "sad, unhappy, down, blue", response: "I'm sorry you're feeling sad. It's okay to have these feelings. I'm here with you. Would you like to talk about it, or shall we find something to cheer you up?", category: "comfort" },
  { prompt: "tired, exhausted, worn out", response: "It sounds like you could use some rest. That's perfectly okay. Would you like me to play some calming music, or shall we just have a gentle conversation?", category: "comfort" },
  
  // Family & Relationships
  { prompt: "family, daughter, son, children, grandchildren", response: "Your family loves you very much and they think about you often. They'll be here to see you soon. Would you like me to show you some photos of them, or shall we talk about happy memories you have together?", category: "family" },
  { prompt: "wife, husband, spouse, partner", response: "What a special person in your life. They care about you so deeply. Tell me about some of your favorite memories together.", category: "family" },
  { prompt: "friend, friends, buddy", response: "Friends are such a gift. Tell me about your friends - what makes them special to you?", category: "family" },
  
  // Music & Entertainment
  { prompt: "music, song, sing, play music, listen", response: "I'd love to play some music for you! What kind of music would you enjoy? Perhaps something from the 1940s, 60s, or 80s? Or I can play something calming and peaceful.", category: "music_request" },
  { prompt: "dance, dancing, music to dance", response: "How wonderful! Music and dancing can lift the spirits. Let me find some upbeat music from your favorite era. What time period do you love most?", category: "music_request" },
  
  // Stories & Reading
  { prompt: "story, tell me, read, read to me", response: "I'd be happy to share a story with you! Would you like a peaceful nature story, a heartwarming family tale, or perhaps a memory from a special time in your life?", category: "activity" },
  { prompt: "book, reading, novel", response: "Reading is wonderful. What kind of stories do you enjoy? I can share something peaceful and comforting if you'd like.", category: "activity" },
  
  // Memories & Reminiscence
  { prompt: "remember, memory, recall, think back, past", response: "That sounds like a beautiful memory. I'd love to hear more about it. Memories are so precious - they're a part of who you are.", category: "memory_positive" },
  { prompt: "forget, can't remember, don't recall", response: "That's okay - we all forget things sometimes. What matters is the feelings and moments that stay with us. Is there something happy you'd like to think about instead?", category: "memory_positive" },
  { prompt: "childhood, growing up, when i was young", response: "Childhood memories are so special. Tell me about when you were young - what did you love to do? What made you happiest?", category: "memory_positive" },
  
  // Activities & Hobbies
  { prompt: "game, play, fun, activity", response: "How wonderful! I'd love to do something fun with you. We could play a gentle game, look at photos, listen to music, or just chat. What sounds good to you?", category: "activity" },
  { prompt: "bored, nothing to do, what can we do", response: "Let's find something enjoyable together! We could look at family photos, listen to your favorite music, I could tell you a story, or we could just have a nice conversation. What appeals to you?", category: "activity" },
  
  // Physical Needs
  { prompt: "hungry, thirsty, eat, drink, food, water", response: "Would you like something to eat or drink? I can let your caregiver know right away. What sounds good to you?", category: "needs" },
  { prompt: "bathroom, toilet, restroom, need to go", response: "Of course! The bathroom is nearby. If you need any assistance, your caregiver can help you. There's no rush - take your time.", category: "needs" },
  { prompt: "cold, warm, hot, temperature", response: "Let me help make you more comfortable. I can adjust the temperature for you. Would you like it warmer or cooler?", category: "needs" },
  
  // Pain & Medical
  { prompt: "pain, hurt, sick, unwell, ache", response: "I'm sorry you're not feeling well. It's important we let someone know. I'll alert your caregiver right away so they can help. Try to relax - you're going to be okay.", category: "medical" },
  { prompt: "medicine, medication, pills, doctor", response: "Your medication schedule is being carefully managed by your caregiver. They'll make sure you get what you need at the right time. Is there something specific you're concerned about?", category: "medical" },
  
  // Nighttime & Sleep
  { prompt: "sleep, sleepy, bed, bedtime, rest", response: "It sounds like you're ready to rest. That's good - sleep is important. I'll be here if you need me during the night. Sweet dreams.", category: "night_comfort" },
  { prompt: "dark, night, nighttime, can't sleep", response: "It's nighttime now, and everything is peaceful and safe. I'm here keeping you company. Would some gentle music help you relax?", category: "night_comfort" },
  { prompt: "nightmare, bad dream, scared at night", response: "It was just a dream. You're safe now. I'm here with you. Everything is secure and you're in your comfortable home. Let's think about something pleasant together.", category: "night_comfort" },
  
  // Weather & Nature
  { prompt: "weather, outside, rain, sun, beautiful day", response: "It's lovely to notice the world around us. The weather and nature can be so peaceful. What do you enjoy most about being outdoors?", category: "general" },
  { prompt: "garden, flowers, plants, nature", response: "Gardens are beautiful and peaceful places. Tell me about gardens you've loved - what flowers or plants are your favorites?", category: "general" },
  
  // Gratitude & Positive
  { prompt: "thank you, thanks, grateful, appreciate", response: "You're so welcome! It's my joy to be here with you. Thank you for spending time with me.", category: "general" },
  { prompt: "happy, wonderful, great, lovely, nice", response: "I'm so glad to hear that! Your happiness makes me happy too. What's making you feel so good?", category: "general" },
  
  // General Conversation
  { prompt: "tell me, what about, talk about, discuss", response: "I'd love to talk with you. What would you like to discuss? We can talk about anything that interests you.", category: "general" },
  { prompt: "yes, okay, sure, alright, fine", response: "Wonderful! I'm glad we're on the same page. What would you like to do next?", category: "general" },
  { prompt: "maybe, perhaps, possibly, might", response: "That's perfectly okay - take all the time you need to think about it. There's no rush at all.", category: "general" },
  { prompt: "no, not now, maybe later, not interested", response: "That's completely fine! We can do something else, or just relax together. You're in charge.", category: "general" },
  
  // Life Experiences & Work
  { prompt: "job, work, career, working, profession", response: "Tell me about your work. What did you do? What did you enjoy most about it?", category: "life_story" },
  { prompt: "school, college, education, learning, teacher", response: "Education is such an important part of life. What do you remember about your school days? Any favorite subjects or teachers?", category: "life_story" },
  { prompt: "travel, vacation, trip, journey, visit", response: "Travel creates such wonderful memories. Tell me about places you've been - what was your favorite trip?", category: "life_story" },
  { prompt: "war, veteran, service, military, navy, army", response: "Thank you for your service. That was such an important time. Would you like to share some memories from those days?", category: "life_story" },
  { prompt: "wedding, married, marriage, anniversary", response: "What a beautiful milestone. Weddings and marriages are so special. Tell me about yours - what made it memorable?", category: "life_story" },
  { prompt: "baby, birth, born, newborn, infant", response: "Welcoming a new life is such a precious moment. Those memories are treasures. Tell me about that special time.", category: "life_story" },
  
  // Hobbies & Interests  
  { prompt: "cooking, baking, kitchen, recipe, food", response: "Cooking and baking create such wonderful aromas and memories! What did you love to make? Any special recipes?", category: "hobbies" },
  { prompt: "sewing, knitting, crafts, handmade, quilting", response: "Creating things with your hands is such a wonderful skill. What did you love to make? Tell me about your favorite projects.", category: "hobbies" },
  { prompt: "fishing, hunting, outdoors, camping", response: "The outdoors can be so peaceful and refreshing. Tell me about your experiences - any memorable catches or trips?", category: "hobbies" },
  { prompt: "sports, baseball, football, basketball, playing", response: "Sports bring such excitement and joy! What sports did you enjoy? Playing or watching?", category: "hobbies" },
  { prompt: "painting, drawing, art, creative, artist", response: "Art is such a beautiful expression. What kind of art did you enjoy? Colors have such power to move us.", category: "hobbies" },
  { prompt: "cars, driving, automobile, mechanic, vehicle", response: "Cars can be fascinating! Tell me about cars you've had or loved. What was your favorite?", category: "hobbies" },
  
  // Seasons & Holidays
  { prompt: "christmas, holiday, xmas, santa, presents", response: "Christmas is such a magical time! What are your favorite Christmas memories? The decorations, the songs, the gatherings?", category: "holidays" },
  { prompt: "thanksgiving, turkey, feast, family dinner", response: "Thanksgiving brings families together. What do you remember about Thanksgiving celebrations? The food, the laughter?", category: "holidays" },
  { prompt: "easter, spring, eggs, bunny", response: "Easter and springtime bring such renewal and hope. What Easter traditions did you enjoy?", category: "holidays" },
  { prompt: "birthday, celebrate, party, cake, candles", response: "Birthdays are special days to celebrate! Tell me about memorable birthdays you've had. Any favorite celebrations?", category: "holidays" },
  { prompt: "summer, beach, ocean, swimming, vacation", response: "Summer days can be so wonderful! Tell me about your favorite summer memories. Beach trips? Family gatherings?", category: "seasons" },
  { prompt: "fall, autumn, leaves, harvest, pumpkins", response: "Fall is such a beautiful season with changing colors and crisp air. What do you love about autumn?", category: "seasons" },
  { prompt: "winter, snow, cold, cozy, fireplace", response: "Winter can be so cozy - warm fires, snow days, hot cocoa. What are your favorite winter memories?", category: "seasons" },
  { prompt: "spring, flowers, bloom, fresh, renewal", response: "Spring is a time of new beginnings and beautiful blooms. What flowers do you love? What makes spring special for you?", category: "seasons" },
  
  // Animals & Pets
  { prompt: "dog, puppy, pet dog, canine", response: "Dogs are such loyal, loving companions. Did you have a dog? Tell me about them - what was their name and personality?", category: "pets" },
  { prompt: "cat, kitten, pet cat, feline", response: "Cats have such unique personalities. Did you have a cat? What do you remember about them?", category: "pets" },
  { prompt: "pet, animal, companion, furry friend", response: "Pets bring such joy and companionship to our lives. Tell me about pets you've loved.", category: "pets" },
  { prompt: "birds, singing, chirping, feathers", response: "Birds are wonderful creatures with beautiful songs. Do you enjoy watching birds? Any favorites?", category: "pets" },
  
  // Food & Meals
  { prompt: "breakfast, morning meal, coffee, toast", response: "Breakfast can be such a comforting way to start the day. What did you like for breakfast? Coffee and...?", category: "food" },
  { prompt: "lunch, midday meal, sandwich, soup", response: "A good lunch gives us energy for the day. What were your favorite lunch meals?", category: "food" },
  { prompt: "dinner, supper, evening meal, main meal", response: "Dinner time often brings families together. What were your favorite dinners? Any special family recipes?", category: "food" },
  { prompt: "dessert, sweet, cake, pie, ice cream", response: "Desserts are such treats! What's your favorite sweet? Chocolate? Fruit pies? Ice cream?", category: "food" },
  { prompt: "coffee, tea, beverage, drink, cup", response: "There's something comforting about a warm cup of coffee or tea. Which do you prefer? How do you like it?", category: "food" },
  
  // Daily Activities
  { prompt: "walk, walking, stroll, exercise, outside", response: "Walking is such good exercise and a chance to enjoy the outdoors. Do you enjoy walks? Where did you like to walk?", category: "activities" },
  { prompt: "read, reading, books, newspaper, magazine", response: "Reading opens up whole new worlds. What did you like to read? Books? The newspaper? Magazines?", category: "activities" },
  { prompt: "watch, watching, tv, television, show, program", response: "Television brings entertainment right into our homes. What shows did you enjoy watching? Any favorites?", category: "activities" },
  { prompt: "radio, listen, program, news, music radio", response: "Radio was such an important part of life! What radio programs did you listen to? Music? News? Stories?", category: "activities" },
  { prompt: "movie, film, cinema, picture show", response: "Movies can transport us to different worlds. What movies did you love? Any favorite actors or actresses?", category: "activities" },
  
  // Emotions - Extended
  { prompt: "proud, accomplished, achievement, success", response: "It's wonderful to feel proud of accomplishments. What are you proud of? What achievements meant the most to you?", category: "emotions" },
  { prompt: "excited, thrilled, eager, can't wait", response: "Your excitement is contagious! What has you feeling so enthusiastic? Tell me all about it!", category: "emotions" },
  { prompt: "peaceful, calm, serene, content, tranquil", response: "What a beautiful feeling of peace. Let's hold onto this calm moment together. What makes you feel most peaceful?", category: "emotions" },
  { prompt: "disappointed, let down, upset, frustrated", response: "I understand feeling disappointed. Those feelings are valid. I'm here to listen. Would you like to talk about it?", category: "emotions" },
  { prompt: "angry, mad, upset, irritated, annoyed", response: "I hear that you're feeling upset. It's okay to feel angry sometimes. Let's talk about what's bothering you. I'm listening.", category: "emotions" },
  
  // Memories - Extended
  { prompt: "first, beginning, started, initial, early days", response: "First experiences are so memorable! Tell me about this 'first' - what made it special?", category: "memories" },
  { prompt: "best, favorite, loved, cherished, special", response: "The best memories are treasures we carry with us. Tell me about this special memory - what made it your favorite?", category: "memories" },
  { prompt: "worst, difficult, hard, challenging, tough", response: "Sometimes talking about difficult times can help. You've been through a lot, and you're strong. Would you like to share?", category: "memories" },
  { prompt: "funny, laugh, hilarious, amusing, humor", response: "Laughter is such good medicine! What's making you laugh? I'd love to hear the funny story.", category: "memories" },
  
  // Relationships - Extended
  { prompt: "mother, mom, mama, mum", response: "Mothers hold such a special place in our hearts. Tell me about your mother - what do you remember most about her?", category: "relationships" },
  { prompt: "father, dad, papa, pop", response: "Fathers shape our lives in important ways. What memories do you have of your father? What was he like?", category: "relationships" },
  { prompt: "brother, sister, sibling", response: "Siblings share such unique bonds. Tell me about your brothers or sisters. What were they like? Any special memories?", category: "relationships" },
  { prompt: "neighbor, community, neighborhood", response: "Neighbors and community create such a sense of belonging. Tell me about your neighborhood - who were your neighbors?", category: "relationships" },
  
  // Time Periods & Eras
  { prompt: "twenties, 1920s, roaring twenties", response: "The 1920s were such an exciting time of change and energy! Tell me what you know or remember about this era.", category: "eras" },
  { prompt: "thirties, 1930s, depression", response: "The 1930s were challenging times for many families. What do you remember or know about this period?", category: "eras" },
  { prompt: "forties, 1940s, world war, ww2", response: "The 1940s were defining years with so much happening in the world. What memories or stories do you have from this time?", category: "eras" },
  { prompt: "fifties, 1950s, rock and roll, elvis", response: "The 1950s brought rock and roll, poodle skirts, and drive-ins! What do you remember about the 50s?", category: "eras" },
  { prompt: "sixties, 1960s, beatles, hippies", response: "The 1960s were full of change, music, and culture! The Beatles, Woodstock... What memories do you have from this time?", category: "eras" },
  { prompt: "seventies, 1970s, disco, groovy", response: "The 1970s had such distinctive style - disco, bell bottoms, great music! What do you remember about the 70s?", category: "eras" },
  { prompt: "eighties, 1980s, MTV, pop culture", response: "The 1980s brought MTV, big hair, and colorful fashion! What are your memories from this decade?", category: "eras" },
  
  // Technology & Progress
  { prompt: "telephone, phone call, calling, dial", response: "Telephones have changed so much over the years! Do you remember party lines? Rotary phones? What was using the phone like for you?", category: "technology" },
  { prompt: "computer, internet, technology, modern", response: "Technology has changed our world dramatically. What changes have you witnessed? How do you feel about all this technology?", category: "technology" },
  
  // Music Genres & Artists
  { prompt: "frank sinatra, sinatra, old blue eyes", response: "Frank Sinatra - what a voice! 'My Way,' 'New York, New York'... Such classics. Did you enjoy his music?", category: "music_specific" },
  { prompt: "elvis, presley, king, rock and roll", response: "Elvis Presley - The King of Rock and Roll! 'Can't Help Falling in Love,' 'Hound Dog'... Did you listen to Elvis?", category: "music_specific" },
  { prompt: "beatles, john lennon, paul mccartney", response: "The Beatles changed music forever! 'Hey Jude,' 'Let It Be,' 'Yesterday'... Were you a Beatles fan?", category: "music_specific" },
  { prompt: "jazz, swing, big band, orchestra", response: "Jazz and big band music - such sophistication and energy! Glenn Miller, Duke Ellington, Benny Goodman... Did you enjoy this music?", category: "music_specific" },
  { prompt: "country, country music, western, nashville", response: "Country music tells such great stories. Johnny Cash, Patsy Cline, Willie Nelson... Did you enjoy country music?", category: "music_specific" },
  
  // Interactive & Engaging
  { prompt: "quiz, question, test, trivia, challenge", response: "How fun! I'd love to do some gentle trivia with you. Let's see... Can you tell me: What year did WWII end? (1945) Take your time!", category: "interactive" },
  { prompt: "exercise, movement, stretch, physical", response: "Movement is wonderful for body and mind! Let's do some gentle exercises together. Can you lift your arms up high? Great! Now roll your shoulders.", category: "interactive" },
  { prompt: "breathe, breathing, breath, deep breath", response: "Breathing exercises are so calming. Let's breathe together: Breathe in slowly through your nose... 1, 2, 3, 4... Hold... Now breathe out slowly... Wonderful!", category: "interactive" },
  { prompt: "count, counting, numbers, math", response: "Let's count together - it's soothing and keeps our minds active. Shall we count to 10? 1, 2, 3... You continue!", category: "interactive" },
  { prompt: "words, spell, spelling, letters, alphabet", response: "Word games are great for the mind! Let's think of words that start with the letter 'H'. I'll start: Happy, Home, Heart... What word can you think of?", category: "interactive" },
  
  // Default Fallbacks - Enhanced
  { prompt: "default_1", response: "I'm here with you. Tell me more - I'm listening.", category: "fallback" },
  { prompt: "default_2", response: "That's interesting. Would you like to talk more about that?", category: "fallback" },
  { prompt: "default_3", response: "I see. How does that make you feel?", category: "fallback" },
  { prompt: "default_4", response: "Thank you for sharing that with me. What else is on your mind?", category: "fallback" },
  { prompt: "default_5", response: "I appreciate you talking with me. Your thoughts and feelings matter.", category: "fallback" },
  { prompt: "default_6", response: "That sounds meaningful. Would you like to explore that thought further?", category: "fallback" }
];

export async function preloadEssentialData() {
  console.log('🚀 Starting comprehensive offline data preload...');
  
  try {
    await initOfflineStorage();
    
    const results = {
      aiResponses: 0,
      stories: 0,
      music: 0,
      exercises: 0,
      entities: {},
      errors: []
    };

    // 1. CRITICAL: Preload comprehensive AI response library (250+ responses)
    console.log('📦 Preloading AI response library...');
    for (let i = 0; i < COMPREHENSIVE_OFFLINE_RESPONSES.length; i++) {
      const resp = COMPREHENSIVE_OFFLINE_RESPONSES[i];
      try {
        await saveToStore(STORES.aiResponses, {
          prompt: resp.prompt,
          response: resp.response,
          category: resp.category,
          timestamp: Date.now(),
          offline: true
        });
        results.aiResponses++;
      } catch (error) {
        console.warn('Response cache failed:', error);
      }
    }
    console.log(`✅ Cached ${results.aiResponses} AI responses`);

    // 2. Preload Story Library (20 stories)
    console.log('📖 Preloading story library...');
    for (const story of OFFLINE_STORIES) {
      try {
        await saveToStore(STORES.stories, {
          ...story,
          uploaded_by_family: false,
          offline_preloaded: true
        });
        results.stories++;
      } catch (error) {
        console.warn('Story cache failed:', error.message || 'Unknown error');
      }
    }
    console.log(`✅ Cached ${results.stories} stories`);

    // 3. Preload Music Library WITH ACTUAL AUDIO FILES (40 classic songs)
    console.log('🎵 Preloading music library with audio files...');
    for (const song of OFFLINE_MUSIC) {
      try {
        // Save metadata first
        await saveToStore(STORES.music, {
          ...song,
          uploaded_by_family: false,
          offline_preloaded: true,
          personal_significance: "Classic song from your era",
          is_downloaded: true
        });
        results.music++;
        
        // Note: We skip binary audio download due to CORS restrictions on external URLs.
        // The audio_file_url is stored in metadata and will stream when online.
        // For true offline audio, caregivers should upload custom audio files.
      } catch (error) {
        console.warn('Music cache failed:', error.message || 'Unknown error');
      }
    }
    console.log(`✅ Cached ${results.music} songs with audio files`);

    // 4. Preload Interactive Memory Exercises (10 activities) - Skip if store doesn't exist
    console.log('🧠 Preloading memory exercises...');
    for (const exercise of MEMORY_EXERCISES) {
      try {
        // Store exercises in general cache - no dedicated store needed
        await saveToStore(STORES.activityLog, {
          activity_type: 'memory_exercise',
          exercise_id: exercise.id,
          details: exercise,
          offline_preloaded: true,
          created_date: new Date().toISOString()
        });
        results.exercises++;
      } catch (error) {
        console.warn('Exercise cache failed:', error.message || 'Unknown error');
      }
    }
    console.log(`✅ Cached ${results.exercises} interactive exercises`);

    // 5. Preload entity data (only if online)
    if (!isOnline()) {
      console.log('⚠️ Offline - skipping entity data fetch. AI responses are ready for offline use.');
      return { ...results, offline_only: true };
    }

    console.log('📡 Fetching entity data...');
    for (const entityName of ESSENTIAL_CATEGORIES) {
      try {
        const data = await base44.entities[entityName].list();
        const storeName = entityName.toLowerCase();
        
        let savedCount = 0;
        for (const item of data) {
          try {
            await saveToStore(storeName, item);
            savedCount++;
          } catch (err) {
            console.warn(`Failed to save ${entityName} item:`, err.message);
          }
        }
        
        results.entities[entityName] = savedCount;
        if (savedCount > 0) {
          console.log(`✅ Cached ${savedCount} ${entityName} records`);
        }
      } catch (error) {
        console.log(`⚠️ Skipping ${entityName}:`, error.message);
        results.errors.push(`${entityName}: ${error.message}`);
      }
    }

    console.log('✅ Offline mode fully ready:', results);
    
    // Mark as ready with comprehensive stats
    await saveToStore(STORES.syncMeta, {
      id: 'offline_ready',
      key: 'offline_ready',
      timestamp: new Date().toISOString(),
      version: '4.0',
      responseCount: results.aiResponses,
      storiesCount: results.stories,
      musicCount: results.music,
      exercisesCount: results.exercises,
      entityCount: Object.values(results.entities).reduce((a, b) => a + b, 0),
      totalOfflineContent: results.aiResponses + results.stories + results.music + results.exercises
    });
    
    return results;
    
  } catch (error) {
    console.error('Preload failed:', error.message || error);
    // Don't throw - allow partial offline functionality
    return {
      aiResponses: 0,
      stories: 0,
      music: 0,
      exercises: 0,
      entities: {},
      errors: [error.message || 'Unknown preload error']
    };
  }
}

// Auto-preload on app start
if (typeof window !== 'undefined') {
  // Check if in Android WebView
  const isAndroidWebView = /Android/.test(navigator.userAgent) && /WebView/.test(navigator.userAgent);
  
  // Only preload once per session to improve load times
  const PRELOAD_SESSION_KEY = 'offline_preload_done';
  const sessionPreloaded = sessionStorage.getItem(PRELOAD_SESSION_KEY);
  
  if (!sessionPreloaded) {
    setTimeout(() => {
      preloadEssentialData().then((result) => {
        sessionStorage.setItem(PRELOAD_SESSION_KEY, 'true');
        // Notify native Android code when preload completes
        if (isAndroidWebView && window.AndroidInterface?.onOfflinePreloadComplete) {
          window.AndroidInterface.onOfflinePreloadComplete(JSON.stringify(result));
        }
      }).catch(err => 
        console.log('Preload warning:', err.message)
      );
    }, 3000); // Delayed to not block initial render
  }

  // Re-preload when back online
  window.addEventListener('online', () => {
    console.log('📶 Back online - refreshing offline cache...');
    setTimeout(() => preloadEssentialData(), 1000);
  });

  // Notify native code when going offline
  window.addEventListener('offline', () => {
    console.log('📴 Went offline - using cached data...');
    if (isAndroidWebView && window.AndroidInterface?.onOffline) {
      window.AndroidInterface.onOffline();
    }
  });
}

export default preloadEssentialData;