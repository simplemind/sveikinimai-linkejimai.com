const MongoClient = require("mongodb").MongoClient;
// const { MongoClient } = require("mongodb");
const url = "mongodb://localhost:27017";
const dbName = "dbSveikinimai";
// const url = "mongodb+srv://adminuser:<password>@clustersveikinimai.uu5tqud.mongodb.net/?retryWrites=true&w=majority";

// A function that adds field pageSubheading to the categories collection
// and populates it with the value of the field metaDescription
async function addSubheading() {
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  const db = client.db(dbName);
  const collection = db.collection("categories");

  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const pageSubheading = doc.metaDescription;
    await collection.updateOne({ _id: doc._id }, { $set: { pageSubheading: pageSubheading } });
  }

  client.close();
}

// addSubheading().catch(console.error);

// A function that deletes field onpageKeywords from the categories collection
async function deleteOnpageKeywords() {
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  const db = client.db(dbName);
  const collection = db.collection("categories");

  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    await collection.updateOne({ _id: doc._id }, { $unset: { onpageKeywords: "" } });
  }

  client.close();
}

// deleteOnpageKeywords().catch(console.error);

// A function that removes field metaDescription from the categories collection and then adds it back
async function removeMetaKeywords() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("categories");

    const cursor = collection.find({});

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const metaKeywordsValue = doc.metaKeywords; // Store the value of metaKeywords

      await collection.updateOne({ _id: doc._id }, { $unset: { metaKeywords: "" } });
      await collection.updateOne({ _id: doc._id }, { $set: { metaKeywords: metaKeywordsValue } }); // Recreate the field and populate it with the stored value
    }
  } finally {
    client.close();
  }
}

// removeMetaKeywords().catch(console.error);

// A function that capitalizes the first letter of the field pageSubheading in the categories collection
async function capitalizePageSubheading() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("categories");

    const cursor = collection.find({});

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const pageSubheading = doc.pageSubheading;
      const pageSubheadingCapitalized = pageSubheading.charAt(0).toUpperCase() + pageSubheading.slice(1);
      await collection.updateOne({ _id: doc._id }, { $set: { pageSubheading: pageSubheadingCapitalized } });
    }
  } finally {
    client.close();
  }
}

// capitalizePageSubheading().catch(console.error);
