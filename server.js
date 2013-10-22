require('harp')
  .server(__dirname, { port: process.env.PORT || 5000 });

console.info('Your HARP server has been started on Port 5000');
