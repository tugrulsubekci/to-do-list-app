const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const { json } = require('body-parser');
const app = express();
const _ = require("lodash");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://tugrulsubekci:VpyaoxwZVwv9xRt9@blacklash.l3efeyb.mongodb.net/todoListDB?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const ItemList = mongoose.model("ItemList", listSchema);

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    let collectionName = date.getDay();
    let itemList = await ItemList.findOne({name: collectionName});

    if(!itemList) {
        itemList = new ItemList({
            name: collectionName,
            items: []
        });

        await itemList.save();
    }
    
    res.render('list', {
        listTitle: collectionName,
        newListItems: itemList.items
    });
});

app.get('/:dbEndPoint', async (req, res) => {
    let collectionName = _.capitalize(req.params.dbEndPoint);
    let itemList = await ItemList.findOne({name: collectionName});

    if(!itemList) {
        itemList = new ItemList({
            name: collectionName,
            items: []
        });

        await itemList.save();
    }

    res.render('list', {
        listTitle: collectionName,
        newListItems: itemList.items
    });
});

app.post("/:dbEndPoint", async function(req, res) {
    const listName = req.params.dbEndPoint;
    const inputText = req.body.listItem;

    const newItem = new Item({
        name: inputText,
    })

    let itemList = await ItemList.findOne({name: listName});

    if(itemList) {
        itemList.items.push(newItem);
        await itemList.save();
    }

    res.redirect("/"+ listName);
});

app.post("/delete/:id", async function(req, res) {
    const id = req.params.id;
    const listTitle = req.body.checkbox;
    console.log(id);
    console.log(listTitle);

    await ItemList.findOneAndUpdate({name: listTitle}, {$pull : {items: {_id: id}}}, )

    res.redirect("/" + listTitle);
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000');
});