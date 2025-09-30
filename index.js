import app from './service.js';

const port = process.argv[2] || 3000;
app.listen(port, () => {
  console.log(`Service started on port ${port}`);
});
