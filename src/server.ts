import app from "./index.js";
import connectDB from "./config/db.js";
import "./jobs/emailWorker.js";

const PORT = Number(process.env.PORT);

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();