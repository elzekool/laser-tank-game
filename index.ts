import * as express from 'express';
import { Server as WebSocketServer } from 'ws';
import * as http from 'http';
import * as path from 'path';
import { Renderer } from './renderer';

const PORT = 8321;

const renderer = new Renderer();

(async () => {
    await renderer.start();
})();

const server = http.createServer();
const app = express();
app.use(express.static(path.join(__dirname, '/public')));
const wss = new WebSocketServer({ server });

server.on('request', app);
server.listen(PORT, function() {
    console.log(`Started interface on http://localhost:${PORT}`);
});

wss.on('connection', function connection(ws, req) {
    renderer.registerStateUpdateFunc((message => {
        ws.send(message);
    }));

    ws.on('message', function incoming(message) {
        const command = message as string
        if (command === "CLICK") {
            renderer.registerClick();
        }
    });
});

wss.on('close', function() {
    renderer.unregisterStateUpdateFunc();
});