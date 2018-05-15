// Import the necessary basic modules
import { readFileSync } from 'fs';
import { sign }  from 'jsonwebtoken'
import { connect } from 'mqtt';
const LevelStore = require('mqtt-level-store');
import { DataSource } from './datagen';
import { Observable, merge, Observer} from 'rxjs';

// Set the Environment
import { 
    HostConfig as HOST,
    DeviceConfig as DEVICE,
    Topics as TOPICS,
    Subscriptions as SUBS,
} from './environment';

const mqttClientId = `projects/${HOST.GCS_PROJECTID}/locations/${HOST.GCS_REGION}/registries/${HOST.IOT_REGISTRY}/devices/${DEVICE.ID}`;
const storemanager = LevelStore(DEVICE.STORE_PATH);

const connectionArgs = {
  host: HOST.MQTT_HOST_NAME,
  port: HOST.MQTT_PORT,
  clientId: mqttClientId,
  username: DEVICE.ID,
  password: createJWT(HOST.GCS_PROJECTID, DEVICE.PRIVATE_KEY_PATH, DEVICE.ALGORITHM),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method',
  incomingStore: storemanager.incoming,
  outgoingStore: storemanager.outegoing
};

// Create a client, and connect to the Google MQTT bridge.
let iatTime = Date.now() / 1000;
let client = connect(connectionArgs);

// Subscribe to the /devices/{device-id}/config topic to receive config updates.
client.subscribe(SUBS.CONFIG);

// Wiat for response events and process
client.on('connect', (success: boolean) => {
    if (!success) {
        console.log('Client not connected...');
        //TODO: Persist the logging
        //TODO: Handle JWT refreshing
        //TODO: Handle Cert refreshing
        //TODO: Handle Backoff as necessary
    } else {
        console.log('Client connected...');
        publish(DataSource());
        //TODO: Persist the logging
    }
});

client.on('close', () => {
    console.log('close');
    //TODO: Persist Logging
});
  
client.on('error', (err) => {
    console.log('error', err);
    //TODO: Persist Logging
});
  
client.on('message', (topic: string, message: string, packet) => {
  if (topic === `/devices/${DEVICE.ID}/event`) {
    console.log('Event message received: ', Buffer.from(message, 'base64').toString('ascii'))
    //TODO: Persist Logging
  } else
  if (topic === `/devices/${DEVICE.ID}/state`) {
    console.log('State message received: ', Buffer.from(message, 'base64').toString('ascii'))
    //TODO: Persist Logging
  } else
  if (topic === `/devices/${DEVICE.ID}/config`) {
    console.log('Configuration message received: ', Buffer.from(message, 'base64').toString('ascii'))
    //TODO: Persist Logging
    //TODO: actually do something with a configuration update
  }
});

client.on('packetsend', (packet) => {
    
});


function publish(message$: Observable<any>) {
    console.log("Subscribing to local Messages...");
    message$.subscribe(mes => {
        client.publish(mes.topic, JSON.stringify(mes.payload), { qos: 1 });
        console.log('Publishing message:', mes.payload);
    })
}


// Create a Cloud IoT JWT based on the project, signed with the private key
function createJWT (projectId: String, privateKeyPath: String, algorithm: String) {
    const token = {
        'iat': (Date.now() / 1000),
        'exp': (Date.now() / 1000) + DEVICE.TOKEN_LIFE * 3600,  // **Hours**
        'aud': projectId
    };
    const privateKey = readFileSync(DEVICE.PRIVATE_KEY_PATH);
    return sign(token, privateKey, {algorithm: DEVICE.ALGORITHM});
}



