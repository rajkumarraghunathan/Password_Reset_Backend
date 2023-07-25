const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const db = require('./Connect/mongoose')
const routes = require('./Routes/route')
const app = express();
dotenv.config();


app.use(express.json());
app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true,
    }
))
app.use(cookieParser())

//db connection
db()



app.get('/', (req, res) => {
    res.send('Hello World')
})
const portal = 8000 || 4000

app.use(routes)

app.listen(portal, () => {
    console.log(`App is running on a Portal ${portal}`)
})