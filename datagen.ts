import { Observable, merge, Observer} from 'rxjs';
import { Topics } from './environment'

// Get the Data and Message type definitions
import { 
    Data, DataMessage,
    State, StateMessage,
    Log, LogMessage
} from './dataset';

export function DataSource() {

    let eventMessage$: Observable<DataMessage>;
    let stateMessage$: Observable<StateMessage>;
    let logMessage$: Observable<LogMessage>;
    let message$: Observable<any>;

    console.log("Message Gen Started...")

    eventMessage$ = Observable.create ((obs: Observer<DataMessage>) => {
        setInterval(() => {
            let currentData: Data = {
                sampleTime: Date.now(),
                datapoint1: Math.random() *100,
                datapoint2: Math.random() *200,
                datapoint3: Math.random() *300
            }

            let currentMessage: DataMessage = {
                topic: Topics.DATA,
                payload: currentData
            }
            obs.next(currentMessage);
        },1000 * 5)
    })

    stateMessage$ = Observable.create ((obs: Observer<StateMessage>) => {
        setInterval(() => {
            let currentData: State = {
                setpoint1: 150* Math.random() ,
                setpoint2: 450* Math.random()
            }

            let currentMessage: StateMessage = {
                topic: Topics.STATE,
                payload: currentData
            }
            obs.next(currentMessage);
        },1000*30)
    })

    logMessage$ = Observable.create ((obs: Observer<LogMessage>) => {
        setInterval(() => {
            let currentData: Log = {
                timestamp: Date.now(),
                message: `Something worth logging happened ${Date.now()}`
            }

            let currentMessage: LogMessage = {
                topic: Topics.LOG,
                payload: currentData
            }
            obs.next(currentMessage);
        },1000 * 10)
    })

    return merge(eventMessage$, stateMessage$, logMessage$);
}