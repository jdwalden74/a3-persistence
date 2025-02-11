let formOpen = false;
let sessionUser = {username: null}

const displayNewNote = function() {

    if(formOpen){
        return;
    }

    formOpen = true;
    const clipboard = document.getElementById('clipboard');

    console.log("Display new note");

    const form = document.createElement("form");
    form.classList.add("note-form");
    form.onsubmit = function(event) {
        event.preventDefault();
        addNote();
        formOpen = false
    };


    const titleLabel = document.createElement("label");
    titleLabel.innerText = "Title:";
    const title = document.createElement("input");
    title.classList.add("newNoteTitle");
    title.type = "text";
    title.placeholder = "Enter Title";


    const contentLabel = document.createElement("label");
    contentLabel.innerText = "Content:";
    const content = document.createElement("textarea");
    content.classList.add("newNoteContent");
    content.placeholder = "Enter Content";

    const colorLabel = document.createElement("label");
    colorLabel.innerText = "Choose a color:";

    const colors = ["light-blue", "light-green", "light-red", "light-yellow", "light-purple"];
    const colorContainer = document.createElement("div");
    colorContainer.classList.add("color-options");

    colors.forEach(color => {
        const colorOption = document.createElement("input");
        colorOption.type = "radio";
        colorOption.name = "noteColor";
        colorOption.value = color;
        colorOption.id = color;

        const colorLabel = document.createElement("label");
        colorLabel.htmlFor = color;
        colorLabel.innerText = color.replace("light-", "").toUpperCase();
        colorLabel.classList.add(color);

        colorContainer.appendChild(colorOption);
        colorContainer.appendChild(colorLabel);

        colorOption.addEventListener("change", () => {

            const parentDiv = document.querySelector(".note-form");
            parentDiv.classList.forEach(className => {
                if (className !== 'note-form') {
                    parentDiv.classList.remove(className);
                }
            });

            parentDiv.classList.add(colorOption.value);
        });
    });


    const submit = document.createElement("button");
    submit.innerText = "Add Note";
    submit.type = "submit";


    form.appendChild(titleLabel);
    form.appendChild(title);
    form.appendChild(contentLabel);
    form.appendChild(content);
    form.appendChild(colorLabel);
    form.appendChild(colorContainer);
    form.appendChild(submit);

    clipboard.appendChild(form);
};


const addNote = async function(){

    const title = document.querySelector('.newNoteTitle').value;
    const content = document.querySelector('.newNoteContent').value;
    const date = new Date().toISOString().split('T')[0];
    const selectedColor = document.querySelector('input[name="noteColor"]:checked');
    let colorValue;

    if(selectedColor === null){
        colorValue = "grey";
    } else{
        colorValue = selectedColor.value;
    }

    const json = {
        user: sessionUser.username,
        title: title,
        content: content,
        color: colorValue,
        date: date
    }

    const body = JSON.stringify( json )

    console.log("Body: ", body);

    console.log("Try to add note");

    const response = await fetch( "/notes/add-note", {
        method:'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: body
    })

    const data = await response.json();
    refreshClipboard(data.notes)

}

const getNotes = async function(){

    console.log("Trying get notes")

    const json = {
        user: sessionUser.username,
    }

    const body = JSON.stringify( json );

    const response = await fetch( "/notes", {
        method:'POST',
        headers: {"Content-Type": "application/json",},
        body: body
    })

    const data = await response.json();
    console.log("data: ", data)
    document.getElementById("sidebar").textContent = data.username
    refreshClipboard(data.notes)
    console.log("finish get notes")
}

