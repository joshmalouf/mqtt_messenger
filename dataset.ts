import { Timestamp, Observable } from "rxjs";

export interface Data {
 sampleTime: number;
 datapoint1: number;
 datapoint2: number;
 datapoint3: number;
}

export interface DataMessage {
    payload: Data,
    topic: string
}

export interface State {
    setpoint1: number;
    setpoint2: number;
}

export interface StateMessage {
    payload: State,
    topic: string
}

export interface LogEntry {
    timestamp: number;
    message: string;
}

export interface LogMessage {
    payload: LogEntry,
    topic: string
}
