const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/units');
dotenv.config({ path: './config.env' });
console.log(1)
mongoose.connect('mongodb+srv://rafatkamel96:rafat123@cluster0.c7kyxpz.mongodb.net').then(() => console.log('DB connection successfully'))

// READ JSON FILE
const products = JSON.parse(fs.readFileSync(`${__dirname}/data/units.json`, 'utf-8'));
// IMPORT DATA INTO DB
const importData = async () => {
try {
    await Product.create(products);
    console.log('Data successfully Upload!');
} catch (err) {
    console.log(err)
}
process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
try {
    await Product.deleteMany();
    console.log('Data successfully deleted!');
} catch (err) {
}
process.exit();
};

if (process.argv[2] === '--import') {
importData();
} else if (process.argv[2] === '--delete') {
deleteData();
}
importData();