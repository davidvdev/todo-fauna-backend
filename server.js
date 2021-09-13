require('dotenv').config()
const express = require('express')
const app = express()

const PORT = process.env.PORT || 5000
const { Documents, Collections, CreateCollection } = require('faunadb')
const faunadb = require ('faunadb')
const cors = require('cors')
const { json } = require('express')

const adminClient = new faunadb.Client({ secret: process.env.ADMINKEY })

const client = new faunadb.Client({ 
    secret: process.env.FAUNAKEY,
    domain: 'db.us.fauna.com',
    scheme: 'https' 
})

// import Fauna Query Functions
const {
    Paginate, 
    Get, 
    Ref, 
    Select, 
    Map,
    Match, 
    Index, 
    Create, 
    Collection, 
    Lambda, 
    Var, 
    Join,
    Update,
    Delete,
    Call,
    Function: Fn,
} = faunadb.query
// const q = faunadb.query;


// start server
app.use(cors())
app.use(express.json())
app.listen(PORT, () => console.log(`API on port: ${PORT}`))

// server routes

// INDEX
app.get('/todos', async(req,res) => {
    const data = await client.query(
        Map(
            Paginate(Match(Index('all_todos'))),
            Lambda(x => Get(x))
        )
    ).catch(err => res.json(err))
    res.json(data.data)
})

// SHOW
app.get('/todos/:id', async(req,res) => {
    const data = await client.query(
        Get(
            Ref(Collection('todos'),req.params.id)
        )
    ).catch(err => res.json(err))
    res.json(data.data)
})

app.get('/todos/due/today', async(req,res) => {
    const data = await client.query(
        Get(
            Match(Index('todos_by_due_date'), 'today')
        )
    ).catch(err => res.json(err))
    res.json(data.data)
})

// CREATE
app.post('/todos', async (req,res) => {

    const task = await req.body

    const data = await client.query(
        Create(
            Collection('todos'),
            { data: task } 
        )
    ).catch(err => res.json(err))
    res.json(data)
})

// UPDATE
app.put('/todos/:id', async (req, res) => {
    const updates = await req.body

    console.log('UPD: ', updates)

    const data = await client.query(
        Update(
            Ref(Collection('todos'),req.params.id),
            { data: updates.data }
        )
    ).catch(err => res.json(err))
    res.json(data)
})

// DELETE
app.delete('/todos/:id', async(req, res) => {
    const deleted = await client.query (
        Delete(Ref(Collection('todos'), req.params.id))
    ).catch(err => res.json(err))
    res.json(deleted)
})