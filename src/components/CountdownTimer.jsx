import React from "react";
import { useCountdown } from "./useCountdown";
import DateTimeDisplay from "./DateTimeDisplay";
import styles from "../styles/CountdownTimer.css";

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
        <DateTimeDisplay value={days} type={"Days"} isDanger={days <= 3} />
        <DateTimeDisplay value={hours} type={"Hours"} isDanger={false} />
        <DateTimeDisplay value={minutes} type={"Min"} isDanger={false} />
        <DateTimeDisplay value={seconds} type={"Sec"} isDanger={false} />
      </div>
    </div>
  );
};

const CountdownTimer = ({ targetDate, showZero }) => {
  
  if(!targetDate) {
    return <div>
        <ShowCounter
          days={0}
          hours={0}
          minutes={0}
          seconds={0}
        />
    </div>;}

  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  if (days + hours + minutes + seconds <= 0 ) {
    return <div>
          <ShowCounter
          days={0}
          hours={0}
          minutes={0}
          seconds={0}
          />
      </div>;
  } else {
    return (
      <div>

        {showZero ? (
          <ShowCounter
          days={0}
          hours={0}
          minutes={0}
          seconds={0}
          />
        ) :
        <ShowCounter
          days={days}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
        />
      }
      </div>
    );
  }
};

export default CountdownTimer;
