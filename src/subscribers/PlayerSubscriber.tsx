import { BehaviorSubject, Subject } from "rxjs";

// const subscriber = new BehaviorSubject(-1);

// const TimeLineService = {
//   send: (curr: number) => subscriber.next(curr),
// };

const currTimeSubscriber = new BehaviorSubject(0);
const changeSegmentPositionSubscriber = new BehaviorSubject<any>(null);
const changeSegmentTextSubscriber = new Subject<any>();
const changeSpeakerSubscriber = new Subject<any>();

// const CurrTimeService = {
//   send: (curr: number) => currTimeSubscriber.next(curr),
// };

export { currTimeSubscriber, changeSegmentPositionSubscriber, changeSegmentTextSubscriber, changeSpeakerSubscriber };
