export const HostConfig = {
    GCS_PROJECTID: "myiotproject-202021",
    GCS_REGION: "us-central1",
    IOT_REGISTRY: "mypi-fromhome",
    MQTT_HOST_NAME: "mqtt.googleapis.com",
    MQTT_PORT: 8883
}

export const DeviceConfig = {
    ID: "mountainberry",
    PRIVATE_KEY_PATH: "./credentials/rsa_private.pem",
    ALGORITHM: "RS256",
    TOKEN_LIFE: 24, // hour(s)
    STORE_PATH: './datastore'
}

const Base_Path = `/devices/${DeviceConfig.ID}`;

export const Topics = {
    DEFUALT : `${Base_Path}/events`,
    DATA: `${Base_Path}/events/data`,
    STATE: `${Base_Path}/events/state`,
    LOG: `${Base_Path}/events/log`
}

export const Subscriptions = {
    CONFIG: `${Base_Path}/config`
}