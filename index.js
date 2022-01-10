const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.static("build"));
app.use(express.json());

morgan.token("post", (req, res) => {
  console.log(req);
  const data = JSON.stringify(req.body);
  console.log(data);
  return data;
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :post")
);

let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  min = Math.ceil(phonebook.length + 1);
  max = Math.floor(1000);
  return Math.floor(Math.random() * (max - min) + min);
};

app.get("/info", (req, res) => {
  const phonebookLength = phonebook.length;
  const currentTime = new Date();
  console.log(phonebookLength, currentTime);
  res.write(`<p>Phonebook has info for ${phonebookLength} people</p>`);
  res.write(`<p>${currentTime}</p>`);
  res.end();
});

app.get("/api/persons", (req, res) => {
  res.json(phonebook);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = phonebook.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  phonebook = phonebook.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const newId = generateId();
  const body = req.body;

  if (!body) {
    return res.status(404).json({
      error: "content missing",
    });
  } else if (!body.number || !body.name) {
    return res.status(404).json({
      error: "name or number is missing from content",
    });
  } else {
    namesInPhonebook = phonebook.filter((person) => person.name === body.name);
    console.log(namesInPhonebook);
    if (namesInPhonebook.length > 0) {
      return res.status(404).json({
        error: "Name already exists in phonebook",
      });
    }
  }

  const newPerson = {
    id: newId,
    name: body.name,
    number: body.number,
  };

  phonebook = phonebook.concat(newPerson);

  res.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
