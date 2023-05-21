const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vtxhup0.mongodb.net/?retryWrites=true&w=majority`;

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
    const bookingCollection = client.db("toyCar").collection("bookings");

    // search bar section
    const indexKeys = { name: 1 };
    const indexOptions = { name: "name" };
    const result = await bookingCollection.createIndex(indexKeys, indexOptions);

    app.get("/toycars", async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // react tab route is here
    app.get("/toycars/:text/:id?", async (req, res) => {
      const { text, id } = req.params;

      if (text === "sports" || text === "hyper" || text === "luxury") {
        const query = { status: text };
        const result = await carsCollection.find(query).toArray();
        return res.send(result);
      }

      if (id) {
        const query = { _id: new ObjectId(id) };
        const options = {
          projection: {
            toyName: 1,
            sellerName: 1,
            sellerEmail: 1,
            subcategory: 1,
            price: 1,
            rating: 1,
            availableQuantity: 1,
            pictureURL: 1,
            detailDescription: 1,
          },
        };
        const result = await carsCollection.findOne(query, options);
        return res.send(result);
      }

      const result = await carsCollection.find({}).toArray();
      res.send(result);
    });

    // all toys bookings
    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }

      // star update here if we get back then just click crtl+z and  go back

      const sortOptions = {};
      if (req.query?.sort === "asc") {
        sortOptions.price = 1; // Sort in ascending order based on price
      } else if (req.query?.sort === "desc") {
        sortOptions.price = -1; // Sort in descending order based on price
      }

      const result = await bookingCollection
        .find(query)
        .sort(sortOptions)
        .toArray();
      res.send(result);
    });

    // search api all toys
    app.get("/bookings/:text", async (req, res) => {
      const bookingSearch = req.params.text;
      const result = await bookingCollection
        .find({ name: { $regex: bookingSearch, $options: "i" } })
        .toArray();
      res.send(result);
    });

    // all toys inside view detail's route
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: {
          name: 1,
          sellerName: 1,
          sellerEmail: 1,
          subCategory: 1,
          price: 1,
          rating: 1,
          quantity: 1,
          photo: 1,
          description: 1,
        },
      };
      const result = await bookingCollection.findOne(query, options);
      res.send(result);
    });

    // Add to Toy bookings
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      booking.createdAt = new Date(); // Set the createdAt field to the current date and time
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // my toy page update row sl
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedMyToy = req.body;
      const updateDoc = {
        $set: { ...updatedMyToy },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // my toy page delete row
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

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

app.get("/", (req, res) => {
  res.send("Model Toy Cars Server is running");
});

app.listen(port, () => {
  console.log(`Model Toy Cars Server is running on port ${port}`);
});
