const express = require('express');
const path = require('path');
const fs = require('fs');
const cms = require('cms-json');

module.exports = function hello() {
	const app = express();

	app.use('/', express.static(path.join(__dirname, 'public')));
	app.get('/urls', (req, res) => res.send(JSON.stringify(getURLS())));
	app.listen(3000, () => console.log('Example app listening on port 3000!'));
};

function getURLS() {
	const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/data.json')));
	return data;
}

cms.run({ modelFile: 'data/schema.json', dataFile: 'data/data.json', port: 4000, env: 'production'});