const refreshClipboard = function(data) {
    const clipboard = document.getElementById('clipboard');
    clipboard.innerHTML=""

    data.forEach((note) => {
        const div = document.createElement("div");
        div.classList.add("clipboard-item");
        div.classList.add(note.color);

        const header = document.createElement("div");
        header.classList.add("note-header");

        const id = document.createElement("input");
        id.type="hidden"
        id.classList.add("note-id");
        id.value = note._id;

        const title = document.createElement("h1");
        title.innerText = note.title;

        const content = document.createElement("p");
        content.innerText = note.content;

        const date = document.createElement("p");
        date.classList.add("note-date");
        date.innerText = note.date;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "X";


        deleteBtn.addEventListener("click", function() {
            remove(id.value);
        });


        header.appendChild(title);
        header.appendChild(deleteBtn);
        div.appendChild(id);
        div.appendChild(header);
        div.appendChild(content);
        div.appendChild(date);

        const colorClass = Array.from(div.classList)
            .find(className => className !== 'clipboard-item');

        div.addEventListener("click", ()=>{
            edit(id.value, note.title, note.content, colorClass);
        })

        clipboard.append(div);
    })

    formOpen = false;
    document.querySelector(".note-count").innerText = "Number of notes: " + data.length
    console.log("finish refresh")
}

const remove = async function(id){

    const response = await fetch( `/notes/${id}`, {
        method:'DELETE',
        headers: {
            "Content-Type": "application/json",
        }
    })

    if (response.ok) {
        console.log(`Note with ID ${id} deleted successfully`);
        const data = await response.json();
        refreshClipboard(data.notes)
    } else {
        console.error(`Failed to delete note with ID ${id}`);
    }
}

const edit = async function(id, title, content, colorValue){

    if(formOpen){
        return;
    } else {
        displayNewNote()
    }



    const note = document.querySelector(`.clipboard-item input[value="${id}"]`).closest(".clipboard-item");
    note.classList.toggle("hidden");


    //fill values
    document.querySelector(".newNoteTitle").value = title;
    document.querySelector(".newNoteContent").value = content;

    const colorOptions = document.querySelectorAll('input[name="noteColor"]');
    colorOptions.forEach(option => {
        if (option.value === colorValue) {
            option.checked = true;
        }
    });

    const form = document.querySelector(".note-form");
    form.classList.add(colorValue);


    form.onsubmit = async function(event) {
        event.preventDefault();


        const updatedTitle = document.querySelector(".newNoteTitle").value;
        const updatedContent = document.querySelector(".newNoteContent").value;

        const selectedColor = document.querySelector('input[name="noteColor"]:checked');
        const updatedColor = selectedColor ? selectedColor.value : "grey";



        const date = new Date().toISOString().split('T')[0];
        const json = {
            id: id,
            title: updatedTitle,
            content: updatedContent,
            color: updatedColor,
            date: date
        };

        const body = JSON.stringify(json);


        const response = await fetch('/notes/edit', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: body
        });


        const data = await response.json();

        refreshClipboard(data.notes);

        note.classList.remove("hidden");
    };
}

const userLogIn = async function(event){
    if (event) event.preventDefault()

    const user = document.getElementById("username").value.trim()
    const password = document.getElementById("password").value.trim()

    if (!user || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const json = {
        user: user,
        password: password
    };

    const body = JSON.stringify(json);

    console.log("Json: ", json);

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: body
    });

    const data = await response.json();
    console.log("Response:", data);

    sessionUser.username = data.username;

    if (response.ok) {
        window.location.href = "/clipboard.html";
    } else {
        alert(data.message || "Login failed!");
    }
}


window.onload = async function () {
    console.log("Page loaded");

    if (window.location.pathname === "/clipboard.html") {
        try {
            const response = await fetch('/session');
            const data = await response.json();

            if (data.loggedIn) {
                sessionUser.username = data.username;
                console.log("User is logged in:", sessionUser.username);

                const button = document.querySelector('#add-note');
                if (button) button.onclick = displayNewNote;

                getNotes();
            } else {
                console.log("No session found, redirecting to login...");
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Error checking session:", error);
            window.location.href = "/";
        }
    } else {
        const login = document.querySelector('.login');
        if (login) login.onclick = userLogIn;
    }
};
