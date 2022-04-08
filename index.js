const express = require('express')
const app = express()
const port = 5000


const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://yangtamin:1234@cluster0.dw0vu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority").then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('하이 방가방가')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})