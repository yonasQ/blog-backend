require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const blogRoute = require('./router/blogs')
const authRoute = require('./router/auth')
const userRoute = require('./router/user')
const catagoryRoute = require('./router/catagory')
const tagRoute = require('./router/tag')
const formRoute = require('./router/form')
const app = express();
mongoose.connect(process.env.mongoConnection, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('connected');
    }
    )
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
if (process.env.NODE_ENV === "development") {
    app.use(cors({ origin: process.env.CLIENT_URL }))
}

app.use('/api', blogRoute)
app.use('/api', authRoute)
app.use('/api', userRoute)
app.use('/api', catagoryRoute)
app.use('/api', tagRoute)
app.use('/api', formRoute)

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})