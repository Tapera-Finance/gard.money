import React from 'react';
import { useCountdown } from './useCountdown';
import DateTimeDisplay from './DateTimeDisplay';
import styles from "../styles/CountdownTimer.css"

const ExpiredNotice = () => {
    return (
      <div className="expired-notice">
        <div className="count-down-title">Enrollment Count Down </div>
        <span>Expired :(</span>
      </div>
    );
  };
const ShowCounter = ({ days, hours, minutes, seconds }) => {
    return (
        <div className="show-counter">
        <div className="count-down-elements">
            <div className="count-down-title">Enrollment Count Down </div>
            <DateTimeDisplay value={days} type={'Days'} isDanger={days <= 3} />
            <DateTimeDisplay value={hours} type={'Hours'} isDanger={false} />
            <DateTimeDisplay value={minutes} type={'Mins'} isDanger={false} />
            <DateTimeDisplay value={seconds} type={'Seconds'} isDanger={false} />
        </div>
        </div>
    );
};
    

const CountdownTimer = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />;
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    );
  }
};

export default CountdownTimer;
