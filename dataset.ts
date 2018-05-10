export interface Data {
 sampleTime: number;
 datapoint1: number;
 datapoint2: number;
 datapoint3: number;
}

export interface State {
    setpoint1: number;
    setpoint2: number;
}

export interface Log {
    timestamp: number;
    message: string;
}