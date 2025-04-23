
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://danieljarka:oK3EReErMmEPOFDr@cluster0.z0yhlww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();
const port = process.env.PORT || 3000;


const client = new MongoClient(url);

async function connectToMongo() {
    await client.connect();
    const db = client.db('Stock');
    return db.collection('PublicCompanies');
}

// Route to display the home page (View 1)
app.get('/', (req, res) => {
    const htmlForm = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Stock Search</title>
        </head>
        <body>
            <h1>Search for a Stock</h1>
            <form action="/process" method="GET">
                <label for="query">Enter Company Name or Ticker:</label>
                <input type="text" id="query" name="query" required><br><br>
                <input type="radio" id="byName" name="searchBy" value="name" checked>
                <label for="byName">By Company Name</label><br>
                <input type="radio" id="byTicker" name="searchBy" value="ticker">
                <label for="byTicker">By Stock Ticker</label><br><br>
                <input type="submit" value="Search">
            </form>
        </body>
        </html>
    `;
    res.send(htmlForm);
});

// Route to handle the search request and display results (View 2)
app.get('/process', async (req, res) => {
    const { query, searchBy } = req.query;
    const collection = await connectToMongo();
    let results = [];

    console.log(`Searching by: ${searchBy}, Query: ${query}`);

    if (searchBy === 'name') {
        results = await collection.find({ company: query }).toArray();
    } else if (searchBy === 'ticker') {
        results = await collection.find({ ticker: query }).toArray();
    }

    // Display results in the console
    if (results.length > 0) {
        console.log('\nSearch Results (Console):');
        results.forEach(doc => {
            console.log(`Company: ${doc.company}, Ticker: ${doc.ticker}, Price: ${doc.price}`);
        });
    } else {
        console.log('\nNo matching companies found.');
    }

    // Generate HTML for the results page
    let resultsHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Search Results</title>
        </head>
        <body>
            <h1>Search Results</h1>
    `;

    if (results && results.length > 0) {
        resultsHTML += `
            <ul>
        `;
        results.forEach(result => {
            resultsHTML += `
                <li>
                    <strong>Company:</strong> ${result.company},
                    <strong>Ticker:</strong> ${result.ticker},
                    <strong>Price:</strong> ${result.price}
                </li>
            `;
        });
        resultsHTML += `
            </ul>
        `;
    } else {
        resultsHTML += `
            <p>No companies found matching your search criteria.</p>
        `;
    }

    resultsHTML += `
            <a href="/">Back to Search</a>
        </body>
        </html>
    `;

    res.send(resultsHTML);
});

app.listen(port, () => {
    console.log(`Web app #2 is running on http://localhost:${port}`);
});