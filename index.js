const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wt8oomr.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db('toyDB').collection('toy')

    // Creating index on two fields
    const indexKeys = {
      toyName: 1,
      // subCategory: 1
    }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "toyName" }; // Replace index_name with the desired index name
    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    // console.log(result);




    // search done here
    app.get('/getToyByText/:text', async (req, res) => {
      const searchText = req.params.text;

      const result = await toyCollection.find({
        $or: [
          { toyName: { $regex: searchText, $options: "i" } },
          // {
          //   subCategory: { $regex: searchText, $options: "i" }
          // }
        ],
      })
        .toArray();
      res.send(result);
    })




    // read the data 
    app.get('/allToys', async (req, res) => {
      const result = await toyCollection.find({}).toArray();
      res.json(result);
    })

    // specific view details
    app.get('/viewDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {

        // Include only the `title` and `imdb` fields in each returned document
        projection: { customerName: 1, toyName: 1, picture: 1, price: 1, rating: 1, description: 1, quantity: 1, email: 1 },
      };


      const result = await toyCollection.findOne(query, options);
      // console.log(result);
      res.send(result)
    })

    // my toys data
    app.get('/myToys/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await toyCollection.find({ email: req.params.email }).toArray();
      res.json(result);

    })

    // updated toy

    // add the data
    app.post('/addToys', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result)
    })

    // delete mytoy

    app.delete('/deleteToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      console.log(result);
      res.send(result)
    })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('toy Management server is running')
});

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`)
})
