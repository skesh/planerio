import { DATE_FORMAT } from "@/app/config";
import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    format,
    parse,
} from "date-fns";
import { nanoid } from "nanoid";

export const REPEAT_PERIODS = ["day", "week", "month", "year"] as const;
export type repeatPeriod = (typeof REPEAT_PERIODS)[number];

export class Todo {
  id: string;
  title: string;
  description: string;
  tags: string[];
  priority: boolean;
  date: string;
  time: string;
  endDate: string;
  projectId: string;
  repeat: repeatPeriod | undefined;
  dependsOn: string[];
  created: string;
  doneDate: string;
  done: boolean = false;

  constructor(todo?: Partial<Todo>) {
    this.id = todo?.id || nanoid();
    this.title = todo?.title || "";
    this.description = todo?.description || "";
    this.tags = todo?.tags || [];
    this.priority = todo?.priority || false;
    this.date = todo?.date || "";
    this.time = todo?.time || "";
    this.endDate = todo?.endDate || "";
    this.projectId = todo?.projectId || "";
    this.repeat = todo?.repeat;
    this.dependsOn = todo?.dependsOn || [];
    this.created = todo?.created || new Date().toISOString();
    this.doneDate = todo?.doneDate || "";
    this.done = todo?.done || false;
  }

  repeatNext(): Todo {
    const parsed = parse(this.date, "dd.MM.yyyy", new Date());
    const nextDate = () => {
      switch (this.repeat) {
        case "day":
          return addDays(parsed, 1);
        case "week":
          return addWeeks(parsed, 1);
        case "month":
          return addMonths(parsed, 1);
        case "year":
          return addYears(parsed, 1);
      }
    };
    return new Todo({
      ...this,
      id: nanoid(),
      date: format(nextDate()!, DATE_FORMAT),
    });
  }
}
