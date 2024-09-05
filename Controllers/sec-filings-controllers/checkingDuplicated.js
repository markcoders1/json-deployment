const normalizeTitle = (title) => {
  return title.trim().replace(/\s+/g, ' '); // Trim and replace multiple spaces with a single space
};


const checkAndDeleteDuplicatePressReleases = async () => {
  try {
    // Fetch all press releases
    const pressReleases = await Press.find({}, 'press.meta.title');

    // Count occurrences of each normalized title and track the document IDs
    const titleCount = {};
    const titleDocuments = {}; // To store documents by normalized title for deletion

    pressReleases.forEach((press) => {
      const normalizedTitle = normalizeTitle(press.press.meta.title);

      if (titleCount[normalizedTitle]) {
        titleCount[normalizedTitle] += 1;
        titleDocuments[normalizedTitle].push(press._id); // Track duplicate document IDs
      } else {
        titleCount[normalizedTitle] = 1;
        titleDocuments[normalizedTitle] = [press._id]; // Track the first document ID
      }
    });

    // Check for duplicates based on the normalized title
    const duplicates = Object.keys(titleCount).filter((title) => titleCount[title] > 1);

    if (duplicates.length > 0) {
      console.log('Duplicate press releases found based on title:');
      for (const title of duplicates) {
        console.log(`Title: "${title}", Count: ${titleCount[title]}`);

        // Keep one document and delete the rest
        const [keepId, ...deleteIds] = titleDocuments[title];

        // Log which IDs will be deleted
        console.log(`Keeping: ${keepId}, Deleting: ${deleteIds}`);

        // Delete the duplicates from the database
        await Press.deleteMany({ _id: { $in: deleteIds } });
        console.log(`Deleted ${deleteIds.length} duplicates for title: "${title}"`);
      }
    } else {
      console.log('No duplicate press releases found based on title.');
    }
  } catch (error) {
    console.error('Error checking for or deleting duplicate press releases:', error);
  }
};

  module.exports = {
    checkAndDeleteDuplicatePressReleases
  };
  