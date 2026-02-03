const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'data/mellamo.db');
const db = new sqlite3.Database(dbPath);

// Diverse baby names with origins and meanings
const names = [
  // Boy names
  { name: 'Liam', gender: 'boy', origin: 'Irish', meaning: 'Strong-willed warrior' },
  { name: 'Noah', gender: 'boy', origin: 'Hebrew', meaning: 'Rest, comfort' },
  { name: 'Oliver', gender: 'boy', origin: 'English', meaning: 'Olive tree' },
  { name: 'James', gender: 'boy', origin: 'Hebrew', meaning: 'Supplanter' },
  { name: 'Elijah', gender: 'boy', origin: 'Hebrew', meaning: 'My God is Yahweh' },
  { name: 'Mateo', gender: 'boy', origin: 'Spanish', meaning: 'Gift of God' },
  { name: 'Sebastian', gender: 'boy', origin: 'Greek', meaning: 'Venerable, revered' },
  { name: 'Benjamin', gender: 'boy', origin: 'Hebrew', meaning: 'Son of the right hand' },
  { name: 'Lucas', gender: 'boy', origin: 'Greek', meaning: 'Bringer of light' },
  { name: 'Henry', gender: 'boy', origin: 'German', meaning: 'Ruler of the home' },
  { name: 'Alexander', gender: 'boy', origin: 'Greek', meaning: 'Defender of the people' },
  { name: 'Mason', gender: 'boy', origin: 'English', meaning: 'Stone worker' },
  { name: 'Ethan', gender: 'boy', origin: 'Hebrew', meaning: 'Strong, firm' },
  { name: 'Daniel', gender: 'boy', origin: 'Hebrew', meaning: 'God is my judge' },
  { name: 'Jacob', gender: 'boy', origin: 'Hebrew', meaning: 'Supplanter' },
  { name: 'Logan', gender: 'boy', origin: 'Scottish', meaning: 'Little hollow' },
  { name: 'Jackson', gender: 'boy', origin: 'English', meaning: 'Son of Jack' },
  { name: 'Levi', gender: 'boy', origin: 'Hebrew', meaning: 'Joined, attached' },
  { name: 'Samuel', gender: 'boy', origin: 'Hebrew', meaning: 'Heard by God' },
  { name: 'David', gender: 'boy', origin: 'Hebrew', meaning: 'Beloved' },
  { name: 'Gabriel', gender: 'boy', origin: 'Hebrew', meaning: 'God is my strength' },
  { name: 'Julian', gender: 'boy', origin: 'Latin', meaning: 'Youthful, downy' },
  { name: 'Leo', gender: 'boy', origin: 'Latin', meaning: 'Lion' },
  { name: 'Jayden', gender: 'boy', origin: 'American', meaning: 'Thankful' },
  { name: 'Isaac', gender: 'boy', origin: 'Hebrew', meaning: 'He will laugh' },
  { name: 'Lincoln', gender: 'boy', origin: 'English', meaning: 'Lake colony' },
  { name: 'Joshua', gender: 'boy', origin: 'Hebrew', meaning: 'God is salvation' },
  { name: 'Caleb', gender: 'boy', origin: 'Hebrew', meaning: 'Faithful, devotion' },
  { name: 'Ryan', gender: 'boy', origin: 'Irish', meaning: 'Little king' },
  { name: 'Nathan', gender: 'boy', origin: 'Hebrew', meaning: 'He gave' },
  { name: 'Omar', gender: 'boy', origin: 'Arabic', meaning: 'Flourishing, long-lived' },
  { name: 'Amir', gender: 'boy', origin: 'Arabic', meaning: 'Prince, commander' },
  { name: 'Kai', gender: 'boy', origin: 'Hawaiian', meaning: 'Sea' },
  { name: 'Ravi', gender: 'boy', origin: 'Sanskrit', meaning: 'Sun' },
  { name: 'Hiroshi', gender: 'boy', origin: 'Japanese', meaning: 'Generous, prosperous' },
  { name: 'Dmitri', gender: 'boy', origin: 'Russian', meaning: 'Earth lover' },
  { name: 'Chen', gender: 'boy', origin: 'Chinese', meaning: 'Dawn, morning' },
  { name: 'Kofi', gender: 'boy', origin: 'Ghanaian', meaning: 'Born on Friday' },
  { name: 'Thiago', gender: 'boy', origin: 'Portuguese', meaning: 'May God protect' },
  { name: 'Rashid', gender: 'boy', origin: 'Arabic', meaning: 'Rightly guided' },
  { name: 'Sven', gender: 'boy', origin: 'Scandinavian', meaning: 'Young warrior' },
  { name: 'Mattias', gender: 'boy', origin: 'Swedish', meaning: 'Gift of God' },
  { name: 'Felix', gender: 'boy', origin: 'Latin', meaning: 'Happy, fortunate' },
  { name: 'Hugo', gender: 'boy', origin: 'German', meaning: 'Mind, intellect' },
  { name: 'Oscar', gender: 'boy', origin: 'Irish', meaning: 'Deer friend' },
  { name: 'Finn', gender: 'boy', origin: 'Irish', meaning: 'Fair, white' },
  { name: 'August', gender: 'boy', origin: 'Latin', meaning: 'Great, magnificent' },
  { name: 'Jasper', gender: 'boy', origin: 'Persian', meaning: 'Treasurer' },
  { name: 'Silas', gender: 'boy', origin: 'Latin', meaning: 'Of the forest' },
  { name: 'Ezra', gender: 'boy', origin: 'Hebrew', meaning: 'Helper' },
  { name: 'Theodore', gender: 'boy', origin: 'Greek', meaning: 'Gift of God' },
  { name: 'Milo', gender: 'boy', origin: 'German', meaning: 'Merciful' },
  { name: 'Atlas', gender: 'boy', origin: 'Greek', meaning: 'To carry' },
  { name: 'Axel', gender: 'boy', origin: 'Scandinavian', meaning: 'Father of peace' },
  { name: 'Marcus', gender: 'boy', origin: 'Latin', meaning: 'Warlike' },
  { name: 'Adrian', gender: 'boy', origin: 'Latin', meaning: 'From Hadria' },
  { name: 'Diego', gender: 'boy', origin: 'Spanish', meaning: 'Supplanter' },
  { name: 'Rafael', gender: 'boy', origin: 'Hebrew', meaning: 'God has healed' },
  { name: 'Ivan', gender: 'boy', origin: 'Russian', meaning: 'God is gracious' },
  { name: 'Alejandro', gender: 'boy', origin: 'Spanish', meaning: 'Defender of mankind' },
  { name: 'Bodhi', gender: 'boy', origin: 'Sanskrit', meaning: 'Awakening, enlightenment' },
  { name: 'Nico', gender: 'boy', origin: 'Greek', meaning: 'Victory of the people' },
  { name: 'Cole', gender: 'boy', origin: 'English', meaning: 'Coal, dark' },
  { name: 'Wyatt', gender: 'boy', origin: 'English', meaning: 'Brave in war' },
  { name: 'Zane', gender: 'boy', origin: 'Hebrew', meaning: 'Gift from God' },
  
  // Girl names
  { name: 'Olivia', gender: 'girl', origin: 'Latin', meaning: 'Olive tree' },
  { name: 'Emma', gender: 'girl', origin: 'German', meaning: 'Whole, universal' },
  { name: 'Charlotte', gender: 'girl', origin: 'French', meaning: 'Free woman' },
  { name: 'Amelia', gender: 'girl', origin: 'German', meaning: 'Industrious, striving' },
  { name: 'Sophia', gender: 'girl', origin: 'Greek', meaning: 'Wisdom' },
  { name: 'Isabella', gender: 'girl', origin: 'Hebrew', meaning: 'Devoted to God' },
  { name: 'Mia', gender: 'girl', origin: 'Scandinavian', meaning: 'Mine, beloved' },
  { name: 'Evelyn', gender: 'girl', origin: 'English', meaning: 'Wished for child' },
  { name: 'Harper', gender: 'girl', origin: 'English', meaning: 'Harp player' },
  { name: 'Luna', gender: 'girl', origin: 'Latin', meaning: 'Moon' },
  { name: 'Camila', gender: 'girl', origin: 'Latin', meaning: 'Young ceremonial attendant' },
  { name: 'Gianna', gender: 'girl', origin: 'Italian', meaning: 'God is gracious' },
  { name: 'Elizabeth', gender: 'girl', origin: 'Hebrew', meaning: 'Pledged to God' },
  { name: 'Eleanor', gender: 'girl', origin: 'Greek', meaning: 'Shining light' },
  { name: 'Chloe', gender: 'girl', origin: 'Greek', meaning: 'Blooming, fertility' },
  { name: 'Sofia', gender: 'girl', origin: 'Greek', meaning: 'Wisdom' },
  { name: 'Violet', gender: 'girl', origin: 'Latin', meaning: 'Purple flower' },
  { name: 'Scarlett', gender: 'girl', origin: 'English', meaning: 'Red, scarlet' },
  { name: 'Penelope', gender: 'girl', origin: 'Greek', meaning: 'Weaver' },
  { name: 'Layla', gender: 'girl', origin: 'Arabic', meaning: 'Night, dark beauty' },
  { name: 'Nora', gender: 'girl', origin: 'Irish', meaning: 'Honor, light' },
  { name: 'Zoe', gender: 'girl', origin: 'Greek', meaning: 'Life' },
  { name: 'Lily', gender: 'girl', origin: 'English', meaning: 'Pure, innocent' },
  { name: 'Aurora', gender: 'girl', origin: 'Latin', meaning: 'Dawn' },
  { name: 'Hazel', gender: 'girl', origin: 'English', meaning: 'Hazelnut tree' },
  { name: 'Maya', gender: 'girl', origin: 'Sanskrit', meaning: 'Illusion, magic' },
  { name: 'Isla', gender: 'girl', origin: 'Scottish', meaning: 'Island' },
  { name: 'Aria', gender: 'girl', origin: 'Italian', meaning: 'Air, melody' },
  { name: 'Elena', gender: 'girl', origin: 'Greek', meaning: 'Bright, shining light' },
  { name: 'Stella', gender: 'girl', origin: 'Latin', meaning: 'Star' },
  { name: 'Fatima', gender: 'girl', origin: 'Arabic', meaning: 'Captivating, one who abstains' },
  { name: 'Aisha', gender: 'girl', origin: 'Arabic', meaning: 'Living, prosperous' },
  { name: 'Priya', gender: 'girl', origin: 'Sanskrit', meaning: 'Beloved, dear' },
  { name: 'Yuki', gender: 'girl', origin: 'Japanese', meaning: 'Snow, happiness' },
  { name: 'Mei', gender: 'girl', origin: 'Chinese', meaning: 'Beautiful' },
  { name: 'Anya', gender: 'girl', origin: 'Russian', meaning: 'Grace' },
  { name: 'Ingrid', gender: 'girl', origin: 'Scandinavian', meaning: 'Beautiful, beloved' },
  { name: 'Freya', gender: 'girl', origin: 'Norse', meaning: 'Noble woman' },
  { name: 'Astrid', gender: 'girl', origin: 'Scandinavian', meaning: 'Divine beauty' },
  { name: 'Lucia', gender: 'girl', origin: 'Italian', meaning: 'Light' },
  { name: 'Valentina', gender: 'girl', origin: 'Latin', meaning: 'Strong, healthy' },
  { name: 'Clara', gender: 'girl', origin: 'Latin', meaning: 'Clear, bright' },
  { name: 'Ivy', gender: 'girl', origin: 'English', meaning: 'Climbing vine' },
  { name: 'Willow', gender: 'girl', origin: 'English', meaning: 'Graceful, slender' },
  { name: 'Ruby', gender: 'girl', origin: 'Latin', meaning: 'Red gemstone' },
  { name: 'Jade', gender: 'girl', origin: 'Spanish', meaning: 'Green gemstone' },
  { name: 'Alice', gender: 'girl', origin: 'German', meaning: 'Noble, exalted' },
  { name: 'Iris', gender: 'girl', origin: 'Greek', meaning: 'Rainbow' },
  { name: 'Athena', gender: 'girl', origin: 'Greek', meaning: 'Goddess of wisdom' },
  { name: 'Cora', gender: 'girl', origin: 'Greek', meaning: 'Maiden' },
  { name: 'Naomi', gender: 'girl', origin: 'Hebrew', meaning: 'Pleasantness' },
  { name: 'Aaliyah', gender: 'girl', origin: 'Arabic', meaning: 'Rising, ascending' },
  { name: 'Catalina', gender: 'girl', origin: 'Spanish', meaning: 'Pure' },
  { name: 'Esmeralda', gender: 'girl', origin: 'Spanish', meaning: 'Emerald' },
  { name: 'Sienna', gender: 'girl', origin: 'Italian', meaning: 'Orange-red' },
  { name: 'Sage', gender: 'girl', origin: 'Latin', meaning: 'Wise, healthy' },
  { name: 'Dahlia', gender: 'girl', origin: 'Scandinavian', meaning: 'Valley flower' },
  { name: 'Wren', gender: 'girl', origin: 'English', meaning: 'Small bird' },
  { name: 'Greta', gender: 'girl', origin: 'German', meaning: 'Pearl' },
  { name: 'Thea', gender: 'girl', origin: 'Greek', meaning: 'Goddess' },
  { name: 'Maeve', gender: 'girl', origin: 'Irish', meaning: 'She who intoxicates' },
  { name: 'Fiona', gender: 'girl', origin: 'Scottish', meaning: 'White, fair' },
  { name: 'Vera', gender: 'girl', origin: 'Russian', meaning: 'Faith, truth' },
  { name: 'Lena', gender: 'girl', origin: 'Greek', meaning: 'Light' },
  { name: 'Nina', gender: 'girl', origin: 'Spanish', meaning: 'Little girl' },
  
  // Neutral names
  { name: 'Avery', gender: 'neutral', origin: 'English', meaning: 'Ruler of elves' },
  { name: 'Riley', gender: 'neutral', origin: 'Irish', meaning: 'Courageous' },
  { name: 'Jordan', gender: 'neutral', origin: 'Hebrew', meaning: 'To flow down' },
  { name: 'Quinn', gender: 'neutral', origin: 'Irish', meaning: 'Wise, counsel' },
  { name: 'Morgan', gender: 'neutral', origin: 'Welsh', meaning: 'Sea-born' },
  { name: 'Parker', gender: 'neutral', origin: 'English', meaning: 'Park keeper' },
  { name: 'Taylor', gender: 'neutral', origin: 'English', meaning: 'Tailor' },
  { name: 'Cameron', gender: 'neutral', origin: 'Scottish', meaning: 'Crooked nose' },
  { name: 'Rowan', gender: 'neutral', origin: 'Irish', meaning: 'Little red one' },
  { name: 'Phoenix', gender: 'neutral', origin: 'Greek', meaning: 'Dark red, mythical bird' },
  { name: 'River', gender: 'neutral', origin: 'English', meaning: 'Flowing water' },
  { name: 'Sage', gender: 'neutral', origin: 'Latin', meaning: 'Wise, healthy' },
  { name: 'Skyler', gender: 'neutral', origin: 'Dutch', meaning: 'Scholar' },
  { name: 'Hayden', gender: 'neutral', origin: 'English', meaning: 'Fire' },
  { name: 'Charlie', gender: 'neutral', origin: 'English', meaning: 'Free man' },
  { name: 'Emerson', gender: 'neutral', origin: 'English', meaning: 'Son of Emery' },
  { name: 'Finley', gender: 'neutral', origin: 'Irish', meaning: 'Fair-haired hero' },
  { name: 'Peyton', gender: 'neutral', origin: 'English', meaning: 'Fighting mans estate' },
  { name: 'Reese', gender: 'neutral', origin: 'Welsh', meaning: 'Enthusiasm' },
  { name: 'Blake', gender: 'neutral', origin: 'English', meaning: 'Dark, fair' },
  { name: 'Remi', gender: 'neutral', origin: 'French', meaning: 'Oarsman' },
  { name: 'Dylan', gender: 'neutral', origin: 'Welsh', meaning: 'Son of the sea' },
  { name: 'Eden', gender: 'neutral', origin: 'Hebrew', meaning: 'Paradise, delight' },
  { name: 'Sawyer', gender: 'neutral', origin: 'English', meaning: 'Wood cutter' },
  { name: 'Kai', gender: 'neutral', origin: 'Hawaiian', meaning: 'Sea' },
  { name: 'Dakota', gender: 'neutral', origin: 'Native American', meaning: 'Friend, ally' },
  { name: 'Jesse', gender: 'neutral', origin: 'Hebrew', meaning: 'Gift' },
  { name: 'Lennon', gender: 'neutral', origin: 'Irish', meaning: 'Little cloak' },
  { name: 'Marlowe', gender: 'neutral', origin: 'English', meaning: 'Driftwood' },
  { name: 'Monroe', gender: 'neutral', origin: 'Scottish', meaning: 'Mouth of the Roe river' },
  { name: 'Ocean', gender: 'neutral', origin: 'English', meaning: 'Sea' },
  { name: 'Shiloh', gender: 'neutral', origin: 'Hebrew', meaning: 'Peaceful' },
  { name: 'Winter', gender: 'neutral', origin: 'English', meaning: 'Cold season' },
  { name: 'Harley', gender: 'neutral', origin: 'English', meaning: 'Hare meadow' },
  { name: 'Justice', gender: 'neutral', origin: 'English', meaning: 'Fairness, righteousness' },
  { name: 'Arden', gender: 'neutral', origin: 'English', meaning: 'Valley of the eagle' },
  { name: 'Indigo', gender: 'neutral', origin: 'Greek', meaning: 'Deep blue dye' },
  { name: 'Oakley', gender: 'neutral', origin: 'English', meaning: 'Oak meadow' },
  { name: 'Onyx', gender: 'neutral', origin: 'Greek', meaning: 'Black gemstone' },
  { name: 'Royal', gender: 'neutral', origin: 'English', meaning: 'Of the king' },
  { name: 'Sterling', gender: 'neutral', origin: 'English', meaning: 'Genuine, pure' },
  { name: 'Cypress', gender: 'neutral', origin: 'Greek', meaning: 'Evergreen tree' },
  { name: 'Harbor', gender: 'neutral', origin: 'English', meaning: 'Shelter' },
  { name: 'Haven', gender: 'neutral', origin: 'English', meaning: 'Safe place' },
  { name: 'Journey', gender: 'neutral', origin: 'English', meaning: 'Trip, voyage' },
  { name: 'Lake', gender: 'neutral', origin: 'English', meaning: 'Body of water' },
  { name: 'Landry', gender: 'neutral', origin: 'French', meaning: 'Ruler' },
  { name: 'Merit', gender: 'neutral', origin: 'English', meaning: 'Deserving praise' },
  { name: 'North', gender: 'neutral', origin: 'English', meaning: 'Direction' },
  { name: 'Story', gender: 'neutral', origin: 'English', meaning: 'Tale, narrative' },

  // More diverse additions
  { name: 'Kenji', gender: 'boy', origin: 'Japanese', meaning: 'Intelligent second son' },
  { name: 'Tariq', gender: 'boy', origin: 'Arabic', meaning: 'Morning star' },
  { name: 'Kwame', gender: 'boy', origin: 'Ghanaian', meaning: 'Born on Saturday' },
  { name: 'Arjun', gender: 'boy', origin: 'Sanskrit', meaning: 'Bright, shining' },
  { name: 'Luca', gender: 'boy', origin: 'Italian', meaning: 'Bringer of light' },
  { name: 'Odin', gender: 'boy', origin: 'Norse', meaning: 'God of wisdom' },
  { name: 'Zara', gender: 'girl', origin: 'Arabic', meaning: 'Blooming flower' },
  { name: 'Kira', gender: 'girl', origin: 'Russian', meaning: 'Throne' },
  { name: 'Ananya', gender: 'girl', origin: 'Sanskrit', meaning: 'Unique, matchless' },
  { name: 'Sakura', gender: 'girl', origin: 'Japanese', meaning: 'Cherry blossom' },
  { name: 'Amara', gender: 'girl', origin: 'African', meaning: 'Grace, eternal' },
  { name: 'Xiomara', gender: 'girl', origin: 'Spanish', meaning: 'Ready for battle' },
  { name: 'Ines', gender: 'girl', origin: 'Portuguese', meaning: 'Pure, holy' },
  { name: 'Nadia', gender: 'girl', origin: 'Slavic', meaning: 'Hope' },
  { name: 'Simone', gender: 'neutral', origin: 'French', meaning: 'One who hears' },
  { name: 'Milan', gender: 'neutral', origin: 'Slavic', meaning: 'Gracious, dear' },
  { name: 'Sasha', gender: 'neutral', origin: 'Russian', meaning: 'Defender of mankind' },
  { name: 'Cruz', gender: 'neutral', origin: 'Spanish', meaning: 'Cross' },
  { name: 'Ira', gender: 'neutral', origin: 'Hebrew', meaning: 'Watchful' },
  { name: 'Asa', gender: 'neutral', origin: 'Hebrew', meaning: 'Healer, physician' },

  // Celtic/Gaelic names
  { name: 'Cillian', gender: 'boy', origin: 'Irish', meaning: 'Little church' },
  { name: 'Declan', gender: 'boy', origin: 'Irish', meaning: 'Full of goodness' },
  { name: 'Oisin', gender: 'boy', origin: 'Irish', meaning: 'Little deer' },
  { name: 'Cormac', gender: 'boy', origin: 'Irish', meaning: 'Charioteer' },
  { name: 'Lorcan', gender: 'boy', origin: 'Irish', meaning: 'Little fierce one' },
  { name: 'Tadhg', gender: 'boy', origin: 'Irish', meaning: 'Poet, philosopher' },
  { name: 'Eamon', gender: 'boy', origin: 'Irish', meaning: 'Wealthy protector' },
  { name: 'Cian', gender: 'boy', origin: 'Irish', meaning: 'Ancient, enduring' },
  { name: 'Seamus', gender: 'boy', origin: 'Irish', meaning: 'Supplanter' },
  { name: 'Padraig', gender: 'boy', origin: 'Irish', meaning: 'Noble, patrician' },
  { name: 'Callum', gender: 'boy', origin: 'Scottish', meaning: 'Dove' },
  { name: 'Hamish', gender: 'boy', origin: 'Scottish', meaning: 'Supplanter' },
  { name: 'Angus', gender: 'boy', origin: 'Scottish', meaning: 'One strength' },
  { name: 'Alasdair', gender: 'boy', origin: 'Scottish', meaning: 'Defender of mankind' },
  { name: 'Fergus', gender: 'boy', origin: 'Scottish', meaning: 'Man of vigor' },
  { name: 'Gethin', gender: 'boy', origin: 'Welsh', meaning: 'Dark-skinned' },
  { name: 'Idris', gender: 'boy', origin: 'Welsh', meaning: 'Ardent lord' },
  { name: 'Rhys', gender: 'boy', origin: 'Welsh', meaning: 'Enthusiasm, ardor' },
  { name: 'Emrys', gender: 'boy', origin: 'Welsh', meaning: 'Immortal' },
  { name: 'Owain', gender: 'boy', origin: 'Welsh', meaning: 'Young warrior' },
  { name: 'Saoirse', gender: 'girl', origin: 'Irish', meaning: 'Freedom, liberty' },
  { name: 'Siobhan', gender: 'girl', origin: 'Irish', meaning: 'God is gracious' },
  { name: 'Niamh', gender: 'girl', origin: 'Irish', meaning: 'Bright, radiant' },
  { name: 'Aoife', gender: 'girl', origin: 'Irish', meaning: 'Beautiful, radiant' },
  { name: 'Caoimhe', gender: 'girl', origin: 'Irish', meaning: 'Gentle, beautiful' },
  { name: 'Orla', gender: 'girl', origin: 'Irish', meaning: 'Golden princess' },
  { name: 'Clodagh', gender: 'girl', origin: 'Irish', meaning: 'River name' },
  { name: 'Sinead', gender: 'girl', origin: 'Irish', meaning: 'God is gracious' },
  { name: 'Ailish', gender: 'girl', origin: 'Irish', meaning: 'Noble, kind' },
  { name: 'Roisin', gender: 'girl', origin: 'Irish', meaning: 'Little rose' },
  { name: 'Eilidh', gender: 'girl', origin: 'Scottish', meaning: 'Sun, radiant one' },
  { name: 'Morven', gender: 'girl', origin: 'Scottish', meaning: 'Big peak' },
  { name: 'Ailsa', gender: 'girl', origin: 'Scottish', meaning: 'Elf victory' },
  { name: 'Ffion', gender: 'girl', origin: 'Welsh', meaning: 'Foxglove flower' },
  { name: 'Cerys', gender: 'girl', origin: 'Welsh', meaning: 'Love' },
  { name: 'Bronwen', gender: 'girl', origin: 'Welsh', meaning: 'Fair, blessed' },
  { name: 'Rhiannon', gender: 'girl', origin: 'Welsh', meaning: 'Divine queen' },
  { name: 'Carys', gender: 'girl', origin: 'Welsh', meaning: 'Beloved' },

  // Scandinavian names
  { name: 'Leif', gender: 'boy', origin: 'Norwegian', meaning: 'Descendant, heir' },
  { name: 'Bjorn', gender: 'boy', origin: 'Norwegian', meaning: 'Bear' },
  { name: 'Gunnar', gender: 'boy', origin: 'Norwegian', meaning: 'Bold warrior' },
  { name: 'Ragnar', gender: 'boy', origin: 'Norwegian', meaning: 'Warrior of the gods' },
  { name: 'Harald', gender: 'boy', origin: 'Norwegian', meaning: 'Army ruler' },
  { name: 'Anders', gender: 'boy', origin: 'Swedish', meaning: 'Strong and manly' },
  { name: 'Erik', gender: 'boy', origin: 'Swedish', meaning: 'Eternal ruler' },
  { name: 'Lars', gender: 'boy', origin: 'Swedish', meaning: 'Crowned with laurel' },
  { name: 'Nils', gender: 'boy', origin: 'Swedish', meaning: 'Victory of the people' },
  { name: 'Gustaf', gender: 'boy', origin: 'Swedish', meaning: 'Staff of the Goths' },
  { name: 'Soren', gender: 'boy', origin: 'Danish', meaning: 'Stern, severe' },
  { name: 'Magnus', gender: 'boy', origin: 'Danish', meaning: 'Great, mighty' },
  { name: 'Niels', gender: 'boy', origin: 'Danish', meaning: 'Champion' },
  { name: 'Viggo', gender: 'boy', origin: 'Danish', meaning: 'War, battle' },
  { name: 'Mikko', gender: 'boy', origin: 'Finnish', meaning: 'Who is like God' },
  { name: 'Eero', gender: 'boy', origin: 'Finnish', meaning: 'Eternal ruler' },
  { name: 'Aleksi', gender: 'boy', origin: 'Finnish', meaning: 'Defender of mankind' },
  { name: 'Veikko', gender: 'boy', origin: 'Finnish', meaning: 'Brother' },
  { name: 'Toivo', gender: 'boy', origin: 'Finnish', meaning: 'Hope' },
  { name: 'Sigrid', gender: 'girl', origin: 'Norwegian', meaning: 'Beautiful victory' },
  { name: 'Solveig', gender: 'girl', origin: 'Norwegian', meaning: 'Daughter of the sun' },
  { name: 'Ragnhild', gender: 'girl', origin: 'Norwegian', meaning: 'Battle counsel' },
  { name: 'Liv', gender: 'girl', origin: 'Norwegian', meaning: 'Life, protection' },
  { name: 'Maja', gender: 'girl', origin: 'Swedish', meaning: 'Splendid' },
  { name: 'Linnea', gender: 'girl', origin: 'Swedish', meaning: 'Lime tree, twinflower' },
  { name: 'Elsa', gender: 'girl', origin: 'Swedish', meaning: 'Pledged to God' },
  { name: 'Saga', gender: 'girl', origin: 'Swedish', meaning: 'Story, goddess of poetry' },
  { name: 'Freja', gender: 'girl', origin: 'Danish', meaning: 'Lady, noblewoman' },
  { name: 'Katrine', gender: 'girl', origin: 'Danish', meaning: 'Pure' },
  { name: 'Aino', gender: 'girl', origin: 'Finnish', meaning: 'The only one' },
  { name: 'Sini', gender: 'girl', origin: 'Finnish', meaning: 'Blue' },
  { name: 'Helmi', gender: 'girl', origin: 'Finnish', meaning: 'Pearl' },
  { name: 'Tuuli', gender: 'girl', origin: 'Finnish', meaning: 'Wind' },

  // Slavic names
  { name: 'Nikolai', gender: 'boy', origin: 'Russian', meaning: 'Victory of the people' },
  { name: 'Alexei', gender: 'boy', origin: 'Russian', meaning: 'Defender of mankind' },
  { name: 'Mikhail', gender: 'boy', origin: 'Russian', meaning: 'Who is like God' },
  { name: 'Pavel', gender: 'boy', origin: 'Russian', meaning: 'Small, humble' },
  { name: 'Konstantin', gender: 'boy', origin: 'Russian', meaning: 'Constant, steadfast' },
  { name: 'Bogdan', gender: 'boy', origin: 'Ukrainian', meaning: 'Given by God' },
  { name: 'Taras', gender: 'boy', origin: 'Ukrainian', meaning: 'Of Tarentum' },
  { name: 'Oleg', gender: 'boy', origin: 'Ukrainian', meaning: 'Holy, blessed' },
  { name: 'Wojciech', gender: 'boy', origin: 'Polish', meaning: 'Soldier of comfort' },
  { name: 'Kazimierz', gender: 'boy', origin: 'Polish', meaning: 'Destroyer of peace' },
  { name: 'Tomasz', gender: 'boy', origin: 'Polish', meaning: 'Twin' },
  { name: 'Jakub', gender: 'boy', origin: 'Polish', meaning: 'Supplanter' },
  { name: 'Vaclav', gender: 'boy', origin: 'Czech', meaning: 'More glory' },
  { name: 'Jaroslav', gender: 'boy', origin: 'Czech', meaning: 'Fierce and glorious' },
  { name: 'Miroslav', gender: 'boy', origin: 'Czech', meaning: 'Peace and glory' },
  { name: 'Vladislav', gender: 'boy', origin: 'Czech', meaning: 'Glorious ruler' },
  { name: 'Tatiana', gender: 'girl', origin: 'Russian', meaning: 'Fairy queen' },
  { name: 'Natasha', gender: 'girl', origin: 'Russian', meaning: 'Born on Christmas' },
  { name: 'Svetlana', gender: 'girl', origin: 'Russian', meaning: 'Light, luminescent' },
  { name: 'Oksana', gender: 'girl', origin: 'Ukrainian', meaning: 'Praise be to God' },
  { name: 'Daryna', gender: 'girl', origin: 'Ukrainian', meaning: 'Gift' },
  { name: 'Zoriana', gender: 'girl', origin: 'Ukrainian', meaning: 'Star, dawn' },
  { name: 'Agnieszka', gender: 'girl', origin: 'Polish', meaning: 'Pure, holy' },
  { name: 'Jadwiga', gender: 'girl', origin: 'Polish', meaning: 'Battle' },
  { name: 'Zofia', gender: 'girl', origin: 'Polish', meaning: 'Wisdom' },
  { name: 'Milena', gender: 'girl', origin: 'Czech', meaning: 'Gracious, dear' },
  { name: 'Zdenka', gender: 'girl', origin: 'Czech', meaning: 'Woman from Sidon' },
  { name: 'Ludmila', gender: 'girl', origin: 'Czech', meaning: 'Beloved by the people' },

  // Celtic/Slavic/Scandinavian neutral names
  { name: 'Sloane', gender: 'neutral', origin: 'Irish', meaning: 'Raider, warrior' },
  { name: 'Kerry', gender: 'neutral', origin: 'Irish', meaning: 'Dark-haired' },
  { name: 'Misha', gender: 'neutral', origin: 'Russian', meaning: 'Who is like God' },
  { name: 'Nikita', gender: 'neutral', origin: 'Russian', meaning: 'Unconquered' },

  // African names - West African
  { name: 'Adaeze', gender: 'girl', origin: 'Igbo (Nigerian)', meaning: 'Princess, daughter of the king' },
  { name: 'Chiamaka', gender: 'girl', origin: 'Igbo (Nigerian)', meaning: 'God is beautiful' },
  { name: 'Adaora', gender: 'girl', origin: 'Igbo (Nigerian)', meaning: 'Daughter of the people' },
  { name: 'Nkechi', gender: 'girl', origin: 'Igbo (Nigerian)', meaning: 'Gift of God' },
  { name: 'Adetola', gender: 'girl', origin: 'Yoruba (Nigerian)', meaning: 'Crown has honor' },
  { name: 'Folake', gender: 'girl', origin: 'Yoruba (Nigerian)', meaning: 'Placed in the care of God' },
  { name: 'Yetunde', gender: 'girl', origin: 'Yoruba (Nigerian)', meaning: 'Mother has returned' },
  { name: 'Akosua', gender: 'girl', origin: 'Akan (Ghanaian)', meaning: 'Born on Sunday' },
  { name: 'Ama', gender: 'girl', origin: 'Akan (Ghanaian)', meaning: 'Born on Saturday' },
  { name: 'Adwoa', gender: 'girl', origin: 'Akan (Ghanaian)', meaning: 'Born on Monday' },
  { name: 'Chukwuemeka', gender: 'boy', origin: 'Igbo (Nigerian)', meaning: 'God has done great things' },
  { name: 'Obinna', gender: 'boy', origin: 'Igbo (Nigerian)', meaning: 'Heart of the father' },
  { name: 'Chinedu', gender: 'boy', origin: 'Igbo (Nigerian)', meaning: 'God leads' },
  { name: 'Adebayo', gender: 'boy', origin: 'Yoruba (Nigerian)', meaning: 'The crown meets joy' },
  { name: 'Oluwaseun', gender: 'boy', origin: 'Yoruba (Nigerian)', meaning: 'God has done something' },
  { name: 'Yaw', gender: 'boy', origin: 'Akan (Ghanaian)', meaning: 'Born on Thursday' },
  { name: 'Kojo', gender: 'boy', origin: 'Akan (Ghanaian)', meaning: 'Born on Monday' },

  // African names - East African
  { name: 'Zawadi', gender: 'girl', origin: 'Swahili', meaning: 'Gift' },
  { name: 'Hadiya', gender: 'girl', origin: 'Swahili', meaning: 'Guide to righteousness' },
  { name: 'Makena', gender: 'girl', origin: 'Kikuyu (Kenyan)', meaning: 'Happy one' },
  { name: 'Wanjiku', gender: 'girl', origin: 'Kikuyu (Kenyan)', meaning: 'Of Kikuyu ancestry' },
  { name: 'Tigist', gender: 'girl', origin: 'Amharic (Ethiopian)', meaning: 'Patience' },
  { name: 'Bethlehem', gender: 'girl', origin: 'Amharic (Ethiopian)', meaning: 'House of bread' },
  { name: 'Baraka', gender: 'boy', origin: 'Swahili', meaning: 'Blessings' },
  { name: 'Juma', gender: 'boy', origin: 'Swahili', meaning: 'Born on Friday' },
  { name: 'Kamau', gender: 'boy', origin: 'Kikuyu (Kenyan)', meaning: 'Quiet warrior' },
  { name: 'Yonas', gender: 'boy', origin: 'Amharic (Ethiopian)', meaning: 'Dove' },
  { name: 'Dawit', gender: 'boy', origin: 'Amharic (Ethiopian)', meaning: 'Beloved' },

  // African names - Southern African
  { name: 'Thandiwe', gender: 'girl', origin: 'Zulu (South African)', meaning: 'Loving one' },
  { name: 'Nomvula', gender: 'girl', origin: 'Zulu (South African)', meaning: 'Mother of rain' },
  { name: 'Lindiwe', gender: 'girl', origin: 'Zulu (South African)', meaning: 'Awaited' },
  { name: 'Mpho', gender: 'neutral', origin: 'Sotho (South African)', meaning: 'Gift' },
  { name: 'Sibusiso', gender: 'boy', origin: 'Zulu (South African)', meaning: 'Blessing' },
  { name: 'Thabo', gender: 'boy', origin: 'Sotho (South African)', meaning: 'Joy' },

  // South Asian names
  { name: 'Ishita', gender: 'girl', origin: 'Sanskrit', meaning: 'Mastery, wealth' },
  { name: 'Meera', gender: 'girl', origin: 'Sanskrit', meaning: 'Ocean, boundary' },
  { name: 'Saanvi', gender: 'girl', origin: 'Sanskrit', meaning: 'Goddess Lakshmi' },
  { name: 'Diya', gender: 'girl', origin: 'Sanskrit', meaning: 'Lamp, light' },
  { name: 'Tara', gender: 'girl', origin: 'Sanskrit', meaning: 'Star' },
  { name: 'Nisha', gender: 'girl', origin: 'Sanskrit', meaning: 'Night' },
  { name: 'Aditi', gender: 'girl', origin: 'Sanskrit', meaning: 'Boundless, free' },
  { name: 'Kavi', gender: 'boy', origin: 'Sanskrit', meaning: 'Poet, wise' },
  { name: 'Aryan', gender: 'boy', origin: 'Sanskrit', meaning: 'Noble one' },
  { name: 'Rehan', gender: 'boy', origin: 'Sanskrit', meaning: 'Sweet basil' },
  { name: 'Nikhil', gender: 'boy', origin: 'Sanskrit', meaning: 'Complete, whole' },
  { name: 'Vikram', gender: 'boy', origin: 'Sanskrit', meaning: 'Valorous' },

  // East Asian names
  { name: 'Haruka', gender: 'girl', origin: 'Japanese', meaning: 'Distant, far away' },
  { name: 'Nanami', gender: 'girl', origin: 'Japanese', meaning: 'Seven seas' },
  { name: 'Ayumi', gender: 'girl', origin: 'Japanese', meaning: 'Walk, progress' },
  { name: 'Himari', gender: 'girl', origin: 'Japanese', meaning: 'Sunflower' },
  { name: 'Hyejin', gender: 'girl', origin: 'Korean', meaning: 'Wisdom, truth' },
  { name: 'Eunji', gender: 'girl', origin: 'Korean', meaning: 'Grace, kindness' },
  { name: 'Suzy', gender: 'girl', origin: 'Korean', meaning: 'Elegant, refined' },
  { name: 'Xia', gender: 'girl', origin: 'Chinese', meaning: 'Glow of sunrise' },
  { name: 'Rui', gender: 'neutral', origin: 'Chinese', meaning: 'Wise, sharp' },
  { name: 'Hayato', gender: 'boy', origin: 'Japanese', meaning: 'Falcon person' },
  { name: 'Kaito', gender: 'boy', origin: 'Japanese', meaning: 'Ocean, sea' },
  { name: 'Sota', gender: 'boy', origin: 'Japanese', meaning: 'Sudden sound of wind' },
  { name: 'Minho', gender: 'boy', origin: 'Korean', meaning: 'Brightness, valor' },
  { name: 'Jiho', gender: 'neutral', origin: 'Korean', meaning: 'Wisdom, ambition' },

  // Southeast Asian names
  { name: 'Mai', gender: 'girl', origin: 'Vietnamese', meaning: 'Apricot blossom' },
  { name: 'Thuy', gender: 'girl', origin: 'Vietnamese', meaning: 'Water' },
  { name: 'Putri', gender: 'girl', origin: 'Indonesian', meaning: 'Princess' },
  { name: 'Dewi', gender: 'girl', origin: 'Indonesian', meaning: 'Goddess' },
  { name: 'Siti', gender: 'girl', origin: 'Malay', meaning: 'Lady' },
  { name: 'Duc', gender: 'boy', origin: 'Vietnamese', meaning: 'Virtue' },
  { name: 'Budi', gender: 'boy', origin: 'Indonesian', meaning: 'Wisdom, character' },
  { name: 'Arif', gender: 'boy', origin: 'Malay', meaning: 'Knowledgeable, wise' },

  // Middle Eastern names
  { name: 'Amira', gender: 'girl', origin: 'Arabic', meaning: 'Princess' },
  { name: 'Huda', gender: 'girl', origin: 'Arabic', meaning: 'Right guidance' },
  { name: 'Lina', gender: 'girl', origin: 'Arabic', meaning: 'Tender, delicate' },
  { name: 'Safiya', gender: 'girl', origin: 'Arabic', meaning: 'Pure, sincere' },
  { name: 'Reem', gender: 'girl', origin: 'Arabic', meaning: 'White gazelle' },
  { name: 'Maryam', gender: 'girl', origin: 'Arabic', meaning: 'Beloved' },
  { name: 'Shirin', gender: 'girl', origin: 'Persian', meaning: 'Sweet' },
  { name: 'Parisa', gender: 'girl', origin: 'Persian', meaning: 'Like a fairy' },
  { name: 'Azar', gender: 'neutral', origin: 'Persian', meaning: 'Fire' },
  { name: 'Hamza', gender: 'boy', origin: 'Arabic', meaning: 'Strong, steadfast' },
  { name: 'Yusuf', gender: 'boy', origin: 'Arabic', meaning: 'God increases' },
  { name: 'Hassan', gender: 'boy', origin: 'Arabic', meaning: 'Beautiful, good' },
  { name: 'Faris', gender: 'boy', origin: 'Arabic', meaning: 'Knight' },
  { name: 'Reza', gender: 'boy', origin: 'Persian', meaning: 'Contentment' },
  { name: 'Kamran', gender: 'boy', origin: 'Persian', meaning: 'Fortunate, blessed' },

  // Latin American names
  { name: 'Marisela', gender: 'girl', origin: 'Spanish', meaning: 'Sea and sky' },
  { name: 'Soledad', gender: 'girl', origin: 'Spanish', meaning: 'Solitude' },
  { name: 'Rosario', gender: 'neutral', origin: 'Spanish', meaning: 'Rosary' },
  { name: 'Itzayana', gender: 'girl', origin: 'Mayan', meaning: 'Gift of God' },
  { name: 'Xochitl', gender: 'girl', origin: 'Nahuatl (Mexican)', meaning: 'Flower' },
  { name: 'Yatzil', gender: 'girl', origin: 'Mayan', meaning: 'Beloved' },
  { name: 'Iemanja', gender: 'girl', origin: 'Brazilian/Yoruba', meaning: 'Mother of fish' },
  { name: 'Itzel', gender: 'girl', origin: 'Mayan', meaning: 'Rainbow lady' },
  { name: 'Tonatiuh', gender: 'boy', origin: 'Nahuatl (Mexican)', meaning: 'Sun god' },
  { name: 'Tenoch', gender: 'boy', origin: 'Nahuatl (Mexican)', meaning: 'Stone cactus fruit' },
  { name: 'Iker', gender: 'boy', origin: 'Basque (Spanish)', meaning: 'Visitation' },
  { name: 'Luciano', gender: 'boy', origin: 'Italian/Spanish', meaning: 'Light' },
  { name: 'Benicio', gender: 'boy', origin: 'Spanish', meaning: 'Blessed' },

  // Additional European names
  { name: 'Aurelia', gender: 'girl', origin: 'Latin', meaning: 'Golden' },
  { name: 'Seraphina', gender: 'girl', origin: 'Hebrew', meaning: 'Fiery ones' },
  { name: 'Elisabetta', gender: 'girl', origin: 'Italian', meaning: 'Pledged to God' },
  { name: 'Giovanna', gender: 'girl', origin: 'Italian', meaning: 'God is gracious' },
  { name: 'Annalise', gender: 'girl', origin: 'German', meaning: 'Grace, favor' },
  { name: 'Beatrix', gender: 'girl', origin: 'Latin', meaning: 'She who brings happiness' },
  { name: 'Enzo', gender: 'boy', origin: 'Italian', meaning: 'Ruler of the home' },
  { name: 'Lorenzo', gender: 'boy', origin: 'Italian', meaning: 'From Laurentum' },
  { name: 'Matteo', gender: 'boy', origin: 'Italian', meaning: 'Gift of God' },
  { name: 'Rocco', gender: 'boy', origin: 'Italian', meaning: 'Rest' },
  { name: 'Wolfgang', gender: 'boy', origin: 'German', meaning: 'Wolf path' },
  { name: 'Leopold', gender: 'boy', origin: 'German', meaning: 'Bold people' },

  // Batch 3: Modern/trendy, nature-inspired, vintage revivals, unique spellings
  // Boy names - modern/trendy American
  { name: 'Beckett', gender: 'boy', origin: 'English', meaning: 'Beehive, bee cottage' },
  { name: 'Brooks', gender: 'boy', origin: 'English', meaning: 'Small stream' },
  { name: 'Easton', gender: 'boy', origin: 'English', meaning: 'East-facing town' },
  { name: 'Grayson', gender: 'boy', origin: 'English', meaning: 'Son of the gray-haired one' },
  { name: 'Knox', gender: 'boy', origin: 'Scottish', meaning: 'Round hill' },
  { name: 'Maverick', gender: 'boy', origin: 'American', meaning: 'Independent, nonconformist' },
  { name: 'Rhett', gender: 'boy', origin: 'Welsh', meaning: 'Ardent, fiery' },
  { name: 'Weston', gender: 'boy', origin: 'English', meaning: 'Western town' },
  { name: 'Asher', gender: 'boy', origin: 'Hebrew', meaning: 'Happy, blessed' },
  { name: 'Jaxon', gender: 'boy', origin: 'American', meaning: 'Son of Jack' },
  { name: 'Braxton', gender: 'boy', origin: 'English', meaning: 'Brock\'s town' },
  { name: 'Colton', gender: 'boy', origin: 'English', meaning: 'Coal town' },
  { name: 'Crew', gender: 'boy', origin: 'English', meaning: 'Group, squad' },
  { name: 'Hendrix', gender: 'boy', origin: 'German', meaning: 'Estate ruler' },
  { name: 'Karter', gender: 'boy', origin: 'American', meaning: 'Cart driver' },

  // Boy names - nature/celestial/elements
  { name: 'Canyon', gender: 'boy', origin: 'American', meaning: 'Deep ravine' },
  { name: 'Flint', gender: 'boy', origin: 'English', meaning: 'Hard quartz rock' },
  { name: 'Hawk', gender: 'boy', origin: 'English', meaning: 'Bird of prey' },
  { name: 'Ridge', gender: 'boy', origin: 'English', meaning: 'Mountain ridge' },
  { name: 'Clay', gender: 'boy', origin: 'English', meaning: 'Clay worker' },
  { name: 'Cove', gender: 'boy', origin: 'English', meaning: 'Small bay' },
  { name: 'Heath', gender: 'boy', origin: 'English', meaning: 'Moorland' },
  { name: 'Reef', gender: 'boy', origin: 'English', meaning: 'Ridge of rocks' },
  { name: 'Storm', gender: 'boy', origin: 'English', meaning: 'Tempest' },
  { name: 'Orion', gender: 'boy', origin: 'Greek', meaning: 'Rising in the sky, hunter' },

  // Boy names - vintage/classic revival
  { name: 'Archie', gender: 'boy', origin: 'German', meaning: 'Truly brave' },
  { name: 'Edmund', gender: 'boy', origin: 'English', meaning: 'Prosperous protector' },
  { name: 'Franklin', gender: 'boy', origin: 'English', meaning: 'Free landholder' },
  { name: 'Percival', gender: 'boy', origin: 'French', meaning: 'Pierce the valley' },
  { name: 'Reginald', gender: 'boy', origin: 'German', meaning: 'Counsel power' },
  { name: 'Vincent', gender: 'boy', origin: 'Latin', meaning: 'Conquering' },
  { name: 'Walter', gender: 'boy', origin: 'German', meaning: 'Army ruler' },
  { name: 'Clarence', gender: 'boy', origin: 'Latin', meaning: 'Bright, clear' },
  { name: 'Atticus', gender: 'boy', origin: 'Latin', meaning: 'From Attica' },
  { name: 'Emmett', gender: 'boy', origin: 'English', meaning: 'Entire, universal' },

  // Girl names - modern/trendy American
  { name: 'Adalynn', gender: 'girl', origin: 'German', meaning: 'Noble one' },
  { name: 'Brynlee', gender: 'girl', origin: 'Welsh', meaning: 'Hill meadow' },
  { name: 'Emersyn', gender: 'girl', origin: 'American', meaning: 'Son of Emery' },
  { name: 'Hadleigh', gender: 'girl', origin: 'English', meaning: 'Heather field' },
  { name: 'Kinslee', gender: 'girl', origin: 'English', meaning: 'King\'s meadow' },
  { name: 'Oaklynn', gender: 'girl', origin: 'American', meaning: 'Oak tree lake' },
  { name: 'Ryleigh', gender: 'girl', origin: 'Irish', meaning: 'Courageous' },
  { name: 'Tinsley', gender: 'girl', origin: 'English', meaning: 'Tynni\'s meadow' },
  { name: 'Waverly', gender: 'girl', origin: 'English', meaning: 'Meadow of quivering aspens' },
  { name: 'Zaylee', gender: 'girl', origin: 'American', meaning: 'Dry land' },
  { name: 'Brinley', gender: 'girl', origin: 'English', meaning: 'Burnt meadow' },
  { name: 'Everleigh', gender: 'girl', origin: 'English', meaning: 'Boar meadow' },
  { name: 'Journee', gender: 'girl', origin: 'American', meaning: 'Day\'s travel' },
  { name: 'Kaylani', gender: 'girl', origin: 'Hawaiian', meaning: 'Sea and sky' },
  { name: 'Meilani', gender: 'girl', origin: 'Hawaiian', meaning: 'Heavenly flower' },

  // Girl names - nature/gems/flowers/celestial
  { name: 'Amaryllis', gender: 'girl', origin: 'Greek', meaning: 'Fresh, sparkling' },
  { name: 'Beryl', gender: 'girl', origin: 'Greek', meaning: 'Sea-green jewel' },
  { name: 'Camellia', gender: 'girl', origin: 'Latin', meaning: 'Kamel\'s flower' },
  { name: 'Elowen', gender: 'girl', origin: 'Cornish', meaning: 'Elm tree' },
  { name: 'Garnet', gender: 'girl', origin: 'English', meaning: 'Deep red gem' },
  { name: 'Honey', gender: 'girl', origin: 'English', meaning: 'Sweet nectar' },
  { name: 'Ivory', gender: 'girl', origin: 'English', meaning: 'White, pure' },
  { name: 'Lavender', gender: 'girl', origin: 'English', meaning: 'Purple flower' },
  { name: 'Meadow', gender: 'girl', origin: 'English', meaning: 'Field of grass' },
  { name: 'Primrose', gender: 'girl', origin: 'English', meaning: 'First rose' },
  { name: 'Saffron', gender: 'girl', origin: 'English', meaning: 'Yellow spice' },
  { name: 'Topaz', gender: 'girl', origin: 'Greek', meaning: 'Golden gem' },
  { name: 'Zinnia', gender: 'girl', origin: 'Latin', meaning: 'Zinn\'s flower' },
  { name: 'Cosima', gender: 'girl', origin: 'Greek', meaning: 'Order, beauty' },
  { name: 'Selene', gender: 'girl', origin: 'Greek', meaning: 'Moon goddess' },

  // Girl names - vintage/classic revival
  { name: 'Agatha', gender: 'girl', origin: 'Greek', meaning: 'Good, honorable' },
  { name: 'Cecelia', gender: 'girl', origin: 'Latin', meaning: 'Blind to one\'s own beauty' },
  { name: 'Dorothea', gender: 'girl', origin: 'Greek', meaning: 'Gift of God' },
  { name: 'Estelle', gender: 'girl', origin: 'French', meaning: 'Star' },
  { name: 'Francesca', gender: 'girl', origin: 'Italian', meaning: 'Free one' },
  { name: 'Guinevere', gender: 'girl', origin: 'Welsh', meaning: 'White phantom' },
  { name: 'Henrietta', gender: 'girl', origin: 'German', meaning: 'Ruler of the home' },
  { name: 'Imogen', gender: 'girl', origin: 'Celtic', meaning: 'Maiden' },
  { name: 'Loretta', gender: 'girl', origin: 'Italian', meaning: 'Laurel tree' },
  { name: 'Millicent', gender: 'girl', origin: 'German', meaning: 'Strong in work' },
  { name: 'Ophelia', gender: 'girl', origin: 'Greek', meaning: 'Helper' },
  { name: 'Ramona', gender: 'girl', origin: 'Spanish', meaning: 'Wise protector' },
  { name: 'Theodora', gender: 'girl', origin: 'Greek', meaning: 'Gift of God' },
  { name: 'Clementine', gender: 'girl', origin: 'French', meaning: 'Mild, merciful' },
  { name: 'Cordelia', gender: 'girl', origin: 'Latin', meaning: 'Heart, daughter of the sea' },

  // Neutral names - modern/nature-inspired
  { name: 'Arlo', gender: 'neutral', origin: 'English', meaning: 'Fortified hill' },
  { name: 'Hollis', gender: 'neutral', origin: 'English', meaning: 'Near the holly bushes' },
  { name: 'Linden', gender: 'neutral', origin: 'English', meaning: 'Linden tree hill' },
  { name: 'Palmer', gender: 'neutral', origin: 'English', meaning: 'Pilgrim bearing palm' },
  { name: 'Arbor', gender: 'neutral', origin: 'Latin', meaning: 'Tree, bower' },
  { name: 'Briar', gender: 'neutral', origin: 'English', meaning: 'Thorny shrub' },
  { name: 'Elm', gender: 'neutral', origin: 'English', meaning: 'Elm tree' },
  { name: 'Fable', gender: 'neutral', origin: 'English', meaning: 'Legendary tale' },
  { name: 'Glen', gender: 'neutral', origin: 'Scottish', meaning: 'Valley' },
  { name: 'Moss', gender: 'neutral', origin: 'English', meaning: 'Soft green plant' },
  { name: 'Noble', gender: 'neutral', origin: 'English', meaning: 'Distinguished' },
  { name: 'Quill', gender: 'neutral', origin: 'English', meaning: 'Writing feather' },
  { name: 'Robin', gender: 'neutral', origin: 'English', meaning: 'Bright fame' },
  { name: 'Sol', gender: 'neutral', origin: 'Spanish', meaning: 'Sun' },
  { name: 'Timber', gender: 'neutral', origin: 'English', meaning: 'Wood, strong' },
  { name: 'True', gender: 'neutral', origin: 'English', meaning: 'Loyal, faithful' },
  { name: 'Vesper', gender: 'neutral', origin: 'Latin', meaning: 'Evening star' },
  { name: 'Wilder', gender: 'neutral', origin: 'English', meaning: 'Untamed' },
  { name: 'Yarrow', gender: 'neutral', origin: 'English', meaning: 'Healing herb' },
  { name: 'Rain', gender: 'neutral', origin: 'English', meaning: 'Abundant blessings' },
];

