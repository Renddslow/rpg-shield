const polka = require('polka');
const cors = require('cors');
const got = require('got');
const { get } = require('dot-prop');

const PORT = process.env.PORT || 8080;

const getCharacter = async (characterID) => {
  return JSON.parse(
    (
      await got(`https://www.dndbeyond.com/character/${characterID}/json`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).body,
  );
};

polka()
  .use(cors(), (req, res, next) => {
    res.json = (body) => {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(body));
    };
    next();
  })
  .get('/:characterID/race', async (req, res) => {
    const character = await getCharacter(req.params.characterID);
    const race = get(character, 'race.fullName', 'Unknown');
    res.json({
      label: 'Race',
      message: race,
      color: '#F0544F',
    });
  })
  .get('/:characterID/class', async (req, res) => {
    const character = await getCharacter(req.params.characterID);
    const classes = get(character, 'classes', []);
    const message = classes
      .map((c) => {
        const lvl = get(c, 'level', 1);
        const name = get(c, 'definition.name', 'Unknown');
        return `${name} ${lvl}`;
      })
      .join(' / ');

    res.json({
      label: 'Class',
      message,
      color: '#06AED5',
    });
  })
  .get('/:characterID/xp', async (req, res) => {
    const character = await getCharacter(req.params.characterID);
    const xp = get(character, 'currentXp', 0);
    res.json({
      label: 'XP',
      message: xp.toString(),
      color: '#D81E5B',
    });
  })
  .listen(PORT, () => console.log(`⚔️ Starting DnD badge service on port ${PORT}`));
