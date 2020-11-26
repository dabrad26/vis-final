export default class Dataset {
  /** The date of accident.  In MM/DD/YYYY */
  date: string;
  /** The time of accident.  In HH:MM (24 hour) */
  time: string;
  /** Injury level  */
  injury: 'NONE'|'INJURED'|'KILLED';
  /** The sex of the victim */
  sex: 'M'|'F'|'X';
  /** The age of the victim */
  age: number;

  constructor(data: Dataset) {
    this.date = data.date;
    this.time = data.time;
    this.injury = data.injury;
    this.sex = data.sex || 'X';
    this.age = Number(data.age || 0);
    // Some age data is super large (6000+.  102 is only real sounding age. Maxing out at that (maybe bad data))
    if (this.age > 102 || this.age < 0) this.age = 0;
  }

  /** JavaScript Date object including date and time of accident */
  get dateObject(): Date {
    return new Date(`${this.date} ${this.time}`);
  }

  /** ISO string including date and time of accident */
  get dateString(): string {
    return this.dateObject.toISOString();
  }
}
