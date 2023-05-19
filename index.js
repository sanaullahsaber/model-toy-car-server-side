const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vtxhup0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const carsCollection = client.db("toyCar").collection("toycars");

    // react tab route is here
    app.get("/toycars/:text", async (req, res) => {
      if (req.params.text == "sports" || req.params.text == "hyper" || req.params.text == "luxury") {
        const result = await carsCollection.find({ status: req.params.text }).toArray();
        return res.send(result)
      }
      const result = await carsCollection.find({}).toArray();
      res.send(result)
      
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Model Toy Cars Server is running');
})

app.listen(port, () => {
  console.log(`Model Toy Cars Server is running on port ${port}`);
})