const checkAndDeleteDuplicateTitles = async () => {
    try {
      // Fetch all press releases
      const pressReleases = await Press.find({}, 'press.meta.title');
  
      // Count occurrences of each title and track the document IDs
      const titleCount = {};
      const titleDocuments = {}; // To store documents by title for deletion
  
      pressReleases.forEach((press) => {
        const title = press.press.meta.title;
        if (titleCount[title]) {
          titleCount[title] += 1;
          titleDocuments[title].push(press._id); // Track duplicate document IDs
        } else {
          titleCount[title] = 1;
          titleDocuments[title] = [press._id]; // Track the first document ID
        }
      });
  
      // Check for duplicates
      const duplicates = Object.keys(titleCount).filter((title) => titleCount[title] > 1);
  
      if (duplicates.length > 0) {
        console.log('Duplicate Titles Found:');
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
        console.log('No duplicate titles found.');
      }
    } catch (error) {
      console.error('Error checking for or deleting duplicate titles:', error);
    }
  };

  module.exports = {
    checkAndDeleteDuplicateTitles
  };
  