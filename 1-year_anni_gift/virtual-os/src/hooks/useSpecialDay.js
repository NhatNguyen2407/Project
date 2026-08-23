import { useState, useEffect } from 'react';
import { SPECIAL_DATES } from '../constants/specialDates';

export const useSpecialDay = () => {
  const [specialDay, setSpecialDay] = useState(null);

  useEffect(() => {
    const now = new Date();
    const todayMonth = now.getMonth() + 1;
    const todayDate = now.getDate();

    const match = SPECIAL_DATES.find((d) => d.month === todayMonth && d.day === todayDate);
    setSpecialDay(match || null);
  }, []);

  return specialDay;
};