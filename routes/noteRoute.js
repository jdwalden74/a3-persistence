import express from "express";
import { ObjectId } from "mongodb";

const noteRouter = express.Router();

noteRouter.post("/", async (req, res) => {
    const db = req.db;
    const username = req.sessionUser;

    if (!username) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    try {
        const notesCollection = db.collection("notes");
        const notes = await notesCollection.find({"username": req.sessionUser}).toArray();
        res.status(200).json({
            username: req.sessionUser,
            notes: notes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

noteRouter.post("/add-note", async (req, res) => {
    const db = req.db;
    const body = req.body;

    const username = req.sessionUser;

    console.log("User: ", username)

    if (!body || !username) {
        return res.status(400).json({ error: "Note data or user not found" });
    }

    const newNote = {
        title: body.title,
        content: body.content,
        color: body.color,
        date: body.date,
        username: username
    };

    try {
        await db.collection('notes').insertOne(newNote);
        const notesCollection = db.collection("notes");
        const noteArray = await notesCollection.find({"username": req.sessionUser}).toArray();
        res.status(201).json({ message: "Note saved successfully!", notes: noteArray });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


noteRouter.delete("/:id", async (req, res) => {
   console.log("DELETE");

    try{const db = req.db
       const notesCollection = db.collection("notes");
       const noteId = req.params.id;

       console.log("id: ", noteId);

       const result = await notesCollection.deleteOne({ _id: new ObjectId(noteId) });


       if (result.acknowledged !== true) {
           return res.status(404).json({ message: "Note not found" });
       }

        const noteArray = await notesCollection.find({"username": req.sessionUser}).toArray();


        res.status(201).json({ message: "Note Deleted successfully!", notes: noteArray });
   }catch(error){
       res.status(500).json({error: error});
   }

})

noteRouter.post("/edit", async (req, res) => {
    console.log("Hit edit note");
    try{
        const db = req.db
        const notesCollection = db.collection("notes");
        const body = req.body;

        console.log("BOdy: ", body)

        if(!body){
            res.status(500).json({error:"Note is undefined"});
        }

        console.log("attempting to edit note");


        const result = await notesCollection.updateOne(
            { _id: new ObjectId(body.id) },
            {
                $set: {
                    title: body.title,
                    content: body.content,
                    username: req.sessionUser,
                    date: body.date,
                    color: body.color
                }
            });
            console.log(result);


        console.log("result: ", result);

        if (result.acknowledged !== true) {
            return res.status(404).json({ message: "Note not found" });
        }

        const noteArray = await notesCollection.find({"username": req.sessionUser}).toArray();

        console.log("array: ", noteArray);

        res.status(201).json({ message: "Note Deleted successfully!", notes: noteArray });


    } catch (error){
        res.status(500).json({error: error});
    }
})

export default noteRouter