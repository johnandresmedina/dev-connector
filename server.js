const express = require("express");
const PORT = process.env.PORT || 5000;

const app = express();

app.get("/", (request, response) => response.send("API Running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
