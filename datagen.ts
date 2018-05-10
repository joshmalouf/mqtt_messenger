import { Observable, merge, Observer} from 'rxjs';

import { 
    Data,
    State,
    Log } from './dataset';

export function datagen() {

    let eventMessage$: Observable<Data>;
    let stateMessage$: Observable<State>;
    let logMessage$: Observable<Log>;
    let message$: Observable<any>;

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

    return merge(eventMessage$, stateMessage$, logMessage$);
}