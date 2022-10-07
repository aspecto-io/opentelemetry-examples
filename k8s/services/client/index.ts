// Simple client service to send 'GET /' request to the server every 5 seconds.

require('./tracing');
import fetch from 'node-fetch';

function startServerCommunication(url: string) {
  let retryCount = 0;
  setInterval(async function () {
    try {
      const response = await fetch(url);
      console.log(await response.text());
      retryCount = 0;
    } catch (error: any) {
      console.log('Server is down. trying again in 5 seconds');
      retryCount += 1;
      if (retryCount >= 3) {
        process.exit(-1);
      }
    }
  }, 1000 * 5);
}

const url = process.env.SERVER_ENDPOINT || 'http://localhost:3000';
console.log(`starting sending messages to ${url}`);
startServerCommunication(url);
