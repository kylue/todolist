const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kylue:Test123@cluster0.xjv4h.mongodb.net/training_only", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to todo list"
});

const item2 = new Item({
  name: "Click the + button to add a new item"
});

const item3 = new Item({
  name: "<-- click to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully saved items into DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", listItems: foundItems});
    }
  });


});

app.get("/:customListName", function(req, res) {

  const customListName = req.params.customListName;

  const list = new List({
    name: customListName,
    items: defaultItems
  });

  List.findOne({name: customListName}, function(err, foundList) {

    if(!err) {
      if(!foundList) {

        list.save(function(err) {
          if(!err) {
            res.redirect("/" + customListName);
          }
        });
      } else {
        res.render("list", {listTitle: foundList.name, listItems: foundList.items});
      }
    }
  });

});


app.post("/", function(req, res) {

const itemName = req.body.newItem;
const listName = req.body.list;

const item = new Item({
  name: itemName
});

List.findOne({name: listName}, function(err, foundList) {
  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
});

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(!err) {
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server is running on port 3000");
});
