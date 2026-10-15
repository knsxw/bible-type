// World English Bible Classic (public domain), https://ebible.org/eng-web/
// Typographic apostrophes and line breaks normalized for keyboard entry.
export const verses = [
['Psalms','23:1','Yahweh is my shepherd; I shall lack nothing.'],
['Psalms','23:2','He makes me lie down in green pastures. He leads me beside still waters.'],
['Psalms','23:3',"He restores my soul. He guides me in the paths of righteousness for his name's sake."],
['Psalms','23:4','Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.'],
['Psalms','23:5','You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.'],
['Psalms','23:6',"Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh's house forever."],
['John','1:1','In the beginning was the Word, and the Word was with God, and the Word was God.'],
['John','1:3','All things were made through him. Without him, nothing was made that has been made.'],
['John','1:4','In him was life, and the life was the light of men.'],
['John','1:5',"The light shines in the darkness, and the darkness hasn't overcome it."],
['John','1:9','The true light that enlightens everyone was coming into the world.'],
['John','1:14','The Word became flesh and lived among us. We saw his glory, such glory as of the only born Son of the Father, full of grace and truth.'],
['John','1:16','From his fullness we all received grace upon grace.'],
['John','1:17','For the law was given through Moses. Grace and truth were realized through Jesus Christ.'],
['Proverbs','1:7','The fear of Yahweh is the beginning of knowledge, but the foolish despise wisdom and instruction.'],
['Proverbs','1:8',"My son, listen to your father's instruction, and don't forsake your mother's teaching;"],
['Proverbs','1:9','for they will be a garland to grace your head, and chains around your neck.'],
['Proverbs','1:10',"My son, if sinners entice you, don't consent."],
['1 Corinthians','1:3','Grace to you and peace from God our Father and the Lord Jesus Christ.'],
['1 Corinthians','1:9','God is faithful, through whom you were called into the fellowship of his Son, Jesus Christ our Lord.'],
['1 Corinthians','1:25','because the foolishness of God is wiser than men, and the weakness of God is stronger than men.']
].map(([book,ref,text],id)=>({id,book,ref:`${book} ${ref}`,text}));
