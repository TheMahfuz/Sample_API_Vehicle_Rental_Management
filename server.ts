import app from './app/app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`\x1b[32m🚀 Server is running on port \x1b[34m${PORT}\x1b[32m in \x1b[33m${process.env.NODE_ENV}\x1b[32m mode 🌟\x1b[0m`);
    console.log(`\x1b[32m🕒 \x1b[34m${new Date().toString()}\x1b[0m`);
});

process.stdin.resume(); // Keep the process running
