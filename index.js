const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT||5000
// mONGOdb
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

//Middle wares
app.use(cors())
app.use(express.json())

// API start here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.Db_PASS}@cluster0.9bit2.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {
        await client.connect();
        const taskCollection = client.db('task_manager').collection('tasks');
        const completedTaskCollection = client.db('task_manager').collection('completedTasks');

        // start creating api
        // get all tasks
        app.get('/tasks', async (req, res) => {
            const query = {};
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
        })
        // get all completed tasks
        app.get('/completedTasks', async (req, res) => {
            const query = {};
            const cursor = completedTaskCollection.find(query);
            const completedTasks = await cursor.toArray();
            res.send(completedTasks);
        })
        // insert task
        app.post('/task', async (req, res) => {
            console.log('call');
            const newTask = req.body;
            console.log(newTask);
            const result = await taskCollection.insertOne(newTask);
            res.send({ result: "success" });
        })
        // delete task
        app.delete('/task/:id', async (req, res) => {
            const deletedTask = req.params.id;
            console.log('into server',deletedTask);
            const query = { _id: ObjectId(deletedTask) };
            const cursor = await taskCollection.findOne(query)
            console.log('deleted task',cursor);
            const setToCompletedTask = await completedTaskCollection.insertOne(cursor);
            const result = await taskCollection.deleteOne(query);
            // console.log(result);
            res.send(result);
        })
        // delete completedTask
        app.delete('/completedTask/:id', async (req, res) => {
            const deletedTask = req.params.id;
            console.log('into server',deletedTask);
            const query = { _id: ObjectId(deletedTask) };
            const result = await completedTaskCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })

        //update task
        app.put('/task/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTask = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: updatedTask.name,
                    details: updatedTask.details,
                    date: updatedTask.date
                }
            }
            const result = await taskCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
    }
    finally{}
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello from task manager!')
})

app.listen(port, () => {
    console.log(`task manager Example app listening on port ${port}`)
})