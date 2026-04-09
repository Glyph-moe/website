export interface MockNovel {
  id: string
  title: string
  author: string
  cover: string
  description: string
  tags: string[]
  status: 'Ongoing' | 'Completed' | 'Hiatus'
  chapters: { id: string; title: string; date: string }[]
}

export const novels: MockNovel[] = [
  {
    id: 'shadow-monarch',
    title: 'Shadow Monarch: Rise of the Forgotten King',
    author: 'J.K. Nightfall',
    cover: 'https://picsum.photos/seed/shadow/300/450',
    description: 'After dying in a dungeon raid, Kael wakes up with the power to control shadows. But the system that resurrected him has its own agenda, and the forgotten king\'s throne comes with a price no one is willing to pay. In a world where hunters rank from E to S, Kael must climb from the bottom while hiding abilities that could make him the target of every nation on Earth.',
    tags: ['Fantasy', 'Action', 'Adventure', 'System', 'Reincarnation'],
    status: 'Ongoing',
    chapters: Array.from({ length: 142 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: i === 0 ? 'Prologue: The Fall' : i === 1 ? 'Awakening' : `Chapter ${i + 1}: ${['The Shadow Gate', 'Echoes of Power', 'The First Trial', 'Crimson Dawn', 'Into the Abyss', 'A New Ally', 'The Tournament Begins', 'Shattered Bonds', 'Beyond the Veil'][i % 9]}`,
      date: new Date(2024, 0, 1 + i).toISOString().split('T')[0],
    })),
  },
  {
    id: 'celestial-alchemy',
    title: 'Celestial Alchemy: Path of Ten Thousand Stars',
    author: 'Lin Moyu',
    cover: 'https://picsum.photos/seed/celestial/300/450',
    description: 'In the Azure Continent, cultivation determines everything. Yun Xiao, born with crippled meridians, discovers an ancient alchemy cauldron that lets him refine pills beyond mortal comprehension. Watch as he ascends from a discarded outer disciple to a figure that shakes the heavens.',
    tags: ['Fantasy', 'Cultivation', 'Martial Arts', 'Adventure'],
    status: 'Ongoing',
    chapters: Array.from({ length: 89 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `Chapter ${i + 1}: ${['The Broken Meridian', 'Ancient Cauldron', 'First Refinement', 'Outer Sect Trials', 'Spirit Herb Valley', 'The Elder\'s Test', 'Heavenly Flame', 'Core Formation', 'The Auction'][i % 9]}`,
      date: new Date(2024, 2, 1 + i).toISOString().split('T')[0],
    })),
  },
  {
    id: 'neon-requiem',
    title: 'Neon Requiem',
    author: 'Alex Mercer',
    cover: 'https://picsum.photos/seed/neon/300/450',
    description: 'Neo-Tokyo, 2157. When corporate hacker Reina Sato discovers that her dead sister\'s consciousness has been uploaded to the city\'s neural network, she must navigate a web of augmented gangs, rogue AIs, and corporate assassins to bring her back. But the deeper she digs, the more she realizes her sister might not want to be saved.',
    tags: ['Sci-fi', 'Action', 'Cyberpunk', 'Mystery', 'Mature'],
    status: 'Completed',
    chapters: Array.from({ length: 64 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `Chapter ${i + 1}: ${['Ghost in the Wire', 'Chrome Hearts', 'Digital Echoes', 'The Undernet', 'Synaptic Storm', 'Red District', 'Memory Palace', 'The Architect', 'Shutdown'][i % 9]}`,
      date: new Date(2023, 6, 1 + i).toISOString().split('T')[0],
    })),
  },
  {
    id: 'dragon-princess',
    title: 'The Dragon Princess Who Couldn\'t Fly',
    author: 'Sarah Windsworth',
    cover: 'https://picsum.photos/seed/dragon/300/450',
    description: 'Princess Ember is the only dragon in her kingdom who can\'t fly. Banished from the royal court, she sets out on a journey across the Shattered Isles to find the legendary Wind Sage. Along the way, she discovers that her "weakness" might be the key to an ancient power that could save dragonkind from extinction.',
    tags: ['Fantasy', 'Adventure', 'Comedy', 'Romance'],
    status: 'Ongoing',
    chapters: Array.from({ length: 37 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `Chapter ${i + 1}: ${['Grounded', 'The Exile', 'First Flight (Sort Of)', 'Storm\'s Edge', 'The Wandering Sage', 'Scales and Swords', 'Island of Echoes', 'Wings of Glass', 'The Dragon Court'][i % 9]}`,
      date: new Date(2024, 5, 1 + i * 3).toISOString().split('T')[0],
    })),
  },
  {
    id: 'infinite-regression',
    title: 'Infinite Regression: I Keep Dying on Monday',
    author: 'Park Jinhyuk',
    cover: 'https://picsum.photos/seed/regression/300/450',
    description: 'Every Monday at 8:47 AM, Lee Suho dies. Every Monday at 6:00 AM, he wakes up again. Trapped in an infinite time loop, he must unravel the mystery of his death while navigating a world where dungeons have started appearing in downtown Seoul. The catch? Each loop, the dungeons get harder.',
    tags: ['Fantasy', 'Action', 'System', 'Time Loop', 'Psychological'],
    status: 'Hiatus',
    chapters: Array.from({ length: 203 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `Chapter ${i + 1}: ${['Monday Again', 'The First Death', 'Loop #47', 'Breaking Pattern', 'The Dungeon Shift', 'New Variables', 'The Observer', 'Convergence', 'Reset'][i % 9]}`,
      date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
    })),
  },
  {
    id: 'herb-garden',
    title: 'My Herb Garden Grows Legendary Items',
    author: 'Tanaka Yui',
    cover: 'https://picsum.photos/seed/herb/300/450',
    description: 'Retired adventurer Milo just wanted to grow herbs in peace. But when his garden starts producing legendary-grade alchemical ingredients, every guild, kingdom, and demon lord comes knocking. A cozy slice-of-life story about an overpowered gardener who just wants to be left alone.',
    tags: ['Fantasy', 'Comedy', 'Slice of Life'],
    status: 'Ongoing',
    chapters: Array.from({ length: 56 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `Chapter ${i + 1}: ${['The Quiet Garden', 'An Unwanted Visitor', 'Legendary Basil', 'The Guild\'s Offer', 'Peaceful Morning', 'The Dragon Next Door', 'Harvest Festival', 'A Royal Summons', 'Composting Crisis'][i % 9]}`,
      date: new Date(2024, 3, 1 + i * 2).toISOString().split('T')[0],
    })),
  },
]

