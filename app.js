const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shrikant:test123@cluster0.m9a0lon.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item ({
  name: 'Chores'
});
const item2 = new Item ({
  name: 'Take dog to the park'
});
const item3 = new Item ({
  name: 'Drop sister to hospital'
});

const initialItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model('List', listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(initialItems, function(err){
        if(err) console.log(err);
        else console.log('successfully inserted')
      });
      res.redirect('/');
    }
    else res.render("list", {listTitle: "Today", newListItems: foundItems});
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item ({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect('/');
  }else {
    List.find({name: listName}, function(err, foundList){
      if(err)console.log(err);
      else{
        console.log(foundList);
        foundList[0].items.push(item);
        foundList[0].save();
        res.redirect('/'+ listName);

      }
    });
  }

});

app.post('/delete', function(req, res){
  const listName = req.body.listName;
  const itemID = req.body.checkbox;
  if(listName === 'Today'){
    Item.findByIdAndRemove(itemID, function(err){
      if(err) console.log(err);
      else res.redirect('/');
    });
  }
  else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: itemID}}},
      function(err, result){
        if(err)console.log(err);
        else {res.redirect('/'+listName);}
      });
  }
});

app.get("/:createList", function(req,res){
  const listName = _.capitalize(req.params.createList);
  List.find({name: listName}, function(err, foundList){
    if(err){console.log(err)}
    else if(foundList.length === 0){
      const list = new List ({
        name: listName,
        items: initialItems
      });
      list.save();
      res.redirect('/'+ listName);
    }else {
      res.render('list', {listTitle: listName, newListItems: foundList[0].items})

    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// user: admin-shrikant
// pass: test123