// Add popularity scores (somewhat random but weighted)
function getPopularityScore(name) {
  // Common names get higher scores
  const popularNames = ['liam', 'noah', 'olivia', 'emma', 'charlotte', 'james', 'sophia', 'amelia'];
  if (popularNames.includes(name.toLowerCase())) {
    return Math.floor(Math.random() * 20) + 80; // 80-100
  }
  // Unique names get lower scores
  if (name.length > 8) {
    return Math.floor(Math.random() * 40) + 20; // 20-60
  }
  // Average names
  return Math.floor(Math.random() * 50) + 30; // 30-80
}

async function seed() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tables if they don't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS names (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          gender TEXT NOT NULL CHECK(gender IN ('boy', 'girl', 'neutral')),
          origin TEXT,
          meaning TEXT,
          popularity_score INTEGER DEFAULT 50 CHECK(popularity_score >= 1 AND popularity_score <= 100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          preferences_json TEXT DEFAULT '{}',
          gender_filter TEXT DEFAULT 'all',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS swipes (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          name_id TEXT NOT NULL,
          direction TEXT NOT NULL CHECK(direction IN ('left', 'right')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES sessions(id),
          FOREIGN KEY (name_id) REFERENCES names(id),
          UNIQUE(session_id, name_id)
        )
      `);

      // Clear existing data (idempotent)
      db.run('DELETE FROM swipes', () => {});
      db.run('DELETE FROM names', () => {});

      const stmt = db.prepare(`
        INSERT INTO names (id, name, gender, origin, meaning, popularity_score)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      names.forEach(entry => {
        const id = uuidv4();
        const popularity = getPopularityScore(entry.name);
        stmt.run(id, entry.name, entry.gender, entry.origin, entry.meaning, popularity);
      });

      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Seeded ${names.length} baby names`);
          console.log(`   - Boy names: ${names.filter(n => n.gender === 'boy').length}`);
          console.log(`   - Girl names: ${names.filter(n => n.gender === 'girl').length}`);
          console.log(`   - Neutral names: ${names.filter(n => n.gender === 'neutral').length}`);
          resolve();
        }
      });
    });
  });
}

seed()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Seed failed:', err);
    db.close();
    process.exit(1);
  });
