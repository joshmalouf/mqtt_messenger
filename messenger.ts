// Import the necessary 3rd party modules
import { readFileSync } from 'fs';
import { sign }  from 'jsonwebtoken'
import { connect } from 'mqtt';

// Set the Environment
import { environment as ENV } from './environment';
import { setInterval } from 'timers';

const subscriptionName = 'mountainberry-sub';

let messageType: String = 'events';
let messagesSent = 0;

// [Start Initialization]
let isPublishing = false;

// [START Client Configuration and Connection]
const mqttClientId = `projects/${ENV.GCS_PROJECTID}/locations/${ENV.GCS_REGION}/registries/${ENV.IOT_REGISTRY}/devices/${ENV.DEVICE_ID}`;

let connectionArgs = {
  host: ENV.MQTT_HOST_NAME,
  port: ENV.MQTT_PORT,
  clientId: mqttClientId,
  username: 'unused',
  password: createJWT(ENV.GCS_PROJECTID, ENV.PRIVATE_KEY_PATH, ENV.ALGORITHM),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method',
  
};

// Create a client, and connect to the Google MQTT bridge.
let iatTime = Date.now() / 1000;
let client = connect(connectionArgs);

// Subscribe to the /devices/{device-id}/config topic to receive config updates.
client.subscribe(`/devices/${ENV.DEVICE_ID}/config`);


// The MQTT topic that this device will publish data to. The MQTT
// topic name is required to be in the format below. The topic name must end in
// 'state' to publish state and 'events' to publish telemetry. Note that this is
// not the same as the device registry's Cloud Pub/Sub topic.
const mqttTopic = `/devices/${ENV.DEVICE_ID}/${messageType}`;


client.on('connect', (success: boolean) => {
    console.log('Client connected...');
    if (!success) {
      console.log('Client not connected...');
    } else if (!isPublishing) {
      publishAsync();
    }
});
  
client.on('close', () => {
    console.log('close');
});
  
client.on('error', (err) => {
    console.log('error', err);
});
  
client.on('message', (topic: string, message: string, packet) => {
  if (topic === `/devices/${ENV.DEVICE_ID}/events`) {
    console.log('Event message received: ', Buffer.from(message, 'base64').toString('ascii'))
  } else
  if (topic === `/devices/${ENV.DEVICE_ID}/config`) {
    console.log('Configuration message received: ', Buffer.from(message, 'base64').toString('ascii')) 
  }
});


client.on('packetsend', () => {
// Note: logging packet send is very verbose
});
// [END Client Configuration and Connection]


// Create a Cloud IoT JWT based on the project, signed with the private key
// [START mqtt_jwt generation]
function createJWT (projectId: String, privateKeyPath: String, algorithm: String) {
    const token = {
        'iat': (Date.now() / 1000),
        'exp': (Date.now() / 1000) + 24 * 60 * 60,  // One Day
        'aud': projectId
    };
    const privateKey = readFileSync(ENV.PRIVATE_KEY_PATH);
    return sign(token, privateKey, {algorithm: ENV.ALGORITHM});
}
// [END mqtt_jwt generation]


function generatePayload() {
    const payload = `${ENV.IOT_REGISTRY}/${ENV.DEVICE_ID}-payload-${messagesSent}`; 
    messagesSent += 1;
    return payload
}


// [START iot_mqtt_publish]
function publishAsync () {
     
    // Publish and schedule the next publish.
    isPublishing = true;
    let publishDelayMs = 5000;
      
    setInterval(() => {
      
        let payload = generatePayload();
  
        // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
        // Cloud IoT Core also supports qos=0 for at most once delivery.
        console.log('Publishing message:', payload);
        client.publish(mqttTopic, payload, { qos: 1 });
    }, publishDelayMs);
}
// [END iot_mqtt_publish]






