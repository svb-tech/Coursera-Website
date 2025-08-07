const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config()
const userRouter = require("./routes/users");
const courseRouter = require("./routes/course"); // This will now import the router correctly
const adminRouter = require("./routes/admin");
const cors=require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/admin", adminRouter);

async function main(){
    await mongoose.connect(process.env.MONGO_URL);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
}
main()
