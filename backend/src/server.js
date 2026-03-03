require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  process.stdout.write(`Flowlane backend running on port ${PORT}\n`);
});