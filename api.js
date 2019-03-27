const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (_, res) => {
    return res.send('ok');
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
});
