// Import the necessary basic modules
import { readFileSync } from 'fs';
import { sign }  from 'jsonwebtoken'
import { connect } from 'mqtt';
const LevelStore = require('mqtt-level-store');
import { DataSource } from './datagen';
import { Observable } from 'rxjs';

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
let iatTime = Date.now();
let client = connect(connectionArgs);

// Set up the traffic control
let backOffTime = 0;
let shouldBackOff = false;
let publishDelay = 0;

// Subscribe to the /devices/{device-id}/config topic to receive config updates.
client.subscribe(SUBS.CONFIG);

// Wait for response events and process
client.on('connect', (success: boolean) => {
    if (!success) {
        console.log('Client not connected...');
        //TODO: Persist the logging
        //TODO: Handle Cert refreshing
    } else {
        console.log('Client connected...');
        publish(DataSource());
        //TODO: Persist the logging
    }
});

client.on('close', () => {
    console.log('close');
    shouldBackOff = true;
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


function publish(message$: Observable<any>)  {
    console.log("Subscribing to the Device Messages...");
    message$.subscribe(mes => {
        let tokenAlive = (Date.now() - iatTime)/1000/3600;
        if (tokenAlive > DEVICE.TOKEN_LIFE) {
            console.log('Refreshing JWT..')
            client.end()
            iatTime = Date.now()
            client = connect(connectionArgs);
        }
        setTimeout(() => {   
            client.publish(mes.topic, JSON.stringify(mes.payload), { qos: 1 }, (err) => {
                if(!err) {
                    shouldBackOff = false;
                    backOffTime = 0;
                    console.log('Publishing message:', mes.payload);
                } else {
                    shouldBackOff = true;
                    backOffTime *= 2;
                    publishDelay = 1000 * (backOffTime + Math.random());
                    console.log(`Traffic delay of ${publishDelay/1000} seconds applied`)
                }
            });
        }, publishDelay, mes)
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



