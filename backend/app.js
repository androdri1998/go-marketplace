const express = require('express');
const cors = require('cors');

const productsData = require('./products.json');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/products', (req, res) => {
  res.status(200).send(productsData.products);
});

app.listen(3333, () => {
  console.log('back-end runned');
});