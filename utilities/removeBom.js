// Byte Order Mark (BOM) in category.categoryTag string.
// The BOM is a Unicode character used to signal the endianness (byte order) of a text file or stream.
// Its presence at the start of the string is causing it to be URL-encoded as %EF%BB%BF.
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
// const url = "mongodb+srv://adminuser:Adminpass01@clustersveikinimai.uu5tqud.mongodb.net/?retryWrites=true&w=majority";

async function removeBOM() {
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });
  const db = client.db("dbSveikinimai");
  const collection = db.collection("categories");

  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const categoryTag = doc.categoryTag.replace(/^\uFEFF/, "");
    await collection.updateOne({ _id: doc._id }, { $set: { categoryTag: categoryTag } });
  }

  client.close();
}

removeBOM().catch(console.error);
