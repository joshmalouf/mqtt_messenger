"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import the necessary 3rd party modules
var fs_1 = require("fs");
var jsonwebtoken_1 = require("jsonwebtoken");
var mqtt_1 = require("mqtt");
// Set the Environment
var environment_1 = require("./environment");
var timers_1 = require("timers");
var subscriptionName = 'mountainberry-sub';
var messageType = 'events';
var messagesSent = 0;
// [Start Initialization]
var isPublishing = false;
// [START Client Configuration and Connection]
var mqttClientId = "projects/" + environment_1.environment.GCS_PROJECTID + "/locations/" + environment_1.environment.GCS_REGION + "/registries/" + environment_1.environment.IOT_REGISTRY + "/devices/" + environment_1.environment.DEVICE_ID;
var connectionArgs = {
    host: environment_1.environment.MQTT_HOST_NAME,
    port: environment_1.environment.MQTT_PORT,
    clientId: mqttClientId,
    username: 'unused',
    password: createJWT(environment_1.environment.GCS_PROJECTID, environment_1.environment.PRIVATE_KEY_PATH, environment_1.environment.ALGORITHM),
    protocol: 'mqtts',
    secureProtocol: 'TLSv1_2_method',
};
// Create a client, and connect to the Google MQTT bridge.
var iatTime = Date.now() / 1000;
var client = mqtt_1.connect(connectionArgs);
// Subscribe to the /devices/{device-id}/config topic to receive config updates.
client.subscribe("/devices/" + environment_1.environment.DEVICE_ID + "/config");
// The MQTT topic that this device will publish data to. The MQTT
// topic name is required to be in the format below. The topic name must end in
// 'state' to publish state and 'events' to publish telemetry. Note that this is
// not the same as the device registry's Cloud Pub/Sub topic.
var mqttTopic = "/devices/" + environment_1.environment.DEVICE_ID + "/" + messageType;
client.on('connect', function (success) {
    console.log('Client connected...');
    if (!success) {
        console.log('Client not connected...');
    }
    else if (!isPublishing) {
        publishAsync();
    }
});
client.on('close', function () {
    console.log('close');
});
client.on('error', function (err) {
    console.log('error', err);
});
client.on('message', function (topic, message, packet) {
    if (topic === "/devices/" + environment_1.environment.DEVICE_ID + "/events") {
        console.log('Event message received: ', Buffer.from(message, 'base64').toString('ascii'));
    }
    else if (topic === "/devices/" + environment_1.environment.DEVICE_ID + "/config") {
        console.log('Configuration message received: ', Buffer.from(message, 'base64').toString('ascii'));
    }
});
client.on('packetsend', function () {
    // Note: logging packet send is very verbose
});
// [END Client Configuration and Connection]
// Create a Cloud IoT JWT based on the project, signed with the private key
// [START mqtt_jwt generation]
function createJWT(projectId, privateKeyPath, algorithm) {
    var token = {
        'iat': (Date.now() / 1000),
        'exp': (Date.now() / 1000) + 24 * 60 * 60,
        'aud': projectId
    };
    var privateKey = fs_1.readFileSync(environment_1.environment.PRIVATE_KEY_PATH);
    return jsonwebtoken_1.sign(token, privateKey, { algorithm: environment_1.environment.ALGORITHM });
}
// [END mqtt_jwt generation]
function generatePayload() {
    var payload = environment_1.environment.IOT_REGISTRY + "/" + environment_1.environment.DEVICE_ID + "-payload-" + messagesSent;
    messagesSent += 1;
    return payload;
}
// [START iot_mqtt_publish]
function publishAsync() {
    // Publish and schedule the next publish.
    isPublishing = true;
    var publishDelayMs = 5000;
    timers_1.setInterval(function () {
        var payload = generatePayload();
        // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
        // Cloud IoT Core also supports qos=0 for at most once delivery.
        console.log('Publishing message:', payload);
        client.publish(mqttTopic, payload, { qos: 1 });
    }, publishDelayMs);
}
// [END iot_mqtt_publish]
