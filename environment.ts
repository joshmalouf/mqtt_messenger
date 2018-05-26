export const HostConfig = {
    GCS_PROJECTID: "fleet-iot",
    GCS_REGION: "us-central1",
    IOT_REGISTRY: "compressor-units",
    MQTT_HOST_NAME: "mqtt.googleapis.com",
    MQTT_PORT: 8883
}

export const DeviceConfig = {
    ID: "Laptop",
    PRIVATE_KEY_PATH: "../credentials/laptop_private.pem",
    ALGORITHM: "RS256",
    TOKEN_LIFE: 1, // hour(s)
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