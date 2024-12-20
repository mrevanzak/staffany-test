import type * as Joi from "joi";
import "joi-extract-type";
import type { publishShiftDto } from "../dtos";

export interface ICreateShift {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface IUpdateShift {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  weekId?: string;
}

export type ITime = Omit<ICreateShift, "name">;

export interface IPublishShift {
  week: number;
}
