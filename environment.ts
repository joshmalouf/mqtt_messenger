export const HostConfig = {
    GCS_PROJECTID: "myiotproject-202021",
    GCS_REGION: "us-central1",
    IOT_REGISTRY: "mypi-fromhome",
    MQTT_HOST_NAME: "mqtt.googleapis.com",
    MQTT_PORT: 8883,
    TOKEN_LIFE: 24
}

export const DeviceConfig = {
    ID: "mountainberry",
    PRIVATE_KEY_PATH: "./credentials/rsa_private.pem",
    ALGORITHM: "RS256",

}

export const Topics = {
    EVENTS: 'mountainberry-sub',
    STATE: '',
    LOG:''
}

export const Subscriptions = {
    CONFIG: 'config'
}
