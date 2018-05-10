// Import the necessary basic modules
import { readFileSync } from 'fs';
import { sign }  from 'jsonwebtoken'
import { setInterval } from 'timers';
import { connect } from 'mqtt';
import { Observable, merge, Observer} from 'rxjs';

// Set the Environment
import { 
    HostConfig as HOST,
    Subscriptions as SUBS,
    DeviceConfig as DEVICE } from './environment';


// Get the data types to transmit
import { 
    Data,
    State,
    Log } from './dataset';

const configSub = SUBS.CONFIG;

let eventMessage$: Observable<Data>;
let stateMessage$: Observable<State>;
let logMessage$: Observable<Log>;
let message$: Observable<any>;


function messageGen () {
    console.log("Message Gen Started...")

    eventMessage$ = Observable.create ((obs: Observer<Data>) => {
        setInterval(() => {
            let currentData: Data = {
                sampleTime: Date.now(),
                datapoint1: Math.random() *100,
                datapoint2: Math.random() *200,
                datapoint3: Math.random() *300
            }
            obs.next(currentData);
        },5000)
    })

    stateMessage$ = Observable.create ((obs: Observer<State>) => {
        setInterval(() => {
            let currentData: State = {
                setpoint1: 150* Math.random() ,
                setpoint2: 450* Math.random()
            }
            obs.next(currentData);
        },1000*30)
    })

    logMessage$ = Observable.create ((obs: Observer<Log>) => {
        setInterval(() => {
            let currentData: Log = {
                timestamp: Date.now(),
                message: `Something worth logging happened ${Date.now()}`
            }
            obs.next(currentData);
        },10000)
    })

    message$ = merge(eventMessage$, stateMessage$, logMessage$);
}

let messageType: String = 'events';

// [Start Initialization]
let isPublishing = false;

// [START Client Configuration and Connection]
const mqttClientId = `projects/${HOST.GCS_PROJECTID}/locations/${HOST.GCS_REGION}/registries/${HOST.IOT_REGISTRY}/devices/${DEVICE.ID}`;


let connectionArgs = {
  host: HOST.MQTT_HOST_NAME,
  port: HOST.MQTT_PORT,
  clientId: mqttClientId,
  username: DEVICE.ID,
  password: createJWT(HOST.GCS_PROJECTID, DEVICE.PRIVATE_KEY_PATH, DEVICE.ALGORITHM),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method',
};

// Create a client, and connect to the Google MQTT bridge.
let iatTime = Date.now() / 1000;
let client = connect(connectionArgs);
// Subscribe to the /devices/{device-id}/config topic to receive config updates.
client.subscribe(`/devices/${DEVICE.ID}/${SUBS.CONFIG}`);

//TODO: actually do something with a configuration update
//IDEA: take in the config message, parse, write to config file, then respond with state message showing current config

// The MQTT topic that this device will publish data to. The MQTT
// topic name is required to be in the format below. The topic name must end in
// 'state' to publish state and 'events' to publish telemetry. Note that this is
// not the same as the device registry's Cloud Pub/Sub topic.
const mqttTopic = `/devices/${DEVICE.ID}/${messageType}`;
//TODO: Split message functionality across topics; i.e. events, states, logs
//TODO: respond with a state message when necessary
//TODO: publish log messages as necessary

client.on('connect', (success: boolean) => {
    if (!success) {
        console.log('Client not connected...');
        //TOD0: Persist the logging
    } else {
        console.log('Client connected...');
        messageGen();
        publish();
    }
});

function publish() {
    console.log("Subscribed to Messages...");
    message$.subscribe(m => {
        let payload = m;
        console.log('Publishing message:', payload);
        client.publish(mqttTopic, JSON.stringify(payload), { qos: 1 }, (err, packet)=> console.log('published=>', packet))
    })
}
  
client.on('close', () => {
    console.log('close');
    //TODO: Persist Logging
});
  
client.on('error', (err) => {
    console.log('error', err);
});
  
client.on('message', (topic: string, message: string, packet) => {
  if (topic === `/devices/${DEVICE.ID}/state`) {
    console.log('Event message received: ', Buffer.from(message, 'base64').toString('ascii'))
  } else
  if (topic === `/devices/${DEVICE.ID}/config`) {
    console.log('Configuration message received: ', Buffer.from(message, 'base64').toString('ascii'))
  }
});

client.on('packetsend', (packet) => {
    
});
// [END Client Configuration and Connection]


// Create a Cloud IoT JWT based on the project, signed with the private key
// [START mqtt_jwt generation]
//TODO: Handle key refreshing
function createJWT (projectId: String, privateKeyPath: String, algorithm: String) {
    const token = {
        'iat': (Date.now() / 1000),
        'exp': (Date.now() / 1000) + 24 * 60 * 60,  // One Day
        'aud': projectId
    };
    const privateKey = readFileSync(DEVICE.PRIVATE_KEY_PATH);
    return sign(token, privateKey, {algorithm: DEVICE.ALGORITHM});
}
// [END mqtt_jwt generation




