module.exports = {
  apps: [
    {
      name: "kaoru's bot",
      script: './src/bot.js',
      watch: false,
      autorestart: true,
      instances: 1, // Gunakan semua core CPU
      exec_mode: "fork", // Cluster mode,
      max_memory_restart: '6G', // Restart jika penggunaan memori lebih dari 1GB
      env: {
        NODE_ENV: 'production',
      }
    },
  ],
};
