import WebsocketClient from './websocket.js';

const host = window.document.location.host.replace(/:.*/, '');
const ws = new WebsocketClient();
const button = document.getElementById("btn");

function buttonClick() {
    ws.send("CLICK");
}

ws.onopen = function() {
    console.log('Websocket connection opened.');
    button.addEventListener('click', buttonClick);
};

ws.onmessage = function(e) {
    button.innerText = e.data;
};

ws.onclose = function() {
    console.log('Websocket connection closed.');
    button.removeEventListener('click', buttonClick);
};

button.focus();

ws.open(`ws://${host}:8321`);