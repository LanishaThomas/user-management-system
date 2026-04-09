require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/user_management_system';
  console.log('MONGO_URI not found in .env. Using default local MongoDB URI.');
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function buildSampleUsers() {
  const names = [
    'Alice Morgan',
    'Brian Patel',
    'Carmen Lee',
    'Daniel Brooks',
    'Elena Rossi',
    'Farah Khan',
    'George Miller',
    'Hana Suzuki',
    'Ibrahim Noor',
    'Julia Flores',
    'Karan Shah',
    'Lina Haddad',
    'Marcus Allen',
    'Nina Popov',
    'Omar Rahman',
    'Priya Menon',
    'Quincy Hayes',
    'Rosa Delgado',
    'Samuel Young',
    'Tara Benson',
    'Uma Iyer',
    'Victor Silva',
    'Wendy Zhao',
    'Yasir Malik'
  ];

  const hobbySets = [
    ['reading', 'hiking', 'cooking'],
    ['gaming', 'cycling'],
    ['painting', 'travel'],
    ['photography', 'running'],
    ['music', 'chess'],
    ['yoga', 'gardening'],
    ['coding', 'gaming'],
    ['swimming', 'travel'],
    ['writing', 'music'],
    ['hiking', 'cycling'],
    ['reading', 'chess'],
    ['travel', 'cooking']
  ];

  const bios = [
    'Enjoys mountain hiking and long distance cycling on weekends.',
    'Avid reader who writes short fiction and poetry.',
    'Passionate about travel photography and food culture.',
    'Software enthusiast who likes coding and chess strategy.',
    'Music lover exploring jazz, piano, and live events.',
    'Fitness minded with daily yoga and mindful routines.',
    'Nature focused gardener and occasional landscape painter.',
    'Community volunteer interested in education and mentoring.',
    'Tech blogger covering APIs, databases, and performance tuning.',
    'Creative cook experimenting with global cuisines at home.'
  ];

  return names.map((name, index) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '.');
    return {
      name,
      email: `${slug}@gmail.com`,
      age: 20 + (index % 35),
      hobbies: hobbySets[index % hobbySets.length],
      bio: `${bios[index % bios.length]} Profile ${index + 1}.`,
      userId: `uid-${Date.now()}-${index + 1}`,
      createdAt: new Date(Date.now() - (index % 6) * MS_IN_DAY)
    };
  });
}

function printHeader(title) {
  console.log('');
  console.log('='.repeat(78));
  console.log(title);
  console.log('='.repeat(78));
}

function printStats(title, executionStats) {
  console.log(`\n${title}`);
  console.log('-'.repeat(78));
  console.log(`totalKeysExamined : ${executionStats.totalKeysExamined}`);
  console.log(`totalDocsExamined : ${executionStats.totalDocsExamined}`);
  console.log(`executionTimeMillis: ${executionStats.executionTimeMillis}`);
}

function percentDiff(base, compare) {
  if (base === 0) return 'n/a';
  const diff = ((compare - base) / base) * 100;
  return `${diff.toFixed(2)}%`;
}

async function runExplain(query, options = {}) {
  const cursor = User.collection.find(query, options.projection ? { projection: options.projection } : {});

  if (options.sort) {
    cursor.sort(options.sort);
  }

  if (options.hint) {
    cursor.hint(options.hint);
  }

  return cursor.explain('executionStats');
}

async function main() {
  const compareMode = process.argv.includes('--compare');

  await connectDB();

  // Ensure all schema-defined indexes are created before performance checks.
  await User.createIndexes();

  const sampleUsers = buildSampleUsers();
  const sampleEmails = sampleUsers.map((user) => user.email);
  await User.deleteMany({ email: { $in: sampleEmails } });
  const inserted = await User.insertMany(sampleUsers, { ordered: true });

  printHeader('INDEX PERFORMANCE TEST REPORT');
  console.log(`Inserted sample users: ${inserted.length}`);
  console.log(`Collection: ${User.collection.collectionName}`);

  const nameQuery = { name: 'Alice Morgan' };
  const hobbyQuery = { hobbies: 'hiking' };
  const bioTextQuery = { $text: { $search: 'travel photography' } };

  const nameExplain = await runExplain(nameQuery);
  const hobbyExplain = await runExplain(hobbyQuery);
  const bioTextExplain = await runExplain(bioTextQuery, {
    projection: { score: { $meta: 'textScore' } },
    sort: { score: { $meta: 'textScore' } }
  });

  printHeader('WITH INDEXES (executionStats)');
  printStats('1) Name Search Query', nameExplain.executionStats);
  printStats('2) Hobby Search Query', hobbyExplain.executionStats);
  printStats('3) Bio Text Search Query', bioTextExplain.executionStats);

  if (compareMode) {
    printHeader('COMPARE MODE: FORCED COLLECTION SCAN');

    const nameNoIndex = await runExplain(nameQuery, { hint: { $natural: 1 } });
    const hobbyNoIndex = await runExplain(hobbyQuery, { hint: { $natural: 1 } });
    const bioRegexNoIndex = await runExplain(
      { bio: { $regex: 'travel|photography', $options: 'i' } },
      { hint: { $natural: 1 } }
    );

    printStats('1) Name Search (no index, forced COLLSCAN)', nameNoIndex.executionStats);
    printStats('2) Hobby Search (no index, forced COLLSCAN)', hobbyNoIndex.executionStats);
    printStats('3) Bio Regex Search (no text index, forced COLLSCAN)', bioRegexNoIndex.executionStats);

    printHeader('COMPARISON SUMMARY');
    console.log('Name Search:');
    console.log(`  Docs examined delta: ${percentDiff(nameExplain.executionStats.totalDocsExamined, nameNoIndex.executionStats.totalDocsExamined)}`);
    console.log(`  Time delta: ${percentDiff(nameExplain.executionStats.executionTimeMillis, nameNoIndex.executionStats.executionTimeMillis)}`);

    console.log('Hobby Search:');
    console.log(`  Docs examined delta: ${percentDiff(hobbyExplain.executionStats.totalDocsExamined, hobbyNoIndex.executionStats.totalDocsExamined)}`);
    console.log(`  Time delta: ${percentDiff(hobbyExplain.executionStats.executionTimeMillis, hobbyNoIndex.executionStats.executionTimeMillis)}`);

    console.log('Bio Search:');
    console.log('  Indexed query uses $text, while no-index comparison uses regex over bio.');
    console.log(`  Indexed docs examined: ${bioTextExplain.executionStats.totalDocsExamined}`);
    console.log(`  Regex docs examined  : ${bioRegexNoIndex.executionStats.totalDocsExamined}`);
  }

  printHeader('DONE');
  console.log('Run with optional comparison mode: node scripts/index-test.js --compare');

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (error) => {
  console.error('\nIndex test failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
