export async function insert(targetDB: string, targetCollection: string, doc: Object, client: any) {

    try {
  
      await client.connect();
  
      const database = client.db(targetDB);
  
      const collection = database.collection(targetCollection);
  
      // create a document to insert
  
      const result = await collection.insertOne(doc);
  
    } finally {
  
      await client.close();
  
    }
  
}

export async function find(targetDB: string, targetCollection: string, query: Object, client: any) {
    try {
      await client.connect();
      const database = client.db(targetDB);
      const collection = database.collection(targetCollection);
      const result = await collection.findOne(query);
      // since this method returns the matched document, not a cursor, print it directly
      return result;
    } finally {
      await client.close();
    }
}