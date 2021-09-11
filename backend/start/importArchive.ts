import Archive from "App/Services/Archive";
import Helpers from "App/Helpers/helpers";

async function fullImport() {
  console.log("\n##### FULL IMPORT START #####\n");

  const dateArray = Helpers.getMonthsArray();
  const archiveArray = dateArray.map((date) => new Archive(date));

  console.log("Fetching all IDs...");
  const promises: Promise<number[]>[] = [];
  archiveArray.forEach((archive) => promises.push(archive.getMissingMessagesIds()));
  const missingMessagesIdsArray = await Promise.all(promises);
  console.log("Done fetching all IDs...\n");

  for (const index in archiveArray) {
    const archive = archiveArray[index];
    const missingMessagesIds = missingMessagesIdsArray[index];

    if (missingMessagesIds.length > 0) {
      console.log();
      archive.log(`${missingMessagesIds.length} to sync.`);
      archive.log(missingMessagesIds);
      await archive.fetch();
      await archive.importMessages();
    } else {
      archive.log(`Month already synced, skipping...`);
    }
  }

  console.log("\n##### FULL IMPORT END #####\n");
}

setTimeout(fullImport, 1500);

/*
setTimeout(async () => {
  const result = await new Archive('2021-September').fetch()
  console.log(result.content)
}, 1500)
*/