export function getNovel(id: string): MockNovel | undefined {
  return novels.find(n => n.id === id)
}

export const chapterContent = `
<p>The morning sun cast long shadows across the ancient courtyard as our protagonist stood at the threshold of destiny. The air was thick with the scent of pine and something else, something <em>otherworldly</em>.</p>

<p>"You shouldn't be here," a voice echoed from the darkness beyond the gate. It was neither male nor female, neither young nor old. It simply <em>was</em>.</p>

<p>But turning back was never an option. Not after everything that had happened. Not after the betrayal, the loss, the countless nights spent staring at the ceiling wondering if any of it had been real.</p>

<h2>The Awakening</h2>

<p>The power came without warning. One moment, there was nothing but the cold stone beneath trembling fingers. The next, the world exploded into color and sound and <strong>sensation</strong> beyond anything mortal senses were designed to process.</p>

<p>It started as a tingling at the base of the spine. Then it spread, like liquid fire through every vein, every nerve, every cell. The system window appeared unbidden:</p>

<p><em>[Awakening detected. Initializing... Class: ???. Level: 1. Warning: Anomalous soul signature detected.]</em></p>

<p>"What does that mean?" The words came out as barely a whisper, lost in the roar of energy that filled the chamber.</p>

<p>No answer came. None was expected. In this world, answers were earned through blood and sweat and the kind of determination that most people only read about in stories.</p>

<h2>First Steps</h2>

<p>The path ahead was clear, even if the destination remained shrouded in mystery. Each step forward was a step away from the person they used to be. Each breath drawn in this new reality was a breath that tasted of possibility and danger in equal measure.</p>

<p>The corridor stretched endlessly before them, lined with torches that burned with an unnatural blue flame. Runes carved into the stone walls pulsed with a faint light, telling stories in a language that somehow, impossibly, they could now understand.</p>

<p><em>"The one who walks between worlds shall carry the weight of all realities. This is not a gift. This is a sentence."</em></p>

<p>A sentence. How appropriate. Because this story, like all stories worth telling, began with an ending.</p>

<p>And endings, as anyone who has truly lived will tell you, are just beginnings wearing a different mask.</p>
`
