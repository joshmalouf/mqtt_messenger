import { Observable, merge, Observer, BehaviorSubject } from 'rxjs';
import { Topics } from './environment'

// Get the Data and Message type definitions
import { 
    Data, DataMessage,
    State, StateMessage,
    LogEntry, LogMessage
} from './dataset';

// const logMessage$$ = new BehaviorSubject<LogMessage>(
//     {
//     payload:
//         {
//         timestamp: Date.now(),
//         message:"Logger Re/Started"
//         },
//     topic:"Topic"
//     }
// )

// function newLogMessage(message: string) {
//     let currentData: LogEntry = {
//         timestamp: Date.now(),
//         message: message
//     }

//     let currentMessage: LogMessage = {
//         topic: Topics.LOG,
//         payload: currentData
//     }
//     logMessage$$.next(currentMessage)
// }

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
        },1000 * 30)
    })

   /*  logMessage$ = Observable.create ((obs: Observer<LogMessage>) => {
        setInterval(() => {
            let currentData: LogEntry = {
                timestamp: Date.now(),
                message: `Something worth logging happened ${Date.now().toLocaleString}`
            }

            let currentMessage: LogMessage = {
                topic: Topics.LOG,
                payload: currentData
            }
            obs.next(currentMessage);
        },1000 * 10)
    }) */

    return merge(eventMessage$, stateMessage$);
}